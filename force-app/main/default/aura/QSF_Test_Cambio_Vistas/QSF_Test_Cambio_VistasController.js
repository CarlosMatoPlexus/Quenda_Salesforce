({
    doInit : function(component, event, helper) {
        //component.set("v.view","PreAttention");
        //Orden correcto. Si se coloca "GetToken" después no llega a pasarse a la siguiente vista (Revisar si se puede meter dentro de CurrentUser)
       
       /*helper.getAccessToken(component,helper);
       helper.currentUser(component,helper,helper.profileFunctions);*/
       
      // console.log('se cargan los SCRIPTS en el componente PRINCIPAL');       
      // helper.isQuendaUser(component,helper);
      //console.log($User.UIThemeDisplayed);
         
        //Prueba deteccion  lightning
        /*var actionDetect= component.get("c.getLightning");
        
        actionDetect.setCallback(this, function(response) {
            if(response.getState() === "SUCCESS") {
                
				component.set("v.isLEX",response.getReturnValue());
                console.log('Es Lightning Theme?');
                console.log(response.getReturnValue());
            } else {
                console.log("Error al detectar versión de Salesforce");
            }   
        });
        $A.enqueueAction(actionDetect);*/

        //Fin Prueba deteccion  lightning  
     
    
        
    },
    
    jsLoaded: function(component, event, helper) {
        //Orden correcto. Si se coloca "GetToken" después no llega a pasarse a la siguiente vista (Revisar si se puede meter dentro de CurrentUser)
        /*console.log('se cargan los SCRIPTS en el componente PRINCIPAL');  
        var len4 = $('script[src*="CountIdsimple"]').length; 
        console.log('Comprobacion de carga de script CountIdsimple: ' + len4);  
        var len = $('script[src*="CountTimer"]').length; 
        console.log('Comprobacion de carga de script CountTimer: ' + len);
        var len2 = $('script[src*="jquery"]').length; 
        console.log('Comprobacion de carga de script MOMENT: ' + len2);
        var len3 = $('script[src*="moment"]').length; 
        console.log('Comprobacion de carga de script JQUERY: ' + len3);*/
        console.log('Es Lightning Theme?');
        console.log(component.get("v.isLEX"));
        helper.isQuendaUser(component,helper);
        
    },
	
    handleChangeView : function(component, event, helper) {
        var timerCount = event.getParam("timerCount");
        var view = event.getParam("view");
        var place= event.getParam("place");
        var currentUser= event.getParam("currentUser");
        console.log(currentUser);
        var errorStatus=event.getParam("errorStatus");
        var errorMessage=event.getParam("errorMessage");
        console.log(errorMessage);
        var nextShiftInfo = event.getParam("nextShiftInfo");
        var newInter = event.getParam("newInter");
        var previousView = event.getParam("previousView");
        var programedInter= event.getParam("programedInter");
        var idSelectedService= event.getParam("idSelectedService");
        var previousShiftInfo= event.getParam("previousShiftInfo");
        var automaticAttentionTime= event.getParam("automaticAttentionTime");
        var accessToken= event.getParam("accessToken");
        var interactionTabId = event.getParam("interactionTabId");
        var RecoveredTicket = event.getParam("RecoveredTicket");
        var currentSeconds = event.getParam("currentSeconds");
        
        var isActiveAutomaticRecall = event.getParam("isActiveAutomaticRecall");
        var idSelectedStatus = event.getParam("idSelectedStatus");
        
        
        console.log("Segundos recuperados del evento: "+ currentSeconds);
        console.log(currentSeconds);
        console.log("automaticAttentionTime recuperados del evento: "+ automaticAttentionTime);
        console.log(automaticAttentionTime);
       // var isLEX = event.getParam("isLEX");
        
        //console.log("Valor de identificador de servicio recogido: " +idSelectedService);
        //console.log("OLD: "+ component.get("v.programedInter")  + " - " + component.get("v.view") + " - " + component.get("v.place") + " - " + component.get("v.currentUser") );
	    //console.log("NEW: "+ programedInter + " - " + view + " - " + place + " - " + currentUser);      
        //console.log("OLD VIEW: "+ component.get("v.view"));
        //console.log("NEW VIEW: "+ view);
        component.set("v.timerCount", timerCount);
        component.set("v.place", place);
        component.set("v.currentUser", currentUser);
        component.set("v.nextShiftInfo", nextShiftInfo);
        component.set("v.newInter", newInter);
        component.set("v.errorStatus",errorStatus);
        component.set("v.errorMessage",errorMessage);
        component.set("v.previousView", previousView);
        component.set("v.programedInter", programedInter);
        component.set("v.idSelectedService", idSelectedService);
        component.set("v.previousShiftInfo", previousShiftInfo);
        
        if(isActiveAutomaticRecall!=null){
            component.set("v.isActiveAutomaticRecall", isActiveAutomaticRecall);
        }
         
        if(automaticAttentionTime!=null){
            component.set("v.automaticAttentionTime", automaticAttentionTime);
        }
        component.set("v.accessToken", accessToken);
        component.set("v.view", view);
        component.set("v.interactionTabId", interactionTabId);
        component.set("v.RecoveredTicket", RecoveredTicket);
        
        if(currentSeconds!=null){
            component.set("v.currentSeconds", currentSeconds);
        }
        component.set("v.currentSeconds",currentSeconds);
        //component.set("v.idSelectedStatus", idSelectedStatus);
        
        if(idSelectedStatus!=null){
            component.set("v.idSelectedStatus", idSelectedStatus);
             console.log('Identificador servicio NO ATENCION  '+idSelectedStatus);
        }
     //   component.set("v.isLEX",isLEX);
        //console.log("Valor de identificador de servicio traspasado");
        //console.log(component.get("v.idSelectedService"));
        
    }
    
})