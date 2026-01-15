public class imperativeDemo {

    @AuraEnabled(cacheable=true)
    
    public static List<Account>getAccountByIndustry(String industry){
        return [SELECT Id, Name, Industry FROM Account WHERE Industry =:industry LIMIT 5];
    }
}