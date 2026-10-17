# Raccourcis : tapez « make » pour la liste.
.DEFAULT_GOAL := help
SHA := $(shell git rev-parse --short HEAD 2>/dev/null || echo local)

help: ## Afficher cette aide
	@grep -E '^[a-zA-Z_-]+:.*?## ' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-14s\033[0m %s\n", $$1, $$2}'

install: ## Installer les dépendances
	npm ci

dev: ## Serveur de développement (http://localhost:5173)
	npm run dev

check: ## Formatage + lint + types + tests (comme la CI)
	npm run check

build: ## Compiler le site dans dist/
	npm run build

image: ## Construire l'image Docker de production
	docker build --target runtime --build-arg GIT_SHA=$(SHA) -t portfolio-mohamed:$(SHA) -t portfolio-mohamed:local .

run: image ## Lancer l'image sur http://localhost:8080
	docker run --rm -p 8080:8080 --name portfolio-web portfolio-mohamed:local

up: ## docker compose : production en arrière-plan (port 8080)
	GIT_SHA=$(SHA) docker compose up -d --build
	@docker compose ps

dev-docker: ## docker compose : développement dans un conteneur (port 5173)
	docker compose --profile dev up --build dev

logs: ## Journaux du conteneur
	docker compose logs -f web

down: ## Arrêter et supprimer les conteneurs
	docker compose --profile dev down

smoke: ## Test de fumée sur le conteneur en cours
	curl -fs http://localhost:8080/healthz && curl -fsI http://localhost:8080/ | head -n 12

clean: ## Supprimer dist/ et les images locales
	rm -rf dist
	-docker image rm portfolio-mohamed:local

.PHONY: help install dev check build image run up dev-docker logs down smoke clean
