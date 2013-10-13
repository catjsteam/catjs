Ext.define("CAT.view.Tweets", {
    extend:"Ext.Panel",
    alias:"widget.tweets",
    config:{
		layout: {
			type: "fit"
		},
		style: "opacity: .7",
        margin:0,
        padding:0,
        items: [{
        	xtype: 'label', 
        	html: "<h1 style='font-size: 20px'>Tweets</h1>",
        	padding: 5,
        	style: 'font-size: 18px; font-weight:bold'
        }]
    },
	
	/**
	 * @override
	 * The view initialize functionality
	 */
	initialize:function () {
        var me = this;
        this.callParent(arguments);

        console.log("[Tweets View] Initialized.");
    },
	
	/**
	 * Setting the view's tweets records
	 *
	 * @param text The data to be set
	 */
	setData: function(sto, records) {
		var me = this; 

		records.forEach(function(record) {
			var date = new Date(record.get("dateCreated"));
			if (date) {
				record.data.date = Ext.Date.format(date, 'd-m-Y h:m');
			}
		});

        var list = Ext.create('Ext.List', {
            itemTpl: '<div class="contact"><div style="width: 60px; height: 60px; float:left" ><img style="" src="data/images/{img}" /></div><div style="color: #444444; font-weight: bold; white-space: nowrap; display:table-cell">{name} <span style="color:#999999; font-size: 12px; font-weight: normal;">{username}</span></div><div style="vertical-align: top; text-align: right; display:table-cell;width:100%; font-size: 12px;">{date}</div></div> <div style="padding-top: 10px; color: #505050; font-size: 14px; text-align:left">{desc}</div>',
            layout: {
                type:"fit"
            },
            margin: 0,
            padding: 0,
            itemCls: "listItemClass",
            store: sto
        });
    /*
        @[scrap
        @@name catSencha
        @@context list
        @@sencha Ext.tap(list);
        ]@
    */
		this.add(list);
	}
});

