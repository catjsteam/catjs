_cat.utils.Signal = function() {

    var _funcmap = {

        TESTEND: function() {

            setTimeout(function() {
                var testCount = _cat.core.TestManager.getTestCount();
                _cat.core.ui.setContent({
                    header: [testCount, "Tests complete"].join(" "),
                    desc: "",
                    tips: "",
                    style: "color:green"
                });

            }, 2000);


        },
        KILL: function() {

            // close CAT UI
            _cat.core.ui.off();

            // Additional code in here
        }
    }

    return {

        send: function(flag) {

            if (flag && _funcmap[flag]) {
                _funcmap[flag].call(this);
            }

        }

    }

}();