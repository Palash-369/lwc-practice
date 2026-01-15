import { LightningElement, track, wire } from 'lwc';
import getAccountByIndustry from '@salesforce/apex/imperativeDemo.getAccountByIndustry';

export default class ImperativeDemo extends LightningElement {

    @track accountWire;
    @track accountImperative;
    @track error;

    //Using @wire to fetch when component load
    //'industry' is a String from Apex class

    @wire(getAccountByIndustry, {industry:'Technology'})
    wiredAccounts({data, error}){
        if(data){
            this.accountWire = data;
            this.error = undefined;
        }
        else if(error){
            this.error = error;
            this.accountWire = undefined;
        }
    }

    //Using Imperative fetch on button click
    //'industry' is a String from Apex class

    handleFinance(){
        getAccountByIndustry({industry:'Finance'})
        .then(result =>{
            this.accountImperative = result;
            this.error = undefined;
        })
        .catch(error =>{
            this.error = error;
            this.accountImperative = undefined;
        });
    }

}