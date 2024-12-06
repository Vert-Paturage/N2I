# Étape 1 : Construire l'application
FROM node:18 AS build

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de configuration et de dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Copier le reste des fichiers du projet
COPY . .

# Construire l'application avec Vite
RUN npx vite build

# Étape 2 : Servir l'application (production)
FROM nginx:alpine AS production

# Copier les fichiers construits depuis l'étape précédente
COPY --from=build /app/dist /usr/share/nginx/html

# Exposer le port 80
EXPOSE 80

# Démarrer Nginx
CMD ["nginx", "-g", "daemon off;"]
