_cat.plugins.enyo = { },


_cat.plugins.enyo = function () {

    var _me = this;

    function _noValidMessgae(method) {
        return ["[cat enyo plugin] ", method, "call failed, no valid argument(s)"].join("");
    }

    function _genericAPI(extElement, name) {
        if (name) {
            if (!extElement) {
                _cat.core.log.info(_noValidMessgae("next"));
            }
            if (extElement[name]) {
                extElement[name]();
            } else {
                _cat.core.log.info("[cat enyo plugin] No valid method was found, '" + name + "'");
            }
        }
    }

    return {

        actions: {


            waterfall: function (extElement, eventName) {
                if (!extElement || !eventName) {
                    _cat.core.log.info(_noValidMessgae("waterfall"));
                }

                try {
                    extElement.waterfall('ontap', {dispatchTarget: {isDescendantOf: function(){}}});
                } catch(e) {
                    // ignore
                }
            },

            next: function (extElement) {
                _genericAPI(extElement, "next");
            }
        }


    };

}();
