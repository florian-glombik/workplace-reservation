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

	var workplacesWithReservations = make([]WorkplaceWithReservations, len(workplaces))

	for index, workplace := range workplaces {
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
		workplaceWithReservation.Reservations = reservations

		workplacesWithReservations[index] = workplaceWithReservation
	}

	context.JSON(http.StatusOK, workplacesWithReservations)
}
