({
    //CARGA DE LISTA DE CLIENTES EN COLA SEGÚN SELECCION DE SERVICIO (WS)
    loadUnattendedShiftList : function(component, helper) {
       // console.log("Valor de idServicio que llega a la funcion: "+component.get("v.idSelectedService"));
       
         var infoJson = '{';
        	infoJson= infoJson + '"idServicio":'+component.get("v.idSelectedService")+',';
        	infoJson= infoJson + '"accessToken":"'+component.get("v.accessToken")+'",';
        	infoJson= infoJson + '"idUsuario":'+component.get("v.currentUser").QSF_Quenda_User_Id__c+',';
       		infoJson= infoJson + '"idOficina":'+component.get("v.currentUser").QSF_Office_Id__c+',';
        	infoJson= infoJson + '"idPuesto":'+component.get("v.currentUser").QSF_Place_Id__c;
        	infoJson= infoJson + '}';
        
        var action = component.get("c.getUnattendedShiftList");
        action.setParams({
            "info":infoJson
            //"user": component.get("v.currentUser"),
            //"idServicio": component.get("v.idSelectedService"),
            //"accessToken": component.get("v.accessToken")
        });
        action.setCallback(this, function(response) {
            if(component.isValid() && response.getState() === "SUCCESS") {
                var unattendedShiftList = response.getReturnValue();
                component.set("v.failedFunctionName",'ShiftList');
                if (unattendedShiftList.success == true){
                    //component.set("v.unattendedShiftList", unattendedShiftList);
                    //Función para adaptar la hora de la cita
                    console.log(unattendedShiftList.data);
                    //component.set("v.loadingMessage", 'Seleccione un cliente de la lista...');
                    //component.set("v.unattendedShiftList", unattendedShiftList.data)
                    helper.updateDateHourFromList(component,unattendedShiftList.data);
                    //console.log(unattendedShiftList.data);
                    //component.set("v.accessToken", 'UXVlbmRhV1MxNTE2MjcwNjUyNTQzMC4wMjkxMjY1Njg3ODg0MTU2ODU=');
                }
                else{//CONTROL DE ERRORES
                    helper.errorManagementNew(component,helper,'',unattendedShiftList.codError, unattendedShiftList.message);
                }
            } else {
                console.log("KO-unattendedShiftList"); 
               helper.errorManagementNew(component,helper,'ko','',$A.get("$Label.c.QSF_Service_Problem_CL"));
            }   
        });
        $A.enqueueAction(action);
    },
    
    updateDateHourFromList : function(component, list){  
        var i;
        if(list.lenght!=0){
            var listSize= list.length;
            for (i=0; i < listSize; i++){
                var d = list[i].fechaCita;
                //console.log(d);
                var myHourDate = $A.localizationService.formatDate(d, "hh:mm ");
                //console.log(myHourDate);
                list[i].fechaCita=myHourDate; 
            }
        }
       // console.log('Nueva lista');
        //console.log(list);
        component.set("v.loadingMessage", 'Seleccione un cliente de la lista...');
        component.set("v.unattendedShiftList", list);  
    },
    
    //SELECCION de TICKET y LLAMADA A "NEXT TICKET" PARA ATENCIÓN POSTERIOR EN VISTA "AttentionProgress"
    selectTicket : function(component,helper,view){
        if(component.get("v.unattendedShiftList").length!=0){
            if (component.find("selectTicket").get("v.value") != ""){
                helper.switchSpinner(component,'Turno priorizado...');//SPINNER ON
                var indxTicket = component.find("selectTicket").get("v.value");
                var ticket = component.get("v.unattendedShiftList");
                var selectedTicket = ticket[indxTicket];
                component.set("v.nextShiftInfo",selectedTicket);
               console.log('el ticket seleccionado es: ');
                console.log(selectedTicket);
                //var ticket2= JSON.stringify(component.get("v.nextShiftInfo"));
                //helper.updateInteraction(component,helper,"nextCall",ticket2,view);
                //helper.changeComponentView(component, view);
               	helper.startNextTurn(component, helper);
            }
        }else{
            component.set("v.errorMessage", "No hay clientes en espera");
            component.set("v.errorStatus", true);
            component.set("v.currentSeconds", '0'); // Se inicializa la variable de nuevo para que empiece a contar el tiempo si se vuelve al componente de Waiting
        } 
    },
    
    startNextTurn : function(component,helper) {
        
         var infoJson = '{';
        	infoJson= infoJson + '"idServicio":'+component.get("v.nextShiftInfo").idServicio+',';
            infoJson= infoJson + '"idioma":1,';
        	infoJson= infoJson + '"accessToken":"'+component.get("v.accessToken")+'",';
        	infoJson= infoJson + '"idCita":'+component.get("v.nextShiftInfo").idCita+',';
        	infoJson= infoJson + '"idUsuario":'+component.get("v.currentUser").QSF_Quenda_User_Id__c+',';
       		infoJson= infoJson + '"idOficina":'+component.get("v.currentUser").QSF_Office_Id__c+',';
        	infoJson= infoJson + '"idPuesto":'+component.get("v.currentUser").QSF_Place_Id__c;
        	infoJson= infoJson + '}';
        
        var action = component.get("c.putNextTicket");  // (PUT 1.2.2) 
        action.setParams({
            "info":infoJson
            //"user": component.get("v.currentUser"),
            //"idCita" : component.get("v.nextShiftInfo").idCita,
            //"idServicio" : component.get("v.nextShiftInfo").idServicio,
            //"idioma": 1,
            //"accessToken": component.get("v.accessToken")
        });
        action.setCallback(this, function(response) {
            if(component.isValid() && response.getState() === "SUCCESS") {
                component.set("v.failedFunctionName",'startNextTurn');
                var info = response.getReturnValue();
                if (info.success == true){
                  console.log("Siguiente ticket OK");
                  console.log(component.get("v.nextShiftInfo"));
                    var ticket= JSON.stringify(component.get("v.nextShiftInfo"));
                    helper.updateInteraction(component,helper,"nextCall",ticket,"AttentionProgress");
                }
                else{//CONTROL DE ERRORES
                    helper.errorManagementNew(component,helper,'',info.codError, info.message); 
                    console.log(info);
                }
                
            } else {
                console.log("KO-in startNextTurn"); 
                //component.set("v.errorMessage", 'Error en servidor de Siguiente ticket priorizado');
                //component.set("v.errorStatus", true);
                helper.errorManagementNew(component,helper,'ko','',$A.get("$Label.c.QSF_Service_Problem_CL"));
                helper.switchSpinnerOff(component,'...');//SPINNER OFF  
            } 
        });
        $A.enqueueAction(action);
    },
    
    updateInteraction : function(component,helper,operation,ticket,view) {
      //  console.log(operation);
        var action = component.get("c.updateInteraction");
        action.setParams({
            "user": component.get("v.currentUser"),
            //"currentInter": interaction,
            "operation": operation,
            "ticketInfo": ticket
        });
        action.setCallback(this, function(response) {
            if(component.isValid() && response.getState() === "SUCCESS") {
                var updateInter = response.getReturnValue();
               // console.log("Status 'Update Interaction' : OK");
                //helper.openTabInter(component,helper, updateInter);
                helper.changeComponentView(component, view);
                helper.switchSpinnerOff(component,'');//SPINNER OFF
            } else {
                console.log("KO-in updateInteraction ");
                console.log("Componente valido " + component.isValid());
                console.log("Status de la respuesta " + response.getState());
                helper.changeComponentView(component, view);
                helper.switchSpinnerOff(component,'');//SPINNER OFF
            }   
        });
        $A.enqueueAction(action);
    },
    
    //ABRE PESTAÑA NUEVA CON ID INTERACCIÓN
    openTabInter: function(component, helper, newInter) {     
        if(newInter.Id == 'undefined') { 
           // console.log('Undefined interaction');
        } else {
            
             if(component.get("v.isLEX")){
            				 //VERSION LIGHTNING
                            var workspaceAPI = component.find("workspace");
                            workspaceAPI.openTab({
                                recordId: newInter,
                                focus: true
                            }).then(function(response) {
                                component.set("v.interactionTabId",response);
                                workspaceAPI.getTabInfo({
                                    tabId: response
                                }).then(function(tabInfo) {
                                    console.log("The recordId for this tab is: " + tabInfo.recordId);
                                });
                            }).catch(function(error) {
                                console.log(error);
                            });
                    
        				}
            else{
            console.log('Interaction Id: '+newInter.Id);  
            //Getting URL page
            var sPageURL = decodeURIComponent(window.location.search.substring(1)); //You get the whole decoded URL of the page.
            var url = sPageURL.substring(sPageURL.indexOf("https"), sPageURL.indexOf("salesforce.com"))+'salesforce.com/';
            // New tab with current Interaction
            sforce.console.openPrimaryTab(null, url+newInter.Id, true);
        }
        }
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
                   // console.log(accessToken.message);
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
                helper.switchSpinnerOff(component,'');//SPINNER OFF
                //console.log(response.getState());      
            }   
        });
        $A.enqueueAction(action);
    },
    
    //LLAMADA A LA FUNCIÓN QUE HA FALLADO DEBIDO A ERROR EN EL TOKEN
    checkAndCallFailedFunction : function(component,helper,failedFunction) {
        if(failedFunction == 'ShiftList'){
            component.set("v.errorStatus", false);
            helper.loadUnattendedShiftList(component, helper);
        }else if(failedFunction == 'startNextTurn'){
            component.set("v.errorStatus", false);
            helper.startNextTurn(component, helper);
        }  
    },
    
    //CONTROL DE ERRORES
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
            else if(codError=="ERR003"){
               // console.log('Funcion que falla por token:' +component.get("v.failedFunctionName"));
                component.set("v.statusAccessToken", 'ERROR');
               // console.log(message);
                component.set("v.errorStatus", false);
                component.set("v.errorMessage", message);
            }
            else if(codError=="ERR002"){
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
                //helper.changeComponentView(component, 'LoginAgent');
            }
            else if(codError=="ERR000"){
                component.set("v.errorStatus", false);
                component.set("v.errorMessage", message);
               	helper.switchSpinnerOff(component,'');//SPINNER OFF
                 //console.log('Error generico');
            }
            else{
              //  console.log("Error por parametros incorrectos en: "+component.get("v.failedFunctionName"));
              //  console.log(message);
                component.set("v.errorStatus", true);
                component.set("v.errorMessage", message);
                helper.switchSpinnerOff(component,'');//SPINNER OFF
                
                if(component.get("v.failedFunctionName") == 'nextTurn'|| component.get("v.failedFunctionName") == 'withoutShift'){
                    helper.switchSpinnerOff(component,'');//SPINNER OFF
                }
            }
        }    
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
    
    
    //FUNCIÓN PARA CAMBIO DE VISTA
    changeComponentView : function(component,view) {
        
        clearTimeout(component.get("v.AutoRecallIntervalId"));
      //  console.log('Hago cambio de vista a: ' +view);
        var changeViewEvent = component.getEvent("changeView");
        changeViewEvent.setParams({
            "view": view,
            "place":component.get("v.place"),
            "currentUser": component.get("v.currentUser"),
            "nextShiftInfo": component.get("v.nextShiftInfo"),
            "errorStatus": component.get("v.errorStatus"),
            //"programedInter": component.get("v.programedInter"),
            "accessToken": component.get("v.accessToken"),
            "isLEX": component.get("v.isLEX"),
            "currentSeconds": component.get("v.currentSeconds"),
            "automaticAttentionTime": component.get("v.automaticAttentionTime"),
            "idSelectedStatus":1
            
        }).fire();
        window.scrollTo(0, 0);  
    },
    
    //LLAMADA AUTOMÁTICA
    automaticNextTicket : function(component, helper, time){
        
        console.log('Prueba de SetInterval para Llamada automatica');
        var seconds=0;
        var currentSeconds=parseInt(component.get("v.currentSeconds"));
       // var automaticAttentionTime= component.get("v.automaticAttentionTime") / 1000; //Viene en milisegundos
        var automaticAttentionTime= component.get("v.automaticAttentionTime");
        var timeleft = currentSeconds != 0 ? (automaticAttentionTime-currentSeconds) : automaticAttentionTime ;
        console.log('currentSeconds: '+currentSeconds +'  automaticAttentionTime: '+automaticAttentionTime +  '  timeleft: '+ timeleft);
        var AutoRecallIntervalId =  setInterval(function() {
            //COMPROBACION DE SELECCION DE SERVICIO
            seconds++;
            console.log(seconds);
            if(seconds>timeleft){
                console.log('Se cumple el tiempo y se hace la rellamada');
               
                clearInterval(component.get("v.AutoRecallIntervalId")); 
                component.set("v.AutoRecallIntervalId", '');
                component.set("v.callAutomaticNow", true); 
            }
            else{
                component.set("v.currentSeconds", (seconds+currentSeconds).toString());
            }
            
        }, 1000); //Se entra cada segundo
        
        
        component.set("v.AutoRecallIntervalId", AutoRecallIntervalId);
    },
        
        
        
    
    //SI SE DETECTA UNA LIBERACIÓN DE PUESTO (EXTERNA) SE REDIRIGE A LA PANTALLA DE LOGIN
    deleteUserPlaceInfo : function(component, helper) {
        var action = component.get("c.deleteUserPlaceInfo");
        action.setParams({
            "user": component.get("v.currentUser"),
             "errorStatus": component.get("v.errorStatus"),
            "errorMessage": component.get("v.errorMessage"),
        });
        action.setCallback(this, function(response) {
            if(component.isValid() && response.getState() === "SUCCESS") {
                var userUpdated = response.getReturnValue();
              //  console.log(userUpdated);
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
    
    
})