import { LightningElement, track } from 'lwc';

export default class ChildClock extends LightningElement {

    @track time;

    intervalId;

    connectedCallback(){
        this.time = new Date().toLocaleTimeString();

        this.intervalId = setInterval(()=>{
            this.time = new Date().toLocaleTimeString();
        }, 1000);
    }

    disconnectedCallback(){
        clearInterval(this.intervalId);

        console.log('Child Clock removed from DOM, timer cleared');
        alert('Child Clock removed from DOM');
    }

}