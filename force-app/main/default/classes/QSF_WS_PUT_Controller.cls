/*
*========================================================================================================
* @ClassName		QSF_WS_PUT_Controller
* @Description		INTEGRACIÓN QUENDA LLAMADAS A LOS SERVICIOS WEB DISPONIBLES (PUT)
* @Author			RCV y RMCD
* @Email			rcasal@ayesa.com, rmcumplido@ayesa.com
* @Vendor			Ayesa
* @Version			V0.1
* @TestClass		QSF_Shift_Management_Controller_Test
* @DateCreated		2017/09/26
* @LastChange		2019/02/13		
*========================================================================================================
*/
public class QSF_WS_PUT_Controller{    
    
    /*
* @Author			RCV y RMCD
* @Email			rcasal@ayesa.com, rmcumplido@ayesa.com
* @Vendor			Ayesa
* @Description		Solicitud del ACCESS TOKEN
* @param 			user
* @param 			password
* @return 			Devuelve access token que se utilizará para acceder a los WS
* @Version			V0.1
*/
    public static HttpResponse getAccessTokenWS(string user, string password) {
        HttpRequest request = new HttpRequest();
        HttpResponse response = new HttpResponse();
        QSF_Quenda_WS__c urlCS = QSF_Quenda_WS__c.getValues('QuendaWS');
        String url = urlCS.WS_URL__c;
        String newurl = url + '/quenda/auth/oauth/token/?username='+user+'&password='+password;
        // String newurl = '/quenda/auth/oauth/token/?username='+user+'&password='+password;
        //request.setEndpoint(newurl); 
        request.setEndpoint(newurl);
        request.setMethod('POST');
        request.setHeader('Content-Type', 'application/json;charset=UTF-8');
        
        try{
            //System.debug('Hora de llamada GetAccesToken: ' + DateTime.now());
            response = new Http().send(request);
            //System.debug('Hora de respuesta GetAccesToken: ' + DateTime.now());
            
            System.debug(response);
            if (response.getStatusCode() == 200) {
                System.debug('The status code returned is : ' +
                             response.getStatusCode() + ' ' + response.getStatus());
            }else{
                System.debug('Error en Access Token');
                System.debug(response.getBody());
                System.debug(response);
            }
        }catch (System.CalloutException e){
            System.debug('Callout error: '+ e);
            System.debug(response.toString());
        }
        return response;
    }
    
    
    /*
* @Author			RCV y RMCD
* @Email			rcasal@ayesa.com, rmcumplido@ayesa.com
* @Vendor			Ayesa
* @Description		Resgistro de PUESTO seleccionado por el usuario (login) (PUT 1.2.1).
* @param 			ubicación del agente/usuario
* @return 			Resultado registro de puesto
* @Version			V0.1
*/
    public static HttpResponse putSelectedPlaceWS(string info) { //Rebajar
        //public static HttpResponse putSelectedPlaceWS(long idPlace, string username, string logout, string accessToken) { //Rebajar
        System.debug(info);
        Map<string,Object> currentInfo = (Map<string,Object>)JSON.deserializeUntyped(info);
        
        long idPlace =(long)currentInfo.get('idPlace');
        string username = (string)currentInfo.get('username');
        string logout = (string)currentInfo.get('logout');
        string accessToken = (string)currentInfo.get('accessToken');
        
        system.debug('idPlace ' +  idPlace);
        system.debug('username ' +  username);
        system.debug('logout ' +  logout);
        //system.debug('accessToken ' +  accessToken);
        
        
        HttpRequest request = new HttpRequest();
        HttpResponse response = new HttpResponse();
        QSF_Quenda_WS__c urlCS = QSF_Quenda_WS__c.getValues('QuendaWS');
        String url = urlCS.WS_URL__c;
        String newurl = url + '/quenda/rest/puestosService/setPuestoUsuario/?idPuesto='+idPlace+'&nombreUsuario='+username+'&liberar='+logout;
        request.setEndpoint(newurl);
        request.setMethod('PUT');
        request.setHeader('Content-Type', 'application/json;charset=UTF-8');
        request.setHeader('Authorization', accessToken);
        
        try{
            //System.debug('Hora de llamada putSelectedPlaceWS: ' + DateTime.now());
            response = new Http().send(request);
            system.debug(response);
            //System.debug('Hora de respuesta putSelectedPlaceWS: ' + DateTime.now());
            
            if (response.getStatusCode() == 200) {
                System.debug('The status code returned is : ' +
                             response.getStatusCode() + ' ' + response.getStatus());
            }else{
                System.debug(response.getBody());
            }
        }catch (System.CalloutException e){
            System.debug('Callout error: '+ e);
            System.debug(response.toString());
        }
        return response;
    }
    
    
    /*
* @Author			RCV y RMCD
* @Email			rcasal@ayesa.com, rmcumplido@ayesa.com
* @Vendor			Ayesa
* @Description		Devuelve los datos del siguiente ticket a llamar PREVIO A COMENZAR LA ATENCIÓN  (FUNCIONALIDAD TIEMPO SIN TRANSITO) .
* @param 			ubicación del agente/usuario
* @return 			Devuelve los datos del siguiente ticket a llamar
* @Version			V0.1
*/
    public static HttpResponse putStartNoTransitAttentionWS(string info) {
        //public static HttpResponse putStartNoTransitAttentionWS(long idPuesto, long idUsuario, long idCita, string accessToken) {
        System.debug(info);
        Map<string,Object> currentInfo = (Map<string,Object>)JSON.deserializeUntyped(info);
        long idPuesto =(long)currentInfo.get('idPuesto');
        long idUsuario = (long)currentInfo.get('idUsuario');
        long idCita = (long)currentInfo.get('idCita');
        string accessToken = (string)currentInfo.get('accessToken');
        
        system.debug('idPuesto ' +  idPuesto);
        system.debug('idUsuario ' +  idUsuario);
        system.debug('idCita ' +  idCita);
       // system.debug('accessToken ' +  accessToken);        
        
        HttpRequest request = new HttpRequest();
        HttpResponse response = new HttpResponse();
        QSF_Quenda_WS__c urlCS = QSF_Quenda_WS__c.getValues('QuendaWS');
        String url = urlCS.WS_URL__c;
        String newurl = url + '/quenda/rest/citasService/setInicioAtencionSinTransito/?idPuesto='+idPuesto+'&idUsuario='+idUsuario+'&idCita='+idCita;
        request.setEndpoint(newurl);
        request.setMethod('PUT');
        request.setHeader('Content-Type', 'application/json;charset=UTF-8');
        request.setHeader('Authorization', accessToken);
        
        try{
            //System.debug('Hora de llamada StartNoTransitAttention: ' + DateTime.now());
            response = new Http().send(request);
            //system.debug(newurl);
            //system.debug(response);
            //System.debug('Hora de respuesta StartNoTransitAttention: ' + DateTime.now());
            
            if (response.getStatusCode() == 200) {
                System.debug('The status code returned is : ' +
                             response.getStatusCode() + ' ' + response.getStatus());
            }else{
                System.debug(response.getBody());
            }
        }catch (System.CalloutException e){
            System.debug('Callout error: '+ e);
            System.debug(response.toString());
        }
        return response;
    }
    
    /*
* @Author			RCV y RMCD
* @Email			rcasal@ayesa.com, rmcumplido@ayesa.com
* @Vendor			Ayesa
* @Description		Devuelve los datos del siguiente ticket a llamar  (PUT 1.2.2).
* @param 			ubicación del agente/usuario
* @return 			Devuelve los datos del siguiente ticket a llamar
* @Version			V0.1
*/
    public static HttpResponse putNextTicketWS(string info) { 
        // public static HttpResponse putNextTicketWS(long idOficina, long idPuesto, long idUsuario, integer idioma, long idServicio, long idCita, string accessToken) { //Rebajar
        System.debug(info);
        Map<string,Object> currentInfo = (Map<string,Object>)JSON.deserializeUntyped(info);
        long idPuesto =(long)currentInfo.get('idPuesto');
        //long idPuesto =null;
        long idUsuario = (long)currentInfo.get('idUsuario');
        long idCita = (long)currentInfo.get('idCita');
        long idOficina = (long)currentInfo.get('idOficina');
        long idServicio = (long)currentInfo.get('idServicio');
        integer idioma = (integer)currentInfo.get('idioma');
        string accessToken = (string)currentInfo.get('accessToken');
        
        system.debug('idPuesto ' +  idPuesto);
        system.debug('idUsuario ' +  idUsuario);
        system.debug('idCita ' +  idCita);
        system.debug('idOficina ' +  idOficina);   
        system.debug('idServicio ' +  idServicio);
       // system.debug('accessToken ' +  accessToken);
        system.debug('idioma ' +  idioma);
        
        
        HttpRequest request = new HttpRequest();
        HttpResponse response = new HttpResponse();
        QSF_Quenda_WS__c urlCS = QSF_Quenda_WS__c.getValues('QuendaWS');
        String url = urlCS.WS_URL__c;
        String newurl = url + '/quenda/rest/citasService/setLlamaTicketSiguiente/?idOficina='+idOficina+'&idPuesto='+idPuesto+'&idUsuario='+idUsuario+'&idioma='+idioma+'&idServicio='+idServicio+'&idCita='+idCita;
        request.setEndpoint(newurl);
        request.setMethod('PUT');
        request.setHeader('Content-Type', 'application/json;charset=UTF-8');
        request.setHeader('Authorization', accessToken);
        
        try{
            // System.debug('Hora de llamada putNextTicketWS: ' + DateTime.now());
            response = new Http().send(request);
            //system.debug(newurl);
            //system.debug(response);
            //System.debug('Hora de respuesta putNextTicketWS: ' + DateTime.now());
            
            if (response.getStatusCode() == 200) {
                System.debug('The status code returned is : ' +
                             response.getStatusCode() + ' ' + response.getStatus());
            }else{
                System.debug(response.getBody());
            }
        }catch (System.CalloutException e){
            System.debug('Callout error: '+ e);
            System.debug(response.toString());
        }
        return response;
    }
    
    /*
* @Author			RCV y RMCD
* @Email			rcasal@ayesa.com, rmcumplido@ayesa.com
* @Vendor			AyesaSelect an item to open (* = any string)

* @Description		Devuelve los datos de una atención sin ticket o atención rápida (PUT 1.2.3).
* @param 			ubicación del agente/usuario
* @return 			Devuelve los datos de una atención sin ticket o atención rápida
* @Version			V0.1
*/
    public static HttpResponse putNextNoTicketWS(string info) { 
        //public static HttpResponse putNextNoTicketWS(long idOficina, long idPuesto, long idUsuario, integer idioma, long idServicio, string accessToken, string localTimeString) { //rebajar
        System.debug(info);
        Map<string,Object> currentInfo = (Map<string,Object>)JSON.deserializeUntyped(info);
        long idPuesto =(long)currentInfo.get('idPuesto');
        long idUsuario = (long)currentInfo.get('idUsuario');
        long idOficina = (long)currentInfo.get('idOficina');
        long idServicio = (long)currentInfo.get('idServicio');
        integer idioma = (integer)currentInfo.get('idioma');
        string localTimeString = (string)currentInfo.get('localTimeString');
        string accessToken = (string)currentInfo.get('accessToken');
        
        system.debug('idPuesto ' +  idPuesto);
        system.debug('idUsuario ' +  idUsuario);
        system.debug('idOficina ' +  idOficina);   
        system.debug('idServicio ' +  idServicio);
       // system.debug('accessToken ' +  accessToken);
        system.debug('localTimeString ' +  localTimeString);
        system.debug('idioma ' +  idioma); 
        
        
        
        //system.debug('Hora de impresion de ticket');
        //system.debug(localTimeString);
        HttpRequest request = new HttpRequest();
        HttpResponse response = new HttpResponse();
        QSF_Quenda_WS__c urlCS = QSF_Quenda_WS__c.getValues('QuendaWS');
        String url = urlCS.WS_URL__c;
        String newurl = url + '/quenda/rest/citasService/setLlamaSiguienteSinTicket/?idOficina='+idOficina+'&idPuesto='+idPuesto+'&idUsuario='+idUsuario+'&idioma='+idioma+'&idServicio='+idServicio+'&horaLlegada='+localTimeString;
        request.setEndpoint(newurl);
        request.setMethod('PUT');
        //request.setTimeout(20000);
        request.setHeader('Content-Type', 'application/json;charset=UTF-8');
        request.setHeader('Authorization', accessToken);
        
        try{
            //System.debug('Hora de llamada putNextNoTicketWS: ' + DateTime.now());
            response = new Http().send(request);
            //System.debug('Hora de respuesta putNextNoTicketWS: ' + DateTime.now());
            
            if (response.getStatusCode() == 200) {
                System.debug('The status code returned is : ' +
                             response.getStatusCode() + ' ' + response.getStatus());
            }else{
                System.debug(response.getBody());
            }
        }catch (System.CalloutException e){
            System.debug('Callout error: '+ e);
            System.debug(response.toString());
        }
        return response;
    }
    
    /*
* @Author			RCV y RMCD
* @Email			rcasal@ayesa.com, rmcumplido@ayesa.com
* @Vendor			Ayesa
* @Description		Finalizacion de cita y puesta en espera(pause)  (PUT 1.2.4).
* @param 			informacion del usuario e identificador de cita
* @return 			Resultado registro de finalizacion de cita y puesta en espera
* @Version			V0.1
*/
    public static HttpResponse putFinishTicketAndPauseWS(string info) { //rebajar
        //public static HttpResponse putFinishTicketAndPauseWS(long idOficina, long idCita, long idUsuario, long idPuesto, string accessToken) { //rebajar 
        string additionalParameters='';
        Map<string,Object> currentInfo = (Map<string,Object>)JSON.deserializeUntyped(info);
        System.debug(currentInfo);
        
        string idInteraction= (string)currentInfo.get('idInteraction');
        
        System.debug('idInteraction: ' + idInteraction);
        //Obtención de información adicional a enviar por WS
        
        if(idInteraction!='' && idInteraction!=null){
            system.debug('entra en el if');
            Interaction__c interactionInfo =QSF_Shift_Management_Controller.getInteractionFields(idInteraction); 
            system.debug('motivo: '+interactionInfo.QSF_Reason__c);
            system.debug('submotivo: '+interactionInfo.Reason__c);
            system.debug('comentario: '+interactionInfo.QSF_Comments__c);
            system.debug('documento: '+interactionInfo.ApplicantContact__r.IdentityNumber__c);
            system.debug('contacto: '+interactionInfo.ApplicantContact__r.Name);
             
            
            additionalParameters=additionalParameters+'&contacto='+interactionInfo.ApplicantContact__r.Name+'&comentarios='+interactionInfo.QSF_Comments__c+'&documento='+interactionInfo.ApplicantContact__r.IdentityNumber__c
                    +'&motivo='+interactionInfo.Reason__c+'&submotivo='+interactionInfo.QSF_Reason__c;
            String[] strList = additionalParameters.split(' ');
            system.debug(strList);
            additionalParameters = String.join(strList,'+');
            system.debug(additionalParameters);
        }
        
        long idPuesto =(long)currentInfo.get('idPuesto');
        long idUsuario = (long)currentInfo.get('idUsuario');
        long idOficina = (long)currentInfo.get('idOficina');
        long idCita = (long)currentInfo.get('idCita');
        string accessToken = (string)currentInfo.get('accessToken');
        
        system.debug('idPuesto ' +  idPuesto);
        system.debug('idUsuario ' +  idUsuario);
        system.debug('idOficina ' +  idOficina);   
        system.debug('idCita ' +  idCita);
        //system.debug('accessToken ' +  accessToken);
        
        HttpRequest request = new HttpRequest();
        HttpResponse response = new HttpResponse();
        QSF_Quenda_WS__c urlCS = QSF_Quenda_WS__c.getValues('QuendaWS');
        String url = urlCS.WS_URL__c;
        String newurl = url + '/quenda/rest/citasService/setFinalizaTurnoYPausa/?idOficina='+idOficina+'&idCita='+idCita+'&idUsuario='+idUsuario+'&idPuesto='+idPuesto;
        newurl = newurl + additionalParameters;
        system.debug(additionalParameters);
        system.debug(newurl);
        request.setEndpoint(newurl);
        request.setMethod('PUT');
        request.setHeader('Content-Type', 'application/json;charset=UTF-8');
        request.setHeader('Authorization', accessToken);
        
        try{
            // System.debug('Hora de llamada putFinishTicketAndPauseWS: ' + DateTime.now());
            response = new Http().send(request);
            // System.debug(response.getBody());
            // System.debug('Hora de respuesta putFinishTicketAndPauseWS: ' + DateTime.now());
            
            if (response.getStatusCode() == 200) {
                System.debug('The status code returned is : ' +
                             response.getStatusCode() + ' ' + response.getStatus());
            }else{
                System.debug(response.getBody());
            }
        }catch (System.CalloutException e){
            System.debug('Callout error: '+ e);
            System.debug(response.toString());
        }
        return response;
    }
    
    /*
* @Author			RCV y RMCD
* @Email			rcasal@ayesa.com, rmcumplido@ayesa.com
* @Vendor			Ayesa
* @Description		Finalizacion de cita y llamada de la siguiente  (PUT 1.2.5).
* @param 			informacion del usuario, identificador de cita y servicio(opcional)
* @return 			Resultado registro de finalizacion de cita y llamada de la siguiente
* @Version			V0.1
*/
    public static HttpResponse putFinishTicketAndNextWS(string info) { // rebajar
        //public static HttpResponse putFinishTicketAndNextWS(long idCita, long idOficina, long idPuesto, long idUsuario, integer idioma, long idServicio, string accessToken) { // rebajar
        System.debug(info);
        string additionalParameters='';
        
        Map<string,Object> currentInfo = (Map<string,Object>)JSON.deserializeUntyped(info);            
        string idInteraction= (string)currentInfo.get('idInteraction');
        
        //Obtención de información adicional a enviar por WS
        
        if(idInteraction!='' && idInteraction!=null){
            Interaction__c interactionInfo =QSF_Shift_Management_Controller.getInteractionFields(idInteraction);     
            additionalParameters=additionalParameters+'&contacto='+interactionInfo.ApplicantContact__r.Name+'&comentarios='+interactionInfo.QSF_Comments__c+'&documento='+interactionInfo.ApplicantContact__r.IdentityNumber__c
                    +'&motivo='+interactionInfo.Reason__c+'&submotivo='+interactionInfo.QSF_Reason__c;
            String[] strList = additionalParameters.split(' ');
            
            system.debug('motivo: '+interactionInfo.QSF_Reason__c);
            system.debug('submotivo: '+interactionInfo.Reason__c);
            system.debug('comentario: '+interactionInfo.QSF_Comments__c);
            system.debug('documento: '+interactionInfo.ApplicantContact__r.IdentityNumber__c);
            system.debug('contacto: '+interactionInfo.ApplicantContact__r.Name);
            
            additionalParameters = String.join(strList,'+');                
        }
        
        long idPuesto =(long)currentInfo.get('idPuesto');
        long idUsuario = (long)currentInfo.get('idUsuario');
        long idOficina = (long)currentInfo.get('idOficina');
        long idCita = (long)currentInfo.get('idCita');
        long idServicio = (long)currentInfo.get('idServicio');
        integer idioma = (integer)currentInfo.get('idioma');
        string accessToken = (string)currentInfo.get('accessToken');
        
        system.debug('idPuesto ' +  idPuesto);
        system.debug('idUsuario ' +  idUsuario);
        system.debug('idOficina ' +  idOficina);   
        system.debug('idCita ' +  idCita);
        system.debug('idioma ' +  idioma);
        system.debug('idServicio ' +  idServicio);
       // system.debug('accessToken ' +  accessToken);  
        
        
        HttpRequest request = new HttpRequest();
        HttpResponse response = new HttpResponse();
        QSF_Quenda_WS__c urlCS = QSF_Quenda_WS__c.getValues('QuendaWS');
        String url = urlCS.WS_URL__c;
        String newurl = url + '/quenda/rest/citasService/setFinalizaTurnoYLlama/?idCita='+idCita+'&idOficina='+idOficina+'&idPuesto='+idPuesto+'&idUsuario='+idUsuario+'&idioma='+idioma+'&idServicio='+idServicio ;
        newurl = newurl + additionalParameters;
		        
        request.setEndpoint(newurl);
        request.setMethod('PUT');
        request.setHeader('Content-Type', 'application/json;charset=UTF-8');
        request.setHeader('Authorization', accessToken);
        
        try{
            //System.debug('Hora de llamada putFinishTicketAndNextWS: ' + DateTime.now());
            response = new Http().send(request);
            //System.debug('Hora de respuesta putFinishTicketAndNextWS: ' + DateTime.now());
            
            if (response.getStatusCode() == 200) {
                System.debug('The status code returned is : ' +
                             response.getStatusCode() + ' ' + response.getStatus());
            }else{
                System.debug(response.getBody());
            }
        }catch (System.CalloutException e){
            System.debug('Callout error: '+ e);
            System.debug(response.toString());
        }
        return response;
    }
    
    /*
* @Author			RCV y RMCD
* @Email			rcasal@ayesa.com, rmcumplido@ayesa.com
* @Vendor			Ayesa
* @Description		Marcar cita como "el cliente NO ACUDE"  (PUT 1.2.6).
* @param 			informacion del usuario, identificador de cita
* @return 			Resultado de marcar cita como "el cliente NO ACUDE"
* @Version			V0.1
*/
    public static HttpResponse putAbsentClientWS(string info) { //rebajar
        //public static HttpResponse putAbsentClientWS(long idOficina, long idCita, long idUsuario, long idPuesto, string accessToken) { //rebajar       
        System.debug(info);
        
        Map<string,Object> currentInfo = (Map<string,Object>)JSON.deserializeUntyped(info);
        long idPuesto =(long)currentInfo.get('idPuesto');
        long idUsuario = (long)currentInfo.get('idUsuario');
        long idOficina = (long)currentInfo.get('idOficina');
        long idCita = (long)currentInfo.get('idCita');
        string accessToken = (string)currentInfo.get('accessToken');
        string additionalParameters='';
        string idInteraction= (string)currentInfo.get('idInteraction');
        system.debug(idInteraction);
        
        if(idInteraction!='' && idInteraction!=null){
            Interaction__c interactionInfo =QSF_Shift_Management_Controller.getInteractionFields(idInteraction);     
            additionalParameters=additionalParameters+'&contacto='+interactionInfo.ApplicantContact__r.Name+'&comentarios='+interactionInfo.QSF_Comments__c+'&documento='+interactionInfo.ApplicantContact__r.IdentityNumber__c
                    +'&motivo='+interactionInfo.Reason__c+'&submotivo='+interactionInfo.QSF_Reason__c;
            system.debug(additionalParameters);            
            
            system.debug('motivo: '+interactionInfo.QSF_Reason__c);
            system.debug('submotivo: '+interactionInfo.Reason__c);
            system.debug('comentario: '+interactionInfo.QSF_Comments__c);
            system.debug('documento: '+interactionInfo.ApplicantContact__r.IdentityNumber__c);
            system.debug('contacto: '+interactionInfo.ApplicantContact__r.Name);
            String[] strList = additionalParameters.split(' ');
            additionalParameters = String.join(strList,'+');
            system.debug(additionalParameters);
        }
        
        system.debug('idPuesto ' +  idPuesto);
        system.debug('idUsuario ' +  idUsuario);
        system.debug('idOficina ' +  idOficina);   
        system.debug('idCita ' +  idCita);
       // system.debug('accessToken ' +  accessToken);  
        
        
        HttpRequest request = new HttpRequest();
        HttpResponse response = new HttpResponse();
        QSF_Quenda_WS__c urlCS = QSF_Quenda_WS__c.getValues('QuendaWS');
        String url = urlCS.WS_URL__c;
        String newurl = url + '/quenda/rest/citasService/setNoAcude/?idOficina='+idOficina+'&idCita='+idCita+'&idUsuario='+idUsuario+'&idPuesto='+idPuesto;
        newurl = newurl + additionalParameters;
        system.debug(newurl);
        request.setEndpoint(newurl);
        request.setMethod('PUT');
        request.setHeader('Content-Type', 'application/json;charset=UTF-8');
        request.setHeader('Authorization', accessToken);
        
        try{
            // System.debug('Hora de llamada putAbsentClientWS: ' + DateTime.now());
            response = new Http().send(request);
            // System.debug('Hora de respuesta putAbsentClientWS: ' + DateTime.now());
            
            if (response.getStatusCode() == 200) {
                System.debug('The status code returned is : ' +
                             response.getStatusCode() + ' ' + response.getStatus());
            }else{
                System.debug(response.getBody());
            }
        }catch (System.CalloutException e){
            System.debug('Callout error: '+ e);
            System.debug(response.toString());
        }
        return response;
    }
    
    /*
* @Author			RCV y RMCD
* @Email			rcasal@ayesa.com, rmcumplido@ayesa.com
* @Vendor			Ayesa
* @Description		Permite llamar al ticket en la pantalla asociada al PUESTO  (PUT 1.2.7) (FALTA EL idPUESTO EN LA DESCRIPCION DEL WS)
* @param 			informacion de oficina, identificador de cita e idioma
* @return 			Resultado de llamar al ticket en la pantalla asociada al PUESTO 
* @Version			V0.1
*/
    public static HttpResponse putScreenRecallWS(string info) { //rebajar
        // public static HttpResponse putScreenRecallWS(long idOficina, long idCita, long idUsuario, integer idioma, string accessToken) { //rebajar
        System.debug(info);
        Map<string,Object> currentInfo = (Map<string,Object>)JSON.deserializeUntyped(info);
        long idUsuario = (long)currentInfo.get('idUsuario');
        long idOficina = (long)currentInfo.get('idOficina');
        long idCita = (long)currentInfo.get('idCita');
        integer idioma = (integer)currentInfo.get('idioma');
        string accessToken = (string)currentInfo.get('accessToken');
        
        
        system.debug('idUsuario ' +  idUsuario);
        system.debug('idOficina ' +  idOficina);   
        system.debug('idCita ' +  idCita);
        system.debug('idioma ' +  idioma);
      //  system.debug('accessToken ' +  accessToken);  
        
        HttpRequest request = new HttpRequest();
        HttpResponse response = new HttpResponse();
        QSF_Quenda_WS__c urlCS = QSF_Quenda_WS__c.getValues('QuendaWS');
        String url = urlCS.WS_URL__c;
        String newurl = url + '/quenda/rest/citasService/setRellamadaPantalla/?idOficina='+idOficina+'&idCita='+idCita+'&idUsuario='+idUsuario+'&idioma='+idioma;
        request.setEndpoint(newurl);
        request.setMethod('PUT');
        request.setHeader('Content-Type', 'application/json;charset=UTF-8');
        request.setHeader('Authorization', accessToken);
        
        try{
            //  System.debug('Hora de llamada putScreenRecallWS: ' + DateTime.now());
            response = new Http().send(request);
            //  System.debug('Hora de respuesta putScreenRecallWS: ' + DateTime.now());
            
            if (response.getStatusCode() == 200) {
                System.debug('The status code returned is : ' +
                             response.getStatusCode() + ' ' + response.getStatus());
            }else{
                System.debug(response.getBody());
            }
        }catch (System.CalloutException e){
            System.debug('Callout error: '+ e);
            System.debug(response.toString());
        }
        return response;
    }
    
    /*
* @Author			RCV y RMCD
* @Email			rcasal@ayesa.com, rmcumplido@ayesa.com
* @Vendor			Ayesa
* @Description		Permite REENVIAR el ticket a otro servicio y puesto y retrasarlo X segundos  (PUT 1.2.8)
* @param 			informacion de Cita, oficina, usuario, idioma y datos de reenvio; Servicio,puesto y retraso del reenvio.
* @return 			Resultado de REENVIAR el ticket a otro servicio y puesto y retrasarlo X segundos
* @Version			V0.1
*/
    public static HttpResponse putForwardingTicketWS(string info) {
        //public static HttpResponse putForwardingTicketWS(long idCita, long idOficina, long idServicioDestino, long idUsuario, long idPuesto, integer idioma, integer segundosRetraso, long idPuestoDestino, string accessToken) {        
        System.debug(info);
        string additionalParameters='';
        Map<string,Object> currentInfo = (Map<string,Object>)JSON.deserializeUntyped(info);
        
        string idInteraction= (string)currentInfo.get('idInteraction');
        
        //Obtención de información adicional a enviar por WS
        
        if(idInteraction!='' && idInteraction!=null){
            Interaction__c interactionInfo =QSF_Shift_Management_Controller.getInteractionFields(idInteraction);     
            additionalParameters=additionalParameters+'&contacto='+interactionInfo.ApplicantContact__r.Name+'&comentarios='+interactionInfo.QSF_Comments__c+'&documento='+interactionInfo.ApplicantContact__r.IdentityNumber__c
                    +'&motivo='+interactionInfo.Reason__c+'&submotivo='+interactionInfo.QSF_Reason__c;
            system.debug(additionalParameters);
            system.debug('motivo: '+interactionInfo.QSF_Reason__c);
            system.debug('submotivo: '+interactionInfo.Reason__c);
            system.debug('comentario: '+interactionInfo.QSF_Comments__c);
            system.debug('documento: '+interactionInfo.ApplicantContact__r.IdentityNumber__c);
            system.debug('contacto: '+interactionInfo.ApplicantContact__r.Name);
            String[] strList = additionalParameters.split(' ');
            additionalParameters = String.join(strList,'+');
            system.debug(additionalParameters);
        }
        
        long idUsuario = (long)currentInfo.get('idUsuario');
        long idOficina = (long)currentInfo.get('idOficina');
        long idCita = (long)currentInfo.get('idCita');
        long idServicioDestino = (long)currentInfo.get('idServicioDestino');
        long idPuesto = (long)currentInfo.get('idPuesto');
        long idPuestoDestino = (long)currentInfo.get('idPuestoDestino');
        integer segundosRetraso = (integer)currentInfo.get('segundosRetraso');
        integer idioma = (integer)currentInfo.get('idioma');
        string accessToken = (string)currentInfo.get('accessToken');
        
        
        system.debug('idUsuario ' +  idUsuario);
        system.debug('segundosRetraso ' +  segundosRetraso);
        system.debug('idPuestoDestino ' +  idPuestoDestino);
        system.debug('idPuesto ' +  idPuesto);
        system.debug('idUsuario ' +  idUsuario);
        system.debug('idOficina ' +  idOficina);   
        system.debug('idCita ' +  idCita);
        system.debug('idioma ' +  idioma);
       // system.debug('accessToken ' +  accessToken);  
        
        
        HttpRequest request = new HttpRequest();
        HttpResponse response = new HttpResponse();
        QSF_Quenda_WS__c urlCS = QSF_Quenda_WS__c.getValues('QuendaWS');
        String url = urlCS.WS_URL__c;
        String newurl = url + '/quenda/rest/citasService/setReenvioCita/?idCita='+idCita+'&idOficina='+idOficina+'&idServicioDestino='+idServicioDestino+'&idioma='+idioma+'&idUsuario='+idUsuario+'&idPuesto='+idPuesto+'&segundosRetraso='+segundosRetraso+'&idPuestoDestino='+idPuestoDestino;
        newurl = newurl + additionalParameters;
        
        request.setEndpoint(newurl);
        request.setMethod('PUT');
        request.setHeader('Content-Type', 'application/json;charset=UTF-8');
        request.setHeader('Authorization', accessToken);
        
        try{
            //  System.debug('Hora de llamada putForwardingTicketWS: ' + DateTime.now());
            response = new Http().send(request);
            //  System.debug('Hora de respuesta putForwardingTicketWS: ' + DateTime.now());
            
            if (response.getStatusCode() == 200) {
                System.debug('The status code returned is : ' +
                             response.getStatusCode() + ' ' + response.getStatus());
            }else{
                System.debug(response.getBody());
            }
        }catch (System.CalloutException e){
            System.debug('Callout error: '+ e);
            System.debug(response.toString());
        }
        return response;
    }
    
    
/*
* @Author			RCV y RMCD
* @Email			rcasal@ayesa.com, rmcumplido@ayesa.com
* @Vendor			Ayesa
* @Description		Modificar el estado de NO ATENCION del usuario.
* @param 			idioma
* @return 			LISTA de estados de NO ATENCION 
* @Version			V0.1
*/ 
    public static HttpResponse setNoAttentionUserStatusWS(string info) {
        
         Map<string,Object> currentInfo = (Map<string,Object>)JSON.deserializeUntyped(info);
        long idOficina =(long)currentInfo.get('idOficina');
        long idPuesto = (long)currentInfo.get('idPuesto');
        long idUsuario = (long)currentInfo.get('idUsuario');
        long idEstado = (long)currentInfo.get('idEstado');
        string accessToken = (string)currentInfo.get('accessToken');
 
        
        system.debug('idPuesto ' +  idPuesto);
        system.debug('idUsuario ' +  idUsuario);
        system.debug('idOficina ' +  idOficina);   
        system.debug('idEstado ' +  idEstado);
                
        HttpRequest request = new HttpRequest();
        HttpResponse response = new HttpResponse();
       
        QSF_Quenda_WS__c urlCS = QSF_Quenda_WS__c.getValues('QuendaWS');
        system.debug('SET Estado de no atención');
		        
        String url = urlCS.WS_URL__c;
        string newurl = url + '/quenda/rest/puestosService/setEstadoNoAtencion/?idOficina='+idOficina+'&idUsuario='+idUsuario+'&idPuesto='+idPuesto+'&idEstado='+idEstado;
        system.debug(newurl);
       
        request.setEndpoint(newurl);
        request.setMethod('PUT');
        request.setHeader('Content-Type', 'application/json;charset=UTF-8');
        request.setHeader('Authorization', accessToken);
        
        try{
            // System.debug('Hora de llamada setNoAttentionUserStatusWS: ' + DateTime.now());
            response = new Http().send(request);
            // System.debug('Hora de respuesta setNoAttentionUserStatusWS: ' +DateTime.now());
            
            if (response.getStatusCode() == 200) {
                System.debug('The status code returned is : ' +
                             response.getStatusCode() + ' ' + response.getStatus());
            }else{
                System.debug(response.getBody());
            }
        }catch (System.CalloutException e){
            System.debug('Callout error: '+ e);
            System.debug(response.toString());
        }
        return response;
    }
       
    
    
    
    
    /**
* Indica que el usuario deja el PUESTO y por tanto queda libre  (PUT 1.2.11)
* @author Raquel Cumplido
* @param informacion de usuario y puesto.
*/
    /*public static HttpResponse putLeavePlaceWS(long idUsuario, long idPuesto, string accessToken) {
HttpRequest request = new HttpRequest();
//String newurl ='http://proyectos.plexus.es/QUENDADEMOENEL/rest/puestosService/setDejarPuesto/?idUsuario='+idUsuario+'&idPuesto='+idPuesto;
String newurl ='https://quendalatam.plexus.services/quenda/rest/puestosService/setDejarPuesto/?idUsuario='+idUsuario+'&idPuesto='+idPuesto;
request.setEndpoint(newurl);
request.setMethod('PUT');
request.setHeader('Content-Type', 'application/json;charset=UTF-8');
request.setHeader('Authorization', accessToken);
HttpResponse response = new Http().send(request);
if (response.getStatusCode() == 200) {
System.debug('The status code returned is : ' +
response.getStatusCode() + ' ' + response.getStatus());
}else{
System.debug(response.getBody());
}
return response;
}*/
}