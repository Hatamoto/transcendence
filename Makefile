include backend/.env

.PHONY: dev

# Default target
all: detect_os dockerbuild

# Detect the OS and set HOST_LAN_IP
detect_os:
	$(eval OS=$(shell uname))
	$(eval HOST_LAN_IP=$(shell if [ "$(OS)" = "Darwin" ]; then echo "localhost"; else ip route get 1.1.1.1 | awk '/src/ {print $$7}'; fi))
	@echo "HOST_LAN_IP is set to: $(HOST_LAN_IP)"

devbuild:
		@cd ./frontend && npm install && npm run tailwind
		@cd ./backend && npm install
		@cd ./backend/server && npm install
		@cd ./backend/authentication_server && npm install

# run without docker
dev: detect_os
	@cp frontend/src/config/env-config.template.ts frontend/src/config/env-config.ts
	echo "STUN_URL: ${STUN_URL}" && \
  	sed -i \
	-e "s|__STUN_URL__|${STUN_URL}|g" \
	-e "s|__TURN_URL__|${TURN_URL}|g" \
	-e "s|__TURN_USER__|${TURN_USER}|g" \
	-e "s|__TURN_PASS__|${TURN_PASS}|g" \
	-e "s|__EXT_IP__|${HOST_LAN_IP}|g" \
	frontend/src/config/env-config.ts
	@trap 'cp frontend/src/config/env-config.template.ts frontend/src/config/env-config.ts' INT; \
	turnserver -c turnserver.conf > turn.out 2>&1 & \
	cd ./frontend && npm run dev & \
	cd ./backend && npm run dev & \
	wait


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
		docker system prune -a --volumes
# full clean
fclean: dockerclean devclean
	@echo "CLEANED EVERYTHING!!!!!"


#dev: detect_os
#@turnserver -c turnserver.conf > turn.out 2>&1 & \
##export $(grep -v '^#' backend/.env | xargs)
##@cp frontend/src/config/env-config.template.ts frontend/src/config/env-config.ts
##@sed -i \
##-e "s|__STUN_URL__|${STUN_URL}|g" \
##-e "s|__TURN_URL__|${TURN_URL}|g" \
##-e "s|__TURN_USER__|${TURN_USER}|g" \
##-e "s|__TURN_PASS__|${TURN_PASS}|g" \
##-e "s|__EXT_IP__|${HOST_LAN_IP}|g" \
##frontend/src/config/env-config.ts
##@cd ./frontend && npm run dev
##@cd ./backend && npm run dev