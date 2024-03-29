# :calendar: workplace-reservation :computer:
## Get Started
### Prerequisite Installations
Make sure to install:
TODO


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
- [Go](https://go.dev/) _- at least version 1.18_
- [docker](https://www.docker.com/get-started/) _- keeps our PostgresSQL database_
- [npm](https://www.npmjs.com/) _- used as package manager, e.g. for importing [React](https://reactjs.org/)_
- [migrate](https://github.com/golang-migrate/migrate/blob/master/cmd/migrate/README.md) _- framework used for database migrations_
  <details>
  <summary>Linux distribution</summary>
  
  There might be issues when working on a custom Linux distribution, this [installation process](https://stackoverflow.com/a/66621758/16540383) might work for you
  </details>
- [sqlc](https://docs.sqlc.dev/en/latest/overview/install.html) _- used for generation of Go code from SQL queries; there is currently (1.13) no support for Postgres sqlc for Windows_

### Before First Startup
You will need to download the used packages and frameworks.

For the Go Server: Make sure to sync the imports/modules

For the Client/Webapp: Make sure to execute `npm install` within the folder `workplace-reservation/webapp`


### Client
Make sure to use [prettier](https://www.jetbrains.com/help/idea/prettier.html)

<br>
The project is based on Go and React. I use [GoLand](https://www.jetbrains.com/de-de/go/) as IDE and included my project
configurations within this repository, which might save you some time getting started with the project in case you do not
prefer another IDE.

If you are using GoLand the prettier configuration will look like this: ![goLandPrettierConfiguration.png](goLandPrettierConfiguration.png)<br>
You will need to install the [prettier plugin](https://plugins.jetbrains.com/plugin/10456-prettier) and restart the GoLand before this selection appears.

### Server

#### GoLand Database Configuration example
![goLandDatabaseConfigurationExample.png](goLandDatabaseConfigurationExample.png) <br>

#### Swagger API

https://github.com/swaggo/gin-swagger

execute `swag init` in `server/src`
Once you have started the server you can find a visual representation of the [Swagger API](http://localhost:8080/swagger/index.html).
