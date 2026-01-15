import { LightningElement, track } from 'lwc';
import ACCOUNT_OBJECT from '@salesforce/schema/Account';
import NAME_FIELD from '@salesforce/schema/Account.Name';
import PHONE_FIELD from '@salesforce/schema/Account.Phone';
import INDUSTRY_FIELD from '@salesforce/schema/Account.Industry';

export default class LwcRecordFormDemo extends LightningElement {

    recordId = "001gL00000TJ6DtQAL";
    objectApiName = ACCOUNT_OBJECT;
    @track myField = [NAME_FIELD, PHONE_FIELD, INDUSTRY_FIELD];


}