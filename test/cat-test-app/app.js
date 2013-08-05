Ext.Loader.setConfig({enabled:true});
/*
	This is a fix for a missing resources while loading the application
	in a real device.
	TBD: Look for a clean fix
	
	Ext.Loader.setPath({
		'Ext': 'sdk/src'
	});
*/


Ext.application({
    name: "CAT",
	appFolder: ".",

    controllers: ["CAT.controller.Twitter"],
	models:["CAT.model.Twitter", "CAT.model.Tweets"],
    stores: ["CAT.store.Twitter", "CAT.store.Tweets"],
    views: ["CAT.view.Twitter", "CAT.view.Tweets"],

    launch: function() {   

        window.hwHandle = this.application;		
    }
});