// Pixel Canvas Application
class PixelCanvas {
    constructor() {
        // Canvas settings
        this.canvas = document.getElementById('pixelCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.ORIGINAL_WIDTH = 1920;
        this.ORIGINAL_HEIGHT = 1080;
        this.scale = 1;
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
        
        // Mock data for demonstration
        this.purchasedPixels = [
            { x: 100, y: 100, width: 30, height: 30, image: null, link: 'https://example1.com', text: 'First Purchase!' },
            { x: 200, y: 200, width: 30, height: 30, image: null, link: 'https://example2.com', text: 'Another Pixel!' },
            { x: 300, y: 150, width: 30, height: 30, image: null, link: 'https://example3.com', text: 'Pixel Art!' }
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
        const containerWidth = container.clientWidth - 40; // Account for borders
        const containerHeight = container.clientHeight - 40;
        
        // Calculate scale to fit canvas in container
        const scaleX = containerWidth / this.ORIGINAL_WIDTH;
        const scaleY = containerHeight / this.ORIGINAL_HEIGHT;
        const scale = Math.min(scaleX, scaleY, 1); // Don't scale up, only down
        
        this.scale = scale;
        this.canvas.width = this.ORIGINAL_WIDTH * scale;
        this.canvas.height = this.ORIGINAL_HEIGHT * scale;
        this.canvas.style.width = `${this.ORIGINAL_WIDTH * scale}px`;
        this.canvas.style.height = `${this.ORIGINAL_HEIGHT * scale}px`;
    }
    
    setupEventListeners() {
        // Canvas mouse events
        this.canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
        this.canvas.addEventListener('mousemove', this.onMouseMove.bind(this));
        this.canvas.addEventListener('mouseup', this.onMouseUp.bind(this));
        this.canvas.addEventListener('wheel', this.onWheel.bind(this));
        this.canvas.addEventListener('click', this.onCanvasClick.bind(this));
        
        // UI events
        document.getElementById('closePanel').addEventListener('click', this.closePanel.bind(this));
        document.getElementById('zoomIn').addEventListener('click', () => this.zoom(1.2));
        document.getElementById('zoomOut').addEventListener('click', () => this.zoom(0.8));
        
        // Upload events
        const uploadZone = document.getElementById('uploadZone');
        const imageInput = document.getElementById('imageInput');
        
        uploadZone.addEventListener('click', () => imageInput.click());
        imageInput.addEventListener('change', this.handleImageUpload.bind(this));
        
        // Drag and drop
        uploadZone.addEventListener('dragover', this.handleDragOver.bind(this));
        uploadZone.addEventListener('drop', this.handleDrop.bind(this));
        
        // Remove image
        document.getElementById('removeImage').addEventListener('click', this.removeImage.bind(this));
        
        // Input events for price calculation
        document.getElementById('hoverLink').addEventListener('input', this.updatePayPalButton.bind(this));
        document.getElementById('hoverText').addEventListener('input', this.updatePayPalButton.bind(this));
        
        // PayPal button (prototype)
        document.getElementById('payPalBtn').addEventListener('click', this.simulatePayment.bind(this));
        
        // Window resize
        window.addEventListener('resize', this.handleResize.bind(this));
    }
    
    onMouseDown(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left) / this.scale;
        const y = (e.clientY - rect.top) / this.scale;
        
        this.isSelecting = true;
        this.mouseStart = { x: Math.round(x), y: Math.round(y) };
        this.mouseCurrent = { x: Math.round(x), y: Math.round(y) };
        this.clearSelection();
    }
    
    onMouseMove(e) {
        if (!this.isSelecting) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left) / this.scale;
        const y = (e.clientY - rect.top) / this.scale;
        
        this.mouseCurrent = { x: Math.round(x), y: Math.round(y) };
        this.updateSelection();
    }
    
    onMouseUp(e) {
        if (!this.isSelecting) return;
        
        this.isSelecting = false;
        this.finalizeSelection();
    }
    
    onWheel(e) {
        e.preventDefault();
        const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
        this.zoom(zoomFactor);
    }
    
    onCanvasClick(e) {
        // Check if clicked on existing purchased pixel for tooltip
        const rect = this.canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left) / this.scale;
        const y = (e.clientY - rect.top) / this.scale;
        
        const clickedPixel = this.purchasedPixels.find(p => 
            x >= p.x && x <= p.x + p.width && 
            y >= p.y && y <= p.y + p.height
        );
        
        if (clickedPixel) {
            this.showTooltip(e.clientX, e.clientY, clickedPixel);
        }
    }
    
    zoom(factor) {
        const newScale = Math.max(0.1, Math.min(5, this.scale * factor));
        if (newScale === this.scale) return;
        
        this.scale = newScale;
        this.canvas.width = this.ORIGINAL_WIDTH * this.scale;
        this.canvas.height = this.ORIGINAL_HEIGHT * this.scale;
        this.canvas.style.width = `${this.ORIGINAL_WIDTH * this.scale}px`;
        this.canvas.style.height = `${this.ORIGINAL_HEIGHT * this.scale}px`;
        
        this.renderCanvas();
        this.renderMockData();
        this.updateZoomDisplay();
    }
    
    updateZoomDisplay() {
        const zoomLevel = document.querySelector('.zoom-level');
        zoomLevel.textContent = `${Math.round(this.scale * 100)}%`;
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
    
    finalizeSelection() {
        if (!this.selection) return;
        
        const x1 = Math.min(this.mouseStart.x, this.mouseCurrent.x);
        const y1 = Math.min(this.mouseStart.y, this.mouseCurrent.y);
        const x2 = Math.max(this.mouseStart.x, this.mouseCurrent.x);
        const y2 = Math.max(this.mouseStart.y, this.mouseCurrent.y);
        
        const width = x2 - x1;
        const height = y2 - y1;
        
        if (width < 1 || height < 1) {
            this.clearSelection();
            return;
        }
        
        // Store selection data
        this.currentSelection = {
            x: Math.round(x1),
            y: Math.round(y1),
            width: Math.round(width),
            height: Math.round(height),
            pixels: Math.round(width) * Math.round(height)
        };
        
        // Update UI panel
        this.updateSelectionPanel();
        this.showPanel();
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
        
        document.getElementById('progressPercent').textContent = `${percentComplete.toFixed(1)}%`;
        document.getElementById('progressAmount').textContent = amountRaised.toLocaleString('nl-NL', { 
            minimumFractionDigits: 0, 
            maximumFractionDigits: 0 
        });
    }
    
    renderCanvas() {
        // Clear canvas
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw grid (light)
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        this.ctx.lineWidth = 1;
        
        for (let x = 0; x <= this.ORIGINAL_WIDTH; x += 50) {
            this.ctx.beginPath();
            this.ctx.moveTo(x * this.scale, 0);
            this.ctx.lineTo(x * this.scale, this.ORIGINAL_HEIGHT * this.scale);
            this.ctx.stroke();
        }
        
        for (let y = 0; y <= this.ORIGINAL_HEIGHT; y += 50) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y * this.scale);
            this.ctx.lineTo(this.ORIGINAL_WIDTH * this.scale, y * this.scale);
            this.ctx.stroke();
        }
    }
    
    renderMockData() {
        this.purchasedPixels.forEach(pixel => {
            // Draw purchased pixel background
            this.ctx.fillStyle = 'rgba(0, 122, 255, 0.3)';
            this.ctx.fillRect(
                pixel.x * this.scale, 
                pixel.y * this.scale, 
                pixel.width * this.scale, 
                pixel.height * this.scale
            );
            
            // Draw border
            this.ctx.strokeStyle = 'var(--primary-500)';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(
                pixel.x * this.scale, 
                pixel.y * this.scale, 
                pixel.width * this.scale, 
                pixel.height * this.scale
            );
            
            // Draw text if no image
            if (!pixel.image) {
                this.ctx.fillStyle = 'white';
                this.ctx.font = `${12 * this.scale}px Inter`;
                this.ctx.textAlign = 'center';
                this.ctx.fillText(
                    pixel.text || 'PIXEL',
                    (pixel.x + pixel.width / 2) * this.scale,
                    (pixel.y + pixel.height / 2) * this.scale
                );
            }
        });
    }
    
    renderRecentPurchases() {
        const container = document.querySelector('.recent-purchases');
        container.innerHTML = '';
        
        const recent = this.purchasedPixels.slice(-5).reverse();
        recent.forEach((pixel, index) => {
            const item = document.createElement('div');
            item.className = 'purchase-item';
            item.innerHTML = `
                <div class="purchase-preview" style="background-color: ${pixel.image ? 'transparent' : '#007AFF'}"></div>
                <div class="purchase-info">
                    <div>${pixel.text || 'Pixel Purchase'}</div>
                    <div class="purchase-amount">€${(pixel.width * pixel.height * this.pricePerPixel).toFixed(2)}</div>
                </div>
            `;
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