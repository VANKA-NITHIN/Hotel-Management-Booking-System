#!/bin/bash
if [ -n "$WAIT_FOR_DB_HOST" ]; then
  echo "Waiting for database at $WAIT_FOR_DB_HOST:${WAIT_FOR_DB_PORT:-3306}..." >> app.log
  python3 -c "
import socket, time, os, sys
host = os.environ.get('WAIT_FOR_DB_HOST')
port = int(os.environ.get('WAIT_FOR_DB_PORT', '3306'))
print(f'Waiting for {host}:{port}...\)
for _ in range(60):
    try:
        with socket.create_connection((host, port), timeout=2):
            print('Connected!\)
            sys.exit(0)
    except Exception:
        time.sleep(2)
print('Timeout waiting for DB\)
" >> app.log 2>&1
fi
java -Xmx300m -jar app.jar >> app.log 2>&1
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
  echo "Spring Boot failed with exit code $EXIT_CODE. Starting Python HTTP Server..." >> app.log
  python3 -m http.server ${PORT:-8080}
fi

