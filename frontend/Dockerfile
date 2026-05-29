# FROM https://www.docker.com/blog/how-to-dockerize-react-app/
# =========================================
# Stage 1: Build the React (Vite) Application
# =========================================
 
ARG NODE_VERSION=24.14.0-alpine
# Use a lightweight Node.js image for building (customizable via ARG)
FROM node:${NODE_VERSION} AS builder
 
 
# Set the working directory inside the container
WORKDIR /app
 
 
# Copy package-related files first to leverage Docker's caching mechanism
COPY package.json package-lock.json ./
 
 
# Install project dependencies using npm ci (ensures a clean, reproducible install)
RUN --mount=type=cache,target=/root/.npm npm ci

# Args from docker-compose for Vite
ARG VITE_API_BASE_URL
ARG VITE_GEOAPIFY_API_KEY
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_GEOAPIFY_API_KEY=$VITE_GEOAPIFY_API_KEY

 
# Copy the rest of the application source code into the container
COPY . .
 
# Build the React.js application (outputs to /src/dist)
RUN npm run build
 
 
# =========================================
# Stage 2: Serve static files with Nginx + SSL/TLS
# =========================================
FROM nginx:stable-alpine AS runner

# Copy the built files from the builder stage to Nginx's serve directory
COPY --from=builder /app/dist /usr/share/nginx/html

# nginx config
COPY nginx/default.conf.template /etc/nginx/templates/default.conf.template

# SLL
RUN mkdir -p /etc/nginx/ssl
COPY nginx/nginx-selfsigned.crt /etc/nginx/ssl/nginx-selfsigned.crt
COPY nginx/nginx-selfsigned.key /etc/nginx/ssl/nginx-selfsigned.key

# Expose port 80 (HTTP) and 443 (HTTPS)
EXPOSE 80 443

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]