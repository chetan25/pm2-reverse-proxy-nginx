# Base image
FROM node:slim

# Creating a directory inside the base image and defining as the base directory
WORKDIR /app

# Copying the files of the root directory into the base directory
COPY ./package.json ./

# Installing the project dependencies
RUN npm install
# RUN npm install pm2 -g

COPY . .

CMD ["npm", "run", "start"]
