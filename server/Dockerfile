# build stage
FROM golang:1.18 as builder

WORKDIR /app

# Download Go modules
COPY go.mod .
COPY go.sum .
RUN go mod download

COPY . .

RUN go install github.com/kyleconroy/sqlc/cmd/sqlc@latest
RUN sqlc generate

WORKDIR /app/src

RUN go install github.com/swaggo/swag/cmd/swag@latest
RUN swag init

RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o /workplace-reservation-server

# final stage
FROM scratch

COPY --from=builder /workplace-reservation-server /app/
EXPOSE 8080
ENTRYPOINT ["/app/workplace-reservation-server"]