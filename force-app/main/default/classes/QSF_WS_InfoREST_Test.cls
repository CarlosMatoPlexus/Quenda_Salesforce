@IsTest(SeeAllData=false) 
private class QSF_WS_InfoREST_Test {
    
    @isTest
    static void testDoPost() {
        // prepare test-data
        
        //As Per Best Practice it is important to instantiate the Rest Context
        RestRequest request = new RestRequest();
        RestResponse response = new RestResponse();
        request.requestURI = '/services/apexrest/QuendaInfo'; //Request URL
        request.httpMethod = 'POST';
        
        RestContext.request = request;
        RestContext.response= response;
        
        
        Interaction__c newInter = new Interaction__c();
 		newInter.RecordTypeId = Schema.SObjectType.Interaction__c.getRecordTypeInfosByName().get('Interaction Chile').getRecordTypeId();
		newInter.AsignationDate__c = Datetime.valueOf('2018-01-23 13:00:00');
	    newInter.Office__c = 'CLPLX00';
	    newInter.Reason__c = '70';
	    newInter.Status__c = 'ESTA001';
	    newInter.TicketNumber__c = 'E003';
	    newInter.Interaction_Origin__c ='IO003';
	    newInter.QSF_Appointment_Id__c = '5';
	    newInter.QSF_Reason__c = 'Atención sin ticket';
        
        Interaction__c newInterError = newInter;
        newInterError.Agent__c = null;
        
        
        
        Test.startTest();
        QSF_WS_InfoREST.doPost(newInter);
        
        QSF_WS_InfoREST.doPost(newInterError);
        
        Test.stopTest();
        
        //System.assertEquals('expected value', actual, 'Value is incorrect');
    }
}