_cat.utils.Signal = function() {

    var _funcmap = {

        kill: function() {

            // close CAT UI
            _cat.core.ui.off();

            // Additional code in here
        }
    }

    return {

        signal: function(flag) {

            if (flag && _funcmap[flag]) {
                _funcmap[flag].call(this);
            }

        }

    }

}();