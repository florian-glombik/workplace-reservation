package api

import (
	"errors"
	db "github.com/florian-glombik/workplace-reservation/db/sqlc"
	"github.com/florian-glombik/workplace-reservation/src/token"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	uuidConversion "github.com/satori/go.uuid"
	"net/http"
	"path"
	"time"
)

type ReoccurringReservation struct {
	Id                    string    `json:"id"`
	IntervalInDays        int       `json:"intervalInDays"`
	RepeatedReservationId uuid.UUID `json:"repeatedReservationId"`
	RepeatUntil           time.Time `json:"repeatUntil"`
}

type ReoccurringReservationRequest struct {
	WorkplaceId         uuid.UUID `json:"workplaceId"`
	IntervalInDays      int       `json:"intervalInDays"`
	ReservationStartDay time.Time `json:"reservationStartDay"`
	RepeatUntil         time.Time `json:"repeatUntil"`
	UserId              uuid.UUID `json:"userId"`
}

// DeleteReoccurringReservation
// @Summary      Deletes reoccurring reservation
// @Tags         reservation
// @Router       /reservations/reoccurring [delete]
func (server *Server) deleteReoccurringReservation(context *gin.Context) {
	reservationIdString := path.Base(context.Request.URL.Path)
	parsedUuid, err := uuidConversion.FromString(reservationIdString)
	if err != nil {
		context.JSON(http.StatusBadRequest, errorResponse("Invalid reoccurring reservation uuid", err))
		return
	}
	reservationId := uuid.UUID(parsedUuid)

	reoccurringReservationToDelete, err := server.queries.GetReoccurringReservationById(context, reservationId)
	baseReservation, err := server.queries.GetReservationById(context, reoccurringReservationToDelete.RepeatedReservationID)

	authPayload := context.MustGet(authorizationPayloadKey).(*token.Payload)
	if baseReservation.ReservingUserID != authPayload.UserId {
		context.JSON(http.StatusForbidden, errorResponse("You can only delete your own reoccurring reservations!", err))
		return
	}

	now := time.Now()
	noReservationsInThePast := baseReservation.StartDate.After(now) // TODO check if reoccurring reservation has only exceptions
	if noReservationsInThePast {
		_, err := server.queries.DeleteExceptionsById(context, reoccurringReservationToDelete.ID)
		sqlResult, err := server.queries.DeleteReoccurringReservationById(context, reoccurringReservationToDelete.ID)
		_, err = server.queries.DeleteReservation(context, baseReservation.ID)
		if err != nil {
			context.JSON(http.StatusInternalServerError, errorResponse(UnexpectedErrContactMessage, err))
			return
		}
		context.JSON(http.StatusOK, sqlResult)
		return
	}

	yesterday := now.AddDate(0, 0, -1)
	updateReoccurringReservationSqlParams := db.UpdateReoccurringReservationParams{
		ID:          reoccurringReservationToDelete.ID,
		RepeatUntil: yesterday,
	}
	sqlResult, err := server.queries.UpdateReoccurringReservation(context, updateReoccurringReservationSqlParams)
	if err != nil {
		context.JSON(http.StatusInternalServerError, errorResponse(UnexpectedErrContactMessage, err))
		return
	}

	context.JSON(http.StatusOK, sqlResult)
}

// GetRecurringReservations
// @Summary      Returns recurring reservations of authenticated user
// @Tags         reservation
// @Router       /reservations/recurring [get]
func (server *Server) getActiveRecurringReservations(context *gin.Context) {
	authPayload := context.MustGet(authorizationPayloadKey).(*token.Payload)

	recurringReservations, err := server.queries.ActiveReoccurringReservationsOfUser(context, authPayload.UserId)
	if err != nil {
		context.JSON(http.StatusInternalServerError, errorResponse(UnexpectedErrContactMessage, err))
		return
	}

	context.JSON(http.StatusOK, recurringReservations)
}

// GetReoccurringReservationsOfAllUsers
// @Summary      Returns reoccurring reservations of all users
// @Tags         reservation
// @Router       /reservations/recurring/all-users [get]
func (server *Server) getActiveRecurringReservationsOfAllUsers(context *gin.Context) {
	if !isAdmin(context) {
		err := errors.New("You are not allowed to view the recurring reservations of all users!")
		context.JSON(http.StatusForbidden, errorResponse(err.Error(), err))
		return
	}

	recurringReservations, err := server.queries.ActiveRecurringReservationsOfAllUsers(context)
	if err != nil {
		context.JSON(http.StatusInternalServerError, errorResponse(UnexpectedErrContactMessage, err))
		return
	}

	context.JSON(http.StatusOK, recurringReservations)
}

// AddRecurringReservation
// @Summary      Adds a recurring reservation
// @Tags         reservation
// @Router       /reservations/recurring [post]
func (server *Server) addRecurringReservation(context *gin.Context) {
	var request ReoccurringReservationRequest
	if err := context.ShouldBindJSON(&request); err != nil {
		context.JSON(http.StatusBadRequest, errorResponse(ErrRequestCouldNotBeParsed, err))
		return
	}
	authPayload := context.MustGet(authorizationPayloadKey).(*token.Payload)
	if authPayload.UserId != request.UserId && !isAdmin(context) {
		err := errors.New("You are not allowed to make recurring reservations for other users!")
		context.JSON(http.StatusForbidden, errorResponse(err.Error(), err))
		return
	}

	startDayWithHoursSetToBeginOfDay := setTimeOfDay(request.ReservationStartDay, 0, 0, 0)
	reservationEndDate := setTimeOfDay(startDayWithHoursSetToBeginOfDay, 23, 59, 59)
	reservationToBeRepeatedParams := ReserveWorkplaceRequest{
		WorkplaceId:      request.WorkplaceId,
		UserId:           request.UserId,
		StartReservation: startDayWithHoursSetToBeginOfDay,
		EndReservation:   reservationEndDate,
	}
	reservationToBeRepeated, err := createReservation(server, context, reservationToBeRepeatedParams)
	if err != nil {
		return
	}

	// TODO check conflicts with other reoccurring reservations
	reoccurringEndDate := setTimeOfDay(request.RepeatUntil, 23, 59, 59)
	reoccurringReservationSqlParams := db.CreateReoccurringReservationParams{
		ID:                    uuid.New(),
		IntervalInDays:        int32(request.IntervalInDays),
		RepeatedReservationID: reservationToBeRepeated.ID,
		RepeatUntil:           reoccurringEndDate,
	}
	reoccurringReservation, err := server.queries.CreateReoccurringReservation(context, reoccurringReservationSqlParams)
	if err != nil {
		context.JSON(http.StatusInternalServerError, errorResponse(UnexpectedErrContactMessage, err))
		_, _ = deleteReservation(server, context, reservationToBeRepeated.ID)
		return
	}

	context.JSON(http.StatusOK, reoccurringReservation)
}

func setTimeOfDay(date time.Time, hours int, minutes int, seconds int) time.Time {
	return time.Date(date.Year(), date.Month(), date.Day(), hours, minutes, seconds, 0, date.Location())
}
