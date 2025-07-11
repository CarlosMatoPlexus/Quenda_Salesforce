({
    
    
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
    changeComponentView : function(component,view) {
       // console.log('Hago cambio de vista a: ' +view);
        var changeViewEvent = component.getEvent("changeView");
        
        changeViewEvent.setParams({
            "view": view,
            "place":component.get("v.place"),
            "currentUser": component.get("v.currentUser"),
            "nextShiftInfo": component.get("v.nextShiftInfo"),
            "idSelectedService": component.get("v.idSelectedService"),
             "automaticAttentionTime": component.get("v.automaticAttentionTime"),
            "accessToken": component.get("v.accessToken"),
            "errorStatus": "true",
            "errorMessage": component.get("v.errorMessage"),
            "isLEX": component.get("v.isLEX"),
            "currentSeconds": "0"
        }).fire();
        window.scrollTo(0, 0);
    },

    //SOLICITUD DE LISTA DE SERVICIOS DE ATENCIÓN RÁPIDA (GET 1.1.8)
    loadPreAServiceList : function(component, helper) {
        console.log('Entramos en la carga de la lista de servicios');
        
        var infoJson = '{';
         	infoJson= infoJson + '"tipo":"PREATENCION",';
        	infoJson= infoJson + '"accessToken":"'+component.get("v.accessToken")+'",';
        
        	infoJson= infoJson + '"idUsuario":'+component.get("v.currentUser").QSF_Quenda_User_Id__c+',';
       		infoJson= infoJson + '"idOficina":'+component.get("v.currentUser").QSF_Office_Id__c+',';
        	infoJson= infoJson + '"idPuesto":'+component.get("v.currentUser").QSF_Place_Id__c;
        	infoJson= infoJson + '}';
        
        
        var action = component.get("c.getServiceList");
        action.setParams({
            "info":infoJson
            //"user": component.get("v.currentUser"),
            //"tipo": "PREATENCION",
            //"accessToken": component.get("v.accessToken")
        });
        
        action.setCallback(this, function(response) {
            console.log(component.isValid());
            console.log(response.getState());
            if(component.isValid() && response.getState() === "SUCCESS") {
                var preAServiceList = response.getReturnValue();
                component.set("v.failedFunctionName",'loadServices');
                //console.log(preAServiceList);
                //console.log(preAServiceList.servicios);
                //console.log(preAServiceList.success);
                if (preAServiceList.success == true){
                    console.log('Lista de servicios:');
                    console.log(preAServiceList.data);
                    //console.log(preAServiceList.data.startTimeAttention);
                    component.set("v.startAttentionTime",preAServiceList.data.horaInicioAtencion);
                    component.set("v.endAttentionTime",preAServiceList.data.horaFinAtencion);
                   // console.log(preAServiceList.data.endTimeAttention);
                    component.set("v.loadingMessage", $A.get("$Label.c.QSF_Select_service_CL"));
                    component.set("v.preAServiceList", preAServiceList.data.servicios);
                    // helper.switchSpinner(component,'');//SPINNER OFF
                }
                else{
                    console.log(preAServiceList.codError);
                    helper.errorManagementNew(component,helper,'',preAServiceList.codError,preAServiceList.message);
                }
            } else {
                console.log("KO-preAServiceList");
               	helper.errorManagementNew(component,helper,'ko','',$A.get("$Label.c.QSF_Service_Problem_CL"));
            }   
        });
        $A.enqueueAction(action);
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
    
    
    startPA : function(component, helper) {  
        //helper.startNoTicketAttention(component,helper,"WithoutShift");
       var timeControl='0';
        if (component.get("v.printingTicket")){
        timeControl = (document.getElementById("timepicker2")).value;
            }
        
        var infoJson = '{';
            infoJson= infoJson + '"idioma":1,';
        	infoJson= infoJson + '"accessToken":"'+component.get("v.accessToken")+'",';
        	infoJson= infoJson + '"idUsuario":'+component.get("v.currentUser").QSF_Quenda_User_Id__c+',';
        	infoJson= infoJson + '"idServicio":'+component.get("v.idSelectedService")+',';
       		infoJson= infoJson + '"idOficina":'+component.get("v.currentUser").QSF_Office_Id__c+',';
        	infoJson= infoJson + '"localTimeString":"'+timeControl+'",';
        	infoJson= infoJson + '"idPuesto":'+component.get("v.currentUser").QSF_Place_Id__c;
        	infoJson= infoJson + '}';
        

      //  console.log(timeControl);
        var action = component.get("c.putNextNoTicket");
        action.setParams({
            "info":infoJson
            //"user": component.get("v.currentUser"),
            //"idioma": 1,
            //"idServicio": component.get("v.idSelectedService"),
            //"localTimeString": timeControl,
            //"accessToken": component.get("v.accessToken")
        });
        action.setCallback(this, function(response) {
            if(component.isValid() && response.getState() === "SUCCESS") {
                var nextTicketPA = response.getReturnValue();
                component.set("v.failedFunctionName",'quickAttention');
                if (nextTicketPA.success == true){
              //  console.log(nextTicketPA.data);
                component.set("v.nextShiftInfo", nextTicketPA.data); //El nuevo ticket es recogido del PUT NO TICKET ATTENTION
                var ticket= JSON.stringify(component.get("v.nextShiftInfo"));
                helper.updateInteractionPA(component,helper,"noTicket",ticket,"WithoutShift"); 
                }
                else{
                  //  console.log(nextTicketPA.codError);
                    helper.errorManagementNew(component,helper,'',nextTicketPA.codError,nextTicketPA.message);       
                }
            } else {
                console.log("KO-in NextNoTicketAttention ");
                helper.errorManagementNew(component,helper,'ko','',$A.get("$Label.c.QSF_Service_Problem_CL"));
            }
        });
        $A.enqueueAction(action);  
    },
    
    //ACTUALIZACIÓN DE INTERACCIÓN SEGUN PARÁMETRO "OPERACIÓN"
    updateInteractionPA : function(component,helper,operation,ticket,view) {
        var timeControl='0';
        if (component.get("v.printingTicket")){
        timeControl = (document.getElementById("timepicker2")).value;
            }
      //  console.log(timeControl);
      //  console.log('Operation: '+operation);
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
                helper.changeComponentView(component, view);
                helper.switchSpinnerOff(component,'');//SPINNER OFF
                console.log("KO-in updateInteraction ");}   
        });
        $A.enqueueAction(action);
    },
    
    //SOLICITUD DE NUEVO TOKEN POR FALLO EN LLAMADA A WS
    refreshToken : function(component,helper,failedFunction) {
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
                    helper.switchSpinnerOff(component,'');//SPINNER OFF
                    //component.set("v.errorMessage", 'Error al actualizar el puesto del usuario');
                    component.set("v.errorMessage", accessToken.message);
                    component.set("v.errorStatus", true);
                }else{
                    component.set("v.statusAccessToken", 'OK');
                    component.set("v.accessToken", accessToken.data.access_token);
                   // console.log("ACCESS TOKEN refreshed: ");
                    helper.checkAndCallFailedFunction(component,helper,failedFunction);            
                }
            } else {
                console.log("KO in WS when refresh Access Token");
                if(failedFunction == 'login'){
                    helper.switchSpinnerOff(component,'');//SPINNER OFF
                }
            }   
        });
        $A.enqueueAction(action);
    },
     //IDENTIFICACIÓN DE OPERACIÓN FALLIDA POR TOKEN Y RELLAMADA DE LA MISMA
    checkAndCallFailedFunction : function(component,helper,failedFunction) {
        if(failedFunction == 'quickAttention'){
            component.set("v.errorStatus", false);
            helper.startPA(component,helper);
        }else if(failedFunction == 'loadServices'){
            component.set("v.errorStatus", false);
            helper.loadPreAServiceList(component,helper);
        }
    },
    
	//CONTROL DE ERRORES : IDENTIFICACIÓN Y CONTROL DE DISPLAY POR PANTALLA
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
            if(codError=="ERR003"){
               // console.log('Funcion que falla por token:' +component.get("v.failedFunctionName"));
                component.set("v.statusAccessToken", 'ERROR');
              //  console.log(message);
                
                component.set("v.errorStatus", false);
                component.set("v.errorMessage", message);
            }
            
            else if(codError=="ERR002"){
              //  console.log("Error por parametros incorrectos en: "+component.get("v.failedFunctionName"));
              //  console.log(message);
                component.set("v.errorStatus", false);
                component.set("v.errorMessage", message);
                helper.switchSpinnerOff(component,'');//SPINNER OFF
                if(component.get("v.failedFunctionName") == 'login'){
                    helper.switchSpinnerOff(component,'');//SPINNER OFF
                }
            }else if(codError=="ERR001"){
                
                component.set("v.errorStatus", false);
                component.set("v.errorMessage", message); 
                helper.deleteUserPlaceInfo(component, helper);
                 //component.set("v.errorMessage", message);  No visible al usuario
            }
            else if(codError=="ERR000"){
              //  console.log("Error generico ERRO000: "+component.get("v.failedFunctionName"));
              //  console.log(message);
                component.set("v.errorStatus", false);
                component.set("v.errorMessage", message); 
                helper.switchSpinnerOff(component,'');//SPINNER OFF
                if(component.get("v.failedFunctionName") == 'login'){
                    helper.switchSpinnerOff(component,'');//SPINNER OFF
                }
            }
        }    
    }, 
    
    
    //SOLICITUD DE HORA LOCAL ACTUAL CON RESPECTO AL USUARIO
    getLocalTime : function(component, helper) {
        var action = component.get("c.getCurrentTime");        
        action.setCallback(this, function(response) {
            if(component.isValid() && response.getState() == "SUCCESS") {
                var time = response.getReturnValue();
                component.set("v.localTimeString","00:00:00");
                component.set("v.localTimeMax",time[0]+':'+time[1]+':'+time[2]);
               console.log(component.get("v.localTimeMax"));
                component.set("v.localTime.hour",time[0]);
                component.set("v.localTime.minute",time[1]);
                component.set("v.localTime.second",time[2]);
                component.set("v.restrictionTime.hour",time[0]);
                component.set("v.restrictionTime.minute",time[1]);
                component.set("v.restrictionTime.minuteCurrentHour",time[1]);
                helper.buildTimeList(component, helper, 'hour');
                helper.buildTimeList(component, helper, 'minute');
            } else {
                console.log("KO-getLocalTime");
            }   
        });
        $A.enqueueAction(action);
    },
    
    //CREACIÓN DE LISTA DE HORAS O MINUTOS SEGUN VALOR DE "OPTION"
    buildTimeList : function(component, helper, option) {
        var action = component.get("c.getTimeList");
        action.setParams({
            "option": option
        });
        action.setCallback(this, function(response) {
            if(component.isValid() && response.getState() == "SUCCESS") {
                var timeList = response.getReturnValue();
                if (option == 'hour'){
                    component.set("v.hourList",timeList);
                }else{
                    component.set("v.localTime.minute",timeList[0]);
                    component.set("v.minuteList",timeList);
                }
            } else {
                console.log("KO-buildTimeList");
            }   
        });
        $A.enqueueAction(action);
        
    },

    
})