# workplace-reservation

## Get Started

## Developer Setup Guide
Make sure to install:
- [Go](https://go.dev/)
- [docker](https://www.docker.com/get-started/) _keeps our PostgresSQL database_
- [npm](https://www.npmjs.com/) _- used as package manager, e.g. for importing [React](https://reactjs.org/)_
- [migrate](https://github.com/golang-migrate/migrate/blob/master/cmd/migrate/README.md) _- framework used for database migrations_

### Before First Startup
You will need to download the used packages and frameworks.

For the Go Server: Make sure to sync the imports/modules

For the Client/Webapp: Make sure to execute `npm install` within the folder `workplace-reservation/webapp`

The project is based on Go and React. I use [GoLand](https://www.jetbrains.com/de-de/go/) as IDE and included my project
configurations within this file, which might save you some time getting started with the project in case you do not
prefer another IDE.


Setup Database (not automated yet)
1010  docker pull postgres:14-alpine
1014  docker ps
1012  docker images
1013  docker run --name postgres14 -p 5432:5432 -e POSTGRES_USER=root -e POSTGRES_PASSWORD=secret -d postgres:14-alpine
1019  docker exec -it postgres14 psql -U root
1020  docker logs postgres14
