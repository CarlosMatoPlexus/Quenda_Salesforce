({
    
    jsLoaded : function(component, event, helper) {        
        
        
        /*Date.prototype.addSeconds= function(h){
            this.setSeconds(this.getSeconds()+h);
            return this;
        };*/
        
        var date = new Date() / 1000;
        
        $('.timer2').countid({
            clock: true,
            dateTime: date,
            dateTplRemaining: "%H:%M:%S",
            dateTplElapsed: "%H:%M:%S",
            complete: function( el ){
                el.animate({ 'font-size': '16px'})
            }
        })
        
        $(function(){
            setTimeout(function() {
                $('#timer_count').addClass("error")
            }, 6000); 
        });
        
    }, 
    
    handleClick : function(component, event, helper) {
        var changeViewEvent = component.getEvent("changeView");
        
        changeViewEvent.setParams({
            "view": "WaitingAgent",
            "timerCount": "",
            "place":component.get("v.place"),
            "currentUser": component.get("v.currentUser")
        }).fire();
        
        window.scrollTo(0, 0);
    },
    
    EndAttention : function(component, event, helper) {
        var changeViewEvent = component.getEvent("changeView");
        var timer = $("#timer_count").text();
        
        changeViewEvent.setParams({
            "view": "WaitingAgent",
            "timerCount": "",
            "place":component.get("v.place"),
            "currentUser": component.get("v.currentUser")
        }).fire();
        
        window.scrollTo(0, 0);
    },
    
    EndAndNext : function(component, event, helper) {
        var changeViewEvent = component.getEvent("changeView");
        var timer = $("#timer_count").text();
        
        changeViewEvent.setParams({
            "view": "AttentionProgress",
            "timerCount": "",
            "place":component.get("v.place"),
            "currentUser": component.get("v.currentUser")
        }).fire();
        
        window.scrollTo(0, 0);
    },
    
    Forwarding : function(component, event, helper) {
        var changeViewEvent = component.getEvent("changeView");
        var timer = $("#timer_count").text();
        
        changeViewEvent.setParams({
            "view": "Forwarding",
            "timerCount": timer,
            "place":component.get("v.place"),
            "currentUser": component.get("v.currentUser")
        }).fire();
        
        window.scrollTo(0, 0);
    }
    
})