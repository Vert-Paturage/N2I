# Étape 1 : Utiliser une image Node.js officielle
FROM node:18

# Étape 2 : Définir le répertoire de travail dans le conteneur
WORKDIR /app

# Étape 3 : Copier les fichiers package.json et package-lock.json pour installer les dépendances
COPY package*.json ./

# Étape 4 : Installer les dépendances
RUN npm install

# Étape 5 : Copier le reste des fichiers de l'application dans le conteneur
COPY . .

# Étape 6 : Exposer le port que votre serveur utilise (par exemple 3000)
EXPOSE 80

# Étape 7 : Démarrer l'application
CMD ["npx", "vite", "--host", "--port", "80"]
