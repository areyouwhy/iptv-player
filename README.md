# IPTV Player — Samsung Tizen TV App

Matrix-themed IPTV player for Samsung Smart TVs running Tizen OS. Supports live TV, series, movies, live football scores, and multiple user accounts/profiles.

**Version:** 1.0
**Target:** Samsung Tizen TV (3.0+)
**Package ID:** `iPlayerTV0.IPTVPlayer`


## New Mac Setup

### 1. Install prerequisites

```bash
# Homebrew (if not installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Python 3 (usually pre-installed on macOS, but just in case)
brew install python3

# Git
brew install git

# Python packages (for PDF guide generation and channel export)
pip3 install reportlab openpyxl
```

### 2. Install Tizen Studio

Tizen Studio is Samsung's IDE and CLI toolkit for building and deploying TV apps.

1. Download from: https://developer.tizen.org/development/tizen-studio/download
2. Pick the **macOS** installer (`.dmg`)
3. Run the installer — default install location is `~/tizen-studio`
4. After install, open **Tizen Package Manager** and install:
   - **Tizen SDK tools**
   - **TV Extensions** (Samsung certificate and emulator)
   - **TV Extensions Tools**
5. Add tools to your shell PATH — add this to `~/.zshrc`:
   ```bash
   export PATH="$HOME/tizen-studio/tools/ide/bin:$HOME/tizen-studio/tools:$PATH"
   ```
   Then `source ~/.zshrc`

### 3. Set up Samsung certificate

You need a signing certificate to deploy to a physical TV.

1. Open **Tizen Studio > Tools > Certificate Manager**
2. Create a **Samsung certificate profile** (not Tizen)
3. Name it `IPTVProfile` (this name is referenced in `deploy.sh`)
4. Follow the wizard — you'll need a Samsung developer account:
   - Register at https://developer.samsung.com
   - Sign in during certificate creation
5. The certificate gets stored in `~/tizen-studio-data/profile/`

### 4. Clone the project

```bash
cd ~
git clone https://github.com/areyouwhy/iptv-player.git
cd iptv-player
```

### 5. Enable developer mode on the TV

1. On the Samsung TV, go to **Settings > General > System Manager**
2. Open **Developer Mode** (you may need to enter `12345` on the Apps screen first)
3. Set the **Host PC IP** to your Mac's local IP address
4. Restart the TV

### 6. Connect to the TV

```bash
# Find your TV's IP in Settings > General > Network > Network Status
sdb connect 192.168.50.133
sdb devices   # confirm it shows your TV
```

If `sdb` is not found, ensure Tizen Studio tools are in your PATH (step 2.5).

### 7. Update the TV IP (if different)

Edit `deploy.sh` and change the IP on line 7:
```bash
TV=192.168.50.133:26101
```

Replace `192.168.50.133` with your TV's actual IP.


## Project Structure

```
iptv-player/
├── index.html              # Main app HTML (entry point)
├── profile.html            # Profile/account selection screen
├── config.xml              # Tizen app manifest (privileges, app ID)
├── icon.png                # App icon
│
├── css/
│   └── style.css           # All styles (Matrix green theme, ~1500 lines)
│
├── js/
│   ├── app.js              # Main app logic (~4200 lines)
│   ├── player.js           # AVPlay video player wrapper
│   ├── xtream.js           # Xtream Codes API client
│   ├── playlist.js         # M3U playlist parser
│   ├── football.js         # football-data.org API client (scores, standings)
│   ├── tagger.js           # Channel category tagging/filtering
│   └── qrcode.min.js       # QR code library (for profile setup)
│
├── fonts/
│   ├── MatrixSansVideo-Regular.ttf
│   └── MatrixSansVideo-Regular.woff2
│
├── assets/
│   └── welcome_img.jpg
│
├── data/
│   └── test.m3u            # Test playlist for browser development
│
├── deploy.sh               # Build + package + install + run (one command)
├── dev-server.py           # Local dev server with API proxy (port 8080)
├── devserver.py             # Alternate dev server
├── extract-channels.py     # Export all channels to Excel from Xtream API
├── generate-guide.py       # Generate the PDF user guide
│
├── IDEAS.md                # Feature ideas backlog
├── IPTV-Player-Guide.pdf   # Generated user guide (v1.0)
├── channels-export.xlsx    # Exported channel list
└── .gitignore
```


## Daily Development Workflow

### Option A: Develop in browser (fastest iteration)

```bash
cd ~/iptv-player
python3 dev-server.py
```

Open `http://localhost:8080` in Chrome. The dev server proxies Xtream API calls to avoid CORS issues. Use keyboard arrow keys to simulate the TV remote. The app includes browser stubs for Tizen-only APIs (AVPlay, tvinputdevice).

### Option B: Deploy directly to TV

```bash
cd ~/iptv-player
./deploy.sh
```

This single command: builds → packages (.wgt) → connects to TV → installs → launches.


## Accounts & Profiles

The app has a two-level system:

**Accounts** (3 IPTV logins):
- `ruy` — username: `9b1f6b5188`
- `mama` — username: `eb47f5e8c5`
- `mattias` — username: `a9de3d71b8`

**Profiles** (shared across all accounts):
- `fotball` — sports-focused categories
- `tv` — general TV channels
- `movies` — movies and series (VOD)

Account credentials are in `js/app.js` in the `ACCOUNTS` array. Profile definitions (category filters, excludes) are also in `app.js`.


## API Keys

### football-data.org (live scores & standings)
- Key: `23bcec11f9a240e1a9292c7eca18c4ea`
- Free tier: 10 requests/minute, top European leagues
- Used in: `js/football.js`
- Docs: https://www.football-data.org/documentation/api

### Xtream Codes (IPTV streams)
- Credentials are per-account (see Accounts section above)
- Server URL is configured in `js/xtream.js`


## Key Technical Notes

### Tizen remote key codes
```
OK/Enter: 13          Back: 10009
Up: 38                Down: 40
Left: 37              Right: 39
Red: 403              Green: 404
Yellow: 405           Blue: 406
Play: 415             Pause: 19
PlayPause: 10252      Stop: 413
Rewind: 412           FastForward: 417
ChannelUp: 427        ChannelDown: 428
```

Keys like MediaRewind, MediaFastForward, ChannelUp, ChannelDown must be explicitly registered with `tizen.tvinputdevice.registerKey()` — see app.js init section.

### AVPlay (video playback)
Samsung's proprietary media player API. Wrapped in `js/player.js`. Supports HLS/MPEG-TS streams and VOD with seek. The HTML5 `<video>` element is NOT used — AVPlay is required for reliable TV playback.

### Browser vs TV differences
`index.html` includes browser stubs at the bottom (`<script>` block) that mock `webapis.avplay`, `tizen.tvinputdevice`, and `tizen.application` so the app runs in Chrome for development. These stubs are ignored on the actual TV where the real APIs exist.


## Regenerating the PDF Guide

```bash
cd ~/iptv-player
pip3 install reportlab    # if not installed
python3 generate-guide.py
```

Outputs `IPTV-Player-Guide.pdf` in the project root.


## Exporting Channel List

Must be run from the same network as the TV (the Xtream API is IP-locked):

```bash
cd ~/iptv-player
pip3 install openpyxl     # if not installed
python3 extract-channels.py
```

Outputs `channels-export.xlsx`.


## Git

```bash
# Repo
git remote: https://github.com/areyouwhy/iptv-player.git

# Typical workflow
git add -A
git commit -m "description of changes"
git push origin main
```


## Troubleshooting

### "sdb not found"
Tizen Studio tools not in PATH. Add to `~/.zshrc`:
```bash
export PATH="$HOME/tizen-studio/tools/ide/bin:$HOME/tizen-studio/tools:$PATH"
```

### Deploy fails with "certificate error"
The signing certificate (`IPTVProfile`) is machine-specific. You need to create a new certificate on each Mac via Certificate Manager (step 3 above).

### "Cannot connect to TV"
- Ensure Developer Mode is on and your Mac's IP is set as the Host PC IP on the TV
- TV and Mac must be on the same local network
- Try restarting Developer Mode on the TV
- Default port is 26101

### App installs but shows black screen
- Check the TV's IP hasn't changed (DHCP). Update `deploy.sh` if needed
- Open the TV's debug console: `http://<TV-IP>:7011` in Chrome for DevTools

### CORS errors in browser dev
Use `dev-server.py` instead of opening `index.html` directly — it proxies API calls.

### football-data.org rate limit
Free tier allows 10 requests/minute. The app caches responses (5 min for scores, 30 min for standings) to stay within limits. If you see "Rate limited" errors, just wait a minute.
