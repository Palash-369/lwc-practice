import { LightningElement, wire, track } from 'lwc';
import getAccountByIndustry from '@salesforce/apex/AccountController.getAccountByIndustry';
export default class AccountDemo extends LightningElement {

    @track accountWire;
    @track accountImperative;
    @track error;

    //Using @wire to auto fetch Industry = Technology

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

    //Using Imperative method to fetch Industry = Finance

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