package api

import (
	"database/sql"
	db "github.com/florian-glombik/workplace-reservation/db/sqlc"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"net/http"
	"time"
)

type CreateWorkplaceRequest struct {
	Name        sql.NullString `json:"name"`
	Description sql.NullString `json:"description"`
	OfficeId    uuid.NullUUID  `json:"officeId"`
}

// CreateWorkplace
// @Summary      Creating a new workplace
// @Tags         workplaces
// @Router       /workplace/create [post]
func (server *Server) createWorkplace(context *gin.Context) {
	var request CreateWorkplaceRequest

	if err := context.ShouldBindJSON(&request); err != nil {
		context.JSON(http.StatusBadRequest, errorResponse(ErrRequestCouldNotBeParsed, err))
		return
	}

	createWorkplaceSqlParams := db.CreateWorkplaceParams{
		ID:          uuid.New(),
		Name:        request.Name,
		Description: request.Description,
		OfficeID:    request.OfficeId,
	}
	newWorkplace, err := server.queries.CreateWorkplace(context, createWorkplaceSqlParams)
	if err != nil {
		context.JSON(http.StatusInternalServerError, errorResponse(UnexpectedErrContactMessage, err))
		return
	}

	context.JSON(http.StatusOK, newWorkplace)
}

type WorkplaceWithReservations struct {
	ID           uuid.UUID                                       `json:"id"`
	Name         sql.NullString                                  `json:"name"`
	Description  sql.NullString                                  `json:"description"`
	Reservations []db.RetrieveWorkplaceReservationsInTimespanRow `json:"reservations"`
}

type GetWorkplacesResponse struct {
	Workplaces []WorkplaceWithReservations `json:"workplaces"`
}

// GetNamesOfWorkplaces
// @Summary      Returns the names of all workplaces
// @Tags         workplaces
// @Router       /workplaces/names [get]
func (server *Server) getNamesOfWorkplaces(context *gin.Context) {
	workplaceNames, err := server.queries.GetNamesOfWorkplaces(context)
	if err != nil {
		context.JSON(http.StatusInternalServerError, errorResponse(UnexpectedErrContactMessage, err))
	}
	context.JSON(http.StatusOK, workplaceNames)
}

// GetWorkplaces
// @Summary      Returns all workplaces with reservations in the requested timespan and the linked office
// @Tags         workplaces
// @Router       /workplaces [get]
func (server *Server) getWorkplaces(context *gin.Context) {
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

	workplaces, err := server.queries.GetWorkplaces(context)
	if err != nil {
		context.JSON(http.StatusInternalServerError, errorResponse(UnexpectedErrContactMessage, err))
		return
	}

	var workplacesWithReservations = make([]WorkplaceWithReservations, 0)

	for _, workplace := range workplaces {
		var workplaceWithReservation WorkplaceWithReservations
		workplaceWithReservation.ID = workplace.ID
		workplaceWithReservation.Name = workplace.Name
		workplaceWithReservation.Description = workplace.Description

		workplaceReservationsSqlParams := db.RetrieveWorkplaceReservationsInTimespanParams{
			ReservedWorkplaceID: workplace.ID,
			StartDate:           startTime,
			StartDate_2:         endTime,
		}
		reservations, err := server.queries.RetrieveWorkplaceReservationsInTimespan(context, workplaceReservationsSqlParams)
		if err != nil {
			context.JSON(http.StatusInternalServerError, errorResponse(UnexpectedErrContactMessage, err))
			return
		}

		reoccurringWorkplaceReservationSqlParams := db.RetrieveReoccurringWorkplaceReservationsInTimespanParams{
			ReservedWorkplaceID: workplace.ID,
			ToDate:              endTime.String(),
		}
		reoccurringReservationsInTimespan, err := server.queries.RetrieveReoccurringWorkplaceReservationsInTimespan(context, reoccurringWorkplaceReservationSqlParams)
		if err != nil {
			context.JSON(http.StatusInternalServerError, errorResponse(UnexpectedErrContactMessage, err))
			return
		}

		var calculatedReoccurringReservations = make([]db.RetrieveWorkplaceReservationsInTimespanRow, 0)
		for _, reoccurringReservation := range reoccurringReservationsInTimespan {
			currentStartDate := reoccurringReservation.StartDate
			currentEndDate := reoccurringReservation.EndDate

			for currentStartDate.Before(reoccurringReservation.RepeatUntil) {
				currentStartDate = currentStartDate.AddDate(0, 0, int(reoccurringReservation.IntervalInDays))
				currentEndDate = currentEndDate.AddDate(0, 0, int(reoccurringReservation.IntervalInDays))

				calculatedReoccurringReservations = append(calculatedReoccurringReservations, db.RetrieveWorkplaceReservationsInTimespanRow{
					ID:                  uuid.New(),
					StartDate:           currentStartDate,
					EndDate:             currentEndDate,
					ReservingUserID:     reoccurringReservation.ReservingUserID,
					ReservedWorkplaceID: reoccurringReservation.ReservedWorkplaceID,
					Username:            sql.NullString{String: "TODO", Valid: true},
					Email:               sql.NullString{String: "TODO", Valid: true},
				})
			}
		}

		reservations = append(reservations, calculatedReoccurringReservations...)

		workplaceWithReservation.Reservations = reservations
		workplacesWithReservations = append(workplacesWithReservations, workplaceWithReservation)
	}

	context.JSON(http.StatusOK, workplacesWithReservations)
}
