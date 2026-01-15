import { LightningElement, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { NavigationMixin } from 'lightning/navigation';

// Import Apex methods
import getPriceBooks from '@salesforce/apex/BillingSystemController.getPriceBooks';
import checkDuplicateCustomer from '@salesforce/apex/BillingSystemController.checkDuplicateCustomer';
import getProducts from '@salesforce/apex/BillingSystemController.getProducts';
import getProductByCode from '@salesforce/apex/BillingSystemController.getProductByCode';
import saveBillingData from '@salesforce/apex/BillingSystemController.saveBillingData';

const COLUMNS = [
    { label: 'Product Name', fieldName: 'productName', type: 'text' },
    { label: 'Product Code', fieldName: 'productCode', type: 'text' },
    { label: 'Unit Price', fieldName: 'unitPrice', type: 'currency', typeAttributes: { currencyCode: 'INR' } },
    { label: 'Quantity', fieldName: 'quantity', type: 'number', editable: true },
    { label: 'GST Applicable', fieldName: 'gstApplicable', type: 'boolean' },
    { label: 'Line Total', fieldName: 'totalAmount', type: 'currency', typeAttributes: { currencyCode: 'INR' } },
    { 
        type: 'action', 
        typeAttributes: { 
            rowActions: [
                { label: 'Delete', name: 'delete' }
            ] 
        } 
    }
];

export default class BillingSystem extends NavigationMixin(LightningElement) {
    // Price Book
    @track priceBookOptions = [];
    @track selectedPriceBookId = '';
    
    // Customer Information
    @track customerName = '';
    @track email = '';
    @track phone = '';
    @track duplicateWarning = false;
    @track existingAccountId = null;
    
    // Products
    @track selectedProducts = [];
    @track searchResults = [];
    @track searchKey = '';
    productColumns = COLUMNS;
    
    // GST
    @track withGST = false;
    
    // Summary
    @track subtotal = 0;
    @track gstAmount = 0;
    @track grandTotal = 0;
    
    // UI State
    @track isLoading = false;
    @track showScanner = false;
    @track showProductSearch = false;
    @track errorMessage = '';
    
    // Debounce timer
    searchTimeout;
    
    /**
     * Load price books on component initialization
     */
    connectedCallback() {
        this.loadPriceBooks();
    }
    
    /**
     * Load price books from Apex
     */
    loadPriceBooks() {
        this.isLoading = true;
        getPriceBooks()
            .then(result => {
                this.priceBookOptions = result.map(pb => ({
                    label: pb.Name,
                    value: pb.Id
                }));
                this.isLoading = false;
            })
            .catch(error => {
                this.showToast('Error', 'Failed to load price books: ' + this.getErrorMessage(error), 'error');
                this.isLoading = false;
            });
    }
    
    /**
     * Handle price book selection change
     */
    handlePriceBookChange(event) {
        const newPriceBookId = event.detail.value;
        
        // If products exist and price book is changing, confirm
        if (this.selectedProducts.length > 0 && this.selectedPriceBookId !== newPriceBookId) {
            if (confirm('Changing price book will clear all selected products. Continue?')) {
                this.selectedPriceBookId = newPriceBookId;
                this.selectedProducts = [];
                this.calculateSummary();
            }
        } else {
            this.selectedPriceBookId = newPriceBookId;
        }
    }
    
    /**
     * Handle customer input changes
     */
    handleCustomerInputChange(event) {
        const field = event.target.name;
        const value = event.target.value;
        
        if (field === 'customerName') {
            this.customerName = value;
        } else if (field === 'email') {
            this.email = value;
        } else if (field === 'phone') {
            this.phone = value;
        }
    }
    
    /**
     * Handle customer field blur - check for duplicates
     */
    handleCustomerBlur() {
        if (this.email || this.phone) {
            this.checkForDuplicate();
        }
    }
    
    /**
     * Check for duplicate customer
     */
    checkForDuplicate() {
        checkDuplicateCustomer({ 
            email: this.email, 
            phone: this.phone 
        })
            .then(result => {
                if (result) {
                    this.duplicateWarning = true;
                    this.existingAccountId = result.Id;
                    this.showToast('Info', 'Existing customer found: ' + result.Name, 'info');
                } else {
                    this.duplicateWarning = false;
                    this.existingAccountId = null;
                }
            })
            .catch(error => {
                console.error('Error checking duplicate:', error);
            });
    }
    
    /**
     * Handle scan product button click
     */
    handleScanProduct() {
        this.showScanner = true;
    }
    
    /**
     * Close scanner modal
     */
    closeScanner() {
        this.showScanner = false;
    }
    
    /**
     * Handle product scanned from QR code
     */
    handleProductScanned(event) {
        const productCode = event.detail.productCode;
        this.closeScanner();
        this.isLoading = true;
        
        getProductByCode({ 
            productCode: productCode, 
            priceBookId: this.selectedPriceBookId 
        })
            .then(product => {
                this.addProductToList(product);
                this.showToast('Success', 'Product added: ' + product.productName, 'success');
                this.isLoading = false;
            })
            .catch(error => {
                this.showToast('Error', this.getErrorMessage(error), 'error');
                this.isLoading = false;
            });
    }
    
    /**
     * Handle add product button click
     */
    handleAddProduct() {
        this.showProductSearch = true;
        this.searchKey = '';
        this.searchResults = [];
        this.performProductSearch();
    }
    
    /**
     * Close product search modal
     */
    closeProductSearch() {
        this.showProductSearch = false;
        this.searchKey = '';
        this.searchResults = [];
    }
    
    /**
     * Handle search input change with debounce
     */
    handleSearchChange(event) {
        this.searchKey = event.target.value;
        
        // Clear previous timeout
        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout);
        }
        
        // Set new timeout for debounced search
        this.searchTimeout = setTimeout(() => {
            this.performProductSearch();
        }, 500);
    }
    
    /**
     * Perform product search
     */
    performProductSearch() {
        this.isLoading = true;
        
        getProducts({ 
            searchKey: this.searchKey, 
            priceBookId: this.selectedPriceBookId 
        })
            .then(result => {
                this.searchResults = result;
                this.isLoading = false;
            })
            .catch(error => {
                this.showToast('Error', this.getErrorMessage(error), 'error');
                this.isLoading = false;
            });
    }
    
    /**
     * Handle product selection from search results
     */
    handleProductSelect(event) {
        const productId = event.currentTarget.dataset.productId;
        const product = this.searchResults.find(p => p.productId === productId);
        
        if (product) {
            this.addProductToList(product);
            this.closeProductSearch();
            this.showToast('Success', 'Product added: ' + product.productName, 'success');
        }
    }
    
    /**
     * Add product to selected products list
     */
    addProductToList(product) {
        // Check if product already exists
        const existingProductIndex = this.selectedProducts.findIndex(
            p => p.productId === product.productId
        );
        
        if (existingProductIndex >= 0) {
            // Increment quantity
            this.selectedProducts[existingProductIndex].quantity += 1;
            this.selectedProducts = [...this.selectedProducts];
        } else {
            // Add new product
            this.selectedProducts = [...this.selectedProducts, { ...product }];
        }
        
        this.calculateSummary();
    }
    
    /**
     * Handle datatable row actions
     */
    handleRowAction(event) {
        const actionName = event.detail.action.name;
        const row = event.detail.row;
        
        if (actionName === 'delete') {
            this.deleteProduct(row.productId);
        }
    }
    
    /**
     * Handle inline editing of quantity
     */
    handleCellChange(event) {
        const draftValues = event.detail.draftValues;
        
        draftValues.forEach(draft => {
            const productIndex = this.selectedProducts.findIndex(
                p => p.productId === draft.productId
            );
            
            if (productIndex >= 0) {
                this.selectedProducts[productIndex].quantity = draft.quantity;
            }
        });
        
        this.selectedProducts = [...this.selectedProducts];
        this.calculateSummary();
    }
    
    /**
     * Delete product from list
     */
    deleteProduct(productId) {
        this.selectedProducts = this.selectedProducts.filter(
            p => p.productId !== productId
        );
        this.calculateSummary();
        this.showToast('Success', 'Product removed', 'success');
    }
    
    /**
     * Handle GST toggle change
     */
    handleGSTToggle(event) {
        this.withGST = event.target.checked;
        this.calculateSummary();
    }
    
    /**
     * Calculate summary totals
     */
    calculateSummary() {
        this.subtotal = 0;
        this.gstAmount = 0;
        
        this.selectedProducts.forEach(product => {
            const lineTotal = product.unitPrice * product.quantity;
            this.subtotal += lineTotal;
            
            // Calculate GST if applicable
            if (this.withGST && product.gstApplicable) {
                const lineGST = lineTotal * 0.18;
                this.gstAmount += lineGST;
                product.gstAmount = lineGST;
                product.totalAmount = lineTotal + lineGST;
            } else {
                product.gstAmount = 0;
                product.totalAmount = lineTotal;
            }
        });
        
        this.grandTotal = this.subtotal + this.gstAmount;
        
        // Force re-render of products table
        this.selectedProducts = [...this.selectedProducts];
    }
    
    /**
     * Handle save button click
     */
    handleSave() {
        if (!this.validateForm()) {
            return;
        }
        
        this.isLoading = true;
        
        const billingData = {
            customerName: this.customerName,
            email: this.email,
            phone: this.phone,
            priceBookId: this.selectedPriceBookId,
            withGST: this.withGST,
            products: this.selectedProducts
        };
        
        saveBillingData({ billingData: billingData })
            .then(opportunityId => {
                this.showToast('Success', 'Billing data saved successfully!', 'success');
                this.isLoading = false;
                
                // Navigate to PDF generation
                this.generatePDF(opportunityId);
                
                // Reset form
                this.resetForm();
            })
            .catch(error => {
                this.showToast('Error', this.getErrorMessage(error), 'error');
                this.isLoading = false;
            });
    }
    
    /**
     * Generate PDF invoice
     */
    generatePDF(opportunityId) {
        this[NavigationMixin.Navigate]({
            type: 'standard__webPage',
            attributes: {
                url: '/apex/BillingInvoicePDF?id=' + opportunityId
            }
        }, false);
    }
    
    /**
     * Handle cancel button click
     */
    handleCancel() {
        if (confirm('Are you sure you want to cancel? All data will be lost.')) {
            this.resetForm();
        }
    }
    
    /**
     * Validate form before save
     */
    validateForm() {
        // Check required fields
        if (!this.selectedPriceBookId) {
            this.showToast('Error', 'Please select a price book', 'error');
            return false;
        }
        
        if (!this.customerName) {
            this.showToast('Error', 'Customer name is required', 'error');
            return false;
        }
        
        if (!this.email) {
            this.showToast('Error', 'Customer email is required', 'error');
            return false;
        }
        
        if (!this.phone) {
            this.showToast('Error', 'Customer phone is required', 'error');
            return false;
        }
        
        // Validate email format
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(this.email)) {
            this.showToast('Error', 'Please enter a valid email address', 'error');
            return false;
        }
        
        // Validate phone format
        const phonePattern = /^[0-9]{10}$/;
        if (!phonePattern.test(this.phone)) {
            this.showToast('Error', 'Please enter a valid 10-digit phone number', 'error');
            return false;
        }
        
        if (this.selectedProducts.length === 0) {
            this.showToast('Error', 'Please add at least one product', 'error');
            return false;
        }
        
        return true;
    }
    
    /**
     * Reset form to initial state
     */
    resetForm() {
        this.customerName = '';
        this.email = '';
        this.phone = '';
        this.duplicateWarning = false;
        this.existingAccountId = null;
        this.selectedProducts = [];
        this.withGST = false;
        this.calculateSummary();
    }
    
    /**
     * Show toast notification
     */
    showToast(title, message, variant) {
        const event = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant
        });
        this.dispatchEvent(event);
    }
    
    /**
     * Extract error message from error object
     */
    getErrorMessage(error) {
        if (error.body && error.body.message) {
            return error.body.message;
        } else if (error.message) {
            return error.message;
        } else if (typeof error === 'string') {
            return error;
        }
        return 'An unknown error occurred';
    }
    
    // Computed properties
    
    get hasProducts() {
        return this.selectedProducts.length > 0;
    }
    
    get isScanDisabled() {
        return !this.selectedPriceBookId || this.isLoading;
    }
    
    get isAddDisabled() {
        return !this.selectedPriceBookId || this.isLoading;
    }
    
    get isSaveDisabled() {
        return this.isLoading || 
               !this.selectedPriceBookId || 
               !this.customerName || 
               !this.email || 
               !this.phone || 
               this.selectedProducts.length === 0;
    }
}
