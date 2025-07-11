({
    
    getAccessToken : function(component,helper) {
        var action = component.get("c.getAccessTokenApex");
        action.setParams({
            "user": 'plexus',
            "password": 'Plexus44ff'
        });
        action.setCallback(this, function(response) {
            if(component.isValid() && response.getState() === "SUCCESS") {
                var accessToken = response.getReturnValue();
                if(accessToken.success == false){
                    console.log(accessToken.message);
                    component.set("v.accessToken", accessToken.message); //para que llegue algo a LOGIN y salte el trigger del cambio   
                }else{
                     console.log("ACCESS TOKEN correcto: "+accessToken.data.access_token);
                    //Pruebas con ACCESS TOKEN AQUI
                    component.set("v.accessToken", accessToken.data.access_token); //Versión anterior
                    //component.set("v.accessToken",'UXVlbmRhV1MxNTE2MjcwNjUyNTQzMC4wMjkxMjY1Njg3ODg0MTU2O=');
                    // correcto component.set("v.accessToken",'UXVlbmRhV1MxNTE2MjcwNjUyNTQzMC4wMjkxMjY1Njg3ODg0MTU2ODU=');
                    //console.log("ACCESS TOKEN incorrecto: "+component.get("v.accessToken"));
                    
                }
            } else {
                console.log("KO in WS when get Access Token");
            } 
            
        });
        $A.enqueueAction(action);
    },
    
    isQuendaUser : function(component,helper) {
		var action = component.get("c.isQuendaUser");
        action.setCallback(this, function(response) {
	        if(component.isValid() && response.getState() === "SUCCESS") {
                if(response.getReturnValue()==false){
                  //  console.log(response.getReturnValue());
                   component.set("v.view", 'NotQuendaUser');
                }else{
                   helper.getAccessToken(component,helper);
       			   helper.currentUser(component,helper,helper.profileFunctions);
                } 
	        } else {
	            console.log("KO-IsQuendaUser"); 
	        }   
	    });
      $A.enqueueAction(action);
	},
    
    //DETERMINA SI EL USUARIO TIENE PERMISOS DE USO PARA EL GESTOR DE QUENDA
    currentUser : function(component,helper, funcprofile) {
        console.log('Entro al inicio de cuurent user');
        var action = component.get("c.getCurrentUser");
        action.setCallback(this, function(response) {
            if(component.isValid() && response.getState() === "SUCCESS") {
                component.set("v.currentUser", response.getReturnValue());
                console.log(response.getReturnValue().QSF_Place_Id__c);
                //Comprobar aqui si hay algo en el valor de puesto del usuario
                console.log('Entro correctamente en current user');
                helper.checkIfUserHasPlace(component,helper);
                //Comprobar aqui si hay algo en el valor de puesto del usuario
                // console.log(component.get("v.currentUser"));
                funcprofile(component);
            } else {
                console.log("KO CurrentUser"); 
            }   
        });
        $A.enqueueAction(action);
    },
    
    //CARGA DE PERMISOS DE ATENCIÓN DE USUARIO (DISCRIMINACIÓN DE FUNCIONES)
    //ADICIONALMENTE SE AÑADE la configuracion (lightning o classic)
    profileFunctions: function(component) {
        var action = component.get("c.getCustomPermission");
        action.setCallback(this, function(response) {
            if(component.isValid() && response.getState() === "SUCCESS") {
                var result = response.getReturnValue();
                console.log('PERMISOS del usuario actual: '+result);
                component.set("v.callNext", result[0]);
                component.set("v.withoutTicket", result[1]);
                component.set("v.serviceSelection", result[2]);
                component.set("v.prioritizeTurn", result[3]);
                component.set("v.quickAttention", result[4]);
                component.set("v.printingTicket", result[5]);
                //component.set("v.isLEX", result[6]);
            } else {
                console.log("KO-in get Custom Permission"); 
            }   
        });
        $A.enqueueAction(action);
    },
    
    
    //COMPROBACION DE PUESTO ASOCIADO AL USUARIO Y CONTROL DE INTERRUPCIÓN DE ATENCIONES VERSION ANTIGUA
    /*
    checkIfUserHasPlace: function(component, helper){
        
        
        console.log('Entro al inicio de checkIfUserHasPlace');
        console.log(component.get("v.currentUser").QSF_Place_Id__c);
        if (component.get("v.currentUser").QSF_Place_Id__c != null){
            console.log('el usuario tiene aun un puesto asignado: --> ' + component.get("v.currentUser").QSF_Place_Id__c );
            component.set("v.place.id", component.get("v.currentUser").QSF_Place_Id__c);
            component.set("v.place.nombre", component.get("v.currentUser").QSF_Place__c);
            
            
             var infoJson = '{';
        	infoJson= infoJson + '"idPlace":'+component.get("v.currentUser").QSF_Place_Id__c+',';
            infoJson= infoJson + '"logout":"false",';
        	infoJson= infoJson + '"accessToken":"'+component.get("v.accessToken")+'",';
        	infoJson= infoJson + '"username":"'+component.get("v.currentUser").Username+'"';
 
        	infoJson= infoJson + '}';
            
        //    console.log(component.get("v.place.id"));
         //   console.log(component.get("v.place.nombre"));
            var action = component.get("c.putSelectedPlace"); // (PUT 1.2.1 login)
            action.setParams({
                "info":infoJson
               // "user": component.get("v.currentUser"),
               // "place": JSON.stringify(component.get("v.place")), //component.get("v.place")
               // "logout": 'false',
               // "accessToken": component.get("v.accessToken")
            });
            action.setCallback(this, function(response) {
                if(component.isValid() && response.getState() === "SUCCESS") {
                    var previousShiftInfo = response.getReturnValue();
                    console.log(previousShiftInfo.success);
                    console.log(previousShiftInfo.codError);
                   // previousShiftInfo.message='Puesto ocupado';
                    console.log(previousShiftInfo);
                    //previousShiftInfo.success=false;
                    //console.log(previousShiftInfo.success);
                    if (previousShiftInfo.success == true){
                     //   console.log('Ticket recuperado: ');
                     //   console.log(previousShiftInfo.data);
                        if(previousShiftInfo.data.codTicket != "") { //Controlar quizas mejor con IdInteraccion
                         //   console.log("Ticket interrumpido recuperado");
                            component.set("v.RecoveredTicket", true); //Añadido para comprobar si el ticket es recuperado y calcular el tiempo de atención en display
                         //   console.log("Tiempo de rellamada automatica: " +previousShiftInfo.data.tiempoRellamadaAutomatica);
                            component.set("v.nextShiftInfo", previousShiftInfo.data);//Se carga el valor del ticket interrumpido en la variable correspondient
                        //    console.log(component.get("v.nextShiftInfo").idCita);
                            component.set("v.automaticAttentionTime",previousShiftInfo.data.tiempoRellamadaAutomatica);
                        //    console.log(component.get("v.automaticAttentionTime"));
                            //helper.updateUser(component,helper, helper.changeView);
                        //    console.log("Tipo de cita: " +previousShiftInfo.data.idTipoCita);
                            
                            if((previousShiftInfo.data.idTipoCita == 3) || (previousShiftInfo.data.idTipoCita == 4 )){ //Identificadores de Atención Rápida y Sin Ticket
                                component.set("v.view", 'WithoutShift');
                            }
                            else if((previousShiftInfo.data.idTipoCita == 1) || (previousShiftInfo.data.idTipoCita == 2 ) ){ //Resto de servicios ( 1.Cita Previa / 2.Cita Normal )
                                component.set("v.view", 'AttentionProgress');
                            } 
                        }
                        else{
                          //  console.log("No es un ticket interrumpido");
                            //CARGA DE DATOS
                            component.set("v.automaticAttentionTime",previousShiftInfo.data.tiempoRellamadaAutomatica);
                         //   console.log(component.get("v.automaticAttentionTime"));
                            component.set("v.view", 'WaitingAgent');
                        }    
                    }else{
                       //previousShiftInfo.codError='ERR001';
                        if(previousShiftInfo.codError == "ERR000"){ //Si el puesto que tenia asignado ha sido ocupado por otro usuario
                           //component.set("v.view", 'LoginAgent'); 
                           component.set("v.errorMessage",previousShiftInfo.message);
                            component.set("v.errorStatus",true);
                            console.log(previousShiftInfo.codError);
                            console.log('Puesto anterior ocupado... Redirigiendo al usuario a pantalla de inicio'); 
                        }else if(previousShiftInfo.codError == "ERR001"){ //Si el puesto que tenia asignado ha sido ocupado por otro usuario
                            //helper.deleteUserPlaceInfo(component, helper);
                            component.set("v.errorMessage",previousShiftInfo.message);
                            component.set("v.errorStatus",true);
                            //component.set("v.view", 'LoginAgent'); 
                            console.log(previousShiftInfo.codError);
                            console.log('Puesto anterior ocupado... Redirigiendo al usuario a pantalla de inicio'); 
                        }else if(previousShiftInfo.codError == "ERR002"){ //Si el puesto que tenia asignado ha sido ocupado por otro usuario
                           //component.set("v.view", 'LoginAgent'); 
                           component.set("v.errorMessage",previousShiftInfo.message);
                            component.set("v.errorStatus",true);
                            console.log(previousShiftInfo.codError);
                            console.log('Puesto anterior ocupado... Redirigiendo al usuario a pantalla de inicio'); 
                        }
                        
                    }    
                } else {
                    console.log("KO-en Login de Recarga de página");
                    component.set("v.view", 'ErrorTokenView');
                }   
            });
            $A.enqueueAction(action);
            
        }else{//Si el usuario no tiene puesto asignado se va a la pantalla de Login para la selección de puesto
            //component.set("v.view", 'PreAttention');
            console.log('No tengo puesto asociado y voy a LOGIN');
            component.set("v.view", 'LoginAgent');
         //   console.log('el usuario no tiene puesto asignado o usa la aplicación por primera vez');
        }       
    },*/
    
    //COMPROBACIÓN DE PUESTO ASOCIADO AL USUARIO Y CONTROL DE INTERRUPCIÓN DE ATENCIONES Version nueva de errores
    checkIfUserHasPlace: function(component, helper){
        
        
        console.log('Entro al inicio de checkIfUserHasPlace');
        console.log(component.get("v.currentUser").QSF_Place_Id__c);
          console.log(component.get("v.accessToken"));
        if (component.get("v.currentUser").QSF_Place_Id__c != null){
            console.log('el usuario tiene aun un puesto asignado: --> ' + component.get("v.currentUser").QSF_Place_Id__c );
            component.set("v.place.id", component.get("v.currentUser").QSF_Place_Id__c);
            component.set("v.place.nombre", component.get("v.currentUser").QSF_Place__c);
            
            
             var infoJson = '{';
        	infoJson= infoJson + '"idPlace":'+component.get("v.currentUser").QSF_Place_Id__c+',';
            infoJson= infoJson + '"logout":"false",';
        	infoJson= infoJson + '"accessToken":"'+component.get("v.accessToken")+'",';
        	infoJson= infoJson + '"username":"'+component.get("v.currentUser").Username+'"';
 
        	infoJson= infoJson + '}';
            
        //    console.log(component.get("v.place.id"));
         //   console.log(component.get("v.place.nombre"));
            var action = component.get("c.putSelectedPlace"); // (PUT 1.2.1 login)
            action.setParams({
                "info":infoJson
               // "user": component.get("v.currentUser"),
               // "place": JSON.stringify(component.get("v.place")), //component.get("v.place")
               // "logout": 'false',
               // "accessToken": component.get("v.accessToken")
            });
            action.setCallback(this, function(response) {
                if(component.isValid() && response.getState() === "SUCCESS") {
                    var previousShiftInfo = response.getReturnValue();
                    console.log(previousShiftInfo.success);
                    console.log(previousShiftInfo.codError);
                   // previousShiftInfo.message='Puesto ocupado';
                    console.log(previousShiftInfo);
                    //previousShiftInfo.success=false;
                    //console.log(previousShiftInfo.success);
                    if (previousShiftInfo.success == true){
                     //   console.log('Ticket recuperado: ');
                     //   console.log(previousShiftInfo.data);
                        if(previousShiftInfo.data.codTicket != "") { //Existe ticket por tanto se trata de un ticket interrumpido por recarga de página o similar
                            component.set("v.RecoveredTicket", true); //Añadido para comprobar si el ticket es recuperado y calcular el tiempo de atención en display timmer
                            component.set("v.nextShiftInfo", previousShiftInfo.data);//Se carga el valor del ticket interrumpido en la variable correspondiente
                            component.set("v.automaticAttentionTime",previousShiftInfo.data.tiempoRellamadaAutomatica);
                            component.set("v.isActiveAutomaticRecall",previousShiftInfo.data.llamadaAutomatica);
                            component.set("v.idSelectedStatus",previousShiftInfo.data.idEstado);
                            //Dependiendo del tipo de cita (Sinticket/AtenciónRápida o Normal) se va a un componente u otro
                            if((previousShiftInfo.data.idTipoCita == 3) || (previousShiftInfo.data.idTipoCita == 4 )){ //Identificadores de Atención Rápida y Sin Ticket
                                component.set("v.view", 'WithoutShift');
                            }
                            else if((previousShiftInfo.data.idTipoCita == 1) || (previousShiftInfo.data.idTipoCita == 2 ) ){ //Resto de servicios ( 1.Cita Previa / 2.Cita Normal )
                                component.set("v.view", 'AttentionProgress');
                            } 
                        }
                        else{
                            //No hay ticket interrumpido/pendiente. Se va a la pantalla de espera, y se carga el tiempo de llamada automática y el estado de NO atención
                            component.set("v.automaticAttentionTime",previousShiftInfo.data.tiempoRellamadaAutomatica);
                            component.set("v.isActiveAutomaticRecall",previousShiftInfo.data.llamadaAutomatica);
                            component.set("v.idSelectedStatus",previousShiftInfo.data.idEstado);
                            console.log('Hago login y cambio el valor de idEstado: ' + component.get("v.idSelectedStatus"));
                            console.log('Hago login y cambio el valor de idEstado: ' + previousShiftInfo.data.idEstado);
                            //component.set("v.isActiveAutomaticRecall",false);
                            component.set("v.view", 'WaitingAgent');
                        }    
                    }else{
                       //previousShiftInfo.codError='ERR001'; //Linea utilizada para forzar las redirección de pantalla
                        if(previousShiftInfo.codError == "ERR000"){ 
                            component.set("v.view", 'LoginAgent'); 
                            component.set("v.errorMessage", $A.get("$Label.c.QSF_Service_ERR000_CL"));
                            component.set("v.errorStatus",true)
                            console.log(previousShiftInfo.codError);
                        }else if(previousShiftInfo.codError == "ERR001"){  //Conlleva borrado de puesto asociado al usuario y redirección a la página de LOGIN
                            helper.deleteUserPlaceInfo(component, helper);
                            component.set("v.errorMessage",previousShiftInfo.message);
                            component.set("v.errorStatus",true);
                            //component.set("v.view", 'LoginAgent'); 
                            console.log(previousShiftInfo.codError);
                            console.log('Puesto anterior ocupado... Redirigiendo al usuario a pantalla de inicio'); 
                        }else if(previousShiftInfo.codError == "ERR002"){ 
                            component.set("v.view", 'LoginAgent'); 
                            component.set("v.errorMessage", $A.get("$Label.c.QSF_Service_ERR002_CL"));
                            component.set("v.errorStatus",true)
                            console.log(previousShiftInfo.codError);
                        }else if(previousShiftInfo.codError == "ERR003"){ 
                           console.log(previousShiftInfo.codError);
                           console.log('Codigo error003'); 
                        }else if(previousShiftInfo.codError == "ERR004"){ 
                            console.log(previousShiftInfo.codError);
                            console.log('Codigo error004'); 
                        }
                        
                    }    
                } else {
                    console.log("KO-en Login de Recarga de página");
                    component.set("v.view", 'ErrorTokenView');
                }   
            });
            $A.enqueueAction(action);
            
        }else{//Si el usuario no tiene puesto asignado se va a la pantalla de Login para la selección de puesto
           
            console.log('No tengo puesto asociado y voy a LOGIN');
            
            component.set("v.view", 'LoginAgent');
           //component.set("v.view", 'WaitingAgent'); //Redireccion para pruebas cuando KO en WS
            
         //console.log('el usuario no tiene puesto asignado o usa la aplicación por primera vez');
        }       
    },
    
    //FUNCIÓN ENCARGADA DE ELIMINAR LOS DATOS DE PUESTO ASOCIADO AL USUARIO CUANDO SE RECIBE EL ERROR ERR001
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
                    
                    component.set("v.view", 'LoginAgent');
                    component.set("v.currentUser", userUpdated);
                    //helper.changeComponentView(component, 'LoginAgent');
                    //helper.switchSpinner(component,'');//SPINNER OFF
                    
                    //component.set("v.statusAccessToken", 'ERROR');
                    //component.set("v.accessToken", accessToken.message);
                }
                
            }
            else {
                console.log("KO in Delete user Place Info");  
            }   
        });
        $A.enqueueAction(action);
        
    },
     /*   changeComponentView : function(component,view) {
        console.log(component.get("v.currentUser"));
        
        $('.timer').countimer('stop');
        //  console.log('entro a hacer el cambio de vista a: '+ view);
        //  console.log(component.get("v.interactionTabId"));
         
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
            "isLEX": component.get("v.isLEX")
        }).fire();  
        window.scrollTo(0, 0);
    },*/
   
})