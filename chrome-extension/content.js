// Content script to add download button to TikTok videos
(function() {
  'use strict';

  const SERVER_URL = 'http://localhost:5001';
  let downloadButtonsAdded = new Set();

  // Create download button
  function createDownloadButton(videoUrl) {
    const button = document.createElement('button');
    button.className = 'tiktok-dl-btn';
    button.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
        <polyline points="7 10 12 15 17 10"/>
        <line x1="12" y1="15" x2="12" y2="3"/>
      </svg>
      <span>Download</span>
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
        const response = await fetch(`${SERVER_URL}/download`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: videoUrl }),
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
            resetButton(button, videoUrl);
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
          resetButton(button, videoUrl);
        }, 3000);
      }
    });

    return button;
  }

  function resetButton(button, videoUrl) {
    button.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
        <polyline points="7 10 12 15 17 10"/>
        <line x1="12" y1="15" x2="12" y2="3"/>
      </svg>
      <span>Download</span>
    `;
  }

  // Find and add buttons to video containers
  function addDownloadButtons() {
    // For video detail pages
    const currentUrl = window.location.href;
    if (currentUrl.includes('/video/')) {
      const videoId = currentUrl.match(/\/video\/(\d+)/)?.[1];
      if (videoId && !downloadButtonsAdded.has(videoId)) {
        // Find action bar
        const actionBars = document.querySelectorAll('[class*="ActionBar"], [class*="action-bar"]');
        actionBars.forEach(bar => {
          if (!bar.querySelector('.tiktok-dl-btn')) {
            const button = createDownloadButton(currentUrl);
            bar.appendChild(button);
            downloadButtonsAdded.add(videoId);
          }
        });
      }
    }

    // For feed videos
    const videoElements = document.querySelectorAll('[class*="DivVideoWrapper"], [class*="video-card"]');
    videoElements.forEach(videoEl => {
      const link = videoEl.querySelector('a[href*="/video/"]');
      if (link && !videoEl.querySelector('.tiktok-dl-btn')) {
        const videoUrl = link.href;
        const videoId = videoUrl.match(/\/video\/(\d+)/)?.[1];
        if (videoId && !downloadButtonsAdded.has(videoId)) {
          const button = createDownloadButton(videoUrl);
          videoEl.style.position = 'relative';
          videoEl.appendChild(button);
          downloadButtonsAdded.add(videoId);
        }
      }
    });
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
  addDownloadButtons();

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
