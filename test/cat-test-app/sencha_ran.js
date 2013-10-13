var _extjs = { };


var fireItemTapFunc = function(extElement, index) {
    extElement.fireEvent('itemtap',extElement, index);
}

var fireTapFunc = function(extElement) {
    extElement.fireEvent('tap');
}

var setTextHelp = function(id, str) {

    var extElement = Ext.getCmp(id);
    if ( extElement.hasListener('painted')) {

        extElement.setValue(str);
    } else {

        extElement.addListener('painted', function() {
            extElement.setValue(str);
        });
    }
}

_extjs = function () {

    return {

        actions:{


            fireTap:function (extElement) {
                // check number of args
                if (arguments.length == 1) {

                    if ( extElement.hasListener('painted')) {

                        fireTapFunc(extElement);
                    } else {

                        extElement.addListener('painted', fireTapFunc(extElement));
                    }


                } else {
                    // in case of list
                    var index = arguments[1];
                    if ( extElement.hasListener('painted')) {
                        fireItemTapFunc(extElement, index);
                    } else {

                        extElement.addListener('painted', fireItemTapFunc(extElement, index));

                        if ( Ext.getCmp(extElement).hasListener('painted')) {
                            fireItemTapFunc(extElement, index);
                        } else {
                            Ext.getCmp(extElement).addListener('painted', fireItemTapFunc(extElement, index));
                        }
                    }

                }

            },

            setText : function(id, str) {

                if (!Ext.getCmp(id)) {
                    myVar=setInterval(function(){
                        if (Ext.getCmp(id)) {
                            clearInterval(myVar);
                            setTextHelp(id, str);
                        }
                    },10);
                } else {
                    setTextHelp(id, str);
                }
            }
        }


    };

}();
