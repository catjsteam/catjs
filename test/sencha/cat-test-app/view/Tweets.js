Ext.define("CAT.view.Tweets", {
    extend:"Ext.Panel",
    alias:"widget.tweets",
    config : {

    },

    initialize : function() {
        this.callParent();
        var emailField = Ext.create('Ext.field.Email', {

            label : 'Email',
            name  : 'email',
            id : 'emailId'
        });
        /*
         @[scrap
             @@name catSenchaText
             @@context emailField
             @@sencha setText(emailField, 'this is a check');
             @@assert ok(true, "@CAT Assertion 2");
         ]@
         */

        var button = Ext.create('Ext.Button', {
            text: 'Button',
            id : 'btnId',
            listeners: {
                tap: function() {
                    Ext.Msg.alert('You clicked the button');
                }
            }

        });

        /*
         @[scrap
             @@name catSenchaBtn
             @@context button
             @@sencha tap(button);
             @@assert ok(true, "@CAT Assertion test@ falsely");
         ]@
         */



        this.setItems([{
            xtype : 'fieldset',
            title : 'Enter Login Data:',
            items : [emailField, button]
        }]);




    }
});

