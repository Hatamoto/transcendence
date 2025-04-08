#!/bin/bash
export HOST_LAN_IP=$(ip route get 1 | awk 'NF>=3 {print $(NF-2)}')

echo "Using LAN IP: $HOST_LAN_IP"

# Start Docker Compose with it
HOST_LAN_IP=$HOST_LAN_IP docker compose build
HOST_LAN_IP=$HOST_LAN_IP docker compose up