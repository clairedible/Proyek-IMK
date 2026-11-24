#!/usr/bin/env python3
"""Server lokal untuk V2: selalu ambil file terbaru dari disk.

Cara pakai:
    python3 serve.py

Lalu buka http://localhost:8445

Bedanya dengan `python3 -m http.server`:
- Semua respons dikirim dengan Cache-Control: no-store
- Jadi setelah Ctrl+S di VS Code, cukup refresh browser (Cmd/Ctrl+R)
"""

from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

PORT = 8445


class NoCacheHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()

    def log_message(self, fmt, *args):
        # tetap tampilkan log, tapi ringkas
        super().log_message(fmt, *args)


if __name__ == "__main__":
    print(f"V2 local server -> http://localhost:{PORT}")
    print("Ctrl+C untuk berhenti.")
    ThreadingHTTPServer(("0.0.0.0", PORT), NoCacheHandler).serve_forever()
