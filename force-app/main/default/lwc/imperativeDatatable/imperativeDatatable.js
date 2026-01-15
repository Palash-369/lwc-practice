import { LightningElement, track } from 'lwc';
import getAccounts from '@salesforce/apex/imperativeDatatable.getAccounts';

const COLUMNS = [
    {label:'Account Record Id', fieldName:'Id'},
    {label:'Account Name', fieldName:'Name'}
];
export default class ImperativeDatatable extends LightningElement {

    @track myColumns = COLUMNS;
    @track myData = [];
    @track fetchAccountImperative = false;

    handleClick(){
        getAccounts()
        .then(result =>{
            this.fetchAccountImperative = true;
            this.myData = result;
            this.error = undefined;
        })
        .catch(error =>{
            this.fetchAccountImperative = false;
            this.error = error;
            this.myData = undefined;
        })
    }
}