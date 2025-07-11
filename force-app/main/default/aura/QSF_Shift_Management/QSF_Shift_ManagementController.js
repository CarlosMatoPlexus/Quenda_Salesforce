({
    doInit : function(component, event, helper) {
        helper.currentUser(component);
        
        
    },
    jsLoaded : function(component, event, helper) {
        /*var res;
        sforce.console.onCustomConsoleComponentButtonClicked(function(){
            sforce.console.isCustomConsoleComponentWindowHidden(function(result){
                res = result;
            });
            var refreshIntervalId = setInterval(function() {
                if(res.hidden){
                    var time = setTimeout(function() {
                        sforce.console.setCustomConsoleComponentButtonStyle('background-color:orange;');
                    }, 1000); 
                }
                sforce.console.setCustomConsoleComponentButtonStyle('background-color:#9c9c9c;');
            }, 3000); 
        });*/
    },
    
    handleChangeView : function(component, event, helper) {
        var timerCount = event.getParam("timerCount");
        var view = event.getParam("view");
        var place= event.getParam("place");
        var currentUser= event.getParam("currentUser");
        var nextShiftInfo = event.getParam("nextShiftInfo");
        //console.log("OLD: "+ component.get("v.timerCount")  + " - " + component.get("v.view") + " - " + component.get("v.place") + " - " + component.get("v.currentUser") );
		//console.log("NEW: "+ timerCount + " - " + view + " - " + place + " - " + currentUser);      
        component.set("v.timerCount", timerCount);
        component.set("v.view", view);
        component.set("v.place", place);
        component.set("v.currentUser", currentUser);
        component.set("v.nextShiftInfo", nextShiftInfo);
        
    }
    
    /*click : function(component, event, helper) {
        var redirectUrl = '/0052F000000dsPn';
        console.log('MIRA LA URL: '+redirectUrl);
        sforce.console.openPrimaryTab(null, redirectUrl, true, 'jejeje', null);
        sforce.console.setCustomConsoleComponentWindowVisible(false);
        
        setTimeout(function() {
            sforce.console.setCustomConsoleComponentWindowVisible(true);
        }, 4000);
    }*/
})