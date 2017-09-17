FROM node:latest
RUN mkdir /app
COPY hdhBU/package.json /app
WORKDIR /app
RUN npm install
COPY hdhBU /app
CMD ["node", "app.js"]
