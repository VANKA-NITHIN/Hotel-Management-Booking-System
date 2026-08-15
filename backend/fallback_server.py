"""
Emergency fallback HTTP server.

Runs only when Spring Boot fails to start (e.g. the database is unreachable).
Returns a JSON 503 "service unavailable" response for every route with proper
CORS headers, so the frontend gets a clean, circuit-breaker-friendly error
instead of 404s and failed CORS preflights.

Serves NO files - the previous `python3 -m http.server` fallback publicly
exposed app.jar, app.log and the startup scripts (an information leak).
"""
import json
import os
from http.server import BaseHTTPRequestHandler, HTTPServer

BODY = json.dumps({
    "status": "DOWN",
    "error": "Backend service is temporarily unavailable. Please try again later.",
}).encode("utf-8")

CORS_HEADERS = [
    ("Access-Control-Allow-Origin", "*"),
    ("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS"),
    ("Access-Control-Allow-Headers", "Content-Type, Authorization, Accept-Language"),
]


class FallbackHandler(BaseHTTPRequestHandler):
    def _respond(self):
        self.send_response(503)
        self.send_header("Content-Type", "application/json")
        self.send_header("Cache-Control", "no-store")
        for name, value in CORS_HEADERS:
            self.send_header(name, value)
        self.send_header("Content-Length", str(len(BODY)))
        self.end_headers()
        self.wfile.write(BODY)

    def do_GET(self):
        self._respond()

    def do_POST(self):
        self._respond()

    def do_PUT(self):
        self._respond()

    def do_DELETE(self):
        self._respond()

    def do_PATCH(self):
        self._respond()

    def do_OPTIONS(self):
        # Satisfy CORS preflight so the browser never turns this into a network error.
        self.send_response(204)
        for name, value in CORS_HEADERS:
            self.send_header(name, value)
        self.send_header("Access-Control-Max-Age", "3600")
        self.end_headers()

    def log_message(self, format, *args):
        # Keep quiet: this server only runs when the backend is already down.
        pass


if __name__ == "__main__":
    port = int(os.environ.get("PORT", "8080"))
    HTTPServer(("0.0.0.0", port), FallbackHandler).serve_forever()
