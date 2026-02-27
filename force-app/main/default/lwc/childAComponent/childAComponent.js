import { LightningElement } from 'lwc';

export default class ChildAComponent extends LightningElement {

    myChildValue = '';


    handleChildAValue(event){
        this.myChildValue = event.target.value;

        //fire Custom Event to Parent
        this.dispatchEvent(new CustomEvent('valuefromchild', {detail: this.myChildValue}));
    }
}