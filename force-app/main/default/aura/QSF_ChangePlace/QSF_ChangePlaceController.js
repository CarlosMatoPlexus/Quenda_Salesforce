({
    doInit : function(component, event, helper) {
        //Obtener lista de puestos de atención libres //
		//console.log('entro por DO INIT');
        //component.set("v.accessToken", 'UXVlbmRhV1MxNTE2MjcwNjUyNTQzMC4wMjkxMjY1Njg3ODg0MTU2ODU=');
        helper.freeWorkplaces(component,helper);
    },
    
    getAccessToken: function(component, event ,helper) {  
        if (component.get("v.statusAccessToken") == 'ERROR' && component.get("v.failedFunctionName") != ""){
            helper.refreshToken(component,helper,component.get("v.failedFunctionName")); 
        }
    },
    
    getFreePlaces  : function(component, event, helper) {
        //Obtener lista de puestos de atención libres //
        //console.log('entro por CHANGE');
       // helper.freeWorkplaces(component,helper);
    },
    
    changeClick : function(component, event, helper) {
        helper.goChange(component,event, helper);
        //helper.initSpinner(component, helper,'Cambiando puesto...');
	},
    
    cancelClick: function(component, event, helper) {
        helper.changeViewLogin(component, component.get("v.currentUser"),component.get("v.place"),'WaitingAgent');
    },
    
    
    hideErrors : function(component, event, helper) { //Hide error when any option is selected
        if(component.get("v.errorMessage") == 'Debe seleccionar un puesto') {
           component.set("v.errorStatus", false); 
        }
        var a = event.getSource().getLocalId();
        var el= component.find(a);
        $A.util.removeClass(el, "slds-has-error"); // remove red border
        $A.util.addClass(el, "hide-error-message"); // hide error message
    },
    

})