var _extjs = { };


var fireItemTapFunc = function(id, index) {
    Ext.getCmp(id).fireEvent('itemtap',Ext.getCmp(id), index);
};
_extjs = function () {

    return {

        actions:{


            fireTap:function (extElement) {
                console.log("sencha_ran : extElement : " + extElement);
/*
                // check number of args
                if (arguments.length == 1) {
                    Ext.getCmp(id).fireEvent('tap');
                } else {
                    // in case of list
                    var index = arguments[1];
                    console.log("try to add listener");
                    console.log(Ext.getCmp(id));
                    console.log("index : " + index);
                    if ( Ext.getCmp(id).hasListener('painted')) {
                        fireItemTapFunc(id, index);
                    } else {
                        Ext.getCmp(id).addListener('painted', fireItemTapFunc(id, index));
                    }


                }
 */
            }
        }


    };

}();
