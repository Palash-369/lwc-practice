import { LightningElement } from 'lwc';

export default class ParentListener extends LightningElement {

    showChildAResult = '';

    handleChildValue(event){
        this.showChildAResult = event.detail;
    }
}