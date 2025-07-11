({
    //CARGA DE NÚMERO DE CLIENTES EN COLA (WS-GET)(1.1.4)
    loadUnattendedShiftNumber : function(component, helper) {
        
        if (component.get("v.idSelectedService")== undefined ){
            console.log('Servicio undefined');
            component.set("v.idSelectedService", null);
        }
            var infoJson = '{';
        	infoJson= infoJson + '"idServicio":'+component.get("v.idSelectedService")+',';
        	infoJson= infoJson + '"accessToken":"'+component.get("v.accessToken")+'",';
        	infoJson= infoJson + '"idUsuario":'+component.get("v.currentUser").QSF_Quenda_User_Id__c+',';
       		infoJson= infoJson + '"idOficina":'+component.get("v.currentUser").QSF_Office_Id__c+',';
        	infoJson= infoJson + '"idPuesto":'+component.get("v.currentUser").QSF_Place_Id__c;
        	infoJson= infoJson + '}';
        
        //console.log(component.get("v.idSelectedService"));
        var action = component.get("c.getUnattendedShiftNumber");
        action.setParams({
            "info":infoJson
            //"user": component.get("v.currentUser"),
            //"idServicio": component.get("v.idSelectedService"),
            //"accessToken": component.get("v.accessToken")  
        });
        action.setCallback(this, function(response) {
            if(component.isValid() && response.getState() === "SUCCESS") {
                component.set("v.failedFunctionName",'loadShiftNumber');
                var unattendedShiftNumber = response.getReturnValue();
                if(unattendedShiftNumber.success == true){
                    //console.log(unattendedShiftNumber.data.numTurnosPendientes);
                    component.set("v.unattendedShiftNumber", unattendedShiftNumber.data.numTurnosPendientes);
                }
                else{//CONTROL DE ERRORES
                    //helper.errorManagement(component,helper,'',unattendedShiftNumber.message);  
                    helper.errorManagementNew(component,helper,'',unattendedShiftNumber.codError, unattendedShiftNumber.message);
                }
            } else {
                console.log("KO-in loadUnattendedShiftNumber ");
               helper.errorManagementNew(component,helper,'ko','',$A.get("$Label.c.QSF_Service_Problem_CL"));
            }   
        });
        $A.enqueueAction(action);
    },
    
    //RELLAMADA POR PANTALLA(PASO DE PARÁMETROS AL WS)
    makeScreenRecall : function(component,helper) {
        component.set("v.errorStatus", false); //Elimino un posible mensaje de error en operación anterior
          var infoJson = '{';
            infoJson= infoJson + '"idioma":1,';
        	infoJson= infoJson + '"idCita":'+component.get("v.nextShiftInfo").idCita+',';
        	infoJson= infoJson + '"accessToken":"'+component.get("v.accessToken")+'",';
        	infoJson= infoJson + '"idUsuario":'+component.get("v.currentUser").QSF_Quenda_User_Id__c+',';
       		infoJson= infoJson + '"idOficina":'+component.get("v.currentUser").QSF_Office_Id__c;
        	infoJson= infoJson + '}';

        
        var action = component.get("c.putScreenRecall");
        action.setParams({
            "info":infoJson
            //"user": component.get("v.currentUser"),
            //"idCita": component.get("v.nextShiftInfo").idCita,
            //"ticketInfo": JSON.stringify(component.get("v.nextShiftInfo")),
            //"idioma": 1,
            //"accessToken": component.get("v.accessToken")
            // "accessToken":'UXVlbmRhV1MxNTE2MjcwNjUyNTQzMC4wMjkxMjY1Njg3ODg0MTU2ODU='
        });
        action.setCallback(this, function(response) {
            if(component.isValid() && response.getState() === "SUCCESS") {
                component.set("v.failedFunctionName",'makeScreenRecall');
                var recallStatus = response.getReturnValue();
                if(recallStatus.success == true){ 
                    // console.log("Status Rellamada por pantalla : "+ recallStatus.data.Resultado);
                }
                else{//CONTROL DE ERRORES
                    //helper.errorManagement(component,helper,'',recallStatus.message);  
                    helper.errorManagementNew(component,helper,'',recallStatus.codError, recallStatus.message); 
                }
            } else {
                console.log("KO-in makeScreenRecall ");
                helper.errorManagementNew(component,helper,'ko','',$A.get("$Label.c.QSF_Service_Problem_CL"));
            }   
        });
        $A.enqueueAction(action);
    },
    
    
    //INICIO REAL DE ATENCIÓN (FUNCIONALIDAD TIEMPO ATENCION SIN TRÁNSITO)
    clientHasCome : function(component,helper) {
        console.log('LLego a CLIENT HAS COME');
        $('.timer').countimer('start');
        
        var ticket= JSON.stringify(component.get("v.nextShiftInfo"));
     
        var infoJson = '{';
       		infoJson= infoJson + '"idCita":'+component.get("v.nextShiftInfo").idCita+',';
        	infoJson= infoJson + '"accessToken":"'+component.get("v.accessToken")+'",';
        	infoJson= infoJson + '"idUsuario":'+component.get("v.currentUser").QSF_Quenda_User_Id__c+',';
        	infoJson= infoJson + '"idPuesto":'+component.get("v.currentUser").QSF_Place_Id__c;
        	infoJson= infoJson + '}';
        
        //console.log(infoJson);
        
        var action = component.get("c.putStartNoTransitAttention");
        action.setParams({
            "info":infoJson
            //"user": component.get("v.currentUser"),
            //"idCita":component.get("v.nextShiftInfo").idCita,
            //"accessToken": component.get("v.accessToken")
        });
        action.setCallback(this, function(response) {
            if(component.isValid() && response.getState() === "SUCCESS") {
                console.log('Lo que devuelve NO TRANSIT');
                console.log(response.getReturnValue());
                component.set("v.failedFunctionName",'clientHasCome');
                var noTransitStatus = response.getReturnValue();
                if(noTransitStatus.success == true){ 
                   	console.log("Status 'Cliente Sin Transito': "+ noTransitStatus.data.Resultado);
                  	helper.updateInteractionNoTransitTime(component,helper,'noTransit',ticket);
                }
                else{//CONTROL DE ERRORES
                    //helper.errorManagement(component,helper,'',absentStatus.message);  
                    console.log('Error en servidor de atencion sin transito'); 
                    helper.errorManagementNew(component,helper,'',noTransitStatus.codError, noTransitStatus.message);  
                }   
            } else {
                console.log("KO-in NoTransitTime ");
                helper.errorManagementNew(component,helper,'ko','',$A.get("$Label.c.QSF_Service_Problem_CL"));
            }   
        });
        $A.enqueueAction(action);
        
        
               
    },
    
    //MARCAR CLIENTE AUSENTE (PASO DE PARÁMETROS AL WS)
    markAbsentClient : function(component,helper) {
        
        
        var infoJson = '{';
       	 	infoJson= infoJson + '"idCita":'+component.get("v.nextShiftInfo").idCita+',';
        	infoJson= infoJson + '"accessToken":"'+component.get("v.accessToken")+'",';
        infoJson= infoJson + '"idInteraction":"'+ component.get("v.nextShiftInfo").idInteraccion+'",'; //Nuevo
        	infoJson= infoJson + '"idUsuario":'+component.get("v.currentUser").QSF_Quenda_User_Id__c+',';
       		infoJson= infoJson + '"idOficina":'+component.get("v.currentUser").QSF_Office_Id__c+',';
        	infoJson= infoJson + '"idPuesto":'+component.get("v.currentUser").QSF_Place_Id__c;
        	infoJson= infoJson + '}';
        
        helper.switchSpinnerOn(component,'Cliente ausente...');//SPINNER ON 
        var ticket= JSON.stringify(component.get("v.nextShiftInfo"));
        var action = component.get("c.putAbsentClient");
        action.setParams({
            "info":infoJson
            //"user": component.get("v.currentUser"),
            //"idCita":component.get("v.nextShiftInfo").idCita,
            //"accessToken": component.get("v.accessToken")
        });
        action.setCallback(this, function(response) {
            if(component.isValid() && response.getState() === "SUCCESS") {
                component.set("v.failedFunctionName",'markAbsentClient');
                
                var absentStatus = response.getReturnValue();
                if(absentStatus.success == true){ 
                    //  console.log("Status 'Marcar Cliente Ausente' : "+ absentStatus.data.Resultado);
                    helper.updateInteraction1(component,helper,'absent',ticket,"WaitingAgent");
                }
                else{//CONTROL DE ERRORES
                    //helper.errorManagement(component,helper,'',absentStatus.message);   
                    helper.errorManagementNew(component,helper,'',absentStatus.codError, absentStatus.message);  
                }   
            } else {
                console.log("KO-in markAbsentClient ");
                helper.errorManagementNew(component,helper,'ko','',$A.get("$Label.c.QSF_Service_Problem_CL"));
            }   
        });
        $A.enqueueAction(action);
        
    },
    
    //FIN Y PAUSA (PASO DE PARÁMETROS AL WS y LLAMADA A Func.UPDATE-INTERACTION)
    finishAndPause : function(component,helper) {
        
         var infoJson = '{';
        	infoJson= infoJson + '"idCita":'+component.get("v.nextShiftInfo").idCita+',';
       		infoJson= infoJson + '"idInteraction":"'+ component.get("v.nextShiftInfo").idInteraccion+'",'; //Nuevo
        	infoJson= infoJson + '"accessToken":"'+component.get("v.accessToken")+'",';
        	infoJson= infoJson + '"idUsuario":'+component.get("v.currentUser").QSF_Quenda_User_Id__c+',';
       		infoJson= infoJson + '"idOficina":'+component.get("v.currentUser").QSF_Office_Id__c+',';
        	infoJson= infoJson + '"idPuesto":'+component.get("v.currentUser").QSF_Place_Id__c;
        	infoJson= infoJson + '}';
        
        helper.switchSpinnerOn(component,'Finalizando...');//SPINNER ON 
        var ticket= JSON.stringify(component.get("v.nextShiftInfo"));
        console.log(component.get("v.nextShiftInfo"));
        console.log(ticket);
        var action = component.get("c.putFinishTicketAndPause");
        action.setParams({
            "info":infoJson
            //"user": component.get("v.currentUser"),
            //"ticketInfo": ticket,
            //"idCita":component.get("v.nextShiftInfo").idCita,
            //"accessToken": component.get("v.accessToken")
        });
        action.setCallback(this, function(response) {
            console.log(response.getReturnValue());
            if(component.isValid() && response.getState() === "SUCCESS") {
                component.set("v.failedFunctionName",'finishAndPause');
                var status = response.getReturnValue();
                
                if(status.success == true){ 
                    //console.log("Status 'Finish&Pause' : "+ status.data.Resultado);
                    helper.updateInteraction1(component,helper,'finish&Pause',ticket,"WaitingAgent");
                }
                else{//CONTROL DE ERRORES
                    //helper.errorManagement(component,helper,'',status.message);
                    helper.errorManagementNew(component,helper,'',status.codError, status.message);
                    console.log(status);
                }
            } else {
                console.log("KO-in finish&Pause");
                helper.errorManagementNew(component,helper,'ko','',$A.get("$Label.c.QSF_Service_Problem_CL"));
            }   
        });
        $A.enqueueAction(action);
    },
    
    //FINALIZAR Y SIGUIENTE (PASO DE PARÁMETROS AL WS y LLAMADA A Func.UPDATE-INTERACTION)
    finishAndNext : function(component,helper) {
        
        $('#timer_count').removeClass("ideal-time-expired");
        clearTimeout(component.get("v.IdealTimeAttentionTimeOutId"));
        clearInterval(component.get("v.IdealTimeAttentionIntervalId"));
        component.set("v.lastOperationFinishAndNext", true);
        
         var infoJson = '{';
        	infoJson= infoJson + '"idSelectedService":'+component.get("v.idSelectedService")+',';
            infoJson= infoJson + '"idInteraction":"'+ component.get("v.oldShiftInfo").idInteraccion+'",'; //Nuevo
            infoJson= infoJson + '"idioma":1,';
        	infoJson= infoJson + '"accessToken":"'+component.get("v.accessToken")+'",';
        	infoJson= infoJson + '"idCita":'+component.get("v.oldShiftInfo").idCita+',';
        	infoJson= infoJson + '"idUsuario":'+component.get("v.currentUser").QSF_Quenda_User_Id__c+',';
       		infoJson= infoJson + '"idOficina":'+component.get("v.currentUser").QSF_Office_Id__c+',';
        	infoJson= infoJson + '"idPuesto":'+component.get("v.currentUser").QSF_Place_Id__c;
        	infoJson= infoJson + '}';
        
        helper.switchSpinnerOn(component,'Finalizando y esperando siguiente cliente...');//SPINNER ON
        var action = component.get("c.putFinishTicketAndNext");
        action.setParams({
            "info":infoJson
            //"user": component.get("v.currentUser"),
            //"ticketInfo": JSON.stringify(component.get("v.oldShiftInfo")),
            //"idSelectedService": component.get("v.idSelectedService"),
            //"accessToken": component.get("v.accessToken")
        });
        action.setCallback(this, function(response) {
            if(component.isValid() && response.getState() === "SUCCESS") {
                component.set("v.failedFunctionName",'finishAndNext');
                var nextShiftInfo = response.getReturnValue();
                if(nextShiftInfo.success == true){
                    if (nextShiftInfo.data.codTicket != ""){ // Existe un siguiente ticket
                        component.set("v.errorStatus", false); //Elimino un posible mensaje de error anterior
                        console.log('Ticket siguiente turno "Finish&Next":');
                        console.log(nextShiftInfo.data);
                        component.set("v.nextShiftInfo", nextShiftInfo.data); //El nuevo ticket es recogido del PUT "FinishTicket&Next"
                        
                        var newTicket= JSON.stringify(component.get("v.nextShiftInfo"));
                        var oldTicket= JSON.stringify(component.get("v.oldShiftInfo"));
                        helper.updateInteraction1(component,helper,"finish&Next",oldTicket,null); //Actualizo interaccion antigua
                        helper.updateInteraction1(component,helper,"nextcall",newTicket,"AttentionProgress");  //Actualizo interaccion nueva
                        // helper.updateInteraction1(component,helper,"nextcall",newTicket,null);  //Version sin parametro VIEW
                        
                        var name = component.get("v.nextShiftInfo.Nombre");
                        //console.log('Atención sin transito?  '  +component.get("v.nextShiftInfo.atencionSinTransito"));
                        if((name != "")){ //Si la cita está autenticada se muestran nombres y apellidos en la pantalla
                            component.set("v.authenticated", true);
                        }else {
                            component.set("v.authenticated", false);
                        }
                        
                        
                        if(component.get("v.nextShiftInfo.atencionSinTransito")){
                            var maxNoTransitTime = component.get("v.nextShiftInfo.tiempoMaxSinTransito");
                            console.log('Rellamada automatica en Fin y Siguiente');
                            helper.NoTrasitTimeConfig(component, helper );
                            helper.NoTrasitInitButtonConfig(component, helper );
                            if(maxNoTransitTime!= 0){
                   				 helper.automaticNextTicket(component,helper, maxNoTransitTime);
                				}
                        }
                        
                        
                       component.set("v.attentionTimeInSeconds",0);
                        console.log('Tiempo de atención ideal desde FIN Y SIGUIENTE');
                        helper.checkIdealTimeAttention(component, event, helper);
                        
                    }else{
                        component.set("v.errorStatus", true);//nuevo
                        component.set("v.errorMessage", "No hay clientes en cola para este servicio. Volviendo a pantalla de inicio")//nuevo
                        var oldTicket= JSON.stringify(component.get("v.oldShiftInfo"));
                        helper.updateInteraction1(component,helper,"finish&Next",oldTicket,"WaitingAgent"); //Actualizo interaccion antigua y vuelvo a WaitingAgent
                        
                    }
                }
                else{//CONTROL DE ERRORES
                    //helper.errorManagement(component,helper,'',nextShiftInfo.message);
                    helper.errorManagementNew(component,helper,'',nextShiftInfo.codError, nextShiftInfo.message); 
                }
            } else {
                console.log("KO-in Finish&Next- AttentionProgress ");
                helper.errorManagementNew(component,helper,'ko','',$A.get("$Label.c.QSF_Service_Problem_CL"));
                helper.switchSpinnerOff(component,'...');//SPINNER OFF
            }
        });
        $A.enqueueAction(action);
    },
    
    //ACTUALIZACIÓN DE INTERACCIÓN 
    updateInteraction1 : function(component,helper,operation,ticket,view) {
        console.log("Operation  " +operation);
        var action = component.get("c.updateInteraction");
        action.setParams({
            "user": component.get("v.currentUser"),
            "operation": operation,
            "ticketInfo": ticket
        });
        action.setCallback(this, function(response) {
            if(component.isValid() && response.getState() === "SUCCESS") {
                var updateInter = response.getReturnValue();
                //  console.log("Status 'Update Interaction' : OK");
                if (operation!="finish&Next"){
                    helper.changeComponentView(component, view, null); //Si la operacion es "finishAndNext", se actualiza la interaccion pero no hay cambio de vista
                    helper.switchSpinnerOff(component,'...');//SPINNER OFF
                    helper.restartTimer(component,'',operation);  // RCV 05/02 RESTART TIMER
                    if (operation!="nextcall"){ 
                        helper.closeSubTab(component);  
                    } else{ 
                        helper.closeSubTab(component);
                        //sforce.console.closeTab(component.get("v.oldTabId")); //RAFA PRUEBAS CIERRE
                        //abro tab
                        var sPageURL = decodeURIComponent(window.location.search.substring(1)); //You get the whole decoded URL of the page.
                        var url = sPageURL.substring(sPageURL.indexOf("https"), sPageURL.indexOf("salesforce.com"))+'salesforce.com/';
                        var interId = component.get("v.nextShiftInfo.idInteraccion");
                        // sforce.console.openPrimaryTab(null, url+interId, true); 
                        
                        
                        //if(component.get("v.isLEX")){
                        if(window.location.href.includes("lightning")){
            				 //VERSION LIGHTNING
                            console.log('Abrimos nueva interacción- Fin y Siguiente: '+interId);
                            var workspaceAPI = component.find("workspace");
                            workspaceAPI.openTab({
                                recordId: interId,
                                focus: true
                            }).then(function(response) {
                                component.set("v.interactionTabId",response);
                                workspaceAPI.getTabInfo({
                                    tabId: response
                                }).then(function(tabInfo) {
                                    console.log("The recordId for this tab is: " + tabInfo.recordId);
                                });
                               // workspaceAPI.focusTab({tabId : response});
                            }).catch(function(error) {
                                console.log(error);
                            });
                    
        				}
                        else{
                        sforce.console.openPrimaryTab(null, url+interId, true, '', (function(result){
                            // console.log('entro en opensucces');
                            // console.log(result);
                            //Report whether opening the new tab was successful
                            if (result.success == true) {
                                //  console.log('Primary tab successfully opened');
                                component.set("v.interactionTabId",result.id);
                                //  console.log(component.get("v.interactionTabId"));
                            } else {
                                //  console.log('Primary tab cannot be opened');
                            }
                        }) 
                        );
                        }
                        
                        
                        
                        
                        
                    }
                }else if (view=="WaitingAgent"){//PRUEBA
                    helper.closeSubTab(component);
                    helper.changeComponentView(component, view, null);
                    helper.switchSpinnerOff(component,'...');//SPINNER OFF
                }
                
            } else { //Aunque la actualización de la interacción falle se continua con el proceso de atención
                
                if (operation!="finish&Next"){
                    helper.changeComponentView(component, view, null); //Si la operacion es "finishAndNext", se actualiza la interaccion pero no hay cambio de vista
                    helper.switchSpinnerOff(component,'...');//SPINNER OFF
                    helper.restartTimer(component,'',operation);  //RCV 05/02 RESTART TIMER
                    if (operation!="nextcall"){ 
                        helper.closeSubTab(component);  
                    } else{ 
                        helper.closeSubTab(component);
                        //sforce.console.closeTab(component.get("v.oldTabId"));  //RAFA PRUEBAS CIERRE
                        //abro tab
                        var sPageURL = decodeURIComponent(window.location.search.substring(1)); //You get the whole decoded URL of the page.
                        var url = sPageURL.substring(sPageURL.indexOf("https"), sPageURL.indexOf("salesforce.com"))+'salesforce.com/';
                        var interId = component.get("v.nextShiftInfo.idInteraccion");
                        if(interId != ''){ //Solo abro pestaña si hay interacción asociada
                            //if(!component.get("v.isLEX")){
                             if(!window.location.href.includes("lightning")){
                            //VERSION CLASSIC 
                            
                            sforce.console.openPrimaryTab(null, url+interId, true);
                        }else{
                            //VERSION LIGHTNING
                            console.log(interId);
                            var workspaceAPI = component.find("workspace");
                            workspaceAPI.openTab({
                                recordId: interId,
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
                        }
                    }
                }else if (view=="WaitingAgent"){//PRUEBA
                    helper.closeSubTab(component);
                    helper.changeComponentView(component, view, null);
                    helper.switchSpinnerOff(component,'...');//SPINNER OFF
                }
                
                
                console.log("KO-in updateInteraction with operation: " +operation);
                //component.set("v.errorMessage", 'Error por fallo en WS en Actualización de Interacción');
                //component.set("v.errorStatus", true);
                
            }   
        });
        $A.enqueueAction(action); 
        
        
        
    },
    
    //ACTUALIZACIÓN DE INTERACCIÓN
    updateInteractionNoTransitTime : function(component,helper,operation,ticket) {
        console.log("Operation en SIN TRANSITO  " +operation);
        var action = component.get("c.updateInteractionNoTransitTimeApex");
        action.setParams({
            "user": component.get("v.currentUser"),
            "operation": operation,
            "ticketInfo": ticket
        });
        action.setCallback(this, function(response) {
            if(component.isValid() && response.getState() === "SUCCESS") {
                 var updateInter = response.getReturnValue();
                if(updateInter.success == true){
                    console.log("Actualizacion de interaccion de Tiempo sin tránsito Correcta");
                }
                           		
            }else{
                console.log(" KO en Actualizacion de interaccion de Tiempo sin tránsito");
            }
                
        });
          $A.enqueueAction(action); 
    },
    
    
    
                           
    
    //REINICIO DEL CONTADOR CON PARADA
    restartTimer : function(component, date, operation){
        if(operation=="nextcall"){
        console.log("entro en REStART TIMER");
           
        //TIMER DISPLAY
        $('.timer').countimer('destroy');
         $('.timer').countimer(
                    {
                        initHours: "00",
                        initMinutes: "00",
                        initSeconds: "00"
                    });
        
            if(component.get("v.nextShiftInfo.atencionSinTransito")){
                 $('.timer').countimer('stop');
            }
       
        /*$('#timer_count').removeClass("ideal-time-expired");
        $(function(){
            setTimeout(function() {
                $('#timer_count').addClass("ideal-time-expired")
            }, 10000);
        });*/
            }
    },
    
    
    //FUNCIÓN QUE CIERRA LA PESTAÑA/FICHA DE INTERACCIÓN QUE ESTÁ EN CURSO
    closeSubTab : function(component) {
       //if (component.get("v.isLEX")){
        if(window.location.href.includes("lightning")){
        var workspaceAPI = component.find("workspace");
       	workspaceAPI.closeTab({tabId: component.get("v.interactionTabId")});
       }
        else {
        //  console.log("entro en CloseSubTab");
         sforce.console.getFocusedSubtabId(function(result){
            var tabId = result.id;
            console.log("id de la pestaña");
            console.log(tabId);
            sforce.console.closeTab(tabId);
        });
        }
        
        //  console.log(component.get("v.interactionTabId"));
        //sforce.console.closeTab(component.get("v.interactionTabId"));
        
    },
    
    //FUNCIÓN QUE OBTIENE EL ID DE LA PESTAÑA QUE HABRÁ QUE CERRAR EN EL CASO DE FIN Y SIGUIENTE TURNO
    getOldIdSubTab : function(component) { //ANA
        //  console.log("entro en CloseSubTab");
        
        //if (component.get ("v.isLEX")){
        if(window.location.href.includes("lightning")){
       	component.set("v.oldTabId",component.get("v.interactionTabId"));
       }
        else{
        sforce.console.getFocusedSubtabId(function(result){
            var tabId = result.id;
            //  console.log("id de la pestaña");
            //  console.log(tabId);
            component.set("v.oldTabId", tabId);
        });
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
                    //  console.log("ACCESS TOKEN refreshed: ");
                    helper.checkAndCallFailedFunction(component,helper,failedFunction);   
                }
            } else {
                console.log("KO in WS when refresh Access Token");
                //console.log(response.getState());
                if(failedFunction == 'finishAndPause'|| failedFunction == 'markAbsentClient'){
                    helper.switchSpinnerOff(component,'');//SPINNER OFF
                }
            } 
        });
        $A.enqueueAction(action);
    },
    
    //LLAMADA A LA FUNCIÓN QUE HA FALLADO DEBIDO A ERROR EN EL TOKEN
    checkAndCallFailedFunction : function(component,helper,failedFunction) {
        if(failedFunction == 'finishAndPause'){
            component.set("v.errorStatus", false);
            helper.switchSpinnerOff(component,'');//SPINNER OFF
            helper.finishAndPause(component, helper);
        }else if(failedFunction == 'finishAndNext'){
            component.set("v.errorStatus", false);
            helper.finishAndNext(component, helper);
        }else if(failedFunction== 'makeScreenRecall'){
            component.set("v.errorStatus", false);
            helper.makeScreenRecall(component,helper); // PUT(1.2.7)
        }else if(failedFunction == 'markAbsentClient'){
            component.set("v.errorStatus", false);
            helper.switchSpinnerOff(component,'');//SPINNER OFF
            helper.markAbsentClient(component, helper); // PUT(1.2.6)
        }else if(failedFunction == 'loadShiftNumber'){
            component.set("v.errorStatus", false);
            helper.loadUnattendedShiftNumber(component, helper);
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
                    helper.switchSpinnerOff(component,'');//SPINNER OFF
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
    errorManagementNew : function(component, helper, status, codError, message) {
        console.log(message);
        if (status == 'ko') {
            component.set("v.errorStatus", true);
            component.set("v.errorMessage", message); 
            helper.switchSpinnerOff(component,'');//SPINNER OFF
        }else{
            if(codError=="ERR004"){
                component.set("v.errorStatus", true);
                component.set("v.errorMessage", message);
                helper.switchSpinnerOff(component,'');//SPINNER OFF
                //console.log(codError);
            }
            else if(codError=="ERR003"){
                //  console.log('Funcion que falla por token:' +component.get("v.failedFunctionName"));
                component.set("v.statusAccessToken", 'ERROR');
                //  console.log(message);
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
            }else if(codError=="ERR000"){ //ERROR GENERICO
                component.set("v.errorStatus", false);
                component.set("v.errorMessage", message);
                helper.switchSpinnerOff(component,'');//SPINNER OFF
                //helper.deleteUserPlaceInfo(component, helper);
                //helper.changeComponentView(component, 'LoginAgent');
            }
                else{
                    helper.switchSpinnerOff(component,'');//SPINNER OFF
                    console.log("Error por parametros incorrectos en: "+component.get("v.failedFunctionName"));
                    console.log(message);
                    component.set("v.errorStatus", false);
                    component.set("v.errorMessage", message); 
                    if(component.get("v.failedFunctionName") == 'finishAndPause'|| component.get("v.failedFunctionName") == 'markAbsentClient'){
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
    
    //SPINNER PARA RELLAMADA POR PANTALLA (por tiempo)
    timeoutSpinner : function(component,helper, title){     
        component.set("v.spinnerMsg", title);      
        var spinner = component.find("mySpinner");
        helper.switchSpinnerOn(component,title);//SPINNER OFF
        setTimeout(function(){ 
             helper.switchSpinnerOff(component,'');//SPINNER OFF
        }, 6000);
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
                //  console.log(userUpdated);
                if(userUpdated.QSF_Place_Id__c == null && userUpdated.QSF_Place__c == null ){
                    
                    helper.changeComponentView(component, 'LoginAgent',null);
                     helper.switchSpinnerOff(component,'');//SPINNER OFF
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
        
        //Vuelvo a poner la barra inferior en el color correcto
        //sforce.console.setCustomConsoleComponentButtonStyle('background-color:#9c9c9c;');
        
        console.log('entro a hacer el cambio de vista a: '+ view);
        
        
		/*$('#timer_count').removeClass("ideal-time-expired");
        clearTimeout(component.get("v.IdealTimeAttentionTimeOutId"));
        clearInterval(component.get("v.IdealTimeAttentionIntervalId"));      */  
        
        if(component.get("v.timeOutId")!='' && view!="AttentionProgress"){ //Se destruye el proceso de TIMEOUT si se cambia de vista
            console.log("Se desactiva el timer automatico de Atencion sin tránsito");
            clearTimeout(component.get("v.timeOutId"));
        }
        if(view=="WaitingAgent"){
            component.set("v.idSelectedService",null);//cuando vuelva a WaitingAgent muestro de nuevo el total de turnos pendientes
        }
        
       if(view!="AttentionProgress"){ //Se destruye el proceso de TIMEOUT si se cambia de vista
            console.log("Se desactiva el timer automatico de PARPADEO");
           $('#timer_count').removeClass("ideal-time-expired");
           clearTimeout(component.get("v.IdealTimeAttentionTimeOutId"));
           clearInterval(component.get("v.IdealTimeAttentionIntervalId"));
        }
        
        var changeViewEvent = component.getEvent("changeView");
        changeViewEvent.setParams({
            "timerCount": timer,
            "view": view,
            "place":component.get("v.place"),
            "currentUser": component.get("v.currentUser"),
            "nextShiftInfo": component.get("v.nextShiftInfo"),
            "previousView": previousView,
            "idSelectedService": component.get("v.idSelectedService"),
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
    
    //SE CALCULA EL TIEMPO DE ATENCIÓN EN CURSO UNA VEZ SE REFRESCA LA PAGINA CON F5
    AttentionTimeAfterRefreshPage : function(component, helper, idInteraction) {
        console.log("Llego al Calculo de attention time");
        var action = component.get("c.calculateAttentionTime");
        action.setParams({
            "idInteraction": idInteraction,
            "ticket": JSON.stringify(component.get("v.nextShiftInfo"))
        });
        action.setCallback(this, function(response) {
            if(component.isValid() && response.getState() === "SUCCESS") {
                var attentionTime = response.getReturnValue();
                //  console.log(attentionTime);
                var parts = attentionTime.split(':');
                $('.timer').countimer(
                    {
                        initHours: parts[0],
                        initMinutes: parts[1],
                        initSeconds: parts[2]
                    });
                
                var currentSeconds= parseInt(parts[0])*3600 + parseInt(parts[1])*60 + parseInt(parts[2]);
                console.log('Tiempo de atención en segundos:');
                console.log(currentSeconds);
                component.set("v.attentionTimeInSeconds",currentSeconds);
                
            }
            else {
                console.log("KO in Attention Time After refresh page");  
            }   
        });
        $A.enqueueAction(action);
        
    },
    
    //LLAMADA AUTOMÁTICA Atención sin TRÁNSITO
    automaticNextTicket : function(component, helper, time){
        
        var timeOutId = setTimeout(
            $A.getCallback(function() {
                //console.log("Llamada automática NO TRANSIT");
                helper.AutomaticNoTrasitAttentionButtonConfig(component, helper);
                helper.clientHasCome(component, helper);
            }) ,(time*1000)); //El tiempo llega en segundos
        
        component.set ("v.timeOutId", timeOutId);
        //console.log('Identificador del TIMEOUT');
        //console.log(timeOutId);
        
    },      
    
    //CONFIGURACIÓN TIMER ATENCION SIN TRÁNSITO (EN ESPERA)
    NoTrasitTimeConfig : function(component, helper){
        $('.timer').countimer(
                    {
                        initHours: "00",
                        initMinutes: "00",
                        initSeconds: "00"
                    });
         $('.timer').countimer('stop');
    },
        
    //CONFIGURACIÓN BOTONADURA ATENCION SIN TRÁNSITO (EN ESPERA)
    NoTrasitInitButtonConfig : function(component, helper){
        $A.util.addClass(component.find('btresend'), 'slds-hide');
        $A.util.addClass(component.find('btendAttention'), 'slds-hide');
        $A.util.addClass(component.find('btendAndNext'), 'slds-hide');
        $A.util.removeClass(component.find('btStartAttention'), 'slds-hide');
        $A.util.removeClass(component.find('btabsent'), 'slds-hide');
        $A.util.removeClass(component.find('btrecall'), 'slds-hide');
     
    },
    
    //CONFIGURACIÓN BOTONADURA ATENCION SIN TRÁNSITO (INICIADA)
    NoTrasitAttentionButtonConfig : function(component, helper){
        $A.util.addClass(component.find('btStartAttention'), 'slds-hide');
        $A.util.addClass(component.find('btabsent'), 'slds-hide');
        $A.util.addClass(component.find('btrecall'), 'slds-hide');
        $A.util.removeClass(component.find('btresend'), 'slds-hide');
        $A.util.removeClass(component.find('btendAttention'), 'slds-hide');
        $A.util.removeClass(component.find('btendAndNext'), 'slds-hide');
    },
    
     //CONFIGURACIÓN BOTONADURA ATENCION SIN TRÁNSITO Y LLAMADA AUTOMÁTICA (INICIADA)
    AutomaticNoTrasitAttentionButtonConfig : function(component, helper){
        $A.util.addClass(component.find('btStartAttention'), 'slds-hide');
        $A.util.removeClass(component.find('btresend'), 'slds-hide');
        $A.util.removeClass(component.find('btendAttention'), 'slds-hide');
        $A.util.removeClass(component.find('btendAndNext'), 'slds-hide');
    },
    
     //SE COMPRUEBA QUE EXISTE ALGUN VALOR EN TIEMPO IDEAL DE ATENCIÓN PARA LA ACTIVACIÓN DEL PARPADEO DE LA BARRA Y TIEMPO EN ROJO
    checkIdealTimeAttention: function(component, event, helper){
        if(component.get("v.nextShiftInfo").tiempoAtencionIdeal > 0){ // Si el tiempo es mayor que CERO se evalua el tiempo en curso con respecto al tiempo ideal
            var attentionInProgress = isNaN(component.get("v.attentionTimeInSeconds")*1000) ? 0 : component.get("v.attentionTimeInSeconds")*1000;
            var attentionTimeAux = component.get("v.nextShiftInfo").tiempoAtencionIdeal*60000 ; //Viene en minutos
            var idealAttentionTimeMilisec = attentionInProgress > attentionTimeAux ? 500 :(attentionTimeAux - attentionInProgress) ;
            console.log(attentionInProgress);
            console.log(attentionTimeAux);
            console.log('Activado Tiempo Ideal -> Tiempo restante:-> '+ idealAttentionTimeMilisec);
            // var idealAttentionTime = (component.get("v.nextShiftInfo").tiempoAtencionIdeal)*60000 ; 
            
            var IdealTimeAttentionTimeOutId =  setTimeout(function() {
                $('#timer_count').addClass("ideal-time-expired");
                
                var utilityBarAPI = component.find("UtilityBarEx");
            
            
            //VERSIÓN COMPLEJA 
            if(window.location.href.includes("lightning")){//CONTROL DE PARPADEO DE BARRA DE CONSOLA EN LIGHTNING EXPERIENCE
                var IdealTimeAttentionIntervalId = setInterval($A.getCallback(function () {
                    var progresToggleIcon = component.get('v.progressToggleIcon') == true ? false : true;    
                    component.set('v.progressToggleIcon', progresToggleIcon); 
                    
                    utilityBarAPI.getUtilityInfo().then(function(responseOpen) {
                        component.set("v.isOpenComponent",responseOpen.utilityVisible);
                    })
                    .catch(function(error) {
                        // console.log(error);
                    });
                    
                    if(component.get("v.isOpenComponent")==false ){
                        utilityBarAPI.setUtilityHighlighted(
                            { highlighted : progresToggleIcon == true ? true : false });
                        //utilityBarAPI.addClass("backgroundTimeExpired");
                    }else{
                        utilityBarAPI.setUtilityHighlighted(
                            { highlighted : false });                            
                    }
                    
                }), 1000);
                component.set("v.IdealTimeAttentionIntervalId", IdealTimeAttentionIntervalId); 
            }else{//CONTROL DE PARPADEO DE BARRA DE CONSOLA EN CLASSIC
                var IdealTimeAttentionIntervalIdClassic = setInterval($A.getCallback(function () {
                    var res;
                    var progresToggleIcon = component.get('v.progressToggleIcon') == true ? false : true;    
                    component.set('v.progressToggleIcon', progresToggleIcon); 
                    sforce.console.isCustomConsoleComponentWindowHidden(function(result){
                        res = result;
                        // console.log(result.success);
                        // console.log('Cerrado?: '+result.hidden);
                        // console.log('Toggle?: '+progresToggleIcon);
                        if(result.hidden){
                            if(progresToggleIcon){
                                sforce.console.setCustomConsoleComponentButtonStyle('background-color:#FF3232;');
                            }else{
                                sforce.console.setCustomConsoleComponentButtonStyle('background-color:#C3C3C3;');
                            }
                            
                        }else{
                            //  console.log('Componente abierto');
                            sforce.console.setCustomConsoleComponentButtonStyle('background-color:#C3C3C3;');
                        }
                    });
                    
                    
                    //sforce.console.setCustomConsoleComponentButtonStyle('background-color:#FF3232;');
                    
                    
                }), 1000);
                component.set("v.IdealTimeAttentionIntervalId", IdealTimeAttentionIntervalIdClassic); 
                
            }
            
        }, idealAttentionTimeMilisec);
           component.set("v.IdealTimeAttentionTimeOutId", IdealTimeAttentionTimeOutId); 
       }
        
    },
    
    
    
})