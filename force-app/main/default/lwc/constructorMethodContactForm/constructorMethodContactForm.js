import { LightningElement, track } from 'lwc';

export default class ConstructorMethodContactForm extends LightningElement {
    @track contact;
    countryOptions = [];

    constructor(){
        super();

        //Initialize Object with default
        this.contact = {
            firstName:'Not Provided',
            lastName:'Not Provide',
            email:'example@gmail.com',
            country:this.countryOptions
        };

        this.allowedCountries = ['India', 'USA', 'UK', 'Canada'];

        this.countryOptions = this.allowedCountries.map(c=> ({label:c, value:c}));
    }

    //Define handleChange Method outside the constructor
    handleChange(event){
        this.contact.country = event.detail.value;
    }
}