FROM oven/bun:latest

WORKDIR /usr/src/app

COPY package.json ./
COPY prisma ./prisma

RUN bun install

COPY . .

#bun prisma db push --accept-data-loss

EXPOSE 3000

CMD ["bun", "start:prod"]