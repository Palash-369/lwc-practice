import { LightningElement, track } from 'lwc';
import {createRecord} from 'lightning/uiRecordApi';
import ACCOUNT_OBJECT from '@salesforce/schema/Account';
import NAME_FIELD from '@salesforce/schema/Account.Name';
import BILLING_STREET from '@salesforce/schema/Account.BillingStreet';


export default class UiRecordApiCreateRecord extends LightningElement {

    @track accountName = '';
    @track billingStreet = '';
    @track recordId;

    handleChange(event){
        const field = event.target.dataset.field;
        this[field] = event.target.value;
    }

    handleClick(){
        const fields = {};
        fields[NAME_FIELD.fieldApiName] = this.accountName;
        fields[BILLING_STREET.fieldApiName] = this.billingStreet;

        const recordInput = {
            apiName:ACCOUNT_OBJECT.objectApiName,
            fields
        };

        createRecord(recordInput)
        .then(account => {
            this.recordId = account.id;
        })
        .catch(error => {
            window.alert('Error Creating record: '+JSON.stringify(error));
        });
    }
}