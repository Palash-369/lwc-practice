import { LightningElement, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { NavigationMixin } from 'lightning/navigation';

// ✅ OPTIONAL: Import schema fields for reference (not required for create forms)
// These are useful if you need to programmatically access field metadata
import NAME_FIELD from '@salesforce/schema/Account.Name';
import INDUSTRY_FIELD from '@salesforce/schema/Account.Industry';
import PHONE_FIELD from '@salesforce/schema/Account.Phone';
import WEBSITE_FIELD from '@salesforce/schema/Account.Website';

export default class CustomAccountForm extends NavigationMixin(LightningElement) {
    
    @track showPhone = false;
    
    // ✅ You can reference imported fields if needed
    nameField = NAME_FIELD;
    industryField = INDUSTRY_FIELD;
    phoneField = PHONE_FIELD;
    websiteField = WEBSITE_FIELD;

    /**
     * Handles Industry field change
     * Shows Phone field when Industry = 'Technology'
     */
    handleIndustryChange(event) {
        const selectedIndustry = event.target.value;
        
        // Show Phone field if Industry is 'Technology'
        this.showPhone = selectedIndustry === 'Technology';
        
        console.log('Industry selected:', selectedIndustry);
        console.log('Show Phone field:', this.showPhone);
    }

    /**
     * Handles form submission with custom validation
     */
    handleSubmit(event) {
        event.preventDefault(); // Stop default submission
        
        const fields = event.detail.fields;
        
        console.log('Form fields:', fields);
        
        // Custom validation: Check if Website is filled
        if (!fields.Website || fields.Website.trim() === '') {
            this.showToast('Error', 'Website is required', 'error');
            return; // Stop submission
        }
        
        // If Phone field is visible, you can add validation for it too
        if (this.showPhone && (!fields.Phone || fields.Phone.trim() === '')) {
            this.showToast('Warning', 'Phone is recommended for Technology industry', 'warning');
            // Continue submission (just a warning, not blocking)
        }
        
        // Submit the form if validation passes
        this.template.querySelector('lightning-record-edit-form').submit(fields);
    }

    /**
     * Handles successful record creation
     */
    handleSuccess(event) {
        const recordId = event.detail.id;
        
        console.log('Account created successfully. Record ID:', recordId);
        
        // Show success toast
        this.showToast('Success', 'Account created successfully!', 'success');
        
        // Navigate to the newly created Account record
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: recordId,
                objectApiName: 'Account',
                actionName: 'view'
            }
        });
    }

    /**
     * Handles cancel button click
     */
    handleCancel() {
        // Navigate to Account list view
        this[NavigationMixin.Navigate]({
            type: 'standard__objectPage',
            attributes: {
                objectApiName: 'Account',
                actionName: 'list'
            },
            state: {
                filterName: 'Recent'
            }
        });
    }

    /**
     * Shows toast notification
     */
    showToast(title, message, variant) {
        const event = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant,
            mode: 'dismissable'
        });
        this.dispatchEvent(event);
    }
}