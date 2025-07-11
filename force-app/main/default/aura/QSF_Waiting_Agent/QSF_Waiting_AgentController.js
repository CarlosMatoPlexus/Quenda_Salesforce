({ 
    //---- DO INTI & HANDLERS ----//
    doInit: function(component, event ,helper) {
        console.log('Do INIT de Waiting');
        console.log('identificador de Estado de no atención: ' + component.get("v.idSelectedStatus"));
        console.log('Current Seconds : '+ component.get("v.currentSeconds"));
        console.log('Activada la llamada automatica?: '+ component.get("v.isActiveAutomaticRecall"));
       /* var blinkDiv= component.find("unattended_blink");
        console.log(blinkDiv);
        $A.util.addClass(blinkDiv, 'blink');*/
        component.set("v.idSelectedService",null); //Inicializr el valor a null para que devuelva todos los turnos al empezar
        component.set("v.callAutomaticNow", false);
        helper.loadAvailableServiceList(component, helper);
        helper.loadUnattendedShiftNumber(component, helper);
        helper.refreshNumberByTime(component,helper);
       
        helper.loadNoAttentionStatusList(component, helper);  //Solicitud de lista de estados de No atención
        
        /*var status = component.get("v.noAttentionStatusList");
        var idStatus = component.get("v.idSelectedStatus");
        if(idStatus != null && idStatus != 1){ //Identificador de estado DISPONIBLE          
            console.log(idStatus);     
            console.log(component.get("v.noAttentionStatusList"));
            component.set("v.selectedStatusValue", status.find(x => x.idEstado === idStatus ));
        }*/
        
        //RELLAMADA AUTOMÁTICA 									
        if(component.get("v.automaticAttentionTime")!="" && component.get("v.unattendedShiftNumber")>0 && component.get("v.AutoRecallIntervalId")=="" && component.get("v.isActiveAutomaticRecall")==true){
            //if(true ){
            var time = component.get("v.automaticAttentionTime");
            //var time = 10000;
            console.log (time);
            console.log("Rellamada automatica en DO INIT");
        	helper.automaticNextTicket(component, helper, time);
        }
        
        /*else if(component.get("v.isActiveAutomaticRecall")==false && component.get("v.unattendedShiftNumber")>0 ){
            console.log("entro en el parpadeo en doInit");
          var blinkDiv= component.find("unattended_blink");
          $A.util.addClass(blinkDiv, ' blink');
          
      }else if(component.get("v.unattendedShiftNumber")==0){
          var blinkDiv= component.find("unattended_blink");
          $A.util.removeClass(blinkDiv, ' blink');
      }*/
        //FIN RELLAMADA AUTOMATICA
        
        

    },
    
    //FUNCIÓN QUE COMPRUEBA EL VALOR DEL NUMERO DE TURNOS PENDIENTES Y DE LA 
    autoRecall: function(component, event ,helper) {
        
        console.log('Tiempo de rellamada: '+component.get("v.automaticAttentionTime"));
        console.log('Numero de turnos pendientes: '+component.get("v.unattendedShiftNumber"));
        console.log('Identificador de INTERVAL: '+component.get("v.AutoRecallIntervalId"));
        console.log('Activada la llamada automatica?: '+component.get("v.isActiveAutomaticRecall"));
        console.log('identificador de Estado de no atención: ' + component.get("v.idSelectedStatus"));
        
        //RELLAMADA AUTOMÁTICA 									//Desactivado por no entrar en fase inicial
   		if(component.get("v.automaticAttentionTime")!="" && component.get("v.unattendedShiftNumber")>0 && component.get("v.AutoRecallIntervalId")=="" && component.get("v.isActiveAutomaticRecall")==true && component.get("v.idSelectedStatus")==1){
            //if(true ){
            var time = component.get("v.automaticAttentionTime");
            //var time = 10000;
            console.log (time);
            console.log("Rellamada automatica por cambio de valor en TURNOS PENDIENTES");
        	helper.automaticNextTicket(component, helper, time);
      } 
        
        /*else if(component.get("v.isActiveAutomaticRecall")==false && component.get("v.unattendedShiftNumber")>0 ){
           console.log("entro en el parpadeo autorecall");
          var blinkDiv= component.find("unattended_blink");
          $A.util.addClass(blinkDiv, 'blink');
          
      }else if(component.get("v.unattendedShiftNumber")==0){
          var blinkDiv= component.find("unattended_blink");
          $A.util.removeClass(blinkDiv, 'blink');
      */
        
        //FIN RELLAMADA AUTOMATICA        
    },
    
    getAccessToken: function(component, event ,helper) {
        if (component.get("v.statusAccessToken") == 'ERROR' && component.get("v.failedFunctionName") != ""){
            //var functionName= component.get("v.failedFunctionName");
            helper.refreshToken(component,helper,component.get("v.failedFunctionName")); 
        }
    },    
    
    //---- BUTTONS ----//
    NextTurn : function(component, event, helper) {
        //Comprobación de estado de NO ATENCIÓN
        var status = component.get("v.noAttentionStatusList");
        var idStatus = component.get("v.idSelectedStatus");
        if(idStatus != null && idStatus == 1){ //Identificador de estado DISPONIBLE          
            console.log(idStatus);     
           // console.log(status.find(x => x.idEstado === idStatus ).estado);
            
            //Si no se tiene permiso de "seleccion de servicio" el "idServicio" quedará a null y se llamará al siguiente ticket según priorización de Quenda
            if((component.get("v.serviceSelection")==true)){
                if(component.find("selectService").get("v.value") != ""){
                    //  console.log(component.get("v.serviceSelection"));
                    var indxService= component.find("selectService").get("v.value");
                    var service = component.get("v.availableServiceList");
                    //var selectedService = service[indxService].nombre; //Lo mas seguro es que se haga con el id (identificador)
                    component.set("v.idSelectedService",service[indxService].id);
                    //  console.log('Identificador de servicio seleccionado');
                    //  console.log(component.get("v.idSelectedService"));
                }
                else{
                    component.set("v.idSelectedService",null); //Se tiene permiso de seleccion pero no se selecciona ninguno aun así
                }
            }
            else{
                component.set("v.idSelectedService",null); //No se tiene permiso de seleccion de servicio
            }
            
            helper.startNextTurn(component, helper);  
            
        }
        else{
            component.set("v.errorStatus", true);
            component.set("v.errorMessage", $A.get("$Label.c.QSF_NoAttentionStatus_Error_CL"));
        }
        
        
        //Si no se tiene permiso de "seleccion de servicio" el "idServicio" quedará a null y se llamará al siguiente ticket según priorización de Quenda
        /*  if((component.get("v.serviceSelection")==true)){
            if(component.find("selectService").get("v.value") != ""){
              //  console.log(component.get("v.serviceSelection"));
                var indxService= component.find("selectService").get("v.value");
                var service = component.get("v.availableServiceList");
                //var selectedService = service[indxService].nombre; //Lo mas seguro es que se haga con el id (identificador)
                component.set("v.idSelectedService",service[indxService].id);
              //  console.log('Identificador de servicio seleccionado');
              //  console.log(component.get("v.idSelectedService"));
            }
            else{
                component.set("v.idSelectedService",null); //Se tiene permiso de seleccion pero no se selecciona ninguno aun así
            }
        }
        else{
            component.set("v.idSelectedService",null); //No se tiene permiso de seleccion de servicio
        }
        
        helper.startNextTurn(component, helper);  */
    },
    
    PriorityTurn : function(component, event, helper) {
        
        var status = component.get("v.noAttentionStatusList");
        var idStatus = component.get("v.idSelectedStatus");
        if(idStatus != null && idStatus == 1){ //Identificador de estado DISPONIBLE          
            console.log(idStatus);     
            //console.log(status.find(x => x.idEstado === idStatus ).estado);
            if((component.get("v.serviceSelection")==true)){
                if( component.find("selectService").get("v.value") != ""){ 
                    //Si se ha seleccionado servicio, se carga en el atributo correspondiente
                    var indxService= component.find("selectService").get("v.value");
                    var service = component.get("v.availableServiceList");
                    component.set("v.idSelectedService",service[indxService].id);
                }
                else{ //en caso contrario se carga un null(en la vista "priorizar" el valor por defecto es 0)
                    component.set("v.idSelectedService",null);
                }
            }
            else{
                component.set("v.idSelectedService",null); //No se tiene permiso de seleccion de servicio
            }
            helper.changeComponentView(component, "Prioritize");
            
        }else{
                component.set("v.errorStatus", true);
                component.set("v.errorMessage", $A.get("$Label.c.QSF_NoAttentionStatus_Error_CL"));
            }
    },
    
    WithoutShift : function(component, event, helper) {  
        
        var status = component.get("v.noAttentionStatusList");
        var idStatus = component.get("v.idSelectedStatus");
        if(idStatus != null && idStatus == 1){ //Identificador de estado DISPONIBLE          
            console.log(idStatus);     
          //  console.log(status.find(x => x.idEstado === idStatus ).estado);
            
            helper.startNoTicketAttention(component,helper,"WithoutShift"); 
        }else{
            component.set("v.errorStatus", true);
            component.set("v.errorMessage", $A.get("$Label.c.QSF_NoAttentionStatus_Error_CL"));
        }
    },
    
    PreAttentionSS : function(component, event, helper) {
        // helper.changeComponentView(component, "PreAttentionSS");
    },
    
    PreAttention : function(component, event, helper) {
        
        var status = component.get("v.noAttentionStatusList");
        var idStatus = component.get("v.idSelectedStatus");
        if(idStatus != null && idStatus == 1){ //Identificador de estado DISPONIBLE          
            console.log(idStatus);     
         //   console.log(status.find(x => x.idEstado === idStatus ).estado);
            
            helper.changeComponentView(component, "PreAttention");
            
        }else{
            component.set("v.errorStatus", true);
            component.set("v.errorMessage", $A.get("$Label.c.QSF_NoAttentionStatus_Error_CL"));
        }
    },
    
    LogoutPlace : function(component, event, helper) {
        helper.changeComponentView(component, "Logout");
    },
    
    ChangePlace : function(component, event, helper) {
        helper.changeComponentView(component, "ChangePlace");
    },
    
    changeStatus : function(component, event, helper) {
        
        if( component.find("selectNoAttentionStatus").get("v.value") != ""){ 
                //Si se ha seleccionado servicio, se carga en el atributo correspondiente
                var indxStatus= component.find("selectNoAttentionStatus").get("v.value");
                var status = component.get("v.noAttentionStatusList");
                component.set("v.idSelectedStatus",status[indxStatus].idEstado);
            	console.log(status[indxStatus].idEstado);
            }
            else{ //en caso contrario se carga un null(en la vista "priorizar" el valor por defecto es 0)
                component.set("v.idSelectedStatus",null);
            }
        
        
        helper.changeUserNoAttentionStatus(component, event, helper);
    },
    
    
    
    //---- AUX FUNCTIONS ----//
    //
    //Cambia el número de clientes en cola según el servicio seleccionado
    getNumber: function(component, event ,helper) {  
        helper.refreshNumber(component,helper);
        },
    
    //Llamada automatica PRUEBA
    callNextNow: function(component, event ,helper) {
        
        //Comprobación de estado de NO ATENCIÓN
        var status = component.get("v.noAttentionStatusList");
        var idStatus = component.get("v.idSelectedStatus");
        if(idStatus != null && idStatus == 1){ //Identificador de estado DISPONIBLE          
            console.log(idStatus);     
            console.log(status);
            
            console.log("Entro por cambio en VARIABLE");
            console.log(component.get("v.callAutomaticNow"));
            if(component.get("v.callAutomaticNow")){
                //Si no se tiene permiso de "seleccion de servicio" el "idServicio" quedará a null y se llamará al siguiente ticket según priorización de Quenda
                if((component.get("v.serviceSelection")==true)){
                    if(component.find("selectService").get("v.value") != ""){
                        //  console.log(component.get("v.serviceSelection"));
                        var indxService= component.find("selectService").get("v.value");
                        var service = component.get("v.availableServiceList");
                        //var selectedService = service[indxService].nombre; //Lo mas seguro es que se haga con el id (identificador)
                        component.set("v.idSelectedService",service[indxService].id);
                        //  console.log('Identificador de servicio seleccionado');
                        //  console.log(component.get("v.idSelectedService"));
                    }
                    else{
                        component.set("v.idSelectedService",null); //Se tiene permiso de seleccion pero no se selecciona ninguno aun así
                    }
                }
                else{
                    component.set("v.idSelectedService",null); //No se tiene permiso de seleccion de servicio
                }
                
                helper.startNextTurn(component, helper);  
            }
            
        }
        else{
            component.set("v.errorStatus", true);
            component.set("v.errorMessage", $A.get("$Label.c.QSF_NoAttentionStatus_Error_CL"));
        }
        
    },
    
    
    hideErrors : function(component, event, helper) {
        var a = event.getSource().getLocalId();
        var el= component.find(a);
        
        $A.util.removeClass(el, "slds-has-error"); // remove red border
        $A.util.addClass(el, "hide-error-message"); // hide error message
    },
    
    changePermission: function(component, event, helper) {
        var permiso= component.find("selectPermission").get("v.value");
        if(permiso==1){ // Atención simple
            component.set("v.callNext",true); component.set("v.quickAttention",false); component.set("v.prioritizeTurn",false); component.set("v.serviceSelection",false);component.set("v.withoutTicket",true)
        }else if(permiso==2){ // Atención avanzada
            component.set("v.callNext",true); component.set("v.quickAttention",false); component.set("v.prioritizeTurn",false); component.set("v.serviceSelection",true);component.set("v.withoutTicket",true)
        }else if(permiso==3){ // Atencion con priorización
            component.set("v.callNext",true); component.set("v.quickAttention",false); component.set("v.prioritizeTurn",true); component.set("v.serviceSelection",true);component.set("v.withoutTicket",true)
        }else if(permiso==4){ // Atención con priorización y atención rápida
            component.set("v.callNext",true); component.set("v.quickAttention",true); component.set("v.prioritizeTurn",true); component.set("v.serviceSelection",false);component.set("v.withoutTicket",true)
        }else if(permiso==5){ // Full Attention
            component.set("v.callNext",true); component.set("v.quickAttention",true); component.set("v.prioritizeTurn",true); component.set("v.serviceSelection",true);component.set("v.withoutTicket",true)
        } 
    },
    
})