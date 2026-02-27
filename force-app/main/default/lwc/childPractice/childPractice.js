import { LightningElement, api } from 'lwc';

export default class ChildPractice extends LightningElement {

    //Data Comes from Parent
    @api message;
}