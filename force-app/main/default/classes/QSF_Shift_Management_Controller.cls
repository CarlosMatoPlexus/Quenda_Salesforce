/*
*========================================================================================================
* @ClassName		QSF_Shift_Management_Controller
* @Description		Controller Class for Quenda components
* @Author			RCV y RMCD
* @Email			rcasal@ayesa.com, rmcumplido@ayesa.com
* @Vendor			Ayesa
* @Version			V0.1
* @TestClass		QSF_Shift_Management_Controller_Test
* @DateCreated		2017/09/26
* @LastChange		2019/02/13		
*========================================================================================================
*/
public without sharing class QSF_Shift_Management_Controller {
    
    /*
* @Author			RCV y RMCD
* @Email			rcasal@ayesa.com, rmcumplido@ayesa.com
* @Vendor			Ayesa
* @Description		Obtenemos la información del usuario/agente logueado. Añadida funcionalidad eliminar puesto a dia vencido.
* Si el dia de la última fecha de login es distinto al actual, se elimina la informacion de puesto 
* asociada al usuario para que eliga uno nuevo
* @return 			Devuelve usuario actual logueado
* @Version			V0.1
*/
    @AuraEnabled
    public static User getCurrentUser () {
        Id currentUserId = UserInfo.getUserId();
        User currentUser = [SELECT Id, Name, FirstName, LastName, Username,
                            QSF_Office__c, QSF_Place__c, QSF_LastLoginDate__c, QSF_Place_Id__c,
                            QSF_Office_Id__c, QSF_Quenda_User_Id__c
                            FROM User WHERE Id = :currentUserId];
        
        List <QSF_User_and_Office_Junction__c> currentOfficeList = [SELECT Id, QSF_Office__c, QSF_Office__r.Name  from QSF_User_and_Office_Junction__c where QSF_User__c = :currentUserId];
        system.debug(currentOfficeList);
        
        QSF_User_and_Office_Junction__c currentOffice = (currentOfficeList != null && currentOfficeList.size()>0) ? currentOfficeList[0] : null;
        
        if(currentOffice != null){
            currentUser.QSF_Office__c= currentOffice.QSF_Office__r.Name;
            system.debug(currentUser.QSF_Office__c);
        }else{
            currentUser.QSF_Office__c= null;
        }
        if (currentUser.QSF_LastLoginDate__c != null && currentUser.QSF_LastLoginDate__c.day() != (Datetime.now()).day()){ //Control de eliminacion de puesto a dia vencido
            system.debug('Diferente dia');
            currentUser.QSF_Place_Id__c= null;
            currentUser.QSF_Place__c= null;   
        } 
        
        update currentUser;
        
        return currentUser;
    }
    
    /*
* @Author			RCV y RMCD
* @Email			rcasal@ayesa.com, rmcumplido@ayesa.com
* @Vendor			Ayesa
* @Description		Obtenemos si el usuario tiene permisos personalizados (custom) de tipo QUENDA (QSF).
* @return 			Boolean según permisos de usuario concedidos.
* @Version			V0.1
*/
    @AuraEnabled
    public static Boolean isQuendaUser () {
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
        return answer;
    }
    
    /*
* @Author			RCV y RMCD
* @Email			rcasal@ayesa.com, rmcumplido@ayesa.com
* @Vendor			Ayesa
* @Description		Obtenemos los permisos de atención personalizados del usuario/agente logueado.
* @return 			List<Boolean> según permisos de usuario concedidos.
* @Version			V0.1
*/
    @AuraEnabled
    public static List<Boolean> getCustomPermission () {
        Id currentUserId = UserInfo.getUserId();
        List<SetupEntityAccess> idPermisos = [SELECT SetupEntityId
                                              FROM SetupEntityAccess 
                                              WHERE SetupEntityType='CustomPermission' 
                                              AND ParentId IN (SELECT PermissionSetId 
                                                               FROM PermissionSetAssignment 
                                                               WHERE AssigneeId =:currentUserId)];
        //Inicializo la lista oficial de permisos
        List<String> permissionNames= new List<String>{'QSF_Next_Call','QSF_No_Ticket_Attention','QSF_Service_Selection','QSF_Priority_Attention','QSF_Quick_Attention','QSF_Ticket_printing_time'};
            system.debug(permissionNames);
        //Creo cadena de Ids de permisos del usuario para consulta posterior
        String idsSetup= '(';
        for(SetupEntityAccess a : idPermisos){
            idsSetup = idsSetup + '\''+ a.SetupEntityId + '\',';
        }
        idsSetup = idsSetup.removeEnd(',');
        idsSetup= idsSetup + ')';
        //Consulta con la cadena de ids de permisos de usuario
        List<CustomPermission> myself2= Database.query('SELECT DeveloperName FROM CustomPermission WHERE Id in '+ idsSetup +' and DeveloperName like \'QSF_%\'');
        //Recupero solamente los nombres de los permisos de usuario desechando los Ids
        List<string> permisos= new List<string>();
        for(CustomPermission a : myself2){
            permisos.add(a.DeveloperName);
        }
        system.debug(permisos);
        //Creo una cadena con todos los permisos del usuario para una comparacion posterior con
        //la lista que tiene los nombres de  todos los posibles permisos
        string misPermisos='(';
        for(integer a=0; a<permisos.size(); a++){
            misPermisos = misPermisos + '\'' + permisos[a]  + '\',';
        }
        misPermisos= misPermisos.removeEnd(',');
        misPermisos= misPermisos + ')';
        system.debug(misPermisos);
        //Inicializo a FALSE una lista de Booleans que utilizaré en el componente
        List<Boolean> displayPermission= new List<Boolean>(permissionNames.size());
        for(integer a=0; a<displayPermission.size(); a++){
            displayPermission[a]=false;
        }
        system.debug(displayPermission);
        //Actualizo la lista de Booleans segun los permisos del usuario
        //comparando las cadenas de caracteres
        for (integer a=0; a<permissionNames.size(); a++ ){
            if(misPermisos.contains(permissionNames[a])){
                displayPermission[a]=true;
            }
        }
        
        return displayPermission;
    }
    
    
    /*
* @Author			RCV y RMCD
* @Email			rcasal@ayesa.com, rmcumplido@ayesa.com
* @Vendor			Ayesa
* @Description		En esta función se detecta si la consola se está ejecutando en Classic o Lightning.
* @return 			Boolean
* @Version			V0.1
*/    
    @AuraEnabled
    public static Boolean getLightning () {
        system.debug('THEME DISPLAYED');
        system.debug(UserInfo.getUiThemeDisplayed());
        system.debug(UserInfo.getDefaultCurrency());
        system.debug(UserInfo.getLocale());
        system.debug(UserInfo.getOrganizationName());
        
        
        if((UserInfo.getUiThemeDisplayed()=='Theme3') || (UserInfo.getUiThemeDisplayed()=='Theme2')){
            return false; //Ejecutando en classic
        }else if(UserInfo.getUiThemeDisplayed()=='Theme4d'){
            return true; //Ejecutando en lightning
        }else{
            return false;
        }
        
    }
    
    /*
* @Author			RCV y RMCD
* @Email			rcasal@ayesa.com, rmcumplido@ayesa.com
* @Vendor			Ayesa
* @Description		En esta función se eliminan los datos de puesto seleccionado una vez se haga una liberación de dicho puesto
* de manera externa mediante el Gestor Quenda 
* @param 			user
* @return 			currentUser
* @Version			V0.1
*/
    @AuraEnabled
    public static Object deleteUserPlaceInfo (User user) {	
        Id currentUserId = UserInfo.getUserId();
        User currentUser = [SELECT Id, Name, FirstName, LastName, Username,
                            QSF_Office__c, QSF_Place__c, QSF_LastLoginDate__c, QSF_Place_Id__c,
                            QSF_Office_Id__c, QSF_Quenda_User_Id__c
                            FROM User WHERE Id = :currentUserId];
        currentUser.QSF_Place_Id__c=null;
        currentUser.QSF_Place__c=null;
        
        update currentUser;
        
        
        return currentUser;
    }
    
    /*
* @Author			RCV y RMCD
* @Email			rcasal@ayesa.com, rmcumplido@ayesa.com
* @Vendor			Ayesa
* @Description		En esta función se calcula el tiempo de atención a partir de la hora actual y el tiempo de inicio de atención guardado
* en la interaccion al inicio de la misma
* @param  id Interaction
* @return string AttentionTime
* @Version			V0.1
*/
    @AuraEnabled
    public static string calculateAttentionTime(string idInteraction, string ticket) {	
        string attentionTime2 ='00:00:00'; //Si no hay idInteraccion se reinicia el display a CERO
        Map<string,Object> currentTicket = (Map<string,Object>)JSON.deserializeUntyped(ticket);
        Boolean isTiempoSinTransito = (Boolean)currentTicket.get('atencionSinTransito');
        datetime myDateTime = datetime.now();
        system.debug(idInteraction);
        //idInteraction = '';
        Interaction__c[] currentInter = [SELECT Id, StartDate__c, Call_Date__c FROM Interaction__c WHERE Id=: idInteraction];
        system.debug(currentInter);
        if (currentInter.size() > 0){
            
            if(!isTiempoSinTransito){ 
                // Interaction__C currentInter = [SELECT id, StartDate__c FROM Interaction__c WHERE id=: idInteraction];
                
                system.debug('ATTENTION TIME');
                system.debug(myDateTime);
                system.debug(currentInter[0].StartDate__c.second());
                
                myDateTime = myDateTime.addSeconds(-(currentInter[0].StartDate__c).second());
                myDateTime = myDateTime.addMinutes(-(currentInter[0].StartDate__c).minute()) ;
                myDateTime = myDateTime.addHours(-(currentInter[0].StartDate__c).hour()) ;
                
                system.debug('ATTENTION TIME');
                system.debug(myDateTime);
                
                string hours = String.valueOf(myDateTime.hour()) ;
                string minutes = String.valueOf(myDateTime.minute()) ;
                string seconds =String.valueOf(myDateTime.second()) ;
                attentionTime2 = hours +':'+ minutes +':'+seconds;
                system.debug('ATTENTION TIME');
                system.debug(attentionTime2);
                
            }else {
                //  Interaction__C currentInter = [SELECT id, Call_Date__c FROM Interaction__c WHERE id=: idInteraction];
                myDateTime = myDateTime.addSeconds(-(currentInter[0].Call_Date__c).second());
                myDateTime = myDateTime.addMinutes(-(currentInter[0].Call_Date__c).minute()) ;
                myDateTime = myDateTime.addHours(-(currentInter[0].Call_Date__c).hour()) ;
                
                system.debug('ATTENTION TIME');
                system.debug(myDateTime);
                
                string hours = String.valueOf(myDateTime.hour()) ;
                string minutes = String.valueOf(myDateTime.minute()) ;
                string seconds =String.valueOf(myDateTime.second()) ;
                attentionTime2 = hours +':'+ minutes +':'+seconds;
                
            }
        }else{
            
            system.debug('No hay interaccion o no se encuentra ');
            String initTime='';
            
            if(isTiempoSinTransito){
                initTime = (String)currentTicket.get('fechaAtencionSinTransito');
            }else{
                initTime = (String)currentTicket.get('fechaAtencion');
            }
            
            system.debug(initTime);
            system.debug(isTiempoSinTransito);
            //Fecha y hora de incio de atencion
            initTime=initTime.substring(0,initTime.length()-2);
            Datetime initTimeDate = Datetime.valueOfGmt(initTime);
            
            //Fecha y hora actual
            date myDate = datetime.now().dateGMT();
            time myTime = datetime.now().time();
            myDateTime = DateTime.newInstanceGMT(myDate, myTime);  
            
            system.debug('Fecha actual');
            system.debug(myDateTime);
            system.debug('Fecha inicio atencin');
            system.debug(initTimeDate);
            
            //Resta de hora actual menos hora de inicio de atencion
            myDateTime = myDateTime.addSeconds(-(initTimeDate).second());
            myDateTime = myDateTime.addMinutes(-(initTimeDate).minute()) ;
            myDateTime = myDateTime.addHours(-(initTimeDate).hour()) ;
            
            
            system.debug(myDateTime);
            
            system.debug(initTime);
            system.debug((datetime.now()).time());
            
            //Inicializacion del tiempo de atencion en curso
            string hours = String.valueOf(myDateTime.hour()) ;
            string minutes = String.valueOf(myDateTime.minute()) ;
            string seconds =String.valueOf(myDateTime.second()) ;
            attentionTime2 = hours +':'+ minutes +':'+seconds;
            
        }
        return attentionTime2;
    }
    
    /*
* @Author			RCV y RMCD
* @Email			rcasal@ayesa.com, rmcumplido@ayesa.com
* @Vendor			Ayesa
* @Description		Solicitud de lista de puestos disponibles según usuario de atención. (GET 1.1.1)
* @param 			user Datos del usuario logueado en el sistema (Id, Name, FirstName, LastName).
* @param 			accessToken Token necesario para acceder a la información de los WS
* @return  			Lista de puestos disponibles
* @Version			V0.1
*/
    @AuraEnabled
    public static Object getFreeWorkplaces(User user, string accessToken) {    
        
        
        System.debug('FreeWorkPlaces');
        string username= user.Username;
        HttpResponse response= QSF_WS_Callouts_Controller.getFreeWorkplacesWS(username, accessToken);
        System.debug(response);
        Map<string,Object> datos=(Map<String,Object>) JSON.deserializeUntyped(response.getBody());
        List<Object> places=(List<Object>) datos.get('data');
        system.debug(datos);
        System.debug(places);
        return datos;
    }
    
    /*
* @Author			RCV y RMCD
* @Email			rcasal@ayesa.com, rmcumplido@ayesa.com
* @Vendor			Ayesa
* @Description		Actualizamos la oficina, puesto y fecha de inicio de sesión del usuario logueado.
* @param 			user Usuario cuyos datos de ubicación van a ser actualizados
* @param 			place Nuevo puesto al que usuario queda asociado
* @param 			loginInfo Otros datos de actualización de ubicacion posibles como IdOficina
* @return 			Usuario actualizado
* @Version			V0.1
*/
    @AuraEnabled
    public static User updateUserLocation (User user, string place, string loginInfo) {
        system.debug('puesto que quiero actualizar');
        system.debug(place);
        system.debug('datos de LOGUEO que me llegan');
        system.debug(loginInfo);
        
        User mySelf = user;
        Map<string,Object> newPlace = (Map<string,Object>)JSON.deserializeUntyped(place);
        Map<string,Object> newLoginInfo = (Map<string,Object>)JSON.deserializeUntyped(loginInfo);
        mySelf.QSF_Place__c= (String)newPlace.get('nombre');
        mySelf.QSF_Place_Id__c= (long)newPlace.get('id');
        mySelf.QSF_Office_Id__c= (long)newLoginInfo.get('idOficina');
        mySelf.QSF_LastLoginDate__c= DateTime.now().addSeconds(30);
        myself.QSF_Quenda_User_Id__c=(long)newLoginInfo.get('idUsuario');
        
        update mySelf;
        system.debug('Usuario actualizado');
        system.debug(mySelf);
        return mySelf;
    }
    
    /*
* @Author			RCV y RMCD
* @Email			rcasal@ayesa.com, rmcumplido@ayesa.com
* @Vendor			Ayesa
* @Description		Función mediante la cual se actualiza la interaccion en los casos de atencion sin tránsito
* @param 			user Usuario o Agente que procede a realizar la atención
* @param 			operation Operación de actualización de interacción solicitada
* @param 			ticketInfo Informacion del ticket en curso para su uso en la actualizacion de la interacción en los casos necesarios
* @return 			Devuelve la interacción actualizada
* @Version			V0.1
*/
    @AuraEnabled
    public static Interaction__c updateInteractionNoTransitTimeApex (User user, string operation, String ticketInfo) {
        
        Interaction__c currentInter= updateInteraction(user, operation, ticketInfo,'0');
        return currentInter;
    }
    
    /*
* @Author			RCV y RMCD
* @Email			rcasal@ayesa.com, rmcumplido@ayesa.com
* @Vendor			Ayesa
* @Description		Función mediante la cual se actualiza la interacción asociada a un ticket de atención 
* 					según su procedencia y tipo de atención requerida.
* @param 			user Usuario o Agente que procede a realizar la atención
* @param 			operation Operación de actualización de interacción solicitada
* @param 			ticketInfo Informacion del ticket en curso para su uso en la actualizacion de la interacción en los casos necesarios
* @return 			Devuelve la interacción actualizada
* @Version			V0.1
*/
    @AuraEnabled
    public static Interaction__c updateInteraction (User user, string operation, String ticketInfo, string localTimeString) { //Rebajar a 3 parametros
        system.debug('UPDATE INTERACTION');
        system.debug(ticketInfo);
        system.debug(localTimeString);
        system.debug(operation);
        
        Boolean isForwarding = false; //Para los reenvios al mismo servicio
        Map<string,Object> currentTicket = (Map<string,Object>)JSON.deserializeUntyped(ticketInfo);
        Id idInteraction = (Id)currentTicket.get('idInteraccion');
        Boolean isTiempoSinTransito = (Boolean)currentTicket.get('atencionSinTransito');
        //Boolean isTiempoSinTransito = true;
        system.debug(isTiempoSinTransito);
        Interaction__c currentInter= new Interaction__c();
        currentInter= [SELECT id, Status__c, QSF_Appointment_Id__c, AsignationDate__c, QSF_Waiting_Time__c, FinishDate__c,QSF_Printing_Ticket_Time__c,
                       QSF_Forwarding_Time_Acc__c, QSF_Attention_Time_sec_Quenda__c, Call_Date__c ,
                       StartDate__c, Agent__c, Office__c, QSF_Reason__c, TicketNumber__c, OwnerId
                       FROM Interaction__c 
                       WHERE id=: idInteraction];
        Id previousOwnerId= currentInter.OwnerId; //Guardamos el OwnerId de Quenda para usarlo en el caso de atenciones reenviadas (Forwarding)
        system.debug(previousOwnerId);
        
        if (operation == 'nextCall'){ //Actualiza interacción de PROGRAMADA a ACTIVA
            if (currentInter.Status__c=='ESTA006'){
                system.debug('es una atencion reenviada al mismo servicio');
                isForwarding=true;
            }
            system.debug('Operacion:  '+operation);
            
            currentInter.Status__c='ESTA002'; //En ATENCIÓN
            
            //Funcionalidad tiempo sin tránsito
            
            /* if(isTiempoSinTransito){
currentInter.Call_Date__c= DateTime.now();  //Funcionalidad de hora de llamada (sustituirá a la linea inferior cuando salga adelante la funcionalidad "tiempo atención sin transito")
}else{
currentInter.StartDate__c= DateTime.now();
}*/
            //currentInter.Call_Date__c= DateTime.now();  //Funcionalidad de hora de llamada (sustituirá a la linea inferior cuando salga adelante la funcionalidad "tiempo atención sin transito")
            
            currentInter.StartDate__c= DateTime.now();
            currentInter.Agent__c=user.id;
            currentInter.OwnerId=user.id;
            system.debug(currentInter.QSF_Forwarding_Time_Acc__c);
            if(isForwarding){
                if(currentInter.QSF_Forwarding_Time_Acc__c==null){
                    currentInter.QSF_Forwarding_Time_Acc__c =0;
                }
                currentInter.QSF_Forwarding_Time_Acc__c= currentInter.QSF_Attention_Time_sec_Quenda__c + currentInter.QSF_Forwarding_Time_Acc__c;
                system.debug(currentInter.QSF_Forwarding_Time_Acc__c);
            }
            update currentInter;
            
        }else if (operation == 'noTransit'){  //PARA FUNCIONALIDAD TIEMPO DE ATENCIÓN SIN TRÁNSITO
            currentInter.Call_Date__c= DateTime.now();  //Funcionalidad de hora de llamada (sustituirá a la linea inferior cuando salga adelante la funcionalidad "tiempo atención sin tránsito")
            update currentInter;
            
        }else if (operation == ('finish&Pause') || operation == ('finish&Next')){ // Actualiza interacción de ACTIVA a FINALIZADA
            system.debug('Operacion:  '+operation);
            system.debug('Datos de ticket que llegan: ' + currentTicket);            
            
            currentInter.Status__c='ESTA003'; //Código status FINALIZADA 
            currentInter.FinishDate__c=DateTime.now();
            currentInter.Agent__c=user.id;
            
            update currentInter;
            
            system.debug('Interaccion actualizada a FINALIZADA:');
            system.debug(currentInter);
            
            QSF_Audio_Recording__c newAudio= new QSF_Audio_Recording__c();
            QSF_Quenda_WS__c urlCS = QSF_Quenda_WS__c.getValues('QuendaWS');
            String url = urlCS.Record_URL__c;
            
            string idAudio = (string)currentTicket.get('idAudio');
            newAudio.QSF_Audio_Id__c= idAudio;	
            newAudio.QSF_URL_Audio_Recording__c= url + '/quenda/getAudio?idAudio='+idAudio;
            newAudio.QSF_Interaction__c= currentInter.id;
            
            insert newAudio;
            
            system.debug(newAudio);
            
        }
        else if (operation =='absent') { //Actualiza la interacción a AUSENTE
            system.debug('Operacion:  '+operation);
            system.debug('Interacción antes de actualizar:  '+currentInter);
            
            currentInter.Status__c='ESTA005'; //Código de AUSENTE
            currentInter.FinishDate__c=DateTime.now();
            
            if(isTiempoSinTransito){ //Caso en que desde la pantlla intermedia de atención sin tránsito, se pulsa AUSENTE. El tiempo de atencion sin transito debe ser CERO
                currentInter.Call_Date__c=currentInter.FinishDate__c;
            }
            
            update currentInter;
            
            
        }
        else if (operation =='forwarding'){ //Actualiza la interacción a REENVIADA
            system.debug('Operacion:  '+operation);
            string idAudio = (string)currentTicket.get('idAudio');
            
            //Recupero el Id OWNER de Quenda y actializo la interaccion
            User userForwarding = [SELECT Id FROM User WHERE Name='Quenda WebServices' LIMIT 1];
            system.debug(userForwarding.id);
            //Actualización de la interacción
            currentInter.Status__c='ESTA006'; //Codigo REENVIADA
            currentInter.FinishDate__c=DateTime.now();
            currentInter.OwnerId=userForwarding.id; //QUENDA OWNER
            
            update currentInter;
            system.debug('Interaccion actualizada a REENVIADA:');
            system.debug(currentInter);
            
            QSF_Quenda_WS__c urlCS = QSF_Quenda_WS__c.getValues('QuendaWS');
            String url = urlCS.Record_URL__c;
            
            QSF_Audio_Recording__c newAudio= new QSF_Audio_Recording__c();
            newAudio.QSF_URL_Audio_Recording__c= url + '/quenda/getAudio?idAudio='+idAudio;
            newAudio.QSF_Audio_Id__c = idAudio;
            newAudio.QSF_Interaction__c= currentInter.id;
            insert newAudio;
            
            system.debug(newAudio);
            
        }
        else if (operation =='noTicket'){
            system.debug('Operacion:  '+operation);
            system.debug(localTimeString);
            
            if (localTimeString != '0'){ 
                system.debug('"Entro en local string"'); //HAY HORA DE IMPRESION DE TICKET (se añade control para Atenciones sin ticket)
                List<String> myStringTime = localTimeString.split(':');
                Time myTime = Time.newInstance(integer.valueOf(myStringTime[0]), integer.valueOf(myStringTime[1]), integer.valueOf(myStringTime[2]), 00);
                system.debug(myTime);
                Datetime myDT = Datetime.now();
                Date myDay = Date.today();
                
                String myDate = myDT.format('kk:mm:ss');
                List<String> currentStringTime = myDate.split(':');
                Time mycurrentTime = Time.newInstance(integer.valueOf(currentStringTime[0]), integer.valueOf(currentStringTime[1]), integer.valueOf(currentStringTime[2]), 00);
                system.debug(mycurrentTime);
                Time myTimeDif = mycurrentTime.addSeconds(-(integer.valueOf(myStringTime[2])));
                myTimeDif =    myTimeDif.addMinutes(-(integer.valueOf(myStringTime[1])));
                myTimeDif =    myTimeDif.addHours(-(integer.valueOf(myStringTime[0])));
                system.debug(myTimeDif);
                string mytimeString = String.valueOf(myTimeDif.hour()) + ' Horas, ' + String.valueOf(myTimeDif.minute()) + ' Minutos, ' + String.valueOf(myTimeDif.second()) + ' Segundos';
                system.debug(mytimeString);
                Datetime myPrintingTicketDateTime = DateTime.newInstance(myDay, myTime);
                currentInter.QSF_Printing_Ticket_Time__c= myPrintingTicketDateTime;
                currentInter.StartDate__c=DateTime.now();
            }else{
                //NO HAY HORA DE IMPRESION DE TICKET
                currentInter.StartDate__c=currentInter.AsignationDate__c;
            }
            currentInter.Agent__c=user.id;
            currentInter.OwnerId=user.id;
            // currentInter.StartDate__c=currentInter.AsignationDate__c; //Se iguala para que el tiempo de espera sea CERO
            currentInter.Call_Date__c= currentInter.AsignationDate__c;  //Funcionalidad de hora de llamada (se debe "descomentar" cuando salga adelante la funcionalidad "tiempo atención sin tránsito")
            
            
            update currentInter;
            
        }
        else if (operation =='quickAttention'){ //SE PODRIA REUTILIZAR EL ANTERIOR PARA EL MISMO CASO
            system.debug('Operacion:  '+operation);
            
            currentInter.Status__c='ESTA002'; //Código Quenda ACTIVA --> ESTA002 (abierto)  //STS001
            currentInter.StartDate__c=DateTime.now().addSeconds(30);
            currentInter.TicketNumber__c = (string)currentTicket.get('codTicket');
            currentInter.QSF_Reason__c= (string)currentTicket.get('servicio');
            update currentInter;
            
        }
        return(currentInter);
    }
    
    /*
* @Author			RCV y RMCD
* @Email			rcasal@ayesa.com, rmcumplido@ayesa.com
* @Vendor			Ayesa
* @Description		Solicitud de la lista de SERVICIOS disponibles según variable TIPO (GET 1.1.2 / 1.1.7 / 1.1.8)
* @param 			tipo Cadena de caracteres que indica el tipo de lista que se solicita. Hay 3 opciones: DISPONIBLE_USUARIO, REENVIO y PREATENCION 
* @param 			user Usuario que solicita la lista de servicios
* @param 			puesto Puesto desde el que se solicita la lista de servicios
* @param 			accessToken Token necesario para acceder a la información del WS
* @return 			Devuelve lista de servicios disponibles (o error en caso de fallo en el proceso de solicitud)
* @Version			V0.1
*/
    @AuraEnabled
    public static Object getServiceList(string info) { //Rebajar a 3
        
        HttpResponse response= QSF_WS_Callouts_Controller.getServiceListWS(info);
        
        Map<string,Object> datos=(Map<String,Object>) JSON.deserializeUntyped(response.getBody());
       // List<Object> services=(List<Object>) datos.get('data');
        
        return datos;
    }
    
    /*
* @Author			RCV y RMCD
* @Email			rcasal@ayesa.com, rmcumplido@ayesa.com
* @Vendor			Ayesa
* @Description		Solicitud de lista de PUESTOS disponibles para REENVIO(DERIVACIÓN) (GET 1.1.3)
* @param 			User Usuario que solicita la lista de puestos
* @param 			idServiceSelected Identificador del servicio para el cual se solicitan los puestos disponibles
* @param 			accessToken Token necesario para acceder a la información del WS
* @return 			Devuelve la lista de puestos disponibles para Reenvio(Derivación)
* @Version			V0.1
*/
    @AuraEnabled
    public static Object getForwardingPlaceList(string info) {
        
        system.debug(info);
        HttpResponse response= QSF_WS_Callouts_Controller.getForwardingPlaceListWS(info);
        
        Map<string,Object> datos=(Map<String,Object>) JSON.deserializeUntyped(response.getBody());
        List<Object> places=(List<Object>) datos.get('data');
        
        return datos;
    }
    
    /*
* @Author			RCV y RMCD
* @Email			rcasal@ayesa.com, rmcumplido@ayesa.com
* @Vendor			Ayesa
* @Description		Solicitud del NÚMERO de citas/turnos/tickets pendientes de atención (GET 1.1.4)
* @param 			user Usuario que solicita la información
* @param 			idServicio Identificador del servicio para el cual se solicita el numero de citas pendientes (opcional). 
* 					Si es null se proporciona el numero total citas pendientes de atencion para todos los servicios.
* @param			accessToken Token necesario para acceder a la información del WS.
* @return 			Devuelve el número de turnos pendientes (o error en caso de fallo en el proceso de solicitud).
* @Version			V0.1
*/
    @AuraEnabled
    public static Object getUnattendedShiftNumber(string info) {  
        
        HttpResponse response= QSF_WS_Callouts_Controller.getUnattendedShiftNumberWS(info);
        
        
        System.debug(response);
        System.debug(response.getBody());
        Map<string,Object> datos = (Map<String,Object>) JSON.deserializeUntyped(response.getBody());
        Object shiftNumber=(Object) datos.get('data'); 
        // Convertir a número entero cuando sepa QUÉ devuelve el WS y CÓMO lo devuelve
        system.debug(response.getStatus());
        system.debug(shiftNumber);
        return datos;
    }
    
    /*
* @Author			RCV y RMCD
* @Email			rcasal@ayesa.com, rmcumplido@ayesa.com
* @Vendor			Ayesa
* @Description		Solicitud de LISTA de citas pendientes POR PUESTO con el fin de proporcionar la posibilidad
* 					de priorizar la atención a clientes concretos a criterio del agente/usuario (GET 1.1.5)
* @param 			user Usuario que solicita la lista de citas pendientes de atención.
* @param 			idServicio Identificador del servicio para el cual se solicita la lista de citas pendientes.
* @param 			accessToken Token necesario para acceder a la información del WS.
* @return 			Devuelve la lista de citas pendientes por puesto (o error en caso de fallo en el proceso de solicitud).
* @Version			V0.1
*/
    @AuraEnabled
    public static Object getUnattendedShiftList(string info) { 
        
        HttpResponse response= QSF_WS_Callouts_Controller.getUnattendedShiftListWS(info);
        
        system.debug(response.getBody());
        Map<string,Object> datos=(Map<String,Object>) JSON.deserializeUntyped(response.getBody());
        List<Object> unattendedList=(List<Object>) datos.get('data'); 
        
        return datos;
    }
    
    /*
* @Author			RCV y RMCD
* @Email			rcasal@ayesa.com, rmcumplido@ayesa.com
* @Vendor			Ayesa
* @Description		Solicitud de la lista de estados de NO ATENCION disponibles que determinará el tipo de operaciones que el usuario
* 					está realizando en caso de no encontrarse atendiendo a clientes (GET 1.1.6)
* @param 			Idioma(pendiente de revisión)
* @param 			accessToken Token necesario para acceder a la información del WS.
* @return 			Devuelve lista de estados de NO ATENCIÓN (o error en caso de fallo en el proceso de solicitud).
* @Version			V0.1
*/
    @AuraEnabled
    public static Object getNoAttentionStatusList(string info) {
        
        //string info='';
        
        HttpResponse response= QSF_WS_Callouts_Controller.getNoAttentionStatusListWS(info);
        
        Map<string,Object> datos=(Map<String,Object>) JSON.deserializeUntyped(response.getBody());
       // (List<Object>) noAttentionList=(List<Object>) datos.get('data');
        
        return datos; 
    }
    
     /*
* @Author			RCV y RMCD
* @Email			rcasal@ayesa.com, rmcumplido@ayesa.com
* @Vendor			Ayesa
* @Description		Modificación estados de NO ATENCION del usuario
* 					
* @param 			
* @param 			accessToken Token necesario para acceder a la información del WS.
* @return 			Devuelve estado de la operación (o error en caso de fallo en el proceso de solicitud).
* @Version			V0.1
*/
    @AuraEnabled
    public static Object setNoAttentionUserStatus(string info) {
        
        //string info='';
        
        HttpResponse response= QSF_WS_PUT_Controller.setNoAttentionUserStatusWS(info);
        
        Map<string,Object> datos=(Map<String,Object>) JSON.deserializeUntyped(response.getBody());
        String noAttentionList=(string) datos.get('data');
        
        return datos; 
    }
    
    
    
    /*
* @Author			RCV y RMCD
* @Email			rcasal@ayesa.com, rmcumplido@ayesa.com
* @Vendor			Ayesa
* @Description		En esta función se registra el proceso de login (o logout/liberación) sobre un puesto seleccionado por el usuario. 
* 					En el caso de "login" se podría recibir información sobre un ticket asociado a una atención interrumpida (PUT 1.2.1).
* @param 			user Usuario que solicita el proceso de login/logout
* @param 			place Puesto sobre el cual se realiza la operacion de login/logout
* @param 			logout String que indica si la operación a realizar es login (logout = false) o sin embargo 
* 					se procede a realizar logout o liberacion del puesto (logout = true).
* @param 			accessToken Token necesario para acceder a la información del WS. 
* @return 			Devuelve la información correspondientes según se solicite login o logout (o error en caso de fallo en el proceso de solicitud)
* @Version			V0.1
*/
    @AuraEnabled
    public static Object putSelectedPlace(string info) { //Rebajar a 3
        
        HttpResponse response= QSF_WS_PUT_Controller.putSelectedPlaceWS(info);
        
        Map<string,Object> datos=(Map<String,Object>) JSON.deserializeUntyped(response.getBody());
        Object status=(Object)response.getStatus();
        Object ShiftInfo=(Object) datos.get('data');
        
        
        Map<string,Object> infoMap = (Map<string,Object>)JSON.deserializeUntyped(info);
        string logout = (string)infoMap.get('logout');
        
        if (logout=='true'){
            Id currentUserId = UserInfo.getUserId();
            User currentUser = [SELECT Id, Name, FirstName, LastName, Username,
                                QSF_Office__c, QSF_Place__c, QSF_LastLoginDate__c, QSF_Place_Id__c,
                                QSF_Office_Id__c, QSF_Quenda_User_Id__c
                                FROM User WHERE Id = :currentUserId];
            currentUser.QSF_Place_Id__c=null;
            currentUser.QSF_Place__c=null;
            
            update currentUser;
            
            ShiftInfo=status;
            system.debug('Estatus del logout');
            system.debug(status);
        }
        system.debug('Datos');
        system.debug(datos);
        
        //string prueba='{"data":{"Apellidos":"","Nombre":"","atencionSinTransito": "false","codTicket":"","documento":"","fechaAtencion":"" ,"fechaAtencionSinTransito":"","fechaCita":"","fechaCreacion":"","idAudio": "0","idCita": -1,"idInteraccion":"","idOficina": 107,"idServicio": 0,"idTipoCita": 0,"idUsuario": 2985,"llamadaAutomatica": false,"numTurnosPendientes": 25,"servicio":"","tiempoMaxSinTransito": 0,"tiempoRellamadaAutomatica": "50000","tipoDocumento":""},"success":true,"message":"OK"}';        
        
       // string prueba='{"data":{"Apellidos":"","Nombre":"","atencionSinTransito": "false","codTicket":"","documento":"","fechaAtencion":"" ,"fechaAtencionSinTransito":"","fechaCita":"","fechaCreacion":"","idAudio": "0","idCita": -1,"idInteraccion":"","idOficina": 107,"idServicio": 0,"idTipoCita": 0,"idUsuario": 2985,"numTurnosPendientes": 25,"servicio":"","tiempoMaxSinTransito": 0,"tipoDocumento":""},"success":true,"message":"OK"}';        
		//Map<string,Object> datosprueba =(Map<String,Object>) JSON.deserializeUntyped(prueba);
        //system.debug(datosprueba);
        
        return datos;
    }
    
    /*
* @Author			RCV y RMCD
* @Email			rcasal@ayesa.com, rmcumplido@ayesa.com
* @Vendor			Ayesa
* @Description		Solicitud de los datos del siguiente ticket a llamar  (PUT 1.2.2).
* @param 			user Usuario que solicita el siguiente ticket
* @param 			idServicio Identificador del servicio sobre el cual se requiere el siguiente ticket (opcional)
* @param 			idCita Identificador de cita para casos de priorización de tickets. Mediante este campo se informa del ticket a priorizar que ha seleccionado el usuario o agente (opcional).
* @param 			idioma (pendiente de revisión)
* @param 			accessToken Token necesario para acceder a la información del WS.
* @return 			Devuelve la informacion del siguiente ticket solicitado (o error en caso de fallo en el proceso de solicitud) 
* @Version			V0.1
*/
    @AuraEnabled
    public static Object putNextTicket(string info) { //Rebajar
        
        HttpResponse response= QSF_WS_PUT_Controller.putNextTicketWS(info);
        system.debug(response.getStatus());
        system.debug(response.getStatusCode());
        system.debug(response);
        //system.debug(response.getXmlStreamReader());
        //system.debug(response.)
        Map<string,Object> datos=(Map<String,Object>) JSON.deserializeUntyped(response.getBody());
        datos.put('HTTPStatus',response.getStatus());
        datos.put('HTTPCode',response.getStatusCode());
        Object ShiftInfo=(Object) datos.get('data'); 
        
        return datos;
    }    
    
    /*
* @Author			RCV y RMCD
* @Email			rcasal@ayesa.com, rmcumplido@ayesa.com
* @Vendor			Ayesa
* @Description		Solicitud de información para una atención sin ticket o atención rápida (PUT 1.2.3).
* @param 			user Usuario que solicita la informacion del ticket 
* @param 			idioma (pendiente de revisión)
* @param 			idServicio Identificador del servicio seleccionado en caso de solicitud de ticket para "Atencion Rápida" (opcional)
* @param 			accessToken Token necesario para acceder a la información del WS.
* @return 			Devuelve informacion del tipo de ticket solicitado y en caso de éxito info de siguiente cliente (o error en caso de fallo en el proceso de solicitud)
* @Version			V0.1
*/
    @AuraEnabled
    public static Object putNextNoTicket(string info) { //Rebajar
        
        HttpResponse response= QSF_WS_PUT_Controller.putNextNoTicketWS(info);
        
        Map<string,Object> datos=(Map<String,Object>) JSON.deserializeUntyped(response.getBody());
        Object ShiftInfo=(Object) datos.get('data'); 
        
        return datos;
    }    
    
    /*
* @Author			RCV y RMCD
* @Email			rcasal@ayesa.com, rmcumplido@ayesa.com
* @Vendor			Ayesa
* @Description		Se solicita la finalización de la atención en curso para, posteriormente y en caso de éxito, devolver al usuario a la pantalla inicial (PUT 1.2.4).
* @param 			user Usuario que solicita la finalización de la cita en curso.
* @param 			idCita Identificador de la cita/ticket que se encuentra en curso y por la cual se solicita la finalización.
* @param 			accessToken Token necesario para acceder a la información del WS.
* @return 			se devuelven status de la operación y descripcion del error si lo hubiese 
* @Version			V0.1
*/
    @AuraEnabled
    public static Object putFinishTicketAndPause(string info) {
        
        System.debug('putFinishTicketAndPauseWS');
        HttpResponse response= QSF_WS_PUT_Controller.putFinishTicketAndPauseWS(info);
        
        System.debug(response.getBody());
        Map<string,Object> datos=(Map<String,Object>) JSON.deserializeUntyped(response.getBody());
        Object ShiftInfo=(Object) datos.get('data'); 
        system.debug(ShiftInfo);
        return datos;
    }    
    
    /*
* @Author			RCV y RMCD
* @Email			rcasal@ayesa.com, rmcumplido@ayesa.com
* @Vendor			Ayesa
* @Description		Se solicita la finalizacion de la atención en curso y la información necesaria para 
* 					atender un siguiente ticket de manera inmediata en caso de que hubiese citas pendientes de atención (PUT 1.2.5).
* @param 			user Usuario que solicita la finalzación de la atencion en curso y la llamada de la siguiente.
* @param 			ticketInfo Informacion del ticket que va a ser finalizado
* @param 			idSelectedService Identificador del servicio que se desea atender en la llamada siguiente (opcional)
* @param 			accessToken Token necesario para acceder a la información del WS.
* @return 			se devuelven status de la operación de finalización e informacion del siguiente ticket (o descripcion del error si lo hubiese )
* @Version			V0.1
*/
    @AuraEnabled
    public static Object putFinishTicketAndNext(string info) { //Rebajar
        
        HttpResponse response= QSF_WS_PUT_Controller.putFinishTicketAndNextWS(info);
        
        Map<string,Object> datos=(Map<String,Object>) JSON.deserializeUntyped(response.getBody());
        Object ShiftInfo=(Object) datos.get('data'); 
        system.debug(ShiftInfo);
        return datos;
    }    
    
    /*
* @Author			RCV y RMCD
* @Email			rcasal@ayesa.com, rmcumplido@ayesa.com
* @Vendor			Ayesa
* @Description		Se solicita finalizar la atención en curso como "cliente AUSENTE" en los casos en que el cliente no acude al puesto de atención (PUT 1.2.6).
* @param 			user Usuario que solicita la finalización de turno por "ausencia"
* @param 			idCita Identificador de la cita que va a ser finalizada por ausencia de cliente
* @param 			accessToken Token necesario para acceder a la información del WS.
* @return 			se devuelven status de la operación y descripcion del error si lo hubiese 
* @Version			V0.1
*/
    @AuraEnabled
    public static Object putAbsentClient(string info) {
        
        HttpResponse response= QSF_WS_PUT_Controller.putAbsentClientWS(info); 
        
        Map<string,Object> datos=(Map<String,Object>) JSON.deserializeUntyped(response.getBody());
        Object ShiftInfo=(Object) datos.get('data'); 
        return datos;
    }
    
    /*
* @Author			RCV y RMCD
* @Email			rcasal@ayesa.com, rmcumplido@ayesa.com
* @Vendor			Ayesa
* @Description		Solicitud de Rellamada por pantalla en casos de clientes que no acude al puesto de atención después de la primera llamada o aviso (PUT 1.2.7)
* @param 			user Usuario que solicita la rellamada por pantalla
* @param 			idCita Identificador de la cita sobre la cual se solicita la rellamada por pantalla
* @param 			accessToken Token necesario para acceder a la información del WS.
* @return 			se devuelven status de la operación y descripcion del error si lo hubiese 
* @Version			V0.1
*/
    @AuraEnabled
    public static Object putScreenRecall(string info) { //Rebajar
        
        HttpResponse response= QSF_WS_PUT_Controller.putScreenRecallWS(info);
        
        
        Map<string,Object> datos=(Map<String,Object>) JSON.deserializeUntyped(response.getBody());
        Object ShiftInfo=(Object) datos.get('data'); 
        return datos;
    }
    
    /*
* @Author			RCV y RMCD
* @Email			rcasal@ayesa.com, rmcumplido@ayesa.com
* @Vendor			Ayesa
* @Description		Solicitud de REENVIO de atenciones. Estas derivaciones de atenciones pueden realizarse
* 					al mismo tipo de servicio de la cita original o a otro en caso de que el agente así lo viese conveniente. 
* 					Asi mismo y de forma opcinal, puede derivarse la atención a un puesto en concreto y con un retardo a seleccionar por el agente (PUT 1.2.8)
* @param 			user Usuario que solicita la derivación de atención
* @param 			idCita Identificador de la cita que va a ser reenviada
* @param 			idServicioDestino Identificador del servicio de destino al que será derivada la atención en curso
* @param 			idioma (pendiente de revisión)
* @param 			segundosRetraso cantidad de tiempo que puede retrarsarse la derivación de la atención (opcional)
* @param 			idPuestoDestino Identificador del puesto de destino al que llegará la atención sobre la que se solicita reenvío (opcional)
* @param 			accessToken Token necesario para acceder a la información del WS. 
* @return 			se devuelven status de la operación y descripcion del error si lo hubiese 
* @Version			V0.1
*/
    @AuraEnabled
    public static Object putForwardingTicket(string info) { //Rebajar
        
        HttpResponse response= QSF_WS_PUT_Controller.putForwardingTicketWS(info);// Añadir idPuesto desde user
        
        Map<string,Object> datos=(Map<String,Object>) JSON.deserializeUntyped(response.getBody());
        Object ShiftInfo=(Object) datos.get('data'); 
        return datos;
    }
    
    /*
* @Author			RCV y RMCD
* @Email			rcasal@ayesa.com, rmcumplido@ayesa.com
* @Vendor			Ayesa
* @Description		Solicitud de nuevo ticket PREVIO AL COMIENZO DE LA ATENCION (FUNCIONALIDAD TIEMPO SIN TRÁNSITO)
* @param 			user Usuario que solicita la derivación de atención
* @param 			idCita Identificador de la cita
* @param 			accessToken Token necesario para acceder a la información del WS. 
* @return 			se devuelven status de la operación y descripcion del error si lo hubiese 
* @Version			V0.1
*/
    @AuraEnabled
    public static Object putStartNoTransitAttention(string info) {
        
        HttpResponse response= QSF_WS_PUT_Controller.putStartNoTransitAttentionWS(info);
        
        Map<string,Object> datos=(Map<String,Object>) JSON.deserializeUntyped(response.getBody());
        Object ShiftInfo=(Object) datos.get('data'); 
        system.debug('NO TRANSIT ATTENTION TIME');
        system.debug(datos);
        return datos;
    }
    
    /*
* @Author			RCV y RMCD
* @Email			rcasal@ayesa.com, rmcumplido@ayesa.com
* @Vendor			Ayesa
* @Description		Obtenemos la hora actual del usuario/agente logueado. 
* @return 			Devuelve hora acual
* @Version			V0.1
*/
    @AuraEnabled
    public static List<string> getCurrentTime () {
        Datetime myDateTime = Datetime.now(); //Fecha y hora GMT
        system.debug(myDateTime);
        string myHour='0';
        string myMinute='0';
        string mySecond='0';
        //Añadir CEROS a las horas y minutos menores de 10
        if(myDateTime.hour()<10){ 
            myHour += string.valueOf(myDateTime.hour()); //Devuelve hora de la fecha local
        }else{
            myHour = string.valueOf(myDateTime.hour());
        }
        if(myDateTime.minute()<10){ 
            myMinute += string.valueOf(myDateTime.minute());//Devuelve los minutos de la fecha local
        }else{
            myMinute = string.valueOf(myDateTime.minute());
        }
        if(myDateTime.second()<10){ 
            mySecond += string.valueOf(myDateTime.second());//Devuelve los minutos de la fecha local
        }else{
            mySecond = string.valueOf(myDateTime.second());
        }
        
        List<string> myTime = new List<string>();
        myTime.add(myHour);
        myTime.add(myMinute);
        myTime.add(mySecond);
        system.debug(myTime);
        return myTime;
    }
    
    /*
* @Author			RCV y RMCD
* @Email			rcasal@ayesa.com, rmcumplido@ayesa.com
* @Vendor			Ayesa
* @Description		Se genera y devuelve una lista de horas o minutos a partir de la hora actual. Todas las combinaciones serán  de horas anteriores a la actual
* @param 			option Indica el tipo de lista que se devuelve. 'hour'-> Lista de horas. 'minute'-> Lista de minutos condicionada por la hora actual. 'refreshMinutes'-> Lista de total de minutos
* @return 			Devuelve una lista según parametro 'option'
* @Version			V0.1
*/
    @AuraEnabled
    public static List<string> getTimeList(string option) {
        Datetime myDateTime = Datetime.now();
        integer m = myDateTime.minute();
        integer dif =59-m;
        integer h = myDateTime.hour();
        integer hourDelay = 6;
        List<Datetime> myHourList= new List<Datetime>(hourDelay);
        List<Datetime> myMinuteList= new List<Datetime>();
        List<String> myListString= new List<String>();
        string timeAux='';
        if (option=='hour'){ //HORAS
            
            String aux1 = '0'+string.valueOf(myDateTime.hour());
            myListString.add(aux1.right(2));
            
            for(integer b=1; b<hourDelay; b++){
                String aux2 = '0'+string.valueOf((myDateTime.addHours(-b)).hour());
                myListString.add(aux2.right(2));
            }
            
        }else if (option=='minute'){ //MINUTOS
            
            String aux3 = '0'+string.valueOf(myDateTime.minute());
            myListString.add(aux3.right(2));
            
            for(integer b=1; b<m+1; b++){
                String aux4 = '0'+string.valueOf((myDateTime.addMinutes(-b)).minute());
                myListString.add(aux4.right(2));
            }
            
        }else if (option=='refreshMinutes'){ //REFRESCAR MINUTOS
            for(integer b=0; b<60; b++){
                String aux5 = '0'+string.valueOf(59-b);
                myListString.add(aux5.right(2));
            }
        }
        return myListString;
    }
    
    /*
* @Author			RCV y RMCD
* @Email			rcasal@ayesa.com, rmcumplido@ayesa.com
* @Vendor			Ayesa
* @Description		Solicitud del ACCESS TOKEN
* @param 			user
* @param 			password.
* @return 			Devuelve access token que se utilizará para acceder a los WS
* @Version			V0.1
*/
    @AuraEnabled
    public static Object getAccessTokenApex(string user, string password) {
        
        HttpResponse response= QSF_WS_PUT_Controller.getAccessTokenWS(user, password);
        system.debug(response.getBody());
        Map<string,Object> datos=(Map<String,Object>) JSON.deserializeUntyped(response.getBody());
        system.debug('access token');
        system.debug(datos);
        return datos;
    }
    
    /*
* @Author			RCV y RMCD
* @Email			rcasal@ayesa.com, rmcumplido@ayesa.com
* @Vendor			Ayesa
* @Description		Consulta de los campos de la interaccion 
* @param 			interactionId
* @return 			Devuelve los campos de la interacción que el agente ha podido modificar durante la atención
* @Version			V0.1
*/
    public static Interaction__c getInteractionFields(Id interactionId) {
        
        Interaction__c interaction =[select Id, Name, ApplicantContact__r.Name, ApplicantContact__r.IdentityNumber__c, toLabel(Reason__c), QSF_Reason__c, QSF_Comments__c from Interaction__c where Id = :interactionId];
        system.debug('MOTIVO');
        system.debug(interaction.Reason__c);
        return interaction;
    }
}