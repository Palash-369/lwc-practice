import { LightningElement, track } from 'lwc';
import { updateRecord } from 'lightning/uiRecordApi';
import NAME_FIELD from '@salesforce/schema/Account.Name';
export default class UiRecordApiUpdateAccount extends LightningElement {

    @track recordId;
    @track newName;
    @track successMessage;

    handleIdChange(event){
        this.recordId = event.target.value;
    }

    handleNameChange(event){
        this.newName = event.target.value;
    }

    updateAccount(){
        //make one constant field container where it will store Acount fields value
        const fields = {};

        fields.Id = this.recordId;
        fields[NAME_FIELD.fieldApiName] = this.newName;

        //make one 'Input' container to store Account field value it field is more than one
        const recordInput = {fields};

        //For updating put the stored 'Input' container in uiRecordApi parenthesis
        updateRecord(recordInput)
        .then(()=>{
            this.successMessage = 'Account Updated Successfully';
        })
        .catch(error=>{
            window.alert('Error Updating Account: '+ JSON.stringify(error));
        })
    }
}