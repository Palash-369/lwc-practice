import { LightningElement , track} from 'lwc';

export default class IFConditionalDemo extends LightningElement {


    @track myTitle = 'Salesforce If Condition';
    @track onClickButtonLabel = 'Show';
    @track cardVisible = false;

    handleClick(){
        const label = event.target.label;

        if(label === 'Show'){
            this.onClickButtonLabel = 'Hide';
            this.cardVisible = true;
        }
        else if(label === 'Hide'){
            this.onClickButtonLabel = 'Show';
            this.cardVisible = false;
        }
    }

}