# :calendar: workplace-reservation :computer:
## Get Started
### Prerequisite Installations
Make sure to install:
- [docker](https://www.docker.com/get-started/) _handles our PostgresSQL database_ <br>
  _(If you do not want to install docker you can also run a [PostgreSQL](https://www.postgresql.org/) database without docker
    on port `5432`, but be aware that the following setup description might not work without modifications for you.)_
- [sqlc](https://docs.sqlc.dev/en/latest/overview/install.html) _- used for generation of Go code from SQL queries_


### Create the Database
Within this step I describe the process of creating a PostgreSQL when using docker.

Pull your favourite [PostgreSQL docker image](https://hub.docker.com/_/postgres). I decided to use the tag `14-alpine`, 
resulting in the CLI-command
```
docker pull postgres:14-alpine
```

After pulling the image, the container needs to be started: <br>
_Make sure to exchange `<user-name>` and `<password>` with your custom values before executing the command._
```
docker run --name postgres14 -p 5432:5432 -e POSTGRES_USER=<user-name> -e POSTGRES_PASSWORD=<password> -d postgres:14-alpine
```

We have now set up our Postgres instance within the docker container, but still need to create the database.
To do so, navigate to the folder `server`. Within this folder execute the following commands:
<br>
_If you did not name your container `postgres14` the predefined `create_db`/`dop_db` commands will not work.
Make sure to adjust the commands in `server/Makefile` properly to match the name of your Postgres docker container._

Create the database within the container:
```
make create_db
```

Add the database schema by running a migration:
```
make migrate_up
```

### Start the Application
We are using sqlc to generate code for the SQL queries. We need to generate the code before running the application.
Execute the following command within the `server` folder:
```
make sqlc
```


TODO

## Developer Setup Guide
### Prerequisite Installations
Make sure to install:
- [Go](https://go.dev/)
- [docker](https://www.docker.com/get-started/) _keeps our PostgresSQL database_
- [npm](https://www.npmjs.com/) _- used as package manager, e.g. for importing [React](https://reactjs.org/)_
- [migrate](https://github.com/golang-migrate/migrate/blob/master/cmd/migrate/README.md) _- framework used for database migrations_
- [sqlc](https://docs.sqlc.dev/en/latest/overview/install.html) _- used for generation of Go code from SQL queries_

### Before First Startup
You will need to download the used packages and frameworks.

For the Go Server: Make sure to sync the imports/modules

For the Client/Webapp: Make sure to execute `npm install` within the folder `workplace-reservation/webapp`



<br>
<br>
<br>
The project is based on Go and React. I use [GoLand](https://www.jetbrains.com/de-de/go/) as IDE and included my project
configurations within this repository, which might save you some time getting started with the project in case you do not
prefer another IDE.
