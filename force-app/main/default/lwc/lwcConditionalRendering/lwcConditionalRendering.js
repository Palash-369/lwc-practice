import { LightningElement } from 'lwc';

export default class LwcConditionalRendering extends LightningElement {

    buttonLabel = 'Button 3';
    property1 = false;
    property2 = false;

    handleClick(){
        if(this.property1 === false && this.property2 === false){

            // From Statement 3 → Statement 1

            this.property1 = true;
            this.property2 = false;
            this.buttonLabel = 'Button 1';
        }
        else if(this.property1 === true){

            // From Statement 1 → Statement 2

            this.property1 = false;
            this.property2 = true;
            this.buttonLabel = 'Button 2';
        }
        else if(this.property2 === true){

            // From Statement 2 → Statement 3

            this.property2 = false;
            this.property1 = false;
            this.buttonLabel = 'Button 3';
        }
    }
}