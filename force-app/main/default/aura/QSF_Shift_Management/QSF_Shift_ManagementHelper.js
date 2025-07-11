({
	
    isQuendaUser : function(component,helper) {
		var action = component.get("c.isQuendaUser");
        action.setCallback(this, function(response) {
	        if(component.isValid() && response.getState() === "SUCCESS") {
                if(response.getReturnValue()==false){
                    console.log(response.getReturnValue());
                   component.set("v.view", 'NotQuendaUser');
                }else{
                   helper.currentUser(component);
                } 
	        } else {
	            console.log("KO-IsQuendaUser"); 
	        }   
	    });
      $A.enqueueAction(action);
	},
    
    currentUser : function(component) {
		var action = component.get("c.getCurrentUser");
        action.setCallback(this, function(response) {
	        if(component.isValid() && response.getState() === "SUCCESS") {
				component.set("v.currentUser", response.getReturnValue());
	        } else {
	            console.log("KO-currentUser"); 
	        }   
	    });
      $A.enqueueAction(action);
	},
    
})