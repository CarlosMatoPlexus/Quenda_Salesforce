({
    doInitTab: function(component, event ,helper) {
        console.log('Do INIT de Atencion sin ticket');
        //  console.log(component.get("v.interactionTabId"));
        console.log(component.get("v.previousView"));
        
        //  console.log(component.get("v.automaticAttentionTime"));
        // console.log("Es ticket recuperado?: "+ component.get("v.RecoveredTicket"));
        
        //////////////////////////////////////////////////
        
       /*  var actionDetect= component.get("c.getLightning");
        
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
        
        /////////////////////////////////////////////////////
        
        
           
        helper.loadUnattendedShiftNumber(component, helper); // GET (1.1.4)
        
        
        if (component.get("v.previousView")!="Forwarding"){
            
            if((component.get("v.nextShiftInfo").idInteraccion == 'undefined') || (component.get("v.nextShiftInfo").idInteraccion == '') ) { //Añadir condicion de idInteraccion vacio
                //  console.log('Undefined interaction');
            } else {
                //Getting URL page
                var sPageURL = decodeURIComponent(window.location.search.substring(1)); //You get the whole decoded URL of the page.
                var url = sPageURL.substring(sPageURL.indexOf("https"), sPageURL.indexOf("salesforce.com"))+'salesforce.com/';
                //console.log(decodeURIComponent(window.location.search.substring(1)));
                //console.log(window.location.href);
                //console.log(window.location.href.includes("lightning"));
               
                // New tab with current Interaction
                var interId = component.get("v.nextShiftInfo.idInteraccion");
                
                
               // if(component.get("v.isLEX")){
                if(window.location.href.includes("lightning")){
                    //VERSION LIGHTNING
                    var interId = component.get("v.nextShiftInfo.idInteraccion");
                   // interId='a081j000000DHXWAA4';
                    console.log('Estoy en Lightning');
                    console.log(interId);
                    var workspaceAPI = component.find("workspace");
  
                    helper.tabsLightningManagment(workspaceAPI,interId ,component, helper);
					workspaceAPI.getAllTabInfo().then(function(response) {
                      // console.log('response getalltabInfo' +JSON.stringify(response));
                         console.log(response);
                       //var focusedTabId = response.tabId;
                       //workspaceTab.closeTab({tabId: focusedTabId});
                   });                    
                   
                    workspaceAPI.openTab({
                        recordId: interId,
                        focus: false
                    }).then(function(response) {
                        component.set("v.interactionTabId",response);
                        console.log('opentabinfo' + response);
                        workspaceAPI.getTabInfo({
                            tabId: response
                        }).then(function(tabInfo) {
                            console.log("The recordId for this tab is: " + tabInfo.recordId);
                        });
                    }).catch(function(error) {
                        console.log(error);
                    });
                    
                    
                    
                    
                    /*
                     workspaceAPI.getFocusedTabInfo().then(function(response) {
                       console.log('response getFocusedTabInfo' +JSON.stringify(response));
                       var focusedTabId = response.tabId;
                       //workspaceTab.closeTab({tabId: focusedTabId});
                   });*/
                    
                     
                    
                }
                else{//VERSION CLASSIC
                    sforce.console.openPrimaryTab(null, url+interId, true, '', (function(result){
                        //   console.log('entro en opensucces');
                        //   console.log(result);
                        //Report whether opening the new tab was successful
                        if (result.success == true) {
                            //   console.log('Primary tab successfully opened');
                            component.set("v.interactionTabId",result.id);
                            //   console.log(component.get("v.interactionTabId"));
                        } else {
                            //  console.log(result.id);
                            sforce.console.getFocusedPrimaryTabId((function(resultNew){
                                //   console.log(resultNew.id);
                                component.set("v.interactionTabId",resultNew.id);
                            }));
                            // console.log('Primary tab cannot be opened');
                        }
                    }) 
                                                 ); 
                    
                }
            }
            
            
        }else {
            // console.log('Vengo de reenvío y no abro nueva pestaña');
        }
        
        
        
        
        
    }, 
    
    jsLoaded: function(component, event ,helper) {
        var len4 = $('script[src*="CountIdsimple"]').length; 
        //console.log('Comprobacion de carga de script CountIdsimple: ' + len4);  
        var len = $('script[src*="CountTimer"]').length; 
        //console.log('Comprobacion de carga de script CountTimer: ' + len);
        var len2 = $('script[src*="jquery"]').length; 
        //console.log('Comprobacion de carga de script MOMENT: ' + len2);
        var len3 = $('script[src*="moment"]').length; 
        //console.log('Comprobacion de carga de script JQUERY: ' + len3);
        
        var RecoveredTicket = component.get("v.RecoveredTicket"); 
 		var idInteraction = component.get("v.nextShiftInfo.idInteraccion");        
        
        if (RecoveredTicket){
            //var idInteraction = component.get("v.nextShiftInfo.idInteraccion");
            console.log(idInteraction);
            helper.AttentionTimeAfterRefreshPage(component, helper, idInteraction);
            // $('.timer').countimer();
        }else if (component.get("v.previousView")!="Forwarding")  {
            $('.timer').countimer();
        }else if(component.get("v.previousView")=="Forwarding"){
            console.log("vengo de FORWARDING");
            helper.AttentionTimeAfterRefreshPage(component, helper, idInteraction);
            /*
            var timer = component.get("v.timerCount");
            console.log(timer);
            var parts = timer.split(':');
            //  console.log(parts);
            $('.timer').countimer(
                {
                    initHours: parts[0],
                    initMinutes: parts[1],
                    initSeconds: parts[2]
                });  */
        }
        console.log('Ticket recuperado?:');
    console.log(component.get("v.RecoveredTicket"));
	 if(RecoveredTicket!=true && (component.get("v.previousView")!="Forwarding") ){
            helper.checkIdealTimeAttention(component, event, helper);
        }     
        
        
        
        
        /*
        //component.set("v.RecoveredTicket", true);        
        console.log('Entro en el Jsloaded de SIN TICKET');
        if (component.get("v.RecoveredTicket")){
            console.log("TIMER: Es ticket Recuperado SIN TICKET");
            var idInteraction = component.get("v.nextShiftInfo.idInteraccion");
            helper.AttentionTimeAfterRefreshPage(component, helper, idInteraction);
            
        }else if (component.get("v.previousView")!="Forwarding")  {
            console.log("TIMER: NO TicketRecuperado ");
            $('.timer').countimer();   
            
        }else{
            console.log("TIMER: Vengo de Forwarding ");
            // console.log("vengo de FORWARDING");
            var timer = component.get("v.timerCount");
            console.log(timer);
            var parts = timer.split(':');
            //  console.log(parts);
            $('.timer').countimer(
                {
                    initHours: parts[0],
                    initMinutes: parts[1],
                    initSeconds: parts[2]
                });
        }*/ 
        
        /* else
        {
            helper.loadTimeDisplay(component, helper);
        }*/
        /*if (component.get("v.previousView")!="Forwarding")  {
            $('.timer').countimer();
        }else{
            console.log("vengo de FORWARDING");
            var timer = component.get("v.timerCount");
            console.log(timer);
            var parts = timer.split(':');
            console.log(parts);
            $('.timer').countimer(
                {
                    initHours: parts[0],
                    initMinutes: parts[1],
                    initSeconds: parts[2]
                });
        }    */
        
        
        //IDEAL TIME of ATTENTION EXPIRED NOTICE
        //component.get("v.nextShiftInfo").tiempoAtencionIdeal
        /*
         if(component.get("v.nextShiftInfo").tiempoAtencionIdeal > 0){ // Si el tiempo es mayor que CERO se evalua el tiempo en curso con respecto al tiempo ideal
            var attentionInProgress = component.get("v.attentionTimeInSeconds");
            var attentionTimeAux = component.get("v.nextShiftInfo").tiempoAtencionIdeal*60000 ;
            var idealAttentionTimeMilisec = attentionInProgress > attentionTimeAux ? 500 :(attentionTimeAux - attentionInProgress) ;
               console.log(attentionInProgress);
             console.log(attentionTimeAux);
       console.log('Activado Tiempo Ideal -> Tiempo restante:-> '+ idealAttentionTimeMilisec);
        var idealAttentionTime = (component.get("v.nextShiftInfo").tiempoAtencionIdeal)*60000 ; 
        
        var IdealTimeAttentionTimeOutId =  setTimeout(function() {
            $('#timer_count').addClass("ideal-time-expired");
            
            var utilityBarAPI = component.find("UtilityBarEx");
            
            //utilityBarAPI.getUtilityInfo().then(function(response) {
                //var myUtilityInfo = response;
               // console.log('Visible? '+response.utilityVisible);
                //if(!response.utilityVisible){
                    //VERSION SENCILLA
                    /*
                    utilityBarAPI.setUtilityHighlighted({
                        highlighted: true
                    });*/
                    //VERSION SENCILLA
                    
                    //VERSIÓN COMPLEJA 
       /*     if(window.location.href.includes("lightning")){//CONTROL DE PARPADEO DE BARRA DE CONSOLA EN LIGHTNING EXPERIENCE
                    var IdealTimeAttentionIntervalId = setInterval($A.getCallback(function () {
                        var progresToggleIcon = component.get('v.progressToggleIcon') == true ? false : true;    
                        component.set('v.progressToggleIcon', progresToggleIcon); 
                        
                        utilityBarAPI.getUtilityInfo().then(function(responseOpen) {
                            component.set("v.isOpenComponent",responseOpen.utilityVisible);
                        })
                        .catch(function(error) {
                           // console.log(error);
                        });
                        
                        if(component.get("v.isOpenComponent")==false ){
                            utilityBarAPI.setUtilityHighlighted(
                                { highlighted : progresToggleIcon == true ? true : false });
                        }else{
                            utilityBarAPI.setUtilityHighlighted(
                                { highlighted : false });                            
                        }
                        
                    }), 1000);
                     component.set("v.IdealTimeAttentionIntervalId", IdealTimeAttentionIntervalId); 
            }else{//CONTROL DE PARPADEO DE BARRA DE CONSOLA EN CLASSIC
                var IdealTimeAttentionIntervalIdClassic = setInterval($A.getCallback(function () {
                    var res;
                    var progresToggleIcon = component.get('v.progressToggleIcon') == true ? false : true;    
                    component.set('v.progressToggleIcon', progresToggleIcon); 
                    sforce.console.isCustomConsoleComponentWindowHidden(function(result){
                        res = result;
                       // console.log(result.success);
                       // console.log('Cerrado?: '+result.hidden);
                       // console.log('Toggle?: '+progresToggleIcon);
                        if(result.hidden){
                            if(progresToggleIcon){
                             sforce.console.setCustomConsoleComponentButtonStyle('background-color:#FAAC58;');
                            }else{
                             sforce.console.setCustomConsoleComponentButtonStyle('background-color:#C3C3C3;');
                            }
                            
                        }else{
                          //  console.log('Componente abierto');
                            sforce.console.setCustomConsoleComponentButtonStyle('background-color:#C3C3C3;');
                        }
                    });
                    
                  
                        //sforce.console.setCustomConsoleComponentButtonStyle('background-color:#FAAC58;');
                    
                        
                    }), 1000);
                     component.set("v.IdealTimeAttentionIntervalId", IdealTimeAttentionIntervalIdClassic); 
              
            }
           
        }, idealAttentionTime);
         component.set("v.IdealTimeAttentionTimeOutId", IdealTimeAttentionTimeOutId); 
         }    */
            
           /* 
            var eventHandler = function(responsHandler){
                console.log('PanelVisible: '+responsHandler.panelVisible);
                utilityBarAPI.getUtilityInfo().then(function(response) {
                var myUtilityInfo = response;
                console.log('IsHighlited? '+response.utilityHighlighted);
                if(responsHandler.panelVisible){
                    utilityBarAPI.setUtilityHighlighted({
                        highlighted: false
                    });
                }else{
                    utilityBarAPI.setUtilityHighlighted({
                        highlighted: true
                    });
                }
            })
            .catch(function(error) {
                console.log(error);
            });
            };


            console.log(' eventHandler :'+ eventHandler);
            utilityBarAPI.onUtilityClick({
                eventHandler: eventHandler
            }).then(function(result){
                console.log(result);
            }).catch(function(error){
                console.log('error: '+error);
            })
                     }, 15000);
            
            component.set("v.IdealTimeAttentionIntervalId", IdealTimeAttentionIntervalId);*/
        
        //helper.createProgramedInter(component);
        //component.set("v.accessToken", 'UXVlbmRhV1MxNTE2MjcwNjUyNTQzMC4wMjkxMjY1Njg3ODg0MTU2ODU=');
    },
    
    getAccessToken: function(component, event ,helper) {   
        if (component.get("v.statusAccessToken") == 'ERROR' && component.get("v.failedFunctionName") != ""){
            helper.refreshToken(component,helper,component.get("v.failedFunctionName")); 
        }
    },
    
    //FINALIZAR ATENCIÓN Y PAUSA
    EndAttention : function(component, event, helper) {
        var timer = $("#timer_count").text();
        helper.switchSpinnerOn(component,'Finalizando...');//SPINNER ON
        helper.finishAndPause(component, helper); // PUT(1.2.4)      
    },
    
    //REENVIO DE TURNO EN CURSO 
    Forwarding : function(component, event, helper) {
        var timer = $("#timer_count").text() != ''? $("#timer_count").text() : 'KO'; //Ante problemas de conexión la variable timer se pone a KO de cara a la comunicación con el componente de reenvio
        console.log('TIMER EN FORWARDING: '+timer);
        //console.log(timer);
        //var parts = timer.split(':');
       
        // console.log(parts);
        helper.changeComponentView(component, "Forwarding", timer, "WithoutShift");        
    },
    
    //FINALIZAR ATENCIÓN Y LLAMAR A SIGUIENTE "TICKET"
    FinishAndNext: function(component, event, helper) {    
        component.set("v.oldShiftInfo", component.get("v.nextShiftInfo")); //El actual ticket pasa a ser "ticket anterior"
        helper.finishAndNext(component, helper); 
    },
    
    
    //SE COMPRUEBA QUE EXISTE ALGUN VALOR EN TIEMPO IDEAL DE ATENCIÓN PARA LA ACTIVACIÓN DEL PARPADEO DE LA BARRA Y TIEMPO EN ROJO
    IdealTimeAttentionCheck: function(component, event, helper) {  
        
        helper.checkIdealTimeAttention(component, event, helper);
       

    },
    
})