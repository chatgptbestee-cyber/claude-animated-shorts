# Al Editor tools

Folders: `raw/` (source footage, git-ignored), `references/` (reference material, already in the repo), `done/` (finished renders, git-ignored).

## Verified setup (Ubuntu 24.04, Python 3.13, Node 22)

| Tool | Version | Install | Verified |
|---|---|---|---|
| FFmpeg with libass | 6.1.1 (`subtitles` filter, `--enable-libass`) | `/usr/bin/ffmpeg` (apt). On Mac: `brew install ffmpeg-full`, then use `/opt/homebrew/opt/ffmpeg-full/bin/ffmpeg` | Burned a subtitle into a 5 s clip; frame checked visually |
| faster-whisper | 1.2.1 (av 18.1.0, ctranslate2 4.8.5) | `.venv/bin/pip install faster-whisper "av<19"` | Import OK. Transcription NOT verified: model download from huggingface.co is blocked in this session |
| yt-dlp | 2026.10.26 | `.venv/bin/pip install yt-dlp` | Runs, 1755 extractors. Download NOT verified: youtube.com is blocked in this session |
| Remotion | 4.0.540 (`remotion`, `@remotion/cli`, React 19.0.0) | `cd tools && npm install` | Rendered a 5 s 1080x1920 H.264 MP4 (`tools/checks/remotion`) |
| HyperFrames | 0.9.10 | `cd tools && npm install` | Scaffolded and rendered a 10 s 1080x1920 H.264 MP4 |

## Running

```bash
# Python tools
.venv/bin/yt-dlp --version
.venv/bin/python -c "import faster_whisper"

# Remotion test render
cd tools && npx remotion render checks/remotion/index.ts Test out.mp4

# HyperFrames
cd tools && npx hyperframes doctor
```

## Known limits in this session

- The blank HyperFrames template loads GSAP from `cdn.jsdelivr.net`, which this session's proxy refuses. Render it locally by installing `gsap` from npm and pointing the script tag at a local copy, or allow the CDN.
- Remotion needs a Chromium. Pass `--browser-executable=<path>` if the bundled download is blocked. HyperFrames uses the system Chrome when present.
- `npm audit` reports 2 advisories in `tools/`. Not fixed, because the suggested fix is a breaking change.
