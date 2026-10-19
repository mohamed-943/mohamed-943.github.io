# ─────────────────────────────────────────────────────────────
# Image multi-étapes (cours DevOps, partie III — Dockerfile)
#   deps    : installe les dépendances (couche mise en cache tant que package*.json ne change pas)
#   dev     : serveur Vite avec rechargement à chaud (docker compose --profile dev)
#   build   : compile le site statique dans /app/dist
#   runtime : Nginx non-root qui sert uniquement les fichiers compilés (~ 50 Mo)
# ─────────────────────────────────────────────────────────────
ARG NODE_VERSION=22

FROM node:${NODE_VERSION}-alpine AS deps
WORKDIR /app
ENV HUSKY=0
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

FROM deps AS dev
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

FROM deps AS build
COPY . .
# Base d'URL (ex. /portfolio/ pour GitHub Pages hors dépôt <user>.github.io) et commit affiché dans le pied de page
ARG VITE_BASE=/
ARG GIT_SHA=local
ENV VITE_BASE=${VITE_BASE} GITHUB_SHA=${GIT_SHA}
RUN npm run build

FROM nginxinc/nginx-unprivileged:1.31-alpine AS runtime
# Correctifs de sécurité publiés après la construction de l'image de base
USER root
RUN apk upgrade --no-cache
USER 101

ARG GIT_SHA=local
LABEL org.opencontainers.image.title="portfolio-mohamed-traore" \
      org.opencontainers.image.description="Portfolio de Mohamed Traoré — AI Engineer / Data Engineer" \
      org.opencontainers.image.source="https://github.com/mohamed-943/mohamed-943.github.io" \
      org.opencontainers.image.revision="${GIT_SHA}" \
      org.opencontainers.image.licenses="MIT"
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
      CMD wget -qO- http://127.0.0.1:8080/healthz || exit 1
