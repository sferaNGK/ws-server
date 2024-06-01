FROM node:18-alpine

WORKDIR /usr/src/app

COPY package.json ./
COPY prisma ./prisma

RUN npm i

COPY . .

RUN npm run build
RUN npx prisma generate

#bun prisma db push --accept-data-loss

EXPOSE 7171

CMD ["npm", "run", "start:prod"]