({
    jsLoaded : function(component, event, helper) {          
        //helper.loadPreAServiceList(component); 
        console.log('script de tiempo cargado');
        /*$('#timepicker2').timepicker({
                minuteStep: 1,
                template: 'modal',
                appendWidgetTo: 'body',
                showSeconds: true,
                showMeridian: false,
            	defaultTime: false
            });*/
       
            $('#timepicker2').timepicker({ 
                timeFormat: 'HH:mm:ss',
                dropdown:false,
                maxHour: 23,
        		maxMinutes: 59,
                dynamic:false
            });
        
            
    },
    
    doInit : function(component, event, helper) {
        
        console.log("init prueba");
       // var utilityAPI = component.find("UtilityBarEx");
        //utilityAPI.setUtilityHighlighted({highlighted:true});
        
        console.log("FIN init prueba");
        
        helper.loadPreAServiceList(component, helper);
        helper.getLocalTime(component,helper);
        //var al= component.find("timeOption2");
        //$A.util.removeClass(al, "slds-required");
        
       
        
    },
    
    //INICIO DEL PROCESO DE REFRESH TOKEN
    getAccessToken: function(component, event ,helper) { 
        if (component.get("v.statusAccessToken") == 'ERROR' && component.get("v.failedFunctionName") != ""){
            helper.refreshToken(component,helper,component.get("v.failedFunctionName")); 
        }
    },
    
    //BOTÓN "ATRÁS"
    undoClick: function(component, event, helper) {
        helper.changeComponentView(component,"WaitingAgent");  
    },
    
    
    printHour: function(component, event, helper) {
       // console.log(component.get("v.localTimeString"));
       // console.log(component.find("appt-time").get("v.value"));
       	var timeControl = document.querySelector('input[type="time"]');
       // console.log(timeControl.value);
        
    },
    
    //CONTROL DE SELECCION DE SERVICIO, ERROR POR AUSENCIA DE SERVICIO SELECCIONADO, Y CONTROL DE HORARIO DE OFICINA
    btStart: function(component, event, helper) {
        component.set("v.errorStatus", false);
        var timeControl='0';
        var validityCurrent= true;
        var validityOffice= true;
        var validity3= true;
        var indx= component.find("selectService").get("v.value");
        var service = component.get("v.preAServiceList");
        if (component.get("v.printingTicket")){
        //timeControl = (document.querySelector('input[type="time"]')).value;
        var x = document.getElementById("timepicker2").value;
        console.log(x);
            
        var finalTime = ((document.getElementById("timepicker2")).value).split(":");
        //console.log(timeControl);
        console.log(finalTime);
        console.log(component.get("v.localTime"));
       
        var currentHour= parseInt(component.get("v.localTime.hour")) ;
        var currentMinute= parseInt(component.get("v.localTime.minute"));
        var currentSeconds= parseInt(component.get("v.localTime.second")); 
        console.log(' Hora ' + currentHour + ' minutos ' + currentMinute + ' segundos ' + currentSeconds);
        console.log('Hora seleccionadaaaa ' + finalTime);
        console.log(finalTime[0]);
        console.log(finalTime[1]);
        console.log(finalTime[2]);
       
        //DIVIDIR HORA 
        //HORA APERTURA OFICINA  
      // var startAttentionTime = "2020-01-09 08:30:00.0";
        var startAttentionTime = component.get("v.startAttentionTime");
        console.log('Hora de apertura de oficina');
        //console.log(startAttentionTime);
		var dividedStartTime = (startAttentionTime.split(" ")); //divide la hora de la fecha
		//String (dividedStartTime = dividedStartTime.split(":"));                    
        //console.log(dividedStartTime); //hour
           var startOfficeAux1= dividedStartTime[1].split(".");
           // console.log(startOfficeAux1);
            var startOfficeTime= startOfficeAux1[0].split(":");
            console.log(startOfficeTime);
       

        //HORA CIERRE OFICINA
        //var endAttentionTime = "2020-01-09 20:30:00.0";
        var endAttentionTime = component.get("v.endAttentionTime");
        console.log('Hora de cierre de oficina');
        //console.log(endAttentionTime);
        var dividedFinishTime = (endAttentionTime.split(" ")); //divide la hora de la fecha
		//String (dividedStartTime = dividedStartTime.split(":"));                    
        //console.log(dividedFinishTime); //hour
           var finishOfficeAux1= dividedFinishTime[1].split(".");
            //console.log(finishOfficeAux1);
            var finishOfficeTime= finishOfficeAux1[0].split(":");
            console.log(finishOfficeTime);
        
        //  COMPROBACIÓN DE LA HORA INTRODUCIDA CON RESPECTO AL HORARIO DE OFICINA
        if( parseInt(finalTime[0]) < parseInt(startOfficeTime[0]) ||  parseInt(finalTime[0]) > parseInt(finishOfficeTime[0])  || document.getElementById("timepicker2").value==''){
            console.log("La hora introducida está fuera del horario de oficina - HORA");
            component.set("v.errorMessage", $A.get("$Label.c.QSF_OfficeTimeOut"));
            component.set("v.errorStatus", true); 
            validityOffice=false;
 
            
        }else if(parseInt(finalTime[0]) == parseInt(startOfficeTime[0])  ){ //La hora introducida coincide con la hora de apertura. Se comprueban los minutos
            if( parseInt(finalTime[1]) < parseInt(startOfficeTime[1])){
               // console.log(finalTime[1]+'  '+currentMinute);
                console.log("Fallo por minutos en hora de apertura");
                component.set("v.errorMessage", $A.get("$Label.c.QSF_OfficeTimeOut"));
                component.set("v.errorStatus", true); 
                validityOffice=false;
            }else if(parseInt(finalTime[1]) == parseInt(startOfficeTime[1]) ) { 
                if(parseInt(finalTime[2]) < parseInt(startOfficeTime[2]) ){
                    console.log("Fallo por segundos en hora de apertura");
                    component.set("v.errorMessage", $A.get("$Label.c.QSF_OfficeTimeOut"));
                    component.set("v.errorStatus", true); 
                    validityOffice=false;
                }else if(parseInt(finalTime[2]) <= parseInt(startOfficeTime[2]) ){
                    //console.log("Hora valida - SEGUNDOS");
                    validityOffice= true;
                }
            }
                else if(parseInt(finalTime[1]) < parseInt(startOfficeTime[0])){
               // console.log("Hora valida - MINUTOS");
                validityOffice= true;
            }else if(parseInt(finalTime[1]) < parseInt(startOfficeTime[0])){
               // console.log("Hora valida - MINUTOS");
                validityOffice= true;
            }
        }else if(parseInt(finalTime[0])  == parseInt(finishOfficeTime[0])){ //La hora introducida coincide con la hora de cierre. Se comprueban los minutos
           if( parseInt(finalTime[1]) > parseInt(finishOfficeTime[1])){
               // console.log(finalTime[1]+'  '+currentMinute);
                console.log("Fallo por minutos en hora de cierre");
                component.set("v.errorMessage", $A.get("$Label.c.QSF_Ticket_Printing_Error_CL"));
                component.set("v.errorStatus", true); 
                validityOffice=false;
            }else if(parseInt(finalTime[1]) == parseInt(finishOfficeTime[1]) ) { 
                if(parseInt(finalTime[2]) > parseInt(finishOfficeTime[2]) ){
                    console.log("Fallo por segundos en hora de cierre");
                    component.set("v.errorMessage", $A.get("$Label.c.QSF_Ticket_Printing_Error_CL"));
                    component.set("v.errorStatus", true); 
                    validityOffice=false;
                }else if(parseInt(finalTime[2]) <= parseInt(finishOfficeTime[2]) ){
                    //console.log("Hora valida - SEGUNDOS");
                    validityOffice= true;
                }
            }
                else if(parseInt(finalTime[1]) < parseInt(finishOfficeTime[0])){
               // console.log("Hora valida - MINUTOS");
                validityOffice= true;
            }else if(parseInt(finalTime[1]) < parseInt(finishOfficeTim[0])){
               // console.log("Hora valida - MINUTOS");
                validityOffice= true;
            }
        }else if( isNaN(finalTime[0]) || isNaN(finalTime[1]) || isNaN(finalTime[2])){
                component.set("v.errorMessage", $A.get("$Label.c.QSF_Ticket_Printing_Error_CL"));
                component.set("v.errorStatus", true); 
                validityOffice=false;
            }
           
            //COMPROBACIÓN DE LA HORA DE TICKET EN COMPARACIÓN A LA HORA ACTUAL
            if(validityOffice){ //se comprueba solo si el control de la oficina ha ido bien
                if(parseInt(finalTime[0]) > currentHour || document.getElementById("timepicker2").value==''){
                    //console.log("La hora introducida es menor - HORA");
                    component.set("v.errorMessage", $A.get("$Label.c.QSF_Ticket_Printing_Error_CL"));
                    component.set("v.errorStatus", true); 
                    validityCurrent=false;
                    
                    
                }else if(parseInt(finalTime[0]) == currentHour ){
                    if( parseInt(finalTime[1]) > currentMinute  ){
                        // console.log(dividedStartTime[1]+'  '+currentMinute);
                        // console.log("La hora introducida es menor - MINUTOS");
                        component.set("v.errorMessage", $A.get("$Label.c.QSF_Ticket_Printing_Error_CL"));
                        component.set("v.errorStatus", true); 
                        validityCurrent=false[1];
                    }else if(parseInt(finalTime[1]) == currentMinute ) {
                        if( parseInt(finalTime[2]) > currentSeconds ){
                            //console.log("La hora introducida es menor - SEGUNDOS");
                            component.set("v.errorMessage", $A.get("$Label.c.QSF_Ticket_Printing_Error_CL"));
                            component.set("v.errorStatus", true); 
                            validityCurrent=false;
                        }else if(parseInt(finalTime[2]) < currentSeconds ){
                            //console.log("Hora valida - SEGUNDOS");
                            validityCurrent= true;
                        }
                    }else if(parseInt(finalTime[1]) < currentMinute){
                        // console.log("Hora valida - MINUTOS");
                        validityCurrent= true;
                    }
                }else if(parseInt(finalTime[0]) < currentHour){
                    // console.log("Hora valida - HORA");
                    validityCurrent= true;
                }else if( isNaN(finalTime[0]) || isNaN(finalTime[1]) || isNaN(finalTime[2])){
                    component.set("v.errorMessage", $A.get("$Label.c.QSF_Ticket_Printing_Error_CL"));
                    component.set("v.errorStatus", true); 
                    validityCurrent=false;
                }
            }
            
            
        }
        
       
        
        
        
        
        //SI SE HA SELECCIONADO SERVICIO Y HORA SE PROCEDE A GESTIONAR EL TICKET
                
        if(indx!="" && validityOffice == true && validityCurrent == true && validity3 == true){ //solo se comienza si se ha seleccionado un servicio y la hora es correcta
            component.set("v.idSelectedService",service[indx].id);
            console.log('TODO CORRECTO, SE COMENZARÍA LA ATENCIÓN.....');
           // console.log("Servicio seleccionado: "+ component.get("v.idSelectedService"));
            helper.startPA(component,helper);  
            helper.switchSpinnerOn(component,'Atención rápida...');//SPINNER ON   
        }else if(indx==""){
            component.set("v.errorMessage", $A.get("$Label.c.QSF_Select_service_CL"));
            component.set("v.errorStatus", true); 
        }else if(validityOffice == false || validityCurrent == false || validity3 == false){
           /* component.set("v.errorStatusTime", true);
            component.set("v.errorMessageTime", 'Introduzca una hora anterior a la actual');*/
            
        }
    },
    
    //ESCONDE el aviso de color ROJO que obliga a seleccionar un SERVICIO
    hideErrors : function(component, event, helper) {
        component.set("v.errorStatus", false);
        var a = event.getSource().getLocalId();
        var el= component.find(a);
        if(a = "selectService" ){ 
        $A.util.removeClass(el, "slds-has-error"); // remove red border
        $A.util.addClass(el, "hide-error-message"); // hide error message
        }
    },
    
    //SE ACTUALIZA LA LISTA DE MINUTOS EN FUNCIÓN DE LA HORA SELECCIONADA
    refreshMinutes: function(component, event, helper) {
        var indx= component.find("selectHour").get("v.value");
        var hour = component.get("v.hourList");
        if (hour[indx] == component.get("v.localTime.hour")){
            //console.log('seleccion de hora actual');
          //  console.log(hour[indx]);
           // console.log(component.get("v.localTime.hour"));
            helper.buildTimeList(component, helper, 'minute');
        }else{
            helper.buildTimeList(component, helper, 'refreshMinutes');
        }
    },
    
    refreshMinutesDos: function(component, event, helper) {
        var hour= component.find("selectHourInput").get("v.value");
        if (hour<10){ hour="0"+hour;}
        if (hour != component.get("v.restrictionTime.hour")){
           // console.log(component.get("v.restrictionTime.hour"));
            //console.log(hour);
            component.set("v.restrictionTime.minute","59");
        }
        else{
           // console.log(component.get("v.restrictionTime.minuteCurrentHour"));
            component.set("v.restrictionTime.minute", component.get("v.restrictionTime.minuteCurrentHour"));
            
        }
    },
    
    setUtilityIcon : function(component, event, helper) {
        var utilityAPI = component.find("UtilityBarEx");
        utilityAPI.setUtilityIcon({icon: 'insert_tag_field'});
    },
    setUtilityLabel: function(component, event, helper) {
        var utilityAPI = component.find("UtilityBarEx");
        utilityAPI.setUtilityLabel({label: 'Salesforce Utility '});
    },
    setUtilityHighlighted :  function(component, event, helper) {
        var utilityAPI = component.find("UtilityBarEx");
        utilityAPI.setUtilityHighlighted({highlighted:true});
    },
    
    
    setPanelWidth:function(component, event, helper) {
        var utilityAPI = component.find("UtilityBarEx");
        utilityAPI.setPanelWidth({widthPX:120});
    },
    
    setPanelHeight:function(component, event, helper) {
        var utilityAPI = component.find("UtilityBarEx");
        utilityAPI.setPanelHeight({heightPX :120});
    },
    
    setPanelHeaderLabel :function(component, event, helper) {
        var utilityAPI = component.find("UtilityBarEx");
        utilityAPI.setPanelHeaderLabel({label  :'Panel Header'});
    },
    
    setPanelHeaderIcon : function(component, event, helper) {
        var utilityAPI = component.find("UtilityBarEx");
        utilityAPI.setPanelHeaderIcon({icon: 'insert_tag_field'});
    },
    
    
    
})