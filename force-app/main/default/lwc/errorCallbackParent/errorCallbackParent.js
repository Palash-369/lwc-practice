import { LightningElement, track } from 'lwc';
import logError from '@salesforce/apex/ErrorLoggerService.logError';
export default class ErrorCallbackParent extends LightningElement {

@track errorMessage;

errorCallback(error, stack){
    console.error('Error caught in Parent Component: ', error);

    console.error('Stack Trace: ', stack);

    this.errorMessage = 'something went wrong in Child. Please try again later!';

    //Log Error to Salesforce Error_Log__c via Apex
    logError({
        errorMessage:error.message,
        stackTrace:stack,
        componentName:'Parent Component'
    })
    .then(()=> {
        console.log('Error Logged successfully in Salesforce');
        })
    .catch(err=>{
        console.log('Failed to log error: ', err);
        });
    }
}