# Use an official Node.js runtime as a parent image
FROM node:14-alpine

# Set the working directory to /app
WORKDIR /app

# Copy the package.json and package-lock.json files to the container
COPY package*.json ./

# Install the dependencies
RUN npm install

# Copy the rest of the app to the container
COPY . .

# Build the app for production
RUN npm run build

# Set the command to run the app
CMD ["npm", "start"]
