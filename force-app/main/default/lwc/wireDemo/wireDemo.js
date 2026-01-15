import { LightningElement, wire, track } from 'lwc';
import getAccountList from '@salesforce/apex/wireDemoClass.getAccountList';

const COLUMNS = [
                {label:'Name', fieldName:'Name'},
                {label:'AccountRecord Id', fieldName:'Id'},
                {label:'Rating', fieldName:'Rating'}
];
export default class WireDemo extends LightningElement {

    @track myColumns = COLUMNS;
    @track myData = [];

    @wire(getAccountList)
    wiredAccount({data, error}){
        if(data){
            this.myData = data;
        }
        else if(error){
            this.error = error;
        }
    }
}