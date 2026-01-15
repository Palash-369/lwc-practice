import { LightningElement, api } from 'lwc';
import LightningAlert from 'lightning/alert';
export default class LwcChild extends LightningElement {

    @api async sayHi(){
        await LightningAlert.open({
            message: "Hi, Salesforce Noob",
            theme: "Success",
            label:"Greetings"
        });
    }
}