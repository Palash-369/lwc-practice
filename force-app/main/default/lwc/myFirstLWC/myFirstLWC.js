import { LightningElement } from 'lwc';

export default class MyFirstLWC extends LightningElement {

    myTitle = "Salesforce Function";

    handleclick(){
        let callMyFunction = this.myFunction(10, 2);
            window.alert("Arrow Function: "+callMyFunction);
    }

    //Arrow function
    myFunction = (dividend, divisor) => {
        return dividend/divisor;
}

}