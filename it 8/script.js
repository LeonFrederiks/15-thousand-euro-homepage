// Pixel Canvas Application
class PixelCanvas {
    constructor() {
        // Canvas settings
        this.canvas = document.getElementById('pixelCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.ORIGINAL_WIDTH = 1920;
        this.ORIGINAL_HEIGHT = 1080;
        this.scale = 1; // Fixed scale, no zoom
        this.offsetX = 0;
        this.offsetY = 0;
        
        // Canvas dimensions (responsive)
        this.resizeCanvas();
        
        // Selection state
        this.isSelecting = false;
        this.selection = null;
        this.mouseStart = { x: 0, y: 0 };
        this.mouseCurrent = { x: 0, y: 0 };
        
        // UI state
        this.currentSelection = null;
        this.uploadedImage = null;
        this.hoveredPixel = null;
        
        // Mock data for demonstration - Updated with colored demo pixels
        this.purchasedPixels = [
            { x: 200, y: 150, width: 60, height: 60, color: '#FF3B30', link: 'https://youtube.com', text: 'Watch Videos on YouTube!' },
            { x: 400, y: 250, width: 60, height: 60, color: '#34C759', link: 'https://google.com', text: 'Search on Google!' },
            { x: 600, y: 350, width: 60, height: 60, color: '#007AFF', link: 'https://github.com', text: 'Code on GitHub!' },
            { x: 800, y: 450, width: 60, height: 60, color: '#FFCC00', link: 'https://stackoverflow.com', text: 'Ask Questions on Stack Overflow!' },
            { x: 1000, y: 200, width: 60, height: 60, color: '#FF2D55', link: 'https://twitter.com', text: 'Tweet on Twitter!' },
            { x: 1200, y: 300, width: 60, height: 60, color: '#5AC8FA', link: 'https://facebook.com', text: 'Connect on Facebook!' },
            { x: 1400, y: 400, width: 60, height: 60, color: '#FF9500', link: 'https://linkedin.com', text: 'Network on LinkedIn!' },
            { x: 1600, y: 500, width: 60, height: 60, color: '#AF52DE', link: 'https://instagram.com', text: 'Share on Instagram!' }
        ];
        
        // Progress tracking
        this.totalPixels = this.ORIGINAL_WIDTH * this.ORIGINAL_HEIGHT;
        this.pixelsSold = this.purchasedPixels.reduce((sum, p) => sum + (p.width * p.height), 0);
        this.goalAmount = 15000;
        this.pricePerPixel = 0.00723;
        
        // Event listeners
        this.setupEventListeners();
        
        // Initialize
        this.updateProgress();
        this.renderCanvas();
        this.renderMockData();
    }
    
    resizeCanvas() {
        const container = this.canvas.parentElement;
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;
        
        // Calculate scale to fit canvas in container - use Math.min to ensure it fits
        const scaleX = containerWidth / this.ORIGINAL_WIDTH;
        const scaleY = containerHeight / this.ORIGINAL_HEIGHT;
        const scale = Math.min(scaleX, scaleY); // Use min to ensure canvas fits in viewport
        
        this.scale = scale;
        this.canvas.width = this.ORIGINAL_WIDTH * scale;
        this.canvas.height = this.ORIGINAL_HEIGHT * scale;
        this.canvas.style.width = `${this.ORIGINAL_WIDTH * scale}px`;
        this.canvas.style.height = `${this.ORIGINAL_HEIGHT * scale}px`;
        this.canvas.style.margin = '0 auto';
    }
    
    setupEventListeners() {
        // Canvas mouse events
        this.canvas.addEventListener('mousemove', this.onMouseMove.bind(this));
        this.canvas.addEventListener('click', this.onCanvasClick.bind(this));
        this.canvas.addEventListener('mouseenter', this.onMouseEnter.bind(this));
        this.canvas.addEventListener('mouseleave', this.onMouseLeave.bind(this));
        
        // Window resize
        window.addEventListener('resize', this.handleResize.bind(this));
        
        // Cursor rectangle element
        this.cursorRectangle = document.getElementById('cursorRectangle');
    }
    
    onMouseDown(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left) / this.scale;
        const y = (e.clientY - rect.top) / this.scale;
        
        // Check if clicking on a purchased pixel
        const clickedPixel = this.getPixelAtPosition(x, y);
        
        if (clickedPixel) {
            // If clicking on a purchased pixel, follow the link
            window.open(clickedPixel.link, '_blank');
        }
    }
    
    onMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left) / this.scale;
        const y = (e.clientY - rect.top) / this.scale;
        
        // Update coordinate display
        this.updateCoordinates(Math.round(x), Math.round(y));
        
        // Update cursor rectangle
        this.updateCursorRectangle(x, y);
        
        // Show hover tooltip for purchased pixels
        this.handleHover(e.clientX, e.clientY, x, y);
    }
    
    onMouseUp(e) {
        // No dragging, so nothing to handle here
        this.isSelecting = false;
        this.finalizeSelection();
    }
    
    finalizeSelection() {
        if (this.selection && this.selection.width >= 30 && this.selection.height >= 30) {
            this.showPurchasePanel();
        } else {
            this.clearSelection();
        }
    }
    
    getPixelAtPosition(x, y) {
        return this.purchasedPixels.find(p => 
            x >= p.x && x <= p.x + p.width && 
            y >= p.y && y <= p.y + p.height
        );
    }
    
    updateCoordinates(x, y) {
        const coordX = document.getElementById('coordX');
        const coordY = document.getElementById('coordY');
        if (coordX && coordY) {
            coordX.textContent = x;
            coordY.textContent = y;
        }
    }
    
    updateCursorRectangle(x, y) {
        if (!this.cursorRectangle) return;
        
        // Show cursor rectangle
        this.cursorRectangle.classList.remove('hidden');
        
        // Position rectangle
        this.cursorRectangle.style.left = `${x * this.scale + this.canvas.offsetLeft}px`;
        this.cursorRectangle.style.top = `${y * this.scale + this.canvas.offsetTop}px`;
        this.cursorRectangle.style.width = `${this.scale}px`;
        this.cursorRectangle.style.height = `${this.scale}px`;
    }
    
    hideCursorRectangle() {
        if (this.cursorRectangle) {
            this.cursorRectangle.classList.add('hidden');
        }
    }
    
    showHoverTooltip(clickedPixel, clientX, clientY) {
        this.showTooltip(clientX, clientY, clickedPixel);
    }
    
    hideHoverTooltip() {
        this.hideTooltip();
    }
    
    onMouseEnter() {
        this.canvas.style.cursor = 'crosshair';
    }
    
    onMouseLeave(e) {
        this.hideTooltip();
        this.hideCursorRectangle();
    }
    
    onCanvasClick(e) {
        // Check if clicked on existing purchased pixel to follow link
        const rect = this.canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left) / this.scale;
        const y = (e.clientY - rect.top) / this.scale;
        
        const clickedPixel = this.purchasedPixels.find(p => 
            x >= p.x && x <= p.x + p.width && 
            y >= p.y && y <= p.y + p.height
        );
        
        if (clickedPixel && clickedPixel.link) {
            // Follow the link if it exists
            window.open(clickedPixel.link, '_blank');
        }
    }
    

    
    clearSelection() {
        if (this.selection) {
            this.selection.remove();
            this.selection = null;
        }
    }
    
    updateSelection() {
        this.clearSelection();
        
        const x1 = Math.min(this.mouseStart.x, this.mouseCurrent.x);
        const y1 = Math.min(this.mouseStart.y, this.mouseCurrent.y);
        const x2 = Math.max(this.mouseStart.x, this.mouseCurrent.x);
        const y2 = Math.max(this.mouseStart.y, this.mouseCurrent.y);
        
        const width = x2 - x1;
        const height = y2 - y1;
        
        if (width < 1 || height < 1) return;
        
        // Create selection element
        this.selection = document.createElement('div');
        this.selection.className = 'canvas-selection';
        this.selection.style.left = `${x1 * this.scale + this.canvas.offsetLeft}px`;
        this.selection.style.top = `${y1 * this.scale + this.canvas.offsetTop}px`;
        this.selection.style.width = `${width * this.scale}px`;
        this.selection.style.height = `${height * this.scale}px`;
        
        document.body.appendChild(this.selection);
    }
    
    handleHover(clientX, clientY, x, y) {
        const hoveredPixel = this.purchasedPixels.find(p => 
            x >= p.x && x <= p.x + p.width && 
            y >= p.y && y <= p.y + p.height
        );
        
        if (hoveredPixel) {
            this.showTooltip(clientX, clientY, hoveredPixel);
            this.hoveredPixel = hoveredPixel;
        } else {
            this.hideTooltip();
            this.hoveredPixel = null;
        }
    }
    
    showTooltip(clientX, clientY, pixelData) {
        const tooltip = document.getElementById('hoverTooltip');
        tooltip.innerHTML = `
            <div class="tooltip-title">${pixelData.text || 'Purchased Pixel'}</div>
            ${pixelData.link ? `<div class="tooltip-link">🔗 Click to visit: ${pixelData.link}</div>` : ''}
            <div class="tooltip-text">${pixelData.width} × ${pixelData.height} pixels • €${(pixelData.width * pixelData.height * this.pricePerPixel).toFixed(2)}</div>
        `;
        
        // Position tooltip to the right of cursor and hovered square
        let tooltipX = clientX + 20; // 20px to the right of cursor
        let tooltipY = clientY - 10; // Slightly above cursor
        
        // Check if tooltip would go off screen horizontally
        if (tooltipX + 300 > window.innerWidth) { // 300px is max width
            tooltipX = clientX - 320; // Place to the left instead
        }
        
        // Check if tooltip would go off screen vertically
        if (tooltipY < 0) {
            tooltipY = clientY + 20; // Place below cursor instead
        }
        
        // Ensure tooltip stays within viewport
        tooltipX = Math.max(10, Math.min(tooltipX, window.innerWidth - 310));
        tooltipY = Math.max(10, Math.min(tooltipY, window.innerHeight - 100));
        
        tooltip.style.left = `${tooltipX}px`;
        tooltip.style.top = `${tooltipY}px`;
        
        // Show tooltip
        tooltip.classList.remove('hidden');
        setTimeout(() => tooltip.classList.add('visible'), 10);
    }
    
    hideTooltip() {
        const tooltip = document.getElementById('hoverTooltip');
        tooltip.classList.add('hidden');
        tooltip.classList.remove('visible');
    }
    
    updateSelectionPanel() {
        const sel = this.currentSelection;
        if (!sel) return;
        
        document.getElementById('selX').textContent = sel.x;
        document.getElementById('selY').textContent = sel.y;
        document.getElementById('selWidth').textContent = sel.width;
        document.getElementById('selHeight').textContent = sel.height;
        document.getElementById('totalPixels').textContent = sel.pixels;
        document.getElementById('pixelCount').textContent = sel.pixels;
        
        this.updatePriceCalculation();
        this.updatePayPalButton();
    }
    
    updatePriceCalculation() {
        if (!this.currentSelection) return;
        
        const pixels = this.currentSelection.pixels;
        const price = pixels * this.pricePerPixel;
        
        document.getElementById('totalPrice').textContent = `€${price.toFixed(2)}`;
        this.updateMinWarning();
    }
    
    updateMinWarning() {
        const minPixels = 30 * 30; // 900 pixels
        const warning = document.getElementById('minWarning');
        const payPalBtn = document.getElementById('payPalBtn');
        
        if (this.currentSelection && this.currentSelection.pixels >= minPixels) {
            warning.classList.add('hidden');
            payPalBtn.disabled = false;
        } else {
            warning.classList.remove('hidden');
            payPalBtn.disabled = true;
        }
    }
    
    updatePayPalButton() {
        const payPalBtn = document.getElementById('payPalBtn');
        const hasImage = this.uploadedImage !== null;
        const minPixels = 30 * 30;
        
        // Enable button if minimum purchase and image uploaded
        if (this.currentSelection && 
            this.currentSelection.pixels >= minPixels && 
            hasImage) {
            payPalBtn.disabled = false;
        } else {
            payPalBtn.disabled = true;
        }
    }
    
    showPanel() {
        const panel = document.getElementById('purchasePanel');
        panel.classList.remove('hidden');
    }
    
    closePanel() {
        const panel = document.getElementById('purchasePanel');
        panel.classList.add('hidden');
        this.currentSelection = null;
        this.uploadedImage = null;
        this.clearSelection();
        this.resetUploadZone();
    }
    
    showTooltip(clientX, clientY, pixelData) {
        // Remove existing tooltip
        const existing = document.querySelector('.pixel-tooltip');
        if (existing) existing.remove();
        
        // Create tooltip
        const tooltip = document.createElement('div');
        tooltip.className = 'pixel-tooltip';
        tooltip.innerHTML = `
            <div class="tooltip-title">${pixelData.text || 'Purchased Pixel'}</div>
            ${pixelData.link ? `<a href="${pixelData.link}" class="tooltip-link" target="_blank">Visit Link</a>` : ''}
        `;
        
        document.body.appendChild(tooltip);
        
        // Position tooltip
        tooltip.style.left = `${clientX + 10}px`;
        tooltip.style.top = `${clientY - 10}px`;
        
        // Show tooltip
        setTimeout(() => tooltip.classList.add('visible'), 10);
        
        // Hide tooltip after 3 seconds
        setTimeout(() => {
            tooltip.classList.remove('visible');
            setTimeout(() => tooltip.remove(), 200);
        }, 3000);
    }
    
    handleImageUpload(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        this.processImage(file);
    }
    
    handleDragOver(e) {
        e.preventDefault();
        e.currentTarget.style.borderColor = 'var(--primary-500)';
        e.currentTarget.style.background = 'rgba(0, 122, 255, 0.05)';
    }
    
    handleDrop(e) {
        e.preventDefault();
        e.currentTarget.style.borderColor = 'var(--border-subtle)';
        e.currentTarget.style.background = 'rgba(38, 38, 38, 0.3)';
        
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            this.processImage(file);
        }
    }
    
    processImage(file) {
        if (file.size > 10 * 1024 * 1024) { // 10MB limit
            alert('File size must be less than 10MB');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                this.uploadedImage = {
                    src: e.target.result,
                    width: img.width,
                    height: img.height
                };
                
                this.showImagePreview();
                this.updatePayPalButton();
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
    
    showImagePreview() {
        const uploadZone = document.getElementById('uploadZone');
        const imagePreview = document.getElementById('imagePreview');
        const previewImg = document.getElementById('previewImg');
        
        uploadZone.classList.add('hidden');
        imagePreview.classList.remove('hidden');
        previewImg.src = this.uploadedImage.src;
    }
    
    removeImage() {
        this.uploadedImage = null;
        const uploadZone = document.getElementById('uploadZone');
        const imagePreview = document.getElementById('imagePreview');
        
        uploadZone.classList.remove('hidden');
        imagePreview.classList.add('hidden');
        
        document.getElementById('imageInput').value = '';
        this.updatePayPalButton();
    }
    
    resetUploadZone() {
        this.removeImage();
        document.getElementById('hoverLink').value = '';
        document.getElementById('hoverText').value = '';
    }
    
    simulatePayment() {
        if (!this.currentSelection || !this.uploadedImage) return;
        
        // Simulate payment processing
        const payPalBtn = document.getElementById('payPalBtn');
        payPalBtn.innerHTML = 'Processing...';
        payPalBtn.disabled = true;
        
        setTimeout(() => {
            // Simulate successful payment
            this.completePurchase();
            payPalBtn.innerHTML = '✓ Purchase Complete!';
            
            // Reset button after 2 seconds
            setTimeout(() => {
                payPalBtn.innerHTML = `
                    <svg class="paypal-logo" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.464C19.926 5.547 18.1 5.337 16.302 5.337H9.5c-.524 0-.968.382-1.05.9L6.1 12.036l.735-3.59c.101-.429.474-.743.91-.76l3.16-.165c.479-.025.87-.37.95-.85l1.2-6.771z"/>
                    </svg>
                    Purchase with PayPal
                `;
                payPalBtn.disabled = true;
            }, 2000);
        }, 1500);
    }
    
    completePurchase() {
        // Add to purchased pixels
        const purchase = {
            x: this.currentSelection.x,
            y: this.currentSelection.y,
            width: this.currentSelection.width,
            height: this.currentSelection.height,
            image: this.uploadedImage,
            link: document.getElementById('hoverLink').value || null,
            text: document.getElementById('hoverText').value || 'My Purchase',
            timestamp: new Date()
        };
        
        this.purchasedPixels.push(purchase);
        
        // Update progress
        this.pixelsSold += this.currentSelection.pixels;
        this.updateProgress();
        
        // Re-render
        this.renderCanvas();
        this.renderMockData();
        this.renderRecentPurchases();
        
        // Close panel
        setTimeout(() => {
            this.closePanel();
            alert('Purchase successful! Your pixels will be visible in 5-10 minutes after processing.');
        }, 1000);
    }
    
    updateProgress() {
        const percentComplete = (this.pixelsSold / this.totalPixels) * 100;
        const amountRaised = (this.pixelsSold * this.pricePerPixel);
        
        const progressPercent = document.getElementById('progressPercent');
        const progressAmount = document.getElementById('progressAmount');
        const progressFill = document.getElementById('progressFill');
        
        if (progressPercent) {
            progressPercent.textContent = `${percentComplete.toFixed(1)}%`;
        }
        if (progressAmount) {
            progressAmount.textContent = amountRaised.toLocaleString('nl-NL', { 
                minimumFractionDigits: 0, 
                maximumFractionDigits: 0 
            });
        }
        if (progressFill) {
            progressFill.style.width = `${Math.min(percentComplete, 100)}%`;
        }
    }
    
    renderCanvas() {
        // Clear canvas
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Apply zoom and pan transform
        this.ctx.save();
        this.ctx.scale(this.scale, this.scale);
        this.ctx.translate(this.offsetX, this.offsetY);
        
        // Draw grid (light)
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        this.ctx.lineWidth = 1;
        
        for (let x = 0; x <= this.ORIGINAL_WIDTH; x += 50) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.ORIGINAL_HEIGHT);
            this.ctx.stroke();
        }
        
        for (let y = 0; y <= this.ORIGINAL_HEIGHT; y += 50) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.ORIGINAL_WIDTH, y);
            this.ctx.stroke();
        }
        
        this.ctx.restore();
    }
    
    renderMockData() {
        this.purchasedPixels.forEach(pixel => {
            // Save context
            this.ctx.save();
            
            // Apply transform
            this.ctx.scale(this.scale, this.scale);
            this.ctx.translate(this.offsetX, this.offsetY);
            
            // Draw purchased pixel background with its color
            const pixelColor = pixel.color || 'rgba(0, 122, 255, 0.3)';
            this.ctx.fillStyle = pixelColor;
            this.ctx.fillRect(
                pixel.x, 
                pixel.y, 
                pixel.width, 
                pixel.height
            );
            
            // Draw border
            this.ctx.strokeStyle = pixel.color ? pixel.color : '#007AFF';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(
                pixel.x, 
                pixel.y, 
                pixel.width, 
                pixel.height
            );
            
            // Draw text if no image
            if (!pixel.image) {
                this.ctx.fillStyle = 'white';
                this.ctx.font = `${12}px Inter`;
                this.ctx.textAlign = 'center';
                this.ctx.fillText(
                    'PIXEL',
                    pixel.x + pixel.width / 2,
                    pixel.y + pixel.height / 2
                );
            }
            
            // Restore context
            this.ctx.restore();
        });
    }
    
    renderRecentPurchases() {
        const container = document.getElementById('recentPurchases');
        if (!container) return;
        
        container.innerHTML = '';
        
        const recent = this.purchasedPixels.slice(-8).reverse();
        recent.forEach((pixel, index) => {
            const item = document.createElement('div');
            item.className = 'purchase-item';
            const date = new Date(Date.now() - (index * 3600000)); // Mock dates
            item.innerHTML = `
                <div class="purchase-preview" style="background-color: ${pixel.color || '#007AFF'}"></div>
                <div class="purchase-info">
                    <div>${pixel.text || 'Pixel Purchase'}</div>
                    <div class="purchase-amount">€${(pixel.width * pixel.height * this.pricePerPixel).toFixed(2)}</div>
                    <div class="purchase-date">${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                </div>
            `;
            
            // Add click handler to follow link
            if (pixel.link) {
                item.style.cursor = 'pointer';
                item.addEventListener('click', () => window.open(pixel.link, '_blank'));
            }
            
            container.appendChild(item);
        });
    }
    
    handleResize() {
        this.resizeCanvas();
        this.renderCanvas();
        this.renderMockData();
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    new PixelCanvas();
});

// Demo data simulation - Add some fake purchases periodically
setInterval(() => {
    // Simulate occasional new purchases
    if (Math.random() < 0.1) { // 10% chance every interval
        const pixelCanvas = window.pixelCanvas;
        if (pixelCanvas) {
            // This would normally come from real data
            console.log('Demo: Simulating new pixel purchase');
        }
    }
}, 10000); // Every 10 seconds