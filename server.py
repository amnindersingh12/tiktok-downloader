"""
TikTok & YouTube Shorts Downloader - Local Server
A simple Flask server that handles download requests from the Chrome extension.
"""

from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import yt_dlp
import os
import re
import tempfile
from datetime import datetime

app = Flask(__name__)
CORS(app)  # Enable CORS for extension communication

# Configuration
DOWNLOAD_FOLDER = os.path.join(os.path.expanduser('~'), 'Downloads', 'TikTok-Downloads')
os.makedirs(DOWNLOAD_FOLDER, exist_ok=True)


def validate_tiktok_url(url):
    """Check if URL is a valid TikTok URL"""
    pattern = r'https?://((?:vm|vt|www)\.)?tiktok\.com/.*'
    return bool(re.match(pattern, url))


def validate_youtube_url(url):
    """Check if URL is a valid YouTube URL"""
    pattern = r'https?://(www\.)?(youtube\.com|youtu\.be)/.*'
    return bool(re.match(pattern, url))


def get_video_info(url):
    """Get video metadata without downloading"""
    ydl_opts = {
        'quiet': True,
        'no_warnings': True,
        'extract_flat': False,
    }
    
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)
            return {
                'title': info.get('title', 'Unknown'),
                'author': info.get('uploader', 'Unknown'),
                'thumbnail': info.get('thumbnail', ''),
                'duration': info.get('duration', 0),
            }
    except Exception as e:
        return {'error': str(e)}


def download_video(url, output_path):
    """Download video using yt-dlp"""
    ydl_opts = {
        'outtmpl': output_path,
        'format': 'best',
        'noplaylist': True,
        'quiet': True,
        'no_warnings': True,
    }
    
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            ydl.download([url])
        return True
    except Exception as e:
        print(f"Download error: {e}")
        return False


def download_audio(url, output_path):
    """Download audio only (for YouTube)"""
    ydl_opts = {
        'outtmpl': output_path,
        'format': 'bestaudio/best',
        'postprocessors': [{
            'key': 'FFmpegExtractAudio',
            'preferredcodec': 'mp3',
            'preferredquality': '192',
        }],
        'noplaylist': True,
        'quiet': True,
        'no_warnings': True,
    }
    
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            ydl.download([url])
        return True
    except Exception as e:
        print(f"Audio download error: {e}")
        return False


# ============================================
# API ROUTES
# ============================================

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'ok', 'message': 'Server is running'})


@app.route('/info', methods=['POST'])
def get_info():
    """Get video information"""
    data = request.json
    url = data.get('url', '')
    
    if not url:
        return jsonify({'error': 'No URL provided'}), 400
    
    info = get_video_info(url)
    if 'error' in info:
        return jsonify(info), 400
    
    return jsonify(info)


@app.route('/download', methods=['POST'])
def download():
    """Download TikTok video"""
    data = request.json
    url = data.get('url', '')
    
    if not url:
        return jsonify({'error': 'No URL provided'}), 400
    
    if not validate_tiktok_url(url):
        return jsonify({'error': 'Invalid TikTok URL'}), 400
    
    # Generate filename
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    filename = f'tiktok_{timestamp}.mp4'
    output_path = os.path.join(DOWNLOAD_FOLDER, filename)
    
    # Download
    success = download_video(url, output_path)
    
    if success and os.path.exists(output_path):
        return jsonify({
            'success': True,
            'message': 'Video downloaded successfully',
            'filename': filename,
            'path': output_path
        })
    else:
        return jsonify({'error': 'Download failed'}), 500


@app.route('/download-youtube', methods=['POST'])
def download_youtube():
    """Download YouTube Shorts audio"""
    data = request.json
    url = data.get('url', '')
    audio_only = data.get('audio_only', True)
    
    if not url:
        return jsonify({'error': 'No URL provided'}), 400
    
    if not validate_youtube_url(url):
        return jsonify({'error': 'Invalid YouTube URL'}), 400
    
    # Generate filename
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    
    if audio_only:
        filename = f'youtube_{timestamp}'  # Extension added by yt-dlp
        output_path = os.path.join(DOWNLOAD_FOLDER, filename)
        success = download_audio(url, output_path)
        final_path = output_path + '.mp3'
    else:
        filename = f'youtube_{timestamp}.mp4'
        output_path = os.path.join(DOWNLOAD_FOLDER, filename)
        success = download_video(url, output_path)
        final_path = output_path
    
    if success:
        return jsonify({
            'success': True,
            'message': 'Download completed',
            'filename': os.path.basename(final_path),
            'path': final_path
        })
    else:
        return jsonify({'error': 'Download failed'}), 500


# ============================================
# MAIN
# ============================================

if __name__ == '__main__':
    print("=" * 50)
    print("TikTok & YouTube Shorts Downloader Server")
    print("=" * 50)
    print(f"Downloads will be saved to: {DOWNLOAD_FOLDER}")
    print("Server running at: http://localhost:5001")
    print("Press Ctrl+C to stop")
    print("=" * 50)
    
    app.run(host='127.0.0.1', port=5001, debug=False)
