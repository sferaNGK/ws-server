FROM oven/bun:latest

# Установите рабочую директорию
WORKDIR /usr/src/app

COPY package.json ./
COPY prisma ./prisma

RUN bun install

COPY . .

RUN bun prisma migrate dev --preview-feature

EXPOSE 3000

CMD ["bun", "start:prod"]