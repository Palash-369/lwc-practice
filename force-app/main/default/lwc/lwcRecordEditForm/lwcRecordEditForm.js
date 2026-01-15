import { LightningElement } from 'lwc';
import {ShowToastEvent} from 'lightning/platformShowToastEvent';
import ACCOUNT_OBJECT from '@salesforce/schema/Account';
import ACCOUNT_NAME from '@salesforce/schema/Account.Name';
import ACCOUNT_PHONE from '@salesforce/schema/Account.Phone';
import ACCOUNT_INDUSTRY from '@salesforce/schema/Account.Industry';

export default class LwcRecordEditForm extends LightningElement {

    AccountApiObject = ACCOUNT_OBJECT;
    nameField = ACCOUNT_NAME;
    phoneField = ACCOUNT_PHONE;
    industryField = ACCOUNT_INDUSTRY;
    accountId = "";

    handleSuccess(event){

        this.accountId = event.detail.id;

        const evt = new ShowToastEvent({
            title:"Success",
            message:"Account Created",
            variant:'success'
        });

        this.dispatchEvent(evt);
    }
}