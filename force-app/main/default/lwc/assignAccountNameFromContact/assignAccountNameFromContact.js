import { LightningElement, track, api } from 'lwc';
import getContacts from '@salesforce/apex/AssignAccountFromContact.getContacts';
import assignAccounts from '@salesforce/apex/AssignAccountFromContact.assignAccounts';
import {NavigationMixin} from 'lightning/navigation';
import {ShowToastEvent} from 'lightning/platformShowToastEvent';

const ACTIONS = [
    {label:'Assign', name:'assign'},
    {label:'View', name:'view'}
];

const COLUMNS = [
            {label:'Contacts', fieldName:'LastName'},
            {label:'Ids', fieldName:'Id'},
            {type:'action', typeAttributes:{rowActions:ACTIONS}}
];

export default class AssignAccountNameFromContact extends NavigationMixin(LightningElement) {

myColumns = COLUMNS;

@track showContacts = 'Show Contacts';
@track myData = [];
@track isVisible = false;
@track contactData = []; //This will handle Extra behaviour in the javaScript
@api recordId;
error;

connectedCallback(){
    getContacts({selectedId:this.recordId})
    .then(result => {
        this.myData = result;
    })
    .catch(error => {
        this.error = error;
    });
}

handleClick(event){
    const label = event.target.label;

    if(label == 'Show Contacts'){
        this.showContacts = 'Hide Contacts';
        this.isVisible = true;
    }
    else if(label == 'Hide Contacts'){
        this.showContacts = 'Show Contacts';
        this.isVisible = false;
    }
}

handleRowAction(event){
    const actionName = event.detail.action.name;
    const row = event.detail.row;

    switch(actionName){
        case 'assign': this.assignContact(row);
            break;

        case 'view': this.navigateToConRecPage(row);
            break;

        default:
    }
}

    assignContact(currentRow){
        const selectedRow = currentRow;

        //Sending selected rowId to apex method 'assignAccounts' in lwcRowId

        assignAccounts({
            lwcRowId:selectedRow.Id,
            accountId: this.recordId
        })
        .then(result => {
            this.myData = result;
            this.showToast('Success', 'Contact Assign Successfully', 'success');
        })
        .catch(error =>{
            this.error = error;
            console.log('Error Assigning Contact: ',error);
            this.showToast('Error', 'Failed To Assign Contact', 'error');
        });
    }

navigateToConRecPage(rowData){
    const contact = rowData;

    this[NavigationMixin.Navigate]({
        type:'standard__recordPage',
        attributes:{
            recordId:contact.Id,
            objectApiName: 'Contact',
            actionName:'view'
        }
    })
    .catch(error => {
        console.log('Error Navigating Contact: ',error);
        this.showToast('Error', 'Unable to Navigate to Contact', 'error');
    })
}

showToast(title, message, variant){
    const evt = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant,
            mode: 'dismissable'
    });
    this.dispatchEvent(evt);
}
}