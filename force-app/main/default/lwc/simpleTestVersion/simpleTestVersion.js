import { LightningElement, api } from 'lwc';
import { updateRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

import ID_FIELD from '@salesforce/schema/Account.Id';
import NAME_FIELD from '@salesforce/schema/Account.Name';

export default class SimpleTestVersion extends LightningElement {
    @api recordId;
    
    handleSimpleSave() {
        console.log('Testing simple save with recordId:', this.recordId);
        
        const fields = {};
        fields[ID_FIELD.fieldApiName] = this.recordId;
        fields[NAME_FIELD.fieldApiName] = 'Test Name ' + Date.now();
        
        console.log('Updating with fields:', fields);
        
        updateRecord({ fields })
            .then(() => {
                console.log('SUCCESS!');
                this.dispatchEvent(new ShowToastEvent({
                    title: 'Success',
                    message: 'It works!',
                    variant: 'success'
                }));
            })
            .catch(error => {
                console.error('FAILED:', error);
                this.dispatchEvent(new ShowToastEvent({
                    title: 'Error',
                    message: JSON.stringify(error),
                    variant: 'error'
                }));
            });
    }
}