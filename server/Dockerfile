# build stage
FROM golang:1.18 as builder

WORKDIR /app

# Download Go modules
COPY go.mod .
COPY go.sum .

RUN go mod download

# RUN go install github.com/swaggo/swag/cmd/swag@latest

COPY . .

WORKDIR /app/src

RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o /workplace-reservation-server

# final stage
FROM scratch
COPY --from=builder /workplace-reservation-server /app/
EXPOSE 8080
ENTRYPOINT ["/app/workplace-reservation-server"]

# RUN swag init

# Build
# RUN CGO_ENABLED=0 GOOS=linux go build -o /workplace-reservation-server

# Optional:
# To bind to a TCP port, runtime parameters must be supplied to the docker command.
# But we can document in the Dockerfile what ports
# the application is going to listen on by default.
# https://docs.docker.com/engine/reference/builder/#expose
# EXPOSE 8080

# Define the command to run the Go application when the container starts
#CMD ["./main"]

# Run
# CMD [ "/workplace-reservation-server" ]