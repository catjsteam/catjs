Ext.define("CAT.view.Twitter", {
    extend:"Ext.Panel",
    alias:"widget.twitter",
    config:{
		layout: {
			type: "fit"
		},
        margin:0,
        padding:0,
        items:[ 
			{
				id:"_labelId",
				xtype:"titlebar",
				docked: "top",
				title: "Tweets"
			},
			{
				xtype: "container",
				id:"_tweetsViewId",
				layout: "fit",
				cls: ["appImage"]
			}
		]
    },
	
	/**
	 * @override
	 * The view initialize functionality
	 */
	initialize: function () {
        var me = this;
      
        this.callParent(arguments);       
        console.log("[Main View] Initialized.");
    },
	
	/**
	 * Setting the view's title text
	 *
	 * @param text The text to be set
	 */
	setTitle: function(text) {
		Ext.getCmp("_labelId").setTitle(text);
	},

	/**
	 * Setting the view's icon url
	 *
	 * @param url The url to be set
	 */	
	setIcon: function(url) {		
		var me = this,
			_elt = Ext.getCmp("_tweetsViewId");
		
		_elt.element.dom.style.backgroundImage = url;
	},
	
	setTweetsView: function(tweetsView) {
		Ext.getCmp("_tweetsViewId").add(tweetsView);
		
	}
});

