import { LightningElement, track, wire } from 'lwc';
import {createRecord} from 'lightning/uiRecordApi';
import {getPicklistValues, getObjectInfo} from 'lightning/uiObjectInfoApi';
import {ShowToastEvent} from 'lightning/platformShowToastEvent';
import {NavigationMixin} from 'lightning/navigation';

import ACCOUNT_OBJECT from '@salesforce/schema/Account';
import NAME_FIELD from '@salesforce/schema/Account.Name';
import INDUSTRY_FIELD from '@salesforce/schema/Account.Industry';
import PHONE_FIELD from '@salesforce/schema/Account.Phone';
import WEBSITE_FIELD from '@salesforce/schema/Account.Website';

export default class CreateAccountFormUiApi extends NavigationMixin(LightningElement) {

    @track isLoading = false;
    @track showPhone = false;

    @track accountName = '';
    @track accountIndustry = '';
    @track industryOptions = [];
    @track accountPhone = '';
    @track accountWebsite = '';


    //Get Account object Info for Picklist
    @wire(getObjectInfo, {objectApiName: ACCOUNT_OBJECT})
    accountObjectInfo;

    //Get Industry Picklist
    @wire(getPicklistValues, {
        recordTypeId: '$accountObjectInfo.data.defaultRecordTypeId',
        fieldApiName: INDUSTRY_FIELD
    })
    wiredAccountIndustryPicklist({data, error}){
        if(data){
            this.industryOptions = data.values.map(item=>{
                return{
                    label: item.label,
                    value: item.value
                };
            });
        }
        else if(error){
            this.showToast('Error', 'Failed to load Industry Picklist', 'error');
        }
    }

    //Handle Name Field
    handleNameChange(event){
        this.accountName = event.target.value;
    }

    //Handle Industry Field
    handleIndustryChange(event){
        this.accountIndustry = event.target.value;
        this.showPhone = this.accountIndustry === 'Technology';
    }

    //Handle Phone field
    handlePhoneChange(event){
        this.accountPhone = event.target.value;
    }

    //Handle Website Field
    handleWebsiteChange(event){
        this.accountWebsite = event.target.value;
    }

    //Handle Save Button
    handleSave(){

        //put Validation for AAccount Name if not filled
        if(!this.accountName || this.accountName.trim() === ''){
            this.showToast('Error', 'Account Name is required', 'error');
            return;
        }

        this.isLoading = true;

        //Build record object for CREATE
        const fields = {}
        fields[NAME_FIELD.fieldApiName] = this.accountName;
        fields[INDUSTRY_FIELD.fieldApiName] = this.accountIndustry;
        fields[PHONE_FIELD.fieldApiName] = this.accountPhone;
        fields[WEBSITE_FIELD.fieldApiName] = this.accountWebsite;

        const recordInput = {
            apiName: ACCOUNT_OBJECT.objectApiName,
            fields
        };
        console.log('Creating Records with field: ', fields);

        //Use Create Record by lightning/uiRecordApi
        createRecord(recordInput)
        .then(acc => {
            this.isLoading = false;

            this.showToast('Success', 'Account Created successfully', 'success');

            //Navigate to the newly created record
            this[NavigationMixin.Navigate]({
                type: 'standard__recordPage',
                attributes:{
                    recordId: acc.id,
                    objectApiName: 'Account',
                    actionName: 'view'
                }
            });
        })
        .catch(error => {
            this.isLoading = false;

            let errorMessage = 'Error Creating Record';
            if(error.body && error.body.message){
                errorMessage = error.body.message;
            }

            this.showToast('Error', errorMessage, 'error');
        });
    }

    //Handle Cancel button
    handleCancel(){

        //Clear the form
        this.accountName = '';
        this.accountIndustry = '';
        this.accountPhone = '';
        this.accountWebsite = '';

        this.showPhone = false;

        this.showToast('Info', 'Form Cleared', 'info');
    }

    //Show Toast Event
    showToast(title, message, variant){
        const event = new ShowToastEvent({
            title:title,
            message:message,
            variant:variant,
            mode: 'dismissable'
        });

        this.dispatchEvent(event);
    }
}