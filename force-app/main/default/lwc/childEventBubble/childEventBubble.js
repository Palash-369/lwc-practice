import { LightningElement } from 'lwc';

export default class ChildEventBubble extends LightningElement {


    myValues = '';

    handleChildMessage(event){

        this.myValues = event.target.value;

        this.dispatchEvent(new CustomEvent('sendtograndparent', {
                                            detail: this.myValues,
                                            bubbles: true,
                                            composed: true
                        })
                    );
    }
}