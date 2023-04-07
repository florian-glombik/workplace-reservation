# Use an official Go runtime as a parent image
FROM golang:1.18

# Set the working directory to /app
WORKDIR /app

# Download Go modules
COPY go.mod go.sum ./
RUN go mod download

RUN go install github.com/swaggo/swag/cmd/swag@latest

# Copy the source code. Note the slash at the end, as explained in
# https://docs.docker.com/engine/reference/builder/#copy
COPY ./src/*.go ./

RUN swag init

# Build
# RUN CGO_ENABLED=0 GOOS=linux go build -o /workplace-reservation-server

# Optional:
# To bind to a TCP port, runtime parameters must be supplied to the docker command.
# But we can document in the Dockerfile what ports
# the application is going to listen on by default.
# https://docs.docker.com/engine/reference/builder/#expose
EXPOSE 8080

# Define the command to run the Go application when the container starts
#CMD ["./main"]

# Run
# CMD [ "/workplace-reservation-server" ]