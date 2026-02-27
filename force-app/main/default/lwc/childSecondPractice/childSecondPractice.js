import { LightningElement } from 'lwc';

export default class ChildSecondPractice extends LightningElement {

    myChildValue = '';

    handleChange(event){
        this.myChildValue = event.target.value;

        //Fire Custom Event to Parent
        this.dispatchEvent(new CustomEvent('valuechange', {detail: this.myChildValue}));
    }
}