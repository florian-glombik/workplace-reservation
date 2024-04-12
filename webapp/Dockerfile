# build environment
FROM node:14-alpine as builder
WORKDIR /app

ARG PRIMARY_BACKEND_URL
ENV REACT_APP_BACKEND_URL=$PRIMARY_BACKEND_URL

# Install the dependencies
COPY package*.json ./
RUN npm install --silent
RUN npm install react-scripts@3.4.1 -g --silent

# Copy the rest of the app to the container
COPY . ./

# Build the app for production
RUN npm run build

# production environment
FROM nginx:1.16.0-alpine

## Copy custom nginx configuration
COPY nginx/nginx.conf /etc/nginx/nginx.conf

# configuration of nginx to work with react router
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx/nginx.conf /etc/nginx/conf.d

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
