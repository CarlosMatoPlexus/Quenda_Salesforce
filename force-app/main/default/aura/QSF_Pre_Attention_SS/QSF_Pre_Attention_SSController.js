({
	handleClick : function(component, event, helper) {
		var changeViewEvent = component.getEvent("changeView");
        
        changeViewEvent.setParams({
            "view": "WaitingAgent",
            "place":component.get("v.place"),
            "currentUser": component.get("v.currentUser")
        }).fire();
        
        window.scrollTo(0, 0);
	},
    
    PreAttention : function(component, event, helper) {
        var changeViewEvent = component.getEvent("changeView");

        
        changeViewEvent.setParams({
            "view": "PreAttention",
            "place":component.get("v.place"),
            "currentUser": component.get("v.currentUser")
        }).fire();
        
        window.scrollTo(0, 0);
    },
    
    PreAttention2 : function(component, event, helper) {
        var changeViewEvent = component.getEvent("changeView");

        
        changeViewEvent.setParams({
            "view": "PreAttention_2",
            "place":component.get("v.place"),
            "currentUser": component.get("v.currentUser")
        }).fire();
        
        window.scrollTo(0, 0);
    },
    
    hideErrors : function(component, event, helper) {
        var a = event.getSource().getLocalId();
        var el= component.find(a);
        
        $A.util.removeClass(el, "slds-has-error"); // remove red border
        $A.util.addClass(el, "hide-error-message"); // hide error message
    },
    
    btStart : function(component, event, helper) {
        component.set("v.activeButtons", false);
        var date = new Date() / 1000;
        
        $('.timer2').countid({
            clock: true,
            dateTime: date,
            dateTplRemaining: "%H:%M:%S",
            dateTplElapsed: "%H:%M:%S",
            complete: function( el ){
                el.animate({ 'font-size': '15px'})
            }
        })
        
    //IDEAL TIME of ATTENTION EXPIRED NOTICE
       $(function(){
    	setTimeout(function() {
        	$('#timer_count').addClass("error")
    		}, 6000);
	});
    },
    
    
})