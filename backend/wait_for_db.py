import socket
import time
import os
import sys

def get_db_host_port():
    # Priority 1: explicitly set WAIT_FOR_DB_HOST
    wait_host = os.environ.get('WAIT_FOR_DB_HOST')
    wait_port = os.environ.get('WAIT_FOR_DB_PORT', '3306')
    if wait_host:
        return wait_host, int(wait_port)
    
    # Priority 2: extract from DB_URL
    db_url = os.environ.get('DB_URL', '')
    if '://' in db_url:
        try:
            # e.g. jdbc:mysql://luxurystay-db:3306/luxurystay?...
            server_part = db_url.split('://')[1].split('/')[0]
            if ':' in server_part:
                host, port = server_part.split(':')
                return host, int(port)
            return server_part, 3306
        except Exception:
            pass

    # Priority 3: default to render internal service name.
    # NOTE: if DB_URL is not set on the web service, this default is used and it
    # will only resolve if the private MySQL service actually exists in the same
    # Render region. Set DB_URL/WAIT_FOR_DB_HOST on the service in production.
    return 'luxurystay-db', 3306

def main():
    host, port = get_db_host_port()
    wait_seconds = int(os.environ.get('DB_WAIT_SECONDS', '90'))
    print(f"Waiting for database to wake up at {host}:{port} (up to {wait_seconds}s)...", flush=True)

    last_error = None
    deadline = time.time() + wait_seconds
    while time.time() < deadline:
        try:
            with socket.create_connection((host, port), timeout=3):
                print("Database is awake and accepting connections!", flush=True)
                sys.exit(0)
        except Exception as e:
            last_error = e
            time.sleep(2)

    print("Timeout waiting for database to wake up.", flush=True)
    if last_error is not None:
        print(f"Last connection error: {type(last_error).__name__}: {last_error}", flush=True)
    sys.exit(1)

if __name__ == '__main__':
    main()
