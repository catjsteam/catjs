_cat.plugins.enyo = function () {

    var _me;

    function _noValidMessgae(method) {
        return ["[cat enyo plugin] ", method, "call failed, no valid argument(s)"].join("");
    }

    function _genericAPI(element, name) {
        if (name) {
            if (!element) {
                _cat.core.log.info("[catjs enyo plugin]", _noValidMessgae("next"));
            }
            if (element[name]) {
                element[name]();
            } else {
                _cat.core.log.info("[catjs enyo plugin] No valid method was found, '" + name + "'");
            }
        }
    }

    _me = {

        actions: {


            waterfall: function (element, eventName) {
                if (!element || !eventName) {
                    _cat.core.log.info("[catjs enyo plugin]", _noValidMessgae("waterfall"));
                }

                try {
                    element.waterfall('ontap');
                } catch (e) {
                    // ignore
                }
            },

            setSelected: function (element, name, idx, eventname) {
                eventname = (eventname || "ontap");
                if (element) {
                    _me.actions.waterfall(element.parent, eventname);
                    if (name && (idx !== undefined)) {
                        setTimeout(function () {
                            element.setSelected(element.$[name + '_' + idx]);
                        }, 600);
                    }
                    setTimeout(function () {
                        element.$[name + '_' + idx].waterfall(eventname);
                    }, 900);
                }
            },

            next: function (element) {
                _genericAPI(element, "next");
            }
        }

    };

    return _me;
}();
