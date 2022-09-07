package api

import (
	"database/sql"
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
	authPayload := context.MustGet(authorizationPayloadKey).(*token.Payload)
	reservationMadeForOtherUser := request.UserId != authPayload.UserId
	if reservationMadeForOtherUser {
		err := errors.New("not authenticated as user for whom the reservation shall be done, authorized as user with id: " + authPayload.Id.String())
		context.JSON(http.StatusUnauthorized, errorResponse("Not authenticated as user for whom the workplace shall be reserved.", err))
		return nil, err
	}

	workplaceReservationsSqlParams := db.RetrieveWorkplaceReservationsInTimespanParams{
		ReservedWorkplaceID: request.WorkplaceId,
		StartDate:           request.StartReservation,
		StartDate_2:         request.EndReservation,
	}
	reservationConflicts, err := server.queries.RetrieveWorkplaceReservationsInTimespan(context, workplaceReservationsSqlParams)
	if err != nil {
		context.JSON(http.StatusInternalServerError, errorResponse(UnexpectedErrContactMessage, err))
		return nil, err
	}
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
	reservationIdString := path.Base(context.Request.URL.String())
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

func deleteReservation(server *Server, context *gin.Context, reservationId uuid.UUID) (sql.Result, error) {
	reservationToBeDeleted, err := server.queries.GetReservationById(context, reservationId)
	authPayload := context.MustGet(authorizationPayloadKey).(*token.Payload)
	reservationOfOtherUser := reservationToBeDeleted.ReservingUserID != authPayload.UserId
	if reservationOfOtherUser {
		err := errors.New("you can only cancel your own reservations")
		context.JSON(http.StatusForbidden, errorResponse(err.Error(), err))
		return nil, err
	}

	// TODO only allow deleting future reservations

	result, err := server.queries.DeleteReservation(context, reservationId)
	if err != nil {
		context.JSON(http.StatusInternalServerError, errorResponse("Reservation could not be deleted", err))
		return nil, err
	}

	context.JSON(http.StatusOK, result)
	return result, nil
}
