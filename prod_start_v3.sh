#!/bin/bash
python3 /app/wait_for_db.py >> app.log 2>&1
java -Xmx300m -jar app.jar >> app.log 2>&1
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
  echo "Spring Boot failed with exit code $EXIT_CODE. Starting Python HTTP Server..." >> app.log
  python3 -m http.server ${PORT:-8080}
fi

