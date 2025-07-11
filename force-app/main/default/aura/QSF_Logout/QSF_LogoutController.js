({
	doInit : function(component, event, helper) {
		//component.set("v.accessToken", 'UXVlbmRhV1MxNTE2MjcwNjUyNTQzMC4wMjkxMjY1Njg3ODg0MTU2ODU=');
	},
    
    //REFRESCO DE TOEKN
    getAccessToken: function(component, event ,helper) {  
        if (component.get("v.statusAccessToken") == 'ERROR' && component.get("v.failedFunctionName") != ""){
            helper.refreshToken(component,helper,component.get("v.failedFunctionName")); 
        }
    },
    
    //OPERACION DE LOGOUT/LIBERACIÓN DE PUESTO
    Logout : function(component, event, helper) {
        helper.switchSpinnerOn(component,'Liberando puesto...');//SPINNER ON
		helper.logoutPlace(component, helper);
	},
    
    //BOTÓN CANCELAR LIBERACIÓN DE PUESTOS
    handleClick: function(component, event, helper) {
       helper.changeComponentView(component,"WaitingAgent"); 
		
	},
})