#!/usr/bin/env python3
"""Generate the IPTV Player user guide PDF."""

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm, cm
from reportlab.lib.colors import HexColor, white, black
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, KeepTogether, HRFlowable
)
from reportlab.pdfgen import canvas

# ── Colours ──
BG = HexColor("#0a0a0a")
GREEN = HexColor("#00ff41")
DIM_GREEN = HexColor("#338a4e")
DARK_BG = HexColor("#111111")
PANEL_BG = HexColor("#161616")
WHITE = HexColor("#f0f0f0")
GREY = HexColor("#888888")
ACCENT = HexColor("#00cc33")

W, H = A4

# ── Styles ──
sTitle = ParagraphStyle("title", fontName="Helvetica-Bold", fontSize=28,
                        textColor=GREEN, leading=34, alignment=TA_LEFT,
                        spaceAfter=4*mm)

sSubtitle = ParagraphStyle("subtitle", fontName="Helvetica", fontSize=12,
                           textColor=DIM_GREEN, leading=16, alignment=TA_LEFT,
                           spaceAfter=8*mm)

sH1 = ParagraphStyle("h1", fontName="Helvetica-Bold", fontSize=18,
                      textColor=GREEN, leading=24, spaceBefore=10*mm,
                      spaceAfter=5*mm)

sH2 = ParagraphStyle("h2", fontName="Helvetica-Bold", fontSize=13,
                      textColor=ACCENT, leading=18, spaceBefore=6*mm,
                      spaceAfter=3*mm)

sBody = ParagraphStyle("body", fontName="Helvetica", fontSize=10,
                        textColor=WHITE, leading=15, spaceAfter=3*mm)

sBodyDim = ParagraphStyle("bodyDim", fontName="Helvetica", fontSize=9,
                           textColor=GREY, leading=13, spaceAfter=2*mm)

sKey = ParagraphStyle("key", fontName="Courier-Bold", fontSize=10,
                       textColor=GREEN, leading=14)

sDesc = ParagraphStyle("desc", fontName="Helvetica", fontSize=10,
                        textColor=WHITE, leading=14)

sMono = ParagraphStyle("mono", fontName="Courier", fontSize=9,
                        textColor=GREEN, leading=13, leftIndent=8*mm)

sBullet = ParagraphStyle("bullet", fontName="Helvetica", fontSize=10,
                          textColor=WHITE, leading=15, leftIndent=6*mm,
                          spaceAfter=1.5*mm, bulletIndent=0,
                          bulletFontName="Helvetica", bulletFontSize=10,
                          bulletColor=GREEN)

sSmall = ParagraphStyle("small", fontName="Helvetica", fontSize=8,
                         textColor=GREY, leading=11)


def bg_canvas(canvas_obj, doc):
    """Draw dark background on every page."""
    canvas_obj.saveState()
    canvas_obj.setFillColor(BG)
    canvas_obj.rect(0, 0, W, H, fill=1, stroke=0)
    # Footer
    canvas_obj.setFont("Helvetica", 7)
    canvas_obj.setFillColor(DIM_GREEN)
    canvas_obj.drawString(20*mm, 10*mm, "ruy.se  ·  IPTV Player v1.0")
    canvas_obj.drawRightString(W - 20*mm, 10*mm, f"page {doc.page}")
    canvas_obj.restoreState()


def green_line():
    return HRFlowable(width="100%", thickness=0.5, color=DIM_GREEN,
                      spaceAfter=4*mm, spaceBefore=2*mm)


def key_row(key, desc):
    """Create a two-column row for remote control mappings."""
    return [Paragraph(key, sKey), Paragraph(desc, sDesc)]


def bullet(text):
    return Paragraph(f"&gt;  {text}", sBullet)


def build():
    doc = SimpleDocTemplate(
        "/sessions/ecstatic-intelligent-volta/mnt/iptv-player/IPTV-Player-Guide.pdf",
        pagesize=A4,
        leftMargin=20*mm, rightMargin=20*mm,
        topMargin=18*mm, bottomMargin=18*mm
    )

    story = []

    # ════════════════════════════════════════
    # COVER / TITLE
    # ════════════════════════════════════════
    story.append(Spacer(1, 25*mm))
    story.append(Paragraph("IPTV Player", sTitle))
    story.append(Paragraph("Samsung Tizen TV  ·  Matrix-themed  ·  User Guide", sSubtitle))
    story.append(green_line())
    story.append(Spacer(1, 5*mm))

    story.append(Paragraph(
        "A custom-built IPTV application for Samsung Smart TVs running Tizen OS. "
        "Built as a web app (.wgt package) that connects to Xtream Codes IPTV providers, "
        "featuring live TV, VOD series browsing, VOD movie browsing, live football scores, "
        "picture-in-picture, subtitle support, multi-account login, and a dual-panel "
        "fullscreen experience all wrapped in a Matrix-inspired green-on-black interface.",
        sBody
    ))

    story.append(Spacer(1, 8*mm))

    # Tech summary table
    tech_data = [
        [Paragraph("Platform", sKey), Paragraph("Samsung Tizen TV (web app / .wgt)", sDesc)],
        [Paragraph("API", sKey), Paragraph("Xtream Codes (player_api.php)", sDesc)],
        [Paragraph("Player", sKey), Paragraph("Samsung AVPlay (primary) + HTML5 &lt;video&gt; (PiP)", sDesc)],
        [Paragraph("Scores", sKey), Paragraph("football-data.org API (PL, La Liga, Serie A, UCL)", sDesc)],
        [Paragraph("UI theme", sKey), Paragraph("Matrix-style: #00ff41 green on #0a0a0a black", sDesc)],
    ]
    t = Table(tech_data, colWidths=[35*mm, 125*mm])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), DARK_BG),
        ('TEXTCOLOR', (0, 0), (-1, -1), WHITE),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('GRID', (0, 0), (-1, -1), 0.3, DIM_GREEN),
    ]))
    story.append(t)

    # ════════════════════════════════════════
    # ACCOUNTS & PROFILES
    # ════════════════════════════════════════
    story.append(Paragraph("Accounts &amp; Profiles", sH1))
    story.append(green_line())

    story.append(Paragraph("Account Picker", sH2))
    story.append(Paragraph(
        "On first launch the app presents an account picker screen. Each account holds "
        "a set of Xtream Codes credentials (username/password). The selected account is "
        "remembered across sessions via localStorage, so you only need to pick once unless "
        "you switch. Press BACK on the account picker to quit the app.",
        sBody
    ))

    story.append(Paragraph("Profile Picker", sH2))
    story.append(Paragraph(
        "After choosing an account, the profile picker appears. Profiles define what content "
        "you see and how it behaves — each has its own saved searches, category filters, "
        "and feature set. The same set of profiles is available regardless of which account "
        "is active. Press BACK on the profile picker to return to the account picker.",
        sBody
    ))

    story.append(Paragraph("fotball", sH2))
    story.append(Paragraph(
        "Live sports channels filtered by region (Sweden, Spain, UK). Comes with pre-loaded "
        "searches for viaplay, tv4, csb, dazn, and movistar. "
        "Has live football scores integration with clickable competitions and matches.",
        sBody
    ))

    story.append(Paragraph("tv", sH2))
    story.append(Paragraph(
        "Live TV channels plus VOD series browsing. Filtered for Swedish, Nordic, UK, and US content. "
        "Pre-loaded searches: svt, tv4, kanal. "
        "The series browser lets you navigate categories, shows, seasons, and episodes.",
        sBody
    ))

    story.append(Paragraph("movies", sH2))
    story.append(Paragraph(
        "Live TV channels plus VOD movie browsing. Filtered for Swedish, Nordic, UK, and US content. "
        "The movie browser lets you navigate categories, then browse movies within a category and play them. "
        "Movies are also browsable from the left overlay while watching fullscreen.",
        sBody
    ))

    story.append(Paragraph("quit", sH2))
    story.append(Paragraph(
        "Closes the application.",
        sBodyDim
    ))

    # ════════════════════════════════════════
    # SCREENS
    # ════════════════════════════════════════
    story.append(PageBreak())
    story.append(Paragraph("Screens &amp; Navigation", sH1))
    story.append(green_line())

    # Account Picker
    story.append(Paragraph("Account Picker", sH2))
    story.append(Paragraph(
        "Shown on first launch (or when no saved account exists). Displays available accounts "
        "in a centered box. Navigate with UP/DOWN, select with OK. "
        "Your choice is saved to localStorage so you skip this screen on subsequent launches. "
        "BACK quits the app.",
        sBody
    ))

    # Profile Picker
    story.append(Paragraph("Profile Picker", sH2))
    story.append(Paragraph(
        "Shown after account selection and when switching profiles. Displays available profiles "
        "with a &gt; prefix, a separator line, and a quit option at the bottom. "
        "Navigate with UP/DOWN, select with OK. BACK returns to the account picker.",
        sBody
    ))

    # Home Screen
    story.append(Paragraph("Home Screen", sH2))
    story.append(Paragraph(
        "The main menu after selecting a profile. The left side shows your saved searches, "
        "a series browser link (tv profile), a movies browser link (movies profile), "
        "a browse-all option, reload, and switch profile. "
        "The right side shows today's live football scores (fotball profile) or a welcome image.",
        sBody
    ))
    story.append(Paragraph(
        "If a channel is playing when you return to home, the video continues behind "
        "a semi-transparent overlay so you never lose your stream.",
        sBody
    ))

    # Channel Browser
    story.append(Paragraph("Channel / Series Browser", sH2))
    story.append(Paragraph(
        "A split-view screen. The left panel lists channels, groups, series categories, seasons, "
        "or episodes depending on context. The right panel shows a live preview of the currently "
        "playing channel. A filter bar at the top lets you search within the current list. "
        "The counter at the bottom shows how many items are visible.",
        sBody
    ))

    # Fullscreen
    story.append(Paragraph("Fullscreen Mode", sH2))
    story.append(Paragraph(
        "Pressing OK on a playing channel enters fullscreen. All panels are hidden and the AVPlay "
        "video fills the entire 1920x1080 display. A brief info overlay shows the channel name "
        "and fades after 4 seconds. Press OK again anytime to re-show it.",
        sBody
    ))
    story.append(Paragraph(
        "From fullscreen, LEFT and RIGHT open overlay panels that slide in from the sides "
        "without interrupting playback.",
        sBody
    ))

    # ════════════════════════════════════════
    # REMOTE CONTROLS
    # ════════════════════════════════════════
    story.append(Paragraph("Remote Control Reference", sH1))
    story.append(green_line())

    story.append(Paragraph("General Navigation", sH2))
    ctrl_general = [
        key_row("UP / DOWN", "Move focus through lists"),
        key_row("OK (Enter)", "Select focused item, confirm actions"),
        key_row("BACK", "Go back one level, close overlays, exit fullscreen"),
        key_row("LEFT / RIGHT", "Switch panels on home; open overlays in fullscreen"),
    ]
    t = Table(ctrl_general, colWidths=[35*mm, 125*mm])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), DARK_BG),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('GRID', (0, 0), (-1, -1), 0.3, DIM_GREEN),
    ]))
    story.append(t)

    story.append(Paragraph("Fullscreen Controls", sH2))
    ctrl_fs = [
        key_row("LEFT", "Open left panel (menu, searches, series, movies, channels)"),
        key_row("RIGHT", "Open scores panel (fotball profile)"),
        key_row("OK", "Show channel info overlay"),
        key_row("BACK", "Close PiP (if active), otherwise exit fullscreen"),
        key_row("YELLOW", "Toggle/cycle subtitle tracks"),
        key_row("BLUE", "Activate PiP or swap PiP audio"),
        key_row("Play/Pause", "Resume / pause playback"),
    ]
    t = Table(ctrl_fs, colWidths=[35*mm, 125*mm])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), DARK_BG),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('GRID', (0, 0), (-1, -1), 0.3, DIM_GREEN),
    ]))
    story.append(t)

    story.append(Paragraph("Colour Buttons", sH2))
    ctrl_color = [
        key_row("RED", "Delete saved search (home or left overlay)"),
        key_row("GREEN", "Cycle sort mode (none / A-Z / Z-A) in channel lists"),
        key_row("YELLOW", "Cycle subtitle tracks in fullscreen (off / track 1 / track 2 / off)"),
        key_row("BLUE", "Picture-in-Picture: first press opens PiP picker via scores, subsequent presses swap audio"),
    ]
    t = Table(ctrl_color, colWidths=[35*mm, 125*mm])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), DARK_BG),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('GRID', (0, 0), (-1, -1), 0.3, DIM_GREEN),
    ]))
    story.append(t)

    # ════════════════════════════════════════
    # FEATURES
    # ════════════════════════════════════════
    story.append(PageBreak())
    story.append(Paragraph("Features", sH1))
    story.append(green_line())

    # Live TV
    story.append(Paragraph("Live TV Streaming", sH2))
    story.append(Paragraph(
        "Connects to Xtream Codes providers, loads channel categories and applies "
        "region/language filters per profile. Channels are searchable and sortable. "
        "The app tries multiple server hosts for resilience and caches the channel list locally.",
        sBody
    ))

    # Saved Searches
    story.append(Paragraph("Saved Searches", sH2))
    story.append(Paragraph(
        "Each profile can have saved search keywords that appear on the home screen as quick-access "
        "shortcuts. Select one to instantly filter channels by that keyword. "
        "Add new searches from the home screen, delete them with the RED button.",
        sBody
    ))

    # Series / VOD
    story.append(Paragraph("VOD Series Browsing", sH2))
    story.append(Paragraph(
        "Available on the tv profile. Browse series by category, then select a show to see "
        "its seasons, then pick a season to see episodes. Select an episode to play it. "
        "The hierarchy is: categories, series list (with year and rating), "
        "seasons, episodes. BACK navigates up through each level. "
        "Series are also browsable from the left overlay while watching fullscreen.",
        sBody
    ))

    # Movies / VOD
    story.append(Paragraph("VOD Movie Browsing", sH2))
    story.append(Paragraph(
        "Available on the movies profile. Browse movies by category, then select a movie "
        "to play it directly. The hierarchy is: categories, movie list (with year and rating). "
        "BACK navigates up through each level. "
        "Movies are also browsable from the left overlay while watching fullscreen.",
        sBody
    ))

    # Scores
    story.append(Paragraph("Live Football Scores", sH2))
    story.append(Paragraph(
        "The fotball profile pulls live match data from football-data.org covering "
        "Premier League, La Liga, Serie A, and Champions League. Scores appear in the "
        "right panel on the home screen (collapsed by default, press RIGHT to expand) "
        "and in a slide-in overlay during fullscreen playback. "
        "Competition headers are clickable and search for channels matching that league name. "
        "Match rows search for the home team name. "
        "Live matches auto-refresh every 60 seconds, finished matches every 5 minutes.",
        sBody
    ))

    # PiP
    story.append(Paragraph("Picture-in-Picture (PiP)", sH2))
    story.append(Paragraph(
        "Watch two streams at once. The primary stream plays through Samsung AVPlay with audio. "
        "The secondary stream plays in an HTML5 &lt;video&gt; element (always muted) in a "
        "480x270 window at the bottom-right corner. "
        "Press BLUE to activate PiP, which opens the scores overlay to pick a match. "
        "Selecting a match searches for channels; selecting a channel opens it as PiP. "
        "Press BLUE again to swap which stream has audio (causes a brief rebuffer on both). "
        "Press BACK to close PiP.",
        sBody
    ))

    # Subtitles
    story.append(Paragraph("Subtitles", sH2))
    story.append(Paragraph(
        "Press YELLOW in fullscreen to cycle through available subtitle tracks. "
        "The app detects embedded TEXT tracks in the stream after it prepares. "
        "An indicator briefly flashes at the top of the screen showing which track is active "
        "(e.g. 'subtitle: English') or 'subtitles off'. Subtitle text renders at the "
        "bottom center over the video with a semi-transparent background.",
        sBody
    ))

    # Left Overlay
    story.append(Paragraph("Left Panel Overlay", sH2))
    story.append(Paragraph(
        "Press LEFT in fullscreen to open a panel that slides in from the left side. "
        "It shows the same menu as the home screen: saved searches, series browser (tv), "
        "movies browser (movies), browse all channels, reload, and switch profile. "
        "Navigate into searches, series, movies, or channel groups without leaving fullscreen. "
        "The panel remembers its position when closed and reopened, so if you were "
        "deep in a series season list or movie category, it picks up right where you left off.",
        sBody
    ))

    # Video Behind Home
    story.append(Paragraph("Video Behind Home", sH2))
    story.append(Paragraph(
        "When you press BACK from fullscreen or a channel list while a stream is playing, "
        "the home screen overlays on top of the still-playing video with a semi-transparent "
        "background. The stream is not interrupted. Press BACK again on home to stop the "
        "video, and BACK once more to return to the profile picker.",
        sBody
    ))

    # ════════════════════════════════════════
    # PROJECT STRUCTURE
    # ════════════════════════════════════════
    story.append(PageBreak())
    story.append(Paragraph("Project Structure", sH1))
    story.append(green_line())

    files = [
        ["config.xml", "Tizen widget manifest (app ID, privileges, version)"],
        ["index.html", "Main HTML with all screen layouts, browser stubs"],
        ["css/style.css", "Full Matrix-themed stylesheet (~1300 lines)"],
        ["js/app.js", "Main application logic (~3600 lines): accounts, navigation, profiles, overlays, key handling"],
        ["js/player.js", "AVPlay wrapper: playback, PiP, subtitles (~384 lines)"],
        ["js/xtream.js", "Xtream Codes API client: channels, categories, series, movies (~430 lines)"],
        ["js/football.js", "football-data.org integration: match fetching, caching (~340 lines)"],
        ["js/playlist.js", "M3U playlist parser and channel filtering (~220 lines)"],
        ["js/tagger.js", "Channel metadata tagger: quality tags, language detection (~260 lines)"],
        ["js/qrcode.min.js", "QR code generator for profile sharing"],
        ["deploy.sh", "Build and deploy script for packaging .wgt"],
        ["dev-server.py", "Local development server with CORS proxy for football API"],
        ["profile.html", "Mobile-friendly profile entry form (scanned via QR)"],
    ]

    file_data = [[Paragraph(f[0], sKey), Paragraph(f[1], sDesc)] for f in files]
    t = Table(file_data, colWidths=[40*mm, 120*mm])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), DARK_BG),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('GRID', (0, 0), (-1, -1), 0.3, DIM_GREEN),
    ]))
    story.append(t)

    # ════════════════════════════════════════
    # DEPLOYMENT
    # ════════════════════════════════════════
    story.append(Paragraph("Deployment", sH1))
    story.append(green_line())

    story.append(Paragraph("Building and installing the app on a Samsung TV:", sBody))
    story.append(Spacer(1, 3*mm))

    steps = [
        "Install Tizen Studio with TV Extension SDK",
        "Enable Developer Mode on your Samsung TV (Settings > General > Developer Mode, enter your PC's IP)",
        "Connect Tizen Studio to the TV via Device Manager",
        "Open the project in Tizen Studio or package manually:",
    ]
    for i, step in enumerate(steps):
        story.append(Paragraph(f"{i+1}.  {step}", sBody))

    story.append(Spacer(1, 2*mm))
    story.append(Paragraph("tizen package -t wgt -s YourCertificate -- /path/to/iptv-player/", sMono))
    story.append(Paragraph("tizen install -n IPTVPlayer.wgt -t &lt;device-serial&gt;", sMono))
    story.append(Paragraph("tizen run -p iPlayerTV0.IPTVPlayer -t &lt;device-serial&gt;", sMono))
    story.append(Spacer(1, 3*mm))

    story.append(Paragraph(
        "For local development, run dev-server.py which serves the app and proxies "
        "the football API to avoid CORS issues. Open in a browser at localhost:8080.",
        sBody
    ))

    # ════════════════════════════════════════
    # QUICK REFERENCE CARD
    # ════════════════════════════════════════
    story.append(PageBreak())
    story.append(Paragraph("Quick Reference", sH1))
    story.append(green_line())

    story.append(Paragraph("Navigation Flow", sH2))
    story.append(Paragraph("Account Picker  &gt;  Profile Picker  &gt;  Home Screen  &gt;  Channel/Series/Movie Browser  &gt;  Fullscreen", sMono))
    story.append(Spacer(1, 3*mm))
    story.append(Paragraph("BACK goes up one level at each step. From fullscreen, BACK closes PiP first if active.", sBody))

    story.append(Paragraph("Series Navigation (tv profile)", sH2))
    story.append(Paragraph("Home  &gt;  series  &gt;  Categories  &gt;  Shows  &gt;  Seasons  &gt;  Episodes  &gt;  Play", sMono))
    story.append(Spacer(1, 3*mm))
    story.append(Paragraph("Same hierarchy works inside the left overlay while watching fullscreen.", sBody))

    story.append(Paragraph("Movies Navigation (movies profile)", sH2))
    story.append(Paragraph("Home  &gt;  movies  &gt;  Categories  &gt;  Movie List  &gt;  Play", sMono))
    story.append(Spacer(1, 3*mm))
    story.append(Paragraph("Same hierarchy works inside the left overlay while watching fullscreen.", sBody))

    story.append(Paragraph("Scores Navigation (fotball profile)", sH2))
    story.append(Paragraph("Home: RIGHT expands scores panel, RIGHT again focuses it, UP/DOWN browses", sMono))
    story.append(Spacer(1, 2*mm))
    story.append(Paragraph("Fullscreen: RIGHT opens scores overlay, OK on a competition searches channels, OK on a match searches by home team", sMono))

    story.append(Paragraph("Subtitle Cycling", sH2))
    story.append(Paragraph("YELLOW: off  &gt;  Track 1  &gt;  Track 2  &gt;  ...  &gt;  off", sMono))

    story.append(Paragraph("PiP Workflow", sH2))
    story.append(Paragraph("BLUE (first)  &gt;  scores overlay  &gt;  pick match  &gt;  pick channel  &gt;  PiP opens", sMono))
    story.append(Spacer(1, 2*mm))
    story.append(Paragraph("BLUE (again)  &gt;  swap audio between main and PiP", sMono))
    story.append(Spacer(1, 2*mm))
    story.append(Paragraph("BACK  &gt;  close PiP", sMono))

    story.append(Spacer(1, 12*mm))
    story.append(green_line())
    story.append(Paragraph("ruy.se  ·  IPTV Player v1.0  ·  2026", ParagraphStyle(
        "footer", fontName="Helvetica", fontSize=10, textColor=DIM_GREEN,
        alignment=TA_CENTER
    )))

    # Build
    doc.build(story, onFirstPage=bg_canvas, onLaterPages=bg_canvas)
    print("PDF generated successfully.")


if __name__ == "__main__":
    build()
