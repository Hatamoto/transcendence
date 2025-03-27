#!/bin/bash

OS=$(uname)
if [ "$OS" = "Darwin" ]; then
	docker compose -f docker-compose.osx.yml down --remove-orphans
else
	docker compose -f docker-compose.linux.yml down --remove-orphans
fi
