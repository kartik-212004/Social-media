FROM node:alpine

WORKDIR /app

COPY package*.json ./

COPY prisma ./prisma/

RUN npm install

COPY . .

RUN npx prisma generate

EXPOSE 3000

CMD npx prisma migrate deploy && npm run start
