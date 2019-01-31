FROM node:lts-alpine

WORKDIR /app

COPY package.json ./
COPY package-lock.json ./
RUN npm ci -s --only=production

COPY src ./src

CMD npm start