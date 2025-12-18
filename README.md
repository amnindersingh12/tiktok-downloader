# TikTok & YouTube Shorts Downloader

A simple Chrome extension + Python server to download TikTok videos (without watermark) and extract audio from YouTube Shorts.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Chrome](https://img.shields.io/badge/chrome-extension-green.svg)
![Python](https://img.shields.io/badge/python-3.8+-yellow.svg)
![Contributions Welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg)

## ✨ Features

- 📹 Download TikTok videos without watermarks
- 🎵 Extract audio from YouTube Shorts
- ⚡ One-click download button on video pages
- 🖥️ Works locally - your data stays on your computer
- 🔒 No accounts, no tracking, no BS

## 📸 Screenshots

*Coming soon - contributions welcome!*

## 🚀 Quick Start

### Prerequisites

- Python 3.8+
- Google Chrome browser
- pip (Python package manager)

### Installation

**1. Clone the repository**
```bash
git clone https://github.com/YOUR_USERNAME/tiktok-downloader.git
cd tiktok-downloader
```

**2. Install Python dependencies**
```bash
pip install -r requirements.txt
```

**3. Start the local server**
```bash
python server.py
```

**4. Install the Chrome extension**
- Open Chrome and go to `chrome://extensions`
- Enable "Developer mode" (toggle in top right)
- Click "Load unpacked"
- Select the `chrome-extension` folder

**5. Start downloading!**
- Visit any TikTok video
- Click the download button that appears
- Or use the extension popup

## 📁 Project Structure

```
tiktok-downloader/
├── chrome-extension/       # Chrome extension files
│   ├── manifest.json       # Extension configuration
│   ├── popup.html/js/css   # Extension popup UI
│   ├── content.js          # TikTok page injection
│   └── youtube-content.js  # YouTube Shorts injection
├── server.py               # Local Python server
├── tik-tok-downloader.py   # Core download logic
├── requirements.txt        # Python dependencies
└── README.md
```

## 🛠️ How It Works

1. **Chrome Extension** injects a download button on TikTok/YouTube pages
2. When clicked, it sends the video URL to your **local Python server**
3. Server uses `yt-dlp` to fetch the video without watermark
4. Video is saved to your `downloads/` folder

```
[TikTok Page] → [Chrome Extension] → [Local Server] → [yt-dlp] → [Your Computer]
```

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

### Good First Issues

Check out our [good first issues](../../labels/good%20first%20issue) for beginner-friendly tasks!

## 📋 Roadmap

- [ ] Add batch download support
- [ ] Firefox extension
- [ ] Download history
- [ ] Custom save location picker
- [ ] Video quality selection
- [ ] Better error messages
- [ ] Unit tests
- [ ] Dark/Light theme toggle

## ⚠️ Disclaimer

This tool is for **personal use only**. Please:
- Only download content you have the right to save
- Respect copyright and intellectual property
- Don't use for commercial purposes without permission
- Follow TikTok and YouTube's Terms of Service

The developers are not responsible for misuse of this tool.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [yt-dlp](https://github.com/yt-dlp/yt-dlp) - The backbone of this project
- All our [contributors](../../graphs/contributors)

---

**If this project helped you, consider giving it a ⭐!**
