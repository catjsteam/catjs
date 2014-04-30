_cat.core.TestManager = function() {

    var _enum = {
        TYPE_TEST: "test",
        TYPE_SIGNAL: "signal"
    };


    // Test Manager data class
    function _Data(config) {

        var me = this;

        // name, status, message
        this.config = {};


        (function() {
            var item;

            // defaults \ validation
            if (!("type" in config) || (("type" in config) && config.type === undefined)) {
                config.type = _enum.TYPE_TEST;
            }

            // configuration settings
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

    _Data.prototype.getError = function() {
        return this.get("error");
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

    _Data.prototype.getType = function() {
        return this.get("type");
    };

    _Data.prototype.getReportFormats = function() {
        return this.get("reportFormats");
    };

    _Data.prototype.set = function(key, value) {
        return this.config[key] = value;
    };

    _Data.prototype.send = function() {


    };

    var _testsData = [],
        _counter = 0,
        _globalTestData = {};


    return {

        addTestData: function(config) {
            var data = new _Data(config);
            _testsData.push(data);
            if (config.success) {
                _counter++;
            }

            return data;

        },

        getLastTestData: function() {
            return (_testsData.length > 0 ? _testsData[_testsData.length-1] : undefined);
        },

        getTestCount: function() {
            return (_testsData ? _testsData.length : 0);
        },

        getTestSucceededCount: function() {
            return _counter;
        },

        /**
         * Update the last total delay
         *
         * @param delay
         */
        updateDelay: function(delay) {
            _globalTestData.delay = delay;
        },

        /**
         * Get the total delay between tests calls
         *
         */
        getDelay: function() {
            return (_globalTestData.delay || 0);
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

            var reports = testdata.getReportFormats(),
                storageEnum = _cat.utils.Storage.enum;

            return "http://" + config.getIp() +  ":" +
                config.getPort() + "/assert?" +
                "testName=" + testdata.getName() +
                "&scenario=" + _cat.utils.Storage.get(storageEnum.CURRENT_SCENARIO, storageEnum.SESSION) +
                "&message=" + testdata.getMessage() +
                "&error=" + testdata.getError() +
                "&status=" + testdata.getStatus() +
                "&reports=" + (reports ? reports.join(",") : "") +
                "&name=" + config.getName() +
                "&type=" + testdata.getType() +
                "&hasPhantom="  + config.hasPhantom() +
                "&id="  + _cat.core.guid() +
                "&cache="+ (new Date()).toUTCString();

        }

    };


}();
