package api

import (
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

}
