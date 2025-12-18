const SERVER_URL = 'http://localhost:5000';

document.addEventListener('DOMContentLoaded', async () => {
  // Common elements
  const serverStatus = document.getElementById('server-status');
  const progressSection = document.getElementById('progress-section');
  const progressFill = document.getElementById('progress-fill');
  const progressText = document.getElementById('progress-text');
  const result = document.getElementById('result');
  
  // TikTok elements
  const videoUrlInput = document.getElementById('video-url');
  const downloadBtn = document.getElementById('download-btn');
  const downloadCurrentBtn = document.getElementById('download-current');
  const autoDetectSection = document.getElementById('auto-detect');
  const videoThumbnail = document.getElementById('video-thumbnail');
  const videoTitle = document.getElementById('video-title');
  const videoAuthor = document.getElementById('video-author');
  
  // YouTube elements
  const ytUrlInput = document.getElementById('yt-url');
  const downloadYtBtn = document.getElementById('download-yt-btn');
  const downloadYtCurrentBtn = document.getElementById('download-yt-current');
  const ytAutoDetectSection = document.getElementById('yt-auto-detect');
  const ytThumbnail = document.getElementById('yt-thumbnail');
  const ytTitle = document.getElementById('yt-title');
  const ytAuthor = document.getElementById('yt-author');
  
  // Tab elements
  const tabs = document.querySelectorAll('.tab');
  const tabContents = document.querySelectorAll('.tab-content');
  
  let currentVideoUrl = null;
  let currentYtUrl = null;

  // Tab switching
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const tabName = tab.dataset.tab;
      
      tabs.forEach(t => t.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));
      
      tab.classList.add('active');
      document.getElementById(`${tabName}-tab`).classList.add('active');
      
      // Clear results when switching tabs
      result.style.display = 'none';
    });
  });

  // Check server status
  async function checkServer() {
    try {
      const response = await fetch(`${SERVER_URL}/health`, { 
        method: 'GET',
        mode: 'cors'
      });
      if (response.ok) {
        serverStatus.className = 'status connected';
        serverStatus.querySelector('.status-text').textContent = 'Server connected';
        return true;
      }
    } catch (e) {
      console.error('Server check failed:', e);
    }
    serverStatus.className = 'status disconnected';
    serverStatus.querySelector('.status-text').textContent = 'Server offline - Start server first';
    return false;
  }

  // Check current tab and auto-detect content
  async function checkCurrentTab() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (tab && tab.url) {
        // Check for TikTok
        if (tab.url.includes('tiktok.com') && tab.url.includes('/video/')) {
          currentVideoUrl = tab.url;
          videoUrlInput.value = tab.url;
          autoDetectSection.style.display = 'block';
          videoTitle.textContent = 'Loading video info...';
          videoAuthor.textContent = '';
          videoThumbnail.style.display = 'none';
          
          // Switch to TikTok tab
          tabs[0].click();
          
          await fetchTikTokInfo(tab.url);
          return;
        }
        
        // Check for YouTube Shorts
        if (tab.url.includes('youtube.com/shorts/') || 
            (tab.url.includes('youtube.com/watch') && tab.url.includes('v='))) {
          currentYtUrl = tab.url;
          ytUrlInput.value = tab.url;
          ytAutoDetectSection.style.display = 'block';
          ytTitle.textContent = 'Loading video info...';
          ytAuthor.textContent = '';
          ytThumbnail.style.display = 'none';
          
          // Switch to YouTube tab
          tabs[1].click();
          
          await fetchYouTubeInfo(tab.url);
          return;
        }
      }
      
      // Not on supported page
      autoDetectSection.style.display = 'none';
      ytAutoDetectSection.style.display = 'none';
      videoTitle.textContent = 'Not on a TikTok video page';
      ytTitle.textContent = 'Not on a YouTube Shorts page';
      
    } catch (e) {
      console.error('Tab check failed:', e);
    }
  }
  
  // Fetch TikTok video info
  async function fetchTikTokInfo(url) {
    try {
      const response = await fetch(`${SERVER_URL}/info`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        videoTitle.textContent = data.title || 'TikTok Video';
        videoAuthor.textContent = data.author ? `@${data.author}` : '';
        if (data.cover) {
          videoThumbnail.src = data.cover;
          videoThumbnail.style.display = 'block';
        }
      } else {
        videoTitle.textContent = 'TikTok Video (Ready to download)';
      }
    } catch (e) {
      console.error('Failed to fetch TikTok info:', e);
      videoTitle.textContent = 'TikTok Video (Ready to download)';
    }
  }
  
  // Fetch YouTube video info
  async function fetchYouTubeInfo(url) {
    try {
      const response = await fetch(`${SERVER_URL}/youtube/info`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        ytTitle.textContent = data.title || 'YouTube Video';
        ytAuthor.textContent = data.author ? `@${data.author}` : '';
        if (data.thumbnail) {
          ytThumbnail.src = data.thumbnail;
          ytThumbnail.style.display = 'block';
        }
      } else {
        ytTitle.textContent = 'YouTube Shorts (Ready to download)';
      }
    } catch (e) {
      console.error('Failed to fetch YouTube info:', e);
      ytTitle.textContent = 'YouTube Shorts (Ready to download)';
    }
  }

  // Download TikTok video
  async function downloadTikTok(url) {
    if (!url) {
      showResult('Please enter a TikTok URL', 'error');
      return;
    }

    if (!url.includes('tiktok.com')) {
      showResult('Please enter a valid TikTok URL', 'error');
      return;
    }

    const isConnected = await checkServer();
    if (!isConnected) {
      showResult('Server is not running. Please start the server first.', 'error');
      return;
    }

    showProgress('Downloading TikTok video...');
    setButtonLoading(downloadBtn, true);
    setButtonLoading(downloadCurrentBtn, true);

    try {
      const response = await fetch(`${SERVER_URL}/download`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, hd: true }),
      });

      const data = await response.json();

      if (data.success) {
        showResult(`✅ Downloaded: ${data.filename} (${data.quality})`, 'success');
      } else {
        showResult(`❌ Error: ${data.error}`, 'error');
      }
    } catch (e) {
      showResult(`❌ Error: ${e.message}`, 'error');
    } finally {
      hideProgress();
      setButtonLoading(downloadBtn, false);
      setButtonLoading(downloadCurrentBtn, false);
    }
  }
  
  // Download YouTube music
  async function downloadYouTube(url) {
    if (!url) {
      showResult('Please enter a YouTube URL', 'error');
      return;
    }

    if (!url.includes('youtube.com') && !url.includes('youtu.be')) {
      showResult('Please enter a valid YouTube URL', 'error');
      return;
    }

    const isConnected = await checkServer();
    if (!isConnected) {
      showResult('Server is not running. Please start the server first.', 'error');
      return;
    }

    showProgress('Downloading YouTube music...');
    setButtonLoading(downloadYtBtn, true);
    setButtonLoading(downloadYtCurrentBtn, true);

    try {
      const response = await fetch(`${SERVER_URL}/youtube/download`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (data.success) {
        showResult(`✅ Downloaded: ${data.filename} (${data.quality})`, 'success');
      } else {
        showResult(`❌ Error: ${data.error}`, 'error');
      }
    } catch (e) {
      showResult(`❌ Error: ${e.message}`, 'error');
    } finally {
      hideProgress();
      setButtonLoading(downloadYtBtn, false);
      setButtonLoading(downloadYtCurrentBtn, false);
    }
  }

  function showProgress(text) {
    progressSection.style.display = 'block';
    progressText.textContent = text;
    progressFill.style.width = '0%';
    result.style.display = 'none';
    
    // Animate progress
    let progress = 0;
    const interval = setInterval(() => {
      if (progress < 90) {
        progress += Math.random() * 15;
        progressFill.style.width = `${Math.min(progress, 90)}%`;
      }
    }, 300);
    
    progressSection.dataset.interval = interval;
  }
  
  function hideProgress() {
    const interval = progressSection.dataset.interval;
    if (interval) clearInterval(parseInt(interval));
    progressFill.style.width = '100%';
    setTimeout(() => {
      progressSection.style.display = 'none';
      progressFill.style.width = '0%';
    }, 500);
  }

  function showResult(message, type) {
    result.style.display = 'block';
    result.className = `result ${type}`;
    result.textContent = message;
  }
  
  function setButtonLoading(btn, loading) {
    if (!btn) return;
    btn.disabled = loading;
    const loader = btn.querySelector('.btn-loader');
    const text = btn.querySelector('.btn-text');
    if (loader) loader.style.display = loading ? 'inline-block' : 'none';
    if (text && loading) {
      text.dataset.original = text.textContent;
      text.textContent = 'Downloading...';
    } else if (text && text.dataset.original) {
      text.textContent = text.dataset.original;
    }
  }

  // Event listeners - TikTok
  downloadBtn.addEventListener('click', () => {
    downloadTikTok(videoUrlInput.value.trim());
  });

  downloadCurrentBtn.addEventListener('click', () => {
    downloadTikTok(currentVideoUrl || videoUrlInput.value.trim());
  });

  videoUrlInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') downloadTikTok(videoUrlInput.value.trim());
  });
  
  // Event listeners - YouTube
  downloadYtBtn.addEventListener('click', () => {
    downloadYouTube(ytUrlInput.value.trim());
  });

  downloadYtCurrentBtn.addEventListener('click', () => {
    downloadYouTube(currentYtUrl || ytUrlInput.value.trim());
  });

  ytUrlInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') downloadYouTube(ytUrlInput.value.trim());
  });

  // Initialize
  await checkServer();
  await checkCurrentTab();
});
