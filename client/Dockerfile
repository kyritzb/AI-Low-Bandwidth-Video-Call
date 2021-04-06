# Use the official image as a parent image.
FROM node:14

LABEL maintainer="bryan@securemeeting.org"

# Set the working directory.
WORKDIR /usr/src/app
# Copy the file from your host to your current location.
COPY package.json .
# Run the command inside your image filesystem.
RUN npm install

RUN npm install -g serve # A simple webserver
# Add metadata to the image to describe which port the container is listening on at runtime.

# Copy the rest of your app's source code from your host to your image filesystem.
COPY . .

RUN npm run build

EXPOSE 3000

CMD ["serve", "-s", "build", "-l", "3000"]
