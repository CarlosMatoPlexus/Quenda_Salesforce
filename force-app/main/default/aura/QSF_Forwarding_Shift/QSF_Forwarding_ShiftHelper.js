({
    
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
                   // console.log(accessToken.message);
                    //component.set("v.statusAccessToken", 'ERROR');
                    //component.set("v.accessToken", accessToken.message);
                }else{
                    component.set("v.statusAccessToken", 'OK');
                    component.set("v.accessToken", accessToken.data.access_token);
                  //  console.log("ACCESS TOKEN refreshed: ");
                    helper.checkAndCallFailedFunction(component,helper,failedFunction);
                    
                }
            } else {
                console.log("KO in WS when refresh Access Token");
                //console.log(response.getState());
                
            } 
            
        });
        $A.enqueueAction(action);
    },
    
    //CARGA la lista de servicios disponibles para el REENVIO (GET 1.1.2)
    loadForwardingServiceList : function(component, event ,helper) {
        
        var infoJson = '{';
         	infoJson= infoJson + '"tipo":"REENVIO",';
        	infoJson= infoJson + '"accessToken":"'+component.get("v.accessToken")+'",';
        
        	infoJson= infoJson + '"idUsuario":'+component.get("v.currentUser").QSF_Quenda_User_Id__c+',';
       		infoJson= infoJson + '"idOficina":'+component.get("v.currentUser").QSF_Office_Id__c+',';
        	infoJson= infoJson + '"idPuesto":'+component.get("v.currentUser").QSF_Place_Id__c;
        	infoJson= infoJson + '}';
        
        
        var action = component.get("c.getServiceList");
        action.setParams({
            "info":infoJson
            //"user": component.get("v.currentUser"),
            //"tipo": "REENVIO",
            //"puesto": JSON.stringify(component.get("v.place")),
            //"accessToken": component.get("v.accessToken")
            //"accessToken":'UXVlbmRhV1MxNTE2MjcwNjUyNTQzMC4wMjkxMjY1Njg3ODg0MTU2ODU='
        });
        action.setCallback(this, function(response) {
            if(component.isValid() && response.getState() === "SUCCESS") {
                var forwardingServiceList = response.getReturnValue();
                component.set("v.failedFunctionName",'ServiceList');
                if (forwardingServiceList.success == true){
                   // console.log(forwardingServiceList.data);
                    component.set("v.loadingMessage", $A.get("$Label.c.QSF_Available_Service_CL"));
                    component.set("v.forwardingServiceList", forwardingServiceList.data);
                } 
                else{//CONTROL DE ERRORES
                    helper.errorManagementNew(component,helper,'',forwardingServiceList.codError,forwardingServiceList.message);    
                }     
            } else {
                console.log("KO in forwardingServiceList");
                helper.switchSpinnerOff(component,'');//SPINNER OFF
                helper.errorManagementNew(component,helper,'ko','',$A.get("$Label.c.QSF_Service_Problem_CL"));
                //component.set("v.errorStatus", true);
                //component.set("v.errorMessage", "Error en el servidor de Servicios disponibles de Reenvío"); 
                
                
            }   
        });
        $A.enqueueAction(action);
    },
    
    //CARGA la lista de PUESTOS disponibles para el REENVIO (GET 1.1.3)
    loadForwardingPlaceList : function(component,helper) {
        
        
         var infoJson = '{';
        	infoJson= infoJson + '"accessToken":"'+component.get("v.accessToken")+'",';
       		infoJson= infoJson + '"idOficina":'+component.get("v.currentUser").QSF_Office_Id__c+',';
        	infoJson= infoJson + '"idServiceSelected":'+component.get("v.idSelectedService");
        	infoJson= infoJson + '}';
        
        
        var action = component.get("c.getForwardingPlaceList");
        action.setParams({        
            "info":infoJson
            //"user": component.get("v.currentUser"),
            //"idServiceSelected": component.get("v.idSelectedService"),
            //"accessToken": component.get("v.accessToken")
            //"accessToken":'UXVlbmRhV1MxNTE2MjcwNjUyNTQzMC4wMjkxMjY1Njg3ODg0MTU2ODU='
        });
        action.setCallback(this, function(response) {
            if(component.isValid() && response.getState() === "SUCCESS") {
                var forwardingPlaceList = response.getReturnValue();
                component.set("v.failedFunctionName",'PlaceList');
                if (forwardingPlaceList.success == true){
                    //console.log(forwardingPlaceList.data);
                    component.set("v.loadingMessage2", $A.get("$Label.c.QSF_Free_positions_available_CL"));
                    component.set("v.forwardingPlaceList", forwardingPlaceList.data);
                    
                } else{//CONTROL DE ERRORES                   
                    helper.errorManagementNew(component,helper,'',forwardingPlaceList.codError,forwardingPlaceList.message);   
                }
                
            } else {
                helper.switchSpinnerOff(component,'');//SPINNER OFF
                console.log("KO in forwardingPlaceList"); 
                helper.errorManagementNew(component,helper,'ko','',$A.get("$Label.c.QSF_Service_Problem_CL"));
            }   
        });
        $A.enqueueAction(action);
    },
    
    //COMPROBACIÓN DE SELECCIÓN DE SERVICIO PARA EL REENVIO (Actualización de interacciones)
    serviceCheck : function(component,helper) {
        helper.switchSpinnerOn(component,'Derivando atención...');//SPINNER ON       
        var ticket= JSON.stringify(component.get("v.nextShiftInfo")); //Ticket actual
        
        var idSelectedService = component.get("v.forwardingServiceList")[component.find("selectForwardingService").get("v.value")].id;
        component.set("v.idSelectedService",idSelectedService);
        
        if(component.find("selectForwardingPlace").get("v.value")!=""){
        	var idSelectedPlace= component.get("v.forwardingPlaceList")[component.find("selectForwardingPlace").get("v.value")].id;
        	component.set("v.idSelectedPlace",idSelectedPlace);
            }
        else {
            var idSelectedPlace= null;
            component.set("v.idSelectedPlace",idSelectedPlace);
        }
 
        
        var idCurrentService = component.get("v.nextShiftInfo").idServicio; //Cambiar por "idServicio" para comparación
		var nameSelectedService = component.get("v.forwardingServiceList")[component.find("selectForwardingService").get("v.value")].nombre;        
      //  console.log('Puesto seleccionado: '+idSelectedPlace);
      //  console.log('Servicio destino: ' +component.get("v.idSelectedService"));
      //  console.log('Servicio actual: '+idCurrentService);
        if (idSelectedService==idCurrentService){ //Comparacion de servicio actual y del seleccionado para DERIVACIÓN
           // console.log('Servicios iguales');
            component.set("v.sameService", true);
            }
        else{
          //  console.log('Servicios distintos');
            component.set("v.sameService", false);
        }
        helper.forwardingTicket(component,helper,component.get("v.sameService"));
		
        
	},
    
    //LLAMADA A WS DEL SERVICIO DE REENVIO (PUT 1.2.8)
    forwardingTicket : function(component,helper,sameService) {
        //console.log(component.get("v.nextShiftInfo").idCita) ;
        var forwardingTime = component.find("selectForwardingTime").get("v.value");
        var ticketPrueba= JSON.stringify(component.get("v.nextShiftInfo"));
        forwardingTime = parseInt(forwardingTime);
      //  console.log(typeof(forwardingTime));
        if(isNaN(forwardingTime)) {
            forwardingTime=null;
         //   console.log('tiempo igual a null');
        }else{
             forwardingTime = forwardingTime *60;
          //  console.log(forwardingTime);
        }
        console.log('FORWARDING TICKET ID INTERACCION');
        console.log(component.get("v.nextShiftInfo").idInteraccion);
        console.log('TICKET FORWARDING');
        console.log(ticketPrueba);
        
               
        var infoJson = '{';
        	infoJson= infoJson + '"idServicioDestino":'+component.get("v.idSelectedService")+',';
         	infoJson= infoJson + '"idInteraction":"'+ component.get("v.nextShiftInfo").idInteraccion+'",'; //Nuevo
            infoJson= infoJson + '"idioma":1,';
        	infoJson= infoJson + '"accessToken":"'+component.get("v.accessToken")+'",';
        	infoJson= infoJson + '"idCita":'+component.get("v.nextShiftInfo").idCita+',';
        	infoJson= infoJson + '"idUsuario":'+component.get("v.currentUser").QSF_Quenda_User_Id__c+',';
       		infoJson= infoJson + '"idOficina":'+component.get("v.currentUser").QSF_Office_Id__c+',';
        	infoJson= infoJson + '"segundosRetraso":'+forwardingTime+',';
        	infoJson= infoJson + '"idPuestoDestino":'+component.get("v.idSelectedPlace")+',';
        	infoJson= infoJson + '"idPuesto":'+component.get("v.currentUser").QSF_Place_Id__c;
        	infoJson= infoJson + '}';
        
        
        var ticket= JSON.stringify(component.get("v.nextShiftInfo"));
        var action = component.get("c.putForwardingTicket");
        action.setParams({
            "info":infoJson
            //"user": component.get("v.currentUser"), 
            //"idCita": component.get("v.nextShiftInfo").idCita,
            //"ticketInfo": ticket,
            //"idServicioDestino": component.get("v.idSelectedService"),
            //"idServicioDestino": 0,
            //"idioma": 1,
            //"segundosRetraso": forwardingTime,
            //"idPuestoDestino": component.get("v.idSelectedPlace"),
            //"accessToken": component.get("v.accessToken")
            //"accessToken":'UXVlbmRhV1MxNTE2MjcwNjUyNTQzMC4wMjkxMjY1Njg3ODg0MTU2ODU='
            
        });
        action.setCallback(this, function(response) {
            if(component.isValid() && response.getState() === "SUCCESS") {
                var forwardingStatus = response.getReturnValue();
                component.set("v.failedFunctionName",'forwardingTicket');
                if (forwardingStatus.success == true){
                  //  console.log("Status 'Cliente Derivado' : "+ forwardingStatus.data.Resultado);
                    if(sameService==true){ //Mismo servicio--> Se actualiza a Reenviada (Quenda), Abierta ()
                        helper.updateInteraction(component,helper,'forwarding',ticket,"WaitingAgent");
                    }
                    else if(sameService==false){ //Servicios distintos--> Se cierra la actual y Quenda crea la nueva
                        //helper.createInteraction(component,helper,'forwarding',ticket,null); //Debo añadir el mismo IDCITA que la cita ORIGINAL?
                        helper.updateInteraction(component,helper,'finish&Pause', ticket,"WaitingAgent");
                    }
                }
                else{//CONTROL DE ERRORES
                    helper.errorManagementNew(component,helper,'',forwardingStatus.codError,forwardingStatus.message);   
                }
            }
            else {
                console.log("KO-in forwardingClient ");
                helper.errorManagementNew(component,helper,'ko','',$A.get("$Label.c.QSF_Service_Problem_CL"));
                helper.switchSpinnerOff(component,'');//SPINNER OFF
            }   
        });
        $A.enqueueAction(action);
        
    },
    
    
    //CONTROL DE ERRORES VERSION NUEVA
    errorManagementNew : function(component, helper, status, codError, message) {
        if (status == 'ko') {
            component.set("v.errorStatus", true);
            component.set("v.errorMessage", message); 
            helper.switchSpinnerOff(component,'');//SPINNER OFF
        }else{
            if(codError=="ERR004"){
                component.set("v.errorStatus", true);
                component.set("v.errorMessage", message);
                helper.switchSpinnerOff(component,'');//SPINNER OFF
            }
            else if(codError=="ERR003"){ //Codigo de error referente a autenticación y token
                //  console.log('Funcion que falla por token:' +component.get("v.failedFunctionName"));
                component.set("v.statusAccessToken", 'ERROR');
                //  console.log(message);
                component.set("v.errorStatus", false);
                component.set("v.errorMessage", message);
            }else if(codError=="ERR002"){
                // console.log("Error por parametros incorrectos en: "+component.get("v.failedFunctionName"));
                //  console.log(message);
                component.set("v.errorStatus", false);
                component.set("v.errorMessage", message);
                helper.switchSpinnerOff(component,'');//SPINNER OFF
                if(component.get("v.failedFunctionName") == 'login'){
                    helper.switchSpinnerOff(component,'');//SPINNER OFF
                }
            }
                else if(codError=="ERR001"){ //PUESTO NO OCUPADO
                    helper.deleteUserPlaceInfo(component, helper);
                    component.set("v.errorStatus", true);
                    component.set("v.errorMessage", message);
                    //console.log(message);
                    //console.log(codError);
                    //helper.changeComponentView(component, 'LoginAgent');
                }
                    else if(codError=="ERR000"){
                        component.set("v.errorStatus", false);
                        component.set("v.errorMessage", message);
                        helper.switchSpinnerOff(component,'');//SPINNER OFF
                        
                        //console.log('Error generico');
                    }
                        else{
                            helper.switchSpinnerOff(component,'');//SPINNER OFF
                            console.log("Error por parametros incorrectos en: "+component.get("v.failedFunctionName"));
                            console.log(message);
                            component.set("v.errorStatus", false);
                            component.set("v.errorMessage", message);
                        }
        }    
    },
    
    //ACTUALIZACIÓN DE INTERACCIÓN 
    updateInteraction : function(component,helper,operation,ticket,view) {
       // console.log(operation);
		var action = component.get("c.updateInteraction");
        action.setParams({
            "user": component.get("v.currentUser"),
            "operation": operation,
            "ticketInfo": ticket
         });
        action.setCallback(this, function(response) {
	        if(component.isValid() && response.getState() === "SUCCESS") {
                var updateInter = response.getReturnValue();
             //   console.log("Status 'Update Interaction' : OK");
                if (operation!="finish&Next"){
               		helper.changeComponentView(component, view, null); 
                	helper.switchSpinnerOff(component,'');//SPINNER OFF
                    //nuevo Rafa
                	helper.closeSubTab(component);               
                	//nuevo Rafa
                	}
                
	        } else {
                console.log("KO-in updateInteraction with operation: " +operation);
                component.set("v.errorStatus", true);
                component.set("v.errorMessage", "Error al actualizar Interacción con operación "+operation);
                helper.changeComponentView(component, view, null); //Realizar cambio de vista aunque falle la actualizacion de la interaccion
                helper.switchSpinnerOff(component,'');//SPINNER OFF
                helper.closeSubTab(component); 
            }   
	    });
      $A.enqueueAction(action);
        
	},
    
    closeSubTab : function(component) {
      //  console.log("entro en CloseSubTab");
        /*
        sforce.console.getFocusedSubtabId(function(result){
            var tabId = result.id;
            console.log("id de la pestaña");
            console.log(tabId);
            sforce.console.closeTab(tabId);
        }); */
        
        //VERSION LIGHTNING
       // if(component.get("v.isLEX")){
        if(window.location.href.includes("lightning")){
            var workspaceAPI = component.find("workspace");
            console.log("entro en CloseSubTab");
            console.log(component.get("v.interactionTabId"));
            workspaceAPI.closeTab({tabId: component.get("v.interactionTabId")});
            
        } //VERSION CLASSIC
        else{
     //   console.log(component.get("v.interactionTabId"));
        sforce.console.closeTab(component.get("v.interactionTabId"));
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
    
    //CAMBIO DE VISTA
  	changeComponentView : function(component,view,timer,previousView) {
      //  console.log('entro a hacer el cambio de vista a: '+ view);
        var changeViewEvent = component.getEvent("changeView");
        changeViewEvent.setParams({
            "timerCount": timer,
            "view": view,
            "place":component.get("v.place"),
            "currentUser": component.get("v.currentUser"),
            "nextShiftInfo": component.get("v.nextShiftInfo"),
            "previousView": previousView,
            "accessToken": component.get("v.accessToken"),
            "automaticAttentionTime": component.get("v.automaticAttentionTime"),
            "interactionTabId": component.get("v.interactionTabId"),
            "errorStatus": component.get("v.errorStatus"),
            "errorMessage": component.get("v.errorMessage"),
            "isLEX": component.get("v.isLEX"), 
            "currentSeconds": "0",
            "idSelectedStatus":1
        }).fire();
        
        window.scrollTo(0, 0);
        
	},
    
    checkAndCallFailedFunction : function(component,helper,failedFunction) {
        if(failedFunction == 'PlaceList'){
            component.set("v.errorStatus", false);
           helper.loadForwardingPlaceList(component,helper);  //GET (1.1.3)
        }else if(failedFunction == 'ServiceList'){
           component.set("v.errorStatus", false);
             helper.loadForwardingServiceList(component,helper); //GET (1.1.2)
        }else if(failedFunction== 'forwardingTicket'){
            component.set("v.errorStatus", false);
            //helper.switchSpinner(component,'');//SPINNER OFF
            helper.forwardingTicket(component,helper,component.get("v.sameService"));
        }
        
    },
    
    
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
        //console.log('Hago spinner OFF');
        component.set("v.spinnerMsg", title);  
        $A.util.addClass(component.find("mySpinner"), "slds-hide");
        //component.set("v.showSpinner", !(component.get("v.showSpinner")));
   
    },
    
    
})