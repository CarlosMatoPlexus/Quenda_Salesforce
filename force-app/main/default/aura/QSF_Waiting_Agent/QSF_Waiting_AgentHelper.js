({
    //CARGA DE NÚMERO DE CLIENTES EN COLA (WS-GET)(1.1.4)
    loadUnattendedShiftNumber : function(component, helper) {
        component.set("v.errorStatus", false); //Se elimina un posible mensaje de error de la llamada anterior.
        //console.log("Servicio seleccionado: "+component.get("v.idSelectedService"));
         console.log(component.get("v.currentUser").QSF_Place_Id__c);
        var infoJson = '{';
        
            infoJson= infoJson + '"idServicio":'+component.get("v.idSelectedService")+',';
        	infoJson= infoJson + '"accessToken":"'+component.get("v.accessToken")+'",';
        
        	infoJson= infoJson + '"idUsuario":'+component.get("v.currentUser").QSF_Quenda_User_Id__c+',';
       		infoJson= infoJson + '"idOficina":'+component.get("v.currentUser").QSF_Office_Id__c+',';
        	infoJson= infoJson + '"idPuesto":'+component.get("v.currentUser").QSF_Place_Id__c;
        	infoJson= infoJson + '}';
        
        
        var action = component.get("c.getUnattendedShiftNumber");
        action.setParams({
            "info":infoJson
            //"user": component.get("v.currentUser"),
            //"idServicio": component.get("v.idSelectedService"),
            //"accessToken": component.get("v.accessToken")
            
        });
        action.setCallback(this, function(response) {
            console.log(response.getState());
            if(component.isValid() && response.getState() === "SUCCESS") {
                component.set("v.failedFunctionName",'dataLoadNumber');
                var unattendedShiftNumber = response.getReturnValue();
                if(unattendedShiftNumber.success == true){
                    //console.log("Turnos pendientes: "+unattendedShiftNumber.data.numTurnosPendientes);
                    if(unattendedShiftNumber.data.numTurnosPendientes!=0){
                        component.set("v.errorStatus", false); //ANA
                    }
                    component.set("v.unattendedShiftNumber", unattendedShiftNumber.data.numTurnosPendientes);
                    
                }else{//CONTROL DE ERRORES
                   // helper.errorManagement(component, helper,'', unattendedShiftNumber.message);
                    helper.errorManagementNew(component, helper,'', unattendedShiftNumber.codError, unattendedShiftNumber.message);
                }
            } else {
                console.log("KO-in loadUnattendedShiftNumber ");
                helper.errorManagementNew(component,helper,'ko','',$A.get("$Label.c.QSF_Service_Problem_CL"));

            }   
        });
        $A.enqueueAction(action);
    },
    
    //CARGA DE LISTA DE SERVICIOS DISPONIBLES PARA EL USUARIO (WS-GET)(1.1.7)
    loadAvailableServiceList : function(component, helper) {
        
        var infoJson = '{';
         	infoJson= infoJson + '"tipo":"DISPONIBLES_USUARIO",';
        	infoJson= infoJson + '"accessToken":"'+component.get("v.accessToken")+'",';
        
        	infoJson= infoJson + '"idUsuario":'+component.get("v.currentUser").QSF_Quenda_User_Id__c+',';
       		infoJson= infoJson + '"idOficina":'+component.get("v.currentUser").QSF_Office_Id__c+',';
        	infoJson= infoJson + '"idPuesto":'+component.get("v.currentUser").QSF_Place_Id__c;
        	infoJson= infoJson + '}';
        
        //console.log(infoJson);
        
        var action = component.get("c.getServiceList");
        action.setParams({
            //"user": component.get("v.currentUser"),
            "info": infoJson
            //"tipo": "DISPONIBLES_USUARIO",
            //"accessToken": component.get("v.accessToken")
            //"accessToken":'UXVlbmRhV1MxNTE2Nzk5ODIwMDQ4MC45Nzg3NzI1MTM5NjkyNDg0'
        });
        action.setCallback(this, function(response) {
            if(component.isValid() && response.getState() === "SUCCESS") {
                component.set("v.failedFunctionName",'dataLoadServices');
                var availableServiceList = response.getReturnValue();
                if (availableServiceList.success == true){
                    //console.log(availableServiceList);
                   // console.log(availableServiceList.data);
                    component.set("v.loadingMessageService", $A.get("$Label.c.QSF_Any_service_CL"));
                    component.set("v.availableServiceList", availableServiceList.data);
                }
                else{//CONTROL DE ERRORES
                  //  helper.errorManagement(component, helper,'', availableServiceList.message);   
 					helper.errorManagementNew(component, helper,'', availableServiceList.codError, availableServiceList.message);                    
                }
            } else {
                console.log("KO-in AvailableServiceList");
                helper.errorManagementNew(component,helper,'ko','',$A.get("$Label.c.QSF_Service_Problem_CL"));
            }   
        });
        $A.enqueueAction(action);
    },
    
    //CARGA DE LISTA DE ESTADOS DE NO ATENCIÓN (WS-GET)(1.1.6)
    loadNoAttentionStatusList: function(component, helper) {
         var infoJson = '{';
        	infoJson= infoJson + '"accessToken":"'+component.get("v.accessToken")+'",';       
        	infoJson= infoJson + '"idUsuario":'+component.get("v.currentUser").QSF_Quenda_User_Id__c+',';
       		infoJson= infoJson + '"idOficina":'+component.get("v.currentUser").QSF_Office_Id__c+',';
        	infoJson= infoJson + '"idPuesto":'+component.get("v.currentUser").QSF_Place_Id__c;
        	infoJson= infoJson + '}';
        
        var action = component.get("c.getNoAttentionStatusList");
        action.setParams({
            "info": infoJson
            
        });
        action.setCallback(this, function(response) {
            if(component.isValid() && response.getState() === "SUCCESS") {
                component.set("v.failedFunctionName",'dataLoadStatus');
                var noAttentionStatusList = response.getReturnValue();
                console.log('ESTADOS NO ATENCIÓN');
                console.log(noAttentionStatusList);
                if (noAttentionStatusList.success == true){
                    //console.log(noAttentionStatusList.data);
                   // component.set("v.loadingMessage", 'Estados disponibles');
                    var listaEstados = noAttentionStatusList.data;
                    listaEstados.sort((a,b) => (a.idEstado > b.idEstado) ? 1 : -1 );                   
                    component.set("v.noAttentionStatusList", listaEstados);
					
                   // var status = component.get("v.noAttentionStatusList");
                    var idCurrentStatus = component.get("v.idSelectedStatus");
                    console.log(idCurrentStatus);
                    if(idCurrentStatus != null && idCurrentStatus != 1){ //Identificador de estado DISPONIBLE          
                        console.log('Current Status id ---> '+ idCurrentStatus);     
                        //console.log(component.get("v.noAttentionStatusList"));
                        //component.set("v.selectedStatusValue", status.find(x => x.idEstado === idStatus ));
                       
                        //listaEstados.find(x => x.idEstado === idCurrentStatus ).selected=true;
                        
                        if(listaEstados === undefined){
                            console.log('La lista de estados llega vacía (UNDEFINED)');
                        }else if(listaEstados.length>0){
                            listaEstados.find(x => x.idEstado === idCurrentStatus ).selected=true;////////////////////////////////////////////////                            
                        }
                        
                       //listaEstados[2].selected=true;
                        //component.find("selectNoAttentionStatus").set("v.value", listaEstados[2]);
                    }else if(idCurrentStatus == 1){
                    //component.set("v.idSelectedStatus",listaEstados[0].idEstado);
                    //console.log(component.get("v.idSelectedStatus"));
                    }
                    
                    
                	//component.set("v.idSelectedStatus",listaEstados[0].idEstado);
                   // console.log(component.get("v.idSelectedStatus"));
                }
                else{ //CONTROL DE ERRORES
                    //helper.errorManagement(component, helper,'', noAttentionStatusList.message); 
                    helper.errorManagementNew(component, helper,'', noAttentionStatusList.codError, noAttentionStatusList.message);
                }
            } else {
                console.log("KO-in noAttentionStatusList"); 
                helper.errorManagementNew(component,helper,'ko','',$A.get("$Label.c.QSF_Service_Problem_CL"));
            }   
        });
        $A.enqueueAction(action);
    },
    
    //CAMBIO DE ESTADOS DE NO ATENCIÓN (WS-PUT)
    changeUserNoAttentionStatus: function(component, event, helper) {
        
         var infoJson = '{';
        	infoJson= infoJson + '"accessToken":"'+component.get("v.accessToken")+'",';       
        	infoJson= infoJson + '"idUsuario":'+component.get("v.currentUser").QSF_Quenda_User_Id__c+',';
       		infoJson= infoJson + '"idOficina":'+component.get("v.currentUser").QSF_Office_Id__c+',';
       		infoJson= infoJson + '"idEstado":'+component.get("v.idSelectedStatus")+',';
        	infoJson= infoJson + '"idPuesto":'+component.get("v.currentUser").QSF_Place_Id__c;
        	infoJson= infoJson + '}';
        
        var action = component.get("c.setNoAttentionUserStatus");
        action.setParams({
            "info": infoJson
        });
        action.setCallback(this, function(response) {
            if(component.isValid() && response.getState() === "SUCCESS") {
                component.set("v.failedFunctionName",'dataLoadStatus');
                var setNoAttentionStatusUser = response.getReturnValue();
                console.log('SET NUEVO ESTADO ATENCION');
                console.log(setNoAttentionStatusUser);
                if (setNoAttentionStatusUser.success == true){
                    console.log(setNoAttentionStatusUser.data);
                    var status = component.get("v.noAttentionStatusList");
        			var idStatus = component.get("v.idSelectedStatus");
                    if(idStatus != null && idStatus == 1){ 
                        
                        if(component.get("v.automaticAttentionTime")!="" && component.get("v.unattendedShiftNumber")>0 && component.get("v.AutoRecallIntervalId")=="" && component.get("v.isActiveAutomaticRecall")==true){
                            //if(true ){
                            var time = component.get("v.automaticAttentionTime");
                            //var time = 10000;
                            console.log (time);
                            helper.automaticNextTicket(component, helper, time);
                        } 
                    		
                    }else{
                        
                        clearInterval(component.get("v.AutoRecallIntervalId"));
                        component.set("v.AutoRecallIntervalId",'');
                        component.set("v.currentSeconds",'0');
                    }
                }
                else{ //CONTROL DE ERRORES
                    //helper.errorManagement(component, helper,'', noAttentionStatusList.message); 
                    helper.errorManagementNew(component, helper,'', setNoAttentionStatusUser.codError, setNoAttentionStatusUser.message);
                }
            } else {
                console.log("KO-in setNoAttentionStatusUser"); 
                helper.errorManagementNew(component,helper,'ko','',$A.get("$Label.c.QSF_Service_Problem_CL"));
            }   
        });
        $A.enqueueAction(action);
    },
    
    
    
    //COMIENZO DE ATENCIÓN DE TICKET SOLICITADO POR WS (PUT 1.2.2) (O TICKET RECUPERADO POR INTERRUPCIÓN)
    startNextTurn : function(component,helper) {
     
        helper.switchSpinnerOn(component, $A.get("$Label.c.QSF_Next_ticket_spinner_CL"));//SPINNER ON
        //Si no ha habido interrupcion de ticket
       // console.log('serviciooooo: ' +component.get("v.idSelectedService"));

         var infoJson = '{';
        	infoJson= infoJson + '"idServicio":'+component.get("v.idSelectedService")+',';
            infoJson= infoJson + '"idioma":1,';
        	infoJson= infoJson + '"accessToken":"'+component.get("v.accessToken")+'",';
        	infoJson= infoJson + '"idCita":'+null+',';
        	infoJson= infoJson + '"idUsuario":'+component.get("v.currentUser").QSF_Quenda_User_Id__c+',';
       		infoJson= infoJson + '"idOficina":'+component.get("v.currentUser").QSF_Office_Id__c+',';
        	infoJson= infoJson + '"idPuesto":'+component.get("v.currentUser").QSF_Place_Id__c;
        	infoJson= infoJson + '}';
        
        var action = component.get("c.putNextTicket");  // (PUT 1.2.2) 
        action.setParams({
            //"user": component.get("v.currentUser"),
            "info": infoJson
            //"idServicio" : component.get("v.idSelectedService"),
            //"idioma": 1,
            //"accessToken":'UXVlbmRhV1MxNTE2MjcwNjUyNTQzMC4wMjkxMjY1Njg3ODg0MTU2ODU='
            //"accessToken": component.get("v.accessToken")
        });
        action.setCallback(this, function(response) {
           console.log(component.isValid());
           console.log(response.getState());
            if(component.isValid() && response.getState() === "SUCCESS") {
                component.set("v.failedFunctionName",'nextTurn');
                var nextShiftInfo = response.getReturnValue();
                if (nextShiftInfo.success == true){
                    if (nextShiftInfo.data.codTicket != ""){ 
                        component.set("v.nextShiftInfo", nextShiftInfo.data);
                      console.log("Siguiente ticket");
                      console.log('WS SiguienteTicket --> Status: '+ nextShiftInfo.HTTPStatus + ' --> CODE: '+ nextShiftInfo.HTTPCode );
                      //console.log(nextShiftInfo.HTTPCode);
                      console.log(nextShiftInfo.data);
                        var ticket= JSON.stringify(component.get("v.nextShiftInfo"));
                        console.log('Atencion sin transito?  '+  nextShiftInfo.data.atencionSinTransito);
                       	helper.updateInteraction1(component,helper,"nextCall",ticket,"AttentionProgress");
                            /* if (nextShiftInfo.data.atencionSinTransito){
                            helper.updateInteraction1(component,helper,"noTransit",ticket,"AttentionProgress");
                        }else{
                            helper.updateInteraction1(component,helper,"nextCall",ticket,"AttentionProgress");
                        }*/
                        
                    } else{
                        console.log('Código de ticket vacio');
                        //console.log(nextShiftInfo.data);
                        //console.log(nextShiftInfo.codError);
                        //console.log(nextShiftInfo.message);
                        component.set("v.errorStatus", true);
                        component.set("v.errorMessage", $A.get("$Label.c.QSF_No_clients_queued_CL"));
						component.set("v.AutoRecallIntervalId", '');
                        helper.switchSpinnerOff(component,'...');//SPINNER OFF
                    }
                }
                else{//CONTROL DE ERRORES (Success== false)
                    //helper.errorManagement(component, helper, '', nextShiftInfo.message);
                   
                  	 component.set("v.AutoRecallIntervalId", '');
                    helper.errorManagementNew(component, helper, '', nextShiftInfo.codError, nextShiftInfo.message);
                    //helper.switchSpinner(component,'');//SPINNER OFF   
                }
                
            } else {
                console.log("KO-in startNextTurn"); 
                console.log("ERRORRRRRRRR");
                //console.log('WS SiguienteTicket --> Status: '+ response.getReturnValue().HTTPStatus + ' --> CODE: '+ response.getReturnValue().HTTPCode );
                //console.log(response);
                console.log(response.getError());
                console.log(response.getReturnValue());
                console.log(response.getParam);
                console.log(response.getParams);
                //console.log(response.getE);
                //console.log(response.getE);
                helper.errorManagementNew(component,helper,'ko','',$A.get("$Label.c.QSF_Service_Problem_CL"));
            }   
        });
        $A.enqueueAction(action);
    },
    
    //COMIENZO DE ATENCIÓN SIN TICKET (O ATENCIÓN RÁPIDA) CON ACTUALIZACIÓN DE INTERACCIÓN CORRESPONDIENTE
    startNoTicketAttention : function(component,helper,view) {  //Si no ha habido interrupcion de ticket
       
        helper.switchSpinnerOn(component, $A.get("$Label.c.QSF_No_ticket_spinner_CL")); //SPINNER ON
        
        var infoJson = '{';
            infoJson= infoJson + '"idioma":1,';
        	infoJson= infoJson + '"accessToken":"'+component.get("v.accessToken")+'",';
        	infoJson= infoJson + '"idUsuario":'+component.get("v.currentUser").QSF_Quenda_User_Id__c+',';
       		infoJson= infoJson + '"idOficina":'+component.get("v.currentUser").QSF_Office_Id__c+',';
        	infoJson= infoJson + '"idPuesto":'+component.get("v.currentUser").QSF_Place_Id__c;
        	infoJson= infoJson + '}';

            var action = component.get("c.putNextNoTicket");
            action.setParams({
                "info":infoJson
                //"user": component.get("v.currentUser"),
                //"idioma": 1,
               // "accessToken": component.get("v.accessToken")
                //"accessToken":'UXVlbmRhV1MxNTE2MjcwNjUyNTQzMC4wMjkxMjY1Njg3ODg0MTU2ODU='
            });
            action.setCallback(this, function(response) {
                if(component.isValid() && response.getState() === "SUCCESS") {
                    component.set("v.failedFunctionName",'withoutShift');
                    var nextNoTicketAttention = response.getReturnValue();
                    if (nextNoTicketAttention.success == true){
                       console.log(nextNoTicketAttention.data);
                        component.set("v.nextShiftInfo", nextNoTicketAttention.data); //El nuevo ticket es recogido del PUT NO TICKET ATTENTION
                        var ticket= JSON.stringify(component.get("v.nextShiftInfo"));
                        helper.updateInteraction1(component,helper,"noTicket",ticket,"WithoutShift"); 
                    }
                    else{//CONTROL DE ERRORES
                        //helper.errorManagement(component, helper, '', nextNoTicketAttention.message);
                        helper.errorManagementNew(component, helper, '', nextNoTicketAttention.codError, nextNoTicketAttention.message);
                        //helper.switchSpinner(component,'');//SPINNER OFF
                    }
                    
                } else {
                    console.log("KO-in NextNoTicketAttention ");
                    helper.errorManagementNew(component,helper,'ko','',$A.get("$Label.c.QSF_Service_Problem_CL"));
                    helper.switchSpinnerOff(component,'');//SPINNER OFF     
                }
            });
            $A.enqueueAction(action);
        
    },
    
    //ACTUALIZACIÓN DE LA INTERACCIÓN
    updateInteraction1 : function(component,helper,operation,ticket,view) {
      //  console.log('Operation: '+operation);
         var timeControl='0';
        //console.log(interaction);
        var action = component.get("c.updateInteraction");
        action.setParams({
            "user": component.get("v.currentUser"),
            "operation": operation,
             "localTimeString": timeControl,
            "ticketInfo": ticket
        });
        action.setCallback(this, function(response) {
            if(component.isValid() && response.getState() === "SUCCESS") {
                var updateInter = response.getReturnValue();
              //  console.log("Status 'Update Interaction' : OK");
                helper.changeComponentView(component, view);
                helper.switchSpinnerOff(component,'');//SPINNER OFF
            } else {
                console.log("KO-in updateInteraction ");
                //helper.errorManagement(component, helper, 'ko', "Error al actualizar Interacción con operación "+ operation);
                helper.changeComponentView(component, view); //Hacer cambio de vista aunque no haya interacción
                component.set("v.errorStatus", false);
                component.set("v.errorMessage", "Error al actualizar Interacción con operación "+operation);
                helper.switchSpinnerOff(component,'');//SPINNER OFF
            }   
        });
        $A.enqueueAction(action);
        
    },
    
    //LLAMADA AUTOMÁTICA
    automaticNextTicket : function(component, helper, time){   
        
        console.log('Prueba de SetInterval para Llamada automatica');
        var seconds=0;
        var currentSeconds=parseInt(component.get("v.currentSeconds"));
        var automaticAttentionTime= time ; //Viene en milisegundos
        var timeleft = currentSeconds != 0 ? (automaticAttentionTime - currentSeconds) : automaticAttentionTime ;
        console.log('currentSeconds: '+currentSeconds +'  automaticAttentionTime: '+automaticAttentionTime +  '  timeleft: '+ timeleft);
        var AutoRecallIntervalId =  setInterval(function() {
            //COMPROBACION DE SELECCION DE SERVICIO
           
            seconds++;
            console.log(seconds);
            if(seconds>timeleft){
                
                console.log('Se cumple el tiempo y se hace la rellamada');
                if((component.get("v.serviceSelection")==true)){
                    if(component.find("selectService").get("v.value") != ""){
                        var indxService= component.find("selectService").get("v.value");
                        var service = component.get("v.availableServiceList");
                        component.set("v.idSelectedService",service[indxService].id);
                    }
                    else{
                        component.set("v.idSelectedService",null); //Se tiene permiso de seleccion pero no se selecciona ninguno servicio
                    }
                }
                else{
                    component.set("v.idSelectedService",null); //No se tiene permiso de seleccion de servicio
                }
                
               
                clearInterval(component.get("v.AutoRecallIntervalId"));
                clearInterval(component.get("v.refreshIntervalId"));  
                component.set("v.AutoRecallIntervalId", '');
                component.set("v.callAutomaticNow", true); 
       
                
               //helper.startNextTurn(component, helper); //Una vez se haya guardado el valor del servicio seleccionado, se solicita el siguiente turno.  
               // helper.startNoTicketAttention(component,helper,"WithoutShift");
            }
            else{
                component.set("v.currentSeconds", (seconds+currentSeconds).toString());
            }
               
            
        }, 1000); //Se entra cada segundo
        
        
        component.set("v.AutoRecallIntervalId", AutoRecallIntervalId);
    },
    
    //ACTUALIZACIÓN DE NÚMERO DE CLIENTES EN ESPERA CONFIGURABLE POR TIEMPO
    refreshNumberByTime: function(component, helper){
        
        var refreshIntervalId= setInterval(function() {
            if (component.get("v.switch")==true){
                component.set("v.switch", false);
            }else{
                component.set("v.switch", true);
            }
        },component.get("v.refreshUnattendedShiftNumberValue"));//Parametro que controla el tiempo de refresco del numero de citas pendientes de atención
        component.set("v.refreshIntervalId", refreshIntervalId);
    },
    
    //ACTUALIZACIÓN DE NÚMERO DE CLIENTES EN ESPERA AL MODIFICAR EL SERVICIO SELECCIONADO
    refreshNumber: function(component,helper){
      console.log('Refresco de cola por cambio de servicio o tiempo:');
      //console.log('Current seconds: '+component.get("v.currentSeconds"));
      //console.log(component.get("v.automaticAttentionTime"));
        if((component.get("v.serviceSelection")==true)){ //Si se tiene permiso de seleccion de servicio
            if (component.find("selectService").get("v.value")!=""){
                var indxService= component.find("selectService").get("v.value");
                var service = component.get("v.availableServiceList");
                component.set("v.idSelectedService",service[indxService].id);
            }
            else{
                //"Cualquier servicio" seleccionado en el picklist
                var anyService = 0;
                component.set("v.idSelectedService",anyService);
            }
        }else{
            component.set("v.idSelectedService",null); //No se tiene permiso de seleccion de servicio
        }
        helper.loadUnattendedShiftNumber(component, helper);  
    },
    
    //ACTUALIZACIÓN DEL TOKEN
    refreshToken : function(component,helper,failedFunction) {
        //component.set("v.statusAccessToken", 'OK');
        var action = component.get("c.getAccessTokenApex");
        action.setParams({
            "user": 'plexus',
            "password": 'Plexus44ff'
        });
        action.setCallback(this, function(response) {
            if(component.isValid() && response.getState() === "SUCCESS") {
                var accessToken = response.getReturnValue();
                if(accessToken.success == false){
                  //  console.log(accessToken.message);
                    //component.set("v.statusAccessToken", 'ERROR');
                    //component.set("v.accessToken", accessToken.message);
                }else{
                    component.set("v.statusAccessToken", 'OK');
                    component.set("v.accessToken", accessToken.data.access_token);
                   // console.log("ACCESS TOKEN refreshed: ");
                    helper.checkAndCallFailedFunction(component,helper,failedFunction);  
                }
            } else {
                console.log("KO in WS when refresh Access Token");  
            }   
        });
        $A.enqueueAction(action);
    },
    
    //LLAMADA A LA FUNCIÓN QUE HA FALLADO DEBIDO A ERROR EN EL TOKEN (por erroneo o caducado)
    checkAndCallFailedFunction : function(component,helper,failedFunction) {
        if(failedFunction == 'dataLoadNumber' || failedFunction == 'dataLoadServices' || failedFunction == 'dataLoadStatus'){
            //helper.switchSpinner(component,'');//SPINNER OFF
            helper.loadUnattendedShiftNumber(component, helper); // GET (1.1.4)
            helper.loadAvailableServiceList(component, helper);  
           // helper.loadNoAttentionStatusList(component, helper);   //Req 272     
        }else if(failedFunction == 'nextTurn'){
            helper.switchSpinnerOff(component,'');//SPINNER OFF
            helper.startNextTurn(component, helper);
        }else if(failedFunction == 'withoutShift'){
            helper.switchSpinnerOff(component,'');//SPINNER OFF
            helper.startNoTicketAttention(component,helper,"WithoutShift");
        }
    },
    
    //CONTROL DE ERRORES VERSION ANTIGUA
    errorManagement : function(component, helper, status, codError, message) {
        console.log(message);
        if (status == 'ko') {
            component.set("v.errorStatus", true);
            component.set("v.errorMessage", message); 
            console.log(message);
        }else{
            if(codError=="ERR002"){
              // console.log("Error por parametros incorrectos en: "+component.get("v.failedFunctionName"));
              //  console.log(message);
              console.log(message);
                component.set("v.errorStatus", true);
                component.set("v.errorMessage", message);
                if(component.get("v.failedFunctionName") == 'login'){
                    helper.switchSpinner(component,'');//SPINNER OFF
                }
            }
            else if(codError=="ERR001"){ //PUESTO NO OCUPADO
            	//helper.deleteUserPlaceInfo(component, helper);
                component.set("v.errorStatus", true);
                component.set("v.errorMessage", message);
                console.log(message);
                //helper.changeComponentView(component, 'LoginAgent');
            }else if(codError=="ERR000"){ //ERROR GENERICO
                component.set("v.errorStatus", true);
                component.set("v.errorMessage", message);
                console.log(message);
                //helper.deleteUserPlaceInfo(component, helper);
                //helper.changeComponentView(component, 'LoginAgent');
            }
                else{
                    console.log("Error por parametros incorrectos en: "+component.get("v.failedFunctionName"));
                    console.log(message);
                    component.set("v.errorStatus", true);
                    component.set("v.errorMessage", message); 
                    if(component.get("v.failedFunctionName") == 'finishAndPause'|| component.get("v.failedFunctionName") == 'markAbsentClient'){
                        helper.switchSpinner(component,'');//SPINNER OFF
                    }
                }
        }    
    },
        
    //CONTROL DE ERRORES NUEVA VERSION
    errorManagementNew : function(component, helper, status,codError, message) {
        if (status == 'ko') {
            component.set("v.errorStatus", true);
            component.set("v.errorMessage", message);
            helper.switchSpinnerOff(component,'');//SPINNER OFF
        }else{
            if(codError=="ERR004"){
                component.set("v.errorStatus", true); //Se muestra el mensaje
                component.set("v.errorMessage", message); 
                helper.switchSpinnerOff(component,'');//SPINNER OF
            }
            else if(codError=="ERR003"){
              //  console.log('Funcion que falla por token:' +component.get("v.failedFunctionName"));
                component.set("v.statusAccessToken", 'ERROR');
                console.log(message);
                component.set("v.errorStatus", false); // NO se muestra el mensaje de error
                component.set("v.errorMessage", message);
            }
            else if(codError=="ERR002"){
              // console.log("Error por parametros incorrectos en: "+component.get("v.failedFunctionName"));
                console.log(message);
                component.set("v.errorStatus", false); // NO se muestra el mensaje de error
                component.set("v.errorMessage", message);
                 helper.switchSpinnerOff(component,'');
                if(component.get("v.failedFunctionName") == 'login'){
                    helper.switchSpinnerOff(component,'');//SPINNER OFF
                }
            }
            else if(codError=="ERR001"){ //PUESTO NO OCUPADO
                helper.deleteUserPlaceInfo(component, helper);
                component.set("v.errorStatus", true);
                component.set("v.errorMessage", message);
                //helper.changeComponentView(component, 'LoginAgent');
            }
            else if(codError=="ERR000"){
                component.set("v.errorStatus", false);
                component.set("v.errorMessage", message);
                 helper.switchSpinnerOff(component,'');
                //console.log('Error generico');
            }
            else{
                console.log("Error por parametros incorrectos en: "+component.get("v.failedFunctionName"));
                console.log(message);
                component.set("v.errorStatus", false);
                component.set("v.errorMessage", message);
                
                if(component.get("v.failedFunctionName") == 'nextTurn'|| component.get("v.failedFunctionName") == 'withoutShift'){
                    helper.switchSpinnerOff(component,'');//SPINNER OFF
                }
            }
        }    
    },

    //SI SE DETECTA UNA LIBERACIÓN DE PUESTO (EXTERNA) SE REDIRIGE A LA PANTALLA DE LOGIN
    deleteUserPlaceInfo : function(component, helper) {
        var action = component.get("c.deleteUserPlaceInfo");
        action.setParams({
            "user": component.get("v.currentUser")
        });
        action.setCallback(this, function(response) {
            if(component.isValid() && response.getState() === "SUCCESS") {
                var userUpdated = response.getReturnValue();
               // console.log(userUpdated);
                if(userUpdated.QSF_Place_Id__c == null && userUpdated.QSF_Place__c == null ){
                    helper.switchSpinnerOff(component,'');//SPINNER OFF
                    helper.changeComponentView(component, 'LoginAgent');
                    //component.set("v.statusAccessToken", 'ERROR');
                    //component.set("v.accessToken", accessToken.message);
                }
                
                }
             else {
                 helper.switchSpinnerOff(component,'');//SPINNER OFF
                console.log("KO in Delete user Place Info");  
            }   
        });
        $A.enqueueAction(action);
        
    },
        
    //FUNCIÓN PARA CAMBIO DE VISTA
    changeComponentView : function(component,view) {
        
        //PREVIO AL CAMBIO DE VISTA SE DESACTIVAN TODAS LAS ACCIONES PROGRAMADAS EN EL TIEMPO 
        clearInterval(component.get("v.refreshIntervalId"));   //Actualización de número de clientes en espera
		clearInterval(component.get("v.AutoRecallIntervalId")); //Llamada automatica        
        /*if ( component.get("v.AutoRecallIntervalId")!= ''){
            clearTimeout(component.get("v.AutoRecallIntervalId")); //Llamada automatica
            component.set("v.AutoRecallIntervalId", '');
        }*/
        
        //console.log('Hago cambio de vista a: ' +view);
        var changeViewEvent = component.getEvent("changeView");
        console.log('Segundos que llevo: '+ component.get("v.currentSeconds"));
        
        changeViewEvent.setParams({
            "view": view,
            "place":component.get("v.place"),
            "currentUser": component.get("v.currentUser"),
            "nextShiftInfo": component.get("v.nextShiftInfo"),
            "idSelectedService": component.get("v.idSelectedService"),
            "automaticAttentionTime": component.get("v.automaticAttentionTime"),
             //"automaticAttentionTime": '15000',
            "accessToken": component.get("v.accessToken"),
            "errorStatus": component.get("v.errorStatus"),
            "errorMessage": component.get("v.errorMessage"),
            "isLEX": component.get("v.isLEX"),
            "currentSeconds": component.get("v.currentSeconds"),
            "idSelectedStatus": component.get("v.idSelectedStatus")
            
        }).fire();
        
        window.scrollTo(0, 0);
        
    },

    //CAMBIA EL ESTADO DEL SPINNER
    switchSpinner : function(component, title){     
        component.set("v.spinnerMsg", title);      
        $A.util.toggleClass(component.find("mySpinner"), "slds-hide");
        
    },
    
    //CONTROL DE SPINNER ON
    switchSpinnerOn : function(component, title){     
        component.set("v.spinnerMsg", title);  
        $A.util.removeClass(component.find("mySpinner"), "slds-hide");
        //component.set("v.showSpinner", !(component.get("v.showSpinner")));
        
        
    },
    
    //CONTROL DE SPINNER OFF
    switchSpinnerOff : function(component, title){  
        console.log('Hago spinner OFF');
        component.set("v.spinnerMsg", title);  
        $A.util.addClass(component.find("mySpinner"), "slds-hide");
        //component.set("v.showSpinner", !(component.get("v.showSpinner")));
        
        
    },
    
})