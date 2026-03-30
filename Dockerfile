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
 
 
# Copy the rest of the application source code into the container
COPY . .
 
# Build the React.js application (outputs to /src/dist)
RUN npm run build
 
 
# =========================================
# Stage 2: Serve static files with Node.js + `serve`
# =========================================
FROM nginx:stable-alpine AS runner

# Copy the built files from the builder stage to Nginx's serve directory
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80 (Nginx default)
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]