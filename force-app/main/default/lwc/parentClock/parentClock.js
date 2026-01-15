import { LightningElement, track } from 'lwc';

export default class ParentClock extends LightningElement {

    @track isClockVisible = false;

    showClock(){
        this.isClockVisible = true;
    }

    hideClock(){
        this.isClockVisible = false;
    }
}