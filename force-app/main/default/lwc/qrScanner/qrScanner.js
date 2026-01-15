import { LightningElement, track } from 'lwc';
import { loadScript } from 'lightning/platformResourceLoader';
import jsQR from '@salesforce/resourceUrl/jsQR';

export default class QrScanner extends LightningElement {
    @track isScanning = false;
    @track scannedCode = '';
    @track errorMessage = '';
    
    videoStream = null;
    scanInterval = null;
    jsQRLoaded = false;
    
    /**
     * Disconnected callback - cleanup
     */
    disconnectedCallback() {
        this.stopScanning();
    }
    
    /**
     * Start scanning for QR codes
     */
    async startScanning() {
        try {
            // Load jsQR library if not already loaded
            if (!this.jsQRLoaded) {
                await loadScript(this, jsQR);
                this.jsQRLoaded = true;
            }
            
            // Get video element
            const video = this.refs.videoElement;
            
            // Request camera access
            this.videoStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' }
            });
            
            video.srcObject = this.videoStream;
            this.isScanning = true;
            this.errorMessage = '';
            
            // Wait for video to be ready
            video.onloadedmetadata = () => {
                video.play();
                this.startQRDetection();
            };
            
        } catch (error) {
            this.errorMessage = 'Failed to access camera: ' + error.message;
            console.error('Camera access error:', error);
        }
    }
    
    /**
     * Stop scanning
     */
    stopScanning() {
        // Stop video stream
        if (this.videoStream) {
            const tracks = this.videoStream.getTracks();
            tracks.forEach(track => track.stop());
            this.videoStream = null;
        }
        
        // Clear scan interval
        if (this.scanInterval) {
            clearInterval(this.scanInterval);
            this.scanInterval = null;
        }
        
        this.isScanning = false;
    }
    
    /**
     * Start QR code detection loop
     */
    startQRDetection() {
        const video = this.refs.videoElement;
        const canvas = this.refs.canvasElement;
        const canvasContext = canvas.getContext('2d');
        
        // Set canvas size to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // Scan for QR codes every 100ms
        this.scanInterval = setInterval(() => {
            if (video.readyState === video.HAVE_ENOUGH_DATA) {
                // Draw video frame to canvas
                canvasContext.drawImage(video, 0, 0, canvas.width, canvas.height);
                
                // Get image data
                const imageData = canvasContext.getImageData(0, 0, canvas.width, canvas.height);
                
                // Detect QR code using jsQR library
                const code = jsQR(imageData.data, imageData.width, imageData.height, {
                    inversionAttempts: 'dontInvert'
                });
                
                if (code && code.data) {
                    this.handleQRCodeDetected(code.data);
                }
            }
        }, 100);
    }
    
    /**
     * Handle QR code detection
     */
    handleQRCodeDetected(data) {
        this.scannedCode = data;
        this.stopScanning();
        
        // Dispatch event to parent component
        const event = new CustomEvent('productscanned', {
            detail: {
                productCode: data
            }
        });
        this.dispatchEvent(event);
    }
    
    /**
     * Get refs helper
     */
    get refs() {
        return {
            videoElement: this.template.querySelector('video'),
            canvasElement: this.template.querySelector('canvas')
        };
    }
}
