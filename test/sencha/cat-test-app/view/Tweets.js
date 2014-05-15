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
            @@name sample
            @@sample Custom Annotation
        ]@


         @[scrap
             @@name catSenchaText
             @@context emailField
             @@sencha setText(emailField, "this is a check");
             @@assert ok(true, "@CAT Assertion 2");
         ]@
         */


        var testFunction = function(val) {
            debugger;
            return val;
        }


        checkTextRan = {"name" : "hello"};
        checkTextRan2 = {"name" : "world"};



        var button = Ext.create('Ext.Button', {
            text: 'Button',
            id : 'btnId',
            listeners: {
                tap: function() {
                    Ext.Msg.alert(checkTextRan.name);
                }
            }

        });

        /*
         @[scrap
             @@name catMockTest
             @@context testFunction
             @@mock equal(testFunction(tests_db.testname), "please fail", "test success", "test fail");
         ]@
         */


        /*
         @[scrap
             @@name catMockSet
             @@context checkTextRan
             @@mock set(checkTextRan.name, "I changed the test msg");
         ]@
         */



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

