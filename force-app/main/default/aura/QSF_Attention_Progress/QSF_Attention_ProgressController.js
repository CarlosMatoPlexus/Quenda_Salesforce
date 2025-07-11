({      
    doInitTab: function(component, event ,helper) {
        //console.log('Do INIT de Atencion en Progreso');
        //console.log(component.get("v.interactionTabId"));
        //console.log(component.get("v.previousView"));
        console.log('Ticket recuperado');
        console.log(component.get("v.RecoveredTicket"));
        console.log(component.get("v.idSelectedService"));
        console.log(component.get ("v.isLEX"));
        
        helper.loadUnattendedShiftNumber(component, helper); // GET (1.1.4)
        var name = component.get("v.nextShiftInfo.Nombre");
        //console.log('Atención sin transito?  '  +component.get("v.nextShiftInfo.atencionSinTransito"));
        if((name != "")){ //Si la cita está autenticada se muestran nombres y apellidos en la pantalla
            component.set("v.authenticated", true);
        }
        
        if (component.get("v.previousView")!="Forwarding"){
            
            
            //Abrir pestaña de la interacción
            if((component.get("v.nextShiftInfo").idInteraccion == 'undefined') || (component.get("v.nextShiftInfo").idInteraccion == '') ) { //Añadir posibilidad de campo idInteraccion vacio
                //console.log('AP: Undefined interaction');
                //console.log('No hay interaccion asociada a al turno');
            } else {
                //console.log('AP: Interaction Id: '+component.get("v.nextShiftInfo.idInteraccion"));
                
                //Getting URL page
                var sPageURL = decodeURIComponent(window.location.search.substring(1)); //You get the whole decoded URL of the page.
                var url = sPageURL.substring(sPageURL.indexOf("https"), sPageURL.indexOf("salesforce.com"))+'salesforce.com/';
                
                // New tab with current Interaction
                var interId = component.get("v.nextShiftInfo.idInteraccion");
                //sforce.console.openPrimaryTab(null, url+interId, true);    
               
                
               // if (component.get ("v.isLEX")){
               if(window.location.href.includes("lightning")){
                //VERSION LIGHTNING
                var interId = component.get("v.nextShiftInfo.idInteraccion");
                //console.log(interId);
                   var workspaceAPI = component.find("workspace");                                  
                workspaceAPI.openTab({
                    recordId: interId,
                    focus: true
                }).then(function(response) {
                    component.set("v.interactionTabId",response);
                    workspaceAPI.getTabInfo({
                        tabId: response
                    }).then(function(tabInfo) {
                        //console.log("The recordId for this tab is: " + tabInfo.recordId);
                    });
                }).catch(function(error) {
                    //console.log(error);
                });
                }
                else {
                sforce.console.openPrimaryTab(null, url+interId, true, '', (function(result){
                    //console.log('entro en opensucces');
                    //console.log(result.id);
                    //console.log(result.success);
                    //Report whether opening the new tab was successf
                    if (result.success == true) {
                        //console.log('Primary tab successfully opened');
                        component.set("v.interactionTabId",result.id);
                       // console.log(component.get("v.interactionTabId"));
                    } else if(result.success == false) {
                        //console.log('buscar tab-id de la interaccion');
                        sforce.console.getPrimaryTabIds(function (resultNew) {
                            var i;
                            for (i = 0; i < (resultNew.ids).length; i++) { 
                                var res= resultNew.ids[i];
                                sforce.console.getPageInfo(resultNew.ids[i], function(resultInfo){
                                    //console.log(resultNew.ids[i]);
                                    //console.log(resultInfo.pageInfo);
                                    var jsonInfo= JSON.parse(resultInfo.pageInfo);
                                    //console.log(jsonInfo.object);
                                    if (jsonInfo.object =='Interaction__c'){
                                        component.set("v.interactionTabId",res);
                                        //console.log(component.get("v.interactionTabId"));
                                        //console.log(res);
                                    }
                                });
                            }
                        }
                                                       );
                        
                    } else
                        console.log('Primary tab cannot be opened');
                    
                    
                })
                                              
                                             );  
            }
            }
        }
        
        
        
    }, 
    
    jsLoaded : function(component, event, helper) {  
        console.log('SALTA EL JSLOADED de AttentionPROGRESS');
        var isTransitTime = component.get("v.nextShiftInfo.atencionSinTransito");
        //isTransitTime=true;
        var maxNoTransitTime = component.get("v.nextShiftInfo.tiempoMaxSinTransito");
        var isAttentionStarted = (component.get("v.nextShiftInfo.fechaAtencionSinTransito")!="") ? true:false;
        var isAttentionNormalStarted = (component.get("v.nextShiftInfo.fechaAtencion")!="") ? true:false;
        var RecoveredTicket = component.get("v.RecoveredTicket");
        var isForwardingPreviousView = (component.get("v.previousView")=="Forwarding") ?  true : false;
        var idInteraction = component.get("v.nextShiftInfo.idInteraccion");
        
         if (RecoveredTicket && (isAttentionStarted || isAttentionNormalStarted) ){
              console.log("Ticket recuperado y atencion comenzada");
                idInteraction = component.get("v.nextShiftInfo.idInteraccion");
                //CONTROLAR SI HAY O NO HAY ID DE INTERACCIÓN
                helper.AttentionTimeAfterRefreshPage(component, helper, idInteraction);
             if(isTransitTime && isAttentionStarted){
                 helper.NoTrasitAttentionButtonConfig(component, helper);
             }else if(isTransitTime && !isAttentionStarted){
                  helper.NoTrasitTimeConfig(component, helper);
                helper.NoTrasitInitButtonConfig(component, helper);
             }
             
            }else if (!isForwardingPreviousView && !isTransitTime)  {
                console.log("NO AtencionSinTransito y Sin venir de Forwarding");
                $('.timer').countimer();
                
            }else if (isForwardingPreviousView && isTransitTime) {//Vengo de forwarding y es una atención sin tránsito
                
                console.log("vengo de FORWARDING");
                helper.NoTrasitAttentionButtonConfig(component, helper);
                helper.AttentionTimeAfterRefreshPage(component, helper, idInteraction);
                /*var timer = component.get("v.timerCount");
                console.log(timer);
                var parts = timer.split(':');
                console.log(parts);
                $('.timer').countimer(
                    {
                        initHours: parts[0],
                        initMinutes: parts[1],
                        initSeconds: parts[2]
                    });*/
                
                
            }else if(isForwardingPreviousView && !isTransitTime){ //Vengo de forwarding y es una atención normal
                helper.AttentionTimeAfterRefreshPage(component, helper, idInteraction);
                /*var timer = component.get("v.timerCount");
                console.log(timer);
                var parts = timer.split(':');
                console.log(parts);
                $('.timer').countimer(
                    {
                        initHours: parts[0],
                        initMinutes: parts[1],
                        initSeconds: parts[2]
                    });*/
                
            }else if(isTransitTime){
                
                helper.NoTrasitTimeConfig(component, helper);
                helper.NoTrasitInitButtonConfig(component, helper);
                if(maxNoTransitTime!= 0){
                    helper.automaticNextTicket(component,helper, maxNoTransitTime);
                }
                
                
            }else if(!isTransitTime && !RecoveredTicket){
                if (component.get("v.previousView")!="Forwarding")  {
                    console.log("TIMER: NO AtencionSinTransito y NO TicketRecuperado ");
                    $('.timer').countimer();
                }else{
                    console.log("vengo de FORWARDING");
                    helper.AttentionTimeAfterRefreshPage(component, helper, idInteraction);
                    /*var timer = component.get("v.timerCount");
                    console.log(timer);
                    var parts = timer.split(':');
                    console.log(parts);
                    $('.timer').countimer(
                        {
                            initHours: parts[0],
                            initMinutes: parts[1],
                            initSeconds: parts[2]
                        });*/
                }
                
            }
        
        if(RecoveredTicket!=true && !isForwardingPreviousView ){
            helper.checkIdealTimeAttention(component, event, helper);
        }
        
        
        //IDEAL TIME of ATTENTION EXPIRED NOTICE
       /*
        if(component.get("v.nextShiftInfo").tiempoAtencionIdeal > 0){ // Si el tiempo es mayor que CERO se evalua el tiempo en curso con respecto al tiempo ideal
            var attentionInProgress = component.get("v.attentionTimeInSeconds");
            var attentionTimeAux = component.get("v.nextShiftInfo").tiempoAtencionIdeal*60000 ;
            var idealAttentionTimeMilisec = attentionInProgress > attentionTimeAux ? 500 :(attentionTimeAux - attentionInProgress) ;
             console.log(attentionInProgress);
             console.log(attentionTimeAux);
            console.log('Activado Tiempo Ideal -> Tiempo restante:-> '+ idealAttentionTimeMilisec);
            
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
  /*          if(window.location.href.includes("lightning")){//CONTROL DE PARPADEO DE BARRA DE CONSOLA EN LIGHTNING EXPERIENCE
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
                        //  console.log('Toggle?: '+progresToggleIcon);
                        if(result.hidden){
                            if(progresToggleIcon){
                                sforce.console.setCustomConsoleComponentButtonStyle('background-color:#FAAC58;');
                            }else{
                                sforce.console.setCustomConsoleComponentButtonStyle('background-color:#C3C3C3;');
                            }
                            
                        }else{
                           // console.log('Componente abierto');
                            sforce.console.setCustomConsoleComponentButtonStyle('background-color:#C3C3C3;');
                        }
                    });
                    
                    
                    //sforce.console.setCustomConsoleComponentButtonStyle('background-color:#FAAC58;');
                    
                    
                }), 1000);
                component.set("v.IdealTimeAttentionIntervalId", IdealTimeAttentionIntervalIdClassic); 
                
            }
            
        }, idealAttentionTimeMilisec);
            component.set("v.IdealTimeAttentionTimeOutId", IdealTimeAttentionTimeOutId);
        }   */
        
        
        
        
        
        //FIN CONTROL DEL TIEMPO IDEAL DE ATENCIÓN ---------------------------------------------------------------------
        //
        //component.set("v.accessToken", 'UXVlbmRhV1MxNTE2MjcwNjUyNTQzMC4wMjkxMjY1Njg3ODg0MTU2ODU='); 
    },
    
    getAccessToken: function(component, event ,helper) { 
        if (component.get("v.statusAccessToken") == 'ERROR' && component.get("v.failedFunctionName") != ""){
            helper.refreshToken(component,helper,component.get("v.failedFunctionName")); 
        }
    },
    
    placeChange: function(component, event ,helper) {
        //console.log('cambia el valor de place...');
        //console.log(component.get("v.place"));
        //console.log(component.get("v.currentUser"));
        helper.loadUnattendedShiftNumber(component, helper); // GET (1.1.4)
    },
    
    
    //CLIENTE AUSENTE
    Absent : function(component, event, helper) {
        helper.markAbsentClient(component, helper); // PUT(1.2.6)  
    },
    
    //INICIO REAL DE ATENCIÓN (FUNCIONALIDAD TIEMPO ATENCION SIN TRÁNSITO)
    StartAttention: function(component, event, helper) {
        helper.NoTrasitAttentionButtonConfig(component, helper);
        helper.clientHasCome(component, helper); // PUT(1.2.6) 
        if(component.get("v.timeOutId")!=''){ //Se destruye el proceso de TIMEOUT si se cambia de vista
            console.log("Se desactiva el timer automatico de Atencion sin tránsito");
            clearTimeout(component.get("v.timeOutId"));
        }
    },
    
    //FINALIZAR ATENCIÓN Y PAUSA (actualiza interaccion creada al inicio de la atención)
    EndAttention : function(component, event, helper) {
        var timer = $("#timer_count").text();
        helper.finishAndPause(component, helper); // PUT(1.2.4)  
    },
    
    //FINALIZAR Y SIGUIENTE
    EndAndNext : function(component, event, helper) {
        component.set("v.oldShiftInfo", component.get("v.nextShiftInfo")); //El actual ticket pasa a ser "ticket anterior"
        helper.finishAndNext(component,helper);// PUT(1.2.5)
        helper.getOldIdSubTab(component); //Obtenemos el ID de la pestaña que hay que cerrar
    },
    
    //REENVIO DE TURNO EN CURSO 
    Forwarding : function(component, event, helper) {
        var timer = $("#timer_count").text();
        helper.changeComponentView(component, "Forwarding", timer,"AttentionProgress");   
    },
    
    //RE-LLAMADA POR PANTALLA
    Recall : function(component, event, helper) {
        helper.makeScreenRecall(component,helper); // PUT(1.2.7)
        helper.timeoutSpinner(component,helper, $A.get("$Label.c.QSF_Recall_spinner_CL")); 
    },
    
    //SE COMPRUEBA QUE EXISTE ALGUN VALOR EN TIEMPO IDEAL DE ATENCIÓN PARA LA ACTIVACIÓN DEL PARPADEO DE LA BARRA Y TIEMPO EN ROJO
    IdealTimeAttentionCheck: function(component, event, helper) {
        var isFinishAndNext =component.get("v.lastOperationFinishAndNext");
        if(!isFinishAndNext){
        helper.checkIdealTimeAttention(component, event, helper);
        }
    },
    
})