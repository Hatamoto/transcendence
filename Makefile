# Default target
all: detect_os dockerbuild

# Detect the OS and set HOST_LAN_IP
detect_os:
	$(eval OS=$(shell uname))
	$(eval HOST_LAN_IP=$(shell if [ "$(OS)" == "Darwin" ]; then echo "localhost"; else ip route get 1 | awk 'NF>=3 {print $$NF}'; fi))
	@echo "HOST_LAN_IP is set to: $(HOST_LAN_IP)"

devbuild:
		@cd ./frontend && npm install && npm run tailwind
		@cd ./backend && npm install
		@cd ./backend/server && npm install
		@cd ./backend/authentication_server && npm install

# run without docker
dev:
	@cd ./frontend && npm run build
	@cd ./backend && npm run dev

# run with docker
dockerstart: detect_os
	@if [ "$(OS)" == "Darwin" ]; then \
		echo "Running on macOS"; \
		HOST_LAN_IP=$(HOST_LAN_IP) docker compose -f docker-compose.osx.yml up; \
	else \
		echo "Running on Linux"; \
		HOST_LAN_IP=$(HOST_LAN_IP) docker compose -f docker-compose.linux.yml up; \
	fi

# build docker
dockerbuild: detect_os
	@if [ "$(OS)" == "Darwin" ]; then \
		echo "Running on macOS"; \
		HOST_LAN_IP=$(HOST_LAN_IP) docker compose -f docker-compose.osx.yml up --build; \
	else \
		echo "Running on Linux"; \
		HOST_LAN_IP=$(HOST_LAN_IP) docker compose -f docker-compose.linux.yml up --build; \
	fi


# clean dev
devclean:
		@cd ./frontend && rm -rf node_modules package-lock.json dist output.css
		@cd ./backend && rm -rf node_modules package-lock.json
		@cd ./backend/server && rm -rf node_modules package-lock.json
		@cd ./backend/authentication_server && rm -rf node_modules package-lock.json

# clean docker
dockerclean:
		docker system prune -a --volumes -y

# full clean
fclean: dockerclean devclean
	echo "CLEANED EVERYTHING!!!!!"