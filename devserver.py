#!/usr/bin/env python3
"""
Local dev server for IPTV Player.
Serves static files AND proxies playlist requests to avoid CORS issues.
Uses public DNS (8.8.8.8) to bypass ISP-level domain blocks.

Usage: python3 devserver.py
Then open http://localhost:8080
"""

import http.server
import http.client
import urllib.request
import urllib.parse
import urllib.error
import ssl
import socket
import os
import sys

PORT = 8080
PROJECT_DIR = os.path.dirname(os.path.abspath(__file__))
PUBLIC_DNS = '8.8.8.8'

# Allow insecure SSL (some IPTV servers have bad certs)
ssl_ctx = ssl.create_default_context()
ssl_ctx.check_hostname = False
ssl_ctx.verify_mode = ssl.CERT_NONE


def resolve_via_public_dns(hostname):
    """Resolve hostname using Google's public DNS to bypass ISP blocks."""
    import subprocess
    try:
        result = subprocess.run(
            ['dig', '+short', f'@{PUBLIC_DNS}', hostname, 'A'],
            capture_output=True, text=True, timeout=5
        )
        for line in result.stdout.strip().split('\n'):
            line = line.strip()
            # Return the first valid IP address
            if line and all(c.isdigit() or c == '.' for c in line):
                print(f'[DNS] {hostname} → {line} (via {PUBLIC_DNS})')
                return line
    except Exception as e:
        print(f'[DNS] dig failed for {hostname}: {e}')

    # Fallback to system DNS
    print(f'[DNS] Falling back to system DNS for {hostname}')
    return socket.gethostbyname(hostname)


class DevHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=PROJECT_DIR, **kwargs)

    def do_GET(self):
        if self.path.startswith('/proxy?url='):
            self.proxy_request()
        else:
            super().do_GET()

    def proxy_request(self):
        parsed = urllib.parse.urlparse(self.path)
        params = urllib.parse.parse_qs(parsed.query)
        url = params.get('url', [''])[0]

        if not url:
            self.send_response(400)
            self.end_headers()
            self.wfile.write(b'Missing url parameter')
            return

        print(f'[Proxy] Fetching: {url}')
        try:
            # Parse the target URL and resolve via public DNS
            target = urllib.parse.urlparse(url)
            hostname = target.hostname
            port = target.port or (443 if target.scheme == 'https' else 80)
            ip = resolve_via_public_dns(hostname)

            # Build the URL with IP instead of hostname
            ip_url = url.replace(f'{target.scheme}://{target.netloc}',
                                 f'{target.scheme}://{ip}')

            req = urllib.request.Request(ip_url, headers={
                'User-Agent': 'Mozilla/5.0 (SMART-TV; Tizen 7.0)',
                'Accept': '*/*',
                'Host': hostname,  # Original hostname in Host header
            })
            with urllib.request.urlopen(req, timeout=30, context=ssl_ctx) as resp:
                data = resp.read()
                self.send_response(200)
                self.send_header('Content-Type', resp.headers.get('Content-Type', 'text/plain'))
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(data)
                print(f'[Proxy] OK — {len(data)} bytes')
        except Exception as e:
            print(f'[Proxy] Error: {e}')
            self.send_response(502)
            self.send_header('Content-Type', 'text/plain')
            self.end_headers()
            self.wfile.write(str(e).encode())


if __name__ == '__main__':
    print(f'IPTV Dev Server running at http://localhost:{PORT}')
    print(f'Serving files from {PROJECT_DIR}')
    print(f'Using public DNS: {PUBLIC_DNS}')
    print('Press Ctrl+C to stop\n')
    server = http.server.HTTPServer(('', PORT), DevHandler)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print('\nStopped.')
