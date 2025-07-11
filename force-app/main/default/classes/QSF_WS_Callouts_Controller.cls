/*
*========================================================================================================
* @ClassName		QSF_WS_Callouts_Controller
* @Description		INTEGRACIÓN QUENDA LLAMADAS A LOS SERVICIOS WEB DISPONIBLES (GET)
* @Author			RCV y RMCD
* @Email			rcasal@ayesa.com, rmcumplido@ayesa.com
* @Vendor			Ayesa
* @Version			V0.1
* @TestClass		QSF_Shift_Management_Controller_Test
* @DateCreated		2017/09/26
* @LastChange		2019/02/13		
*========================================================================================================
*/
public class QSF_WS_Callouts_Controller {
    
/*
* @Author			RCV y RMCD
* @Email			rcasal@ayesa.com, rmcumplido@ayesa.com
* @Vendor			Ayesa
* @Description		Obtenemos la lista de puestos disponibles (GET 1.1.1)
* @param 			informacion de oficina, identificador de cita e idioma
* @return 			Lista de puestos disponibles 
* @Version			V0.1
*/
    public static HttpResponse getFreeWorkplacesWS(string username, string accessToken) {
        
        /*  Blob headerValue = Blob.valueOf(accessToken);
		String authorizationHeader = 'BASIC ' +
		EncodingUtil.base64Encode(headerValue);*/
        
        HttpRequest request = new HttpRequest();
        HttpResponse response = new HttpResponse();
        system.debug(username);
        QSF_Quenda_WS__c urlCS = QSF_Quenda_WS__c.getValues('QuendaWS');
        String url = urlCS.WS_URL__c;
        String newurl = url + '/quenda/rest/puestosService/getPuestosUsuarios/?nombreUsuario='+username;
  
       	request.setEndpoint(newurl); 
        System.debug(newurl);
        request.setEndpoint(newurl);
        request.setMethod('GET');
        request.setHeader('Content-Type', 'application/json;charset=UTF-8');
        request.setHeader('Authorization', accessToken);
        
        try{
            //System.debug('Hora de llamada getFreeWorkplacesWS: ' + DateTime.now());
            response = new Http().send(request);
            //System.debug('Hora de llamada getFreeWorkplacesWS: ' + DateTime.now());
            
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
* @Description		Obtenemos la lista de SERVICIOS en 3 casos distintos según variable "TIPO" (GET 1.1.2, 1.1.7, 1.1.8)
* @param 			ubicación del agente/usuario
* @return 			Lista de SERVICIOS en 3 casos distintos según variable "TIPO" 
* @Version			V0.1
*/
    public static HttpResponse getServiceListWS(string info) { //rebajar
        //public static HttpResponse getServiceListWS(string tipo, long idOficina, long idPuesto, long idUsuario, integer idioma, string accessToken) { //rebajar		
        System.debug(info);
        Map<string,Object> currentInfo = (Map<string,Object>)JSON.deserializeUntyped(info);
        string tipo = (string)currentInfo.get('tipo');
        long idOficina =(long)currentInfo.get('idOficina');
        long idPuesto = (long)currentInfo.get('idPuesto');
        long idUsuario = (long)currentInfo.get('idUsuario');
        integer idioma =(integer)currentInfo.get('idioma');
        string accessToken = (string)currentInfo.get('accessToken');
        
        system.debug('tipo ' +  tipo);
        system.debug('idOficina ' +  idOficina);
        system.debug('idPuesto ' +  idPuesto);
        system.debug('idUsuario ' +  idUsuario);
        system.debug('idioma ' +  idioma);
        //system.debug('accessToken ' +  accessToken);
        
        HttpRequest request = new HttpRequest();
        HttpResponse response = new HttpResponse();
        QSF_Quenda_WS__c urlCS = QSF_Quenda_WS__c.getValues('QuendaWS');
        String url = urlCS.WS_URL__c;
        String newurl = url + '/quenda/rest/serviciosService/getServicios/?tipo='+tipo+'&idOficina='+idoficina+'&idPuesto='+idpuesto+'&idUsuario='+idusuario+'&idioma='+idioma;
        request.setEndpoint(newurl);
        request.setMethod('GET');
        request.setHeader('Content-Type', 'application/json;charset=UTF-8');
        request.setHeader('Authorization', accessToken);
        
        try{
            //System.debug('Hora de llamada getServiceListWS: ' + DateTime.now());
            response = new Http().send(request);
            //System.debug('Hora de llamada getServiceListWS: ' + DateTime.now());
            
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
* @Description		Obtenemos la lista de PUESTOS de destino en REENVIO (GET 1.1.3).
* @param 			Oficina y servicio seleccionado
* @return 			Lista de PUESTOS de destino en REENVIO
* @Version			V0.1
*/    
    public static HttpResponse getForwardingPlaceListWS(string info) {
        // public static HttpResponse getForwardingPlaceListWS(long idOficina, long idServicio, string accessToken) {            
        System.debug(info);
        Map<string,Object> currentInfo = (Map<string,Object>)JSON.deserializeUntyped(info);
        long idOficina =(long)currentInfo.get('idOficina');
        long idServicio =(long)currentInfo.get('idServiceSelected');
        string accessToken = (string)currentInfo.get('accessToken');
        
        system.debug('idOficina ' +  idOficina);
        system.debug('idServicio ' +  idServicio);
        //system.debug('accessToken ' +  accessToken);   
        
        
        
        HttpRequest request = new HttpRequest();
        HttpResponse response = new HttpResponse();
        QSF_Quenda_WS__c urlCS = QSF_Quenda_WS__c.getValues('QuendaWS');
        String url = urlCS.WS_URL__c;
        String newurl = url + '/quenda/rest/puestosService/getPuestosReenvio/?idOficina='+idOficina+'&idServicio='+idServicio;
        request.setEndpoint(newurl);
        request.setMethod('GET');
        request.setHeader('Content-Type', 'application/json;charset=UTF-8');
        request.setHeader('Authorization', accessToken);
        
        try{
            //System.debug('Hora de llamada getForwardingPlaceListWS: ' + DateTime.now());
            response = new Http().send(request);
            //System.debug('Hora de llamada getForwardingPlaceListWS: ' + DateTime.now());
            
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
* @Description		Obtenemos el NÚMERO de turnos pendientes (GET 1.1.4).
* @param 			Usuario, puesto, Oficina y servicio seleccionado
* @return 			NÚMERO de turnos pendientes
* @Version			V0.1
*/  
    public static HttpResponse getUnattendedShiftNumberWS(string info) { //Rebajar
        //public static HttpResponse getUnattendedShiftNumberWS(long idPuesto, long idOficina, long idUsuario, long idServicio, string accessToken) { //Rebajar
        System.debug(info);
        Map<string,Object> currentInfo = (Map<string,Object>)JSON.deserializeUntyped(info);
        long idOficina =(long)currentInfo.get('idOficina');
        long idPuesto = (long)currentInfo.get('idPuesto');
        long idUsuario = (long)currentInfo.get('idUsuario');
        long idServicio =(long)currentInfo.get('idServicio');
        string accessToken = (string)currentInfo.get('accessToken');
        
        system.debug('idOficina ' +  idOficina);
        system.debug('idPuesto ' +  idPuesto);
        system.debug('idUsuario ' +  idUsuario);
        system.debug('idServicio ' +  idServicio);
        //system.debug('accessToken ' +  accessToken);
        
        
        HttpRequest request = new HttpRequest();
        HttpResponse response = new HttpResponse();
        QSF_Quenda_WS__c urlCS = QSF_Quenda_WS__c.getValues('QuendaWS');
        String url = urlCS.WS_URL__c;
        String newurl = url + '/quenda/rest/puestosService/getNumTurnosPendientes/?idPuesto='+idPuesto+'&idOficina='+idOficina+'&idUsuario='+idUsuario+'&idServicio='+idServicio;
        request.setEndpoint(newurl);
        request.setTimeout(1000); //Reducción de timeouts por defecto
        request.setMethod('GET');
        request.setHeader('Content-Type', 'application/json;charset=UTF-8');
        request.setHeader('Authorization', accessToken);
        
        try{
            // System.debug('Hora de llamada getUnattendedShiftNumberWS: ' + DateTime.now());
            response = new Http().send(request);
            // System.debug('Hora de llamada getUnattendedShiftNumberWS: ' + DateTime.now());
            
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
* @Description		Obtenemos la LISTA de citas pendientes por puesto (GET 1.1.5).
* @param 			Usuario, puesto, Oficina y servicio seleccionado
* @return 			LISTA de citas pendientes por puesto
* @Version			V0.1
*/     
    public static HttpResponse getUnattendedShiftListWS(string info) {//Rebajar
        //public static HttpResponse getUnattendedShiftListWS(long idPuesto, long idOficina, long idUsuario, long idServicio, string accessToken) {//Rebajar            
        System.debug(info);
        Map<string,Object> currentInfo = (Map<string,Object>)JSON.deserializeUntyped(info);
        long idOficina =(long)currentInfo.get('idOficina');
        long idPuesto = (long)currentInfo.get('idPuesto');
        long idUsuario = (long)currentInfo.get('idUsuario');
        long idServicio =(long)currentInfo.get('idServicio');
        string accessToken = (string)currentInfo.get('accessToken');
        
        system.debug('idOficina ' +  idOficina);
        system.debug('idPuesto ' +  idPuesto);
        system.debug('idUsuario ' +  idUsuario);
        system.debug('idServicio ' +  idServicio);
        //system.debug('accessToken ' +  accessToken);
        
        
        system.debug(idServicio);
        HttpRequest request = new HttpRequest();
        HttpResponse response = new HttpResponse();
        QSF_Quenda_WS__c urlCS = QSF_Quenda_WS__c.getValues('QuendaWS');
        String url = urlCS.WS_URL__c;
        String newurl = url + '/quenda/rest/citasService/getTurnosPendientes/?idOficina='+idOficina+'&idPuesto='+idPuesto+'&idUsuario='+idUsuario+'&idServicio='+idServicio;
        request.setEndpoint(newurl);
        request.setMethod('GET');
        request.setHeader('Content-Type', 'application/json;charset=UTF-8');
        request.setHeader('Authorization', accessToken);
        
        try{
            // System.debug('Hora de llamada getUnattendedShiftListWS: ' + DateTime.now());
            response = new Http().send(request);
            // System.debug('Hora de respuesta getUnattendedShiftListWS: ' + DateTime.now());
            
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
* @Description		Obtenemos la LISTA de estados de NO ATENCION (GET 1.1.6).
* @param 			idioma
* @return 			LISTA de estados de NO ATENCION 
* @Version			V0.1
*/ 
    public static HttpResponse getNoAttentionStatusListWS(string info) {
        
        Map<string,Object> currentInfo = (Map<string,Object>)JSON.deserializeUntyped(info);
        long idOficina =(long)currentInfo.get('idOficina');
        long idPuesto = (long)currentInfo.get('idPuesto');
        long idUsuario = (long)currentInfo.get('idUsuario');
        string accessToken = (string)currentInfo.get('accessToken');
        
        HttpRequest request = new HttpRequest();
        HttpResponse response = new HttpResponse();
       // integer idiomaAux = (integer)idioma;
        QSF_Quenda_WS__c urlCS = QSF_Quenda_WS__c.getValues('QuendaWS');
        system.debug('Estados de no atención');
		//system.debug(idioma);        
        String url = urlCS.WS_URL__c;
        //String newurl = url + '/quenda/rest/puestosService/getEstadosNoAtencion/?idioma='+idiomaAux;
        string newurl = url + '/quenda/rest/puestosService/getEstadosNoAtencion/?idOficina='+idOficina+'&idUsuario='+idUsuario+'&idPuesto='+idPuesto;
        system.debug(newurl);
        //String newurl = url + '/quenda/rest/puestosService/getEstadosNoAtencion/?idioma=1';
        request.setEndpoint(newurl);
        request.setMethod('GET');
        request.setHeader('Content-Type', 'application/json;charset=UTF-8');
        request.setHeader('Authorization', accessToken);
        
        try{
            // System.debug('Hora de llamada getNoAttentionStatusListWS: ' + DateTime.now());
            response = new Http().send(request);
            // System.debug('Hora de respuesta getNoAttentionStatusListWS: ' +DateTime.now());
            
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
* Obtenemos la LISTA de estados de NO ATENCION (GET).
* @author Raquel Cumplido
* @param Idioma
*/
    /*public static HttpResponse getAvailableServicesByUserWS() {
HttpRequest request = new HttpRequest();
String newurl ='http://proyectos.plexus.es/QUENDADEMOENEL/rest/serviciosService/getServicios/?tipo=DISPONIBLES_USUARIO&idPuesto=1&idOficina=33&idUsuario=8&idioma=1';
request.setEndpoint(newurl);
request.setMethod('GET');
request.setHeader('Content-Type', 'application/json;charset=UTF-8');
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