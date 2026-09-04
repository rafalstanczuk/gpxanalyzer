/* ============================================================
   GpxAnalyzer — Main Script (refactored)
   ============================================================ */

(function () {
  'use strict';

  // ---- DOM refs ----
  const navbar     = document.querySelector('.navbar');
  const navToggle  = document.querySelector('.nav-toggle');
  const navLinks   = document.querySelector('.nav-links');
  const navOverlay = document.querySelector('.nav-overlay');

  // ============================================================
  // 1. SMOOTH SCROLL
  // ============================================================
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      const target = document.querySelector(a.getAttribute('href'));
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  // ============================================================
  // 2. NAVBAR — scroll shadow + mobile menu
  // ============================================================
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 10);
  }, { passive: true });

  function closeMenu() {
    navLinks.classList.remove('open');
    navToggle.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');
  }

  function openMenu() {
    navLinks.classList.add('open');
    navToggle.classList.add('open');
    navToggle.setAttribute('aria-expanded', 'true');
    document.body.classList.add('menu-open');
    const first = navLinks.querySelector('a');
    if (first) first.focus({ preventScroll: true });
  }

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      navLinks.classList.contains('open') ? closeMenu() : openMenu();
    });

    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => { if (navLinks.classList.contains('open')) closeMenu(); });
    });

    document.addEventListener('click', e => {
      if (navLinks.classList.contains('open') && !navLinks.contains(e.target) && !navToggle.contains(e.target)) closeMenu();
    });

    if (navOverlay) navOverlay.addEventListener('click', closeMenu);

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && navLinks.classList.contains('open')) closeMenu();
      if (e.key === 'Tab' && navLinks.classList.contains('open')) {
        const items = navLinks.querySelectorAll('a');
        if (!items.length) return;
        const first = items[0], last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 1024 && navLinks.classList.contains('open')) closeMenu();
    });
  }

  // ============================================================
  // 3. SCROLL ANIMATIONS — fade-in-up via IntersectionObserver
  // ============================================================
  const fadeObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        fadeObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

  function observeFadeElements() {
    document.querySelectorAll('.fade-in-up').forEach(el => fadeObserver.observe(el));
  }

  // ============================================================
  // 4. SCREENSHOTS — build from index.txt, lightbox
  // ============================================================
  let screenshotItems = [];

  // Fallback alt text derived from the file name (replaced by the .md title once loaded)
  function humanizeName(name) {
    if (/^Screenshot_\d+/.test(name)) return 'app screenshot';
    return name.replace(/^slide\d+_/, '').replace(/_/g, ' ').replace(/\s+/g, ' ').trim();
  }

  async function buildScreenshots() {
    const grid = document.querySelector('.screenshots-grid');
    if (!grid) return;

    try {
      const resp = await fetch('screenshots/index.txt');
      if (!resp.ok) return;
      const text = await resp.text();
      const names = text.split('\n').map(l => l.trim()).filter(Boolean);
      if (!names.length) return;

      grid.innerHTML = '';
      names.forEach(name => {
        const item = document.createElement('div');
        item.className = 'screenshot-item fade-in-up';
        item.dataset.screenshot = `screenshots/${name}.png`;
        item.dataset.descriptionMd = `screenshots/${name}.md`;

        const img = document.createElement('img');
        img.src = `screenshots/${name}.png`;
        img.alt = `GpxAnalyzer screenshot: ${humanizeName(name)}`;
        img.className = 'screenshot-img';
        img.loading = 'lazy';

        const desc = document.createElement('div');
        desc.className = 'screenshot-description loading';

        item.appendChild(img);
        item.appendChild(desc);
        grid.appendChild(item);
      });

      screenshotItems = Array.from(grid.querySelectorAll('.screenshot-item'));
      loadDescriptions();
      initLightbox();
      observeFadeElements();
    } catch { /* network or file:// — ignore */ }
  }

  async function loadDescriptions() {
    const items = document.querySelectorAll('.screenshot-item[data-description-md]');
    await Promise.all(Array.from(items).map(async item => {
      const mdPath = item.dataset.descriptionMd;
      const div = item.querySelector('.screenshot-description');
      if (!mdPath || !div) return;
      try {
        const r = await fetch(mdPath);
        if (!r.ok) throw new Error();
        const md = await r.text();
        const lines = md.split('\n').map(l => l.trim()).filter(Boolean);
        const titleIdx = lines.findIndex(l => l.startsWith('#'));
        const title = titleIdx >= 0 ? lines[titleIdx].replace(/^#+\s*/, '').trim() : '';
        let text = '';
        if (titleIdx >= 0 && lines.length > titleIdx + 1) {
          text = lines.slice(titleIdx + 1).join(' ').trim();
        }
        if (!text && lines.length) text = lines[0].replace(/^#\s*/, '').trim();
        if (text) { div.textContent = text; } else { div.remove(); }
        const img = item.querySelector('img');
        if (img && title) img.alt = `GpxAnalyzer screenshot: ${title}`;
      } catch {
        div.remove();
      }
    }));
  }

  // ---- Lightbox ----
  const modal         = document.getElementById('screenshot-modal');
  const modalImg      = document.getElementById('screenshot-modal-img');
  const modalDesc     = document.getElementById('screenshot-modal-description');
  const closeBtn      = document.querySelector('.screenshot-modal-close');
  const prevBtn       = document.getElementById('screenshot-modal-prev');
  const nextBtn       = document.getElementById('screenshot-modal-next');
  let currentIdx = -1;

  function openLightbox(idx) {
    if (idx < 0 || idx >= screenshotItems.length) return;
    currentIdx = idx;
    const item = screenshotItems[idx];
    const src  = item.dataset.screenshot;
    if (!src) return;

    modalImg.src = src;

    const descDiv = item.querySelector('.screenshot-description');
    modalDesc.textContent = (descDiv && descDiv.textContent.trim()) ? descDiv.textContent : '';

    prevBtn.style.display = idx > 0 ? 'flex' : 'none';
    nextBtn.style.display = idx < screenshotItems.length - 1 ? 'flex' : 'none';

    document.body.style.overflow = 'hidden';
    modal.classList.add('show');
    closeBtn.focus();
  }

  function closeLightbox() {
    modal.classList.remove('show');
    document.body.style.overflow = '';
    const section = document.getElementById('screenshots');
    if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function initLightbox() {
    screenshotItems.forEach((item, i) => {
      item.addEventListener('click', () => openLightbox(i));
    });
  }

  if (closeBtn) closeBtn.addEventListener('click', e => { e.stopPropagation(); closeLightbox(); });
  if (modalImg) modalImg.addEventListener('click', e => { e.stopPropagation(); closeLightbox(); });
  if (modal) modal.addEventListener('click', e => {
    if (e.target === modal || e.target.classList.contains('screenshot-modal-container')) closeLightbox();
  });
  const topbar = document.querySelector('.screenshot-modal-topbar');
  if (topbar) topbar.addEventListener('click', e => e.stopPropagation());

  if (prevBtn) prevBtn.addEventListener('click', e => { e.stopPropagation(); if (currentIdx > 0) openLightbox(currentIdx - 1); });
  if (nextBtn) nextBtn.addEventListener('click', e => { e.stopPropagation(); if (currentIdx < screenshotItems.length - 1) openLightbox(currentIdx + 1); });

  document.addEventListener('keydown', e => {
    if (!modal || !modal.classList.contains('show')) return;
    if (e.key === 'Escape') closeLightbox();
    else if (e.key === 'ArrowLeft' && currentIdx > 0) openLightbox(currentIdx - 1);
    else if (e.key === 'ArrowRight' && currentIdx < screenshotItems.length - 1) openLightbox(currentIdx + 1);
  });

  // ============================================================
  // 5. YOUTUBE HELPERS & VIDEO MODAL
  // ============================================================
  function extractPlaylistId(url) {
    if (!url) return null;
    const m = url.match(/[?&]list=([^&]+)/);
    return m ? m[1] : null;
  }

  function youtubeEmbedUrl(url) {
    const pid = extractPlaylistId(url);
    if (pid) return `https://www.youtube.com/embed/videoseries?list=${pid}`;
    return null;
  }

  // Video modal
  const videoModal   = document.getElementById('video-modal');
  const videoIframe  = document.getElementById('video-modal-iframe');
  const videoTitle   = document.getElementById('video-modal-title');
  const videoCloseBtn = document.getElementById('video-modal-close');
  const videoBackdrop = videoModal ? videoModal.querySelector('.video-modal-backdrop') : null;

  function openVideoModal(url, title) {
    const embed = youtubeEmbedUrl(url);
    if (!embed || !videoModal) return;
    videoIframe.src = embed;
    videoTitle.textContent = title || '';
    document.body.style.overflow = 'hidden';
    videoModal.classList.add('show');
    videoCloseBtn.focus();
  }

  function closeVideoModal() {
    if (!videoModal) return;
    videoModal.classList.remove('show');
    document.body.style.overflow = '';
    videoIframe.src = '';
  }

  if (videoCloseBtn) videoCloseBtn.addEventListener('click', closeVideoModal);
  if (videoBackdrop) videoBackdrop.addEventListener('click', closeVideoModal);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && videoModal && videoModal.classList.contains('show')) closeVideoModal();
  });

  // ============================================================
  // 5b. PDF CAROUSEL MODAL
  // ============================================================
  const pdfModal       = document.getElementById('pdf-modal');
  const pdfCanvas      = document.getElementById('pdf-modal-canvas');
  const pdfTitle       = document.getElementById('pdf-modal-title');
  const pdfPageInd     = document.getElementById('pdf-modal-page-indicator');
  const pdfCloseBtn    = document.getElementById('pdf-modal-close');
  const pdfPrevBtn     = document.getElementById('pdf-modal-prev');
  const pdfNextBtn     = document.getElementById('pdf-modal-next');
  const pdfDotsEl      = document.getElementById('pdf-modal-dots');
  const pdfBackdrop    = pdfModal ? pdfModal.querySelector('.pdf-modal-backdrop') : null;
  const pdfCanvasWrap  = document.getElementById('pdf-modal-canvas-wrapper');

  let pdfDoc = null, pdfPage = 1, pdfTotal = 0, pdfRendering = false;
  let pdfZoom = 0;
  const PDF_ZOOM_STEPS = [1, 1.25, 1.5, 2.0, 2.5, 3.0];
  const pdfZoomInBtn  = document.getElementById('pdf-modal-zoom-in');
  const pdfZoomOutBtn = document.getElementById('pdf-modal-zoom-out');
  const pdfZoomLevel  = document.getElementById('pdf-modal-zoom-level');
  let pdfFitScale = 1; // cached fit-to-container base scale

  function computeFitScale(pageViewport) {
    // Temporarily reset canvas so wrapper reports its true available size
    const prevW = pdfCanvas.style.width;
    const prevH = pdfCanvas.style.height;
    pdfCanvas.style.width = '0';
    pdfCanvas.style.height = '0';
    const wrapRect = pdfCanvasWrap.getBoundingClientRect();
    pdfCanvas.style.width = prevW;
    pdfCanvas.style.height = prevH;
    const availW = wrapRect.width || 600;
    const availH = wrapRect.height || 700;
    return Math.min(availW / pageViewport.width, availH / pageViewport.height);
  }

  function renderPdfPage(num) {
    if (!pdfDoc || pdfRendering) return;
    pdfRendering = true;
    pdfDoc.getPage(num).then(page => {
      const viewport0 = page.getViewport({ scale: 1 });
      pdfFitScale = computeFitScale(viewport0);
      const scale = pdfFitScale * PDF_ZOOM_STEPS[pdfZoom];
      const dpr = window.devicePixelRatio || 1;

      const viewport = page.getViewport({ scale: scale * dpr });

      const offscreen = document.createElement('canvas');
      offscreen.width = viewport.width;
      offscreen.height = viewport.height;
      const offCtx = offscreen.getContext('2d');
      offCtx.fillStyle = '#ffffff';
      offCtx.fillRect(0, 0, viewport.width, viewport.height);

      page.render({ canvasContext: offCtx, viewport: viewport }).promise.then(() => {
        pdfCanvas.width = viewport.width;
        pdfCanvas.height = viewport.height;
        pdfCanvas.style.width = (viewport.width / dpr) + 'px';
        pdfCanvas.style.height = (viewport.height / dpr) + 'px';
        const ctx = pdfCanvas.getContext('2d');
        ctx.drawImage(offscreen, 0, 0);

        pdfRendering = false;
        pdfPage = num;
        updatePdfControls();
      });
    });
  }

  function pdfZoomIn() {
    if (pdfZoom < PDF_ZOOM_STEPS.length - 1 && !pdfRendering) {
      pdfZoom++;
      renderPdfPage(pdfPage);
    }
  }
  function pdfZoomOut() {
    if (pdfZoom > 0 && !pdfRendering) {
      pdfZoom--;
      renderPdfPage(pdfPage);
    }
  }

  function updatePdfControls() {
    pdfPageInd.textContent = `${pdfPage} / ${pdfTotal}`;
    pdfPrevBtn.style.display = pdfPage > 1 ? 'flex' : 'none';
    pdfNextBtn.style.display = pdfPage < pdfTotal ? 'flex' : 'none';
    // Zoom label & button states
    if (pdfZoomLevel) pdfZoomLevel.textContent = pdfZoom === 0 ? 'Fit' : `${Math.round(PDF_ZOOM_STEPS[pdfZoom] * 100)}%`;
    if (pdfZoomOutBtn) pdfZoomOutBtn.disabled = pdfZoom <= 0;
    if (pdfZoomInBtn) pdfZoomInBtn.disabled = pdfZoom >= PDF_ZOOM_STEPS.length - 1;
    if (pdfCanvasWrap) pdfCanvasWrap.style.cursor = pdfZoom > 0 ? 'grab' : '';
    // Update dots
    if (pdfDotsEl) {
      pdfDotsEl.innerHTML = '';
      for (let i = 1; i <= pdfTotal; i++) {
        const dot = document.createElement('button');
        dot.className = 'pdf-modal-dot' + (i === pdfPage ? ' active' : '');
        dot.setAttribute('aria-label', `Page ${i}`);
        dot.addEventListener('click', () => { if (!pdfRendering) renderPdfPage(i); });
        pdfDotsEl.appendChild(dot);
      }
    }
  }

  function openPdfModal(url, title) {
    if (!pdfModal || typeof pdfjsLib === 'undefined') return;
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

    pdfTitle.textContent = title || '';
    document.body.style.overflow = 'hidden';
    pdfModal.classList.add('show');
    pdfCloseBtn.focus();

    // Reset state
    pdfPage = 1;
    pdfTotal = 0;
    pdfDoc = null;
    pdfZoom = 0;
    pdfPageInd.textContent = '';
    pdfDotsEl.innerHTML = '';
    pdfCanvas.width = 0;
    pdfCanvas.height = 0;

    pdfjsLib.getDocument(url).promise.then(doc => {
      pdfDoc = doc;
      pdfTotal = doc.numPages;
      renderPdfPage(1);
    });
  }

  function closePdfModal() {
    if (!pdfModal) return;
    pdfModal.classList.remove('show');
    document.body.style.overflow = '';
    pdfDoc = null;
  }

  if (pdfCloseBtn) pdfCloseBtn.addEventListener('click', closePdfModal);
  if (pdfBackdrop) pdfBackdrop.addEventListener('click', closePdfModal);
  if (pdfPrevBtn) pdfPrevBtn.addEventListener('click', () => { if (pdfPage > 1 && !pdfRendering) renderPdfPage(pdfPage - 1); });
  if (pdfNextBtn) pdfNextBtn.addEventListener('click', () => { if (pdfPage < pdfTotal && !pdfRendering) renderPdfPage(pdfPage + 1); });
  if (pdfZoomInBtn) pdfZoomInBtn.addEventListener('click', pdfZoomIn);
  if (pdfZoomOutBtn) pdfZoomOutBtn.addEventListener('click', pdfZoomOut);

  // Keyboard navigation
  document.addEventListener('keydown', e => {
    if (!pdfModal || !pdfModal.classList.contains('show')) return;
    if (e.key === 'Escape') closePdfModal();
    else if (e.key === 'ArrowLeft' && pdfPage > 1) renderPdfPage(pdfPage - 1);
    else if (e.key === 'ArrowRight' && pdfPage < pdfTotal) renderPdfPage(pdfPage + 1);
  });

  // Click-to-navigate: left half = prev, right half = next (only at fit zoom)
  if (pdfCanvas) {
    pdfCanvas.addEventListener('click', e => {
      if (pdfRendering || pdfZoom > 0) return;
      const rect = pdfCanvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      if (x < rect.width / 2) {
        if (pdfPage > 1) renderPdfPage(pdfPage - 1);
      } else {
        if (pdfPage < pdfTotal) renderPdfPage(pdfPage + 1);
      }
    });
    pdfCanvas.style.cursor = 'pointer';
  }

  // Click-drag panning when zoomed in
  if (pdfCanvasWrap) {
    let dragging = false, dragStartX = 0, dragStartY = 0, scrollStartX = 0, scrollStartY = 0;
    pdfCanvasWrap.addEventListener('mousedown', e => {
      if (pdfZoom <= 0) return;
      dragging = true;
      dragStartX = e.clientX;
      dragStartY = e.clientY;
      scrollStartX = pdfCanvasWrap.scrollLeft;
      scrollStartY = pdfCanvasWrap.scrollTop;
      pdfCanvasWrap.style.cursor = 'grabbing';
      e.preventDefault();
    });
    window.addEventListener('mousemove', e => {
      if (!dragging) return;
      pdfCanvasWrap.scrollLeft = scrollStartX - (e.clientX - dragStartX);
      pdfCanvasWrap.scrollTop = scrollStartY - (e.clientY - dragStartY);
    });
    window.addEventListener('mouseup', () => {
      if (!dragging) return;
      dragging = false;
      pdfCanvasWrap.style.cursor = pdfZoom > 0 ? 'grab' : '';
    });
  }

  // Touch swipe support for PDF carousel
  if (pdfCanvasWrap) {
    let touchStartX = 0;
    pdfCanvasWrap.addEventListener('touchstart', e => { touchStartX = e.changedTouches[0].clientX; }, { passive: true });
    pdfCanvasWrap.addEventListener('touchend', e => {
      const dx = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(dx) > 50) {
        if (dx < 0 && pdfPage < pdfTotal) renderPdfPage(pdfPage + 1);
        else if (dx > 0 && pdfPage > 1) renderPdfPage(pdfPage - 1);
      }
    }, { passive: true });
  }

  // Re-render on resize to keep canvas fitting
  let pdfResizeTimer;
  window.addEventListener('resize', () => {
    if (!pdfModal || !pdfModal.classList.contains('show') || !pdfDoc) return;
    clearTimeout(pdfResizeTimer);
    pdfResizeTimer = setTimeout(() => renderPdfPage(pdfPage), 150);
  });

  // ============================================================
  // 6. RELEASE NOTES — load from index.txt only (no brute-force)
  // ============================================================
  async function loadReleaseNotes() {
    const container = document.getElementById('release-notes-container');
    if (!container || container.dataset.loaded === 'true') return;

    try {
      // Load from index.txt
      const indexResp = await fetch('release_notes/index.txt');
      if (!indexResp.ok) throw new Error('No index');
      const indexText = await indexResp.text();
      const files = indexText.split('\n').map(l => l.trim()).filter(l => l.endsWith('.txt'))
        .map(l => l.startsWith('release_notes/') ? l : `release_notes/${l}`);

      if (!files.length) { container.innerHTML = '<div class="release-notes-loading">No release notes found.</div>'; return; }

      // Fetch contents
      const notes = (await Promise.all(files.map(async fp => {
        try {
          const r = await fetch(fp);
          if (!r.ok) return null;
          const content = await r.text();
          const m = fp.match(/(\d+\.\d+\.\d+)/);
          return { version: m ? m[1] : 'Unknown', content, filePath: fp };
        } catch { return null; }
      }))).filter(Boolean);

      if (!notes.length) { container.innerHTML = '<div class="release-notes-loading">No release notes found.</div>'; return; }

      // Sort newest first
      notes.sort((a, b) => {
        const pa = a.version.split('.').map(Number), pb = b.version.split('.').map(Number);
        for (let i = 0; i < 3; i++) { if ((pb[i] || 0) !== (pa[i] || 0)) return (pb[i] || 0) - (pa[i] || 0); }
        return 0;
      });

      // Check for YouTube links and PDF links
      const enriched = await Promise.all(notes.map(async note => {
        const ytPaths = [
          `release_notes/Youtube_Tutorial_Link_${note.version}.txt`,
          `local/release_notes/Youtube_Tutorial_Link_${note.version}.txt`
        ];
        let youtubeLink = null;
        for (const p of ytPaths) {
          try { const r = await fetch(p); if (r.ok) { const t = (await r.text()).trim(); if (t) { youtubeLink = t; break; } } } catch {}
        }

        let pdfLink = null;
        if (!youtubeLink) {
          const pdfPaths = [
            `release_notes/Pdf_Link_${note.version}.txt`,
            `local/release_notes/Pdf_Link_${note.version}.txt`
          ];
          for (const p of pdfPaths) {
            try { const r = await fetch(p); if (r.ok) { const t = (await r.text()).trim(); if (t) { pdfLink = `release_notes/${t}`; break; } } } catch {}
          }
        }

        return { ...note, youtubeLink, pdfLink };
      }));

      // Render
      container.innerHTML = enriched.map((note, i) => renderNote(note, i === 0)).join('');
      container.dataset.loaded = 'true';

      // Accordion toggle + YouTube modal / PDF modal buttons
      container.querySelectorAll('.release-note-header').forEach(header => {
        header.addEventListener('click', e => {
          // YouTube button
          const ytBtn = e.target.closest('.youtube-logo-link-release-notes');
          if (ytBtn) {
            e.stopPropagation();
            const url = ytBtn.dataset.youtube;
            const ver = ytBtn.dataset.version;
            if (url) openVideoModal(url, `Tutorial — Version ${ver}`);
            return;
          }
          // PDF button
          const pdfBtn = e.target.closest('.pdf-preview-btn-release-notes');
          if (pdfBtn) {
            e.stopPropagation();
            const pdfUrl = pdfBtn.dataset.pdf;
            const ver = pdfBtn.dataset.version;
            if (pdfUrl) openPdfModal(pdfUrl, `Slides — Version ${ver}`);
            return;
          }
          header.closest('.release-note-item').classList.toggle('open');
        });
      });

      // Animate
      container.querySelectorAll('.release-note-item').forEach(el => {
        el.classList.add('fade-in-up');
        fadeObserver.observe(el);
      });

    } catch {
      container.innerHTML = '<div class="release-notes-loading">Error loading release notes.</div>';
    }
  }

  function parseNote(content) {
    const lines = content.split('\n').map(l => l.trim()).filter(Boolean);
    const sections = { 'New Features': [], 'Bug Fixes': [], 'Improvements': [] };
    let current = null;
    for (const line of lines) {
      if (line === 'New Features:') current = 'New Features';
      else if (line === 'Bug Fixes:') current = 'Bug Fixes';
      else if (line === 'Improvements:') current = 'Improvements';
      else if (current && line.startsWith('\u2022')) sections[current].push(line.substring(1).trim());
      else if (current && sections[current].length) sections[current][sections[current].length - 1] += ' ' + line;
    }
    return sections;
  }

  function escapeHtml(text) {
    const d = document.createElement('div');
    d.textContent = text;
    return d.innerHTML;
  }

  function renderNote(note, defaultOpen) {
    const sections = parseNote(note.content);
    const hasContent = Object.values(sections).some(a => a.length > 0);
    if (!hasContent) return '';

    const openClass = defaultOpen ? ' open' : '';
    let html = `<div class="release-note-item${openClass}">`;
    html += `<div class="release-note-header">`;
    html += `<div class="release-note-version">Version ${escapeHtml(note.version)}</div>`;
    if (note.youtubeLink) {
      html += `<button class="youtube-logo-link-release-notes" data-youtube="${escapeHtml(note.youtubeLink)}" data-version="${escapeHtml(note.version)}" aria-label="Watch Tutorial" type="button">`;
      html += `<img src="icons/WatchonYouTube-black-SVG.svg" alt="Watch on YouTube" class="youtube-logo-release-notes">`;
      html += `</button>`;
    } else if (note.pdfLink) {
      html += `<button class="pdf-preview-btn-release-notes" data-pdf="${escapeHtml(note.pdfLink)}" data-version="${escapeHtml(note.version)}" aria-label="View PDF Tutorial" type="button">`;
      html += `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="pdf-icon-release-notes" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-9.5 8.5c0 .83-.67 1.5-1.5 1.5H7v2H5.5V9H8c.83 0 1.5.67 1.5 1.5v1zm5 2c0 .83-.67 1.5-1.5 1.5h-2.5V9H13c.83 0 1.5.67 1.5 1.5v3zm4-3H17v1h1.5V13H17v2h-1.5V9h3v1.5zM7 11.5h1v-1H7v1zM13 13h1v-3h-1v3z"/></svg>`;
      html += `<span class="pdf-btn-label">View Slides</span>`;
      html += `</button>`;
    }
    html += `</div>`;
    html += `<div class="release-note-content">`;

    const order = ['New Features', 'Bug Fixes', 'Improvements'];
    order.forEach(key => {
      if (sections[key].length) {
        const cls = key.toLowerCase().replace(/\s+/g, '-');
        html += `<h4 data-section="${cls}">${key}</h4><ul>`;
        sections[key].forEach(item => { html += `<li>${escapeHtml(item)}</li>`; });
        html += `</ul>`;
      }
    });

    html += `</div></div>`;
    return html;
  }

  // Lazy-load release notes
  const rnSection = document.getElementById('release-notes');
  if (rnSection) {
    const rnObserver = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        loadReleaseNotes();
        rnObserver.unobserve(rnSection);
      }
    }, { rootMargin: '200px' });
    rnObserver.observe(rnSection);
  }

  // ============================================================
  // 7. TUTORIALS — load YouTube playlists from release_notes/
  // ============================================================
  async function loadTutorials() {
    const grid = document.getElementById('tutorials-grid');
    if (!grid || grid.dataset.loaded === 'true') return;

    try {
      const indexResp = await fetch('release_notes/index.txt');
      if (!indexResp.ok) throw new Error('No index');
      const indexText = await indexResp.text();

      // Extract unique versions from the release notes index
      const versions = indexText.split('\n').map(l => l.trim()).filter(Boolean)
        .map(l => { const m = l.match(/(\d+\.\d+\.\d+)/); return m ? m[1] : null; })
        .filter(Boolean);

      // Deduplicate and sort newest first
      const unique = [...new Set(versions)];
      unique.sort((a, b) => {
        const pa = a.split('.').map(Number), pb = b.split('.').map(Number);
        for (let i = 0; i < 3; i++) { if ((pb[i] || 0) !== (pa[i] || 0)) return (pb[i] || 0) - (pa[i] || 0); }
        return 0;
      });

      // Fetch YouTube links for each version
      const tutorials = (await Promise.all(unique.map(async version => {
        const paths = [
          `release_notes/Youtube_Tutorial_Link_${version}.txt`,
          `local/release_notes/Youtube_Tutorial_Link_${version}.txt`
        ];
        for (const p of paths) {
          try {
            const r = await fetch(p);
            if (r.ok) {
              const url = (await r.text()).trim();
              if (url) return { version, url };
            }
          } catch {}
        }
        return null;
      }))).filter(Boolean);

      if (!tutorials.length) {
        grid.innerHTML = '<div class="tutorials-loading">No tutorials available yet.</div>';
        return;
      }

      grid.innerHTML = tutorials.map(t => {
        const embedUrl = youtubeEmbedUrl(t.url);
        if (!embedUrl) return '';
        return `<div class="tutorial-card fade-in-up" data-video-url="${escapeHtml(t.url)}" data-video-title="Tutorial — Version ${escapeHtml(t.version)}" role="button" tabindex="0" aria-label="Play tutorial for version ${escapeHtml(t.version)}">
          <div class="tutorial-video-wrapper tutorial-thumbnail">
            <div class="tutorial-play-overlay">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 68 48" width="68" height="48"><path d="M66.52 7.74c-.78-2.93-2.49-5.41-5.42-6.19C55.79.13 34 0 34 0S12.21.13 6.9 1.55c-2.93.78-4.63 3.26-5.42 6.19C.06 13.05 0 24 0 24s.06 10.95 1.48 16.26c.78 2.93 2.49 5.41 5.42 6.19C12.21 47.87 34 48 34 48s21.79-.13 27.1-1.55c2.93-.78 4.63-3.26 5.42-6.19C67.94 34.95 68 24 68 24s-.06-10.95-1.48-16.26z" fill="#212121" fill-opacity=".8"/><path d="M45 24 27 14v20" fill="#fff"/></svg>
            </div>
          </div>
          <div class="tutorial-card-label">
            <span class="tutorial-card-version">Version ${escapeHtml(t.version)}</span>
            <span class="tutorial-card-badge">Playlist</span>
          </div>
        </div>`;
      }).join('');

      // Attach click handlers to tutorial cards
      grid.querySelectorAll('.tutorial-card[data-video-url]').forEach(card => {
        function handleOpen() {
          openVideoModal(card.dataset.videoUrl, card.dataset.videoTitle);
        }
        card.addEventListener('click', handleOpen);
        card.addEventListener('keydown', e => {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleOpen(); }
        });
      });

      // Async-fetch real YouTube thumbnails via oEmbed
      const allCards = grid.querySelectorAll('.tutorial-card[data-video-url]');
      tutorials.forEach((t, i) => {
        const card = allCards[i];
        if (!card) return;
        const wrapper = card.querySelector('.tutorial-thumbnail');
        if (!wrapper) return;
        fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(t.url)}&format=json`)
          .then(r => r.ok ? r.json() : null)
          .then(data => {
            if (data && data.thumbnail_url) {
              const img = new Image();
              img.onload = () => {
                wrapper.style.backgroundImage = `url(${data.thumbnail_url})`;
                wrapper.classList.add('has-thumb');
              };
              img.src = data.thumbnail_url;
            }
          })
          .catch(() => {});
      });

      grid.dataset.loaded = 'true';
      observeFadeElements();
    } catch {
      grid.innerHTML = '<div class="tutorials-loading">Could not load tutorials.</div>';
    }
  }

  // Lazy-load tutorials
  const tutSection = document.getElementById('tutorials');
  if (tutSection) {
    const tutObserver = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        loadTutorials();
        tutObserver.unobserve(tutSection);
      }
    }, { rootMargin: '200px' });
    tutObserver.observe(tutSection);
  }

  // ============================================================
  // 8. INIT
  // ============================================================
  document.addEventListener('DOMContentLoaded', async () => {
    await buildScreenshots();
    observeFadeElements();
  });

})();
