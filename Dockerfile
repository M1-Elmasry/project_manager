# Use the official Node.js 18 slim image as the base image
FROM node:18-slim

LABEL maintainer "Davenchy <firon1222@gmail.com>"
LABEL description "Project Manager Backend"

# Set the working directory inside the container
WORKDIR /app

# Copy the package.json and package-lock.json files
COPY package*.json ./

# Install production dependencies
RUN npm install --omit=dev

# Copy the source code
COPY . .

# Build the TypeScript code
RUN npm run build

# Remove the src directory after compilation
RUN rm -rf ./src

# Expose the port your app runs on
EXPOSE 5000

# Start the server
CMD ["npm", "start"]
