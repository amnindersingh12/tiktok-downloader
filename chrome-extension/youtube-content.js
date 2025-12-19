// Content script for YouTube Shorts - adds music download button
(function() {
  'use strict';

  const SERVER_URL = 'http://localhost:5001';
  let downloadButtonsAdded = new Set();

  // Create download music button
  function createDownloadButton(videoUrl) {
    const button = document.createElement('button');
    button.className = 'yt-music-dl-btn';
    button.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/>
        <polygon points="10 8 16 12 10 16 10 8"/>
      </svg>
      <span>Download Music</span>
    `;
    
    button.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      button.classList.add('loading');
      button.innerHTML = `
        <span class="spinner"></span>
        <span>Downloading...</span>
      `;

      try {
        const response = await fetch(`${SERVER_URL}/download-youtube`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: videoUrl, audio_only: true }),
        });

        const data = await response.json();

        if (data.success) {
          button.classList.remove('loading');
          button.classList.add('success');
          button.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            <span>Downloaded!</span>
          `;
          
          setTimeout(() => {
            button.classList.remove('success');
            resetButton(button);
          }, 3000);
        } else {
          throw new Error(data.error);
        }
      } catch (error) {
        button.classList.remove('loading');
        button.classList.add('error');
        button.innerHTML = `
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
          <span>Error</span>
        `;
        
        setTimeout(() => {
          button.classList.remove('error');
          resetButton(button);
        }, 3000);
      }
    });

    return button;
  }

  function resetButton(button) {
    button.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/>
        <polygon points="10 8 16 12 10 16 10 8"/>
      </svg>
      <span>Download Music</span>
    `;
  }

  // Find and add buttons to YouTube Shorts
  function addDownloadButtons() {
    const currentUrl = window.location.href;
    
    if (currentUrl.includes('/shorts/')) {
      const videoId = currentUrl.match(/\/shorts\/([\w-]+)/)?.[1];
      
      if (videoId && !downloadButtonsAdded.has(videoId)) {
        // Find the actions container
        const actionsContainers = document.querySelectorAll('#actions, ytd-reel-video-renderer #actions');
        
        actionsContainers.forEach(container => {
          if (!container.querySelector('.yt-music-dl-btn')) {
            const button = createDownloadButton(currentUrl);
            container.insertBefore(button, container.firstChild);
            downloadButtonsAdded.add(videoId);
          }
        });

        // Also try to add to the shorts player
        const shortsContainer = document.querySelector('ytd-shorts');
        if (shortsContainer && !shortsContainer.querySelector('.yt-music-dl-btn')) {
          const button = createDownloadButton(currentUrl);
          button.style.position = 'fixed';
          button.style.bottom = '100px';
          button.style.right = '20px';
          button.style.zIndex = '9999';
          shortsContainer.appendChild(button);
          downloadButtonsAdded.add(videoId);
        }
      }
    }
  }

  // Observe DOM changes for dynamically loaded content
  const observer = new MutationObserver((mutations) => {
    addDownloadButtons();
  });

  // Start observing
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  // Initial run
  setTimeout(addDownloadButtons, 1000);

  // Also add on URL change (for SPA navigation)
  let lastUrl = location.href;
  new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
      lastUrl = url;
      downloadButtonsAdded.clear();
      setTimeout(addDownloadButtons, 1000);
    }
  }).observe(document, { subtree: true, childList: true });
})();
