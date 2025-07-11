/*
*========================================================================================================
* @ClassName		B2C_ConsultAccountSVEControllerTest
* @Description		Test Class for B2C_ConsultAccountSVEController
* @Author			RCV y RMCD
* @Email			rcasal@ayesa.com, rmcumplido@ayesa.com
* @Vendor			Ayesa
* @Version			V0.1
* @DateCreated		2017/09/26
* @LastChange		2019/02/13	
*========================================================================================================
*/ 
@IsTest(SeeAllData=false) 
private class QSF_Shift_Management_Controller_Test {
    
    /*
* @Author			RCV y RMCD
* @Email			rcasal@ayesa.com, rmcumplido@ayesa.com
* @Vendor			Ayesa
* @Description		Test para el método getCurrentUser que obtiene la información del usuario logueado.
* @Version			V0.1
*/
    @isTest static void testGetCurrentUser(){
        Test.startTest();
        Id currentUserId = UserInfo.getUserId();
        User currentUser = QSF_Shift_Management_Controller.getCurrentUser();
        System.assertEquals(currentUserId, currentUser.Id);
        Test.stopTest();
    }
    
    /*
* @Author			RCV y RMCD
* @Email			rcasal@ayesa.com, rmcumplido@ayesa.com
* @Vendor			Ayesa
* @Description		Test para el método getCurrentUserWithLastLoginDate
* @Version			V0.1
*/
    @isTest static void testGetCurrentUserWithLastLoginDate(){
        Id currentUserId = UserInfo.getUserId();
        User cU = [SELECT Id, QSF_LastLoginDate__c
                   FROM User WHERE Id = :currentUserId];
        Datetime oldDateTime = cU.QSF_LastLoginDate__c;
        if (cU.QSF_LastLoginDate__c==null){ 
            cU.QSF_LastLoginDate__c=Datetime.now().addDays(-2);
            update cU;
        }
        User currentUser = QSF_Shift_Management_Controller.getCurrentUser();
        cU.QSF_LastLoginDate__c= oldDateTime;
        update cU;
        System.assertEquals(oldDateTime, cU.QSF_LastLoginDate__c);
    }
    
    /*
* @Author			RCV y RMCD
* @Email			rcasal@ayesa.com, rmcumplido@ayesa.com
* @Vendor			Ayesa
* @Description		Test para el método isQuendaUser que comprueba la existencia de permisos de tipo Quenda.
* @Version			V0.1
*/
    @isTest static void testIsQuendaUser(){
        Id currentUserId = UserInfo.getUserId();
        List<SetupEntityAccess> idPermisos = [SELECT SetupEntityId, parent.Name
                                              FROM SetupEntityAccess 
                                              WHERE SetupEntityType='CustomPermission' 
                                              AND ParentId IN (SELECT PermissionSetId 
                                                               FROM PermissionSetAssignment 
                                                               WHERE AssigneeId =:currentUserId)
                                              AND Parent.Name like 'QSF_%'];
        Boolean answer = false ;
        if(idPermisos.size()>0){
            answer=true;
        }
        Boolean quendaUser = QSF_Shift_Management_Controller.isQuendaUser();
        System.assertEquals(answer, quendaUser);
    }
    
    /*
* @Author			RCV y RMCD
* @Email			rcasal@ayesa.com, rmcumplido@ayesa.com
* @Vendor			Ayesa
* @Description		Test para el método deleteUserPlaceInfo
* @Version			V0.1
*/
    @isTest static void testDeleteUserPlaceInfo(){
        Id currentUserId = UserInfo.getUserId();
        User currentUser1 = [SELECT Id, Name, FirstName, LastName, Username,
                             QSF_Office__c, QSF_Place__c, QSF_LastLoginDate__c, QSF_Place_Id__c,
                             QSF_Office_Id__c, QSF_Quenda_User_Id__c
                             FROM User WHERE Id = :currentUserId];
        currentUser1.QSF_Place__c = 'QSF_Place__c 1';
        Object currentUserAux = QSF_Shift_Management_Controller.deleteUserPlaceInfo(currentUser1);
        
        User currentUser2 = [SELECT Id, QSF_Place__c, QSF_Place_Id__c FROM User WHERE Id = :currentUserId];
        
        System.assertNotEquals(currentUser1.QSF_Place__c, currentUser2.QSF_Place__c);
    }
    
    /*
* @Author			RCV y RMCD
* @Email			rcasal@ayesa.com, rmcumplido@ayesa.com
* @Vendor			Ayesa
* @Description		Test para el método deleteUserPlaceInfo
* @Version			V0.1
*/
    @isTest static void testCalculateAttentionTime(){
        string ticket='{"idCita":3372,"codTicket":"R006","idServicio":36,"servicio":"Otros Motivos","fechaAtencion":"2019-03-01 08:45:27.0","fechaCreacion":"2019-03-01 08:45:27.0","fechaCita":"2019-03-01 08:45:27.0","tipoDocumento":"RUT","documento":"17606917-1","Nombre":"","Apellidos":" ","idInteraccion":"a081X0000010vpJQAQ","idTipoCita":2,"idAudio":"2663","atencionSinTransito":true,"tiempoMaxSinTransito":0,"fechaAtencionSinTransito":"2019-03-01 08:45:27.0"}';
        Interaction__c currentInter= new Interaction__c();
        currentInter.StartDate__c= DateTime.now();
        currentInter.Call_Date__c=DateTime.now();
        currentInter.AttentionTime__c= 'Atención sin ticket';
        currentInter.TicketNumber__c = 'ST001';
        insert currentInter;
        string IdInteraction=currentInter.id;
        string calculateTime = QSF_Shift_Management_Controller.calculateAttentionTime(IdInteraction,ticket);
        
    }
    
    /*
* @Author			RCV y RMCD
* @Email			rcasal@ayesa.com, rmcumplido@ayesa.com
* @Vendor			Ayesa
* @Description		Test para el método getFreeWorkplaces que obtiene la lista de puestos disponibles.
* @Version			V0.1
*/
    @isTest static void testGetFreeWorkplaces(){
        User currentUser = QSF_Shift_Management_Controller.getCurrentUser();
        insert new QSF_Quenda_WS__c(Name= 'QuendaWS' ,Record_URL__c = 'https://quendapre.enel.com', WS_URL__c= 'https://sfquendapre.enel.com');
        SingleRequestMock fakeResponse = new SingleRequestMock(200,
                                                               'Complete',
                                                               '{"message":"OK","success":true,"data":[{"id":1,"nombre":"Puesto 1"},{"id":21,"nombre":"Puesto 2"}]}',
                                                               null);
        string accessToken = 'UXVlbmRhV1MxNTE2MTc2NTgzNTQzMC4yMDY2ODExMTA1NTI4NTc4Nw==';
        Test.setMock(HttpCalloutMock.class, fakeResponse);
        // Call the method that invokes a callout
        Test.startTest();
        Map<string,Object> places = (Map<String,Object>)QSF_Shift_Management_Controller.getFreeWorkplaces(currentUser, accessToken);
        System.assertEquals('{data=({id=1, nombre=Puesto 1}, {id=21, nombre=Puesto 2}), message=OK, success=true}', String.valueOf(places));
        Test.stopTest();
        // Call the method that invokes a callout
    }
    
    /*
* @Author			RCV y RMCD
* @Email			rcasal@ayesa.com, rmcumplido@ayesa.com
* @Vendor			Ayesa
* @Description		Test para el método updateUserLocation donde actualizamos la oficina, puesto y fecha de inicio de sesión del usuario logueado.
* @Version			V0.1
*/
    @isTest static void testUpdateUserLocation () {
        User currentUser = QSF_Shift_Management_Controller.getCurrentUser();
        insert new QSF_Quenda_WS__c(Name= 'QuendaWS' ,Record_URL__c = 'https://quendapre.enel.com', WS_URL__c= 'https://sfquendapre.enel.com');
        String loginInfo = '{"idOficina":1,"tiempoRellamadaAutomatica":"2000","idCita":162,"servicio":"Atención sin ticket","codTicket":"ST023","fechaAtencion":"2017-12-14 14:14:14.0","DNI":"","numTurnosPendientes":0,"idInteraccion":"a082F000000iZcUQAU"}';
        User res = QSF_Shift_Management_Controller.updateUserLocation (currentUser, '{"id":1,"nombre":"1"}', loginInfo);
        System.assertEquals(1, res.QSF_Place_Id__c);
    }
    
    /*
* @Author			RCV y RMCD
* @Email			rcasal@ayesa.com, rmcumplido@ayesa.com
* @Vendor			Ayesa
* @Description		Test para el método updateInteraction donde se ACTUALIZA una INTERACCIÓN cuando se concluye una atención.
* @Version			V0.1
*/
    @isTest static void testUpdateInteraction () {
        User currentUser = QSF_Shift_Management_Controller.getCurrentUser();
        Interaction__c currentInter= new Interaction__c();
        currentInter.Office__c= currentUser.QSF_Office__c;
        currentInter.StartDate__c= DateTime.now();
        currentInter.AttentionTime__c= 'Atención sin ticket';
        currentInter.TicketNumber__c = 'ST001';
        insert currentInter;
        insert new QSF_Quenda_WS__c(Name= 'QuendaWS' ,Record_URL__c = 'https://quendapre.enel.com', WS_URL__c= 'https://sfquendapre.enel.com');
        String SticketInfo = '{"servicio":"Trámite 1", "atencionSinTransito": true, "idCita":122,"idAudio":"1111","codTicket":"AA000","fechaAtencion":"2017-12-15 06:15:54.0","DNI":"","idInteraccion":"'+ currentInter.Id +'"}';
        Interaction__c inct1 = QSF_Shift_Management_Controller.updateInteraction (currentUser,  'nextCall', SticketInfo,'10:10:10');
        Interaction__c inct2 = QSF_Shift_Management_Controller.updateInteraction (currentUser, 'finish&Pause', SticketInfo, '10:10:10');
        Interaction__c inct3 = QSF_Shift_Management_Controller.updateInteraction (currentUser,  'absent', SticketInfo,'10:10:10');
        Interaction__c inct4 = QSF_Shift_Management_Controller.updateInteraction (currentUser,  'forwarding', SticketInfo,'10:10:10');
        Interaction__c inct5 = QSF_Shift_Management_Controller.updateInteraction (currentUser,  'noTicket', SticketInfo,'10:10:10');
        Interaction__c inct6 = QSF_Shift_Management_Controller.updateInteraction (currentUser,  'quickAttention', SticketInfo,'10:10:10');
        System.assertEquals(currentInter.TicketNumber__c, inct1.TicketNumber__c);
    }
    
    /*
* @Author			RCV y RMCD
* @Email			rcasal@ayesa.com, rmcumplido@ayesa.com
* @Vendor			Ayesa
* @Description		Test para el método getServiceList donde obtenemos la lista de SERVICIOS disponibles segun variable TIPO previa llamada a WS
* @Version			V0.1
*/
    @isTest static void testGetServiceList() {
        string json = '{"tipo": "tipo","idOficina":2131231,"idPuesto":99989898,"idUsuario":666555,"idioma":1,"idServicio": 8888,"idSelectedService": 8888,"idPlace": 8888,"idCita": 8888,"idServicioDestino": 8888,"idPuestoDestino": 8888,"segundosRetraso": 8,"idCita": 8888,"username": 8888,"logout": "true","accessToken":"sadafafaweferwfawrfergerg"}';
        User currentUser = QSF_Shift_Management_Controller.getCurrentUser();
        String tipo = 'DISPONIBLES_USUARIO';
        insert new QSF_Quenda_WS__c(Name= 'QuendaWS' ,Record_URL__c = 'https://quendapre.enel.com', WS_URL__c= 'https://sfquendapre.enel.com');        
        SingleRequestMock fakeResponse = new SingleRequestMock(200,
                                                               'Complete',
                                                               '{"message":"OK","success":true,"data":[{"id":1,"nombre":"Atención Sin Ticket"},{"id": 6,"nombre":"Cita Extra"},{"id": 2,"nombre":"Cita normal"}]}',
                                                               null);
        string accessToken = 'UXVlbmRhV1MxNTE2MTc2NTgzNTQzMC4yMDY2ODExMTA1NTI4NTc4Nw==';
        Test.setMock(HttpCalloutMock.class, fakeResponse);
        Test.startTest();
        //Map<string,Object> services = (Map<String,Object>)QSF_Shift_Management_Controller.getServiceList(tipo, currentUser, '2', accessToken);
        Map<string,Object> services = (Map<String,Object>)QSF_Shift_Management_Controller.getServiceList(json);
        System.debug('Services');
        System.debug(services);
        System.assertEquals('{data=({id=1, nombre=Atención Sin Ticket}, {id=6, nombre=Cita Extra}, {id=2, nombre=Cita normal}), message=OK, success=true}', String.valueOf(services));
        Test.stopTest();
    }
    
    /*
* @Author			RCV y RMCD
* @Email			rcasal@ayesa.com, rmcumplido@ayesa.com
* @Vendor			Ayesa
* @Description		Test para el método getForwardingPlaceList donde obtenemos la lista de PUESTOS disponibles para REENVIO previa llamada a WS (GET 1.1.3)
* @Version			V0.1
*/
    @isTest static void testGetForwardingPlaceList() {
        string json = '{"tipo": "tipo","idOficina":2131231,"idPuesto":99989898,"idUsuario":666555,"idioma":1,"idServicio": 8888,"idSelectedService": 8888,"idPlace": 8888,"idCita": 8888,"idServicioDestino": 8888,"idPuestoDestino": 8888,"segundosRetraso": 8,"idCita": 8888,"username": 8888,"logout": "true","accessToken":"sadafafaweferwfawrfergerg"}';
        User currentUser = QSF_Shift_Management_Controller.getCurrentUser();
        long idServiceSelected = 1;
        insert new QSF_Quenda_WS__c(Name= 'QuendaWS' ,Record_URL__c = 'https://quendapre.enel.com', WS_URL__c= 'https://sfquendapre.enel.com');
        SingleRequestMock fakeResponse = new SingleRequestMock(200,
                                                               'Complete',
                                                               '{"message":"OK","success":true,"data":[{"id": 1,"nombre": "1"},{"id": 21,"nombre": "Puesto 2"}]}',
                                                               null);
        string accessToken = 'UXVlbmRhV1MxNTE2MTc2NTgzNTQzMC4yMDY2ODExMTA1NTI4NTc4Nw==';
        Test.setMock(HttpCalloutMock.class, fakeResponse);
        Test.startTest();
        //Map<string,Object> datos = (Map<String,Object>)QSF_Shift_Management_Controller.getForwardingPlaceList(currentUser, idServiceSelected, accessToken);
        Map<string,Object> datos = (Map<String,Object>)QSF_Shift_Management_Controller.getForwardingPlaceList(json);
        System.assertEquals('{data=({id=1, nombre=1}, {id=21, nombre=Puesto 2}), message=OK, success=true}', String.valueOf(datos));
        Test.stopTest();
    }
    
    /*
* @Author			RCV y RMCD
* @Email			rcasal@ayesa.com, rmcumplido@ayesa.com
* @Vendor			Ayesa
* @Description		Test para el método getUnattendedShiftNumber donde obtenemos el NÚMERO de turnos pendientes previa llamada a WS (GET 1.1.4)
* @Version			V0.1
*/
    @isTest static void testGetUnattendedShiftNumber() {
        string json = '{"tipo": "tipo","idOficina":2131231,"idPuesto":99989898,"idUsuario":666555,"idioma":1,"idServicio": 8888,"idSelectedService": 8888,"idPlace": 8888,"idCita": 8888,"idServicioDestino": 8888,"idPuestoDestino": 8888,"segundosRetraso": 8,"idCita": 8888,"username": 8888,"logout": "true","accessToken":"sadafafaweferwfawrfergerg"}';
        User currentUser = QSF_Shift_Management_Controller.getCurrentUser();
        long idServiceSelected = 1;
        insert new QSF_Quenda_WS__c(Name= 'QuendaWS' ,Record_URL__c = 'https://quendapre.enel.com', WS_URL__c= 'https://sfquendapre.enel.com');
        SingleRequestMock fakeResponse = new SingleRequestMock(200,
                                                               'Complete',
                                                               '{"message":"OK","success":true,"data":{"numTurnosPendientes":0}}',
                                                               null);
        string accessToken = 'UXVlbmRhV1MxNTE2MTc2NTgzNTQzMC4yMDY2ODExMTA1NTI4NTc4Nw==';
        Test.setMock(HttpCalloutMock.class, fakeResponse);
        Test.startTest();
        //Object lst = QSF_Shift_Management_Controller.getUnattendedShiftNumber(currentUser, idServiceSelected, accessToken);
        Object lst = QSF_Shift_Management_Controller.getUnattendedShiftNumber(json);
        System.assertEquals('{data={numTurnosPendientes=0}, message=OK, success=true}', String.valueOf(lst));
        Test.stopTest();
        
    }
    
    /*
* @Author			RCV y RMCD
* @Email			rcasal@ayesa.com, rmcumplido@ayesa.com
* @Vendor			Ayesa
* @Description		Test para el método getUnattendedShiftList donde obtenemos la LISTA de citas pendientes POR PUESTO previa llamada a WS (GET 1.1.5)
* @Version			V0.1
*/
    @isTest static void testGetUnattendedShiftList() {
        string json = '{"tipo": "tipo","idOficina":2131231,"idPuesto":99989898,"idUsuario":666555,"idioma":1,"idServicio": 8888,"idSelectedService": 8888,"idPlace": 8888,"idCita": 8888,"idServicioDestino": 8888,"idPuestoDestino": 8888,"segundosRetraso": 8,"idCita": 8888,"username": 8888,"logout": "true","accessToken":"sadafafaweferwfawrfergerg"}';
        User currentUser = QSF_Shift_Management_Controller.getCurrentUser();
        long idServiceSelected = 1;
        insert new QSF_Quenda_WS__c(Name= 'QuendaWS' ,Record_URL__c = 'https://quendapre.enel.com', WS_URL__c= 'https://sfquendapre.enel.com');
        SingleRequestMock fakeResponse = new SingleRequestMock(200,
                                                               'Complete',
                                                               '{"message":"OK","success":true,"data":[]}',
                                                               null);
        string accessToken = 'UXVlbmRhV1MxNTE2MTc2NTgzNTQzMC4yMDY2ODExMTA1NTI4NTc4Nw==';
        Test.setMock(HttpCalloutMock.class, fakeResponse);
        Test.startTest();
        //Map<string,Object> datos=(Map<String,Object>)QSF_Shift_Management_Controller.getUnattendedShiftList(currentUser, idServiceSelected, accessToken);
        Map<string,Object> datos=(Map<String,Object>)QSF_Shift_Management_Controller.getUnattendedShiftList(json);
        System.assertEquals('{data=(), message=OK, success=true}', String.valueOf(datos));
        Test.stopTest();
    }
    
    /*
* @Author			RCV y RMCD
* @Email			rcasal@ayesa.com, rmcumplido@ayesa.com
* @Vendor			Ayesa
* @Description		Test para el método getNoAttentionStatusList donde obtenemos la lista de estados de NO ATENCION previa llamada a WS (GET 1.1.6)
* @Version			V0.14
*/
    @isTest static void testGetNoAttentionStatusList() {
        string json = '{"idOficina":2131231,"idPuesto":99989898,"idUsuario":666555,"accessToken":"sadafafaweferwfawrfergerg"}';
        SingleRequestMock fakeResponse = new SingleRequestMock(200,
                                                               'Complete',
                                                               '{"message":"OK","success":true,"data":"Estado no atención 1"}',
                                                               null);
        insert new QSF_Quenda_WS__c(Name= 'QuendaWS' ,Record_URL__c = 'https://quendapre.enel.com', WS_URL__c= 'https://sfquendapre.enel.com');
        string accessToken = 'UXVlbmRhV1MxNTE2MTc2NTgzNTQzMC4yMDY2ODExMTA1NTI4NTc4Nw==';
        Test.setMock(HttpCalloutMock.class, fakeResponse);
        Test.startTest();
        Map<string,Object> datos=(Map<String,Object>)QSF_Shift_Management_Controller.getNoAttentionStatusList(json);
        System.assertEquals('{data=Estado no atención 1, message=OK, success=true}', String.valueOf(datos));
        Test.stopTest();
    }
    
    /*
* @Author			RCV y RMCD
* @Email			rcasal@ayesa.com, rmcumplido@ayesa.com
* @Vendor			Ayesa
* @Description		Test para el método putSelectedPlace donde se registra el PUESTO seleccionado por el usuario (PUT 1.2.1).
* @Version			V0.1
*/
    @isTest static void testPutSelectedPlace() {
        string json = '{"tipo": "tipo","idOficina":2131231,"idPuesto":99989898,"idUsuario":666555,"idioma":1,"idServicio": 8888,"idSelectedService": 8888,"idPlace": 8888,"idCita": 8888,"idServicioDestino": 8888,"idPuestoDestino": 8888,"segundosRetraso": 8,"idCita": 8888,"username": "8888","logout": "true","accessToken":"sadafafaweferwfawrfergerg"}';
        User currentUser = QSF_Shift_Management_Controller.getCurrentUser();
        String idPlace = '{"id":1,"nombre":"1"}';
        insert new QSF_Quenda_WS__c(Name= 'QuendaWS' ,Record_URL__c = 'https://quendapre.enel.com', WS_URL__c= 'https://sfquendapre.enel.com');
        SingleRequestMock fakeResponse = new SingleRequestMock(200,
                                                               'Complete',
                                                               '{"message":"OK","success":true,"data":{"idOficina":33,"tiempoRellamadaAutomatica":"2000","idCita":120,"servicio":"Atención sin ticket","codTicket":"ST001","fechaAtencion":"2017-11-20 09:56:34.0","DNI":"","numTurnosPendientes":0}}',
                                                               null);
        string accessToken ='UXVlbmRhV1MxNTE2MTc2NTgzNTQzMC4yMDY2ODExMTA1NTI4NTc4Nw==';
        Test.setMock(HttpCalloutMock.class, fakeResponse);
        Test.startTest();
        //Map<string,Object> obj = (Map<String,Object>)QSF_Shift_Management_Controller.putSelectedPlace(currentUser, idPlace, 'true', accessToken);
        Map<string,Object> obj = (Map<String,Object>)QSF_Shift_Management_Controller.putSelectedPlace(json);
        System.assertEquals('{data={DNI=, codTicket=ST001, fechaAtencion=2017-11-20 09:56:34.0, idCita=120, idOficina=33, numTurnosPendientes=0, servicio=Atención sin ticket, tiempoRellamadaAutomatica=2000}, message=OK, success=true}', String.valueOf(obj));
        Test.stopTest();
    }
    
    /*
* @Author			RCV y RMCD
* @Email			rcasal@ayesa.com, rmcumplido@ayesa.com
* @Vendor			Ayesa
* @Description		Test para el método putNextTicket que devuelve los datos del siguiente ticket a llamar  (PUT 1.2.2).
* @Version			V0.1
*/
    @isTest static void testPutNextTicket() {
        string json = '{"tipo": "tipo","idOficina":2131231,"idPuesto":99989898,"idUsuario":666555,"idioma":1,"idServicio": 8888,"idSelectedService": 8888,"idPlace": 8888,"idCita": 8888,"idServicioDestino": 8888,"idPuestoDestino": 8888,"segundosRetraso": 8,"idCita": 8888,"username": 8888,"logout": "true","accessToken":"sadafafaweferwfawrfergerg"}';
        User currentUser = QSF_Shift_Management_Controller.getCurrentUser();
        long idServicio = 0;
        long idCita= 1;
        Integer idioma = 1;
        insert new QSF_Quenda_WS__c(Name= 'QuendaWS' ,Record_URL__c = 'https://quendapre.enel.com', WS_URL__c= 'https://sfquendapre.enel.com');
        SingleRequestMock fakeResponse = new SingleRequestMock(200,
                                                               'Complete',
                                                               '{"message":"OK","success":true,"data":{"servicio":"","idCita":-1,"identificadorAudio":0,"codTicket":"","fechaAtencion":"","DNI":""}}',
                                                               null);
        string accessToken = 'UXVlbmRhV1MxNTE2MTc2NTgzNTQzMC4yMDY2ODExMTA1NTI4NTc4Nw==';
        Test.setMock(HttpCalloutMock.class, fakeResponse);
        Test.startTest();
        //Map<string,Object> datos=(Map<String,Object>)QSF_Shift_Management_Controller.putNextTicket(currentUser, idServicio, idCita, idioma, accessToken);
        Map<string,Object> datos=(Map<String,Object>)QSF_Shift_Management_Controller.putNextTicket(json);
        System.assertEquals('{HTTPCode=200, HTTPStatus=Complete, data={DNI=, codTicket=, fechaAtencion=, idCita=-1, identificadorAudio=0, servicio=}, message=OK, success=true}', String.valueOf(datos));
        
        Test.stopTest();
    } 
    
    /*
* @Author			RCV y RMCD
* @Email			rcasal@ayesa.com, rmcumplido@ayesa.com
* @Vendor			Ayesa
* @Description		Test para el método putNextNoTicket que devuelve los datos de una cliente/atención sin ticket  (PUT 1.2.3).
* @Version			V0.1
*/
    @isTest static void testPutNextNoTicket() {
        string json = '{"tipo": "tipo","idOficina":2131231,"idPuesto":99989898,"idUsuario":666555,"idioma":1,"idServicio": 8888,"idSelectedService": 8888,"idPlace": 8888,"idCita": 8888,"idServicioDestino": 8888,"idPuestoDestino": 8888,"segundosRetraso": 8,"idCita": 8888,"username": 8888,"logout": "true","accessToken":"sadafafaweferwfawrfergerg","localTimeString":"10:10:10"}';
        User currentUser = QSF_Shift_Management_Controller.getCurrentUser();
        Integer idioma = 1;
        long idServicio = 0;
        insert new QSF_Quenda_WS__c(Name= 'QuendaWS' ,Record_URL__c = 'https://quendapre.enel.com', WS_URL__c= 'https://sfquendapre.enel.com');
        SingleRequestMock fakeResponse = new SingleRequestMock(200,
                                                               'Complete',
                                                               '{"message":"OK","success":true,"data":{"idCita": 162,"codTicket": "ST001","idServicio": 41,"servicio": "AtenciÃ³n sin ticket","fechaAtencion": "2018-04-02 07:15:20.0","fechaCreacion": "2018-04-02 07:15:19.0","fechaCita": "2018-04-02 07:15:19.0","tipoDocumento": "","documento": "","Nombre": "","Apellidos": " ","idInteraccion": "a082F000008LcGHQA0","idTipoCita": 4,"idAudio": "11"}}',
                                                               null);
        string accessToken = 'UXVlbmRhV1MxNTE2MTc2NTgzNTQzMC4yMDY2ODExMTA1NTI4NTc4Nw==';
        Test.setMock(HttpCalloutMock.class, fakeResponse);
        Test.startTest();
        //Map<string,Object> datos=(Map<String,Object>)QSF_Shift_Management_Controller.putNextNoTicket(currentUser, idioma, idServicio, accessToken,'10:10:10');
        Map<string,Object> datos=(Map<String,Object>)QSF_Shift_Management_Controller.putNextNoTicket(json);
        System.assertEquals('{data={Apellidos= , Nombre=, codTicket=ST001, documento=, fechaAtencion=2018-04-02 07:15:20.0, fechaCita=2018-04-02 07:15:19.0, fechaCreacion=2018-04-02 07:15:19.0, idAudio=11, idCita=162, idInteraccion=a082F000008LcGHQA0, ...}, message=OK, success=true}', String.valueOf(datos));
        Test.stopTest();
    }
    
    /*
* @Author			RCV y RMCD
* @Email			rcasal@ayesa.com, rmcumplido@ayesa.com
* @Vendor			Ayesa
* @Description		Test para el método putFinishTicketAndPause para la finalizacion de cita y puesta en espera(pause)  (PUT 1.2.4).
* @Version			V0.1
*/
    @isTest static void testPutFinishTicketAndPause() {
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
        insert newInter;

        string json = '{"tipo": "tipo","idOficina":2131231,"idInteraction":"'+newInter.Id+'", "idPuesto":99989898,"idUsuario":666555,"idioma":1,"idServicio": 8888,"idSelectedService": 8888,"idPlace": 8888,"idCita": 8888,"idServicioDestino": 8888,"idPuestoDestino": 8888,"segundosRetraso": 8,"idCita": 8888,"username": 8888,"logout": "true","accessToken":"sadafafaweferwfawrfergerg"}';
        User currentUser = QSF_Shift_Management_Controller.getCurrentUser();
        SingleRequestMock fakeResponse = new SingleRequestMock(200,
                                                               'Complete',
                                                               '{"message":"OK","success":true,"data":{"Resultado":"OK"}}',
                                                               null);
        long idCita= 1;
        insert new QSF_Quenda_WS__c(Name= 'QuendaWS' ,Record_URL__c = 'https://quendapre.enel.com', WS_URL__c= 'https://sfquendapre.enel.com');
        string ticketInfo = '{"servicio":"Trámite 1","idCita":122,"identificadorAudio":1111,"codTicket":"AA000","fechaAtencion":"2017-12-15 06:15:54.0","DNI":"","idInteraccion":"a082F000000iZK9QAM"}';
        string accessToken = 'UXVlbmRhV1MxNTE2MTc2NTgzNTQzMC4yMDY2ODExMTA1NTI4NTc4Nw==';
        Test.setMock(HttpCalloutMock.class, fakeResponse);
        Test.startTest();
        //Map<string,Object> datos=(Map<String,Object>)QSF_Shift_Management_Controller.putFinishTicketAndPause(currentUser, idCita, accessToken);
        Map<string,Object> datos=(Map<String,Object>)QSF_Shift_Management_Controller.putFinishTicketAndPause(json);
        System.assertEquals('{data={Resultado=OK}, message=OK, success=true}', String.valueOf(datos));
        Test.stopTest();
    }    
    
    /*
* @Author			RCV y RMCD
* @Email			rcasal@ayesa.com, rmcumplido@ayesa.com
* @Vendor			Ayesa
* @Description		Test para el método putFinishTicketAndNext para la finalizacion de cita y llamada de la siguiente  (PUT 1.2.5).
* @Version			V0.1
*/
    @isTest static void testPutFinishTicketAndNext() {
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
        insert newInter;
        
        string json = '{"tipo": "tipo","idOficina":2131231,"idPuesto":99989898,"idInteraction":"'+newInter.Id+'","idUsuario":666555,"idioma":1,"idServicio": 8888,"idSelectedService": 8888,"idPlace": 8888,"idCita": 8888,"idServicioDestino": 8888,"idPuestoDestino": 8888,"segundosRetraso": 8,"idCita": 8888,"username": 8888,"logout": "true","accessToken":"sadafafaweferwfawrfergerg"}';
        User currentUser = QSF_Shift_Management_Controller.getCurrentUser();
        SingleRequestMock fakeResponse = new SingleRequestMock(200,
                                                               'Complete',
                                                               '{"message":"OK","success":true,"data":{"servicio":"","idCita":-1,"identificadorAudio":1111,"codTicket":"","fechaAtencion":"","DNI":""}}',
                                                               null);
        insert new QSF_Quenda_WS__c(Name= 'QuendaWS' ,Record_URL__c = 'https://quendapre.enel.com', WS_URL__c= 'https://sfquendapre.enel.com');
        string ticketInfo = '{"servicio":"Trámite 1","idCita":122,"identificadorAudio":1111,"codTicket":"AA000","fechaAtencion":"2017-12-15 06:15:54.0","DNI":"","idInteraccion":"a082F000000iZK9QAM"}';
        string accessToken = 'UXVlbmRhV1MxNTE2MTc2NTgzNTQzMC4yMDY2ODExMTA1NTI4NTc4Nw==';
        Test.setMock(HttpCalloutMock.class, fakeResponse);
        Test.startTest();
        //Object obj = QSF_Shift_Management_Controller.putFinishTicketAndNext(currentUser, ticketInfo, 0, accessToken);
        Object obj = QSF_Shift_Management_Controller.putFinishTicketAndNext(json);
        System.assertEquals('{data={DNI=, codTicket=, fechaAtencion=, idCita=-1, identificadorAudio=1111, servicio=}, message=OK, success=true}', String.valueOf(obj));
        Test.stopTest();
    }    
    
    /*
* @Author			RCV y RMCD
* @Email			rcasal@ayesa.com, rmcumplido@ayesa.com
* @Vendor			Ayesa
* @Description		Test para el método putAbsentClient para marcar cita como "cliente AUSENTE/NO ACUDE"  (PUT 1.2.6).
* @Version			V0.1
*/
    @isTest static void testPutAbsentClient() {
        string json = '{"tipo": "tipo","idOficina":2131231,"idPuesto":99989898,"idUsuario":666555,"idioma":1,"idServicio": 8888,"idSelectedService": 8888,"idPlace": 8888,"idCita": 8888,"idServicioDestino": 8888,"idPuestoDestino": 8888,"segundosRetraso": 8,"idCita": 8888,"username": 8888,"logout": "true","accessToken":"sadafafaweferwfawrfergerg"}';
        User currentUser = QSF_Shift_Management_Controller.getCurrentUser();
        SingleRequestMock fakeResponse = new SingleRequestMock(200,
                                                               'Complete',
                                                               '{"message":"OK","success":true,"data":{"Resultado":"OK"}}',
                                                               null);
        long idCita= 1;
        insert new QSF_Quenda_WS__c(Name= 'QuendaWS' ,Record_URL__c = 'https://quendapre.enel.com', WS_URL__c= 'https://sfquendapre.enel.com');
        string ticketInfo = '{"servicio":"Trámite 1","idCita":122,"identificadorAudio":1111,"codTicket":"AA000","fechaAtencion":"2017-12-15 06:15:54.0","DNI":"","idInteraccion":"a082F000000iZK9QAM"}';
        string accessToken = 'UXVlbmRhV1MxNTE2MTc2NTgzNTQzMC4yMDY2ODExMTA1NTI4NTc4Nw==';
        Test.setMock(HttpCalloutMock.class, fakeResponse);
        Test.startTest();
        //Map<string,Object> datos=(Map<String,Object>)QSF_Shift_Management_Controller.putAbsentClient(currentUser,idCita,accessToken);
        Map<string,Object> datos=(Map<String,Object>)QSF_Shift_Management_Controller.putAbsentClient(json);
        System.assertEquals('{data={Resultado=OK}, message=OK, success=true}', String.valueOf(datos));
        Test.stopTest();
    }
    
    /*
* @Author			RCV y RMCD
* @Email			rcasal@ayesa.com, rmcumplido@ayesa.com
* @Vendor			Ayesa
* @Description		Test para el método putScreenRecall que permite llamar al ticket en la pantalla asociada al PUESTO (PUT 1.2.7) (FALTA EL idPUESTO EN LA DESCRIPCION DEL WS)
* @Version			V0.1
*/
    @isTest static void testPutScreenRecall() {
        string json = '{"tipo": "tipo","idOficina":2131231,"idPuesto":99989898,"idUsuario":666555,"idioma":1,"idServicio": 8888,"idSelectedService": 8888,"idPlace": 8888,"idCita": 8888,"idServicioDestino": 8888,"idPuestoDestino": 8888,"segundosRetraso": 8,"idCita": 8888,"username": 8888,"logout": "true","accessToken":"sadafafaweferwfawrfergerg"}';
        User currentUser = QSF_Shift_Management_Controller.getCurrentUser();
        SingleRequestMock fakeResponse = new SingleRequestMock(200,
                                                               'Complete',
                                                               '{"message":"OK","success":true,"data":{"Resultado":"OK"}}',
                                                               null);
        long idCita= 1;
        insert new QSF_Quenda_WS__c(Name= 'QuendaWS' ,Record_URL__c = 'https://quendapre.enel.com', WS_URL__c= 'https://sfquendapre.enel.com');
        string ticketInfo = '{"servicio":"Trámite 1","idCita":122,"identificadorAudio":1111,"codTicket":"AA000","fechaAtencion":"2017-12-15 06:15:54.0","DNI":"","idInteraccion":"a082F000000iZK9QAM"}';
        string accessToken = 'UXVlbmRhV1MxNTE2MTc2NTgzNTQzMC4yMDY2ODExMTA1NTI4NTc4Nw==';
        Test.setMock(HttpCalloutMock.class, fakeResponse);
        Test.startTest();
        //Map<string,Object> datos=(Map<String,Object>)QSF_Shift_Management_Controller.putScreenRecall(currentUser, idCita, 1, accessToken);
        Map<string,Object> datos=(Map<String,Object>)QSF_Shift_Management_Controller.putScreenRecall(json);
        System.assertEquals('{data={Resultado=OK}, message=OK, success=true}', String.valueOf(datos));
        Test.stopTest();
    }
    
    /*
* @Author			RCV y RMCD
* @Email			rcasal@ayesa.com, rmcumplido@ayesa.com
* @Vendor			Ayesa
* @Description		Test para el método putForwardingTicket que permite REENVIAR el ticket a otro servicio y puesto y retrasarlo X segundos (PUT 1.2.8)
* @Version			V0.1
*/
    @isTest static void testPutForwardingTicket() {
        string json = '{"tipo": "tipo","idOficina":2131231,"idPuesto":99989898,"idUsuario":666555,"idioma":1,"idServicio": 8888,"idSelectedService": 8888,"idPlace": 8888,"idCita": 8888,"idServicioDestino": 8888,"idPuestoDestino": 8888,"segundosRetraso": 8,"idCita": 8888,"username": 8888,"logout": "true","accessToken":"sadafafaweferwfawrfergerg"}';
        User currentUser = QSF_Shift_Management_Controller.getCurrentUser();
        SingleRequestMock fakeResponse = new SingleRequestMock(200,
                                                               'Complete',
                                                               '{"message":"OK","success":true,"data":{"Resultado":"OK"}}',
                                                               null);
        insert new QSF_Quenda_WS__c(Name= 'QuendaWS' ,Record_URL__c = 'https://quendapre.enel.com', WS_URL__c= 'https://sfquendapre.enel.com');
        long idCita= 1;
        string ticketInfo = '{"servicio":"Trámite 1","idCita":122,"identificadorAudio":1111,"codTicket":"AA000","fechaAtencion":"2017-12-15 06:15:54.0","DNI":"","idInteraccion":"a082F000000iZK9QAM"}';
        string accessToken = 'UXVlbmRhV1MxNTE2MTc2NTgzNTQzMC4yMDY2ODExMTA1NTI4NTc4Nw==';
        Test.setMock(HttpCalloutMock.class, fakeResponse);
        Test.startTest();
        //Map<string,Object> datos=(Map<String,Object>)QSF_Shift_Management_Controller.putForwardingTicket(currentUser, idCita,1, 1, 0, 8, accessToken);
        Map<string,Object> datos=(Map<String,Object>)QSF_Shift_Management_Controller.putForwardingTicket(json);
        System.assertEquals('{data={Resultado=OK}, message=OK, success=true}', String.valueOf(datos));
        Test.stopTest();
    }
    
    /*
* @Author			RCV y RMCD
* @Email			rcasal@ayesa.com, rmcumplido@ayesa.com
* @Vendor			Ayesa
* @Description		Test para el método getAccessTokenApex donde se obtiene el TOKEN de acceso (POST).
* @Version			V0.1
*/
    @isTest static void testGetAccessTokenApex() {
        insert new QSF_Quenda_WS__c(Name= 'QuendaWS' ,Record_URL__c = 'https://quendapre.enel.com', WS_URL__c= 'https://sfquendapre.enel.com');
        SingleRequestMock fakeResponse = new SingleRequestMock(200,
                                                               'Complete',
                                                               '{"message":"OK","success":true,"data":{"access_token": "UXVlbmRhV1MxNTE2MTg1MzgzOTM4MC4zNjMzODQ0NjY5OTI5MzYzNg=="}}',
                                                               null);
        Test.setMock(HttpCalloutMock.class, fakeResponse);
        Test.startTest();
        Map<string,Object> datos = (Map<String,Object>)QSF_Shift_Management_Controller.getAccessTokenApex('user','pass');
        System.assertEquals('{data={access_token=UXVlbmRhV1MxNTE2MTg1MzgzOTM4MC4zNjMzODQ0NjY5OTI5MzYzNg==}, message=OK, success=true}', String.valueOf(datos));
        Test.stopTest();
    }
    
    /*
* @Author			RCV y RMCD
* @Email			rcasal@ayesa.com, rmcumplido@ayesa.com
* @Vendor			Ayesa
* @Description		Test para el método getCustomPermission donde se obtienen los permisos.
* @Version			V0.1
*/
    @isTest static void testGetCustomPermission() {
        Test.startTest();
        List<PermissionSet> idpermission = [SELECT Id, Name from PermissionSet where name ='QSF_Simple_Attention'];
        Id currentUserId = UserInfo.getUserId();
        insert new PermissionSetAssignment(AssigneeId = currentUserId, PermissionSetId = idpermission[0].Id );
        List<Boolean> permission = QSF_Shift_Management_Controller.getCustomPermission();
        System.assertEquals(6, permission.size());
        Test.stopTest();
    }
    
    /*
* @Author			RCV y RMCD
* @Email			rcasal@ayesa.com, rmcumplido@ayesa.com
* @Vendor			Ayesa
* @Description		Test para el método testGetCurrentTime.
* @Version			V0.1
*/
    @isTest static void testGetCurrentTime() {
        Test.startTest();
        List<String> myTime = QSF_Shift_Management_Controller.getCurrentTime();
        List<String> myHour = QSF_Shift_Management_Controller.getTimeList('hour');
        List<String> myMinute = QSF_Shift_Management_Controller.getTimeList('minute');
        List<String> myRefresh = QSF_Shift_Management_Controller.getTimeList('refreshMinutes');
        
        Datetime myDateTime = Datetime.now();
        List<String> myListString= new List<String>();
        String aux1 = '0'+string.valueOf(myDateTime.hour());
        myListString.add(aux1.right(2));
        
        for(integer b=1; b<6; b++){
            String aux2 = '0'+string.valueOf((myDateTime.addHours(-b)).hour());
            myListString.add(aux2.right(2));
        }
        system.assertEquals(myListString, myHour);
        Test.stopTest();
    }  
    
    /*
* @Author			RCV y RMCD
* @Email			rcasal@ayesa.com, rmcumplido@ayesa.com
* @Vendor			Ayesa
* @Description		Test para el método getInteractionFields.
* @Version			V0.1
*/
    @isTest static void testGetInteractionFields() {
        
        Test.startTest();
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
        
        insert newInter;
        
        Interaction__c interaction = QSF_Shift_Management_Controller.getInteractionFields(newInter.Id);
        Interaction__c newInterAux =[select toLabel(Reason__c) from Interaction__c where Id = :newInter.Id];
        System.assertEquals(newInterAux.Reason__c, interaction.Reason__c);
        Test.stopTest();
    }
    
    /*
* @Author			RCV y RMCD
* @Email			rcasal@ayesa.com, rmcumplido@ayesa.com
* @Vendor			Ayesa
* @Description		Test para el método updateInteractionNoTransitTimeApex.
* @Version			V0.1
*/
    @isTest static void testUpdateInteractionNoTransitTimeApex() {
        
        Test.startTest();
        User currentUser = QSF_Shift_Management_Controller.getCurrentUser();
        Interaction__c currentInter= new Interaction__c();
        currentInter.Office__c= currentUser.QSF_Office__c;
        currentInter.StartDate__c= DateTime.now();
        currentInter.AttentionTime__c= 'Atención sin ticket';
        currentInter.TicketNumber__c = 'ST001';
        insert currentInter;
        insert new QSF_Quenda_WS__c(Name= 'QuendaWS' ,Record_URL__c = 'https://quendapre.enel.com', WS_URL__c= 'https://sfquendapre.enel.com');
        String SticketInfo = '{"servicio":"Trámite 1", "atencionSinTransito": true, "idCita":122,"idAudio":"1111","codTicket":"AA000","fechaAtencion":"2017-12-15 06:15:54.0","DNI":"","idInteraccion":"'+ currentInter.Id +'"}';
        Interaction__c inct1 = QSF_Shift_Management_Controller.updateInteractionNoTransitTimeApex (currentUser,  'nextCall', SticketInfo);
        Test.stopTest();
    }
    
    /*
* @Author			RCV y RMCD
* @Email			rcasal@ayesa.com, rmcumplido@ayesa.com
* @Vendor			Ayesa
* @Description		Test para el método getLightning.
* @Version			V0.1
*/
    @isTest static void testGetLightning() {
        
        Test.startTest();
        Boolean res = QSF_Shift_Management_Controller.getLightning();
        Test.stopTest();
    }
    
}