create_db:
	docker exec -it database createdb --username=root --owner=root workplace_reservation
drop_db:
	docker exec -it database dropdb workplace_reservation
migrate_up:
	migrate -path db/migrations -database "postgresql://root:root@localhost:5432/workplace_reservation?sslmode=disable" -verbose up
migrate_down:
	yes | migrate -path db/migrations -database "postgresql://root:root@localhost:5432/workplace_reservation?sslmode=disable" -verbose down
sqlc:
	sqlc generate
generate_api:
	swag init

.PHONY: create_db drop_db migrate_up migrate_down sqlc server generate_api