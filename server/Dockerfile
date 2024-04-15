# build stage
# for x86 (amd)
#FROM golang:1.21 as builder
# for arm64
FROM arm64v8/golang:1.21 as builder

WORKDIR /app

# Download Go modules
COPY go.mod .
COPY go.sum .
RUN go mod download

COPY . .

RUN go install github.com/sqlc-dev/sqlc/cmd/sqlc@latest

RUN sqlc generate

WORKDIR /app/src

RUN go install github.com/swaggo/swag/cmd/swag@v1.8.12
RUN swag init

RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o /workplace-reservation-server

# final stage
FROM scratch

COPY --from=builder /workplace-reservation-server /app/
EXPOSE 8080
ENTRYPOINT ["/app/workplace-reservation-server"]