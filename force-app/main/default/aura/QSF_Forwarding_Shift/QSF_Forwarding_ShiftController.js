({
    doInit : function(component, event, helper) {
        //Load Forwarding Service&Place Available List //
       // console.log('Do INIT de Reenvio');
       // console.log(component.get("v.interactionTabId"));
       // console.log(component.get("v.previousView"));
         //        console.log(component.get("v.automaticAttentionTime"));

        
       helper.loadForwardingServiceList(component, event ,helper); //GET (1.1.2)
      // component.set("v.accessToken", 'UXVlbmRhV1MxNTE2MjcwNjUyNTQzMC4wMjkxMjY1Njg3ODg0MTU2ODU=');
    },
    
    jsLoaded: function(component, event ,helper) {
       /* var timer = component.get("v.timerCount");
        var parts = timer.split(':');
        $('.timer').countimer(
            {
                initHours: parts[0],
                initMinutes: parts[1],
                initSeconds: parts[2]
            });*/
        
    },
    
    getAccessToken: function(component, event ,helper) {
        
        if (component.get("v.statusAccessToken") == 'ERROR' && component.get("v.failedFunctionName") != ""){
            //var functionName= component.get("v.failedFunctionName");
            helper.refreshToken(component,helper,component.get("v.failedFunctionName")); 
        }
    },
    
    //LOAD AVAILABLE PLACES LIST WHEN A SERVICE IS SELECTED ON PICKLIST
    getAvailablePlaces: function(component, event ,helper) {
        
        component.set("v.errorStatus", false);
        var indxService= component.find("selectForwardingService").get("v.value");
        var service = component.get("v.forwardingServiceList");
        component.set("v.idSelectedService",service[indxService].id);
        component.set("v.loadingMessage2", 'Cargando puestos...');
        helper.loadForwardingPlaceList(component,helper);  //GET (1.1.3)
    },
    
    
	Forwarding : function(component, event, helper) {
       
		//helper.forwardingTicket(component,helper);
        if(component.find("selectForwardingService").get("v.value")!=""){
       		helper.serviceCheck(component,helper);
            //helper.initSpinner(component, helper,'Derivando atención...');
            component.set("v.errorStatus", false);
            }
        else{
            component.set("v.errorMessage", $A.get("$Label.c.QSF_Select_service_CL"));
            component.set("v.errorStatus", true);
        }
        
	},
    
    handleClick : function(component, event, helper) {
		var changeViewEvent = component.getEvent("changeView");
       // console.log(component.get("v.previousView"));
       // var timer = $("#timer_count").text();
        var timer = component.get("v.timerCount");
        changeViewEvent.setParams({
            "view": component.get("v.previousView"),
       		"timerCount": timer,
            "previousView": "Forwarding",
            "place":component.get("v.place"),
            "currentUser": component.get("v.currentUser"),
            "nextShiftInfo": component.get("v.nextShiftInfo"),
            "accessToken": component.get("v.accessToken"),
            "automaticAttentionTime": component.get("v.automaticAttentionTime"),
            "interactionTabId": component.get("v.interactionTabId")
            
        }).fire();
        
        window.scrollTo(0, 0);
	},
    
   
 
})