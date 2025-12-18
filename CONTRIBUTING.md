# Contributing to TikTok Downloader

First off, thanks for taking the time to contribute! 🎉

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues. When creating a bug report, include:

- **Clear title** describing the issue
- **Steps to reproduce** the behavior
- **Expected behavior** vs what actually happened
- **Screenshots** if applicable
- **Environment info** (OS, Python version, Chrome version)

### Suggesting Features

Feature suggestions are welcome! Please:

- Check if the feature has already been suggested
- Provide a clear description of the feature
- Explain why it would be useful
- Consider if it fits the project's scope

### Pull Requests

1. **Fork** the repo and create your branch from `main`
2. **Test** your changes locally
3. **Follow** the existing code style
4. **Write** clear commit messages
5. **Update** documentation if needed

## Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/tiktok-downloader.git
cd tiktok-downloader

# Install dependencies
pip install -r requirements.txt

# Start the server
python server.py

# Load extension in Chrome (chrome://extensions → Developer mode → Load unpacked)
```

## Code Style

- **Python**: Follow PEP 8
- **JavaScript**: Use consistent indentation (2 spaces)
- **Comments**: Write clear comments for complex logic
- **Names**: Use descriptive variable and function names

## Project Structure

```
chrome-extension/    # Extension files
├── manifest.json    # Extension config
├── popup.*          # Popup UI
├── content.js       # TikTok injection
└── youtube-content.js # YouTube injection

server.py            # Flask server
tik-tok-downloader.py # Download logic
```

## Good First Issues

Looking for something to work on? Check issues labeled [`good first issue`](../../labels/good%20first%20issue).

These are great for newcomers:
- Adding better error messages
- Improving documentation
- UI improvements
- Writing tests

## Questions?

Feel free to open an issue with your question!

---

Thanks for contributing! 🙏
