({
    //OPERACION DE LOGOUT/LIBERACIÓN DE PUESTO
    logoutPlace : function(component,helper) {
        
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
            //"place": JSON.stringify(component.get("v.place")),//component.get("v.place")
            //"logout": 'true',
            //"accessToken": component.get("v.accessToken")
        });
        action.setCallback(this, function(response) {
            if(component.isValid() && response.getState() === "SUCCESS") {
                component.set("v.failedFunctionName",'logout');
                var logoutInfo = response.getReturnValue();
                if (logoutInfo.success == true){
                   // console.log("Status operacion LOGOUT : "+ logoutInfo.message);
                    helper.changeComponentView(component,"LoginAgent");
                    helper.switchSpinnerOff(component,'');//SPINNER OFF  
                } 
                else{//CONTROL DE ERRORES
                    helper.errorManagementNew(component,helper,'',logoutInfo.codError, logoutInfo.message);
                } 
            } else {
                console.log("KO-en Logout / FreePlace"); 
                helper.errorManagementNew(component,helper,'ko','',$A.get("$Label.c.QSF_Service_Problem_CL"));
                //component.set("v.errorMessage", 'Error en servidor al liberar puesto');
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
                  //  console.log("ACCESS TOKEN refreshed: ");
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
        if(failedFunction == 'logout'){
            component.set("v.errorStatus", false);
            helper.logoutPlace(component,helper);
        }
    },
    
    //CONTROL DE ERRORES
    errorManagementNew : function(component, helper, status, codError, message) {
        if (status == 'ko') {
            component.set("v.errorStatus", true);
            component.set("v.errorMessage", message); 
            helper.switchSpinnerOff(component,'');//SPINNER OFF
        }else{            
              //VERSIÓN ANTIGUA
              //
            /*if(message=="Error: Invalid token" || message=="Error: Expired token"){
              //  console.log('Funcion que falla por token: ' +component.get("v.failedFunctionName"));
                component.set("v.statusAccessToken", 'ERROR');
              //  console.log(message);
                //component.set("v.errorStatus", true);
                //component.set("v.errorMessage", message);
            }*/
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
                console.log("Error por parametros incorrectos en: "+component.get("v.failedFunctionName"));
                console.log(message);
                component.set("v.errorStatus", true);
                component.set("v.errorMessage", message); 
                helper.switchSpinnerOff(component,'');//SPINNER OFF
                if(component.get("v.failedFunctionName") == 'logout'){
                    helper.switchSpinnerOff(component,'');//SPINNER OFF
                }
            }
        }    
    },
    
    //CAMBIA EL ESTADO DEL SPINNER 
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
      //  console.log('Hago cambio de vista a: ' +view);
        var changeViewEvent = component.getEvent("changeView");
        changeViewEvent.setParams({
            "view": view,
            "place":component.get("v.place"),
            "currentUser": component.get("v.currentUser"),
            "nextShiftInfo": component.get("v.nextShiftInfo"),
            "accessToken": component.get("v.accessToken"),
            "errorStatus": component.get("v.errorStatus"),
            "errorMessage": component.get("v.errorMessage"),
            "isLEX": component.get("v.isLEX"),
             "currentSeconds": "0",
            "previousView": "Logout",
            "idSelectedStatus":component.get("v.idSelectedStatus")
        }).fire(); 
        window.scrollTo(0, 0); 
    },
    
})