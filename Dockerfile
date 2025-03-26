# Use Ubuntu 22.04 as the base image
FROM ubuntu:22.04

# Install essential packages and add NodeSource repository for Node.js v22.x
RUN apt-get update && \
    apt-get install -y curl build-essential python3 && \
    curl -fsSL https://deb.nodesource.com/setup_22.x | bash - && \
    apt-get install -y nodejs && \
    rm -rf /var/lib/apt/lists/*

# Verify Node.js and npm versions (optional)
RUN node --version && npm --version

# Install the TypeScript compiler globally (if needed)
RUN npm install -g typescript

# Set the working directory for the project
WORKDIR /app

# ---- Install Backend Dependencies ----
# Copy backend package files to leverage Docker cache
COPY backend/package*.json ./backend/
WORKDIR /app/backend
RUN npm install

# Install Fastify static plugin (if it's not already listed in package.json)
RUN npm install @fastify/static

# ---- Copy the Full Project ----
WORKDIR /app
COPY . .

# ---- Build the googleauth TypeScript Files ----
# Compile the TS files in the googleauth folder into a 'dist' directory
# RUN tsc googleauth/*.ts --outDir googleauth/dist

# Expose the port your Node.js app listens on (adjust if needed)
EXPOSE 5000

# Start the backend server (adjust the entry point if necessary)
CMD ["node", "backend/src/server.js"]

# docker build -t transcendence .
# docker run -p 5000:5000 transcendence
# http://[::1]:5000/
# docker stop $(docker ps -q)
# docker rm $(docker ps -aq)
# docker rmi $(docker images -q)
# docker volume prune -f
