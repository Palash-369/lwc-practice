public class wireDemoClass {
    
    @AuraEnabled(cacheable=true)
    
    public static List<Account>getAccountList(){
        return [SELECT Id, Name, Rating FROM Account WHERE Rating='Hot'];
    }

}