var animation = false;


_cat.plugins.dom = function () {

    function _fireEvent(name, elt) {

        var clickEvent;

        if (!elt || !name) {
            return undefined;
        }

        if(document.createEvent){

            clickEvent = document.createEvent("MouseEvents");
            clickEvent.initMouseEvent(name, true, true, window,
                0, 0, 0, 0, 0, false, false, false, 0, null);
            elt.dispatchEvent(clickEvent);

        } else {

            elt.fireEvent("on" + name);
        }
    }

    function _addEventListener(elem, event, fn) {
        if (!elem) {
            return undefined;
        }
        if (elem.addEventListener) {
            elem.addEventListener(event, fn, false);
        } else {
            elem.attachEvent("on" + event, function () {
                return(fn.call(elem, window.event));
            });
        }
    }

    function _getElement(idName) {

        var elt;

        if (!idName) {
            return undefined;
        }
        if (_cat.utils.Utils.getType(idName) === "String") {
            // try resolving by id
            elt = document.getElementById(idName);

        } else if (_cat.utils.Utils.getType(idName).indexOf("Element") !== -1) {
            // try getting the element
            elt = idName;
        }

        return (elt || idName);
    }

    return {

        actions: {


            listen: function (name, idName, callback) {

                var elt = _getElement(idName);

                if (elt) {
                    _addEventListener(elt, name, callback);
                }


            },

            fire: function (name, idName) {

                var elt = _getElement(idName);

                if (elt) {
                    _fireEvent(elt, name);
                }

            }


        }


    };

}();
