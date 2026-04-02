FROM node:22-alpine

WORKDIR /app

RUN apk add --no-cache ffmpeg

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY server ./server

ENV NODE_ENV=production
ENV PORT=8787

EXPOSE 8787

CMD ["node", "./server/aliyun-speech-server.mjs"]
