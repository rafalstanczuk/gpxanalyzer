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

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 100) {
        navbar.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.4)';
    } else {
        navbar.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.3)';
    }
    
    lastScroll = currentScroll;
});

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
document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll('.feature-card, .screenshot-item');
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
    const screenshotItems = document.querySelectorAll('.screenshot-item');
    
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
        console.log('Opening screenshot', index, 'src:', screenshotSrc);
            console.log('Screenshot clicked, src:', screenshotSrc);
            console.log('Modal:', modal);
            console.log('ModalImg:', modalImg);
            
            if (!modal) {
                console.error('Modal element not found!');
                return;
            }
            
            if (!modalImg) {
                console.error('Modal image element not found!');
                return;
            }
            
            if (screenshotSrc) {
                // Reset image first
                modalImg.src = '';
                modalImg.style.display = 'none';
                
                // Set image source
                modalImg.src = screenshotSrc;
                console.log('Setting image src to:', screenshotSrc);
                
                // Force visibility
                modalImg.style.display = 'block';
                modalImg.style.visibility = 'visible';
                modalImg.style.opacity = '1';
                modalImg.style.width = 'auto';
                modalImg.style.height = 'auto';
                
                // Ensure image loads
                modalImg.onload = function() {
                    console.log('=== IMAGE LOADED SUCCESSFULLY ===');
                    console.log('Image natural width:', this.naturalWidth);
                    console.log('Image natural height:', this.naturalHeight);
                    console.log('Image client width:', this.clientWidth);
                    console.log('Image client height:', this.clientHeight);
                    console.log('Image offset width:', this.offsetWidth);
                    console.log('Image offset height:', this.offsetHeight);
                    console.log('Image src:', this.src);
                    
                    const computedStyle = window.getComputedStyle(this);
                    console.log('Computed display:', computedStyle.display);
                    console.log('Computed visibility:', computedStyle.visibility);
                    console.log('Computed opacity:', computedStyle.opacity);
                    console.log('Computed width:', computedStyle.width);
                    console.log('Computed height:', computedStyle.height);
                    console.log('Computed max-width:', computedStyle.maxWidth);
                    console.log('Computed max-height:', computedStyle.maxHeight);
                    console.log('Computed position:', computedStyle.position);
                    console.log('Computed z-index:', computedStyle.zIndex);
                    
                    const container = this.parentElement;
                    if (container) {
                        console.log('=== CONTAINER INFO ===');
                        console.log('Container:', container);
                        const containerStyle = window.getComputedStyle(container);
                        console.log('Container display:', containerStyle.display);
                        console.log('Container width:', containerStyle.width);
                        console.log('Container height:', containerStyle.height);
                        console.log('Container client width:', container.clientWidth);
                        console.log('Container client height:', container.clientHeight);
                        console.log('Container flex:', containerStyle.display);
                    }
                    
                    const modalEl = document.getElementById('screenshot-modal');
                    if (modalEl) {
                        console.log('=== MODAL INFO ===');
                        const modalStyle = window.getComputedStyle(modalEl);
                        console.log('Modal display:', modalStyle.display);
                        console.log('Modal width:', modalStyle.width);
                        console.log('Modal height:', modalStyle.height);
                        console.log('Modal has show class:', modalEl.classList.contains('show'));
                    }
                    
                    this.style.display = 'block';
                    this.style.visibility = 'visible';
                    this.style.opacity = '1';
                    console.log('=== FORCED STYLES APPLIED ===');
                };
                
                modalImg.onerror = function() {
                    console.error('=== IMAGE LOAD ERROR ===');
                    console.error('Failed to load image:', screenshotSrc);
                    console.error('Image src attribute:', this.src);
                    this.alt = 'Image failed to load: ' + screenshotSrc;
                    this.style.display = 'block';
                    this.style.visibility = 'visible';
                    this.style.opacity = '1';
                    this.style.border = '2px solid red';
                    this.style.padding = '20px';
                    this.style.backgroundColor = 'rgba(255, 0, 0, 0.1)';
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
                console.log('Modal shown, class added');
                
                // Update navigation buttons
                updateNavigationButtons();
                
                // Wait for modal to render, then set up image
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        console.log('Setting up image after modal render');
                        
                        // Get viewport dimensions
                        const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
                        const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
                        const topbar = document.querySelector('.screenshot-modal-topbar');
                        const topbarHeight = topbar ? (topbar.offsetHeight || topbar.clientHeight) : 100;
                        const availableHeight = viewportHeight - topbarHeight - 40;
                        
                        console.log('Viewport:', viewportWidth, 'x', viewportHeight);
                        console.log('Topbar height:', topbarHeight);
                        console.log('Available height:', availableHeight);
                        
                        // Set image constraints
                        const maxImgWidth = Math.min(viewportWidth * 0.9, 1440);
                        const maxImgHeight = Math.min(availableHeight * 0.95, 2880);
                        
                        console.log('Max image size:', maxImgWidth, 'x', maxImgHeight);
                        
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
                        
                        console.log('Image styles applied');
                        
                        // Ensure container is set up for flexbox
                        if (container) {
                            container.style.overflow = 'hidden';
                            container.style.position = 'relative';
                            container.scrollTop = 0;
                            container.scrollLeft = 0;
                            // Force container to be at viewport top
                            container.style.top = '0';
                            container.style.left = '0';
                            console.log('Container configured');
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
                            
                            console.log('Final image position:', {
                                top: rect.top,
                                left: rect.left,
                                width: rect.width,
                                height: rect.height,
                                visible: rect.top >= 0 && rect.top < viewportHeight && rect.left >= 0 && rect.left < viewportWidth
                            });
                            
                            console.log('Container position:', {
                                top: containerRect?.top,
                                left: containerRect?.left,
                                width: containerRect?.width,
                                height: containerRect?.height
                            });
                            
                            console.log('Modal position:', {
                                top: modalRect.top,
                                left: modalRect.left,
                                width: modalRect.width,
                                height: modalRect.height
                            });
                            
                            // If image is still off-screen, force it to center using fixed positioning
                            if (rect.top < 0 || rect.top > viewportHeight || !rect.visible) {
                                console.warn('Image is off-screen, using fixed positioning fallback');
                                const imgWidth = rect.width || modalImg.offsetWidth;
                                const imgHeight = rect.height || modalImg.offsetHeight;
                                const centerX = viewportWidth / 2;
                                const centerY = topbarHeight + (availableHeight / 2);
                                
                                modalImg.style.position = 'fixed';
                                modalImg.style.top = (centerY - imgHeight / 2) + 'px';
                                modalImg.style.left = (centerX - imgWidth / 2) + 'px';
                                modalImg.style.margin = '0';
                                modalImg.style.zIndex = '10003';
                                
                                console.log('Fixed position applied:', {
                                    top: modalImg.style.top,
                                    left: modalImg.style.left
                                });
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

    // Discover release notes files dynamically
    async function discoverReleaseNotesFiles() {
        // First, try to load an index file if it exists
        try {
            const indexResponse = await fetch('release_notes/index.txt');
            if (indexResponse.ok) {
                const indexContent = await indexResponse.text();
                const files = indexContent.split('\n')
                    .map(line => line.trim())
                    .filter(line => line.length > 0 && line.endsWith('.txt'))
                    .map(line => line.startsWith('release_notes/') ? line : `release_notes/${line}`);
                console.log(`Found ${files.length} files from index.txt`);
                return files;
            }
        } catch (error) {
            console.log('No index.txt found, trying version discovery...');
        }

        // Fallback: Try to discover files by attempting version patterns
        // Optimized: Start from higher versions (more likely) and work backwards
        const basePath = 'release_notes/GOOGLE_PLAY_RELEASE_NOTES_';
        const discoveredFiles = [];
        
        console.log('Discovering release notes files...');
        
        // Try a reasonable range: major 0-5, minor 0-9, patch 0-9
        // This covers versions 0.0.0 to 5.9.9 (600 combinations instead of 1000)
        // Start from higher versions first (more likely to exist)
        const maxMajor = 6;
        const maxMinor = 10;
        const maxPatch = 10;
        const batchSize = 50; // Process in batches to avoid too many simultaneous requests
        
        // Generate version combinations, starting from higher versions
        const allVersions = [];
        for (let major = maxMajor - 1; major >= 0; major--) {
            for (let minor = maxMinor - 1; minor >= 0; minor--) {
                for (let patch = maxPatch - 1; patch >= 0; patch--) {
                    allVersions.push(`${major}.${minor}.${patch}`);
                }
            }
        }
        
        // Process in batches
        for (let i = 0; i < allVersions.length; i += batchSize) {
            const batch = allVersions.slice(i, i + batchSize);
            const batchPromises = batch.map(async (version) => {
                const filePath = `${basePath}${version}.txt`;
                try {
                    const response = await fetch(filePath, { 
                        method: 'GET',
                        cache: 'no-cache' // Prevent caching issues during discovery
                    });
                    if (response.ok) {
                        // Fetch content during discovery to avoid second request
                        const content = await response.text();
                        const versionMatch = filePath.match(/(\d+\.\d+\.\d+)/);
                        const version = versionMatch ? versionMatch[1] : 'Unknown';
                        return { version, content, filePath };
                    }
                } catch (error) {
                    // File doesn't exist, ignore
                }
                return null;
            });
            
            const batchResults = await Promise.all(batchPromises);
            const found = batchResults.filter(note => note !== null);
            discoveredFiles.push(...found);
        }
        
        console.log(`Discovered ${discoveredFiles.length} release notes files`);
        return discoveredFiles;
    }

    // Load and display release notes
    async function loadReleaseNotes() {
        const container = document.getElementById('release-notes-container');
        if (!container) {
            console.warn('Release notes container not found');
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

    // Load release notes when DOM is ready
    loadReleaseNotes().catch(error => {
        console.error('Fatal error loading release notes:', error);
        const container = document.getElementById('release-notes-container');
        if (container) {
            container.innerHTML = '<div class="release-notes-loading">Error loading release notes. Please view via web server.</div>';
        }
    });
});

