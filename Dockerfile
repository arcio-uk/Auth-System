FROM node:16.13.2

WORKDIR /app

COPY . /app

RUN npm ci
RUN npm run build

ENV NODE_PATH dist/

CMD ["node", "./dist/index.js", "${NODE_PATH}"]
