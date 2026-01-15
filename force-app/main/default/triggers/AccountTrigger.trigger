trigger AccountTrigger on Account (before insert, before update, after insert, after update) {

    if(Trigger.isAfter && Trigger.isInsert){
        AccountTriggerHandler.afterInsert(Trigger.New);
    }
    
    if(Trigger.isAfter && Trigger.isUpdate){
        AccountTriggerHandler.afterUpdate(Trigger.New, Trigger.oldMap);
    }
    
    if(Trigger.isBefore && Trigger.isInsert){
        AccountTriggerHandler.beforeInsert(Trigger.New);
    }
    
    if(Trigger.isBefore && Trigger.isUpdate){
        AccountTriggerHandler.beforeUpdate(Trigger.New, Trigger.oldMap);
    }
}