trigger OpportunityTrigger on Opportunity (after insert, after update, after delete, after undelete) {

    if(Trigger.isAfter){
        if(Trigger.isInsert){
            OpportunityTriggerHandler.updateAccountTotal(Trigger.New, null, false);
        }
        if(Trigger.isUpdate){
            OpportunityTriggerHandler.updateAccountTotal(Trigger.New, Trigger.oldMap, false);
            
            //Handle separate method for StageName Change
            OpportunityTriggerHandler.handleStageChange(Trigger.New, Trigger.oldMap);
        }
        if(Trigger.isDelete){
            OpportunityTriggerHandler.updateAccountTotal(null, Trigger.oldMap, true);
        }
        if(Trigger.isUndelete){
            OpportunityTriggerHandler.updateAccountTotal(Trigger.New, null, false);
        }
    }
}