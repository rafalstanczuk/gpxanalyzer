// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add scroll effect to navbar
let lastScroll = 0;
const navbar = document.querySelector('.navbar');
const navToggle = document.querySelector('.nav-toggle');
const navLinksContainer = document.querySelector('.nav-links');
const navOverlay = document.querySelector('.nav-overlay');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 100) {
        navbar.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.4)';
    } else {
        navbar.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.3)';
    }
    
    lastScroll = currentScroll;
});

if (navToggle && navLinksContainer) {
    const closeMenu = () => {
        navLinksContainer.classList.remove('open');
        navToggle.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('menu-open');
        navToggle.focus({ preventScroll: true });
    };

    const openMenu = () => {
        navLinksContainer.classList.add('open');
        navToggle.classList.add('open');
        navToggle.setAttribute('aria-expanded', 'true');
        document.body.classList.add('menu-open');
        const firstLink = navLinksContainer.querySelector('a');
        if (firstLink) {
            firstLink.focus({ preventScroll: true });
        }
    };

    navToggle.addEventListener('click', () => {
        const isOpen = navLinksContainer.classList.contains('open');
        if (isOpen) {
            closeMenu();
        } else {
            openMenu();
        }
    });

    navLinksContainer.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            if (navLinksContainer.classList.contains('open')) {
                closeMenu();
            }
        });
    });

    document.addEventListener('click', (event) => {
        if (!navLinksContainer.contains(event.target) && !navToggle.contains(event.target) && navLinksContainer.classList.contains('open')) {
            closeMenu();
        }
    });

    if (navOverlay) {
        navOverlay.addEventListener('click', closeMenu);
    }

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && navLinksContainer.classList.contains('open')) {
            closeMenu();
        }

        if (event.key === 'Tab' && navLinksContainer.classList.contains('open')) {
            const focusable = navLinksContainer.querySelectorAll('a');
            if (focusable.length === 0) return;
            const first = focusable[0];
            const last = focusable[focusable.length - 1];

            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
            }
        }
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth > 1024 && navLinksContainer.classList.contains('open')) {
            closeMenu();
        }
    });
}

// Add fade-in animation on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe feature cards and screenshots
document.addEventListener('DOMContentLoaded', async () => {
    // Helper: build screenshot items from index.txt so adding new screenshots
    // only requires dropping files + updating the index
    async function buildScreenshotsFromIndex() {
        const grid = document.querySelector('.screenshots-grid');
        if (!grid) return Array.from(document.querySelectorAll('.screenshot-item'));

        try {
            const resp = await fetch('screenshots/index.txt', { cache: 'default' });
            if (!resp.ok) {
                // Fallback to existing static markup
                return Array.from(document.querySelectorAll('.screenshot-item'));
            }

            const text = await resp.text();
            const basenames = text
                .split('\n')
                .map(line => line.trim())
                .filter(line => line.length > 0);

            if (basenames.length === 0) {
                return Array.from(document.querySelectorAll('.screenshot-item'));
            }

            // Rebuild grid from index
            grid.innerHTML = '';

            basenames.forEach(name => {
                const pngPath = `screenshots/${name}.png`;
                const mdPath = `screenshots/${name}.md`;

                const item = document.createElement('div');
                item.className = 'screenshot-item';
                item.dataset.screenshot = pngPath;
                item.dataset.descriptionMd = mdPath;

                const img = document.createElement('img');
                img.src = pngPath;
                img.alt = 'GpxAnalyzer Screenshot';
                img.className = 'screenshot-img';

                const desc = document.createElement('div');
                desc.className = 'screenshot-description';
                desc.textContent = 'Loading description...';

                item.appendChild(img);
                item.appendChild(desc);
                grid.appendChild(item);
            });

            return Array.from(grid.querySelectorAll('.screenshot-item'));
        } catch (e) {
            // Network or file:// error – fall back to existing DOM
            return Array.from(document.querySelectorAll('.screenshot-item'));
        }
    }

    // Build screenshots from index (if available)
    const screenshotItems = await buildScreenshotsFromIndex();

    // Animate feature cards + screenshots
    const animatedElements = [
        ...document.querySelectorAll('.feature-card'),
        ...screenshotItems,
    ];
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });

    // Screenshot lightbox functionality
    const modal = document.getElementById('screenshot-modal');
    const modalImg = document.getElementById('screenshot-modal-img');
    const modalDescription = document.getElementById('screenshot-modal-description');
    const closeBtn = document.querySelector('.screenshot-modal-close');
    const prevBtn = document.getElementById('screenshot-modal-prev');
    const nextBtn = document.getElementById('screenshot-modal-next');
    
    // Store screenshot section position for scrolling back after close
    let screenshotSectionPosition = null;
    
    // Track current screenshot index
    let currentScreenshotIndex = -1;
    
    // Function to close modal and scroll back to screenshot section
    function closeModalAndScrollBack() {
        modal.classList.remove('show');
        
        // Restore body scroll
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        document.documentElement.style.overflow = '';
        document.documentElement.style.position = '';
        document.documentElement.style.top = '';
        document.documentElement.style.width = '';
        
        // Scroll back to screenshot section if we have the position stored
        if (screenshotSectionPosition !== null) {
            // Use requestAnimationFrame to ensure DOM is updated
            requestAnimationFrame(() => {
                window.scrollTo({
                    top: screenshotSectionPosition,
                    behavior: 'smooth'
                });
                screenshotSectionPosition = null; // Reset after scrolling
            });
        }
    }

    // Function to open modal with a specific screenshot
    function openScreenshotModal(index) {
        if (index < 0 || index >= screenshotItems.length) return;
        
        const item = screenshotItems[index];
        currentScreenshotIndex = index;
        
        const screenshotSrc = item.getAttribute('data-screenshot');
        
        if (!modal || !modalImg) {
            return;
        }
        
        if (screenshotSrc) {
            // Reset image first
            modalImg.src = '';
            modalImg.style.display = 'none';
            
            // Set image source
            modalImg.src = screenshotSrc;
            
            // Force visibility
            modalImg.style.display = 'block';
            modalImg.style.visibility = 'visible';
            modalImg.style.opacity = '1';
            modalImg.style.width = 'auto';
            modalImg.style.height = 'auto';
            
            // Ensure image loads
            modalImg.onload = function() {
                this.style.display = 'block';
                this.style.visibility = 'visible';
                this.style.opacity = '1';
            };
            
            modalImg.onerror = function() {
                this.alt = 'Image failed to load: ' + screenshotSrc;
                this.style.display = 'block';
                this.style.visibility = 'visible';
                this.style.opacity = '1';
            };
                
                // Get description from the screenshot item
                const descriptionDiv = item.querySelector('.screenshot-description');
                if (descriptionDiv && modalDescription) {
                    const descriptionText = descriptionDiv.textContent.trim();
                    if (descriptionText && descriptionText !== 'Loading description...' && 
                        descriptionText !== 'Please view via web server' && 
                        descriptionText !== 'Description unavailable' &&
                        descriptionText !== 'No description available') {
                        modalDescription.textContent = descriptionText;
                    } else {
                        // Fallback to alt text or a default message
                        const altText = item.querySelector('img')?.alt || 'Screenshot';
                        modalDescription.textContent = altText.replace('GpxAnalyzer Screenshot - ', '');
                    }
                }
                
                // Store screenshot section position BEFORE scrolling
                const screenshotSection = document.getElementById('screenshots');
                if (screenshotSection) {
                    screenshotSectionPosition = screenshotSection.getBoundingClientRect().top + window.scrollY;
                }
                
                // SCROLL TO TOP FIRST - this is critical!
                window.scrollTo(0, 0);
                document.documentElement.scrollTop = 0;
                document.body.scrollTop = 0;
                
                // Prevent body scroll AFTER scrolling to top
                const scrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
                document.body.style.position = 'fixed';
                document.body.style.top = '0px'; // Always 0 since we scrolled to top
                document.body.style.width = '100%';
                document.body.style.overflow = 'hidden';
                document.documentElement.style.overflow = 'hidden';
                document.documentElement.style.position = 'fixed';
                document.documentElement.style.top = '0px'; // Always 0 since we scrolled to top
                document.documentElement.style.width = '100%';
                
                // Reset ALL scroll positions BEFORE showing modal
                const container = document.querySelector('.screenshot-modal-container');
                if (container) {
                    container.scrollTop = 0;
                    container.scrollLeft = 0;
                }
                modal.scrollTop = 0;
                modal.scrollLeft = 0;
                
                // Show modal
                modal.classList.add('show');
                
                // Update navigation buttons
                updateNavigationButtons();
                
                // Wait for modal to render, then set up image
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        // Get viewport dimensions
                        const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
                        const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
                        const topbar = document.querySelector('.screenshot-modal-topbar');
                        const topbarHeight = topbar ? (topbar.offsetHeight || topbar.clientHeight) : 100;
                        const availableHeight = viewportHeight - topbarHeight - 40;
                        
                        // Set image constraints
                        const maxImgWidth = Math.min(viewportWidth * 0.9, 1440);
                        const maxImgHeight = Math.min(availableHeight * 0.95, 2880);
                        
                        // Reset all image styles to defaults
                        modalImg.style.cssText = '';
                        
                        // Apply clean styles for flexbox centering
                        modalImg.style.display = 'block';
                        modalImg.style.visibility = 'visible';
                        modalImg.style.opacity = '1';
                        modalImg.style.position = 'static';
                        modalImg.style.maxWidth = maxImgWidth + 'px';
                        modalImg.style.maxHeight = maxImgHeight + 'px';
                        modalImg.style.width = 'auto';
                        modalImg.style.height = 'auto';
                        modalImg.style.objectFit = 'contain';
                        modalImg.style.margin = 'auto';
                        
                        // Ensure container is set up for flexbox
                        if (container) {
                            container.style.overflow = 'hidden';
                            container.style.position = 'relative';
                            container.scrollTop = 0;
                            container.scrollLeft = 0;
                            // Force container to be at viewport top
                            container.style.top = '0';
                            container.style.left = '0';
                        }
                        
                        // Ensure modal is at viewport top
                        modal.style.top = '0';
                        modal.style.left = '0';
                        modal.scrollTop = 0;
                        modal.scrollLeft = 0;
                        
                        // Force a reflow
                        void modal.offsetHeight;
                        void container?.offsetHeight;
                        void modalImg.offsetHeight;
                        
                        // Check final position after reflow
                        setTimeout(() => {
                            const rect = modalImg.getBoundingClientRect();
                            const containerRect = container?.getBoundingClientRect();
                            const modalRect = modal.getBoundingClientRect();
                            
                            // Determine if the image is within the viewport
                            const rectVisible = (
                                rect.top >= 0 &&
                                rect.left >= 0 &&
                                rect.bottom <= viewportHeight &&
                                rect.right <= viewportWidth
                            );
                            
                            // If image is still off-screen, force it to center using fixed positioning
                            if (rect.top < 0 || rect.top > viewportHeight || !rectVisible) {
                                const imgWidth = rect.width || modalImg.offsetWidth;
                                const imgHeight = rect.height || modalImg.offsetHeight;
                                const centerX = viewportWidth / 2;
                                const centerY = topbarHeight + (availableHeight / 2);
                                
                                modalImg.style.position = 'fixed';
                                modalImg.style.top = (centerY - imgHeight / 2) + 'px';
                                modalImg.style.left = (centerX - imgWidth / 2) + 'px';
                                modalImg.style.margin = '0';
                                modalImg.style.zIndex = '10003';
                            }
                        }, 200);
                    });
                });
                
                // Force a reflow to ensure display
                void modal.offsetHeight;
            } else {
                console.error('No screenshot source found');
            }
    }
    
    // Navigation functions
    function showNextScreenshot() {
        if (currentScreenshotIndex < screenshotItems.length - 1) {
            openScreenshotModal(currentScreenshotIndex + 1);
        }
    }
    
    function showPreviousScreenshot() {
        if (currentScreenshotIndex > 0) {
            openScreenshotModal(currentScreenshotIndex - 1);
        }
    }
    
    // Update navigation button visibility
    function updateNavigationButtons() {
        if (prevBtn) {
            prevBtn.style.display = currentScreenshotIndex > 0 ? 'flex' : 'none';
        }
        if (nextBtn) {
            nextBtn.style.display = currentScreenshotIndex < screenshotItems.length - 1 ? 'flex' : 'none';
        }
    }
    
    // Open modal when screenshot is clicked
    screenshotItems.forEach((item, index) => {
        item.addEventListener('click', () => {
            openScreenshotModal(index);
        });
    });

    // Close modal when close button is clicked
    if (closeBtn) {
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent event bubbling
            closeModalAndScrollBack();
        });
    }

    // Close modal when clicking on the image (but not on navigation buttons)
    if (modalImg) {
        modalImg.addEventListener('click', (e) => {
            // Don't close if clicking on navigation buttons
            if (e.target.closest('.screenshot-modal-nav')) {
                return;
            }
            e.stopPropagation(); // Prevent event from bubbling to modal
            closeModalAndScrollBack();
        });
    }
    
    // Close modal when clicking outside the image (on the dark background or container)
    modal.addEventListener('click', (e) => {
        // Close if clicking on modal background or container (but not on image or topbar)
        if (e.target === modal || e.target.classList.contains('screenshot-modal-container')) {
            closeModalAndScrollBack();
        }
    });
    
    // Prevent closing when clicking on topbar (except close button)
    const topbar = document.querySelector('.screenshot-modal-topbar');
    if (topbar) {
        topbar.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent closing modal when clicking on topbar
        });
    }

    // Navigation button handlers
    if (prevBtn) {
        prevBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            showPreviousScreenshot();
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            showNextScreenshot();
        });
    }
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (!modal.classList.contains('show')) return;
        
        if (e.key === 'Escape') {
            closeModalAndScrollBack();
        } else if (e.key === 'ArrowLeft') {
            showPreviousScreenshot();
        } else if (e.key === 'ArrowRight') {
            showNextScreenshot();
        }
    });

    // Load descriptions from markdown files
    async function loadScreenshotDescriptions() {
        const screenshotItems = document.querySelectorAll('.screenshot-item[data-description-md]');
        
        if (screenshotItems.length === 0) {
            console.warn('No screenshot items with data-description-md found');
            return;
        }
        
        console.log(`Loading descriptions for ${screenshotItems.length} screenshots...`);
        
        // Use Promise.all to handle all async operations
        const loadPromises = Array.from(screenshotItems).map(async (item) => {
            const mdPath = item.getAttribute('data-description-md');
            const descriptionDiv = item.querySelector('.screenshot-description');
            
            if (!mdPath || !descriptionDiv) {
                console.warn('Missing mdPath or descriptionDiv for item:', item);
                return;
            }
            
            // Mark as loading
            descriptionDiv.classList.add('loading');
            
            try {
                console.log(`Fetching: ${mdPath}`);
                const response = await fetch(mdPath, {
                    method: 'GET',
                    headers: {
                        'Accept': 'text/markdown, text/plain, */*'
                    }
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                
                const markdown = await response.text();
                console.log(`Loaded ${mdPath}, content length: ${markdown.length}`);
                
                // Parse markdown: remove the # title line and get the rest
                const allLines = markdown.split('\n');
                const lines = allLines.map(line => line.trim()).filter(line => line.length > 0);
                
                // Remove loading class
                descriptionDiv.classList.remove('loading');
                
                // Find the first line that starts with # (title)
                let titleIndex = -1;
                for (let i = 0; i < lines.length; i++) {
                    if (lines[i].startsWith('#')) {
                        titleIndex = i;
                        break;
                    }
                }
                
                if (titleIndex >= 0 && lines.length > titleIndex + 1) {
                    // Skip the title line and get everything after it
                    const description = lines.slice(titleIndex + 1).join(' ').trim();
                    if (description) {
                        descriptionDiv.textContent = description;
                        console.log(`✓ Loaded description for ${mdPath}`);
                        return;
                    }
                }
                
                // Fallback: use the title without the # if no description found
                if (lines.length > 0) {
                    const title = lines[0].replace(/^#\s*/, '').trim();
                    if (title) {
                        descriptionDiv.textContent = title;
                        console.log(`✓ Using title as description for ${mdPath}`);
                        return;
                    }
                }
                
                // If we get here, no content was found
                descriptionDiv.textContent = 'No description available';
                console.warn(`No description content found in ${mdPath}`);
            } catch (error) {
                console.error(`✗ Error loading description from ${mdPath}:`, error);
                descriptionDiv.classList.remove('loading');
                
                // Check if it's a network/CORS error (file:// protocol)
                if (error.name === 'TypeError' && error.message.includes('fetch')) {
                    descriptionDiv.textContent = 'Please view via web server';
                } else {
                    descriptionDiv.textContent = 'Description unavailable';
                }
            }
        });
        
        // Wait for all descriptions to load
        try {
            await Promise.all(loadPromises);
            console.log('All descriptions loaded');
        } catch (error) {
            console.error('Error in Promise.all for descriptions:', error);
        }
    }
    
    // Load descriptions when DOM is ready
    // Note: This requires a web server (not file:// protocol)
    loadScreenshotDescriptions().catch(error => {
        console.error('Fatal error loading screenshot descriptions:', error);
        // If fetch fails (e.g., file:// protocol), show helpful message
        if (error.message && error.message.includes('fetch')) {
            document.querySelectorAll('.screenshot-description').forEach(div => {
                if (div.textContent === 'Loading description...') {
                    div.classList.remove('loading');
                    div.textContent = 'Please view via web server to load descriptions';
                }
            });
        }
    });

    // Cache for release notes to avoid re-discovery
    let releaseNotesCache = null;
    
    // Discover release notes files dynamically with optimized approach
    async function discoverReleaseNotesFiles() {
        // Return cached result if available
        if (releaseNotesCache) {
            console.log(`Using cached release notes (${releaseNotesCache.length} files)`);
            return releaseNotesCache;
        }
        
        // First, try to load an index file if it exists
        try {
            const indexResponse = await fetch('release_notes/index.txt', {
                cache: 'default'
            });
            if (indexResponse.ok) {
                const indexContent = await indexResponse.text();
                const files = indexContent.split('\n')
                    .map(line => line.trim())
                    .filter(line => line.length > 0 && line.endsWith('.txt'))
                    .map(line => line.startsWith('release_notes/') ? line : `release_notes/${line}`);
                console.log(`Found ${files.length} files from index.txt`);
                releaseNotesCache = files;
                return files;
            }
        } catch (error) {
            console.log('No index.txt found, using smart discovery...');
        }

        // Smart discovery: Binary search approach starting from likely versions
        const basePath = 'release_notes/GOOGLE_PLAY_RELEASE_NOTES_';
        const discoveredFiles = [];
        
        console.log('Discovering release notes files (optimized)...');
        
        // Strategy: Start from a reasonable high version and work backwards
        // Stop early when we find no files in a range
        const startMajor = 5; // Start from version 5.x.x
        const maxMinor = 20;
        const maxPatch = 20;
        const batchSize = 10; // Smaller batches for faster early termination
        let consecutiveEmptyBatches = 0;
        const maxEmptyBatches = 3; // Stop after 3 empty batches
        
        // Generate versions starting from highest, working backwards
        const allVersions = [];
        for (let major = startMajor; major >= 0; major--) {
            for (let minor = maxMinor - 1; minor >= 0; minor--) {
                for (let patch = maxPatch - 1; patch >= 0; patch--) {
                    allVersions.push(`${major}.${minor}.${patch}`);
                }
            }
        }
        
        // Process in smaller batches with early termination
        for (let i = 0; i < allVersions.length; i += batchSize) {
            // Early termination if we've found files and hit empty batches
            if (discoveredFiles.length > 0 && consecutiveEmptyBatches >= maxEmptyBatches) {
                console.log(`Early termination: Found ${discoveredFiles.length} files, stopping after ${consecutiveEmptyBatches} empty batches`);
                break;
            }
            
            const batch = allVersions.slice(i, i + batchSize);
            const batchPromises = batch.map(async (version) => {
                const filePath = `${basePath}${version}.txt`;
                try {
                    const response = await fetch(filePath, { 
                        method: 'HEAD', // Use HEAD request first (lighter)
                        cache: 'default'
                    });
                    if (response.ok) {
                        // Only fetch content if file exists
                        const contentResponse = await fetch(filePath, { cache: 'default' });
                        if (contentResponse.ok) {
                            const content = await contentResponse.text();
                            const versionMatch = filePath.match(/(\d+\.\d+\.\d+)/);
                            const version = versionMatch ? versionMatch[1] : 'Unknown';
                            return { version, content, filePath };
                        }
                    }
                } catch (error) {
                    // File doesn't exist, ignore
                }
                return null;
            });
            
            const batchResults = await Promise.all(batchPromises);
            const found = batchResults.filter(note => note !== null);
            
            if (found.length > 0) {
                discoveredFiles.push(...found);
                consecutiveEmptyBatches = 0; // Reset counter when we find files
            } else {
                consecutiveEmptyBatches++;
            }
        }
        
        console.log(`Discovered ${discoveredFiles.length} release notes files`);
        releaseNotesCache = discoveredFiles;
        return discoveredFiles;
    }

    // Load and display release notes (lazy loaded when section is visible)
    async function loadReleaseNotes() {
        const container = document.getElementById('release-notes-container');
        if (!container) {
            console.warn('Release notes container not found');
            return;
        }

        // Check if already loaded
        if (container.dataset.loaded === 'true') {
            return;
        }

        try {
            // Discover and fetch release notes files dynamically
            const releaseNotesFiles = await discoverReleaseNotesFiles();

            if (releaseNotesFiles.length === 0) {
                container.innerHTML = '<div class="release-notes-loading">No release notes found.</div>';
                return;
            }

            // Fetch all release notes (if discovery returned file paths, fetch content)
            // If discovery already returned content, use it directly
            const releaseNotesPromises = releaseNotesFiles.map(async (filePathOrNote) => {
                // Check if it's already a note object with content
                if (typeof filePathOrNote === 'object' && filePathOrNote.content) {
                    return filePathOrNote;
                }
                
                // Otherwise, it's a file path - fetch the content
                const filePath = filePathOrNote;
                try {
                    const response = await fetch(filePath);
                    if (!response.ok) {
                        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                    }
                    const content = await response.text();
                    
                    // Extract version from filename
                    const versionMatch = filePath.match(/(\d+\.\d+\.\d+)/);
                    const version = versionMatch ? versionMatch[1] : 'Unknown';
                    
                    return { version, content, filePath };
                } catch (error) {
                    console.error(`Error loading ${filePath}:`, error);
                    return null;
                }
            });

            const releaseNotes = (await Promise.all(releaseNotesPromises))
                .filter(note => note !== null);

            if (releaseNotes.length === 0) {
                container.innerHTML = '<div class="release-notes-loading">No release notes found.</div>';
                return;
            }

            // Sort by version (newest first)
            releaseNotes.sort((a, b) => {
                const aParts = a.version.split('.').map(Number);
                const bParts = b.version.split('.').map(Number);
                for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
                    const aVal = aParts[i] || 0;
                    const bVal = bParts[i] || 0;
                    if (bVal !== aVal) return bVal - aVal;
                }
                return 0;
            });

            // Parse and render release notes
            container.innerHTML = releaseNotes.map(note => {
                const parsed = parseReleaseNote(note.content, note.version);
                return renderReleaseNote(parsed, note.version);
            }).join('');

            // Mark as loaded
            container.dataset.loaded = 'true';

            // Animate release notes on scroll
            const releaseNoteItems = document.querySelectorAll('.release-note-item');
            releaseNoteItems.forEach((el, index) => {
                el.style.opacity = '0';
                el.style.transform = 'translateY(20px)';
                el.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
                observer.observe(el);
            });

        } catch (error) {
            console.error('Error loading release notes:', error);
            container.innerHTML = '<div class="release-notes-loading">Error loading release notes. Please view via web server.</div>';
        }
    }
    
    // Lazy load release notes when section becomes visible
    const releaseNotesSection = document.getElementById('release-notes');
    if (releaseNotesSection) {
        const releaseNotesObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    loadReleaseNotes().catch(error => {
                        console.error('Error in lazy loading release notes:', error);
                    });
                    releaseNotesObserver.unobserve(entry.target); // Load only once
                }
            });
        }, {
            rootMargin: '100px' // Start loading 100px before section is visible
        });
        
        releaseNotesObserver.observe(releaseNotesSection);
    } else {
        // Fallback: Load immediately if section not found (shouldn't happen)
        loadReleaseNotes();
    }

    // Parse release note content into structured format
    function parseReleaseNote(content, version) {
        const lines = content.split('\n').map(line => line.trim()).filter(line => line.length > 0);
        const sections = {
            'New Features': [],
            'Bug Fixes': [],
            'Improvements': []
        };
        
        let currentSection = null;
        
        for (const line of lines) {
            if (line === 'New Features:') {
                currentSection = 'New Features';
            } else if (line === 'Bug Fixes:') {
                currentSection = 'Bug Fixes';
            } else if (line === 'Improvements:') {
                currentSection = 'Improvements';
            } else if (currentSection && line.startsWith('•')) {
                sections[currentSection].push(line.substring(1).trim());
            } else if (currentSection && line.length > 0) {
                // Handle multi-line items
                if (sections[currentSection].length > 0) {
                    sections[currentSection][sections[currentSection].length - 1] += ' ' + line;
                }
            }
        }
        
        return sections;
    }

    // Render a release note item
    function renderReleaseNote(sections, version) {
        const hasContent = Object.values(sections).some(arr => arr.length > 0);
        if (!hasContent) return '';

        const sectionOrder = ['New Features', 'Bug Fixes', 'Improvements'];
        const sectionTitles = {
            'New Features': 'New Features',
            'Bug Fixes': 'Bug Fixes',
            'Improvements': 'Improvements'
        };

        let html = `<div class="release-note-item">`;
        html += `<div class="release-note-header">`;
        html += `<div class="release-note-version">Version ${version}</div>`;
        html += `</div>`;
        html += `<div class="release-note-content">`;

        sectionOrder.forEach(sectionKey => {
            const items = sections[sectionKey];
            if (items.length > 0) {
                const sectionClass = sectionKey.toLowerCase().replace(/\s+/g, '-');
                html += `<h4 data-section="${sectionClass}">${sectionTitles[sectionKey]}</h4>`;
                html += `<ul>`;
                items.forEach(item => {
                    html += `<li>${escapeHtml(item)}</li>`;
                });
                html += `</ul>`;
            }
        });

        html += `</div>`;
        html += `</div>`;
        
        return html;
    }

    // Escape HTML to prevent XSS
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Release notes are now lazy-loaded via Intersection Observer (see above)
});

