import { LightningElement, track, wire, api } from 'lwc';
import {getRecord, updateRecord} from 'lightning/uiRecordApi';
import {getPicklistValues} from 'lightning/uiObjectInfoApi';
import {getObjectInfo} from 'lightning/uiObjectInfoApi';
import {ShowToastEvent} from 'lightning/platformShowToastEvent';
import {refreshApex} from '@salesforce/apex';

import ID_FIELD from '@salesforce/schema/Account.Id';
import NAME_FIELD from '@salesforce/schema/Account.Name';
import INDUSTRY_FIELD from '@salesforce/schema/Account.Industry';
import PHONE_FIELD from '@salesforce/schema/Account.Phone';
import WEBSITE_FIELD from '@salesforce/schema/Account.Website';

export default class CustomAccountFormUiApi extends LightningElement {

    @api recordId;
    @track isLoading = false;
    @track showPhone = false;

    //Track Form Field Values
    @track accountName = '';
    @track accountIndustry = '';
    @track industryOptions = [];
    @track accountPhone = '';
    @track accountWebsite = '';

    error;
    wiredAccountResult;

    //Get Account Object Info for Picklist value
    @wire(getObjectInfo, {objectApiName: 'Account'})
    accountObjectInfo;

    //Get Industry Picklist
    @wire(getPicklistValues, {
        recordTypeId: '$accountObjectInfo.data.defaultRecordTypeId',
        fieldApiName: INDUSTRY_FIELD
    })
    wiredIndustryPicklist({data, error}){
        if(data){

            //Map picklist value to options format
            this.industryOptions = data.values.map(item =>{
                return{
                    label: item.label,
                    value: item.value
                };
            });
        }
        else if(error){
            alert('Error Loading Industry Picklist', error);
        }
    }

    //Wire getRecord to fetch Account data using imported schema field
    @wire(getRecord, {
        recordId: '$recordId',
        fields: [NAME_FIELD, INDUSTRY_FIELD, PHONE_FIELD, WEBSITE_FIELD]
    })
    wiredAccount(result){

        this.wiredAccountResult = result;

        const {data, error} = result;
        if(data){
            console.log('Account Data Loaded: ', data);

            //Manually Bind Data to form fields using imported schema
            this.accountName = data.fields.Name.value;
            this.accountIndustry = data.fields.Industry.value;
            this.accountPhone = data.fields.Phone.value;
            this.accountWebsite = data.fields.Website.value;

            //Conditional logic: Show Phone if Industry = Technology
            this.showPhone = this.accountIndustry === 'Technology';

            this.error = undefined;
        }
        else if(error){
            this.error = 'Error Loading Account Data';

            this.showToast('Error', 'Failed to load Account Data', 'error');
        }
    }

    //Handle Name field Change
    handleNameChange(event){
        this.accountName = event.target.value;
    }

    //Handle Industry field Change
    handleIndustryChange(event){
        this.accountIndustry = event.target.value;

        //Show Phone if Industry is Technology
        this.showPhone = this.accountIndustry === 'Technology';
    }

    //Handle Phone field Change
    handlePhoneChange(event){
        this.accountPhone = event.target.value;
    }

    //Handle Website field Change
    handleWebsiteChange(event){
        this.accountWebsite = event.target.value;
    }

    //Handle Save Button
    handleSave(){

        //Validation
        if(!this.accountName || this.accountName.trim() === ''){
            this.showToast('Error', 'Account Name is Required', 'error');
            return;
        }

        this.isLoading = true;

        //Build record object using imported schema fields
        const fields = {};
        fields[ID_FIELD.fieldApiName] = this.recordId;
        fields[NAME_FIELD.fieldApiName] = this.accountName;
        fields[INDUSTRY_FIELD.fieldApiName] = this.accountIndustry;
        fields[PHONE_FIELD.fieldApiName] = this.accountPhone;
        fields[WEBSITE_FIELD.fieldApiName] = this.accountWebsite;

        const recordInput = {fields};

        //Use updateRecord from lightning/uiRecordApi
        updateRecord(recordInput)
        .then(()=>{
            this.isLoading = false;
            this.showToast('Success', 'Record Saved Successfully', 'success');

            //Refresh the wire services to get updated data
            //wiredAccountResult came from handleCancel button to refresh
            return refreshApex(this.wiredAccountResult);
        })
        .catch(error=>{
            this.isLoading = false;

            let errorMessage = 'Error Saving Record';
            if(error.body && error.body.message){
                errorMessage = error.body.message;
            }

            this.showToast('Error', errorMessage, 'error');
        });
    }

    //Handle Cancel Button
    handleCancel(){

        //Reload Original data from wire
        if(this.wiredAccountResult && this.wiredAccountResult.data){
            const data = this.wiredAccountResult.data;

            this.accountName = data.fields.Name.value;
            this.accountIndustry = data.fields.Industry.value;
            this.accountPhone = data.fields.Phone.value;
            this.accountWebsite = data.fields.Website.value;

            this.showPhone = this.accountIndustry === 'Technology';
        }

        this.showToast('Info', 'Changes Cancel', 'info');
    }

    //Show Toast Event
    showToast(title, message, variant){
        const event = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant,
            mode:'dismissable'
        });

        this.dispatchEvent(event);
    }
}