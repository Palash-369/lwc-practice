import { LightningElement, track, wire } from 'lwc';
import getContact from '@salesforce/apex/ContactController.getContact';
import CONTACT_OBJECT from '@salesforce/schema/Contact';
import{subscribe, MessageContext} from 'lightning/messageService';
import SAMPLE_CHANNEL from '@salesforce/messageChannel/SampleChannel__c';
import {getObjectInfo} from 'lightning/uiObjectInfoApi';
export default class ContactDashboard extends LightningElement {

    @track contacts;
    @track error;
    defaultCountry;
    subscription;

    //Required for LMS Subscription
    @wire(MessageContext)
    messageContext;

    //fetch metadata with UI API(defaultCountry)
   @wire(getObjectInfo,{objectApiName:CONTACT_OBJECT})
   objectInfoHandler({data,error}){
    if(data){
        this.defaultCountry = data.defaultRecordTypeId;
        console.log('Default RecordTypeId: ', this.defaultCountry);
    }
    else if(error){
        console.error('UI API Error: ',error);
    }
   }


    connectedCallback(){
        console.log('Component inserted into DOM');

        //fetch Contacts using Apex
        getContact()
        .then(result=>{
            this.contacts = result;
        })
        .catch(error=>{
            this.error = error?.body?.message || 'Unknown Error';
        });

        //Register pub-sub/messageChannel
        this.subscription = subscribe(
            this.messageContext,
            SAMPLE_CHANNEL,
            (message)=>{
                console.log('Message received via Channel: ',message);

                alert('Message From Channel: '+JSON.stringify(message));
            });

            console.log('Contact Dashboard connectedCallback executed');
    }
}