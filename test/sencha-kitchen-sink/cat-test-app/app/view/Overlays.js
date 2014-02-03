
Ext.define('Kitchensink.view.Overlays', {
    extend: 'Ext.Container',
    requires: ['Ext.MessageBox', 'Ext.ActionSheet'],

    config: {
        padding: 20,
        itemId : 'overlay',
        plugins: [
            {
                xclass: 'Ext.ux.CAT'
            }
        ],
        scrollable: true,
        layout: {
            type : 'vbox',
            pack : 'top',
            align: 'stretch'
        },

        defaults: {
            xtype : 'button',
            cls   : 'demobtn',
            margin: '10 0'
        },
        scraps : {

        },

        items: [
            {
                text: 'Action Sheet',
                model: false,
                handler: function() {
                    var items = [
                        {

                            text: 'Delete draft',
                            ui: 'decline',
                            scope: this,
                            handler: function() {
                                this.actions.hide();
                            }
                        },
                        {
                            text: 'Save draft',
                            scope: this,
                            handler: function() {
                                this.actions.hide();
                            }
                        },
                        {
                            xtype: 'button',
                            text: 'Cancel',
                            scope: this,
                            handler: function() {
                                this.actions.hide();
                            }
                        }
                    ];

                    if (!this.actions) {
                        this.actions = Ext.create('Ext.ActionSheet', {
                            items: items
                        });
                    }

                    Ext.Viewport.add(this.actions);
                    this.actions.show();
                }
            },
            {
                text: 'Overlay',
                handler: function() {
                    if (!this.overlay) {
                        this.overlay = Ext.Viewport.add({
                            xtype: 'panel',
                            modal: true,
                            hideOnMaskTap: true,
                            showAnimation: {
                                type: 'popIn',
                                duration: 250,
                                easing: 'ease-out'
                            },
                            hideAnimation: {
                                type: 'popOut',
                                duration: 250,
                                easing: 'ease-out'
                            },
                            centered: true,
                            width: Ext.filterPlatform('ie10') ? '100%' : (Ext.os.deviceType == 'Phone') ? 260 : 400,
                            height: Ext.filterPlatform('ie10') ? '30%' : Ext.os.deviceType == 'Phone' ? 220 : 400,
                            styleHtmlContent: true,
                            html: '<p>This is a modal, centered and floating panel. hideOnMaskTap is true by default so ' +
                                'we can tap anywhere outside the overlay to hide it.</p>',
                            items: [
                                {
                                    docked: 'top',
                                    xtype: 'toolbar',
                                    title: 'Overlay Title'
                                }
                            ],
                            scrollable: true
                        });
                    }

                    this.overlay.show();
                }
            },
            {
                text: 'Alert',
                handler: function() {
                    Ext.Msg.alert('Title', 'The quick brown fox jumped over the lazy dog.', Ext.emptyFn);
                }
            },
            {
                text: 'Prompt',
                handler: function() {
                    Ext.Msg.prompt("Welcome!", "What's your first name?", Ext.emptyFn);
                }
            },
            {
                text: 'Confirm',
                handler: function() {
                    Ext.Msg.confirm("Confirmation", "Are you sure you want to do that?", Ext.emptyFn);
                }
            },
            {
                text: 'Picker',
                itemId : 'pickerRan',
                handler: function() {
                    if (!this.picker) {
                        this.picker = Ext.Viewport.add({
                            xtype: 'picker',
                            slots: [
                                {
                                    name : 'limit_speed',
                                    title: 'Speed',
                                    data : [
                                        {text: '50 KB/s', value: 50},
                                        {text: '100 KB/s', value: 100},
                                        {text: '200 KB/s', value: 200},
                                        {text: '300 KB/s', value: 300}
                                    ]
                                }
                            ]
                        });
                    }

                    this.picker.show();
                }
            }
        ]
    }
});


/*
 @[scrap
 @@name catSenchaTap
 @@sencha tapButton('overlay', 'pickerRan');
 ]@
 */
