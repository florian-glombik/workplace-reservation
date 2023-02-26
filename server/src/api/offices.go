package api

import (
	"database/sql"
	"errors"
	db "github.com/florian-glombik/workplace-reservation/db/sqlc"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	uuidConversion "github.com/satori/go.uuid"
	"net/http"
	"path"
)

type Office struct {
	ID          uuid.UUID      `json:"id"`
	Name        sql.NullString `json:"name"`
	Description sql.NullString `json:"description"`
}

// GetOffices
// @Summary      Returns all offices
// @Tags         offices
// @Router       /offices [get]
func (server *Server) getOffices(context *gin.Context) {
	offices, err := server.queries.GetOffices(context)
	if err != nil {
		context.JSON(http.StatusInternalServerError, errorResponse(UnexpectedErrContactMessage, err))
		return
	}

	context.JSON(http.StatusOK, offices)
}

// GetOfficeById
// @Summary      Returns office for supplied ID
// @Tags         offices
// @Router       /offices/office-id [get]
func (server *Server) getOfficeById(context *gin.Context) {
	officeIdString := path.Base(context.Request.URL.Path)
	parsedUuid, err := uuidConversion.FromString(officeIdString)
	if err != nil {
		context.JSON(http.StatusBadRequest, errorResponse("Invalid uuid", err))
		return
	}
	officeId := uuid.UUID(parsedUuid)

	office, err := server.queries.GetOfficeById(context, officeId)
	if err != nil {
		context.JSON(http.StatusInternalServerError, errorResponse(UnexpectedErrContactMessage, err))
		return
	}

	context.JSON(http.StatusOK, office)
}

type CreateOfficeRequest struct {
	Name        string `json:"name" binding:"required"`
	Description string `json:"description" binding:"omitempty"`
}

// CreateOffice
// @Summary      Create a new office
// @Tags         offices
// @Accept       json
// @Produce      json
// @Router       /offices [post]
func (server *Server) createOffice(context *gin.Context) {
	if !isAdmin(context) {
		err := errors.New("you are not allowed to create offices")
		context.JSON(http.StatusForbidden, errorResponse(err.Error(), err))
		return
	}

	var request CreateOfficeRequest

	if err := context.ShouldBindJSON(&request); err != nil {
		context.JSON(http.StatusBadRequest, errorResponse(ErrRequestCouldNotBeParsed, err))
		return
	}

	createOfficeParams := db.CreateOfficesParams{
		ID:          uuid.New(),
		Name:        sql.NullString{String: request.Name, Valid: true},
		Description: sql.NullString{String: request.Description, Valid: true},
	}

	newOffice, err := server.queries.CreateOffices(context, createOfficeParams)
	if err != nil {
		context.JSON(http.StatusInternalServerError, errorResponse("The office could not be created.", err))
		return
	}

	context.JSON(http.StatusOK, newOffice)
}

// EditOffice
// @Summary
// @Tags         offices
// @Router       /offices/edit [patch]
func (server *Server) editOffice(context *gin.Context) {
	if !isAdmin(context) {
		err := errors.New("you are not allowed to edit offices")
		context.JSON(http.StatusForbidden, errorResponse(err.Error(), err))
		return
	}

	var request Office
	if err := context.ShouldBindJSON(&request); err != nil {
		context.JSON(http.StatusBadRequest, errorResponse(ErrRequestCouldNotBeParsed, err))
		return
	}

	updateOfficeSqlParams := db.UpdateOfficeParams{
		ID:          request.ID,
		Name:        request.Name,
		Description: request.Description,
	}
	office, err := server.queries.UpdateOffice(context, updateOfficeSqlParams)
	if err != nil {
		context.JSON(http.StatusInternalServerError, errorResponse(UnexpectedErrContactMessage, err))
		return
	}

	context.JSON(http.StatusOK, office)
}

// TODO add on delete cascade to workplaces
// DeleteOffice
// @Summary
// @Tags         offices
// @Router       /offices/delete [delete]
func (server *Server) deleteOffice(context *gin.Context) {
	if !isAdmin(context) {
		err := errors.New("you are not allowed to delete offices")
		context.JSON(http.StatusForbidden, errorResponse(err.Error(), err))
		return
	}

	officeIdString := path.Base(context.Request.URL.Path)
	parsedUuid, err := uuidConversion.FromString(officeIdString)
	if err != nil {
		context.JSON(http.StatusBadRequest, errorResponse("Invalid reoccurring reservation uuid", err))
		return
	}
	officeId := uuid.UUID(parsedUuid)

	office, err := server.queries.DeleteOffice(context, officeId)
	if err != nil {
		context.JSON(http.StatusInternalServerError, errorResponse(UnexpectedErrContactMessage, err))
		return
	}

	context.JSON(http.StatusOK, office)
}
