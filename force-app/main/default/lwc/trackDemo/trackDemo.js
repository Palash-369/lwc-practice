import { LightningElement, track } from 'lwc';

export default class TrackDemo extends LightningElement {

@track fullName = {firstName:"", lastName:""};

    handleChange(event){
        const field = event.target.name;

        if(field === 'firstname'){
            this.fullName.firstName = event.target.value;
        }

        else if(field === 'lastname'){
            this.fullName.lastName = event.target.value;
        }
    }
}