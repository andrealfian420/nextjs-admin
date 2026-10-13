.PHONY: dev prod build logs down clean shell

# Development (full Docker with hot-reload)
dev:
	docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build -d

# Production-like
prod:
	docker compose up --build -d

# Build images only
build:
	docker compose build

# Tail logs
logs:
	docker compose logs -f

# Stop containers
down:
	docker compose down

# Stop and remove the project's volumes too (fresh node_modules and .next for dev)
clean:
	docker compose -f docker-compose.yml -f docker-compose.dev.yml down -v

# Shell into app container
shell:
	docker compose exec app sh
