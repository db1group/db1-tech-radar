FROM node:16.14

WORKDIR /app/node/app

COPY . /app/node/app/

WORKDIR /app/node/app

RUN yarn install

RUN yarn build

EXPOSE 5173
CMD ["yarn", "serve"]
