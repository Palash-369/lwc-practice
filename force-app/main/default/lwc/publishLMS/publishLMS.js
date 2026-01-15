import { LightningElement, wire } from 'lwc';
import{publish, MessageContext} from 'lightning/messageService';
import recordSelected from '@salesforce/messageChannel/SampleChannel__c';
export default class PublishLMS extends LightningElement {

    @wire(MessageContext)
    messageContext;

    publishMessage(){
        const payload = {
            messageText:'Hello from publisher'
        };
        publish(this.messageContext, recordSelected, payload);
    }
}