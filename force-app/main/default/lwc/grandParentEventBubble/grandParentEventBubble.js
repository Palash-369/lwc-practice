import { LightningElement } from 'lwc';

export default class GrandParentEventBubble extends LightningElement {

    receivedTextFromChild = '';

    handleTextFromChild(event){
        this.receivedTextFromChild = event.detail;
    }
}