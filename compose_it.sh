#!/bin/bash
export HOST_LAN_IP=$(ip route get 1 | awk '{print $(NF-2)}')

echo "Using LAN IP: $HOST_LAN_IP"

# Start Docker Compose with it
HOST_LAN_IP=$HOST_LAN_IP docker compose up --build