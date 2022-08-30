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

type Reservation struct {
	Id                  string    `json:"id"`
	ReservingUserId     uuid.UUID `json:"reservingUserId"`
	ReservedWorkplaceId uuid.UUID `json:"reservedWorkplaceId"`
	Start               time.Time `json:"start"`
	End                 time.Time `json:"end"`
}

type reserveWorkplaceRequest struct {
	WorkplaceId      uuid.UUID `json:"workplaceId" binding:"required"`
	UserId           uuid.UUID `json:"userId" binding:"required"`
	StartReservation time.Time `json:"startReservation" binding:"required"`
	EndReservation   time.Time `json:"endReservation" binding:"required"`
}

// ReserveWorkplace
// @Summary      Reserving a workplace for the requested timespan
// @Tags         reservation
// @Router       /workplace/reserve [post]
func (server *Server) createReservation(context *gin.Context) {
	var request reserveWorkplaceRequest

	if err := context.ShouldBindJSON(&request); err != nil {
		context.JSON(http.StatusBadRequest, errorResponse(ErrRequestCouldNotBeParsed, err))
		return
	}

	authPayload := context.MustGet(authorizationPayloadKey).(*token.Payload)
	reservationMadeForOtherUser := request.UserId != authPayload.UserId
	if reservationMadeForOtherUser {
		err := errors.New("not authenticated as user for whom the reservation shall be done, authorized as user with id: " + authPayload.Id.String())
		context.JSON(http.StatusUnauthorized, errorResponse("Not authenticated as user for whom the workplace shall be reserved.", err))
		return
	}

	workplaceReservationsSqlParams := db.RetrieveWorkplaceReservationsInTimespanParams{
		ReservedWorkplaceID: request.WorkplaceId,
		StartDate:           request.StartReservation,
		StartDate_2:         request.EndReservation,
	}
	reservationConflicts, err := server.queries.RetrieveWorkplaceReservationsInTimespan(context, workplaceReservationsSqlParams)
	if err != nil {
		context.JSON(http.StatusInternalServerError, errorResponse(UnexpectedErrContactMessage, err))
		return
	}
	reservationConflictsExist := len(reservationConflicts) > 0
	if reservationConflictsExist {
		err := errors.New("the workplace is at least partially reserved within the requested timespan")
		context.JSON(http.StatusInternalServerError, errorResponse("The workplace is already reserved within the requested timespan!", err))
		return
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
		return
	}

	context.JSON(http.StatusOK, reservation)
}

// GetReservations
// @Summary      Returns all reservations of the specified timespan
// @Tags         reservation
// @Router       /workplace/reservations [get]
func (server *Server) getReservations(context *gin.Context) {
	startTime, err := time.Parse(time.RFC3339, context.Request.URL.Query().Get("start"))
	if err != nil {
		context.JSON(http.StatusInternalServerError, errorResponse("'start' not in RFC3339 format!", err))
		return
	}
	endTime, err := time.Parse(time.RFC3339, context.Request.URL.Query().Get("end"))
	if err != nil {
		context.JSON(http.StatusInternalServerError, errorResponse("'end' not in RFC3339 format!", err))
		return
	}

	retrieveReservationsSqlParams := db.RetrieveReservationsInTimespanParams{
		StartDate:   startTime,
		StartDate_2: endTime,
	}
	existingReservations, err := server.queries.RetrieveReservationsInTimespan(context, retrieveReservationsSqlParams)
	if err != nil {
		context.JSON(http.StatusInternalServerError, errorResponse(UnexpectedErrContactMessage, err))
		return
	}

	context.JSON(http.StatusOK, existingReservations)
}

// DeleteReservation
// @Summary      Deletes a reservation
// @Tags         reservation
// @Router       /workplace/reservation [delete]
func (server *Server) deleteReservation(context *gin.Context) {
	reservationIdString := path.Base(context.Request.URL.String())
	parsedUuid, err := uuidConversion.FromString(reservationIdString)
	if err != nil {
		context.JSON(http.StatusBadRequest, errorResponse("Invalid reservation uuid", err))
		return
	}
	reservationUUID := uuid.UUID(parsedUuid)

	reservationToBeDeleted, err := server.queries.GetReservationById(context, reservationUUID)
	authPayload := context.MustGet(authorizationPayloadKey).(*token.Payload)
	reservationOfOtherUser := reservationToBeDeleted.ReservingUserID != authPayload.UserId
	if reservationOfOtherUser {
		err := errors.New("you can only cancel your own reservations")
		context.JSON(http.StatusForbidden, errorResponse(err.Error(), err))
		return
	}

	result, err := server.queries.DeleteReservation(context, reservationUUID)
	if err != nil {
		context.JSON(http.StatusInternalServerError, errorResponse("Reservation could not be deleted", err))
		return
	}

	context.JSON(http.StatusOK, result)
}
