import { LightningElement, track } from 'lwc';

export default class RenderCallbackTodoList extends LightningElement {

@track tasks = [];
newTask='';

lastRenderedIndex = null;

handleChange(event){
    this.newTask = event.target.value;
}

addTask(){
    if(this.newTask){
        this.tasks = [...this.tasks, this.newTask];

        this.lastRenderedIndex = this.tasks.length-1;

        this.newTask = '';
    }
}

renderedCallback(){
    if(this.lastRenderedIndex !== null){
        const lastTaskElement = this.template.querySelector(`li[data-index = "${this.lastRenderedIndex}"]`);

        if(lastTaskElement){
            lastTaskElement.style.background = 'yellow';
            lastTaskElement.style.fontWeight = 'bold';
            console.log(`Highlighted task:$(lastTaskElement.textContent)`);
        }

        //Reset so it wont Re-Apply on every render
        this.lastRenderedIndex = null;
            }
    }
}