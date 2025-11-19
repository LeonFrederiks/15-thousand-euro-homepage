// Purchase Page Application
class PurchaseFlow {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 5;
        this.selectedSize = { width: 30, height: 30 };
        this.position = { x: 0, y: 0 };
        this.uploadedImage = null;
        this.details = { text: '', link: '' };
        
        // Pricing
        this.pricePerPixel = 0.00723;
        this.minPixels = 30 * 30; // 900 pixels minimum
        
        this.initializeElements();
        this.setupEventListeners();
        this.updateProgress();
    }
    
    initializeElements() {
        // Step elements
        this.steps = {
            1: document.getElementById('step1'),
            2: document.getElementById('step2'),
            3: document.getElementById('step3'),
            4: document.getElementById('step4'),
            5: document.getElementById('step5')
        };
        
        // Navigation buttons
        this.prevBtn = document.getElementById('prevBtn');
        this.nextBtn = document.getElementById('nextBtn');
        this.payPalBtn = document.getElementById('payPalBtn');
        
        // Size selection
        this.sizeInputs = document.querySelectorAll('input[name="size"]');
        this.customSize = document.getElementById('customSize');
        this.customWidth = document.getElementById('customWidth');
        this.customHeight = document.getElementById('customHeight');
        this.customPixels = document.getElementById('customPixels');
        this.customPrice = document.getElementById('customPrice');
        
        // Upload elements
        this.uploadZone = document.getElementById('uploadZone');
        this.imageInput = document.getElementById('imageInput');
        this.imagePreview = document.getElementById('imagePreview');
        this.previewImg = document.getElementById('previewImg');
        this.removeImage = document.getElementById('removeImage');
        this.imageInfo = document.getElementById('imageInfo');
        
        // Position canvas
        this.positionCanvas = document.getElementById('positionCanvas');
        this.posX = document.getElementById('posX');
        this.posY = document.getElementById('posY');
        
        // Details
        this.hoverText = document.getElementById('hoverText');
        this.hoverLink = document.getElementById('hoverLink');
        
        // Summary
        this.summarySize = document.getElementById('summarySize');
        this.summaryPosition = document.getElementById('summaryPosition');
        this.summaryPixels = document.getElementById('summaryPixels');
        this.summaryTotal = document.getElementById('summaryTotal');
        
        this.setupPositionCanvas();
    }
    
    setupEventListeners() {
        // Navigation
        this.prevBtn.addEventListener('click', () => this.previousStep());
        this.nextBtn.addEventListener('click', () => this.nextStep());
        this.payPalBtn.addEventListener('click', () => this.processPayment());
        
        // Size selection
        this.sizeInputs.forEach(input => {
            input.addEventListener('change', (e) => this.handleSizeSelection(e));
        });
        
        // Custom size
        this.customWidth.addEventListener('input', () => this.updateCustomSize());
        this.customHeight.addEventListener('input', () => this.updateCustomSize());
        
        // Upload
        this.uploadZone.addEventListener('click', () => this.imageInput.click());
        this.imageInput.addEventListener('change', (e) => this.handleImageUpload(e));
        this.removeImage.addEventListener('click', () => this.removeImageUpload());
        
        // Drag and drop
        this.uploadZone.addEventListener('dragover', (e) => this.handleDragOver(e));
        this.uploadZone.addEventListener('drop', (e) => this.handleDrop(e));
        this.uploadZone.addEventListener('dragleave', (e) => this.handleDragLeave(e));
        
        // Position canvas
        this.positionCanvas.addEventListener('click', (e) => this.handlePositionClick(e));
        
        // Details
        this.hoverText.addEventListener('input', () => this.updateDetails());
        this.hoverLink.addEventListener('input', () => this.updateDetails());
    }
    
    setupPositionCanvas() {
        // Create a simplified canvas showing the grid with current selection
        this.positionCanvas.width = 400;
        this.positionCanvas.height = 225; // Maintain 16:9 aspect ratio
        this.ctx = this.positionCanvas.getContext('2d');
        
        this.renderPositionCanvas();
    }
    
    renderPositionCanvas() {
        // Clear canvas
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.positionCanvas.width, this.positionCanvas.height);
        
        // Draw grid
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.lineWidth = 1;
        
        const gridSize = 10; // Smaller grid for preview
        for (let x = 0; x <= this.positionCanvas.width; x += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.positionCanvas.height);
            this.ctx.stroke();
        }
        
        for (let y = 0; y <= this.positionCanvas.height; y += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.positionCanvas.width, y);
            this.ctx.stroke();
        }
        
        // Draw selection if position is set
        if (this.position.x > 0 || this.position.y > 0) {
            const scaleX = this.positionCanvas.width / 1920;
            const scaleY = this.positionCanvas.height / 1080;
            
            this.ctx.fillStyle = 'rgba(0, 122, 255, 0.3)';
            this.ctx.fillRect(
                this.position.x * scaleX,
                this.position.y * scaleY,
                this.selectedSize.width * scaleX,
                this.selectedSize.height * scaleY
            );
            
            this.ctx.strokeStyle = '#007AFF';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(
                this.position.x * scaleX,
                this.position.y * scaleY,
                this.selectedSize.width * scaleX,
                this.selectedSize.height * scaleY
            );
        }
    }
    
    updateProgress() {
        // Show/hide navigation buttons
        this.prevBtn.classList.toggle('hidden', this.currentStep === 1);
        this.nextBtn.classList.toggle('hidden', this.currentStep === this.totalSteps);
        this.payPalBtn.classList.toggle('hidden', this.currentStep !== this.totalSteps);
        
        // Update next button text and state
        if (this.currentStep < this.totalSteps) {
            this.nextBtn.textContent = this.currentStep === this.totalSteps - 1 ? 'Review Order' : 'Next';
            this.nextBtn.disabled = !this.canProceedFromStep(this.currentStep);
        }
        
        // Update PayPal button
        if (this.currentStep === this.totalSteps) {
            this.payPalBtn.disabled = !this.isOrderComplete();
        }
    }
    
    canProceedFromStep(step) {
        switch (step) {
            case 1:
                return this.selectedSize.width >= 30 && this.selectedSize.height >= 30;
            case 2:
                return this.uploadedImage !== null;
            case 3:
                return this.position.x >= 0 && this.position.y >= 0;
            case 4:
                return true; // Details are optional
            default:
                return true;
        }
    }
    
    isOrderComplete() {
        return this.selectedSize.width >= 30 && 
               this.selectedSize.height >= 30 && 
               this.uploadedImage !== null &&
               this.position.x >= 0 && 
               this.position.y >= 0;
    }
    
    nextStep() {
        if (this.canProceedFromStep(this.currentStep) && this.currentStep < this.totalSteps) {
            this.currentStep++;
            this.showStep(this.currentStep);
            this.updateProgress();
        }
    }
    
    previousStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
            this.showStep(this.currentStep);
            this.updateProgress();
        }
    }
    
    showStep(step) {
        // Hide all steps
        Object.values(this.steps).forEach(stepEl => stepEl.classList.add('hidden'));
        
        // Show current step
        this.steps[step].classList.remove('hidden');
        
        // Special handling for certain steps
        if (step === 5) {
            this.updateSummary();
        }
    }
    
    handleSizeSelection(e) {
        const selectedValue = e.target.value;
        
        if (selectedValue === 'custom') {
            this.customSize.classList.remove('hidden');
            this.selectedSize = { width: 30, height: 30 };
        } else {
            this.customSize.classList.add('hidden');
            const [width, height] = selectedValue.split('x').map(Number);
            this.selectedSize = { width, height };
        }
        
        this.updateCustomSize();
        this.renderPositionCanvas();
        this.updateProgress();
    }
    
    updateCustomSize() {
        if (this.customSize.classList.contains('hidden')) return;
        
        const width = parseInt(this.customWidth.value) || 30;
        const height = parseInt(this.customHeight.value) || 30;
        
        // Enforce minimum sizes
        const finalWidth = Math.max(30, Math.min(1920, width));
        const finalHeight = Math.max(30, Math.min(1080, height));
        
        if (finalWidth !== width) this.customWidth.value = finalWidth;
        if (finalHeight !== height) this.customHeight.value = finalHeight;
        
        this.selectedSize = { width: finalWidth, height: finalHeight };
        
        const pixels = finalWidth * finalHeight;
        const price = pixels * this.pricePerPixel;
        
        this.customPixels.textContent = pixels.toLocaleString();
        this.customPrice.textContent = `€${price.toFixed(2)}`;
    }
    
    handleImageUpload(e) {
        const file = e.target.files[0];
        if (file) {
            this.processImage(file);
        }
    }
    
    handleDragOver(e) {
        e.preventDefault();
        e.currentTarget.style.borderColor = 'var(--primary-500)';
        e.currentTarget.style.background = 'rgba(0, 122, 255, 0.05)';
    }
    
    handleDragLeave(e) {
        e.preventDefault();
        e.currentTarget.style.borderColor = 'var(--border-subtle)';
        e.currentTarget.style.background = 'rgba(38, 38, 38, 0.3)';
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
                    height: img.height,
                    name: file.name,
                    size: file.size
                };
                
                this.showImagePreview();
                this.updateProgress();
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
    
    showImagePreview() {
        this.uploadZone.classList.add('hidden');
        this.imagePreview.classList.remove('hidden');
        this.previewImg.src = this.uploadedImage.src;
        
        // Show image info
        const aspectRatio = (this.uploadedImage.width / this.uploadedImage.height).toFixed(2);
        this.imageInfo.innerHTML = `
            <strong>${this.uploadedImage.name}</strong><br>
            ${this.uploadedImage.width}×${this.uploadedImage.height}px<br>
            Aspect ratio: ${aspectRatio}<br>
            ${(this.uploadedImage.size / 1024 / 1024).toFixed(2)}MB
        `;
    }
    
    removeImageUpload() {
        this.uploadedImage = null;
        this.uploadZone.classList.remove('hidden');
        this.imagePreview.classList.add('hidden');
        this.imageInput.value = '';
        this.updateProgress();
    }
    
    handlePositionClick(e) {
        const rect = this.positionCanvas.getBoundingClientRect();
        const scaleX = 1920 / this.positionCanvas.width;
        const scaleY = 1080 / this.positionCanvas.height;
        
        const x = Math.round((e.clientX - rect.left) * scaleX);
        const y = Math.round((e.clientY - rect.top) * scaleY);
        
        // Ensure position doesn't go outside canvas bounds
        this.position = {
            x: Math.max(0, Math.min(1920 - this.selectedSize.width, x)),
            y: Math.max(0, Math.min(1080 - this.selectedSize.height, y))
        };
        
        this.posX.textContent = this.position.x;
        this.posY.textContent = this.position.y;
        
        this.renderPositionCanvas();
        this.updateProgress();
    }
    
    updateDetails() {
        this.details = {
            text: this.hoverText.value || '',
            link: this.hoverLink.value || ''
        };
    }
    
    updateSummary() {
        this.summarySize.textContent = `${this.selectedSize.width}×${this.selectedSize.height} pixels`;
        this.summaryPosition.textContent = `(${this.position.x}, ${this.position.y})`;
        
        const totalPixels = this.selectedSize.width * this.selectedSize.height;
        const totalPrice = totalPixels * this.pricePerPixel;
        
        this.summaryPixels.textContent = totalPixels.toLocaleString();
        this.summaryTotal.textContent = `€${totalPrice.toFixed(2)}`;
    }
    
    processPayment() {
        if (!this.isOrderComplete()) {
            alert('Please complete all required steps before proceeding to payment.');
            return;
        }
        
        // Disable button and show processing state
        this.payPalBtn.disabled = true;
        this.payPalBtn.innerHTML = 'Processing Payment...';
        
        // Simulate PayPal payment processing
        setTimeout(() => {
            this.completePurchase();
        }, 2000);
    }
    
    completePurchase() {
        // Show success message
        const successMessage = document.createElement('div');
        successMessage.className = 'success-message';
        successMessage.innerHTML = `
            <h3>🎉 Purchase Successful!</h3>
            <p>Thank you for your purchase! Your pixels will be visible on the homepage within 5-10 minutes.</p>
            <p>You'll receive a confirmation email shortly with your purchase details.</p>
            <button onclick="window.location.href='index.html'" class="nav-btn primary" style="margin-top: 16px;">
                View Homepage
            </button>
        `;
        
        // Replace the form with success message
        const form = document.querySelector('.purchase-form');
        form.innerHTML = '';
        form.appendChild(successMessage);
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// Initialize purchase flow when page loads
document.addEventListener('DOMContentLoaded', () => {
    new PurchaseFlow();
});