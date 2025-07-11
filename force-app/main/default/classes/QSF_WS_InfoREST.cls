@RestResource(urlMapping='/QuendaInfo/*')
global with sharing class QSF_WS_InfoREST {
    
    @HttpPost
    global static void doPost(Interaction__c  interaction) {
        
        RestResponse standardResp = RestContext.response;
        //RestRequest req = RestContext.request;       
        //String ContentType = RestContext.request.headers.get('Content-Type').toUpperCase();
        String response = '';
        try {
            insert interaction;
            Interaction__c newInter = [select Id, Name from Interaction__c where Id = :interaction.Id];
            String str = JSON.serializePretty(newInter);
            response = str;
        	standardResp.statusCode = 200;
            
        } catch(DmlException e) {
            System.debug('The following exception has occurred: ' + e.getMessage());
            response = '{"success":"false","message":"The following exception has occurred:'+ e.getMessage()+'"}';
        	standardResp.statusCode = 400;
        }
        
        standardResp.responseBody = blob.valueOf(response);
    }
}