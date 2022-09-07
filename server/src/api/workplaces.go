package api

import (
	"database/sql"
	db "github.com/florian-glombik/workplace-reservation/db/sqlc"
	"github.com/florian-glombik/workplace-reservation/src/util"
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

	workplacesWithReservations, err := getWorkplacesWithReservations(server, context, startTime, endTime)
	if err != nil {
		return
	}

	context.JSON(http.StatusOK, workplacesWithReservations)
}

func getWorkplacesWithReservations(server *Server, context *gin.Context, startTime time.Time, endTime time.Time) ([]WorkplaceWithReservations, error) {
	workplaces, err := server.queries.GetWorkplaces(context)
	if err != nil {
		context.JSON(http.StatusInternalServerError, errorResponse(UnexpectedErrContactMessage, err))
		return nil, err
	}

	var workplacesWithReservations = make([]WorkplaceWithReservations, 0)

	for _, workplace := range workplaces {
		reservations, err := retrieveSingleWorkplaceReservationsInTimespan(server, context, workplace, startTime, endTime)
		if err != nil {
			return nil, err
		}

		reoccurringReservationsInTimespan, err := retrieveReoccurringReservations(server, context, workplace, endTime)
		if err != nil {
			return nil, err
		}
		singleReservationsFromReoccurringReservationsInTimespan := calculateSingleReservationsFromReoccurringReservations(reoccurringReservationsInTimespan, startTime, endTime)

		reservations = append(reservations, singleReservationsFromReoccurringReservationsInTimespan...)
		workplaceWithReservations := setWorkplaceReservations(workplace, reservations)

		workplacesWithReservations = append(workplacesWithReservations, workplaceWithReservations)
	}

	return workplacesWithReservations, nil
}

func calculateSingleReservationsFromReoccurringReservations(reoccurringReservations []db.ReoccurringReservationsOfWorkplaceInTimespanRow, startTime time.Time, endTime time.Time) []db.RetrieveWorkplaceReservationsInTimespanRow {
	var calculatedReoccurringReservations = make([]db.RetrieveWorkplaceReservationsInTimespanRow, 0)
	for _, reoccurringReservation := range reoccurringReservations {
		currentStartDate := reoccurringReservation.StartDate
		currentEndDate := reoccurringReservation.EndDate
		intervalInDays := int(reoccurringReservation.IntervalInDays)

		for currentStartDate.Before(reoccurringReservation.RepeatUntil) {
			currentStartDate = currentStartDate.AddDate(0, 0, intervalInDays)
			currentEndDate = currentEndDate.AddDate(0, 0, intervalInDays)

			isInTimespan := util.IsDateBetween(currentStartDate, startTime, endTime) || util.IsDateBetween(currentEndDate, startTime, endTime)
			if isInTimespan {
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
	}
	return calculatedReoccurringReservations
}

func setWorkplaceReservations(workplace db.Workplace, reservations []db.RetrieveWorkplaceReservationsInTimespanRow) WorkplaceWithReservations {
	var workplaceWithReservation WorkplaceWithReservations

	workplaceWithReservation.ID = workplace.ID
	workplaceWithReservation.Name = workplace.Name
	workplaceWithReservation.Description = workplace.Description
	workplaceWithReservation.Reservations = reservations

	return workplaceWithReservation
}

func retrieveSingleWorkplaceReservationsInTimespan(server *Server, context *gin.Context, workplace db.Workplace, startTime time.Time, endTime time.Time) ([]db.RetrieveWorkplaceReservationsInTimespanRow, error) {
	workplaceReservationsSqlParams := db.RetrieveWorkplaceReservationsInTimespanParams{
		ReservedWorkplaceID: workplace.ID,
		StartDate:           startTime,
		StartDate_2:         endTime,
	}
	reservations, err := server.queries.RetrieveWorkplaceReservationsInTimespan(context, workplaceReservationsSqlParams)
	if err != nil {
		context.JSON(http.StatusInternalServerError, errorResponse(UnexpectedErrContactMessage, err))
		return nil, err
	}

	return reservations, nil
}

func retrieveReoccurringReservations(server *Server, context *gin.Context, workplace db.Workplace, endTime time.Time) ([]db.ReoccurringReservationsOfWorkplaceInTimespanRow, error) {
	// TODO consider start time
	reoccurringWorkplaceReservationSqlParams := db.ReoccurringReservationsOfWorkplaceInTimespanParams{
		ReservedWorkplaceID: workplace.ID,
		ToDate:              endTime.String(),
	}
	reoccurringReservationsInTimespan, err := server.queries.ReoccurringReservationsOfWorkplaceInTimespan(context, reoccurringWorkplaceReservationSqlParams)
	if err != nil {
		context.JSON(http.StatusInternalServerError, errorResponse(UnexpectedErrContactMessage, err))
		return nil, err
	}

	return reoccurringReservationsInTimespan, nil
}
