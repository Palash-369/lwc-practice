public class ErrorLoggerService {

    @AuraEnabled
    
    public static void logError(String errorMessage, String stackTrace, String componentName){
        Error_Log__c log = new Error_Log__c(
        Error_Message__c = errorMessage,
        Stack_Trace__c = stackTrace,
        Component_Name__c = componentName);
        
        insert log;
    }
}