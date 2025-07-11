({
    //---- DO INTI & HANDLERS ----//
    doInit: function (component, event, helper) {
        //component.set("v.accessToken", 'UXVlbmRhV1MxNTE2MjcwNjUyNTQzMC4wMjkxMjY1Njg3ODg0MTU2ODU=');
        helper.loadUnattendedShiftList(component, helper);
        console.log('Datos que recupero del evento');
        console.log (component.get("v.automaticAttentionTime"));
        console.log (component.get("v.currentSeconds"));
        var time = component.get("v.currentSeconds");
        helper.automaticNextTicket(component, helper, time);
        //console.log (tme);
        //component.set("v.accessToken", 'UXVlbmRhV1MxNTE2MjcwNjUyNTQzMC4wMjkxMjY1Njg3ODg0MTU2ODU=');
        
        //RELLAMADA AUTOMATICA
        //if(component.get("v.automaticAttentionTime")!="" && component.get("v.unattendedShiftNumber")>0 ){
        /*if(true ){
            var time = component.get("v.currentSeconds");
            //var time = 10000;
            console.log (time);
        	helper.automaticNextTicket(component, helper, time);
            }*/
        //FIN RELLAMADA AUTOMATICA
    },
 
    getAccessToken: function(component, event ,helper) {     
        if (component.get("v.statusAccessToken") == 'ERROR' && component.get("v.failedFunctionName") != ""){
            //var functionName= component.get("v.failedFunctionName");
            helper.refreshToken(component,helper,component.get("v.failedFunctionName")); 
        }
    },
    
    serviceChange : function(component, event, helper) {   
        console.log("current value: " + event.getParam("value"));
        helper.loadUnattendedShiftList(component, helper);
	},
    
    
	//---- BUTTONS ----//    
	PriorityTurn : function(component, event, helper) {
        helper.selectTicket(component,helper,"AttentionProgress");
	},
    
    backClick : function(component, event, helper) {
        helper.changeComponentView(component,"WaitingAgent");
	},
    
    getCurrentSeconds: function(component, event, helper) {
        var time = component.get("v.currentSeconds");
            //var time = 10000;
            console.log (time);
        	helper.automaticNextTicket(component, helper, time);
	},
    
    //Llamada automatica PRUEBA
    callNextNow: function(component, event ,helper) {
        console.log("Entro por cambio en VARIABLE");
        console.log(component.get("v.callAutomaticNow"));
        if(component.get("v.callAutomaticNow")){
            helper.selectTicket(component, helper, "AttentionProgress"); //Una vez se haya guardado el valor del servicio seleccionado, se solicita el siguiente turno.
        }
        
    },
    

})