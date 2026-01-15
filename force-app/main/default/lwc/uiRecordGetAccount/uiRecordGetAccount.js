import { LightningElement, track } from 'lwc';
import { getRecord } from 'lightning/uiRecordApi';
import NAME_FIELD from '@salesforce/schema/Account.Name';
import INDUSTRY_FIELD from '@salesforce/schema/Account.Industry';
import PHONE_FIELD from '@salesforce/schema/Account.Phone';

export default class UiRecordGetAccount extends LightningElement {

    @track recordId = '';
    @track accountData = null;
    @track error = '';
    @track isLoading = false;

    handleChange(event) {
        this.recordId = event.target.value;
        this.accountData = null;
        this.error = '';
    }

    fetchAccount() {
        // Validation
        if (!this.recordId) {
            this.error = 'Please enter an Account ID';
            return;
        }

        // Basic ID validation (18 or 15 chars starting with 001)
        if (!this.recordId.startsWith('001') || 
            (this.recordId.length !== 15 && this.recordId.length !== 18)) {
            this.error = 'Invalid Account ID format';
            return;
        }

        // Clear previous data
        this.accountData = null;
        this.error = '';
        this.isLoading = true;

        getRecord({
            recordId: this.recordId,
            fields: [NAME_FIELD, INDUSTRY_FIELD, PHONE_FIELD]
        })
        .then(record => {
            this.accountData = {
                name: record.fields.Name.value,
                industry: record.fields.Industry.value || 'N/A',
                phone: record.fields.Phone.value || 'N/A'
            };
            this.isLoading = false;
            console.log('Account Fetched:', record);
        })
        .catch(error => {
            this.accountData = null;
            this.isLoading = false;

            // Better error handling
            if (error.body) {
                this.error = error.body.message;
            } else if (error.message) {
                this.error = error.message;
            } else {
                this.error = 'Unknown error occurred';
            }

            console.error('Error:', error);
        });
    }

    // Computed property for button state
    get isButtonDisabled() {
        return !this.recordId || this.isLoading;
    }
}