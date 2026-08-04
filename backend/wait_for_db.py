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
            
    # Priority 3: default to render internal service name
    return 'luxurystay-db', 3306

def main():
    host, port = get_db_host_port()
    print(f"Waiting for database to wake up at {host}:{port}...", flush=True)
    
    # Try for up to 60 seconds (Render free databases take 30-40s to wake up)
    for _ in range(60):
        try:
            with socket.create_connection((host, port), timeout=2):
                print("Database is awake and accepting connections!", flush=True)
                sys.exit(0)
        except Exception:
            time.sleep(2)
            
    print("Timeout waiting for database to wake up.", flush=True)
    sys.exit(1)

if __name__ == '__main__':
    main()
