# Base image - lightweight Ubuntu
FROM node:20-bullseye-slim

# Set working directory
WORKDIR /app

# Copy only existing package.json and lock files
# Use a wildcard to include package-lock.json if it exists
COPY ./backend/package*.json ./backend/
COPY ./frontend/package*.json ./frontend/

# Install dependencies separately for caching
RUN cd backend && npm install
RUN cd frontend && npm install

# Copy full source code after dependencies
COPY . .

# Build the frontend (compiles TypeScript and processes Tailwind)
RUN cd frontend && npm run build

# Expose the port your Fastify app runs on
EXPOSE 5000

# Command to run both frontend and backend together
CMD ["npm", "run", "dev", "--prefix", "backend"]
