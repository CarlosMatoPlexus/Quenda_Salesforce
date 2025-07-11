({
    
    //CARGA DE NÚMERO DE CLIENTES EN COLA (WS-GET)(1.1.4)
    loadUnattendedShiftNumber : function(component, helper) {
        
        var infoJson = '{';
        infoJson= infoJson + '"idServicio":'+null+',';
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
                    helper.errorManagementNew(component,helper,'',unattendedShiftNumber.codError,unattendedShiftNumber.message);  
                }
            } else {
                console.log("KO-in loadUnattendedShiftNumber ");
                helper.errorManagementNew(component,helper,'ko','',$A.get("$Label.c.QSF_Service_Problem_CL"));
            }   
        });
        $A.enqueueAction(action);
    },
    
    
    //FIN Y PAUSA (PASO DE PARÁMETROS AL WS y LLAMADA A Func.UPDATE-INTERACTION)
    finishAndPause : function(component,helper) {
        
        var infoJson = '{';
        infoJson= infoJson + '"idCita":'+component.get("v.nextShiftInfo").idCita+',';
        infoJson= infoJson + '"accessToken":"'+component.get("v.accessToken")+'",';
        infoJson= infoJson + '"idUsuario":'+component.get("v.currentUser").QSF_Quenda_User_Id__c+',';
        infoJson= infoJson + '"idOficina":'+component.get("v.currentUser").QSF_Office_Id__c+',';
        infoJson= infoJson + '"idPuesto":'+component.get("v.currentUser").QSF_Place_Id__c+',';
        infoJson= infoJson + '"idInteraction":"'+component.get("v.nextShiftInfo").idInteraccion+'"';
        infoJson= infoJson + '}';
        
        
        component.set("v.failedFunctionName",'finishAndPause');
        // console.log('Status del AccessToken:' +component.get("v.statusAccessToken"));
        var ticket= JSON.stringify(component.get("v.nextShiftInfo"));
        var action = component.get("c.putFinishTicketAndPause");
        action.setParams({
            "info":infoJson
            //"user": component.get("v.currentUser"),
            //"idCita":component.get("v.nextShiftInfo").idCita,
            //"ticketInfo": ticket,
            //"accessToken": component.get("v.accessToken")
        });
        action.setCallback(this, function(response) {
            if(component.isValid() && response.getState() === "SUCCESS") {
                var ticket= JSON.stringify(component.get("v.nextShiftInfo"));
                var status = response.getReturnValue();
                if(status.success == true){
                    //   console.log("Status 'Finish&Pause' : "+ status.data.Resultado);
                    helper.updateInteraction(component,helper,"finish&Pause",ticket,"WaitingAgent");
                    //helper.changeComponentView(component, "WaitingAgent", null,null);
                }else{//CONTROL DE ERRORES
                    // helper.errorManagement(component, helper,'', status.message); 
                    helper.errorManagementNew(component,helper,'',status.codError,status.message);
                }
            } else {
                console.log("KO-in finishAndPause");
                helper.errorManagementNew(component,helper,'ko','',$A.get("$Label.c.QSF_Service_Problem_CL"));
            }   
        });
        $A.enqueueAction(action);
    },
    
    //FIN Y LLAMADA A SIGUIENTE TICKET (PASO DE PARÁMETROS AL WS y LLAMADA A Func.UPDATE-INTERACTION)
    finishAndNext : function(component,helper) {
        helper.switchSpinnerOn(component,'Finalizando...');//SPINNER ON
        
        var infoJson = '{';
        infoJson= infoJson + '"idSelectedService":'+null+',';
        infoJson= infoJson + '"idInteraction":"'+ component.get("v.oldShiftInfo").idInteraccion+'",'; //Nuevo
        infoJson= infoJson + '"idioma":1,';
        infoJson= infoJson + '"accessToken":"'+component.get("v.accessToken")+'",';
        infoJson= infoJson + '"idCita":'+component.get("v.oldShiftInfo").idCita+',';
        infoJson= infoJson + '"idUsuario":'+component.get("v.currentUser").QSF_Quenda_User_Id__c+',';
        infoJson= infoJson + '"idOficina":'+component.get("v.currentUser").QSF_Office_Id__c+',';
        infoJson= infoJson + '"idPuesto":'+component.get("v.currentUser").QSF_Place_Id__c;
        infoJson= infoJson + '}';
        
        
        var action = component.get("c.putFinishTicketAndNext");
        action.setParams({
            "info":infoJson
            //"user": component.get("v.currentUser"),
            //"ticketInfo": JSON.stringify(component.get("v.oldShiftInfo")),
            //"accessToken": component.get("v.accessToken")
        });
        action.setCallback(this, function(response) {
            if(component.isValid() && response.getState() === "SUCCESS") {
                component.set("v.failedFunctionName",'finishAndNext');
                var nextShiftInfo = response.getReturnValue();
                if (nextShiftInfo.success == true){      
                    if (nextShiftInfo.data.codTicket != ""){ //nuevo
                        //  console.log('Ticket siguiente turno "Finish&Next":');
                        //  console.log(nextShiftInfo.data);
                        // console.log('Ticket sin turno a finalizar "Finish&Next":');
                        // console.log(component.get("v.oldShiftInfo"));
                        component.set("v.nextShiftInfo", nextShiftInfo.data); //El nuevo ticket es recogido del PUT "FinishTicket&Next"
                        var newTicket= JSON.stringify(component.get("v.nextShiftInfo"));
                        var oldTicket= JSON.stringify(component.get("v.oldShiftInfo"));
                        //helper.startNextTicket(component,helper);
                        //helper.changeComponentView(component,view);
                        helper.updateInteraction(component,helper,"finish&Next",oldTicket,null); //Actualizo interaccion antigua
                        helper.updateInteraction(component,helper,"nextcall",newTicket,"AttentionProgress");  //Actualizo interaccion nueva
                        
                        
                       /* component.set("v.attentionTimeInSeconds",0);
                        console.log('Tiempo de atención ideal desde FIN Y SIGUIENTE');
                        helper.checkIdealTimeAttention(component, event, helper);*/
                        
                        
                    } else{
                        helper.switchSpinnerOff(component,'');//SPINNER OFF
                        helper.switchSpinnerOn(component,'No hay clientes en cola. Regresando a página de inicio');//SPINNER ON
                        component.set("v.errorStatus", true);//nuevo
                        component.set("v.errorMessage", "No hay clientes en cola. Regresando a página de inicio")//nuevo
                        var oldTicket= JSON.stringify(component.get("v.oldShiftInfo"));
                        helper.updateInteraction(component,helper,"finish&Next",oldTicket,"WaitingAgent"); //Actualizo interaccion antigua y vuelvo a WaitingAgent
                    }
                }else{//CONTROL DE ERRORES
                    // helper.errorManagement(component, helper,'', nextShiftInfo.message);
                    helper.errorManagementNew(component, helper,'', nextShiftInfo.codError,nextShiftInfo.message);
                    helper.switchSpinnerOff(component,'');//SPINNER OFF 
                }
            } else {
                //   console.log("Component is valid: "+component.isValid());
                // console.log("Status respuesta del WS: "+response.getState());
                 helper.errorManagementNew(component,helper,'ko','',$A.get("$Label.c.QSF_Service_Problem_CL"));
                console.log("KO-in Finish&Next- AttentionProgress ");
                helper.switchSpinnerOff(component,'');//SPINNER OFF
            }
        });
        $A.enqueueAction(action);
    },
    
    //ACTUALIZACIÓN DE LA INTERACCIÓN
    updateInteraction : function(component,helper,operation,ticket,view) {
        //console.log(ticket);
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
                helper.changeComponentView(component, view);
                helper.switchSpinnerOff(component,'');//SPINNER OFF
                helper.closeSubTab(component);   //Cerrar solo la pestaña de la interaccion
                //helper.closeAllTabs(component); //Cerrar todoas las pestañas            
            } else {
                console.log("KO-in updateInteraction in NoTicketAttention ");
                helper.changeComponentView(component, view); //Realizar cambio de vista aunque falle la actualizacion de la interaccion
                helper.switchSpinnerOff(component,'');//SPINNER OFF
                helper.closeSubTab(component);
                //helper.closeAllTabs(component); //Cerrar todoas las pestañas 
            }   
        });
        $A.enqueueAction(action);
    },
    
    // CERRAR LA PESTAÑA ACTUAL
    closeAllTabs : function(component) {   
        sforce.console.getPrimaryTabIds(function showTabId(result) {
            //Display the primary tab IDs
            console.log(result.ids);
            for(var i=0; i<result.ids.length; i++){
                sforce.console.closeTab(result.ids[i]);
                //  console.log('cerrada pestaña '+ i);
            }
        });
    },
    
    //CIERRA LA PESTAÑA ACTUAL
    closeSubTab : function(component) {
        //VERSION LIGHTNING
        //
        //if(component.get("v.isLEX")){
        if(window.location.href.includes("lightning")){
            var workspaceAPI = component.find("workspace");
            console.log("entro en CloseSubTab");
            console.log(component.get("v.interactionTabId"));
            workspaceAPI.closeTab({tabId: component.get("v.interactionTabId")});
        }
        else{//VERSION CLASSIC
            //  console.log("entro en CloseSubTab");
            sforce.console.getFocusedSubtabId(function(result){
                var tabId = result.id;
                console.log("id de la pestaña");
                console.log(tabId);
                sforce.console.closeTab(tabId);
            }); 
            // console.log(component.get("v.interactionTabId"));
            sforce.console.closeTab(component.get("v.interactionTabId"));
        }
        
    },
    
    
    
    restartTimer : function(component, date){
        //TIMER DISPLAY
        $('.timer').countimer('start');
        $('#timer_count').removeClass("ideal-time-expired");
        $(function(){
            setTimeout(function() {
                $('#timer_count').addClass("ideal-time-expired")
            }, 6000);
        });
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
                    //  console.log("ACCESS TOKEN refreshed: ");
                    helper.checkAndCallFailedFunction(component,helper,failedFunction);        
                }
            } else {
                // console.log("KO in WS when refresh Access Token");
                //console.log(response.getState()); 
            }      
        });
        $A.enqueueAction(action);
    },
    
    //LLAMADA A LA FUNCIÓN QUE HA FALLADO DEBIDO A ERROR EN EL TOKEN
    checkAndCallFailedFunction : function(component,helper,failedFunction) {
        if(failedFunction == 'finishAndPause'){
            helper.switchSpinnerOff(component,'');//SPINNER OFF
            helper.finishAndPause(component, helper);
            
        }else if(failedFunction == 'finishAndNext'){
            helper.switchSpinnerOff(component,'');//SPINNER OFF
            helper.finishAndNext(component, helper);
        }
    },
    
    
    
            //CONTROL DE ERRORES VERSION ANTIGUA
    errorManagement : function(component, helper, status, codError, message) {
        console.log(message);
        if (status == 'ko') {
            component.set("v.errorStatus", true);
            component.set("v.errorMessage", message); 
            console.log(message);
            helper.switchSpinnerOff(component,'');//SPINNER OFF
        }else{
            if(codError=="ERR002"){
              // console.log("Error por parametros incorrectos en: "+component.get("v.failedFunctionName"));
              //  console.log(message);
              console.log(message);
                component.set("v.errorStatus", true);
                component.set("v.errorMessage", message);
                helper.switchSpinnerOff(component,'');//SPINNER OFF
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
                        }
        }    
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
                            component.set("v.errorStatus", true);
                            component.set("v.errorMessage", message);
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
    
    
    //SI SE DETECTA UNA LIBERACIÓN DE PUESTO (EXTERNA) SE REDIRIGE A LA PANTALLA DE LOGIN
    deleteUserPlaceInfo : function(component, helper) {
        var action = component.get("c.deleteUserPlaceInfo");
        action.setParams({
            "user": component.get("v.currentUser")
        });
        action.setCallback(this, function(response) {
            if(component.isValid() && response.getState() === "SUCCESS") {
                var userUpdated = response.getReturnValue();
                //   console.log(userUpdated);
                if(userUpdated.QSF_Place_Id__c == null && userUpdated.QSF_Place__c == null ){
                    
                    helper.changeComponentView(component, 'LoginAgent');
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
    
    //FUNCIÓN PARA CAMBIO DE VISTA 
    changeComponentView : function(component,view,timer,previousView) {
        //console.log(component.get("v.currentUser"));
        $('#timer_count').removeClass("ideal-time-expired");
        clearTimeout(component.get("v.IdealTimeAttentionTimeOutId"));
        clearInterval(component.get("v.IdealTimeAttentionIntervalId"));
        
        var utilityBarAPI = component.find("UtilityBarEx");
        
        //console.log('Visible? '+response.utilityVisible);            
        utilityBarAPI.setUtilityHighlighted({
            highlighted: false
        })
        .catch(function(error) {
            console.log(error);
        });
        
       
        if(timer!='KO'){
             $('.timer').countimer('stop');
        } else{
            timer='00:00:00';
        }       
       
        //  console.log('entro a hacer el cambio de vista a: '+ view);
        //  console.log(component.get("v.interactionTabId"));
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
    
    AttentionTimeAfterRefreshPage : function(component, helper, idInteraction) {
        console.log("Llego al attention time de SIN TICKETS");
        console.log(idInteraction);
        var action = component.get("c.calculateAttentionTime");
        action.setParams({
            "idInteraction": idInteraction,
            "ticket": JSON.stringify(component.get("v.nextShiftInfo"))
        });
        action.setCallback(this, function(response) {
            if(component.isValid() && response.getState() === "SUCCESS") {
                var attentionTime = response.getReturnValue();
                console.log('Attention time: '+attentionTime);
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
                console.log("KO in Delete user Place Info");  
            }   
        });
        $A.enqueueAction(action);
        
    },
    
    loadTimeDisplay : function(component, helper) {
        if (component.get("v.previousView")!="Forwarding")  {
            $('.timer').countimer();
        }else{
            // console.log("vengo de FORWARDING");
            var timer = component.get("v.timerCount");
            //  console.log(timer);
            var parts = timer.split(':');
            //  console.log(parts);
            $('.timer').countimer(
                {
                    initHours: parts[0],
                    initMinutes: parts[1],
                    initSeconds: parts[2]
                });
        } 
    },
    
    
    isLightning: function (component, helper, event) {
        return UITheme.getUITheme;
    },
    
    tabsLightningManagment: function (workspaceAPI, interId , component, helper){
        
        workspaceAPI.getAllTabInfo().then(function(response) {
            console.log(response);
            var isAlreadyOpened = false;
            for (var i = 0; i < response.length; i++) {
                if (response[i].recordId == interId) {
                    isAlreadyOpened = true;
                    console.log('La tab ya está abierta');
                }
            }
            
            if(!isAlreadyOpened){
                workspaceAPI.openTab({
                        recordId: interId,
                        focus: true
                    }).then(function(response) {
                        component.set("v.interactionTabId",response);
                        console.log('opentabinfo' + response);
                        workspaceAPI.getTabInfo({
                            tabId: response
                        }).then(function(tabInfo) {
                            console.log("The recordId for this tab is: " + tabInfo.recordId);
                        });
                    }).catch(function(error) {
                        console.log(error);
                    });
            }
            
            
            
        }); 
        
    },
    
    checkIdealTimeAttention: function (component, helper, event) {
        if(component.get("v.nextShiftInfo").tiempoAtencionIdeal > 0){ // Si el tiempo es mayor que CERO se evalua el tiempo en curso con respecto al tiempo ideal
            var attentionInProgress = isNaN(component.get("v.attentionTimeInSeconds")*1000) ? 0:component.get("v.attentionTimeInSeconds")*1000;
            var attentionTimeAux = component.get("v.nextShiftInfo").tiempoAtencionIdeal*60000 ;
            var idealAttentionTimeMilisec = attentionInProgress > attentionTimeAux ? 500 :(attentionTimeAux - attentionInProgress) ;
            console.log(attentionInProgress);
            console.log(attentionTimeAux);
            console.log('Activado Tiempo Ideal -> Tiempo restante:-> '+ idealAttentionTimeMilisec);
            var idealAttentionTime = (component.get("v.nextShiftInfo").tiempoAtencionIdeal)*60000 ; 
            
            var IdealTimeAttentionTimeOutId =  setTimeout(function() {
                $('#timer_count').addClass("ideal-time-expired");
                
                var utilityBarAPI = component.find("UtilityBarEx");
                
                //utilityBarAPI.getUtilityInfo().then(function(response) {
                //var myUtilityInfo = response;
                // console.log('Visible? '+response.utilityVisible);
                //if(!response.utilityVisible){
                //VERSION SENCILLA
                /*
                    utilityBarAPI.setUtilityHighlighted({
                        highlighted: true
                    });*/
            //VERSION SENCILLA
            
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