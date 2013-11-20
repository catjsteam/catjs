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

            return "http://" + config.getIp() +  ":" +
                config.getPort() + "/assert?testName=" +
                testdata.getName() + "&message=" + testdata.getMessage() +
                "&status=" + testdata.getStatus() +
                "&type=" + config.getType() +
                "&hasPhantom="  + config.hasPhantom() +
                "&cache="+ (new Date()).toUTCString();

        }

    };


}();
