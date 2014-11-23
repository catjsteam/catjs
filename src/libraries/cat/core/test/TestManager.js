_cat.core.TestManager = function() {

    var _enum = {
        TYPE_TEST: "test",
        TYPE_SIGNAL: "signal",
        TEST_MANAGER: "tests",
        ALL: "all",
        TEST_MANAGER_OFFLINE: "offline"
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

    var _summaryInfo,
        _testsData = [],
        _counter = 0,
        _hasFailed = false,
        _globalTestData = {};


    return {
        
        init: function() {
            
            // register signals
            _cat.utils.Signal.register([
                {signal: "KILL", impl: _cat.core.TestAction.KILL},
                {signal: "TESTEND", impl: _cat.core.TestAction.TESTEND},
                {signal: "TESTSTART", impl: _cat.core.TestAction.TESTSTART}
            ]);

            // START test signal
            var config = _cat.core.getConfig();
            // TODO we need to set test start signal via an API
            if (config.getTests()) {
                _cat.core.ui.on();
                _cat.core.TestManager.send({signal:"TESTSTART"});
            }
        },

        enum: _enum,
        
        addTestData: function(config) {
            var data = new _Data(config),
                name;
            _testsData.push(data);
            
            name = data.get("name");
            if (config.success && (name !== "Start" && name !== "End")) {
                _counter++;
                
            } else {
                _hasFailed = true; 
            }

            return data;

        },

        isFailed: function() {
            return _hasFailed;
        },
        
        getLastTestData: function() {
            return (_testsData.length > 0 ? _testsData[_testsData.length-1] : undefined);
        },

        getTestCount: function() {
            var counter=0;
            
            _testsData.forEach(function(test) {
                var name;    
            
                if (test) {
                    name = test.get("name");
                    if (name !== "Start" && name !== "End") {
                        counter++;
                    }
                }
            });
            
            return counter;
        },

        getTestSucceededCount: function() {
            return _counter;
        },

        /**
         * Update the last total         ,delay
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
         * Send an action to the server
         * 
         * @param opt
         *  signal [KILL, TESTSTART, TESTEND]
         */
        send: function(opt) {
            var signal,
                config = _cat.core.getConfig(), reportFormats,
                options;               
            
            opt = (opt || {});
            signal = opt.signal;
            
            if (config.isReport()) {
                reportFormats = config.getReportFormats();
                options = {reportFormats: reportFormats};
            }
            if ("error" in opt) {
                options.error = opt.error;
            }
            _cat.utils.Signal.send(signal, options);
        },       

        setSummaryInfo: function(info) {
            _summaryInfo = info;  
        },
        
        getSummaryInfo: function(info) {
            return _summaryInfo;  
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

            return _cat.utils.Request.generate({
                service: "assert",
                cache:true,
                params: {
                    testName: testdata.getName(),
                    name: testdata.getName(),
                    type: testdata.getType(),
                    scenario: _cat.utils.Storage.get(storageEnum.CURRENT_SCENARIO, storageEnum.SESSION),
                    message: testdata.getMessage(),
                    error: testdata.getError(),
                    status: testdata.getStatus(),
                    reports:(reports ? reports.join(",") : ""),
                    hasPhantom:  + config.hasPhantom(),
                    id: _cat.core.guid()
                }                    
            });
        }            
    };


}();
