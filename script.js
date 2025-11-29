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
    const screenshotItems = document.querySelectorAll('.screenshot-item');

    // Open modal when screenshot is clicked
    screenshotItems.forEach(item => {
        item.addEventListener('click', () => {
            const screenshotSrc = item.getAttribute('data-screenshot');
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
                
                // Show modal
                modal.classList.add('show');
                console.log('=== MODAL SHOW ===');
                console.log('Modal show class added');
                console.log('Modal element:', modal);
                console.log('Modal classes:', modal.className);
                
                // Wait a bit then check dimensions
                setTimeout(() => {
                    console.log('=== AFTER MODAL SHOW (100ms delay) ===');
                    const modalStyle = window.getComputedStyle(modal);
                    console.log('Modal display:', modalStyle.display);
                    console.log('Modal width:', modalStyle.width);
                    console.log('Modal height:', modalStyle.height);
                    console.log('Modal position:', modalStyle.position);
                    
                    const container = document.querySelector('.screenshot-modal-container');
                    if (container) {
                        const containerStyle = window.getComputedStyle(container);
                        console.log('Container display:', containerStyle.display);
                        console.log('Container width:', containerStyle.width);
                        console.log('Container height:', containerStyle.height);
                        console.log('Container flex:', containerStyle.flex);
                    }
                    
                    if (modalImg) {
                        const imgStyle = window.getComputedStyle(modalImg);
                        console.log('Image display:', imgStyle.display);
                        console.log('Image width:', imgStyle.width);
                        console.log('Image height:', imgStyle.height);
                        console.log('Image visibility:', imgStyle.visibility);
                        console.log('Image opacity:', imgStyle.opacity);
                        console.log('Image natural dimensions:', modalImg.naturalWidth, 'x', modalImg.naturalHeight);
                        console.log('Image actual dimensions:', modalImg.offsetWidth, 'x', modalImg.offsetHeight);
                        console.log('Image getBoundingClientRect:', modalImg.getBoundingClientRect());
                        
                        // Force image to be properly sized and visible
                        const viewportWidth = window.innerWidth;
                        const viewportHeight = window.innerHeight;
                        const maxImgWidth = Math.min(viewportWidth * 0.9, 1440);
                        const maxImgHeight = Math.min((viewportHeight - 200) * 0.9, 2880);
                        
                        modalImg.style.setProperty('display', 'block', 'important');
                        modalImg.style.setProperty('visibility', 'visible', 'important');
                        modalImg.style.setProperty('opacity', '1', 'important');
                        modalImg.style.setProperty('position', 'absolute', 'important');
                        modalImg.style.setProperty('z-index', '10002', 'important');
                        modalImg.style.setProperty('max-width', maxImgWidth + 'px', 'important');
                        modalImg.style.setProperty('max-height', maxImgHeight + 'px', 'important');
                        modalImg.style.setProperty('width', 'auto', 'important');
                        modalImg.style.setProperty('height', 'auto', 'important');
                        modalImg.style.setProperty('object-fit', 'contain', 'important');
                        console.log('Set max-width to:', maxImgWidth, 'max-height to:', maxImgHeight);
                        
                        // Also fix container - ensure it's properly sized
                        const container = modalImg.parentElement;
                        if (container) {
                            container.style.setProperty('overflow', 'hidden', 'important');
                            container.style.setProperty('transform', 'none', 'important');
                            container.style.setProperty('-webkit-transform', 'none', 'important');
                            container.style.setProperty('position', 'relative', 'important');
                            container.style.setProperty('width', '100%', 'important');
                            container.style.setProperty('height', '100%', 'important');
                            container.style.setProperty('max-width', '100vw', 'important');
                            container.style.setProperty('max-height', '100vh', 'important');
                            container.scrollTop = 0;
                            container.scrollLeft = 0;
                            
                            // Wait for image to load and ensure flexbox centering works
                            setTimeout(() => {
                                // Clear any problematic inline styles first
                                modalImg.style.removeProperty('position');
                                modalImg.style.removeProperty('top');
                                modalImg.style.removeProperty('left');
                                modalImg.style.removeProperty('right');
                                modalImg.style.removeProperty('bottom');
                                modalImg.style.removeProperty('transform');
                                modalImg.style.removeProperty('-webkit-transform');
                                
                                // Use static positioning and let flexbox handle centering
                                modalImg.style.setProperty('position', 'static', 'important');
                                modalImg.style.setProperty('display', 'block', 'important');
                                modalImg.style.setProperty('margin', 'auto', 'important');
                                modalImg.style.setProperty('vertical-align', 'middle', 'important');
                                
                                // Ensure container is properly set up for flexbox
                                container.style.setProperty('display', '-webkit-box', 'important');
                                container.style.setProperty('display', '-webkit-flex', 'important');
                                container.style.setProperty('display', '-ms-flexbox', 'important');
                                container.style.setProperty('display', 'flex', 'important');
                                container.style.setProperty('-webkit-box-align', 'center', 'important');
                                container.style.setProperty('-webkit-align-items', 'center', 'important');
                                container.style.setProperty('-ms-flex-align', 'center', 'important');
                                container.style.setProperty('align-items', 'center', 'important');
                                container.style.setProperty('-webkit-box-pack', 'center', 'important');
                                container.style.setProperty('-webkit-justify-content', 'center', 'important');
                                container.style.setProperty('-ms-flex-pack', 'center', 'important');
                                container.style.setProperty('justify-content', 'center', 'important');
                                container.style.setProperty('position', 'relative', 'important');
                                container.style.setProperty('overflow', 'auto', 'important');
                                
                                // Reset scroll position
                                container.scrollTop = 0;
                                container.scrollLeft = 0;
                                
                                // Force multiple reflows to ensure rendering
                                void container.offsetHeight;
                                void modalImg.offsetHeight;
                                
                                // Check after a brief delay
                                setTimeout(() => {
                                    const finalRect = modalImg.getBoundingClientRect();
                                    console.log('Image rect after flexbox fix:', finalRect);
                                    console.log('Image should be visible at y:', finalRect.top, '(should be > 0 and <', viewportHeight, ')');
                                    
                                    // If still not visible, use fixed positioning as fallback
                                    if (finalRect.top < 0 || finalRect.top > viewportHeight || finalRect.top === 0) {
                                        console.log('Flexbox failed, using fixed positioning fallback...');
                                        const imgHeight = modalImg.offsetHeight || modalImg.clientHeight;
                                        const imgWidth = modalImg.offsetWidth || modalImg.clientWidth;
                                        const topbar = document.querySelector('.screenshot-modal-topbar');
                                        const topbarHeight = topbar ? (topbar.offsetHeight || topbar.clientHeight) : 100;
                                        const viewportCenterX = window.innerWidth / 2;
                                        const viewportCenterY = (window.innerHeight / 2) + (topbarHeight / 2);
                                        const topPos = Math.max(topbarHeight + 20, viewportCenterY - (imgHeight / 2));
                                        const leftPos = Math.max(20, viewportCenterX - (imgWidth / 2));
                                        
                                        console.log('Fallback position:', leftPos, topPos);
                                        
                                        modalImg.style.setProperty('position', 'fixed', 'important');
                                        modalImg.style.setProperty('top', topPos + 'px', 'important');
                                        modalImg.style.setProperty('left', leftPos + 'px', 'important');
                                        modalImg.style.setProperty('transform', 'none', 'important');
                                        modalImg.style.setProperty('-webkit-transform', 'none', 'important');
                                        
                                        const finalRect2 = modalImg.getBoundingClientRect();
                                        console.log('Image rect after fixed positioning fallback:', finalRect2);
                                    }
                                }, 100);
                            }, 200);
                        }
                        
                        console.log('=== FORCED VISIBLE STYLES WITH RED BACKGROUND AND YELLOW BORDER ===');
                        console.log('After fix - getBoundingClientRect:', modalImg.getBoundingClientRect());
                    }
                }, 100);
                
                document.body.style.overflow = 'hidden'; // Prevent background scrolling
                
                // Force a reflow to ensure display
                void modal.offsetHeight;
            } else {
                console.error('No screenshot source found');
            }
        });
    });

    // Close modal when close button is clicked
    if (closeBtn) {
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent event bubbling
            modal.classList.remove('show');
            document.body.style.overflow = ''; // Restore scrolling
        });
    }

    // Close modal when clicking on the image
    if (modalImg) {
        modalImg.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent event from bubbling to modal
            modal.classList.remove('show');
            document.body.style.overflow = ''; // Restore scrolling
        });
    }
    
    // Close modal when clicking outside the image (on the dark background or container)
    modal.addEventListener('click', (e) => {
        // Close if clicking on modal background or container (but not on image or topbar)
        if (e.target === modal || e.target.classList.contains('screenshot-modal-container')) {
            modal.classList.remove('show');
            document.body.style.overflow = ''; // Restore scrolling
        }
    });
    
    // Prevent closing when clicking on topbar (except close button)
    const topbar = document.querySelector('.screenshot-modal-topbar');
    if (topbar) {
        topbar.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent closing modal when clicking on topbar
        });
    }

    // Close modal with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('show')) {
            modal.classList.remove('show');
            document.body.style.overflow = ''; // Restore scrolling
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

