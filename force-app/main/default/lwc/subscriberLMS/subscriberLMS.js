import { LightningElement, wire } from 'lwc';
import {subscribe,
        unsubscribe,
        APPLICATION_SCOPE,
        MessageContext} from 'lightning/messageService';
import recordSelected from '@salesforce/messageChannel/SampleChannel__c';

export default class SubscriberLMS extends LightningElement {
    subscription = null;
    pubMessage ="";

    @wire(MessageContext)
    messageContext;

    connectedCallback(){
        this.subscribeToMessageChannel();
    }

        subscribeToMessageChannel(){
            if(!this.subscription){
                this.subscription = subscribe(this.messageContext, recordSelected,
                                        (message)=> this.handleMessage(message),
                                        {scope:APPLICATION_SCOPE});
            }
        }

        //Handler for message received by component
        handleMessage(message){
            this.pubMessage = message.messageText;
        }

        unsubscribeToMessageChannel(){
            unsubscribe(this.subscription);
            this.subscription = null;
        }

        disconnectedCallback(){
            this.unsubscribeToMessageChannel();
        }

}