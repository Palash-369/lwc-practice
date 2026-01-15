public with sharing class BillingSystemController {
    public class ProductWrapper {
        @AuraEnabled public String productId {get; set;}
        @AuraEnabled public String productName {get; set;}
        @AuraEnabled public String productCode {get; set;}
        @AuraEnabled public Decimal unitPrice {get; set;}
        @AuraEnabled public Integer quantity {get; set;}
        @AuraEnabled public Boolean gstApplicable {get; set;}
        @AuraEnabled public Decimal gstAmount {get; set;}
        @AuraEnabled public Decimal totalAmount {get; set;}
        }

        public class BillingDataWrapper {
        @AuraEnabled public String customerName {get; set;}
        @AuraEnabled public String email {get; set;}
        @AuraEnabled public String phone {get; set;}
        @AuraEnabled public String priceBookId {get; set;}
        @AuraEnabled public Boolean withGST {get; set;}
        @AuraEnabled public List<ProductWrapper> products {get; set;}
        }

        @AuraEnabled(cacheable=true)
        public static Account checkDuplicateCustomer(String email, String phone) {
        try {
        // Validate inputs
        if (String.isBlank(email) && String.isBlank(phone)) {
        return null;
        }

        // Build dynamic query with security enforced
        List<Account> accounts = new List<Account>();

        if (String.isNotBlank(email) && String.isNotBlank(phone)) {
        accounts = [
        SELECT Id, Name, Email__c, Phone
        FROM Account
        WHERE (Email__c = :email OR Phone = :phone)
        WITH SECURITY_ENFORCED
        LIMIT 1
        ];
        }
        else if (String.isNotBlank(email)) {
        accounts = [
        SELECT Id, Name, Email__c, Phone
        FROM Account
        WHERE Email__c = :email
        WITH SECURITY_ENFORCED
        LIMIT 1
        ];
        }
        else if (String.isNotBlank(phone)) {
        accounts = [
        SELECT Id, Name, Phone
        FROM Account
        WHERE Phone = :phone
        WITH SECURITY_ENFORCED
        LIMIT 1
        ];
        }

        return accounts.isEmpty() ? null : accounts[0];

        } catch (Exception e) {
        throw new AuraHandledException('Error checking duplicate customer: ' + e.getMessage());
        }
        }

        /**
        * @description Get products based on search key and price book
        * @param searchKey Search term for product name or code
        * @param priceBookId Price book Id
        * @return List of ProductWrapper
        */
        @AuraEnabled(cacheable=true)
        public static List<ProductWrapper> getProducts(String searchKey, String priceBookId) {
        try {
        // Validate inputs
        if (String.isBlank(priceBookId)) {
        throw new AuraHandledException('Price Book is required');
        }

        List<ProductWrapper> productList = new List<ProductWrapper>();
        String searchPattern = String.isBlank(searchKey) ? '%' : '%' + searchKey + '%';

        // Query products with pricebook entries
        List<PricebookEntry> entries = [
        SELECT Id, Product2Id, Product2.Name, Product2.ProductCode,
        Product2.GST_Applicable__c, UnitPrice
        FROM PricebookEntry
        WHERE Pricebook2Id = :priceBookId
        AND IsActive = true
        AND (Product2.Name LIKE :searchPattern OR Product2.ProductCode LIKE :searchPattern)
        WITH SECURITY_ENFORCED
        ORDER BY Product2.Name
        LIMIT 50
        ];

        for (PricebookEntry entry : entries) {
        ProductWrapper wrapper = new ProductWrapper();
        wrapper.productId = entry.Product2Id;
        wrapper.productName = entry.Product2.Name;
        wrapper.productCode = entry.Product2.ProductCode;
        wrapper.unitPrice = entry.UnitPrice;
        wrapper.gstApplicable = entry.Product2.GST_Applicable__c;
        wrapper.quantity = 1;
        wrapper.gstAmount = 0;
        wrapper.totalAmount = entry.UnitPrice;
        productList.add(wrapper);
        }

        return productList;
        } catch (Exception e) {
        throw new AuraHandledException('Error fetching products: ' + e.getMessage());
        }
        }
        @AuraEnabled
        public static ProductWrapper getProductByCode(String productCode, String priceBookId) {
        try {
        // Validate inputs
        if (String.isBlank(productCode)) {
        throw new AuraHandledException('Product code is required');
        }
        if (String.isBlank(priceBookId)) {
        throw new AuraHandledException('Price Book is required');
        }

        // Query product with pricebook entry
        List<PricebookEntry> entries = [
        SELECT Id, Product2Id, Product2.Name, Product2.ProductCode,
        Product2.GST_Applicable__c, UnitPrice
        FROM PricebookEntry
        WHERE Pricebook2Id = :priceBookId
        AND Product2.ProductCode = :productCode
        AND IsActive = true
        WITH SECURITY_ENFORCED
        LIMIT 1
        ];

        if (entries.isEmpty()) {
        throw new AuraHandledException('Product not found with code: ' + productCode);
        }

        PricebookEntry entry = entries[0];
        ProductWrapper wrapper = new ProductWrapper();
        wrapper.productId = entry.Product2Id;
        wrapper.productName = entry.Product2.Name;
        wrapper.productCode = entry.Product2.ProductCode;
        wrapper.unitPrice = entry.UnitPrice;
        wrapper.gstApplicable = entry.Product2.GST_Applicable__c;
        wrapper.quantity = 1;
        wrapper.gstAmount = 0;
        wrapper.totalAmount = entry.UnitPrice;

        return wrapper;

        } catch (Exception e) {
        throw new AuraHandledException('Error fetching product by code: ' + e.getMessage());
        }
        }

        @AuraEnabled(cacheable=true)
        public static List<Pricebook2> getPriceBooks() {
        try {
        return [
        SELECT Id, Name, IsActive
        FROM Pricebook2
        WHERE IsActive = true
        AND (Name = 'Retail Price Book' OR Name = 'Wholesale Price Book' OR IsStandard = true)
        WITH SECURITY_ENFORCED
        ORDER BY Name
        ];
        } catch (Exception e) {
        throw new AuraHandledException('Error fetching price books: ' + e.getMessage());
        }
        }

        @AuraEnabled
        public static String saveBillingData(BillingDataWrapper billingData) {
        // Validate inputs
        if (billingData == null) {
        throw new AuraHandledException('Billing data is required');
        }
        if (String.isBlank(billingData.customerName)) {
        throw new AuraHandledException('Customer name is required');
        }
        if (String.isBlank(billingData.email)) {
        throw new AuraHandledException('Customer email is required');
        }
        if (String.isBlank(billingData.phone)) {
        throw new AuraHandledException('Customer phone is required');
        }
        if (String.isBlank(billingData.priceBookId)) {
        throw new AuraHandledException('Price book is required');
        }
        if (billingData.products == null || billingData.products.isEmpty()) {
        throw new AuraHandledException('At least one product is required');
        }

        Savepoint sp = Database.setSavepoint();

        try {
        // Step 1: Check for existing customer
        Account customerAccount = checkDuplicateCustomer(billingData.email, billingData.phone);

        // Step 2: Create Account if new customer
        if (customerAccount == null) {
        customerAccount = new Account(
        Name = billingData.customerName,
        Email__c = billingData.email,
        Phone = billingData.phone
        );
        insert customerAccount;
        }

        // Step 3: Create Opportunity
        Opportunity opp = new Opportunity(
        Name = billingData.customerName + ' - ' + System.now().format('yyyy-MM-dd HH:mm'),
        AccountId = customerAccount.Id,
        StageName = 'Prospecting',
        CloseDate = Date.today().addDays(30),
        Pricebook2Id = billingData.priceBookId,
        Description = 'GST Applied: ' + billingData.withGST
        );
        insert opp;

        // Step 4: Get PricebookEntry Ids for products
        Set<String> productIds = new Set<String>();
        Map<String, ProductWrapper> productMap = new Map<String, ProductWrapper>();

        for (ProductWrapper pw : billingData.products) {
        productIds.add(pw.productId);
        productMap.put(pw.productId, pw);
        }

        Map<String, Id> productToPricebookEntryMap = new Map<String, Id>();
        List<PricebookEntry> entries = [
        SELECT Id, Product2Id
        FROM PricebookEntry
        WHERE Pricebook2Id = :billingData.priceBookId
        AND Product2Id IN :productIds
        WITH SECURITY_ENFORCED
        ];

        for (PricebookEntry entry : entries) {
        productToPricebookEntryMap.put(entry.Product2Id, entry.Id);
        }

        // Step 5: Create Opportunity Line Items
        List<OpportunityLineItem> lineItems = new List<OpportunityLineItem>();

        for (ProductWrapper pw : billingData.products) {
        if (!productToPricebookEntryMap.containsKey(pw.productId)) {
        throw new AuraHandledException('Pricebook entry not found for product: ' + pw.productName);
        }

        Decimal lineTotal = pw.unitPrice * pw.quantity;
        Decimal gstAmount = 0;

        // Calculate GST if applicable
        if (billingData.withGST && pw.gstApplicable) {
        gstAmount = lineTotal * 0.18; // 18% GST
        lineTotal += gstAmount;
        }

        OpportunityLineItem lineItem = new OpportunityLineItem(
        OpportunityId = opp.Id,
        PricebookEntryId = productToPricebookEntryMap.get(pw.productId),
        Quantity = pw.quantity,
        TotalPrice = lineTotal, // <-- Only total price
        Description = 'GST Amount: ' + gstAmount.setScale(2)
        );


        lineItems.add(lineItem);
        }
        if (!lineItems.isEmpty()) {
        insert lineItems;
        }

        return opp.Id;

        } catch (Exception e) {
        Database.rollback(sp);
        throw new AuraHandledException('Error saving billing data: ' + e.getMessage());
        }
        }
        }
