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
            if (screenshotSrc) {
                modalImg.src = screenshotSrc;
                
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
                
                modal.classList.add('show');
                document.body.style.overflow = 'hidden'; // Prevent background scrolling
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
});

