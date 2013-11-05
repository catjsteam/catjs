_cat.plugins.sencha = { },

    fireItemTapFunc = function (extElement, index) {
        extElement.fireEvent('itemtap', extElement, index);
    },

    fireTapFunc = function (extElement) {
        extElement.fireEvent('tap');
    },

    setTextHelp = function (extElement, str) {

        if (extElement.hasListener('painted')) {

            extElement.setValue(str);
        } else {

            extElement.addListener('painted', function () {
                extElement.setValue(str);
            });
        }
    };

_cat.plugins.sencha = function () {

    return {

        actions: {


            fireTap: function (extElement) {
                // check number of args
                if (arguments.length == 1) {

                    if (extElement.hasListener('painted')) {

                        fireTapFunc(extElement);
                    } else {

                        extElement.addListener('painted', fireTapFunc(extElement));
                    }


                } else {
                    // in case of list
                    var index = arguments[1];
                    if (extElement.hasListener('painted')) {
                        fireItemTapFunc(extElement, index);
                    } else {

                        extElement.addListener('painted', fireItemTapFunc(extElement, index));

                        if (extElement.hasListener('painted')) {
                            fireItemTapFunc(extElement, index);
                        } else {
                            extElement.addListener('painted', fireItemTapFunc(extElement, index));
                        }
                    }

                }

            },

            setText: function (extElement, str) {

                setTextHelp(extElement, str);

            }
        }


    };

}();
