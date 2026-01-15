public class AccountTriggerHandler {

    //Create a related Contact When an Account is Created
    
    public static void afterInsert(List<Account>newAccList){
        
        List<Contact> contactToInsert = new List<Contact>();
        
        for(Account acc : newAccList){
            String lastName = String.isNotBlank(acc.Name)?acc.Name:'Default LastName';
            
            Contact con = new Contact(
            LastName = lastName,
            Email = acc.Email__c,
            Phone = acc.Phone,
            AccountId = acc.Id);
            
            contactToInsert.add(con);
        }
        
        if(!contactToInsert.isEmpty()){
            try{
                insert contactToInsert;
            }
            catch(Exception e){
                System.debug('Error While Inserting Contact: '+e.getMessage());
            }
        }
    }
    
    public static void beforeInsert(List<Account>newAccList){
        //If Created or Updated, if Industry != Null and Having value as 'Media' then Populate Rating='Hot'
        for(Account acc: newAccList){
            if(acc.Industry == 'Media'){
                acc.Rating = 'Hot';
            }
        }
    }
    
    public static void beforeUpdate(List<Account>newAccList, Map<Id, Account>oldAccMap){
        //If Created or Updated, if Industry != Null and Having value as 'Media' then Populate Rating='Hot'
        
        for(Account acc : newAccList){
            Account oldAcc = oldAccMap.get(acc.Id);
            
            if(oldAcc.Industry != acc.Industry && acc.Industry == 'Media'){
                acc.Rating = 'Hot';
            }
        }
    }
    
    
    //If the Account Phone is Updated then populate the phone number on all related Contacts(Home Phone field).
    
    public static void afterUpdate(List<Account>newAccPhoneList, Map<Id, Account>oldAccPhoneMap){
         
       	Map<Id, String> accToPhoneMap = new Map<Id, String>();
        
        for(Account acc : newAccPhoneList){
            Account oldAccPhone = oldAccPhoneMap.get(acc.Id);
            
            if(acc.Phone != oldAccPhone.Phone && String.isNotBlank(acc.Phone)){
                accToPhoneMap.put(acc.Id,acc.Phone);
            }
            
        }
        
        if(accToPhoneMap.isEmpty()){
            return;
        }
        
        List<Contact> relatedContactToUpdate = new List<Contact>();
        
        
        for(Contact con : [SELECT Id, HomePhone, AccountId FROM Contact WHERE AccountId IN:accToPhoneMap.keySet()]){
            con.HomePhone = accToPhoneMap.get(con.AccountId);
            
            relatedContactToUpdate.add(con);
        }
            
        
        if(!relatedContactToUpdate.isEmpty()){
            update relatedContactToUpdate;
        }
    }
}