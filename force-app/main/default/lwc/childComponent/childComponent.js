import { LightningElement } from 'lwc';

export default class ChildComponent extends LightningElement {

    handleSubstract(){
        this.dispatchEvent(new CustomEvent('substract'));
    }

    handleAdd(){
        this.dispatchEvent(new CustomEvent('add'));
    }
}