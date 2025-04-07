# Base image - lightweight Ubuntu
FROM node:20-bullseye-slim

# Needed for build-time replacement
ARG HOST_LAN_IP
ENV HOST_LAN_IP=$HOST_LAN_IP

# Set working directory
WORKDIR /app

# Install curl for entrypoint
RUN apt-get update && apt-get install -y curl

RUN npm update

# Copy only existing package.json and lock files
# Use a wildcard to include package-lock.json if it exists
COPY ./backend/package*.json ./backend/
COPY ./frontend/package*.json ./frontend/

# Install dependencies separately for caching
RUN cd backend && npm install
RUN cd frontend && npm install

# Copy full source code after dependencies
COPY . .

# Make entrypoint script executable and copy it
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Set entrypoint
ENTRYPOINT ["/entrypoint.sh"]

# Expose port used by Fastify
EXPOSE 5001

# Default CMD (can be overridden)
CMD ["npm", "run", "start", "--prefix", "backend"]
