// Enhanced responsive image loading with progressive loading and WebP support
document.addEventListener('DOMContentLoaded', function() {
    // Check WebP support
    checkWebPSupport();
    
    // Configure lazy loading for images
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    const dataSrc = img.getAttribute('data-src');
                    const dataSrcset = img.getAttribute('data-srcset');
                    const dataSizes = img.getAttribute('data-sizes');
                    
                    if (dataSrc) {
                        // Add a low-quality image placeholder if not already present
                        if (!img.src || img.src === 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7') {
                            // Set a tiny placeholder if none exists
                            img.style.filter = 'blur(5px)';
                            img.style.transition = 'filter 0.3s';
                        }
                        
                        // Create a new image to preload
                        const tempImg = new Image();
                        tempImg.onload = function() {
                            img.src = dataSrc;
                            img.style.filter = 'none';
                            img.removeAttribute('data-src');
                        };
                        tempImg.onerror = function() {
                            // If loading fails, try the original format
                            img.src = dataSrc.replace('.webp', '.jpg');
                            img.style.filter = 'none';
                        };
                        tempImg.src = dataSrc;
                    }
                    
                    // Handle responsive images with srcset
                    if (dataSrcset) {
                        img.srcset = dataSrcset;
                        img.removeAttribute('data-srcset');
                    }
                    
                    if (dataSizes) {
                        img.sizes = dataSizes;
                        img.removeAttribute('data-sizes');
                    }
                    
                    imageObserver.unobserve(img);
                }
            });
        }, {
            rootMargin: '200px 0px 200px 0px', // Increased margin for earlier loading
            threshold: 0.01 // Trigger with minimal visibility
        });
        
        // Observe all images with data-src attribute
        document.querySelectorAll('img[data-src]').forEach(img => {
            // Set empty or low-quality placeholder
            if (!img.src) {
                img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
            }
            imageObserver.observe(img);
        });
    } else {
        // Fallback for browsers that don't support IntersectionObserver
        document.querySelectorAll('img[data-src]').forEach(img => {
            img.src = img.getAttribute('data-src');
            
            // Handle responsive images with srcset
            const dataSrcset = img.getAttribute('data-srcset');
            if (dataSrcset) {
                img.srcset = dataSrcset;
            }
            
            const dataSizes = img.getAttribute('data-sizes');
            if (dataSizes) {
                img.sizes = dataSizes;
            }
        });
    }
    
    // Function to check WebP support
    function checkWebPSupport() {
        const testWebP = new Image();
        testWebP.onload = function() {
            const isWebPSupported = (testWebP.width > 0) && (testWebP.height > 0);
            document.documentElement.classList.add(isWebPSupported ? 'webp' : 'no-webp');
        };
        testWebP.onerror = function() {
            document.documentElement.classList.add('no-webp');
        };
        testWebP.src = 'data:image/webp;base64,UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA==';
    }
});
