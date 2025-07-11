({
    doInit : function(component, event, helper) {   
        helper.freeWorkplaces(component,helper); 
        var user = component.get("v.currentUser");
        console.log('isLightning?: '+ component.get("v.isLEX")); //TRUE: Lightning, FALSE: Classic
        console.log(user);
        //console.log(user.Username);
    },
    
    jsLoaded : function(component, event, helper) {   
        
          // console.log("Tiempo inicial ZERO");
        	var timer = "01:02:03";
            var parts = timer.split(':');
           var idtimer= $('.timer').countimer(
                {
                    initHours: parts[0],
                    initMinutes: parts[1],
                    initSeconds: parts[2]
                });
        //console.log(idtimer);
 
     },
    
    RestartTimer : function(component, event, helper) {   
        
            $('.timer').countimer('resume');
 
     },
    
    StopTimer : function(component, event, helper) {   
        
        
          var idtimer=    $('.timer').countimer('stop');
 
     },
    
    
    
    CurrentTimer : function(component, event, helper) {   
        
        
            $('.timer').countimer('current');
 
     },
    
    Reiniciar: function(component, event, helper) {   
        
       
        $('.timer').countimer('stop');
        var timer = component.get("v.timerZero");
        var parts = timer.split(':');
        console.log(parts);
        $('.timer').countimer(
            {
                initHours: parts[0],
                initMinutes: parts[1],
                initSeconds: parts[2]
            });
        $('.timer').countimer('start');
 
     },
    
    PauseTimer : function(component, event, helper) {   
        
           console.log("Tiempo inicial ZERO");
        	var timer = "01:02:03";
            var parts = timer.split(':');
            $('.timer').countimer(
                {
                    initHours: parts[0],
                    initMinutes: parts[1],
                    initSeconds: parts[2]
                });
 
     },
    
    CloseAllTabs : function(component, event, helper) {   
        
        
          sforce.console.getPrimaryTabIds(function showTabId(result) {
            //Display the primary tab IDs
           console.log(result.ids);
              for(var i=0; i<result.ids.length; i++){
                   sforce.console.closeTab(result.ids[i]);
                  console.log('cerrada pestaña '+ i);
              }

            });

 
     },
    
    //INICIO DEL PROCESO DE REFRESH TOKEN
    getAccessToken: function(component, event ,helper) { 
        if (component.get("v.statusAccessToken") == 'ERROR' && component.get("v.failedFunctionName") != ""){
            helper.refreshToken(component,helper,component.get("v.failedFunctionName")); 
        }
    },

    //PROCESO DE LOGIN SEGUN PUESTO SELECCIONADO (SE OBTIENE TICKET INTERRUMPIDO SI SE DIERA EL CASO)
    GoStart : function(component, event, helper) {
        helper.goLogin(component,event,helper);
	},
    
    //OCULTA CONTORNO ROJO DE PICKLIST CUANDO UN PUESTO ES SELECCIONADO //
    hideErrors : function(component, event, helper) {
        //Solo se oculta el mensaje de error cuando el error es porque no se ha seleccionado puesto
        if(component.get("v.errorMessage") == $A.get("!$Label.c.QSF_Select_place_error_CL")) {
            component.set("v.errorStatus", false); 
        } 
        var a = event.getSource().getLocalId();
        var el= component.find(a); 
        $A.util.removeClass(el, "slds-has-error"); // remove red border
        $A.util.addClass(el, "hide-error-message"); // hide error message
    },
    
     goToComponent : function(component, event, helper) {  
        var user = component.get("v.currentUser");
       	var changeViewEvent = component.getEvent("changeView");
        changeViewEvent.setParams({
            "view": "PreAttention",
            "timerCount": "",
            "place": component.get("v.place"),
            "currentUser": user,            
            "previousShiftInfo": component.get("v.previousShiftInfo"),
            "automaticAttentionTime": component.get("v.automaticAttentionTime"),
            "accessToken": component.get("v.accessToken"),
            "errorStatus": component.get("v.errorStatus"),
            "errorMessage": component.get("v.errorMessage"),
            "isLEX": component.get("v.isLEX")
        }).fire();
        window.scrollTo(0, 0);
        
        //console.log(user.Username);
    },
    
})