#!/bin/bash
set -e  # Exit immediately if a command exits with a non-zero status

# Install backend dependencies
echo "Installing backend dependencies..."
(cd backend && npm install)

(cd ..)
# Install frontend dependencies
echo "Installing frontend dependencies..."
(cd frontend && npm install)

(cd ..)
# Build the frontend (compiles TypeScript and processes Tailwind)
echo "Building frontend..."
(cd backend && npm run build)

(pwd)
# Start the backend development server (which may also run the frontend as needed)
echo "Starting development server for backend..."
npm run dev --prefix backend

docker run -it -p 5001:5001 \
   -p 57924-62542:7924-12542/udp \
   transcendence
