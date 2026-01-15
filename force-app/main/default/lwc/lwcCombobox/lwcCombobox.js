import { LightningElement, track } from 'lwc';
import getAccountList from '@salesforce/apex/ComboboxDemo.getAccountList';
import getContacts from '@salesforce/apex/ComboboxDemo.getContacts';

const COLUMNS = [{label: 'Contacts', fieldName:'Name'},
    {label:'Email', fieldName:'Email'}
];

export default class LwcCombobox extends LightningElement {

    //ComboBox properties
    @track myValue = '';
    @track accOption = [];

    //DataTable properties
    @track myData = [];
    @track isCardVisible = false;
    @track myColumns = COLUMNS;

    //Combobox Backend

    connectedCallback() {
        getAccountList()
            .then(result => {
                let arr = [];
                for (let i = 0; i < result.length; i++) {
                    arr.push({
                        label: result[i].Name,  // shown in dropdown
                        value: result[i].Id     // returned when selected
                    });
                }
                this.accOption = arr;
            })
            .catch(error => {
                console.error('Error fetching Accounts:', error);
            });
    }

    get myOption() {
        return this.accOption;
    }

    handleChange(event) {
        this.myValue = event.target.value;

        //DataTable Visible after Click

        this.isCardVisible = true;

        getContacts({selectedAccountId: this.myValue})
        .then(result => {
            this.myData = result;
        })
        .catch(error =>{
            windows.alert("Error: "+error);
        });
    }
}