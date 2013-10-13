Ext.define("CAT.view.Tweets", {
    extend:"Ext.Panel",
    alias:"widget.tweets",
    config : {

    },

    initialize : function() {
        this.callParent();
        var emailField = {
            xtype : 'emailfield',
            label : 'Email',
            name  : 'email',
            id : 'emailId'
        };


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
         ]@
         */

        this.setItems([{
            xtype : 'fieldset',
            title : 'Enter Login Data:',
            items : [emailField, button]
        }]);

    }
});

