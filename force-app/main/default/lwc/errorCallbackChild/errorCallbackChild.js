import { LightningElement, track } from 'lwc';

export default class ErrorCallbackChild extends LightningElement {

    @track result = 0;

    causeError(){
        //Give intentional runtime Error
        let x = 10;
        let y = 0;

        this.result = x/y;

        throw new Error('Division by Zero Error in Child Component!');
    }
}