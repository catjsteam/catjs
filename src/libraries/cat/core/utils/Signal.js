_cat.utils.Signal = function () {

    var _funcmap = {       };

    return {

        register: function(arr) {
            if (arr) {
                arr.forEach(function(item) {
                    _funcmap[item.signal] = item.impl;
                });
            }
           
        },
        
        send: function (flag, opt) {

            if (flag && _funcmap[flag]) {
                _funcmap[flag].call(this, opt);
            }

        }

    };

}();