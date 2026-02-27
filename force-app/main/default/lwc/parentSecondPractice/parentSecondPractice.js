import { LightningElement, track } from 'lwc';

export default class ParentSecondPractice extends LightningElement {

    @track parentValue = '';

    handleValue(event){
        this.parentValue = event.detail;
    }
}