# build stage
FROM golang:1.18 as builder

WORKDIR /app

# Download Go modules
COPY go.mod .
COPY go.sum .
RUN go mod download

# TODO rebuild swagger api
# RUN go install github.com/swaggo/swag/cmd/swag@latest
# RUN swag init
# TODO rebuild sqlc queries

COPY . .

WORKDIR /app/src

RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o /workplace-reservation-server

# final stage
FROM scratch
COPY --from=builder /workplace-reservation-server /app/
EXPOSE 8080
ENTRYPOINT ["/app/workplace-reservation-server"]