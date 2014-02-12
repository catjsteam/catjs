
Ext.define('Kitchensink.view.Overlays', {
    extend: 'Ext.Container',
    requires: ['Ext.MessageBox', 'Ext.ActionSheet'],

    config: {
        padding: 20,
        itemId : 'overlay',

        listeners : {
            painted: function (element, options) {
                /*
                 [scrap
                     @@name catSenchaTap
                     @@sencha tapButton('pickerButton');
                 ]@
                 */

                /*
                 [scrap
                 @@name catSenchaTap
                 @@sencha tapButton('pickerButton');
                 ]@
                 */
            }
        },
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

        items: [
            {
                text: 'Action Sheet',
                itemId : 'actionButton',
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
                itemId : 'overlayButton',
                handler: function() {
                    if (!this.overlay) {
                        this.overlay = Ext.Viewport.add({
                            xtype: 'panel',
                            itemId : 'overlayPanel',
                            modal: true,
                            hideOnMaskTap: true,
                            showAnimation: {
                                type: 'popIn',
                                duration: 250,
                                easing: 'ease-out'
                            },
                            listeners : {
                                painted: function (element, options) {
                                    /*
                                     [scrap
                                     @@name removeOverlayPanel
                                     @@sencha removePanel("overlayPanel");
                                     ]@
                                     */
                                }
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
                itemId : 'alertButton',
                handler: function() {
                    Ext.Msg.alert('Title', 'The quick brown fox jumped over the lazy dog.', Ext.emptyFn);
                }
            },
            {
                text: 'Prompt',
                itemId : 'promptButton',
                handler: function() {
                    Ext.Msg.prompt("Welcome!", "What's your first name?", Ext.emptyFn);
                }
            },
            {
                itemId : 'confirmButton',
                text: 'Confirm',
                handler: function() {
                    Ext.Msg.confirm("Confirmation", "Are you sure you want to do that?", function(a, b) { debugger; console.log("hi");});
                }
            },
            {
                text: 'Picker',
                itemId : 'pickerButton',
                handler: function() {
                    if (!this.picker) {
                        this.picker = Ext.Viewport.add({
                            xtype: 'picker',
                            itemId : 'overlayPicker',
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


