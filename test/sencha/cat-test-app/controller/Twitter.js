Ext.define("CAT.controller.Twitter", {

    extend:"Ext.app.Controller",
    config:{
        refs:{
            hw:"twitter"
        },
        control:{
            hw:{
                gotoMainHW:"onGoToMainHW"
            }
        }
    },


	/**
	 * Default main view
	 */
    onGoToMainHW:function () {
		var view,
            me = this;

        Ext.Viewport.removeAll();
        Ext.Viewport.add([
            {
                xtype:"twitter"
            }
        ]);
        Ext.Viewport.setActiveItem(0);
    },


    /**
	 * @override
	 * This function will be called after the application's launch function has been called
	 * to initialize the controller
	 */
    launch:function () {

        this.callParent(arguments);
        console.log("[Main controller] launched");

    },

	/**
	 * @override
	 * This function is called before the launch function.
	 */
    init:function () {

        var me = this;
        this.callParent(arguments);
        console.log("[Main controller] Initialized.");

		this.main();
    },

	/**
	 * Main application functionality
	 * It loads the data using sencha store and then creates the view with the incoming data.
	 */
    main:function () {
        var me = this,
            hwStore;

		/**
		 * Callback function for the store.
		 */
        function _onLaunch(records) {
            me.initRefrencesView(records, "twitter");
        }

		// loading the application data (see the model and store classes)
        hwStore = Ext.getStore("Twitter");
        hwStore.load({
            callback:function (records, operation, success) {
                _onLaunch(records);
            },
            scope:this
        });
    },

	/**
	 * Initialize the sencha viewport with the main view
	 * and setting the title and the icon according to the incoming data.
	 *
	 * @param records The incoming data records
	 * @param viewName The view that will be added to the Viewport
	 */
    initRefrencesView:function (records, viewName) {

        var view,
			record = (records? records[0] : undefined),
            me = this,
            hwStore,
            createView = {

        		"twitter": function() {

        			// This is how you can get a reference to your view.
        	        view = this.getHw();
        	        if (view) {
        	           // Put your view code in here
        			   view.setTitle(record.get("title"));
        			   view.setIcon(record.get("icon"));
        	        }

        	        // loading the Tweets data (see the model and store classes)
        	        hwStore = Ext.getStore("Tweets");
        	        hwStore.load({
        	            callback:function (records, operation, success) {
        	            	var tweetsView = Ext.createByAlias("widget.tweets", {records:records});
        	                if (tweetsView) {
        	                	tweetsView.setData(hwStore, records);
        	                	view.setTweetsView(tweetsView);
        	                }
        	            },
        	            scope:this
        	        });
        		}
        	};

		// Clean the viewport
        Ext.Viewport.removeAll();

		// Add a view to the viewport
        Ext.Viewport.add([
            {
                xtype: viewName
            }
        ]);
        Ext.Viewport.setActiveItem(0);
        createView[viewName].call(me);

    }

	

});
