({
	//CARGA DE PUESTOS DISPONIBLES PARA REALIZAR EL CAMBIO (GET 1.1.1)
    freeWorkplaces : function(component,helper) {
        var action = component.get("c.getFreeWorkplaces");
        action.setParams({
            "user": component.get("v.currentUser"),
            "accessToken": component.get("v.accessToken")
            //"accessToken":'UXVlbmRhV1MxNTE2MjcwNjUyNTQzMC4wMjkxMjY1Njg3ODg0MTU2ODU='
        });
        action.setCallback(this, function(response) {
            if(component.isValid() && response.getState() === "SUCCESS") {
                component.set("v.failedFunctionName",'getFreeWorkplaces');
                var freeWorkplacesList = response.getReturnValue();
                if(freeWorkplacesList.success == true){ 
                   // console.log(freeWorkplacesList.data);
                    component.set("v.loadingMessage", $A.get("$Label.c.QSF_Free_positions_available_CL")); ///AQUI
                    component.set("v.freeWorkplacesList", freeWorkplacesList.data); 
                }else{//CONTROL DE ERRORES
                    helper.errorManagementNew(component,helper,'',freeWorkplacesList.codError, freeWorkplacesList.message);
                }
            } else {
                console.log("KO - FreeWork Places"); 
                helper.errorManagementNew(component,helper,'ko','',$A.get("$Label.c.QSF_Service_Problem_CL"));
            }   
        });
        $A.enqueueAction(action);
    },
    
    //CONTROL DE SELECCIÓN DE PUESTO SEGUIDA DE LLAMADA AL LOGOUT
    goChange : function(component, event, helper) {     
        var indx= component.find("selectPlace").get("v.value");
        var select = component.get("v.freeWorkplacesList");
        var selectedPlace = select[indx];
        component.set("v.selectedPlace", selectedPlace);
        
        if(indx==""){ //Si no se elige puesto se muestra error por pantalla
            component.find("selectPlace").set("v.errors",[{message:"my error message"}]);
          //  console.log("Debe seleccionar un puesto");
            component.set("v.errorMessage", 'Debe seleccionar un puesto');
            component.set("v.errorStatus", true);
        }else{
            //Update User (Place)
            helper.logoutPlace(component,event,selectedPlace,helper);
            helper.switchSpinnerOn(component,'Actualizando puesto...');//SPINNER ON
        }
    },
    
    //OPERACIÓN DE LOGOUT (LIBERACIÓN DE PUESTO) SEGUIDA DE OPERACIÓN DE LOGIN AL NUEVO PUESTO
    logoutPlace : function(component,event, newPlace, helper) {
        //console.log(component.get("v.place"));
       
         var infoJson = '{';
        	infoJson= infoJson + '"idPlace":'+component.get("v.place").id+',';
            infoJson= infoJson + '"logout":"true",';
        	infoJson= infoJson + '"accessToken":"'+component.get("v.accessToken")+'",';
        	infoJson= infoJson + '"username":"'+component.get("v.currentUser").Username+'"';
        	infoJson= infoJson + '}';
        
        
        var action = component.get("c.putSelectedPlace");
        action.setParams({
            "info":infoJson
            //"user": component.get("v.currentUser"),
            //"place": JSON.stringify(component.get("v.place")), //component.get("v.place"),
            //"logout": 'true',
            //"accessToken": component.get("v.accessToken")
        });
        action.setCallback(this, function(response) {
            if(component.isValid() && response.getState() === "SUCCESS") {
                component.set("v.failedFunctionName",'logout');
                var logoutInfo = response.getReturnValue();
                if (logoutInfo.success == true){
                   // console.log("Status operacion LOGOUT : "+ logoutInfo.message);
                    component.set("v.place", newPlace);
                    helper.loginPlace(component,event,helper);
                } 
                else{//CONTROL DE ERRORES
                    helper.errorManagementNew(component,helper,'',logoutInfo.codError, logoutInfo.message);
                } 
            } else {
                console.log("KO-en Logout / FreePlace"); 
                helper.errorManagementNew(component,helper,'ko','',$A.get("$Label.c.QSF_Service_Problem_CL"));
                helper.switchSpinnerOff(component,'');//SPINNER OFF
            }   
        });
        $A.enqueueAction(action);
    },
    
    //OPERACIÓN DE LOGIN EN EL NUEVO PUESTO SEGUIDA DE ACTUALIZACIÓN DE DATOS DE USUARIO
    loginPlace : function(component,event, helper) {
        
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
            //"place": JSON.stringify(component.get("v.place")), //component.get("v.place"),
            //"logout": 'false',
            //"accessToken": component.get("v.accessToken")
            //"accessToken":'UXVlbmRhV1MxNTE2MjcwNjUyNTQzMC4wMjkxMjY1Njg3ODg0MTU2ODU='
        });
        action.setCallback(this, function(response) {
            if(component.isValid() && response.getState() === "SUCCESS") {  
                component.set("v.failedFunctionName",'login');
                var loginInfo = response.getReturnValue();
                if (loginInfo.success == true){
                  //  console.log("Status operacion LOGIN: OK");
                  //  console.log(loginInfo.data);
                    if(loginInfo.data.codTicket != "") { //Controlar quizas mejor con IdInteraccion
                      //  console.log("Ticket interrumpido recuperado");
                      //  console.log("Tiempo de rellamada automatica: " +loginInfo.data.tiempoRellamadaAutomatica);
                        component.set("v.nextShiftInfo", loginInfo.data);//RAFA data
                      //  console.log(component.get("v.nextShiftInfo"));
                      //  console.log(component.get("v.nextShiftInfo").idCita);
                        component.set("v.automaticAttentionTime",loginInfo.data.tiempoRellamadaAutomatica);
                        component.set("v.isActiveAutomaticRecall",previousShiftInfo.data.llamadaAutomatica);
                        component.set("v.idSelectedStatus", loginInfo.data.idEstado);
                     //   console.log(component.get("v.automaticAttentionTime"));
                     //   console.log("Tipo de cita: " +loginInfo.data.idTipoCita);
                        //helper.updateUser(component,helper, helper.changeView);
                        if((loginInfo.data.idTipoCita == 3) || (loginInfo.data.idTipoCita == 4 )){ //Identificadores de 3.Atención Rápida y 4.Sin Ticket
                            helper.updateUser(component,helper,'WithoutShift');
                        }
                        else if((loginInfo.data.idTipoCita == 1) || (loginInfo.data.idTipoCita == 2 )){ //Resto de servicios ( 1.Cita Previa / 2.Cita Normal )
                            helper.updateUser(component,helper,'AttentionProgress');
                            //helper.switchSpinner(component,'');//SPINNER OFF
                        }
                    }
                    else{
                      //  console.log("No es un ticket interrumpido");
                        //CARGA DE DATOS
                        component.set("v.nextShiftInfo", loginInfo.data);
                        component.set("v.idSelectedStatus", loginInfo.data.idEstado);
                        helper.updateUser(component,helper,'WaitingAgent');
                    }    
                }else{//CONTROL DE ERRORES
                    helper.errorManagementNew(component,helper,'',loginInfo.codError, loginInfo.message);    
                }    
            } else {
                console.log("KO-en Login / FreePlace"); 
                helper.errorManagementNew(component,helper,'ko','',$A.get("$Label.c.QSF_Service_Problem_CL"));
                helper.switchSpinnerOff(component,'');//SPINNER OFF
            }   
        });
        $A.enqueueAction(action);
    },
    
    //ACTUALIZACIÓN DEL USUARIO
    updateUser : function(component, helper,view){
        var action = component.get("c.updateUserLocation");
        action.setParams({
            "user": component.get("v.currentUser"),
            "place": JSON.stringify(component.get("v.place")),
            "loginInfo": JSON.stringify(component.get("v.nextShiftInfo"))
        });
        action.setCallback(this, function(response) {
            if(component.isValid() && response.getState() === "SUCCESS") {
                var user = response.getReturnValue();
                component.set("v.currentUser",user);
                helper.changeViewLogin(component, user, component.get("v.place"),view);
                helper.switchSpinnerOff(component,'');//SPINNER OFF
            } else {
                console.log("KO-currentUser"); 
                helper.errorManagementNew(component,helper,'ko','',"Error al actualizar el puesto del usuario");
                //component.set("v.errorMessage", 'Error al actualizar el puesto del usuario');
                //component.set("v.errorStatus", true);
                helper.switchSpinnerOff(component,'');//SPINNER OFF
            }   
        });
        $A.enqueueAction(action);              
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
                    helper.switchSpinnerOff(component,'');//SPINNER OFF
                    //component.set("v.errorMessage", 'Error al actualizar el puesto del usuario');
                    component.set("v.errorMessage", accessToken.message);
                    component.set("v.errorStatus", true);
                }else{
                    component.set("v.statusAccessToken", 'OK');
                    component.set("v.accessToken", accessToken.data.access_token);
                 //   console.log("ACCESS TOKEN refreshed: ");
                    helper.checkAndCallFailedFunction(component,helper,failedFunction);            
                }
            } else {
                console.log("KO in WS when refresh Access Token");
                if(failedFunction == 'logout'|| failedFunction == 'login'){
                    helper.switchSpinnerOff(component,'');//SPINNER OFF
                }
            }   
        });
        $A.enqueueAction(action);
    },
    
    //LLAMADA A LA FUNCIÓN QUE HA FALLADO DEBIDO A ERROR EN EL TOKEN
    checkAndCallFailedFunction : function(component,helper,failedFunction) {
        if(failedFunction == 'getFreeWorkplaces'){
            component.set("v.errorStatus", false);
            helper.freeWorkplaces(component,helper);
        }else if(failedFunction == 'logout'){
            component.set("v.errorStatus", false);
            helper.logoutPlace(component,event,component.get("v.selectedPlace"),helper);
        }else if(failedFunction == 'login'){
            component.set("v.errorStatus", false);
            helper.loginPlace(component,event,helper);
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
            else if(codError=="ERR003"){
              // console.log('Funcion que falla por token:' +component.get("v.failedFunctionName"));
                component.set("v.statusAccessToken", 'ERROR');
                //console.log(message);
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
            }else if(codError=="ERR001"){
                component.set("v.errorStatus", true);
                 component.set("v.errorMessage", message); 
                helper.deleteUserPlaceInfo(component, helper);
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
                if(component.get("v.failedFunctionName") == 'logout'|| component.get("v.failedFunctionName") == 'login'){
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
        //console.log('Hago spinner OFF');
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
                    
                    helper.changeViewLogin(component,userUpdated,component.get("v.place"),'LoginAgent');
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
    changeViewLogin : function(component, user,place,view){
        var changeViewEvent = component.getEvent("changeView");
        changeViewEvent.setParams({
            "view": view,
            "timerCount": "",
            "place": place,
            "currentUser": user,
            "previousShiftInfo": component.get("v.previousShiftInfo"),
            "nextShiftInfo": component.get("v.nextShiftInfo"),
            "automaticAttentionTime": component.get("v.automaticAttentionTime"),
            "accessToken": component.get("v.accessToken"),
            "errorStatus": component.get("v.errorStatus"),
            "errorMessage": component.get("v.errorMessage"),
            "isLEX": component.get("v.isLEX"),
            "currentSeconds": "0",
            "isActiveAutomaticRecall": component.get("v.isActiveAutomaticRecall"),
            "previousView": "ChangePlace",
            "idSelectedStatus":component.get("v.idSelectedStatus")
        }).fire();
        window.scrollTo(0, 0);
    },
    
    
})