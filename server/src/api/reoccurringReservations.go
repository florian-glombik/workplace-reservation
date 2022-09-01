package api

import (
	db "github.com/florian-glombik/workplace-reservation/db/sqlc"
	"github.com/florian-glombik/workplace-reservation/src/token"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"net/http"
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
}

// AddReoccurringReservation
// @Summary      Adds a reoccurring reservation
// @Tags         reservation
// @Router       /reservations/reoccurring [post]
func (server *Server) addReoccurringReservation(context *gin.Context) {
	var request ReoccurringReservationRequest
	if err := context.ShouldBindJSON(&request); err != nil {
		context.JSON(http.StatusBadRequest, errorResponse(ErrRequestCouldNotBeParsed, err))
		return
	}
	authPayload := context.MustGet(authorizationPayloadKey).(*token.Payload)

	startDayWithHoursSetToBeginOfDay := setTimeOfDay(request.ReservationStartDay, 0, 0, 0)
	reservationEndDate := setTimeOfDay(startDayWithHoursSetToBeginOfDay, 23, 59, 59)
	reservationToBeRepeatedParams := ReserveWorkplaceRequest{
		WorkplaceId:      request.WorkplaceId,
		UserId:           authPayload.UserId,
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
		//TODO delete created repetable reservation
		return
	}

	context.JSON(http.StatusOK, reoccurringReservation)

}

func setTimeOfDay(date time.Time, hours int, minutes int, seconds int) time.Time {
	return time.Date(date.Year(), date.Month(), date.Day(), hours, minutes, seconds, 0, date.Location())
}
