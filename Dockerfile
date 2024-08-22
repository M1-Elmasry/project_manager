# Use the official Node.js 18 slim image as the base image
# Stage 1: Build Stage
FROM node:18-slim AS build

# Set the working directory inside the container
WORKDIR /app

# Copy the package.json and package-lock.json files
COPY package*.json .

# Install production dependencies
RUN npm install

# Copy the source code
COPY . .

# Build the TypeScript code
RUN npm run build

# Remove development dependencies
RUN npm prune --omit=dev

# Stage 2: Production Stage
FROM node:18-slim

LABEL maintainer="Davenchy <firon1222@gmail.com>"
LABEL description="Project Manager Backend"

# Set the working directory inside the container
WORKDIR /app

# Copy the package.json and package-lock.json files
COPY --from=build /app/package*.json ./
COPY --from=build /app/node_modules ./node_modules

# Copy the built code from the build stage
COPY --from=build /app/dist ./dist
COPY --from=build /app/src/swagger.yaml ./dist/swagger.yaml

# Expose the port your app runs on
EXPOSE 5000

# Start the server
CMD ["npm", "start"]
