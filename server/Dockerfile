# Use the official image as a parent image.
FROM node:14.16.0

LABEL maintainer="bryan@securemeeting.org"

# Set the working directory.
WORKDIR /usr/src/app
# Copy the file from your host to your current location.
COPY package.json .
# Run the command inside your image filesystem.
RUN npm install
# Add metadata to the image to describe which port the container is listening on at runtime.

# Copy the rest of your app's source code from your host to your image filesystem.
COPY . .

EXPOSE 80
#Builds the typescript
RUN npm run build

# Run the specified command within the container.
CMD [ "npm", "start" ]
