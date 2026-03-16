#!/usr/bin/env python3
"""
Local dev server for testing the IPTV app in a browser.
Serves static files + proxies API calls to avoid CORS issues.

Usage:  python3 dev-server.py
Then:   open http://localhost:8080
"""

import http.server
import urllib.request
import json
import sys

PORT = 8080

class DevHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        # Proxy Xtream API calls: /api/HOST/rest-of-path → http://HOST/rest-of-path
        if self.path.startswith('/api/'):
            self.proxy_api()
            return
        # Proxy football-data.org calls
        if self.path.startswith('/football-api/'):
            self.proxy_football()
            return
        # Serve static files normally
        super().do_GET()

    def proxy_api(self):
        # /api/my8k.site/player_api.php?... → http://my8k.site/player_api.php?...
        rest = self.path[5:]  # strip "/api/"
        slash = rest.find('/')
        if slash == -1:
            self.send_error(400, 'Bad proxy path')
            return
        host = rest[:slash]
        path = rest[slash:]
        url = 'http://' + host + path
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req, timeout=20) as resp:
                data = resp.read()
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(data)
        except Exception as e:
            self.send_response(502)
            self.send_header('Content-Type', 'text/plain')
            self.end_headers()
            self.wfile.write(str(e).encode())

    def proxy_football(self):
        # /football-api/v4/matches?... → https://api.football-data.org/v4/matches?...
        rest = self.path[14:]  # strip "/football-api/"
        url = 'https://api.football-data.org/' + rest
        token = self.headers.get('X-Auth-Token', '')
        try:
            req = urllib.request.Request(url, headers={
                'X-Auth-Token': token,
                'User-Agent': 'Mozilla/5.0'
            })
            with urllib.request.urlopen(req, timeout=15) as resp:
                data = resp.read()
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(data)
        except Exception as e:
            self.send_response(502)
            self.send_header('Content-Type', 'text/plain')
            self.end_headers()
            self.wfile.write(str(e).encode())

    def log_message(self, format, *args):
        # Quieter logging — only show API proxies and errors
        msg = format % args
        if '/api/' in msg or '/football-api/' in msg or '404' in msg or '500' in msg:
            print(msg)

if __name__ == '__main__':
    print(f'Dev server at http://localhost:{PORT}')
    print(f'Open in Chrome and use keyboard arrows to navigate')
    print(f'Press Ctrl+C to stop\n')
    server = http.server.HTTPServer(('', PORT), DevHandler)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print('\nStopped.')
