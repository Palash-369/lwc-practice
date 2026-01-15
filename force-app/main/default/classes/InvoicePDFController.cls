/**
 * @description Controller extension for BillingInvoicePDF Visualforce page
 * @author Salesforce Developer
 * @date 2025
 */
public with sharing class InvoicePDFController {

    private Opportunity opportunity;
    private List<OpportunityLineItem> lineItems;
    private Decimal subtotal;
    private Decimal gstTotal;
    private Decimal grandTotal;
    private Boolean hasGST;

    // Wrapper List
    private List<LineItemWrapper> wrappedItems;

    /**
     * @description Constructor
     */
    public InvoicePDFController(ApexPages.StandardController controller) {
        this.opportunity = (Opportunity) controller.getRecord();
        loadInvoiceData();
    }

    /**
     * @description Wrapper class for line item + GST
     */
    public class LineItemWrapper {
        public OpportunityLineItem oli { get; set; }
        public Decimal gstAmount { get; set; }

        public LineItemWrapper(OpportunityLineItem item, Decimal gst) {
            this.oli = item;
            this.gstAmount = gst;
        }
    }

    /**
     * @description Load all invoice data
     */
    private void loadInvoiceData() {
        this.opportunity = [
            SELECT Id, Name, Invoice_Number__c, CreatedDate, CloseDate,
                StageName, Amount, Description,
                Account.Name, Account.Email__c, Account.Phone, Account.BillingStreet,
                Account.BillingCity, Account.BillingState, Account.BillingPostalCode,
                Account.BillingCountry
            FROM Opportunity
            WHERE Id = :this.opportunity.Id
            WITH SECURITY_ENFORCED
            LIMIT 1
        ];

        this.lineItems = [
            SELECT Id, Product2.Name, Product2.ProductCode,
                Quantity, UnitPrice, TotalPrice, Description
            FROM OpportunityLineItem
            WHERE OpportunityId = :this.opportunity.Id
            WITH SECURITY_ENFORCED
            ORDER BY Product2.Name
        ];

        calculateTotals();
    }

    /**
     * @description Calculate totals and build wrapper list
     */
    private void calculateTotals() {
        subtotal = 0;
        gstTotal = 0;
        hasGST = false;
        wrappedItems = new List<LineItemWrapper>();

        for (OpportunityLineItem item : lineItems) {
            Decimal lineSubtotal = item.UnitPrice * item.Quantity;
            subtotal += lineSubtotal;

            Decimal gst = 0;
            if (String.isNotBlank(item.Description) && item.Description.contains('GST Amount:')) {
                try {
                    gst = Decimal.valueOf(item.Description.substringAfter('GST Amount:').trim());
                } catch (Exception e) {
                    System.debug('GST Parse Error: ' + e.getMessage());
                }
            }

            gstTotal += gst;
            if (gst > 0) hasGST = true;

            wrappedItems.add(new LineItemWrapper(item, gst));
        }

        grandTotal = subtotal + gstTotal;
    }

    // Getters
    public Opportunity getOpportunity() { return opportunity; }
    public List<LineItemWrapper> getWrappedItems() { return wrappedItems; }
    public Decimal getSubtotal() { return subtotal; }
    public Decimal getGstTotal() { return gstTotal; }
    public Decimal getGrandTotal() { return grandTotal; }
    public Boolean getHasGST() { return hasGST; }

    public String getFormattedInvoiceDate() {
        return this.opportunity.CreatedDate.format('dd/MM/yyyy');
    }

    public String getFormattedSubtotal() { return formatCurrency(subtotal); }
    public String getFormattedGstTotal() { return formatCurrency(gstTotal); }
    public String getFormattedGrandTotal() { return formatCurrency(grandTotal); }

    public String getCustomerAddress() {
        List<String> parts = new List<String>();

        if (!String.isBlank(opportunity.Account.BillingStreet))
            parts.add(opportunity.Account.BillingStreet);
        if (!String.isBlank(opportunity.Account.BillingCity))
            parts.add(opportunity.Account.BillingCity);
        if (!String.isBlank(opportunity.Account.BillingState))
            parts.add(opportunity.Account.BillingState);
        if (!String.isBlank(opportunity.Account.BillingPostalCode))
            parts.add(opportunity.Account.BillingPostalCode);
        if (!String.isBlank(opportunity.Account.BillingCountry))
            parts.add(opportunity.Account.BillingCountry);

        return parts.isEmpty() ? 'N/A' : String.join(parts, ', ');
    }

    /**
     * @description Format decimal as currency
     */
    private String formatCurrency(Decimal amount) {
        return '₹' + amount.setScale(2).format();
    }
}
