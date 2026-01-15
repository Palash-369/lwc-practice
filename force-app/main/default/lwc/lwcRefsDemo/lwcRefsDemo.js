import { LightningElement } from 'lwc';

export default class LwcRefsDemo extends LightningElement {

    handleClickLwc(){
        let childLwc = this.refs.myChildLwc;
        childLwc.sayHi();
    }

    handleClick(){
        let para = this.refs.myText;
        para.className = 'red_text';
    }
}