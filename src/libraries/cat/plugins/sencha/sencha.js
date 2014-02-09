_cat.plugins.sencha = function () {
    var getItemById = function(idName) {
        return Ext.ComponentQuery.query('#' + idName)[0];

    };

    var fireItemTapFunc = function (extElement, index) {
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

    return {

        actions: {


            fireTap: function (extElement) {
                // check number of args
                if (arguments.length === 1) {

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

            },

            setTextValue: function (extElement, str) {
                var element = getItemById(extElement);
                element.setValue(str);
            },


            tapButton : function (btn) {

                var button = getItemById(btn);
                var buttonHandler = button.getHandler();
                button.fireAction("tap", buttonHandler());
            },

            setChecked : function (checkItem) {

                var checkbox = getItemById(checkItem);
                checkbox.setChecked(true);
            },

            setUnchecked : function (checkItem) {

                var checkbox = getItemById(checkItem);
                checkbox.setChecked(false);
            },

            setSliderValue : function (sliderId, value) {

                var slider = getItemById(sliderId);
                slider.setValue(value);
            },

            setSliderValues : function (sliderId, value1, value2) {

                var slider = getItemById(sliderId);
                slider.setValues([value1, value2]);
            },

            setToggle : function (toggleId, value) {

                var toggle = getItemById(toggleId);
                if (value) {
                    toggle.setValues(true);
                } else {
                    toggle.setValues(false);
                }

            },

            changeTab : function (barId, value) {

                var bar = getItemById(barId);
                bar.setActiveItem(value);
            },

            scrollBy : function (itemId, value) {

                var item = getItemById(itemId);
                item.getScrollable().getScroller().scrollTo(0,value);

            },

            setDate : function (dateItemId, year, month, day) {

                var dateItem = getItemById(dateItemId);
                dateItem.setValue(new Date(year, month - 1, day));
            }
        }


    };

}();
