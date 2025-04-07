#!/bin/bash
export HOST_LAN_IP=$(ip route get 1 | awk 'NF>=3 {print $(NF-2)}')

# Detect the OS
OS=$(uname)

if [ "$OS" == "Darwin" ]; then
    # macOS
    export HOST_LAN_IP="localhost"
else
    # Linux
    export HOST_LAN_IP=$(ip route get 1 | awk '{print $(NF-2)}')
fi

echo "Using HOST_LAN_IP: $HOST_LAN_IP"

# Run Docker Compose with this as environment
# HOST_LAN_IP=$HOST_LAN_IP docker compose up --build

if [ "$OS" == "Darwin" ]; then
	echo "Running on macOS"
	HOST_LAN_IP=$HOST_LAN_IP docker compose -f docker-compose.osx.yml up --build
else
	echo "Running on Linux"
	HOST_LAN_IP=$HOST_LAN_IP docker compose -f docker-compose.linux.yml up --build
fi