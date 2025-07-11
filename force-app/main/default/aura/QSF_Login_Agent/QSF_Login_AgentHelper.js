({
    //SOLICITUD DE LISTA DE PUESTOS LIBRES PARA UN USUARIO (GET 1.1.1)
    freeWorkplaces : function(component,helper) {
         console.log(component.get("v.currentUser"));
         console.log(component.get("v.accessToken"));
        var action = component.get("c.getFreeWorkplaces");
        action.setParams({
            "user": component.get("v.currentUser"),
            "accessToken": component.get("v.accessToken")
           // "accessToken":'UXVlbmRhV1MxNTE2MjcwNjUyNTQzMC4wMjkxMjY1Njg3ODg0MTU2ODU='
        });
        
        action.setCallback(this, function(response) {
            console.log(response.getState());
            if(component.isValid() && response.getState() === "SUCCESS") {
                component.set("v.failedFunctionName",'getFreeWorkplaces');
                var freeWorkplacesList = response.getReturnValue();
                if(freeWorkplacesList.success == true){ 
                  	console.log(freeWorkplacesList.data);
                   //console.log('freeWorkplacesList.data');
                    component.set("v.loadingMessage", $A.get("$Label.c.QSF_Free_positions_available_CL"));
                    component.set("v.freeWorkplacesList", freeWorkplacesList.data);  
                    
                    
                }else{//CONTROL DE ERRORES
                  	//console.log('error');
                    console.log(freeWorkplacesList.codError);
                    //console.log(freeWorkplacesList.message);
                    helper.errorManagementNew(component,helper,'',freeWorkplacesList.codError, freeWorkplacesList.message);  
                    
                }
            } else {
                console.log("KO - FreeWork Places"); 
                helper.errorManagementNew(component,helper,'ko','',$A.get("$Label.c.QSF_Service_Problem_CL"));
            }   
        });
        $A.enqueueAction(action);
    },
    
    //CONTROL DE SELECCIÓN DE PUESTO PREVIO AL LOGIN
    goLogin : function(component, event, helper) {     
        var indx= component.find("selectPlace").get("v.value");
        var select = component.get("v.freeWorkplacesList");
        var place = select[indx];
        component.set("v.place", place);
        if(indx==""){ //Si no se elige puesto se muestra error por pantalla
            //Solo se muestra el mensaje de error cuando no hay error en la carga de puestos libres
            if(component.get("v.errorMessage") != $A.get("$Label.c.QSF_Error_free_places_request_CL")) {
                component.set("v.errorMessage", $A.get("$Label.c.QSF_Select_place_error_CL"));
                component.set("v.errorStatus", true);
            }
        }else{
            helper.switchSpinnerOn(component, $A.get("$Label.c.QSF_Starting_app_CL"));//SPINNER ON
            helper.loginUser(component,helper);
        }
    },
    
    //PROCESO DE LOGIN MEDIANTE LLAMADA A WS (1.2.1 login)
    loginUser :  function(component,helper) {
        
         var infoJson = '{';
        	infoJson= infoJson + '"idPlace":'+component.get("v.place").id+',';
            infoJson= infoJson + '"logout":"false",';
        	infoJson= infoJson + '"accessToken":"'+component.get("v.accessToken")+'",';
        	infoJson= infoJson + '"username":"'+component.get("v.currentUser").Username+'"';
 
        	infoJson= infoJson + '}';
        
        
        var action = component.get("c.putSelectedPlace"); 
        action.setParams({
            "info":infoJson
            //"user": component.get("v.currentUser"),
            //"place": JSON.stringify(component.get("v.place")), 
            //"logout": 'false',
            //"accessToken": component.get("v.accessToken")
        });
        action.setCallback(this, function(response) {
            if(component.isValid() && response.getState() === "SUCCESS") {
                component.set("v.failedFunctionName",'login');
                var previousShiftInfo = response.getReturnValue();
                console.log(previousShiftInfo);
                if (previousShiftInfo.success == true){
                    component.set("v.errorStatus", false);
                   //console.log('Ticket recuperado: ');
                   //console.log(previousShiftInfo.data);
                   //console.log("Tiempo de rellamada automatica: " +previousShiftInfo.data.tiempoRellamadaAutomatica);
                    component.set("v.previousShiftInfo", previousShiftInfo.data);
                   //console.log(component.get("v.previousShiftInfo"));
                   //console.log(component.get("v.previousShiftInfo").idCita);
                    component.set("v.automaticAttentionTime",previousShiftInfo.data.tiempoRellamadaAutomatica);
                    component.set("v.isActiveAutomaticRecall",previousShiftInfo.data.llamadaAutomatica);
                    component.set("v.idSelectedStatus",previousShiftInfo.data.idEstado);
                  //  console.log(component.get("v.automaticAttentionTime"));
                    helper.updateUser(component,helper);
                    
                }else{ //CONTROL DE ERRORES
                    console.log(previousShiftInfo.message);
                    console.log(previousShiftInfo.codError);
                    helper.errorManagementNew(component,helper,'',previousShiftInfo.codError, previousShiftInfo.message);
                    
                }    
            } else {
                console.log("KO-en Login"); 
                helper.errorManagementNew(component,helper,'ko','',$A.get("$Label.c.QSF_Service_Problem_CL"));
                //helper.switchSpinner(component,'');//SPINNER OFF
            }   
        });
        $A.enqueueAction(action);
    },
    
    //ACTUALIZACIÓN DE PUESTO Y OFICINA DEL USUARIO (EN SALESFORCE) 
    updateUser : function(component,helper){
      //  console.log('Identificador de oficina: '+component.get("v.previousShiftInfo").idOficina);
        var action = component.get("c.updateUserLocation");
        //console.log(component.get("v.place"));
        action.setParams({
            "user": component.get("v.currentUser"),
            "place": JSON.stringify(component.get("v.place")),
            "loginInfo": JSON.stringify(component.get("v.previousShiftInfo"))
            
        });
        action.setCallback(this, function(response) {
            console.log(response.getState());
            if(component.isValid() && response.getState() === "SUCCESS") {
                var user = response.getReturnValue();
                //changeViewFunc(component, user);
                helper.changeView(component,user);
                helper.switchSpinnerOff(component,'');//SPINNER OFF
            } else {
                console.log("KO-UpdateUser"); 
                helper.switchSpinnerOff(component,'');//SPINNER OFF
            }   
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
                   // console.log(accessToken.message);
                    //component.set("v.statusAccessToken", 'ERROR');
                    //component.set("v.accessToken", accessToken.message);
                    helper.switchSpinnerOff(component,'');//SPINNER OFF
                    //component.set("v.errorMessage", 'Error al actualizar el puesto del usuario');
                    component.set("v.errorMessage", accessToken.message);
                    component.set("v.errorStatus", true);
                }else{
                    component.set("v.statusAccessToken", 'OK');
                    component.set("v.accessToken", accessToken.data.access_token);
                    //component.set("v.accessToken",'UXVlbmRhV1MxNTE2MjcwNjUyNTQzMC4wMjkxMjY1Njg3ODg0MTU2ODU=');
                   console.log("ACCESS TOKEN refreshed: ");
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
        if(failedFunction == 'getFreeWorkplaces'){
            component.set("v.errorStatus", false);
            helper.freeWorkplaces(component,helper);
        }else if(failedFunction == 'login'){
            component.set("v.errorStatus", false);
            helper.loginUser(component,helper);
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
              // console.log(message);
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
    
    
    
    //CONTROL DE ERRORES : IDENTIFICACIÓN Y CONTROL DE DISPLAY POR PANTALLA
    errorManagementNew : function(component, helper, status, codError, message) {
        if (status == 'ko') {
            component.set("v.errorStatus", true);
            component.set("v.errorMessage", message); 
            helper.switchSpinnerOff(component,'');//SPINNER OFF
        }else{
            if(codError=="ERR004"){
                component.set("v.errorMessage", message);
                component.set("v.errorStatus", true);
                helper.switchSpinnerOff(component,'');//SPINNER OFF
            }
            else if(codError=="ERR003"){
              // console.log('Funcion que falla por token:' +component.get("v.failedFunctionName"));
                component.set("v.statusAccessToken", 'ERROR');
                console.log(message);
                component.set("v.errorStatus", false);
                component.set("v.errorMessage", message);
                helper.switchSpinnerOff(component,'');
            }
            else if(codError=="ERR002"){
              // console.log("Error por parametros incorrectos en: "+component.get("v.failedFunctionName"));
                console.log(message);
                component.set("v.errorStatus", false);
                component.set("v.errorMessage", message);
                 helper.switchSpinnerOff(component,'');//SPINNER OFF
                if(component.get("v.failedFunctionName") == 'login'){
                    helper.switchSpinnerOff(component,'');//SPINNER OFF
                }
            }else if(codError=="ERR001"){
                
                 component.set("v.errorMessage", message); 
                 component.set("v.errorStatus", true);
                helper.switchSpinnerOff(component,'');
                //helper.changeComponentView(component, 'LoginAgent');
            }
             else if(codError=="ERR000"){
                 //console.log('Error generico');
                 component.set("v.errorStatus", true);
                 component.set("v.errorMessage", message); 
                  if(component.get("v.failedFunctionName") == 'login'){
                    helper.switchSpinnerOff(component,'');//SPINNER OFF
                }
                
            }
        }    
    },
    
    //CONTROL DE SPINNER
    switchSpinner : function(component, title){     
        component.set("v.spinnerMsg", title);  
        $A.util.toggleClass(component.find("mySpinner"), "slds-hide");
        //component.set("v.showSpinner", !(component.get("v.showSpinner")));
        
        
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
   /* deleteUserPlaceInfo : function(component, helper) {
        var action = component.get("c.deleteUserPlaceInfo");
        action.setParams({
            "user": component.get("v.currentUser")
        });
        action.setCallback(this, function(response) {
            if(component.isValid() && response.getState() === "SUCCESS") {
                var userUpdated = response.getReturnValue();
                //   console.log(userUpdated);
                if(userUpdated.QSF_Place_Id__c == null && userUpdated.QSF_Place__c == null ){
                    
                    helper.changeView(component, 'LoginAgent',userUpdated);
                    helper.switchSpinner(component,'');//SPINNER OFF
                    
                    //component.set("v.statusAccessToken", 'ERROR');
                    //component.set("v.accessToken", accessToken.message);
                }
                
            }
            else {
                console.log("KO in Delete user Place Info");  
            }   
        });
        $A.enqueueAction(action);
        
    },*/
    
    //FUNCIÓN PARA EL CAMBIO DE VISTA
    changeView : function(component,user){
        var changeViewEvent = component.getEvent("changeView");
        changeViewEvent.setParams({
            "view": "WaitingAgent",
            "timerCount": "",
            "place": component.get("v.place"),
            "currentUser": user,            
            "previousShiftInfo": component.get("v.previousShiftInfo"),
            "automaticAttentionTime": component.get("v.automaticAttentionTime"),
            "accessToken": component.get("v.accessToken"),
            "errorStatus": component.get("v.errorStatus"),
            "errorMessage": component.get("v.errorMessage"),
            "isLEX": component.get("v.isLEX"),
             "currentSeconds": "0",
            "isActiveAutomaticRecall": component.get("v.isActiveAutomaticRecall"),
            "idSelectedStatus": component.get("v.idSelectedStatus")
        }).fire();
        window.scrollTo(0, 0);
    },
    
    
})