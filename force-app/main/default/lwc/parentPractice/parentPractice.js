import { LightningElement, track } from 'lwc';

export default class ParentPractice extends LightningElement {

    @track myValue = '';

    handleChange(event){
        this.myValue = event.target.value;
    }
}