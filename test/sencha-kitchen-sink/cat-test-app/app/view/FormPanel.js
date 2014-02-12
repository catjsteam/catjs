/**
 * Demonstrates a tabbed form panel. This uses a tab panel with 3 tabs - Basic, Sliders and Toolbars - each of which is
 * defined below.
 *
 * See this in action at http://dev.sencha.com/deploy/sencha-touch-2-b3/examples/kitchensink/index.html#demo/forms
 */
Ext.define('Kitchensink.view.FormPanel', {
    extend: 'Ext.form.Panel',

    requires: [
        'Ext.form.FieldSet',
        'Ext.field.Number',
        'Ext.field.Spinner',
        'Ext.field.Password',
        'Ext.field.Email',
        'Ext.field.Url',
        'Ext.field.DatePicker',
        'Ext.field.Select',
        'Ext.field.Hidden',
        'Ext.field.Radio'
    ],
    id: 'basicform',
    config: {
        items: [
            {
                xtype: 'fieldset',
                id: 'fieldset1',

                title: 'Personal Info',
                instructions: 'Please enter the information above.',
                defaults: {
                    labelWidth: '35%'
                },


                listeners : {
                    painted: function(element, options) {


                        /*
                         @[scrap
                         @@name GoToSliders
                         @@run@ formPanelManager
                         @@sencha nestedlistSelect("mainNestedList", 1);
                         ]@
                         */

                        /*
                         @[scrap
                         @@name formPanelManager
                         @@perform[
                         @@setNamePanel repeat(1)
                         @@setPasswordPanel repeat(1)
                         @@setEmailPanel repeat(1)
                         @@setUrlPanel repeat(1)
                         @@setCheckboxPanel repeat(1)
                         @@setDatePanel repeat(1)
                         @@GoToSliders repeat(1)

                         ]
                         @@catui on
                         @@manager true
                         @@signal TESTEND
                         ]@
                         */
                    }
                },
                items: [
                    {
                        xtype         : 'textfield',
                        name          : 'name',
                        label         : 'Name',
                        itemId: 'formPanelName',
                        listeners : {
                            painted: function (element, options) {
                                /*
                                 @[scrap
                                 @@name setNamePanel
                                 @@run@ formPanelManager
                                 @@sencha setTextValue("formPanelName", 'this_is_my_new_name');
                                 ]@
                                 */
                            }
                        },
                        placeHolder   : 'Tom Roy',
                        autoCapitalize: true,
                        required      : true,
                        clearIcon     : true
                    },
                    {
                        xtype: 'passwordfield',
                        itemId: 'formPanelPassword',
                        listeners : {
                            painted: function (element, options) {
                                /*
                                 @[scrap
                                 @@name setPasswordPanel
                                 @@run@ formPanelManager
                                 @@sencha setTextValue("formPanelPassword", '1234');
                                 ]@
                                 */
                            }
                        },
                        name : 'password',
                        label: 'Password'
                    },
                    {
                        xtype      : 'emailfield',
                        name       : 'email',
                        label      : 'Email',
                        placeHolder: 'me@sencha.com',
                        itemId: 'formPanelEmail',
                        listeners : {
                            painted: function (element, options) {
                                /*
                                 @[scrap
                                 @@name setEmailPanel
                                 @@run@ formPanelManager
                                 @@sencha setTextValue("formPanelEmail", "catteam@cat.com");
                                 ]@
                                 */
                            }
                        },
                        clearIcon  : true
                    },
                    {
                        xtype      : 'urlfield',
                        name       : 'url',
                        label      : 'Url',
                        itemId: 'formPanelUrl',
                        listeners : {
                            painted: function (element, options) {
                                /*
                                 @[scrap
                                 @@name setUrlPanel
                                 @@run@ formPanelManager
                                 @@sencha setTextValue("formPanelUrl", "catjsteam@github.io");
                                 ]@
                                 */
                            }
                        },
                        placeHolder: 'http://sencha.com',
                        clearIcon  : true
                    },
                    {
                        xtype      : 'spinnerfield',
                        name       : 'spinner',
                        label      : 'Spinner',
                        itemId: 'formPanelSpinner',
                        listeners : {
                            spin: function (element, options) {
                                console.log("spin");
                            },
                            spinup: function (element, options) {
                                debugger;
                                console.log("spinup");
                            },
                            spindown: function (element, options) {
                                console.log("spindown");
                            }
                        },

                        minValue   : 0,
                        maxValue   : 10,
                        stepValue  : 1,
                        cycle      : true
                    },
                    {
                        xtype: 'checkboxfield',
                        itemId: 'formPanelCheckbox',
                        listeners : {
                            painted: function (element, options) {
                                /*
                                 @[scrap
                                 @@name setCheckboxPanel
                                 @@run@ formPanelManager
                                 @@sencha setChecked("formPanelCheckbox");
                                 ]@
                                 */
                            }
                        },
                        name : 'cool',
                        label: 'Cool'
                    },
                    {
                        xtype: 'datepickerfield',
                        destroyPickerOnHide: true,
                        itemId: 'formPanelDate',
                        name : 'date',
                        label: 'Start Date',
                        listeners : {
                            painted: function (element, options) {
                                /*
                                 @[scrap
                                 @@name setDatePanel
                                 @@run@ formPanelManager
                                 @@sencha setDate("formPanelDate", 2014, 2, 24);
                                 ]@
                                 */

                            }
                        },
                        value: new Date(),
                        picker: {
                            yearFrom: 1990
                        }
                    },
                    {
                        xtype: 'selectfield',
                        name : 'rank',
                        label: 'Rank',
                        options: [
                            {
                                text : 'Master',
                                value: 'master'
                            },
                            {
                                text : 'Journeyman',
                                value: 'journeyman'
                            },
                            {
                                text : 'Apprentice',
                                value: 'apprentice'
                            }
                        ]
                    },
                    {
                        xtype: 'textareafield',
                        name : 'bio',
                        label: 'Bio'
                    }
                ]
            },
            {
                xtype: 'fieldset',
                id: 'fieldset2',
                title: 'Favorite color',
                itemId: 'formPanelRadio',
                defaults: {
                    xtype     : 'radiofield',
                    labelWidth: '35%'
                },
                items: [
                    {
                        name : 'color',
                        value: 'red',
                        label: 'Red'
                    },
                    {
                        name : 'color',
                        label: 'Blue',
                        value: 'blue'
                    },
                    {
                        name : 'color',
                        label: 'Green',
                        value: 'green'
                    },
                    {
                        name : 'color',
                        label: 'Purple',
                        value: 'purple'
                    }
                ]
            },
            {
                xtype: 'container',
                defaults: {
                    xtype: 'button',
                    style: 'margin: .5em',
                    flex : 1
                },
                layout: {
                    type: 'hbox'
                },
                items: [
                    {
                        text: 'Disable fields',
                        scope: this,
                        hasDisabled: false,
                        handler: function(btn){
                            var fieldset1 = Ext.getCmp('fieldset1'),
                                fieldset2 = Ext.getCmp('fieldset2');

                            if (btn.hasDisabled) {
                                fieldset1.enable();
                                fieldset2.enable();
                                btn.hasDisabled = false;
                                btn.setText('Disable fields');
                            } else {
                                fieldset1.disable();
                                fieldset2.disable();
                                btn.hasDisabled = true;
                                btn.setText('Enable fields');
                            }
                        }
                    },
                    {
                        text: 'Reset',
                        handler: function(){
                            Ext.getCmp('basicform').reset();
                        }
                    }
                ]
            }
        ]
    }
});


