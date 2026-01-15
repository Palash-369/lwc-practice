@isTest
public class OpportunityTriggerHandlerTest {
    @testSetup
    static void setupData() {
        // Create Account
        Account acc = new Account(Name = 'Test Account');
        insert acc;

        // Create initial Opportunities
        List<Opportunity> opps = new List<Opportunity>{
            new Opportunity(Name = 'Opp1', StageName = 'Prospecting', CloseDate = Date.today().addDays(10), Amount = 1000, AccountId = acc.Id),
            new Opportunity(Name = 'Opp2', StageName = 'Prospecting', CloseDate = Date.today().addDays(20), Amount = 2000, AccountId = acc.Id)
        };
        insert opps;
    }

    @isTest
    static void testInsert() {
        Account acc = [SELECT Id, Total_Opportunity_Amount__c FROM Account WHERE Name = 'Test Account' LIMIT 1];

        Test.startTest();
        Opportunity opp3 = new Opportunity(Name = 'Opp3', StageName = 'Prospecting', CloseDate = Date.today().addDays(15), Amount = 3000, AccountId = acc.Id);
        insert opp3;
        Test.stopTest();

        acc = [SELECT Id, Total_Opportunity_Amount__c FROM Account WHERE Id = :acc.Id];
        System.assertEquals(6000, acc.Total_Opportunity_Amount__c, 'After insert Opp3, total should be 6000');
    }

    @isTest
    static void testUpdate() {
        Opportunity opp = [SELECT Id, Amount, AccountId FROM Opportunity WHERE Name = 'Opp1' LIMIT 1];
        
        Test.startTest();
        opp.Amount = 4000;
        update opp;
        Test.stopTest();

        Account acc = [SELECT Id, Total_Opportunity_Amount__c FROM Account WHERE Id = :opp.AccountId];
        System.assertEquals(6000, acc.Total_Opportunity_Amount__c, 'After update Opp1, total should be 6000');
    }

    @isTest
    static void testDelete() {
        Opportunity opp = [SELECT Id, AccountId FROM Opportunity WHERE Name = 'Opp2' LIMIT 1];

        Test.startTest();
        delete opp;
        Test.stopTest();

        Account acc = [SELECT Id, Total_Opportunity_Amount__c FROM Account WHERE Id = :opp.AccountId];
        System.assertEquals(1000, acc.Total_Opportunity_Amount__c, 'After delete Opp2, total should be 1000');
    }

    @isTest
    static void testUndelete() {
        Opportunity oppDelete = [SELECT Id, AccountId FROM Opportunity WHERE Name = 'Opp2' LIMIT 1];
       
        delete oppDelete;
        
        Opportunity oppUndelete = [SELECT Id, AccountId FROM Opportunity WHERE Id =:oppDelete.Id ALL ROWS]; // includes deleted
        
        Test.startTest();
        undelete oppUndelete;
        Test.stopTest();

        Account acc = [SELECT Id, Total_Opportunity_Amount__c FROM Account WHERE Id = :oppUndelete.AccountId];
        System.assertEquals(3000, acc.Total_Opportunity_Amount__c, 'After undelete Opp2, total should be 3000');
    }
}