package api

import (
	"database/sql"
	"errors"
	db "github.com/florian-glombik/workplace-reservation/db/sqlc"
	"github.com/florian-glombik/workplace-reservation/src/util"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	uuidConversion "github.com/satori/go.uuid"
	"net/http"
	"path"
	"time"
)

type CreateWorkplaceRequest struct {
	Name        string `binding:"omitempty"`
	Description string `binding:"omitempty"`
	OfficeID    uuid.UUID
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
		Name:        toNullString(request.Name),
		Description: toNullString(request.Description),
		OfficeID:    request.OfficeID,
	}
	newWorkplace, err := server.queries.CreateWorkplace(context, createWorkplaceSqlParams)
	if err != nil {
		context.JSON(http.StatusInternalServerError, errorResponse(UnexpectedErrContactMessage, err))
		return
	}

	context.JSON(http.StatusOK, newWorkplace)
}

// DeleteWorkplace
// @Summary
// @Tags         workplaces
// @Router       /workplaces/:workplaceId [delete]
func (server *Server) deleteWorkplace(context *gin.Context) {
	if !isAdmin(context) {
		err := errors.New("you are not allowed to delete workplaces")
		context.JSON(http.StatusForbidden, errorResponse(err.Error(), err))
		return
	}

	workplaceId, err := getUuidFromUrl(context)
	if err != nil {
		context.JSON(http.StatusBadRequest, errorResponse("Invalid workplace uuid", err))
		return
	}

	sqlResult, err := server.queries.DeleteWorkplace(context, *workplaceId)
	if err != nil {
		context.JSON(http.StatusInternalServerError, errorResponse(UnexpectedErrContactMessage, err))
		return
	}

	context.JSON(http.StatusOK, sqlResult)
}

func getUuidFromUrl(context *gin.Context) (*uuid.UUID, error) {
	officeIdString := path.Base(context.Request.URL.Path)
	parsedUuid, err := uuidConversion.FromString(officeIdString)
	if err != nil {
		return nil, err
	}
	officeId := uuid.UUID(parsedUuid)

	return &officeId, nil
}

type UpdateWorkplaceRequest struct {
	Name        string `binding:"omitempty"`
	Description string `binding:"omitempty"`
}

// UpdateWorkplace
// @Summary      Updating a workplace
// @Tags         workplaces
// @Router       /workplace/:workplaceId [patch]
func (server *Server) editWorkplace(context *gin.Context) {
	if !isAdmin(context) {
		err := errors.New("you are not allowed to edit workplaces")
		context.JSON(http.StatusForbidden, errorResponse(err.Error(), err))
		return
	}

	workplaceId, err := getUuidFromUrl(context)
	if err != nil {
		context.JSON(http.StatusBadRequest, errorResponse("Invalid workplace uuid", err))
		return
	}

	var requestWorkplace UpdateWorkplaceRequest
	if err := context.ShouldBindJSON(&requestWorkplace); err != nil {
		context.JSON(http.StatusBadRequest, errorResponse(ErrRequestCouldNotBeParsed, err))
		return
	}

	updateWorkplaceSqlParams := db.UpdateWorkplaceParams{
		ID:          *workplaceId,
		Name:        toNullString(requestWorkplace.Name),
		Description: toNullString(requestWorkplace.Description),
	}

	_, err = server.queries.UpdateWorkplace(context, updateWorkplaceSqlParams)
	if err != nil {
		context.JSON(http.StatusInternalServerError, errorResponse(UnexpectedErrContactMessage, err))
		return
	}

	context.JSON(http.StatusOK, updateWorkplaceSqlParams)
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
		reservations, err := getWorkplaceReservations(server, context, workplace, startTime, endTime)
		if err != nil {
			return nil, err
		}

		workplaceWithReservations := setWorkplaceReservations(workplace, reservations)

		workplacesWithReservations = append(workplacesWithReservations, workplaceWithReservations)
	}

	return workplacesWithReservations, nil
}

func getWorkplaceReservations(server *Server, context *gin.Context, workplace db.Workplace, startTime time.Time, endTime time.Time) ([]db.RetrieveWorkplaceReservationsInTimespanRow, error) {
	reservations, err := retrieveSingleWorkplaceReservationsInTimespan(server, context, workplace, startTime, endTime)
	if err != nil {
		return nil, err
	}

	reoccurringReservationsInTimespan, err := retrieveReoccurringReservations(server, context, workplace, endTime)
	if err != nil {
		return nil, err
	}
	singleReservationsFromReoccurringReservationsInTimespan, err := calculateSingleReservationsFromReoccurringReservations(server, context, reoccurringReservationsInTimespan, startTime, endTime)
	if err != nil {
		return nil, err
	}

	var singleReservationsWithoutReoccurringId = make([]db.RetrieveWorkplaceReservationsInTimespanRow, 0)
	for _, singleReservation := range singleReservationsFromReoccurringReservationsInTimespan {
		singleReservationsWithoutReoccurringId = append(singleReservationsWithoutReoccurringId, db.RetrieveWorkplaceReservationsInTimespanRow{
			ID:                  singleReservation.ID,
			StartDate:           singleReservation.StartDate,
			EndDate:             singleReservation.EndDate,
			ReservingUserID:     singleReservation.ReservingUserID,
			ReservedWorkplaceID: singleReservation.ReservedWorkplaceID,
			Username:            singleReservation.Username,
			Email: sql.NullString{
				singleReservation.Email, true,
			},
		})
	}

	reservations = append(reservations, singleReservationsWithoutReoccurringId...)
	return reservations, nil
}

type RetrieveWorkplaceReservationsInTimespanRowWithReoccurringReservationId struct {
	ID                       uuid.UUID
	StartDate                time.Time
	EndDate                  time.Time
	ReservingUserID          uuid.UUID
	ReservedWorkplaceID      uuid.UUID
	Username                 sql.NullString
	Email                    string
	ReoccurringReservationID uuid.UUID
}

func calculateSingleReservationsFromReoccurringReservations(server *Server, context *gin.Context, reoccurringReservations []db.ReoccurringReservationsOfWorkplaceInTimespanRow, startTime time.Time, endTime time.Time) ([]RetrieveWorkplaceReservationsInTimespanRowWithReoccurringReservationId, error) {
	var calculatedReoccurringReservations = make([]RetrieveWorkplaceReservationsInTimespanRowWithReoccurringReservationId, 0)
	for _, reoccurringReservation := range reoccurringReservations {
		currentStartDate := reoccurringReservation.StartDate
		currentEndDate := reoccurringReservation.EndDate
		intervalInDays := int(reoccurringReservation.IntervalInDays)

		user, err := server.queries.GetUserById(context, reoccurringReservation.ReservingUserID)
		if err != nil {
			context.JSON(http.StatusInternalServerError, errorResponse(UnexpectedErrContactMessage, err))
			return nil, err
		}

		exceptions, err := server.queries.GetReoccurringReservationExceptions(context, reoccurringReservation.ID_2)
		if err != nil {
			context.JSON(http.StatusInternalServerError, errorResponse(UnexpectedErrContactMessage, err))
			return nil, err
		}

		for {
			currentStartDate = currentStartDate.AddDate(0, 0, intervalInDays)
			currentEndDate = currentEndDate.AddDate(0, 0, intervalInDays)

			isInTimespan := util.IsDateBetweenOrEqual(currentStartDate, startTime, endTime) || util.IsDateBetweenOrEqual(currentEndDate, startTime, endTime)
			timeSpanShallBeConsidered := true
			for _, exception := range exceptions {
				if util.IsDateAfterOrEqual(currentStartDate, exception.StartExceptionDate) && util.IsDateBeforeOrEqual(currentEndDate, exception.EndExceptionDate) {
					timeSpanShallBeConsidered = false
				}
			}

			if isInTimespan && timeSpanShallBeConsidered {
				calculatedReoccurringReservations = append(calculatedReoccurringReservations, RetrieveWorkplaceReservationsInTimespanRowWithReoccurringReservationId{
					ID:                       uuid.New(),
					StartDate:                currentStartDate,
					EndDate:                  currentEndDate,
					ReservingUserID:          reoccurringReservation.ReservingUserID,
					ReservedWorkplaceID:      reoccurringReservation.ReservedWorkplaceID,
					Username:                 user.Username,
					Email:                    user.Email,
					ReoccurringReservationID: reoccurringReservation.ID_2,
				})
			}

			if currentStartDate.After(reoccurringReservation.RepeatUntil) {
				break
			}
		}
	}
	return calculatedReoccurringReservations, nil
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

	excludedReservationParams := db.ExcludedReservationsInTimespanParams{
		StartDate:   startTime,
		StartDate_2: endTime,
	}
	// TODO use workplace in sql query
	excludedReservations, err := server.queries.ExcludedReservationsInTimespan(context, excludedReservationParams)
	if err != nil {
		context.JSON(http.StatusInternalServerError, errorResponse(UnexpectedErrContactMessage, err))
		return nil, err
	}

	var reservationsInTimespan []db.RetrieveWorkplaceReservationsInTimespanRow
	for _, reservation := range reservations {
		if !Contains(excludedReservations, reservation.ID) {
			reservationsInTimespan = append(reservationsInTimespan, reservation)
		}
	}

	return reservationsInTimespan, nil
}

func Contains[T comparable](s []T, e T) bool {
	for _, v := range s {
		if v == e {
			return true
		}
	}
	return false
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
