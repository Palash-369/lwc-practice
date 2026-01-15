public class OpportunityTriggerHandler {

    //Write a Trigger (with Handler) where Account records should have a field named 'Total_Opportunity_Amount__c'. 
    //It should contain the sum of all opportunity amounts on the account.
    //When an Opportunity is inserted, updated, deleted, or undeleted, the Account total should reflect the correct value.”

    public static void updateAccountTotal(List<Opportunity>newOppList, Map<Id, Opportunity>oldOppMap, Boolean isDelete){
        
        try{
            Set<Id> accIds = new Set<Id>();
            
            if(isDelete){
                for(Opportunity opp : oldOppMap.values()){
                    if(opp.AccountId != null){
                        accIds.add(opp.AccountId);
                    }
                }
            }
            else{
                for(Opportunity opp : newOppList){
                    if(opp.AccountId != null){
                        accIds.add(opp.AccountId);
                    }
                    
                    if(oldOppMap != null && oldOppMap.containsKey(opp.Id)){
                        Opportunity oldOpp = oldOppMap.get(opp.Id);
                        if(oldOpp.AccountId != null){
                            accIds.add(oldOpp.AccountId);
                        }
                    }
                }
            }
            
            if(accIds.isEmpty()){
                    return;
                }
            
            //Query all related Opportunities Amount Group by Account
            
            Map<Id, Decimal> accIdsToTotalAmount = new Map<Id, Decimal>();
            
            for(AggregateResult ar : [SELECT AccountId accntId, SUM(Amount) totalAmount FROM Opportunity 
                                      WHERE AccountId IN:accIds GROUP BY AccountId]){
                accIdsToTotalAmount.put((Id)ar.get('accntId'), (Decimal)ar.get('totalAmount'));
            }
            
            //Prepare to update Account
            
            List<Account> accountToUpdate = new List<Account>();
            for(Id accId : accIds){
                Decimal total = accIdsToTotalAmount.containsKey(accId)?accIdsToTotalAmount.get(accId):0;
                
                accountToUpdate.add(new Account(Id = accId, Total_Opportunity_Amount__c = total));
            }
            
            if(!accountToUpdate.isEmpty()){
                update accountToUpdate;
            }
        }
        
        catch(Exception e){
            System.debug('Error While Updating Total Opportunity Amount: '+e.getMessage());
        }
    }
    
    
    //When an Opportunity Stage(field) is changed, create a Task record on Opportunity and assign it to Logged in User/Opportunity
    //Owner/Any User
    
    public static void handleStageChange(List<Opportunity>newOppStageList, Map<Id, Opportunity>oldOppStageMap){
        
        if(oldOppStageMap == null){
            return;
        }
                
        List<Task> taskList = new List<Task>();
        
        for(Opportunity opp : newOppStageList){
            
            if(oldOppStageMap != null && oldOppStageMap.containsKey(opp.Id)){
                
                Opportunity oldOppStage = oldOppStageMap.get(opp.Id);
            
            if(opp.StageName != oldOppStage.StageName){
                Task t = new Task();
                t.WhatId = opp.Id;
                t.Subject = 'Email';
                t.Priority = 'Normal';
                t.Status = 'Not Started';
                t.OwnerId = UserInfo.getUserId();
                
                taskList.add(t);
            	}
            }
            
        }
        
        if(!taskList.isEmpty()){
            insert taskList;
        }
    }
}