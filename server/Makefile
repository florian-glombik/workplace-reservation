create_db:
	docker exec -it postgres14 createdb --username=root --owner=root workplace_reservation
drop_db:
	docker exec -it postgres14 dropdb workplace_reservation
start_db:
	docker start postgres14
migrate_up:
	migrate -path db/migrations -database "postgresql://root:root@localhost:5432/workplace_reservation?sslmode=disable" -verbose up
migrate_down:
	yes | migrate -path db/migrations -database "postgresql://root:root@localhost:5432/workplace_reservation?sslmode=disable" -verbose down
sqlc:
	sqlc generate
generate_api:
	swag init

.PHONY: create_db drop_db start_db migrate_up migrate_down sqlc server generate_api