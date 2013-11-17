_cat.core.TestManager = function() {

    function _Data(config) {

        var me = this;

        // name, status, message
        this.config = {};


        (function() {
            var item;

            for (item in config) {
                if (config.hasOwnProperty(item)) {
                    me.config[item] = config[item];
                }
            }

        })();
    }

    _Data.prototype.get = function(key) {
        return this.config[key];
    };

    _Data.prototype.getMessage = function() {
        return this.get("message");
    };

    _Data.prototype.getStatus = function() {
        return this.get("status");
    };

    _Data.prototype.getName = function() {
        return this.get("name");
    };

    _Data.prototype.getDisplayName = function() {
        return this.get("displayName");
    };

    _Data.prototype.set = function(key, value) {
        return this.config[key] = value;
    };

    _Data.prototype.send = function() {
        function sendTestResult(name, status, message) {
            var xmlhttp = new XMLHttpRequest();

            xmlhttp.onreadystatechange = function () {
                if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
                    // _cat.core.log("completed\n" + xmlhttp.responseText);
                }
            };

            xmlhttp.onerror = function(e) {
                // _cat.core.log("[CAT CHAI] error occurred: ", e, "\n");
            };

            var config  = _cat.core.getConfig();

            var url = "http://" + config.ip +  ":" +
                config.port + "/assert?testName=" +
                name + "&message=" + message +
                "&status=" + status +
                "&type=" + config.type + "&cache="+ (new Date()).toUTCString();
            xmlhttp.open("GET", url, true);
            xmlhttp.send();
        }

    };

    var _testsData = [];


    return {

        addTestData: function(config) {
            var data = new _Data(config);
            _testsData.push(data);

            return data;

        },

        getLastTestData: function() {
            return (_testsData.length > 0 ? _testsData[_testsData.length-1] : undefined);
        },

        getTestCount: function() {
            return (_testsData ? _testsData.length : 0);
        },

        /**
         *
         * @param config
         *      host - The host address
         *      port - The port address
         *
         * @param testdata
         *      name - The test Name
         *      message - The test message
         *      status - The test status
         *
         * @returns {string} The assertion URL
         */
        generateAssertCall: function(config, testdata) {

            return "http://" + config.ip +  ":" +
                config.port + "/assert?testName=" +
                testdata.getName() + "&message=" + testdata.getMessage() +
                "&status=" + testdata.getStatus() +
                "&type=" + config.type + "&cache="+ (new Date()).toUTCString();

        }

    };


}();
