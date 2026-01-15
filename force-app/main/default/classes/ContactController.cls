public with sharing class ContactController {

    @AuraEnabled(cacheable=true)
    public static List<Contact> getContact(){
        return[SELECT Id, FirstName, LastName, Email, Account.Name FROM Contact LIMIT 5];
    }
}