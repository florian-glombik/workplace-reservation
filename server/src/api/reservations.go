package api

import (
	"database/sql"
	"errors"
	db "github.com/florian-glombik/workplace-reservation/db/sqlc"
	"github.com/florian-glombik/workplace-reservation/src/token"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/lib/pq"
	uuidConversion "github.com/satori/go.uuid"
	"net/http"
	"path"
	"time"
)

type Reservation struct {
	Id                  string    `json:"id"`
	ReservingUserId     uuid.UUID `json:"reservingUserId"`
	ReservedWorkplaceId uuid.UUID `json:"reservedWorkplaceId"`
	Start               time.Time `json:"start"`
	End                 time.Time `json:"end"`
}

type ReserveWorkplaceRequest struct {
	WorkplaceId      uuid.UUID `json:"workplaceId" binding:"required"`
	UserId           uuid.UUID `json:"userId" binding:"required"`
	StartReservation time.Time `json:"startReservation" binding:"required"`
	EndReservation   time.Time `json:"endReservation" binding:"required"`
}

// ReserveWorkplace
// @Summary      Reserving a workplace for the requested timespan
// @Tags         reservation
// @Router       /workplace/reserve [post]
func (server *Server) handleCreateReservation(context *gin.Context) {
	var request ReserveWorkplaceRequest

	if err := context.ShouldBindJSON(&request); err != nil {
		context.JSON(http.StatusBadRequest, errorResponse(ErrRequestCouldNotBeParsed, err))
		return
	}

	_, _ = createReservation(server, context, request)
}

func createReservation(server *Server, context *gin.Context, request ReserveWorkplaceRequest) (*db.Reservation, error) {
	now := time.Now()
	if now.After(request.EndReservation) {
		err := errors.New("you can not make workplace reservations in the past")
		context.JSON(http.StatusForbidden, errorResponse(err.Error(), err))
		return nil, err
	}

	authPayload := context.MustGet(authorizationPayloadKey).(*token.Payload)
	reservationMadeForOtherUser := request.UserId != authPayload.UserId
	if reservationMadeForOtherUser {
		err := errors.New("not authenticated as user for whom the reservation shall be done, authorized as user with id: " + authPayload.Id.String())
		context.JSON(http.StatusUnauthorized, errorResponse("Not authenticated as user for whom the workplace shall be reserved.", err))
		return nil, err
	}

	workplace, err := server.queries.GetWorkplaceById(context, request.WorkplaceId)
	if err != nil {
		context.JSON(http.StatusNotFound, errorResponse("Workplace that shall be reserved was not found!", err))
		return nil, err
	}
	reservationConflicts, err := getWorkplaceReservations(server, context, workplace, request.StartReservation, request.EndReservation)

	reservationConflictsExist := len(reservationConflicts) > 0
	if reservationConflictsExist {
		err := errors.New("the workplace is at least partially reserved within the requested timespan")
		context.JSON(http.StatusInternalServerError, errorResponse("The workplace is already reserved within the requested timespan!", err))
		return nil, err
	}

	reserveWorkplaceSqlParams := db.ReserveWorkplaceParams{
		ID:                  uuid.New(),
		StartDate:           request.StartReservation,
		EndDate:             request.EndReservation,
		ReservingUserID:     request.UserId,
		ReservedWorkplaceID: request.WorkplaceId,
	}
	reservation, err := server.queries.ReserveWorkplace(context, reserveWorkplaceSqlParams)
	if err != nil {
		context.JSON(http.StatusInternalServerError, errorResponse(UnexpectedErrContactMessage, err))
		return nil, err
	}

	context.JSON(http.StatusOK, reservation)
	return &reservation, nil
}

// DeleteReservation
// @Summary      Deletes a reservation
// @Tags         reservation
// @Router       /workplace/reservation [delete]
func (server *Server) handleDeleteReservation(context *gin.Context) {
	reservationIdString := path.Base(context.Request.URL.Path)
	parsedUuid, err := uuidConversion.FromString(reservationIdString)
	if err != nil {
		context.JSON(http.StatusBadRequest, errorResponse("Invalid reservation uuid", err))
		return
	}
	reservationId := uuid.UUID(parsedUuid)

	_, err = deleteReservation(server, context, reservationId)
	if err != nil {
		return
	}
}

const NoElementFound string = "sql: no rows in result set"

func findMatchingReoccurringReservationAndCreateExceptionIfFound(server *Server, context *gin.Context, startDate time.Time, endDate time.Time, reservingUserId uuid.UUID, reservedWorkplaceId uuid.UUID) (*db.ReoccurringReservationsException, error) {
	matchingReoccurringReservationsSqlParams := db.ReoccurringReservationsOfWorkplaceAndUserInTimespanParams{
		ReservingUserID:     reservingUserId,
		ReservedWorkplaceID: reservedWorkplaceId,
		ToDate:              endDate.String(),
	}
	matchingReoccurringReservations, err := server.queries.ReoccurringReservationsOfWorkplaceAndUserInTimespan(context, matchingReoccurringReservationsSqlParams)
	if err != nil {
		context.JSON(http.StatusInternalServerError, errorResponse(UnexpectedErrContactMessage, err))
		return nil, err
	}
	reoccurringReservationFound := len(matchingReoccurringReservations) > 0
	if !reoccurringReservationFound {
		context.JSON(http.StatusNotFound, errorResponse("The reservation that should be deleted was not found.", err))
	}

	var reoccurringReservations []db.ReoccurringReservationsOfWorkplaceInTimespanRow
	for _, matchingReoccurringReservation := range matchingReoccurringReservations {
		reoccurringReservations = append(reoccurringReservations, db.ReoccurringReservationsOfWorkplaceInTimespanRow{
			ID:                    matchingReoccurringReservation.ID,
			StartDate:             matchingReoccurringReservation.StartDate,
			EndDate:               matchingReoccurringReservation.EndDate,
			ReservingUserID:       matchingReoccurringReservation.ReservingUserID,
			ReservedWorkplaceID:   matchingReoccurringReservation.ReservedWorkplaceID,
			ID_2:                  matchingReoccurringReservation.ID_2,
			IntervalInDays:        matchingReoccurringReservation.IntervalInDays,
			RepeatedReservationID: matchingReoccurringReservation.RepeatedReservationID,
			RepeatUntil:           matchingReoccurringReservation.RepeatUntil,
		})
	}

	calculatedReservations, err := calculateSingleReservationsFromReoccurringReservations(server, context, reoccurringReservations, startDate, endDate)
	if err != nil {
		context.JSON(http.StatusInternalServerError, errorResponse(UnexpectedErrContactMessage, err))
		return nil, err
	}
	for _, calculatedReservation := range calculatedReservations {
		if startDate == calculatedReservation.StartDate && endDate == calculatedReservation.EndDate {
			createReoccurringReservationExceptionSqlParams := db.CreateReoccurringReservationExceptionParams{
				ID:                       uuid.New(),
				ReoccurringReservationID: calculatedReservation.ReoccurringReservationID,
				StartExceptionDate:       calculatedReservation.StartDate,
				EndExceptionDate:         calculatedReservation.EndDate,
			}

			// TODO check if exception was already made! (otherwise the exception could be duplicated multiple times)
			// TODO improve query, as subset of exceptions can be duplicated

			createdException, err := server.queries.CreateReoccurringReservationException(context, createReoccurringReservationExceptionSqlParams)
			if err != nil {
				context.JSON(http.StatusInternalServerError, errorResponse(UnexpectedErrContactMessage, err))
				return nil, err
			}

			return &createdException, nil
		}
	}

	err = errors.New("no matching reservation found")
	context.JSON(http.StatusNotFound, errorResponse(err.Error(), err))
	return nil, err
}

func deleteReservation(server *Server, context *gin.Context, reservationId uuid.UUID) (sql.Result, error) {
	reservationToBeDeleted, err := server.queries.GetReservationById(context, reservationId)

	now := time.Now()
	if err != nil {
		if err.Error() == NoElementFound {
			startDate, err := time.Parse(time.RFC3339, context.Request.URL.Query().Get("start"))
			if err != nil {
				context.JSON(http.StatusInternalServerError, errorResponse("'start' not in RFC3339 format!", err))
				return nil, err
			}

			endDate, err := time.Parse(time.RFC3339, context.Request.URL.Query().Get("end"))
			if err != nil {
				context.JSON(http.StatusInternalServerError, errorResponse("'end' not in RFC3339 format!", err))
				return nil, err
			}

			parsedUuid, err := uuidConversion.FromString(context.Request.URL.Query().Get("reservingUserId"))
			if err != nil {
				context.JSON(http.StatusBadRequest, errorResponse("Invalid reservation uuid", err))
				return nil, err
			}
			reservingUserId := uuid.UUID(parsedUuid)

			parsedWorkplaceId, err := uuidConversion.FromString(context.Request.URL.Query().Get("reservedWorkplaceId"))
			if err != nil {
				context.JSON(http.StatusBadRequest, errorResponse("Invalid workplace uuid", err))
				return nil, err
			}
			reservedWorkplaceId := uuid.UUID(parsedWorkplaceId)

			if now.After(endDate) && !isAdmin(context) {
				err := errors.New("you can not cancel reservations that are in the past")
				context.JSON(http.StatusForbidden, errorResponse(err.Error(), err))
				return nil, err
			}

			reservation, err := findMatchingReoccurringReservationAndCreateExceptionIfFound(server, context, startDate, endDate, reservingUserId, reservedWorkplaceId)
			if err != nil {
				return nil, err
			}
			context.JSON(http.StatusOK, reservation)
			return nil, nil
		} else {
			context.JSON(http.StatusInternalServerError, errorResponse(UnexpectedErrContactMessage, err))
			return nil, err
		}
	}

	if now.After(reservationToBeDeleted.EndDate) && !isAdmin(context) {
		err := errors.New("you can not cancel reservations that are in the past")
		context.JSON(http.StatusForbidden, errorResponse(err.Error(), err))
		return nil, err
	}

	authPayload := context.MustGet(authorizationPayloadKey).(*token.Payload)
	reservationOfOtherUser := reservationToBeDeleted.ReservingUserID != authPayload.UserId
	if reservationOfOtherUser && !isAdmin(context) {
		err := errors.New("you can only cancel your own reservations")
		context.JSON(http.StatusForbidden, errorResponse(err.Error(), err))
		return nil, err
	}

	result, err := server.queries.DeleteReservation(context, reservationId)
	if err != nil {
		pqErr := err.(*pq.Error)

		if pqErr.Code == ReservationIsRepeated {

			reoccurringReservation, err := server.queries.GetReoccurringReservationByRepeatedReservationId(context, reservationToBeDeleted.ID)
			if err != nil {
				context.JSON(http.StatusInternalServerError, errorResponse(UnexpectedErrContactMessage, err))
				return nil, err
			}

			createReoccurringReservationExceptionSqlParams := db.CreateReoccurringReservationExceptionParams{
				ID:                       uuid.New(),
				ReoccurringReservationID: reoccurringReservation.ID,
				StartExceptionDate:       reservationToBeDeleted.StartDate,
				EndExceptionDate:         reservationToBeDeleted.EndDate,
			}

			// TODO check if exception was already made!
			// TODO improve query, as subset of exceptions can be duplicated

			_, err = server.queries.CreateReoccurringReservationException(context, createReoccurringReservationExceptionSqlParams)
			if err != nil {
				context.JSON(http.StatusInternalServerError, errorResponse(UnexpectedErrContactMessage, err))
				return nil, err
			}
			return nil, nil
		}

		context.JSON(http.StatusInternalServerError, errorResponse("Reservation could not be deleted", err))
		return nil, err
	}

	context.JSON(http.StatusOK, result)
	return result, nil
}

const ReservationIsRepeated = "23503"
