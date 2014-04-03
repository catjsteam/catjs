var _cat = {
    utils: {},
    plugins: {},
    ui: {}
};

var hasPhantomjs = false;

_cat.core = function () {

    var scrapsNameList = [];
    var scrapsPerformList = [];
    var scrapsPkgNames = [];

    var managerScraps = [];
    var testNumber = 0;
    var addScrapToManager = function(testsInfo, scrap) {

        for (var i = 0; i < testsInfo.length; i++) {
            testNumber--;
            var test = testsInfo[i];


            var testRepeats = parseInt((test.repeat ? test.repeat : 1));
            test.repeat = "repeat(" + testRepeats + ")";

            var preformVal = "@@" + scrap.name[0] + " " + testRepeats;
            var pkgNameVal = scrap.pkgName + "$$cat";
            managerScraps[test.index] = {"preform" : preformVal,
                "pkgName" : pkgNameVal,
                "repeat" : testRepeats,
                "name" : scrap.name[0],
                "scrap" : scrap};
        }

    };

    var getScrapTestInfo = function(tests, scrapName) {
        var scrapTests = [];
        for (var i = 0; i < tests.length; i++) {
            if (tests[i].name === scrapName) {
                var tempInfo = {"name" : tests[i].name,
                    "wasRun" : tests[i].wasRun,
                    "repeat" : tests[i].repeat};
                tempInfo.index = i;
                scrapTests.push(tempInfo);
            }
        }
        return scrapTests;
    };



    var _vars = {},
        _managers = {},
        _context = function () {

            var _scraps = {};

            function _Scrap(config) {

                var me = this;

                (function () {
                    var key;

                    for (key in config) {
                        me[key] = config[key];
                    }
                })();
            }

            _Scrap.prototype.get = function (key) {
                return this[key];
            };

            _Scrap.prototype.getArg = function (key) {
                if (this.scrap && this.scrap.arguments) {
                    return this.arguments[this.scrap.arguments[key]];
                }
            };


            return {

                get: function (pkgName) {
                    if (!pkgName) {
                        return undefined;
                    }
                    return _scraps[pkgName];
                },

                "$$put": function (config, pkgName) {
                    if (!pkgName) {
                        return pkgName;
                    }
                    _scraps[pkgName] = new _Scrap(config);
                }
            };

        }(),
        _config,
        _log = console;

    (function () {
        if (!String.prototype.trim) {
            String.prototype.trim = function () {
                return this.replace(/^\s+|\s+$/g, '');
            };
        }
    })();

    function Config() {
        var innerConfig,
            xmlhttp,
            configText;


        var getTestsHelper = function (testList) {

            var innerConfigMap = [];
            if (testList.tests) {
                for (var i = 0; i < testList.tests.length; i++) {
                    if (testList.tests[i].tests) {
                        var repeatFlow =  testList.tests[i].repeat ? testList.tests[i].repeat : 1;

                        for (var j = 0; j < repeatFlow; j++ ) {
                            var tempArr = getTestsHelper(testList.tests[i]);
                            innerConfigMap = innerConfigMap.concat(tempArr);
                        }

                    } else {
                        testList.tests[i].wasRun = false;
                        innerConfigMap.push(testList.tests[i]);
                    }
                }
            }
            return innerConfigMap;
        };


        try {
            xmlhttp = _cat.utils.AJAX.sendRequestSync({
                url: "/cat.json"
            });
            if (xmlhttp) {
                configText = xmlhttp.responseText;
                if (configText) {
                    innerConfig = JSON.parse(configText);
                }
            }
        }
        catch (err) {
            //todo: log error
        }

        if (innerConfig) {
            this.getType = function () {
                return innerConfig.type;
            };
            this.getIp = function () {
                if (innerConfig.ip) {
                    return innerConfig.ip;
                } else {
                    return  document.location.hostname;
                }
            };
            this.getPort = function () {
                if (innerConfig.port) {
                    return innerConfig.port;
                } else {
                    return  document.location.port;
                }
            };


            this.getTests = function () {
                return getTestsHelper(innerConfig);

            };



            this.getRunMode = function () {
                return innerConfig["run-mode"];
            };

        }

        this.hasPhantom = function () {
            return hasPhantomjs;
        };

        this.available = function () {
            return (innerConfig ? true : false);
        };
    }

    return {

        log: _log,

        setManager: function (managerKey, pkgName) {
            if (!_managers[managerKey]) {
                _managers[managerKey] = {};
                _managers[managerKey].calls = [];
                _managers[managerKey].behaviors = {};
                _managers[managerKey].scrapsOrder = [];
            }
            _managers[managerKey].calls.push(pkgName);
        },

        setManagerBehavior: function (managerKey, key, value) {
            var item = _managers[managerKey].behaviors;

            if (item) {
                if (!item[key.trim()]) {
                    item[key.trim()] = [];
                }
                item[key.trim()].push(value);
            }
            _managers[managerKey].scrapsOrder.push(key.trim());
        },

        getManager: function (managerKey) {
            return _managers[managerKey.trim()];
        },

        managerCall: function (managerKey, callback) {
            var manager = _cat.core.getManager(managerKey),
                scrapref, scrapname, behaviors = [], actionItems = {},
                matchvalue = {}, matchvalues = [],
                totalDelay = 0;

            /**
             * Scrap call by its manager according to its behaviors
             *
             * @param config
             *      implKey, repeat, delay
             * @private
             */
            function __call(config) {
                totalDelay = 0;
                var delay = (config.delay || 2000),
                    repeat = (config.repeat || 1),
                    idx = 0,
                    func = function () {
                        var funcvar = (config.implKey ? _cat.core.getDefineImpl(config.implKey) : undefined);

                        if (funcvar && funcvar.call) {
                            funcvar.call(this);
                            config.callback.call(config);
                        }
                    };

                for (idx = 0; idx < repeat; idx++) {
                    totalDelay += delay * (idx + 1);
                    _cat.core.TestManager.updateDelay(totalDelay);
                    setTimeout(func, totalDelay);
                }

            }

            function __callMatchValues(callsIdx, callback) {
                if (matchvalues[callsIdx]) {
                    matchvalues[callsIdx].callback = function () {
                        callbackCounter++;
                        callsIdx++;
                        if (callsIdx < matchvalues.length + 1) {
                            __callMatchValues(callsIdx, callback);
                        }

                        if (callbackCounter === matchvalues.length + 1) {
                            if (callback) {
                                callback.call(this);
                            }
                        }
                    };

                    __call(matchvalues[callsIdx]);
                }
            }

            if (manager) {
                // old
                var matchValuesCalls = [];
                // Call for each Scrap assigned to this Manager
                manager.calls.forEach(function (item) {
                    var strippedItem;

                    matchvalue = {};

                    if (item) {

                        scrapref = _cat.core.getVar(item);
                        if (scrapref) {
                            scrapref = scrapref.scrap;
                            scrapname = scrapref.name[0];
                            if (scrapname) {
                                behaviors = manager.behaviors[scrapname];
                                if (behaviors) {
                                    // Go over all of the manager behaviors (e.g. repeat, delay)
                                    behaviors.forEach(function (bitem) {
                                        var behaviorsAPI = ["repeat", "delay"],
                                            behaviorPattern = "[\\(](.*)[\\)]"; //e.g. "repeat[\(](.*)[/)]"
                                        if (bitem) {
                                            // go over the APIs, looking for match (e.g. repeat, delay)
                                            behaviorsAPI.forEach(function (bapiitem) {
                                                if (bapiitem && !matchvalue[bapiitem]) {
                                                    matchvalue[bapiitem] = _cat.utils.Utils.getMatchValue((bapiitem + behaviorPattern), bitem);
                                                }
                                            });
                                        }
                                    });
                                }
                            }
                        }

//                        setTimeout(function() {
//                            (_cat.core.getDefineImpl(item)).call(this);
//                        }, 2000);
                        //__call(matchvalue);
                        matchvalue.implKey = item;
                        matchValuesCalls.push(matchvalue);
                    }
                });

                // new
                matchvalues = [];
                // set the scrap orders by the order of behaviors
                var managerBehaviors = manager.behaviors;

                manager.scrapsOrder.forEach(function (scrapName) {
                    matchvalue = {};
                    var packageName = "";
                    for (var i = 0; i < matchValuesCalls.length; i++) {
                        if (matchValuesCalls[i].implKey.indexOf((scrapName + "$$cat"), matchValuesCalls[i].implKey.length - (scrapName + "$$cat").length) !== -1) {
                            matchvalue = matchValuesCalls[i];
                            break;
                        }
                    }

                    matchvalues.push(matchvalue);
                });

//                matchvalues.forEach(function(matchItem) {
//                    if (matchItem) {
//                        // TODO Make the calls Sync
//                        __call(matchItem);
//                    }
//                });
                var callsIdx = 0,
                    callbackCounter = 0;
                __callMatchValues(callsIdx, callback);
            }

        },

        plugin: function (key) {
            var plugins;
            if (key) {
                plugins = _cat.plugins;
                if (plugins[key]) {
                    return plugins[key];
                }
            }
        },

        declare: function (key, value) {
            if (key === "scrap") {
                if (value && value.id) {
                    _vars[value.id()] = value;
                }
            }
            _vars[key] = value;
        },

        getVar: function (key) {
            return _vars[key];
        },

        varSearch: function (key) {
            var item, pos,
                results = [];

            for (item in _vars) {
                pos = item.indexOf(key);

                if (item === key) {
                    results.push(_vars[key]);

                } else if (pos !== -1) {
                    results.push(_vars[item]);
                }
            }
            return results;
        },

        define: function (key, func) {
            _cat[key] = func;
        },

        defineImpl: function (key, func) {
            _cat[key + "$$cat$$impl"] = func;
        },

        getDefineImpl: function (item) {
            return _cat[item + "$$impl"];
        },

        action: function (thiz, config) {
            var scrap = config.scrap,
                runat, manager,
                pkgname, args = arguments,
                catConfig = _cat.core.getConfig(),

                tests = catConfig ? catConfig.getTests() : [];



            if ((catConfig) && (catConfig.getRunMode() === 'test-manager')) {
                // check if the test name is in the cat.json
                var scrapsTestsInfo = getScrapTestInfo(tests, scrap.name[0]);


                pkgname = scrap.pkgName;
                _cat.core.defineImpl(pkgname, function () {
                    _cat.core.actionimpl.apply(this, args);
                });

                if (scrapsTestsInfo.length !== 0) {

                    // init managerScraps
                    if (managerScraps.length === 0) {
                        testNumber = tests.length;
                        managerScraps = new Array(tests.length);
                    }

                    addScrapToManager(scrapsTestsInfo, scrap);

                    if (testNumber === 0) {
                        var managerScrap = managerScraps[managerScraps.length - 1];

                        managerScrap.scrap.catui = ["on"];
                        managerScrap.scrap.manager = ["true"];



                        pkgname = managerScrap.scrap.pkgName;
                        if (!pkgname) {
                            _cat.core.log.error("[CAT action] Scrap's Package name is not valid");
                        } else {


                            for (var i = 0; i < managerScraps.length; i++) {
                                var tempScrap = managerScraps[i];
                                _cat.core.setManager(managerScrap.scrap.name[0], tempScrap.pkgName);
                                // set number of repeats for scrap
                                for (var j = 0; j < tempScrap.repeat; j++) {
                                    _cat.core.setManagerBehavior(managerScrap.scrap.name[0], tempScrap.scrap.name[0], tempScrap.repeat);
                                }
                            }


                            /*  CAT UI call  */
                            _cat.core.ui.on();

                            /*  Manager call  */
                            (function() {
                                _cat.core.managerCall(managerScrap.scrap.name[0], function() {
                                    _cat.utils.Signal.send('TESTEND');
                                });
                            })();


                        }
                    }

                }
            } else {

                if (typeof catConfig === 'undefined' || catConfig.getRunMode() === 'all') {
                    runat = (("run@" in scrap) ? scrap["run@"][0] : undefined);
                    if (runat) {
                        manager = _cat.core.getManager(runat);
                        if (manager) {
                            pkgname = scrap.pkgName;
                            if (!pkgname) {
                                _cat.core.log.error("[CAT action] Scrap's Package name is not valid");
                            } else {
                                _cat.core.defineImpl(pkgname, function () {
                                    _cat.core.actionimpl.apply(this, args);
                                });
                            }

                        }
                    } else {
                        _cat.core.actionimpl.apply(this, arguments);
                    }
                } else {
                    _cat.core.log.info("[CAT action] " + scrap.name[0] + " was not run as it does not appears in testManager");
                }
            }


        },

        getConfig: function () {
            _config = new Config();
            return (_config.available() ? _config : undefined);
        },


        /**
         * CAT core definition, used when injecting cat call
         *
         * @param config
         */
        actionimpl: function (thiz, config) {
            var scrap = config.scrap,
                catInternalObj,
                catObj,
                passedArguments,
                idx = 0, size = arguments.length,
                pkgName;

            if (scrap) {
                if (scrap.pkgName) {


                    // collect arguments
                    if (arguments.length > 2) {
                        passedArguments = [];
                        for (idx = 2; idx < size; idx++) {
                            passedArguments.push(arguments[idx]);
                        }
                    }

                    // call cat user functionality
                    catInternalObj = _cat[scrap.pkgName];
                    if (catInternalObj && catInternalObj.init) {
                        _context["$$put"]({
                            scrap: scrap,
                            arguments: passedArguments

                        }, scrap.pkgName);
                        catInternalObj.init.call(_context.get(scrap.pkgName), _context);
                    }

                    // cat internal code
                    pkgName = [scrap.pkgName, "$$cat"].join("");
                    catObj = _cat[pkgName];
                    if (catObj) {
                        _context["$$put"]({
                            scrap: scrap,
                            arguments: passedArguments

                        }, pkgName);
                        catObj.apply(_context, passedArguments);
                    }
                }
                console.log("Scrap call: ", config, " scrap: " + scrap.name + " this:" + thiz);
            }

        }

    };

}();

if (typeof exports === "object") {
    module.exports = _cat;
}
_cat.utils.chai = function () {

    var _chai,
        assert,
        _state = 0; // state [0/1] 0 - not evaluated / 1 - evaluated

    function _isSupported() {
        _state = 1;
        if (typeof chai !== "undefined") {
            _chai = chai;
            assert = _chai.assert;

        } else {
            _cat.core.log.info("Chai library is not supported, skipping annotation 'assert', consider adding it to the .catproject dependencies");
        }
    }


    function _sendTestResult(data) {

        var config  = _cat.core.getConfig();

        if (config) {
            _cat.utils.AJAX.sendRequestSync({
                url:  _cat.core.TestManager.generateAssertCall(config, data)
            });
        }
    }

    function _splitCapilalise(string) {
        if (!string) {
            return string;
        }

        return string.split(/(?=[A-Z])/);
    }

    function _capitalise(string) {
        if (!string) {
            return string;
        }
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    function _getDisplayName(name) {
        var result = [];

        if (name) {
            name = _splitCapilalise(name);
            if (name) {
                name.forEach(function(item) {
                    result.push(_capitalise(item));
                });
            }
        }
        return result.join(" ");
    }

    return {

        assert: function (config) {

            if (!_state) {
                _isSupported();
            }

            var code,
                result,
                fail,
                failure,
                testdata,
                scrap = config.scrap.config,
                scrapName = (scrap.name ? scrap.name[0] : undefined),
                testName = (scrapName || "NA"),
                key, item, items=[], args=[];

            if (_chai) {
                if (config) {
                    code = config.code;
                    fail = config.fail;
                }
                if (assert) {
                    // TODO well, I have to code the parsing section (uglifyjs) for getting a better impl in here (loosing the eval shit)
                    // TODO js execusion will be replacing this code later on...
                    var success = true;
                    var output;
                    if (code) {
                        try {
                            //eval(code);
                            args.push("assert");
                            items.push(assert);
                            for (key in config.args) {
                                if (config.args.hasOwnProperty(key)) {
                                    args.push(key);
                                    items.push(config.args[key]);
                                }
                            }
                            result = new Function(args, "return " + code).apply(this, items);

                        } catch (e) {
                            success = false;
                            output = ["[CAT] Test failed, exception: ", e].join("");
                        }
                    }

                    if (success) {

                        output = "Test Passed";

                    }

                    testdata = _cat.core.TestManager.addTestData({
                        name: testName,
                        displayName: _getDisplayName(testName),
                        status: success ? "success" : "failure",
                        message: output,
                        success: success
                    });

                    _cat.core.ui.setContent({
                        style: ( (testdata.getStatus() === "success") ? "color:green" : "color:red" ),
                        header: testdata.getDisplayName(),
                        desc: testdata.getMessage(),
                        tips: _cat.core.TestManager.getTestSucceededCount()
                    });

                    _sendTestResult(testdata);

                    if (!success) {
                        throw new Error((output || "[CAT] Hmmm... It's an error alright, can't find any additional information"), (fail || ""));
                    }
                }
            }
        },

        /**
         * For the testing environment, set chai handle
         *
         * @param chai
         */
        test: function (chaiarg) {
            chai = chaiarg;
        }

    };

}();
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

_cat.core.TestsDB = function() {


    function _TestsDB() {

        this._DB = undefined;
        var me = this;

        _cat.utils.AJAX.sendRequestAsync({url : "tests_db.json", callback : {call : function(check) {
            me._DB = JSON.parse(check.response);
        }}});

        this.getDB = function() { return this._DB; };

        var getProp = function (propString, obj) {
            var current = obj;
            var split = propString.split('.');

            for (var i = 0; i < split.length; i++) {
                if (current.hasOwnProperty(split[i])) {
                    current = current[split[i]];
                }
            }

            return current;
        };

        var setProp = function (propString, value, obj) {
            var current = obj;
            var split = propString.split('.');

            for (var i = 0; i < split.length - 1; i++) {
                if (current.hasOwnProperty(split[i])) {
                    current = current[split[i]];
                }
            }

            current[split[split.length - 1]] = value;
            return current[split[split.length - 1]];
        };

        this.get = function(field) { return getProp(field, this._DB); };
        this.set = function(field, value) { return setProp(field, value, this._DB); };


    }

    var TestDB;

    return {

        init : function() {
            TestDB = new _TestsDB();
            return TestDB;
        },

        getDB : function() {
            return TestDB.getDB();
        },

        get : function(field) {
            return TestDB.get(field);
        },

        set : function(field, value) {
            return TestDB.set(field, value);
        }


    };


}();



























function TestDB (){

    var testDBJson;
    try
    {
        if (XMLHttpRequest && !testDBJson) {
            var xmlhttp =  new XMLHttpRequest();
            xmlhttp.open("GET", "tests_db.json", false);
            xmlhttp.send();
            var dbText = xmlhttp.responseText;
            testDBJson = JSON.parse(dbText);
        }
    }
    catch(err)
    {
        //todo: log error
    }


    var getProp = function (propString) {
        var current = testDBJson;
        var split = propString.split('.');

        for (var i = 0; i < split.length; i++) {
            if (current.hasOwnProperty(split[i])) {
                current = current[split[i]];
            }
        }

        return current;
    };

    var setProp = function (propString, value) {
        var current = testDBJson;
        var split = propString.split('.');

        for (var i = 0; i < split.length - 1; i++) {
            if (current.hasOwnProperty(split[i])) {
                current = current[split[i]];
            }
        }

        current[split[split.length - 1]] = value;
        return current[split[split.length - 1]];
    };




    this.getDB = function() { return testDBJson; };
    this.get = function(feild) { return getProp(feild); };
    this.set = function(feild, value) { return setProp(feild, value); };

    this.hasPhantom = function (){
        return typeof phantom !== 'undefined';
    };
}
_cat.core.ui = function () {

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

    function _create() {
        var catElement;
        if (typeof document !== "undefined") {
            catElement = document.createElement("DIV");

            catElement.id = "__catelement";
            catElement.style.width = "200px";
            catElement.style.height = "200px";
            catElement.style.position = "fixed";
            catElement.style.bottom = "10px";
            catElement.style.zIndex = "10000000";
            catElement.style.display = "none";
            catElement.innerHTML =

                '<div id="cat-status" class="cat-dynamic cat-status-open">' +
                    '<div id=loading></div>' +
                    '<div id="catlogo" ></div>' +
                    '<div id="catHeader">CAT Tests<span id="catheadermask">click to mask on/off</span></div>' +
                    '<div class="text-tips"></div>' +
                    '<div id="cat-status-content">' +
                    '<ul id="testList"></ul>' +
                    '</div>' +
                    '</div>' +
                    '<div id="catmask" class="fadeMe"></div>';

            if (document.body) {
                document.body.appendChild(catElement);
            }
        }
    }

    function _getCATElt() {
        var catElement;
        if (typeof document !== "undefined") {
            return document.getElementById("__catelement");
        }
        return undefined;
    }

    function _getCATStatusElt() {

        var catStatusElt,
            catElement = _getCATElt();
        if (catElement) {
            catStatusElt = (catElement.childNodes[0] ? catElement.childNodes[0] : undefined);
        }

        return catStatusElt;
    }

    function _getCATStatusContentElt() {

        var catStatusElt,
            catElement = _getCATElt(),
            catStatusContentElt;
        if (catElement) {
            catStatusElt = _getCATStatusElt();
            if (catStatusElt) {
                catStatusContentElt = catStatusElt.childNodes[3];
            }
        }

        return catStatusContentElt;
    }

    function _resetContent() {
        _me.setContent({
            header: "",
            desc: "",
            tips: "",
            reset: true
        });
    }

    var testNumber = 0,
        logoopacity = 0.5,
        masktipopacity = 1;

    var _me =  {

        /**
         * Display the CAT widget (if not created it will be created first)
         *
         */
        on: function () {

            var catElement = _getCATElt();
            if (typeof document !== "undefined") {

                if (catElement) {
                    catElement.style.display = "";
                } else {
                    _create();
                    catElement = _getCATElt();
                    if (catElement) {
                        _me.toggle();
                        catElement.style.display = "";
                    }
                }

                // set logo listener
                var logoelt = document.getElementById("catlogo"),
                    catmask = document.getElementById("catmask"),
                    listener = function() {
                        var catmask = document.getElementById("catmask");
                        if (catmask) {
                            catmask.classList.toggle("fadeMe");
                        }
                    };

                if (logoelt && catmask && catmask.classList) {
                    _addEventListener(logoelt, "click", listener);
                }

                setInterval(function() {
                    var logoelt = document.getElementById("catlogo"),
                        catheadermask = document.getElementById("catheadermask");

                    if (logoopacity === 1) {
                        logoopacity = 0.5;
                        setTimeout(function() {
                            masktipopacity = 0;
                        }, 2000);

                    } else {
                        logoopacity = 1;
                    }
                    if (logoelt) {
                        catheadermask.style.opacity = masktipopacity+"";
                        logoelt.style.opacity = logoopacity+"";
                    }
                }, 2000);

            }

        },

        /**
         * Hide the CAT status widget
         *
         */
        off: function () {

            var catElement = _getCATElt();
            if (catElement) {
                _resetContent();
                catElement.style.display = "none";
            }

        },

        /**
         * Destroy the CAT status widget
         *
         */
        destroy: function () {
            var catElement = _getCATElt();
            if (catElement) {
                if (catElement.parentNode) {
                    catElement.parentNode.removeChild(catElement);
                }
            }
        },

        /**
         * Toggle the content display of CAT status widget
         *
         */
        toggle: function () {
            var catElement = _getCATElt(),
                catStatusElt = _getCATStatusElt(),
                catStatusContentElt = _getCATStatusContentElt();

            if (catElement) {
                catStatusElt = _getCATStatusElt();
                if (catStatusElt) {
                    _resetContent();

                    catStatusElt.classList.toggle("cat-status-close");

                    if (catStatusContentElt) {
                        catStatusContentElt.classList.toggle("displayoff");
                    }
                }
            }


        },

        isOpen: function() {
            var catElement = _getCATElt(),
                catStatusElt = _getCATStatusElt(),
                catStatusContentElt = _getCATStatusContentElt();

            if (catElement) {
                catStatusElt = _getCATStatusElt();
                if (catStatusElt) {

                    if (catStatusElt.classList.contains("cat-status-close")) {
                        return false;
                    }
                }
            }

            return true;
        },

        isContent: function() {

            function _isText(elt) {
                if ( elt &&  elt.innerText && ((elt.innerText).trim()) ) {
                    return true;
                }
                return false;
            }

            var catStatusContentElt = _getCATStatusContentElt(),
                bool = 0;

            bool  += (_isText(catStatusContentElt.childNodes[1]) ? 1 : 0);

            if (bool === 1) {
                return true;
            }

            return false;
        },


        markedElement : function(elementId ) {
            var element = document.getElementById(elementId);
            element.className = element.className + " markedElement";
        },

        /**
         *  Set the displayable content for CAT status widget
         *
         * @param config
         *      header - The header content
         *      desc - The description content
         *      tips - The tips text (mostly for the test-cases counter)
         */
        setContent: function (config) {

            var catStatusContentElt,
                catElement = _getCATElt(),
                isOpen = false,
                reset = ("reset" in config ? config.reset : false);



            function _setText(elt, text, style) {

                var styleAttrs = (style ? style.split(";") : []);

                if (elt) {
                    styleAttrs.forEach(function (item) {
                        var value = (item ? item.split(":") : undefined);
                        if (value) {
                            elt.style[value[0]] = value[1];
                        }
                    });

                    elt.textContent = text;
                }
            }

            if (catElement) {
                catStatusContentElt = _getCATStatusContentElt();
                if (catStatusContentElt) {
                    if (config) {
                        isOpen = _me.isOpen();

                        if ("header" in config && config.header) {
                            _me.on();
                            if (!isOpen && !reset) {
                                _me.toggle();
                            }
                        } else {
                            if (!reset && isOpen) {
                                setTimeout(function () {
                                    _me.toggle();
                                }, 300);
                            }
                        }
                        var innerListElement =

                                '<div class="text-top"><span style="color:green"></span></div>' +
                                '<div class="text"></div>';

                        if (config.header || config.desc || config.tips) {
                            var ul = document.getElementById("testList");
                            var newLI = document.createElement("LI");
                            ul.insertBefore(newLI, ul.children[0]);
                            newLI.innerHTML = innerListElement;

                            var textTips =  document.getElementsByClassName("text-tips")[0];

                            setTimeout(function() {

                                // add element to ui test list
                                if ("header" in config) {
                                    _setText(newLI.childNodes[0]  , config.header, config.style);
                                }
                                if ("desc" in config) {
                                    _setText(newLI.childNodes[1], config.desc, config.style);
                                }

                                if ("tips" in config) {
                                    if (config.tips) {
                                        testNumber  = config.tips;
                                        _setText(textTips, "Number of test passed : " + testNumber, config.style);
                                    } else {
                                        _setText(textTips, "Number of test passed : " + testNumber, "color : green");
                                    }

                                }

                                if ("elementType" in config) {
                                    newLI.className = newLI.className + " " + config.elementType;

                                } else {
                                    newLI.className = newLI.className + " listImageInfo";
                                }

                            }, 300);
                        }

                    }
                }
            }
        }

    };

    return _me;

}();
_cat.utils.AJAX = function () {

    function _validate() {
        if (typeof XMLHttpRequest !== "undefined") {
            return true;
        }
        return false;
    }

    if (!_validate()) {
        console.log("[CAT AJAX] Not valid AJAX handle was found");
        return {};
    }

    return {

        /**
         * TODO pass arguments on post
         *
         * @param config
         *      url - The url to send
         *      method - The request method
         *      args - TODO
         */
        sendRequestSync: function (config) {

            var xmlhttp = new XMLHttpRequest();

            _cat.core.log.info("Sending REST request: " + config.url);

            try {
                xmlhttp.open(("GET" || config.method), config.url, false);
                // TODO pass arguments on post
                xmlhttp.send();

            } catch (err) {
                _cat.core.log.warn("[CAT CHAI] error occurred: ", err, "\n");

            }

            return xmlhttp;

        },

        /**
         * TODO Not tested.. need to be checked
         * TODO pass arguments on post
         *
         * @param config
         *      url - The url to send
         *      method - The request method
         *      args - TODO
         *      onerror - [optional] error listener
         *      onreadystatechange - [optional] ready listener
         *      callback - [optional] instead of using onreadystatechange this callback will occur when the call is ready
         */
        sendRequestAsync: function(config) {

            var xmlhttp = new XMLHttpRequest(),
                onerror = function (e) {
                    _cat.core.log("[CAT CHAI] error occurred: ", e, "\n");
                },
                onreadystatechange = function () {
                    if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
                        // _cat.core.log("completed\n" + xmlhttp.responseText);
                        if ("callback" in config && config.callback) {
                            config.callback.call(xmlhttp);
                        }
                    }
                };


            xmlhttp.onreadystatechange = (("onreadystatechange" in config) ? config.onreadystatechange : onreadystatechange);
            xmlhttp.onerror = (("onerror" in config) ? config.onerror : onerror);

            xmlhttp.open(("GET" || config.method), config.url, true);

            // TODO pass arguments on post
            xmlhttp.send();
        }

    };

}();
_cat.utils.Signal = function () {

    var _funcmap = {

        TESTEND: function (opt) {

            var timeout = _cat.core.TestManager.getDelay();

            if (opt) {
                timeout = (opt["timeout"] || 2000);
            }

            setTimeout(function () {
                var testCount = _cat.core.TestManager.getTestCount();
                _cat.core.ui.setContent({
                    header: [testCount-1, "Tests complete"].join(" "),
                    desc: "",
                    tips: "",
                    style: "color:green"
                });

            }, (timeout));


            var config = _cat.core.getConfig();

            var testdata = _cat.core.TestManager.addTestData({
                name: "End",
                displayName: "End",
                status: "End",
                message: "End"
            });

            if (config) {
                _cat.utils.AJAX.sendRequestSync({
                    url: _cat.core.TestManager.generateAssertCall(config, testdata)
                });
            }


        },
        KILL: function () {

            // close CAT UI
            _cat.core.ui.off();

            // Additional code in here
        }
    };

    return {

        send: function (flag, opt) {

            if (flag && _funcmap[flag]) {
                _funcmap[flag].call(this, opt);
            }

        }

    };

}();
_cat.utils.Utils = function () {

    return {

        getMatchValue: function (pattern, text) {

            var regexp = new RegExp(pattern),
                results;

            if (regexp) {
                results = regexp.exec(text);
                if (results &&
                    results.length > 1) {
                    return results[1];
                }
            }

            return results;

        }
    };

}();
var animation = false;


_cat.plugins.dom = function () {

    function _type(o) {
        return !!o && Object.prototype.toString.call(o).match(/(\w+)\]/)[1];
    }

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
        if (_type(idName) === "String") {
            // try resolving by id
            elt = document.getElementById(idName);

        } else if (_type(idName).indexOf("Element") !== -1) {
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

_cat.plugins.enyo = function () {

    var _me;

    function _noValidMessgae(method) {
        return ["[cat enyo plugin] ", method, "call failed, no valid argument(s)"].join("");
    }

    function _genericAPI(element, name) {
        if (name) {
            if (!element) {
                _cat.core.log.info(_noValidMessgae("next"));
            }
            if (element[name]) {
                element[name]();
            } else {
                _cat.core.log.info("[cat enyo plugin] No valid method was found, '" + name + "'");
            }
        }
    }

    _me = {

        actions: {


            waterfall: function (element, eventName) {
                if (!element || !eventName) {
                    _cat.core.log.info(_noValidMessgae("waterfall"));
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

var animation = false;


_cat.plugins.jqm = function () {

    var oldElement = "";
    var setBoarder = function(element) {
        if (oldElement) {

            oldElement.classList.remove("markedElement");
        }
        element.className = element.className + " markedElement";
        oldElement = element;
    };

    return {

        actions: {


            scrollTo: function (idName) {

                $(document).ready(function(){
                    var stop = $('#' + idName).offset().top;
                    var delay = 1000;
                    $('body,html').animate({scrollTop: stop}, delay);

                    setBoarder( $('#' + idName).eq(0)[0]);
                });

            },



            scrollTop: function () {

                $(document).ready(function(){



                    $('html, body').animate({scrollTop : 0},1000);
                });

            },

            scrollToWithRapper : function (idName, rapperId) {

                $(document).ready(function(){
                    var stop = $('#' + idName).offset().top;
                    var delay = 1000;
                    $('#' + rapperId).animate({scrollTop: stop}, delay);
                    setBoarder( $('#' + idName).eq(0)[0]);
                });

            },

            clickRef: function (idName) {
                $(document).ready(function(){
                    $('#' + idName).trigger('click');
                    window.location = $('#' + idName).attr('href');

                    setBoarder( $('#' + idName).eq(0)[0]);
                });

            },


            clickButton: function (idName) {
                $(document).ready(function(){
                    $('.ui-btn').removeClass('ui-focus');
                    $('#' + idName).trigger('click');
                    $('#' + idName).closest('.ui-btn').addClass('ui-focus');

                    setBoarder( $('#' + idName).eq(0)[0]);
                });

            },

            selectTab: function (idName) {
                $(document).ready(function(){
                    $('#' + idName).trigger('click');

                    setBoarder( $('#' + idName).eq(0)[0]);
                });

            },



            selectMenu : function (selectId, value) {
                $(document).ready(function(){
                    if (typeof value === 'number') {
                        $("#" + selectId + " option[value=" + value + "]").attr('selected','selected');
                    } else if (typeof value === 'string') {
                        $("#" + selectId + " option[id=" + value + "]").attr('selected','selected');
                    }
                    $( "#" + selectId).selectmenu("refresh", true);

                    setBoarder( $('#' + selectId).eq(0)[0]);
                });

            },



            swipeItemLeft : function(idName) {
                $(document).ready(function(){
                    $("#" + idName).swipeleft();

                    setBoarder( $('#' + idName).eq(0)[0]);
                });
            },


            swipeItemRight : function(idName) {
                $(document).ready(function(){
                    $("#" + idName).swiperight();

                    setBoarder( $('#' + idName).eq(0)[0]);
                });
            },


            swipePageLeft : function() {
                $(document).ready(function(){
                    $( ".ui-page-active" ).swipeleft();

                });


            },


            swipePageRight : function() {
                $(document).ready(function(){

                    var prev = $( ".ui-page-active" ).jqmData( "prev" );

                });
            },


            click: function (idName) {
                $(document).ready(function(){
                    $('#' + idName).trigger('click');

                    setBoarder( $('#' + idName).eq(0)[0]);
                });

            },

            setCheck: function (idName) {
                $(document).ready(function(){
                    $("#"+ idName).prop("checked",true).checkboxradio("refresh");

                    setBoarder( $('#' + idName).eq(0)[0]);
                });

            },

            slide : function (idName, value) {
                $(document).ready(function(){
                    $("#"+ idName).val(value).slider("refresh");

                    setBoarder( $('#' + idName).eq(0)[0]);
                });
            },

            setText : function (idName, value) {
                $(document).ready(function(){
                    $("#"+ idName).focus();
                    $("#"+ idName).val(value);
                    $("#"+ idName).trigger( 'change' );
                    $("#"+ idName).blur();

                    setBoarder( $('#' + idName).eq(0)[0]);
                });
            },


            checkRadio: function (className, idName) {
                $(document).ready(function(){
                    $( "." + className ).prop( "checked", false ).checkboxradio( "refresh" );
                    $( "#" + idName ).prop( "checked", true ).checkboxradio( "refresh" );


                    setBoarder($("label[for='" + idName + "']").eq(0)[0]);

                });

            },

            collapsible : function(idName) {
                $(document).ready(function(){
                    $('#' + idName).children( ".ui-collapsible-heading" ).children(".ui-collapsible-heading-toggle").click();

                    setBoarder( $('#' + idName).eq(0)[0]);
                });

            }

        }


    };

}();

var scrollDelay = true;

_cat.plugins.sencha = function () {
    var getItemById = function(idName) {
        return Ext.ComponentQuery.query('#' + idName)[0];

    };

    var fireItemTapFunc = function (extElement, index) {
            extElement.fireEvent('itemtap', extElement, index);
        },

        fireTapFunc = function (extElement) {
            extElement.fireEvent('tap');
        },

        setTextHelp = function (extElement, str) {

            if (extElement.hasListener('painted')) {

                extElement.setValue(str);
            } else {

                extElement.addListener('painted', function () {
                    extElement.setValue(str);
                });
            }
        };

    return {

        actions: {


            fireTap: function (extElement) {
                // check number of args
                if (arguments.length === 1) {

                    if (extElement.hasListener('painted')) {

                        fireTapFunc(extElement);
                    } else {

                        extElement.addListener('painted', fireTapFunc(extElement));
                    }


                } else {
                    // in case of list
                    var index = arguments[1];
                    if (extElement.hasListener('painted')) {
                        fireItemTapFunc(extElement, index);
                    } else {

                        extElement.addListener('painted', fireItemTapFunc(extElement, index));

                        if (extElement.hasListener('painted')) {
                            fireItemTapFunc(extElement, index);
                        } else {
                            extElement.addListener('painted', fireItemTapFunc(extElement, index));
                        }
                    }

                }

            },

            setText: function (extElement, str) {

                setTextHelp(extElement, str);

            },

            setTextValue: function (extElement, str) {
                var element = getItemById(extElement);
                element.setValue(str);
            },


            tapButton : function (btn) {

                var button = getItemById(btn);
                var buttonHandler = button.getHandler();
                button.fireAction("tap", buttonHandler());
            },

            setChecked : function (checkItem) {

                var checkbox = getItemById(checkItem);
                checkbox.setChecked(true);
            },

            setUnchecked : function (checkItem) {

                var checkbox = getItemById(checkItem);
                checkbox.setChecked(false);
            },

            setSliderValue : function (sliderId, value) {

                var slider = getItemById(sliderId);
                slider.setValue(value);
            },

            setSliderValues : function (sliderId, value1, value2) {

                var slider = getItemById(sliderId);
                slider.setValues([value1, value2]);
            },

            setToggle : function (toggleId, value) {

                var toggle = getItemById(toggleId);
                if (value) {
                    toggle.setValues(true);
                } else {
                    toggle.setValues(false);
                }

            },

            changeTab : function (barId, value) {

                var bar = getItemById(barId);
                bar.setActiveItem(value);
            },

            scrollBy : function (itemId, horizontalValue, verticalValue) {

                var item = getItemById(itemId);

                if (scrollDelay) {
                    item.getScrollable().getScroller().scrollTo(horizontalValue,verticalValue, {
                        duration : 1000
                    }) ;
                } else {
                    item.getScrollable().getScroller().scrollTo(horizontalValue,verticalValue);

                }
            },

            scrollToTop : function (itemId) {

                var item = getItemById(itemId);

                if (scrollDelay) {
                    item.getScrollable().getScroller().scrollTo(-1, -1, {
                        duration : 1000
                    }) ;
                } else {
                    item.getScrollable().getScroller().scrollTo(-1, -1);

                }
            },
            scrollToEnd : function (itemId) {

                var item = getItemById(itemId);

                if (scrollDelay) {
                    item.getScrollable().getScroller().scrollToEnd(true);
                } else {
                    item.getScrollable().getScroller().scrollToEnd(true);

                }
            },

            scrollToListIndex : function (listId, index) {

                var list = getItemById(listId);

                var scroller = list.getScrollable().getScroller();
                var item = list.getItemAt(index);
                var verticalValue = item.renderElement.dom.offsetTop;
                var horizontalValue = 0;

                if (scrollDelay) {
                    scroller.scrollTo(horizontalValue,verticalValue, {
                        duration : 1000
                    }) ;
                } else {
                    scroller.scrollTo(horizontalValue,verticalValue);

                }
            },



            carouselNext : function (carouselId) {

                var carousel = getItemById(carouselId);
                carousel.next();
            },

            carouselPrevious : function (carouselId) {

                var carousel = getItemById(carouselId);
                carousel.previous();
            },

            nestedlistSelect : function (nestedlistId, index) {

                var nestedlist = getItemById(nestedlistId);
                var indexItem = nestedlist.getActiveItem().getStore().getRange()[index];
                if (indexItem.isLeaf()) {

                    var activelist= nestedlist.getActiveItem();
                    nestedlist.fireEvent('itemtap', nestedlist, activelist,index,{},{});

                } else {
                    nestedlist.goToNode(indexItem);
                }

            },

            nestedlistBack : function (nestedlistId) {

                var nestedlist = getItemById(nestedlistId);
                var node = nestedlist.getLastNode();
                nestedlist.goToNode(node.parentNode);
            },


            listSelectIndex : function (listId, index) {
                var list = getItemById(listId);
                list.select(index);
            },


            changeView : function (viewName) {
                var firststep = Ext.create(viewName);
                Ext.Viewport.setActiveItem(firststep);
            },

            removePanel : function (panelId) {

                var panel = getItemById(panelId);
                Ext.Viewport.remove(panel);
            },

            setDate : function (dateItemId, year, month, day) {

                var dateItem = getItemById(dateItemId);
                dateItem.setValue(new Date(year, month - 1, day));
            }
        }


    };

}();
(function(){var a=this;blueprint={isString:function(a){return"[object String]"===Object.prototype.toString.call(a)},isBool:function(a){return"[object Boolean]"===Object.prototype.toString.call(a)},isNumber:function(a){return"[object Number]"===Object.prototype.toString.call(a)},isInteger:function(a){return"[object Number]"===Object.prototype.toString.call(a)&&0===a%1},isFloat:function(a){return"[object Number]"===Object.prototype.toString.call(a)&&0!==a%1},isArray:function(a){return"[object Array]"===Object.prototype.toString.call(a)},isObject:function(a){return"[object Object]"===Object.prototype.toString.call(a)},isFunction:function(a){return"[object Function]"===Object.prototype.toString.call(a)},isUndefined:function(a){return"[object Undefined]"===Object.prototype.toString.call(a)}},"undefined"!=typeof exports?("undefined"!=typeof module&&module.exports&&(exports=module.exports=blueprint),exports.typedAs=blueprint):a.typedAs=blueprint}).call(this),function(){var a=this,b=a._,c={},d=Array.prototype,e=Object.prototype,f=Function.prototype,g=d.push,h=d.slice,i=d.concat,j=e.toString,k=e.hasOwnProperty,l=d.forEach,m=d.map,n=d.reduce,o=d.reduceRight,p=d.filter,q=d.every,r=d.some,s=d.indexOf,t=d.lastIndexOf,u=Array.isArray,v=Object.keys,w=f.bind,x=function(a){return a instanceof x?a:this instanceof x?(this._wrapped=a,void 0):new x(a)};"undefined"!=typeof exports?("undefined"!=typeof module&&module.exports&&(exports=module.exports=x),exports._=x):a._=x,x.VERSION="1.5.2";var y=x.each=x.forEach=function(a,b,d){if(null!=a)if(l&&a.forEach===l)a.forEach(b,d);else if(a.length===+a.length){for(var e=0,f=a.length;f>e;e++)if(b.call(d,a[e],e,a)===c)return}else for(var g=x.keys(a),e=0,f=g.length;f>e;e++)if(b.call(d,a[g[e]],g[e],a)===c)return};x.map=x.collect=function(a,b,c){var d=[];return null==a?d:m&&a.map===m?a.map(b,c):(y(a,function(a,e,f){d.push(b.call(c,a,e,f))}),d)};var z="Reduce of empty array with no initial value";x.reduce=x.foldl=x.inject=function(a,b,c,d){var e=arguments.length>2;if(null==a&&(a=[]),n&&a.reduce===n)return d&&(b=x.bind(b,d)),e?a.reduce(b,c):a.reduce(b);if(y(a,function(a,f,g){e?c=b.call(d,c,a,f,g):(c=a,e=!0)}),!e)throw new TypeError(z);return c},x.reduceRight=x.foldr=function(a,b,c,d){var e=arguments.length>2;if(null==a&&(a=[]),o&&a.reduceRight===o)return d&&(b=x.bind(b,d)),e?a.reduceRight(b,c):a.reduceRight(b);var f=a.length;if(f!==+f){var g=x.keys(a);f=g.length}if(y(a,function(h,i,j){i=g?g[--f]:--f,e?c=b.call(d,c,a[i],i,j):(c=a[i],e=!0)}),!e)throw new TypeError(z);return c},x.find=x.detect=function(a,b,c){var d;return A(a,function(a,e,f){return b.call(c,a,e,f)?(d=a,!0):void 0}),d},x.filter=x.select=function(a,b,c){var d=[];return null==a?d:p&&a.filter===p?a.filter(b,c):(y(a,function(a,e,f){b.call(c,a,e,f)&&d.push(a)}),d)},x.reject=function(a,b,c){return x.filter(a,function(a,d,e){return!b.call(c,a,d,e)},c)},x.every=x.all=function(a,b,d){b||(b=x.identity);var e=!0;return null==a?e:q&&a.every===q?a.every(b,d):(y(a,function(a,f,g){return(e=e&&b.call(d,a,f,g))?void 0:c}),!!e)};var A=x.some=x.any=function(a,b,d){b||(b=x.identity);var e=!1;return null==a?e:r&&a.some===r?a.some(b,d):(y(a,function(a,f,g){return e||(e=b.call(d,a,f,g))?c:void 0}),!!e)};x.contains=x.include=function(a,b){return null==a?!1:s&&a.indexOf===s?-1!=a.indexOf(b):A(a,function(a){return a===b})},x.invoke=function(a,b){var c=h.call(arguments,2),d=x.isFunction(b);return x.map(a,function(a){return(d?b:a[b]).apply(a,c)})},x.pluck=function(a,b){return x.map(a,function(a){return a[b]})},x.where=function(a,b,c){return x.isEmpty(b)?c?void 0:[]:x[c?"find":"filter"](a,function(a){for(var c in b)if(b[c]!==a[c])return!1;return!0})},x.findWhere=function(a,b){return x.where(a,b,!0)},x.max=function(a,b,c){if(!b&&x.isArray(a)&&a[0]===+a[0]&&a.length<65535)return Math.max.apply(Math,a);if(!b&&x.isEmpty(a))return-1/0;var d={computed:-1/0,value:-1/0};return y(a,function(a,e,f){var g=b?b.call(c,a,e,f):a;g>d.computed&&(d={value:a,computed:g})}),d.value},x.min=function(a,b,c){if(!b&&x.isArray(a)&&a[0]===+a[0]&&a.length<65535)return Math.min.apply(Math,a);if(!b&&x.isEmpty(a))return 1/0;var d={computed:1/0,value:1/0};return y(a,function(a,e,f){var g=b?b.call(c,a,e,f):a;g<d.computed&&(d={value:a,computed:g})}),d.value},x.shuffle=function(a){var b,c=0,d=[];return y(a,function(a){b=x.random(c++),d[c-1]=d[b],d[b]=a}),d},x.sample=function(a,b,c){return arguments.length<2||c?a[x.random(a.length-1)]:x.shuffle(a).slice(0,Math.max(0,b))};var B=function(a){return x.isFunction(a)?a:function(b){return b[a]}};x.sortBy=function(a,b,c){var d=B(b);return x.pluck(x.map(a,function(a,b,e){return{value:a,index:b,criteria:d.call(c,a,b,e)}}).sort(function(a,b){var c=a.criteria,d=b.criteria;if(c!==d){if(c>d||void 0===c)return 1;if(d>c||void 0===d)return-1}return a.index-b.index}),"value")};var C=function(a){return function(b,c,d){var e={},f=null==c?x.identity:B(c);return y(b,function(c,g){var h=f.call(d,c,g,b);a(e,h,c)}),e}};x.groupBy=C(function(a,b,c){(x.has(a,b)?a[b]:a[b]=[]).push(c)}),x.indexBy=C(function(a,b,c){a[b]=c}),x.countBy=C(function(a,b){x.has(a,b)?a[b]++:a[b]=1}),x.sortedIndex=function(a,b,c,d){c=null==c?x.identity:B(c);for(var e=c.call(d,b),f=0,g=a.length;g>f;){var h=f+g>>>1;c.call(d,a[h])<e?f=h+1:g=h}return f},x.toArray=function(a){return a?x.isArray(a)?h.call(a):a.length===+a.length?x.map(a,x.identity):x.values(a):[]},x.size=function(a){return null==a?0:a.length===+a.length?a.length:x.keys(a).length},x.first=x.head=x.take=function(a,b,c){return null==a?void 0:null==b||c?a[0]:h.call(a,0,b)},x.initial=function(a,b,c){return h.call(a,0,a.length-(null==b||c?1:b))},x.last=function(a,b,c){return null==a?void 0:null==b||c?a[a.length-1]:h.call(a,Math.max(a.length-b,0))},x.rest=x.tail=x.drop=function(a,b,c){return h.call(a,null==b||c?1:b)},x.compact=function(a){return x.filter(a,x.identity)};var D=function(a,b,c){return b&&x.every(a,x.isArray)?i.apply(c,a):(y(a,function(a){x.isArray(a)||x.isArguments(a)?b?g.apply(c,a):D(a,b,c):c.push(a)}),c)};x.flatten=function(a,b){return D(a,b,[])},x.without=function(a){return x.difference(a,h.call(arguments,1))},x.uniq=x.unique=function(a,b,c,d){x.isFunction(b)&&(d=c,c=b,b=!1);var e=c?x.map(a,c,d):a,f=[],g=[];return y(e,function(c,d){(b?d&&g[g.length-1]===c:x.contains(g,c))||(g.push(c),f.push(a[d]))}),f},x.union=function(){return x.uniq(x.flatten(arguments,!0))},x.intersection=function(a){var b=h.call(arguments,1);return x.filter(x.uniq(a),function(a){return x.every(b,function(b){return x.indexOf(b,a)>=0})})},x.difference=function(a){var b=i.apply(d,h.call(arguments,1));return x.filter(a,function(a){return!x.contains(b,a)})},x.zip=function(){for(var a=x.max(x.pluck(arguments,"length").concat(0)),b=new Array(a),c=0;a>c;c++)b[c]=x.pluck(arguments,""+c);return b},x.object=function(a,b){if(null==a)return{};for(var c={},d=0,e=a.length;e>d;d++)b?c[a[d]]=b[d]:c[a[d][0]]=a[d][1];return c},x.indexOf=function(a,b,c){if(null==a)return-1;var d=0,e=a.length;if(c){if("number"!=typeof c)return d=x.sortedIndex(a,b),a[d]===b?d:-1;d=0>c?Math.max(0,e+c):c}if(s&&a.indexOf===s)return a.indexOf(b,c);for(;e>d;d++)if(a[d]===b)return d;return-1},x.lastIndexOf=function(a,b,c){if(null==a)return-1;var d=null!=c;if(t&&a.lastIndexOf===t)return d?a.lastIndexOf(b,c):a.lastIndexOf(b);for(var e=d?c:a.length;e--;)if(a[e]===b)return e;return-1},x.range=function(a,b,c){arguments.length<=1&&(b=a||0,a=0),c=arguments[2]||1;for(var d=Math.max(Math.ceil((b-a)/c),0),e=0,f=new Array(d);d>e;)f[e++]=a,a+=c;return f};var E=function(){};x.bind=function(a,b){var c,d;if(w&&a.bind===w)return w.apply(a,h.call(arguments,1));if(!x.isFunction(a))throw new TypeError;return c=h.call(arguments,2),d=function(){if(!(this instanceof d))return a.apply(b,c.concat(h.call(arguments)));E.prototype=a.prototype;var e=new E;E.prototype=null;var f=a.apply(e,c.concat(h.call(arguments)));return Object(f)===f?f:e}},x.partial=function(a){var b=h.call(arguments,1);return function(){return a.apply(this,b.concat(h.call(arguments)))}},x.bindAll=function(a){var b=h.call(arguments,1);if(0===b.length)throw new Error("bindAll must be passed function names");return y(b,function(b){a[b]=x.bind(a[b],a)}),a},x.memoize=function(a,b){var c={};return b||(b=x.identity),function(){var d=b.apply(this,arguments);return x.has(c,d)?c[d]:c[d]=a.apply(this,arguments)}},x.delay=function(a,b){var c=h.call(arguments,2);return setTimeout(function(){return a.apply(null,c)},b)},x.defer=function(a){return x.delay.apply(x,[a,1].concat(h.call(arguments,1)))},x.throttle=function(a,b,c){var d,e,f,g=null,h=0;c||(c={});var i=function(){h=c.leading===!1?0:new Date,g=null,f=a.apply(d,e)};return function(){var j=new Date;h||c.leading!==!1||(h=j);var k=b-(j-h);return d=this,e=arguments,0>=k?(clearTimeout(g),g=null,h=j,f=a.apply(d,e)):g||c.trailing===!1||(g=setTimeout(i,k)),f}},x.debounce=function(a,b,c){var d,e,f,g,h;return function(){f=this,e=arguments,g=new Date;var i=function(){var j=new Date-g;b>j?d=setTimeout(i,b-j):(d=null,c||(h=a.apply(f,e)))},j=c&&!d;return d||(d=setTimeout(i,b)),j&&(h=a.apply(f,e)),h}},x.once=function(a){var b,c=!1;return function(){return c?b:(c=!0,b=a.apply(this,arguments),a=null,b)}},x.wrap=function(a,b){return function(){var c=[a];return g.apply(c,arguments),b.apply(this,c)}},x.compose=function(){var a=arguments;return function(){for(var b=arguments,c=a.length-1;c>=0;c--)b=[a[c].apply(this,b)];return b[0]}},x.after=function(a,b){return function(){return--a<1?b.apply(this,arguments):void 0}},x.keys=v||function(a){if(a!==Object(a))throw new TypeError("Invalid object");var b=[];for(var c in a)x.has(a,c)&&b.push(c);return b},x.values=function(a){for(var b=x.keys(a),c=b.length,d=new Array(c),e=0;c>e;e++)d[e]=a[b[e]];return d},x.pairs=function(a){for(var b=x.keys(a),c=b.length,d=new Array(c),e=0;c>e;e++)d[e]=[b[e],a[b[e]]];return d},x.invert=function(a){for(var b={},c=x.keys(a),d=0,e=c.length;e>d;d++)b[a[c[d]]]=c[d];return b},x.functions=x.methods=function(a){var b=[];for(var c in a)x.isFunction(a[c])&&b.push(c);return b.sort()},x.extend=function(a){return y(h.call(arguments,1),function(b){if(b)for(var c in b)a[c]=b[c]}),a},x.pick=function(a){var b={},c=i.apply(d,h.call(arguments,1));return y(c,function(c){c in a&&(b[c]=a[c])}),b},x.omit=function(a){var b={},c=i.apply(d,h.call(arguments,1));for(var e in a)x.contains(c,e)||(b[e]=a[e]);return b},x.defaults=function(a){return y(h.call(arguments,1),function(b){if(b)for(var c in b)void 0===a[c]&&(a[c]=b[c])}),a},x.clone=function(a){return x.isObject(a)?x.isArray(a)?a.slice():x.extend({},a):a},x.tap=function(a,b){return b(a),a};var F=function(a,b,c,d){if(a===b)return 0!==a||1/a==1/b;if(null==a||null==b)return a===b;a instanceof x&&(a=a._wrapped),b instanceof x&&(b=b._wrapped);var e=j.call(a);if(e!=j.call(b))return!1;switch(e){case"[object String]":return a==String(b);case"[object Number]":return a!=+a?b!=+b:0==a?1/a==1/b:a==+b;case"[object Date]":case"[object Boolean]":return+a==+b;case"[object RegExp]":return a.source==b.source&&a.global==b.global&&a.multiline==b.multiline&&a.ignoreCase==b.ignoreCase}if("object"!=typeof a||"object"!=typeof b)return!1;for(var f=c.length;f--;)if(c[f]==a)return d[f]==b;var g=a.constructor,h=b.constructor;if(g!==h&&!(x.isFunction(g)&&g instanceof g&&x.isFunction(h)&&h instanceof h))return!1;c.push(a),d.push(b);var i=0,k=!0;if("[object Array]"==e){if(i=a.length,k=i==b.length)for(;i--&&(k=F(a[i],b[i],c,d)););}else{for(var l in a)if(x.has(a,l)&&(i++,!(k=x.has(b,l)&&F(a[l],b[l],c,d))))break;if(k){for(l in b)if(x.has(b,l)&&!i--)break;k=!i}}return c.pop(),d.pop(),k};x.isEqual=function(a,b){return F(a,b,[],[])},x.isEmpty=function(a){if(null==a)return!0;if(x.isArray(a)||x.isString(a))return 0===a.length;for(var b in a)if(x.has(a,b))return!1;return!0},x.isElement=function(a){return!(!a||1!==a.nodeType)},x.isArray=u||function(a){return"[object Array]"==j.call(a)},x.isObject=function(a){return a===Object(a)},y(["Arguments","Function","String","Number","Date","RegExp"],function(a){x["is"+a]=function(b){return j.call(b)=="[object "+a+"]"}}),x.isArguments(arguments)||(x.isArguments=function(a){return!(!a||!x.has(a,"callee"))}),"function"!=typeof/./&&(x.isFunction=function(a){return"function"==typeof a}),x.isFinite=function(a){return isFinite(a)&&!isNaN(parseFloat(a))},x.isNaN=function(a){return x.isNumber(a)&&a!=+a},x.isBoolean=function(a){return a===!0||a===!1||"[object Boolean]"==j.call(a)},x.isNull=function(a){return null===a},x.isUndefined=function(a){return void 0===a},x.has=function(a,b){return k.call(a,b)},x.noConflict=function(){return a._=b,this},x.identity=function(a){return a},x.times=function(a,b,c){for(var d=Array(Math.max(0,a)),e=0;a>e;e++)d[e]=b.call(c,e);return d},x.random=function(a,b){return null==b&&(b=a,a=0),a+Math.floor(Math.random()*(b-a+1))};var G={escape:{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#x27;"}};G.unescape=x.invert(G.escape);var H={escape:new RegExp("["+x.keys(G.escape).join("")+"]","g"),unescape:new RegExp("("+x.keys(G.unescape).join("|")+")","g")};x.each(["escape","unescape"],function(a){x[a]=function(b){return null==b?"":(""+b).replace(H[a],function(b){return G[a][b]})}}),x.result=function(a,b){if(null==a)return void 0;var c=a[b];return x.isFunction(c)?c.call(a):c},x.mixin=function(a){y(x.functions(a),function(b){var c=x[b]=a[b];x.prototype[b]=function(){var a=[this._wrapped];return g.apply(a,arguments),M.call(this,c.apply(x,a))}})};var I=0;x.uniqueId=function(a){var b=++I+"";return a?a+b:b},x.templateSettings={evaluate:/<%([\s\S]+?)%>/g,interpolate:/<%=([\s\S]+?)%>/g,escape:/<%-([\s\S]+?)%>/g};var J=/(.)^/,K={"'":"'","\\":"\\","\r":"r","\n":"n","	":"t","\u2028":"u2028","\u2029":"u2029"},L=/\\|'|\r|\n|\t|\u2028|\u2029/g;x.template=function(a,b,c){var d;c=x.defaults({},c,x.templateSettings);var e=new RegExp([(c.escape||J).source,(c.interpolate||J).source,(c.evaluate||J).source].join("|")+"|$","g"),f=0,g="__p+='";a.replace(e,function(b,c,d,e,h){return g+=a.slice(f,h).replace(L,function(a){return"\\"+K[a]}),c&&(g+="'+\n((__t=("+c+"))==null?'':_.escape(__t))+\n'"),d&&(g+="'+\n((__t=("+d+"))==null?'':__t)+\n'"),e&&(g+="';\n"+e+"\n__p+='"),f=h+b.length,b}),g+="';\n",c.variable||(g="with(obj||{}){\n"+g+"}\n"),g="var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};\n"+g+"return __p;\n";try{d=new Function(c.variable||"obj","_",g)}catch(h){throw h.source=g,h}if(b)return d(b,x);var i=function(a){return d.call(this,a,x)};return i.source="function("+(c.variable||"obj")+"){\n"+g+"}",i},x.chain=function(a){return x(a).chain()};var M=function(a){return this._chain?x(a).chain():a};x.mixin(x),y(["pop","push","reverse","shift","sort","splice","unshift"],function(a){var b=d[a];x.prototype[a]=function(){var c=this._wrapped;return b.apply(c,arguments),"shift"!=a&&"splice"!=a||0!==c.length||delete c[0],M.call(this,c)}}),y(["concat","join","slice"],function(a){var b=d[a];x.prototype[a]=function(){return M.call(this,b.apply(this._wrapped,arguments))}}),x.extend(x.prototype,{chain:function(){return this._chain=!0,this},value:function(){return this._wrapped}})}.call(this);var underscore,_jsutilsModuleArray=function(){var a={};return{internal:function(b){a=b},cleanupArray:function(b){var c=[];return b&&a.typedas.isArray(b)&&b.forEach(function(a){null!==a&&void 0!==a&&c.push(a)}),c},removeArrayItemByValue:function(b,c){var d=[],e=0;return b&&a.typedas.isArray(b)&&b.forEach(function(a){a!==c&&null!==a&&void 0!==a&&d.push(a),e++}),d}}}();if("undefined"!=typeof exports)"undefined"!=typeof module&&module.exports&&(_jsutilsModuleArray.internal({typedas:require("typedas")}),module.exports=_jsutilsModuleArray);else var jsutilsArrayModule=function(){return _jsutilsModuleArray.internal({typedas:typedAs}),_jsutilsModuleArray}(typedAs);var _jsutilsModuleObject=function(){var a={};return{internal:function(b){a=b},contains:function(b,c){var d;if(b)for(d in b)if(a.typedas.isObject(c)||a.typedas.isArray(c)){if(JSON.stringify(b[d])===JSON.stringify(c))return!0}else if(b[d]===c)return!0;return!1},copy:function(b,c,d){var e,f,g,h=this,i=0,j=0;if(d=d||!1,b&&c)for(e in b)if(b.hasOwnProperty(e))if(f=c[e],a.typedas.isObject(b[e]))c[e]||(c[e]={}),arguments.callee.call(h,b[e],c[e],d);else if(a.typedas.isArray(b[e]))if(f){if(a.typedas.isArray(f))if(a.arrayutils.cleanupArray(b[e]),d)c[e]=b[e];else{for(j=c[e].length,i=0;j>i;i++)g=f[i],b[e]=a.arrayutils.removeArrayItemByValue(b[e],g);c[e]=c[e].concat(b[e])}}else c[e]=b[e];else(d||void 0===f)&&(!c[e]||c[e]&&d)&&(c[e]=b[e])}}}();if("undefined"!=typeof exports)"undefined"!=typeof module&&module.exports&&(_jsutilsModuleObject.internal({typedas:require("typedas"),arrayutils:require("./Array.js")}),module.exports=_jsutilsModuleObject);else var jsutilsObjectModule=function(a,b){return _jsutilsModuleObject.internal({typedas:typedAs,arrayutils:b}),_jsutilsModuleObject}(typedAs,jsutilsArrayModule);var _jsutilsUnderscore,_jsutilsModuleTemplate=function(){var a={},b={};return{internal:function(a){b=a},underscore:b._,readTemplateFile:function(c,d){d||b.log.error("[js.utils Template.readTemplateFile] 'path' argument is no valid ");var e,f=[d,c].join("/");f=b.path.normalize(f);try{f=[f,"tpl"].join("."),e=a[f],e||(e=b.fs.readFileSync(f,"utf8")),a[f]=e}catch(g){b.log.warn("[js.utils Template.readTemplateFile] File failed to load ",f,g)}return e},template:function(a){if(!a)return void 0;var c,d=a.name,e=a.path,f=a.data,g=a.content,h=g||this.readTemplateFile(d,e);return h?(c=b._.template(h),c?c(f):void 0):(b.log.warn("[js.utils Template.template] Failed to process template "),void 0)}}}();if("undefined"!=typeof exports)"undefined"!=typeof module&&module.exports&&(_jsutilsUnderscore=require("underscore"),_jsutilsUnderscore.templateSettings={interpolate:/\{\{(.+?)\}\}/g},_jsutilsModuleTemplate.internal({fs:require("fs"),log:require("./Logger.js"),path:require("path"),_:_jsutilsUnderscore}),module.exports=_jsutilsModuleTemplate);else var jsutilsTemplateModule=function(){return _jsutilsModuleTemplate=function(){return _.templateSettings={interpolate:/\{\{(.+?)\}\}/g},{template:function(a){if(!a)return void 0;var b,c=a.data,d=a.content;return d?(b=_.template(d),b?b(c):void 0):(console.warn("[js.utils Template.template] Failed to process template "),void 0)}}}()}(underscore);var jsutils=this;jsutils.jsutilsObject={},jsutils.jsutilsArray={},jsutils.jsutilsTemplate={};var jsutilsweb=function(a,b,c){jsutils.jsutilsObject=a,jsutils.jsutilsArray=b,jsutils.jsutilsTemplate=c}(jsutilsObjectModule,jsutilsArrayModule,jsutilsTemplateModule),_jmrEnum={TESTSUITE:"model.testsuite",TESTSUITES:"model.testsuites",TESTCASE:"model.testcase",ERROR:"model.err",SKIPPED:"model.skipped",FAILURE:"model.failure",SYSTEM:"model.system"};if("undefined"!=typeof exports)"undefined"!=typeof module&&module.exports&&(module.exports=_jmrEnum);else var jmrEnumModule=function(){return _jmrEnum}();var _jmrModuleUtils=function(){return{logger:function(){return console},validargs:function(a){return a?!0:(_jmrModuleUtils.logger().warn("[jmrUtilsModule.validargs] The passed argument(s) is/are not valid"),!1)}}}();if("undefined"!=typeof exports)"undefined"!=typeof module&&module.exports&&(module.exports=_jmrModuleUtils);else var jmrUtilsModule=function(){return _jmrModuleUtils}();var _jmrReporterModel=function(){var a,b=function(b){var c=this;this.config={},this.getName=function(){var a=c.get("name");if(!a)throw new Error("[TestUnitReporter BaseReporter.ReporterModel] 'name' property is mandatory for this class");return a},this.get=function(a){return this.config&&a?this.config[a]:void 0},this.set=function(b,d){this.config&&b&&(d&&a.isFunction(d)?this[b]=function(){return d.apply(c,arguments)}:this.config[b]=d)},this.setall=function(a){var b,c=this;if(a)for(b in a)c.set[b]=a[b]},function(){var a;if(c.set("root","./src/reporter"),b)for(a in b)b.hasOwnProperty(a)&&c.set(a,b[a])}()};return{internal:function(b){a=b.typedas},model:b}}();if("undefined"!=typeof exports)"undefined"!=typeof module&&module.exports&&(_jmrReporterModel.internal({typedas:require("typedas")}),module.exports=_jmrReporterModel.model);else var jmrReporterModelModule=function(){return _jmrReporterModel.internal({typedas:typedAs}),_jmrReporterModel.model}(typedAs);var _jmrJunitReporter,_jmrJunitReporterClass=function(a){var b=function(){return[this.get("root"),this.get("name"),"templates"].join("/")},c=function(b){if(!b)return!1;var c,d,e,f,g;try{d=a.path.join(this.get("root"),this.get("name"),this.get("xsd")),c=a.fs.readFileSync(d,{encoding:"utf8"}),e=a.libxmljs.parseXmlString(c),f=a.libxmljs.parseXmlString(b),g=f.validate(e)}catch(h){a.log.error("[TestUnitReporter] Reporter.validate error: ",h)}return g},d=function(b){var c,d=b.reportsdir,e=b.testsdir,f=a.path.join(this.get("root"),this.get("name"));a.fs.existsSync(d)&&a.fs.rmrfSync(a.path.resolve(d)),a.fs.existsSync(d)||a.fs.mkdirpSync(a.path.join(a.path.resolve(d),"html")),a.fs.existsSync(e)||a.fs.mkdirpSync(a.path.resolve(e)),c=a.jsutils.Template.template({path:f,name:this.get("antxml"),data:{reportsdir:a.path.resolve(d),testsdir:a.path.resolve(e)}}),a.log.log("[junit reporter] using ant reporter xml: ",c),a.antutils.parse({antcontent:c})},e=new a.basereporter({name:"junit",xsd:"junit4.xsd",antxml:"junitreport2ant",getTemplateURL:a.getTemplateUrl||b,validate:a.validate||c,report:a.report||d});return{model:function(){return e}}};if("undefined"!=typeof exports){if("undefined"!=typeof module&&module.exports){var _path=path,_basereporter=ReporterModeljs,libxmljs=libxmljs,_fs=fs.extra,_utils=requirext("jmrUtilsModule"),_log=_utils.logger(),_jsutils=js.utils,_antutils=requirext("jmrUtilsAntModule");_jmrJunitReporter=new _jmrJunitReporterClass({fs:_fs,log:_log,path:_path,jsutils:_jsutils,libxmljs:libxmljs,basereporter:_basereporter,antutils:_antutils}),module.exports=_jmrJunitReporter}}else var jmrReporterJunitModule=function(a,b,c){return _jmrJunitReporter=new _jmrJunitReporterClass({log:c.logger(),jsutils:jsutilsTemplate,basereporter:a,validate:function(){},report:function(){}})}(jmrReporterModelModule,jsutils,jmrUtilsModule);var _jmrConfigModule,_jmrConfigModuleClass=function(a){var b;return{reporters:["junit"],getDefaultReporter:function(){return b||this.reporters[0]},setReporter:function(a){b=a},getReporter:function(b){var c,d,e;if(b=b||this.getDefaultReporter(),c=a.jsutilsobj.contains(this.reporters,b)?b:void 0){if("undefined"!=typeof exports){if("undefined"!=typeof module&&module.exports)try{d=require(["./reporter",b,"Reporter.js"].join("/"))}catch(f){}}else d=a.reporters[b];d&&(e=d.model())}return e?e:(console.log("[Test Unit Reporter] no valid reporter named: ",b),void 0)}}};if("undefined"!=typeof exports)"undefined"!=typeof module&&module.exports&&(_jmrConfigModule=new _jmrConfigModuleClass({jsutilsobj:require("js.utils").Object}),module.exports=_jmrConfigModule);else var jmrConfigModule=function(a,b){return _jmrConfigModule=new _jmrConfigModuleClass({jsutilsobj:jsutilsObject,reporters:{junit:b}})}(jsutils,jmrReporterJunitModule);var jmrTemplatesBundleModule=function(){var a={};return a["./src/reporter/junit/templates/_error.tpl"]="<error {{data.get('message')}} {{data.get('type')}} >{{data.get('body',0)}}</error>",a["./src/reporter/junit/templates/_failure.tpl"]="<failure {{data.get('message')}} {{data.get('type')}} >{{data.get('body',0)}}</failure>",a["./src/reporter/junit/templates/_skipped.tpl"]="<skipped>{{data.get('body',0)}}</skipped>",a["./src/reporter/junit/templates/_system.tpl"]="<system-{{data.systemtype}} >{{data.get('body',0)}}</system-{{data.systemtype}}>",a["./src/reporter/junit/templates/_testcase.tpl"]="<testcase {{data.get('name')}} {{data.get('assertions')}} {{data.get('classname')}} {{data.get('status')}} {{data.get('time')}}>{{data.get('body',0)}}</testcase>",a["./src/reporter/junit/templates/_testsuite.tpl"]="<testsuite {{data.get('id')}}  {{data.get('name')}}  {{data.get('disabled')}} {{data.get('errors')}}  {{data.get('failures')}}  {{data.get('hostname')}}  {{data.get('package')}} {{data.get('skipped')}} {{data.get('tests')}} {{data.get('time')}} {{data.get('timestamp')}} >{{data.get('body', 0)}}</testsuite>",a["./src/reporter/junit/templates/_testsuites.tpl"]="<testsuites {{data.get('name')}} {{data.get('disabled')}} {{data.get('errors')}} {{data.get('failures')}}  {{data.get('tests')}}  {{data.get('time')}}  >{{data.get('body',0)}} </testsuites>",a}(),_jmrModuleObject=function(){function a(a){h.mapper||("undefined"!=typeof exports?"undefined"!=typeof module&&module.exports&&(h.mapper=require("./Mapper.js")):h.mapperwait||(h.mapperwait=1,function(b){h.mapper=b,h.mapperwait=0,a&&a.call(this,b)}(jmrMapperModule)))}function b(b){return a(),h.mapper&&h.mapper[b]?h.mapper[b].get(b):void 0}function c(b,c){var d,e=c.type;return a(),d=h.mapper[e],h.mapper&&d&&d[b]?d[b](c):void 0}function d(a){a&&(this.config=a||{})}function e(a){var c,d,f,g,i,j,k,l=[],m=a.clazz.type,n=a.impl,o=b(m);return o&&(d=o.get("clazz"),f=o.get("tpl")),a.data&&h.typedas.isObject(a.data)?(c=n.children(),c&&(c.forEach(function(a){l.push(e({impl:a,data:a.members?a.members:a,clazz:{type:a.type||a.config.type}}))}),a.impl.collect&&(g=a.impl.collect.call(a.impl),g&&(n.setall(g),h.jsutilsobj.copy(g,a.data)))),i=n.data.body,a.data.body=i&&h.typedas.isString(i)?i:l.join(""),a.data.get=function(b,c){var d;return b&&(d=a.data[b],c=void 0!==c?c:1,void 0!==d&&null!==d)?(d=d.trim?d.trim():d,d.trim&&""===d?void 0:c?[b,'="',d,'"'].join(""):d):void 0},h.jmrconfig?(k=h.jmrconfig.getReporter(),j={content:h.tplbundle[[k.getTemplateURL(),"/_",f,".tpl"].join("")],data:{data:a.data}}):j={name:["_",f].join(""),path:global.jmr.reporter.getTemplateURL(),data:{data:a.data}},h.tplutils.template(j)):void 0}var f,g={},h={};return d.prototype.get=function(a){return this.config[a]},f={internal:function(a){h=a},loadMapper:function(b){a(function(a){b&&b.call(this,a)})},create:function(a){return h.utils.validargs(a)?c("create",a):void 0},generate:function(a){if(!h.utils.validargs(a))return void 0;var b=f.create(a);return{model:b,output:b.compile()}},get:function(a){return g?g[a]:void 0},add:function(a){if(!h.utils.validargs(a))return void 0;var b=a.type,c=a.clazz;b&&c&&h.typedas.isFunction(c)?g[b]=new d(a):h.log.warn("Failed to add map of type: ",b)},initTestClass:function(a){var c,d=this,g=a.data?a.data.body:void 0;if(this.body=[],this.data={},this.members={},this.classobj=b(a.type),this.getType=function(){return a.type},this.config=this.classobj?this.classobj.config:void 0,this.members.body=this.body,this.config&&this.config.spec&&a.data)for(c in this.config.spec)this.members[c]=a.data[c],this.data[c]=a.data[c];this.get=function(a){return this.members[a]},this.setall=function(a){var b,c;if(a&&h.typedas.isObject(a))for(b in a)a.hasOwnProperty(b)&&(c=a[b],d.set(b,c));else h.log.warn("[test.unit base.setall] No valid arguments, expected of type Object ")},this.set=function(a,b){this.members[a]=b,this.data[a]=b},this.children=function(){return this.body&&h.typedas.isArray(this.body)&&this.body.length>0?this.body:null},this.add=function(a){a&&this.body.push(a)},this.remove=function(){h.log.warn("Not implemented (in the TODO list)")},this.compile=function(){var a,b={data:{},clazz:{}};for(a in this.members)b.data[a]=this.get(a);return b.clazz=this.config,b.impl=this,e(b)},g&&(g.forEach?g.forEach(function(a){var b;a&&(b=f.create(a),d.add(b))}):d.data.body=g)}}}();if("undefined"!=typeof exports)"undefined"!=typeof module&&module.exports&&(_jmrModuleObject.internal({typedas:require("typedas"),jsutilsobj:require("js.utils").Object,utils:requirext("jmrUtilsModule"),log:requirext("jmrUtilsModule").logger(),tplutils:require("js.utils").Template}),module.exports=_jmrModuleObject);else var jmrBaseModule=function(a,b,c,d,e){return _jmrModuleObject.internal({typedas:typedAs,jsutilsobj:jsutilsObject,utils:c,log:c.logger(),tplutils:jsutilsTemplate,jmrconfig:d,tplbundle:e}),_jmrModuleObject}(typedAs,jsutils,jmrUtilsModule,jmrConfigModule,jmrTemplatesBundleModule);var _jmrtcspec={spec:{name:void 0,assertions:void 0,classname:void 0,status:void 0,time:void 0},tpl:"testcase",clazz:function(){}},_jmrModuleTestCase,_jmrModuleTestCaseClass=function(a){function b(b){a.base.initTestClass.call(this,b)}return{get:a.base.get,create:function(a){return new b(a)}}};if("undefined"!=typeof exports){if("undefined"!=typeof module&&module.exports){var _enum=Enumjs,_base=Basejs;_jmrModuleTestCase=new _jmrModuleTestCaseClass({base:_base}),_jmrtcspec.type=_enum.TESTCASE,_base.add(_jmrtcspec),module.exports=_jmrModuleTestCase}}else var jmrModelTCaseModule=function(a,b,c,d,e){return _jmrtcspec.type=d.TESTCASE,e.add(_jmrtcspec),_jmrModuleTestCase=new _jmrModuleTestCaseClass({base:e})}(typedAs,jsutils,jmrUtilsModule,jmrEnumModule,jmrBaseModule);var _jmrtssspec={spec:{disabled:void 0,errors:void 0,failures:void 0,tests:void 0,name:void 0,time:void 0},tpl:"testsuites",clazz:function(){}},_jmrModuleTestSuites,_jmrModuleTestSuitesClass=function(a){function b(b){a.base.initTestClass.call(this,b)}return b.prototype.getCollection=function(){var b={};return a.jsutils.Object.copy({tests:0,failures:0,errors:0},b),b},b.prototype.reset=function(){this.collection=this.getCollection()},b.prototype.collect=function(){var b=this.children(),c=this;return this.reset(),b&&b.forEach(function(b){b&&b.getType()===a.enumm.TESTSUITE&&(c.collection.errors+=b.get("errors")||0,c.collection.failures+=b.get("failures")||0,c.collection.tests+=b.get("tests")||0)}),this.collection},{get:a.base.get,create:function(a){return new b(a)}}};if("undefined"!=typeof exports){if("undefined"!=typeof module&&module.exports){var _enum=Enumjs,_base=Basejs,_jsutils=js.utils,_jmrModuleTestSuites=new _jmrModuleTestSuitesClass({base:_base,jsutils:_jsutils,enumm:_enum});_jmrtssspec.type=_enum.TESTSUITES,_base.add(_jmrtssspec),module.exports=_jmrModuleTestSuites}}else var jmrModelTSuitesModule=function(a,b,c,d,e){return _jmrtssspec.type=d.TESTSUITES,e.add(_jmrtssspec),_jmrModuleTestSuites=new _jmrModuleTestSuitesClass({base:e,jsutils:{Object:jsutilsObject},enumm:d})}(typedAs,jsutils,jmrUtilsModule,jmrEnumModule,jmrBaseModule);var _jmrtsspec={spec:{disabled:void 0,errors:void 0,failures:void 0,tests:void 0,time:void 0,hostname:void 0,id:void 0,name:void 0,"package":void 0,skipped:void 0,tests:void 0,time:void 0,timestamp:void 0},tpl:"testsuite",clazz:function(){}},_jmrModuleTestSuite,_jmrModuleTestSuiteClass=function(a){function b(b){a.base.initTestClass.call(this,b)}return b.prototype.getCollection=function(){var b={};return a.jsutils.Object.copy({tests:0,failures:0,errors:0},b),b},b.prototype.reset=function(){this.collection=this.getCollection()},b.prototype.collect=function(){var b=this.children(),c=this;return this.reset(),b&&b.forEach(function(b){var d;b&&b.getType()===a.enumm.TESTCASE&&(c.collection.tests++,d=b.children(),d&&d.forEach(function(b){b&&(b.getType()===a.enumm.FAILURE?c.collection.failures++:b.getType()===a.enumm.ERROR&&c.collection.errors++)}))}),this.collection},{get:a.base.get,create:function(a){return new b(a)}}};if("undefined"!=typeof exports){if("undefined"!=typeof module&&module.exports){var _enum=Enumjs,_base=Basejs,_jsutils=js.utils,_jmrModuleTestSuite=new _jmrModuleTestSuiteClass({base:_base,jsutils:_jsutils,enumm:_enum});_jmrtsspec.type=_enum.TESTSUITE,_base.add(_jmrtsspec),module.exports=_jmrModuleTestSuite}}else var jmrModelTSuiteModule=function(a,b,c,d,e){return _jmrtsspec.type=d.TESTSUITE,e.add(_jmrtsspec),_jmrModuleTestSuite=new _jmrModuleTestSuiteClass({base:e,jsutils:{Object:jsutilsObject},enumm:d})}(typedAs,jsutils,jmrUtilsModule,jmrEnumModule,jmrBaseModule);var _jmrerrorpec={spec:{message:void 0,type:void 0},tpl:"error",clazz:function(){}},_jmrModuleError,_jmrModuleErrorClass=function(a){function b(b){a.base.initTestClass.call(this,b)}return{get:a.base.get,create:function(a){return new b(a)}}};if("undefined"!=typeof exports){if("undefined"!=typeof module&&module.exports){var _enum=Enumjs,_base=Basejs,_jsutils=js.utils,_jmrModuleError=new _jmrModuleErrorClass({base:_base,jsutils:_jsutils,enumm:_enum});_jmrerrorpec.type=_enum.ERROR,_base.add(_jmrerrorpec),module.exports=_jmrModuleError
}}else var jmrModelErrModule=function(a,b,c,d,e){return _jmrerrorpec.type=d.ERROR,e.add(_jmrerrorpec),_jmrModuleError=new _jmrModuleErrorClass({base:e,jsutils:{Object:jsutilsObject},enumm:d})}(typedAs,jsutils,jmrUtilsModule,jmrEnumModule,jmrBaseModule);var _jmrfailurepec={spec:{message:void 0,type:void 0},tpl:"failure",clazz:function(){}},_jmrModuleFailure,_jmrModuleFailureClass=function(a){function b(b){a.base.initTestClass.call(this,b)}return{get:a.base.get,create:function(a){return new b(a)}}};if("undefined"!=typeof exports){if("undefined"!=typeof module&&module.exports){var _enum=Enumjs,_base=Basejs,_jsutils=js.utils,_jmrModuleFailure=new _jmrModuleFailureClass({base:_base,jsutils:_jsutils,enumm:_enum});_jmrfailurepec.type=_enum.FAILURE,_base.add(_jmrfailurepec),module.exports=_jmrModuleFailure}}else var jmrModelFailureModule=function(a,b,c,d,e){return _jmrfailurepec.type=d.FAILURE,e.add(_jmrfailurepec),_jmrModuleFailure=new _jmrModuleFailureClass({base:e,jsutils:{Object:jsutilsObject},enumm:d})}(typedAs,jsutils,jmrUtilsModule,jmrEnumModule,jmrBaseModule);var _jmrskippedpec={spec:{},tpl:"skipped",clazz:function(){}},_jmrModuleSkipped,_jmrModuleSkippedClass=function(a){function b(b){a.base.initTestClass.call(this,b)}return{get:a.base.get,create:function(a){return new b(a)}}};if("undefined"!=typeof exports){if("undefined"!=typeof module&&module.exports){var _enum=Enumjs,_base=Basejs,_jsutils=js.utils,_jmrModuleSkipped=new _jmrModuleSkippedClass({base:_base,jsutils:_jsutils,enumm:_enum});_jmrskippedpec.type=_enum.SKIPPED,_base.add(_jmrskippedpec),module.exports=_jmrModuleSkipped}}else var jmrModelSkippedModule=function(a,b,c,d,e){return _jmrskippedpec.type=d.SKIPPED,e.add(_jmrskippedpec),_jmrModuleSkipped=new _jmrModuleSkippedClass({base:e,jsutils:{Object:jsutilsObject},enumm:d})}(typedAs,jsutils,jmrUtilsModule,jmrEnumModule,jmrBaseModule);var _jmrsystempec={spec:{systemtype:"out"},tpl:"system",clazz:function(){}},_jmrModuleSystem,_jmrModuleSystemClass=function(a){function b(b){a.base.initTestClass.call(this,b)}return{get:a.base.get,create:function(a){return new b(a)}}};if("undefined"!=typeof exports){if("undefined"!=typeof module&&module.exports){var _enum=Enumjs,_base=Basejs,_jsutils=js.utils,_jmrModuleSystem=new _jmrModuleSystemClass({base:_base,jsutils:_jsutils,enumm:_enum});_jmrsystempec.type=_enum.SYSTEM,_base.add(_jmrsystempec),module.exports=_jmrModuleSystem}}else var jmrModelSystemModule=function(a,b,c,d,e){return _jmrsystempec.type=d.SYSTEM,e.add(_jmrsystempec),_jmrModuleSystem=new _jmrModuleSystemClass({base:e,jsutils:{Object:jsutilsObject},enumm:d})}(typedAs,jsutils,jmrUtilsModule,jmrEnumModule,jmrBaseModule);var _moduleMapper=function(){var a={},b={};return{internal:function(b){a=b},init:function(){b[a.enumm.TESTSUITE]=a.tsuite,b[a.enumm.TESTSUITES]=a.tsuites,b[a.enumm.TESTCASE]=a.tcase,b[a.enumm.ERROR]=a.err,b[a.enumm.SKIPPED]=a.skipped,b[a.enumm.FAILURE]=a.failure,b[a.enumm.SYSTEM]=a.sys},map:b}}();if("undefined"!=typeof exports)"undefined"!=typeof module&&module.exports&&(_moduleMapper.internal({enumm:require("./Enum.js"),tcase:requirext("jmrModelTCaseModule"),tsuites:requirext("jmrModelTSuitesModule"),tsuite:requirext("jmrModelTSuiteModule"),err:requirext("jmrModelErrModule"),failure:requirext("jmrModelFailureModule"),skipped:requirext("jmrModelSkippedModule"),sys:requirext("jmrModelSystemModule")}),_moduleMapper.init(),module.exports=_moduleMapper.map);else var jmrMapperModule=function(a,b,c,d,e,f,g,h){return _moduleMapper.internal({enumm:a,tcase:b,tsuites:c,tsuite:d,err:e,failure:f,skipped:g,sys:h}),_moduleMapper.init(),_moduleMapper.map}(jmrEnumModule,jmrModelTCaseModule,jmrModelTSuitesModule,jmrModelTSuiteModule,jmrModelErrModule,jmrModelFailureModule,jmrModelSkippedModule,jmrModelSystemModule);var underscore,_jmrModelUtilsModule,_jmrModelUtilsModuleClass=function(a){function b(b,c){if(!a.utils.validargs(c))return void 0;var d,e=c.type,f=c.data,g=a.basem[b];return g&&(d=c.$immediate?g.call(this,{clazz:{type:c.type},data:f}):g.call(this,{type:e,data:f})),d}return{create:function(a){return b("create",a)},generate:function(a){return b("generate",a)}}};if("undefined"!=typeof exports)"undefined"!=typeof module&&module.exports&&(_jmrModelUtilsModule=new _jmrModelUtilsModuleClass({utils:requirext("jmrUtilsModule"),basem:require("./Base")}),module.exports=_jmrModelUtilsModule);else var jmrModelUtilsModule=function(a,b){return _jmrModelUtilsModule=new _jmrModelUtilsModuleClass({utils:a,basem:b})}(jmrUtilsModule,jmrBaseModule);var _jmrModule,_jmrModuleClass=function(a){function b(b,c){if(!a.utils.validargs(c))return void 0;var d=c.type;return d?a.mutils[b]?a.mutils[b](c):(a.log.warn("No such method: ",b),void 0):void 0}return{model:function(){},setReporter:function(){},create:function(a){return b("create",a)},generate:function(a){return b("generate",a)},validate:function(){return void 0},write:function(){},report:function(){}}};if("undefined"!=typeof exports){if("undefined"!=typeof module&&module.exports){var _fs=fs,_utils,_log,_path=path;!function(){var a={jmrModelErrModule:"./src/model/Error.js",jmrModelFailureModule:"./src/model/Failure.js",jmrModelSkippedModule:"./src/model/Skipped.js",jmrModelTCaseModule:"./src/model/TestCase.js",jmrModelTSuiteModule:"./src/model/TestSuite.js",jmrModelTSuitesModule:"./src/model/TestSuites.js",jmrModelSystemModule:"./src/model/System.js",jmrModelUtilsModule:"./src/model/Utils.js",jmrUtilsModule:"./src/utils/Utils.js",jmrUtilsAntModule:"./src/utils/AntUtils.js"};global.jmr={},global.jmrbase=_path.resolve("./"),global.requirext=function(b){var c=a[b];return c||_log.warn("[jmr requirext] module name is not valid according to the key: ",b),require(c)}}(),_utils=requirext("jmrUtilsModule"),_log=_utils.logger(),global.jmr.reporter=require("./src/Config.js").getReporter(),_jmrModule=new _jmrModuleClass({fs:_fs,path:_path,utils:_utils,log:_log,mutils:requirext("jmrModelUtilsModule")}),_jmrModule.setReporter=function(a){global.jmr.reporter=require("./src/Config.js").getReporter(a)},_jmrModule.report=function(a){global.jmr.reporter.report?global.jmr.reporter.report(a):_log.wraning("[TestUnitReporter] 'report' method is not supported for reporter: '"+global.jmr.reporter.get("name")+"'")},_jmrModule.write=function(a,b){a||_log.error("[TestUnitReporter] 'file' argument for method print is required"),_fs.existsSync(a)?_log.warn("[TestUnitReporter] file: ",a," already exists"):_fs.writeFileSync(a,b)},_jmrModule.validate=function(a){var b=!1;return global.jmr.reporter.validate?b=global.jmr.reporter.validate(a):_log.wraning("[TestUnitReporter] 'validate' method is not supported for reporter: '"+global.jmr.reporter.get("name")+"'"),b},module.exports=_jmrModule}}else var jmrModule=function(a,b,c){return _jmrModule=new _jmrModuleClass({utils:b,log:b.logger(),mutils:c})}(jmrConfigModule,jmrUtilsModule,jmrModelUtilsModule);var jmrweb=this;jmrweb.testModelReporter=jmrweb.jmr={};var tmrweb=function(a,b){jmrweb.testModelReporter=jmrweb.jmr=a,b.loadMapper(function(){})}(jmrModule,jmrBaseModule);;(function(){

    /**
     * Require the given path.
     *
     * @param {String} path
     * @return {Object} exports
     * @api public
     */

    function require(path, parent, orig) {
        var resolved = require.resolve(path);

        // lookup failed
        if (null == resolved) {
            orig = orig || path;
            parent = parent || 'root';
            var err = new Error('Failed to require "' + orig + '" from "' + parent + '"');
            err.path = orig;
            err.parent = parent;
            err.require = true;
            throw err;
        }

        var module = require.modules[resolved];

        // perform real require()
        // by invoking the module's
        // registered function
        if (!module._resolving && !module.exports) {
            var mod = {};
            mod.exports = {};
            mod.client = mod.component = true;
            module._resolving = true;
            module.call(this, mod.exports, require.relative(resolved), mod);
            delete module._resolving;
            module.exports = mod.exports;
        }

        return module.exports;
    }

    /**
     * Registered modules.
     */

    require.modules = {};

    /**
     * Registered aliases.
     */

    require.aliases = {};

    /**
     * Resolve `path`.
     *
     * Lookup:
     *
     *   - PATH/index.js
     *   - PATH.js
     *   - PATH
     *
     * @param {String} path
     * @return {String} path or null
     * @api private
     */

    require.resolve = function(path) {
        if (path.charAt(0) === '/') path = path.slice(1);

        var paths = [
            path,
            path + '.js',
            path + '.json',
            path + '/index.js',
            path + '/index.json'
        ];

        for (var i = 0; i < paths.length; i++) {
            var path = paths[i];
            if (require.modules.hasOwnProperty(path)) return path;
            if (require.aliases.hasOwnProperty(path)) return require.aliases[path];
        }
    };

    /**
     * Normalize `path` relative to the current path.
     *
     * @param {String} curr
     * @param {String} path
     * @return {String}
     * @api private
     */

    require.normalize = function(curr, path) {
        var segs = [];

        if ('.' != path.charAt(0)) return path;

        curr = curr.split('/');
        path = path.split('/');

        for (var i = 0; i < path.length; ++i) {
            if ('..' == path[i]) {
                curr.pop();
            } else if ('.' != path[i] && '' != path[i]) {
                segs.push(path[i]);
            }
        }

        return curr.concat(segs).join('/');
    };

    /**
     * Register module at `path` with callback `definition`.
     *
     * @param {String} path
     * @param {Function} definition
     * @api private
     */

    require.register = function(path, definition) {
        require.modules[path] = definition;
    };

    /**
     * Alias a module definition.
     *
     * @param {String} from
     * @param {String} to
     * @api private
     */

    require.alias = function(from, to) {
        if (!require.modules.hasOwnProperty(from)) {
            throw new Error('Failed to alias "' + from + '", it does not exist');
        }
        require.aliases[to] = from;
    };

    /**
     * Return a require function relative to the `parent` path.
     *
     * @param {String} parent
     * @return {Function}
     * @api private
     */

    require.relative = function(parent) {
        var p = require.normalize(parent, '..');

        /**
         * lastIndexOf helper.
         */

        function lastIndexOf(arr, obj) {
            var i = arr.length;
            while (i--) {
                if (arr[i] === obj) return i;
            }
            return -1;
        }

        /**
         * The relative require() itself.
         */

        function localRequire(path) {
            var resolved = localRequire.resolve(path);
            return require(resolved, parent, path);
        }

        /**
         * Resolve relative to the parent.
         */

        localRequire.resolve = function(path) {
            var c = path.charAt(0);
            if ('/' == c) return path.slice(1);
            if ('.' == c) return require.normalize(p, path);

            // resolve deps by returning
            // the dep in the nearest "deps"
            // directory
            var segs = parent.split('/');
            var i = lastIndexOf(segs, 'deps') + 1;
            if (!i) i = 0;
            path = segs.slice(0, i + 1).join('/') + '/deps/' + path;
            return path;
        };

        /**
         * Check if module is defined at `path`.
         */

        localRequire.exists = function(path) {
            return require.modules.hasOwnProperty(localRequire.resolve(path));
        };

        return localRequire;
    };
    require.register("chaijs-assertion-error/index.js", function(exports, require, module){
        /*!
         * assertion-error
         * Copyright(c) 2013 Jake Luer <jake@qualiancy.com>
         * MIT Licensed
         */

        /*!
         * Return a function that will copy properties from
         * one object to another excluding any originally
         * listed. Returned function will create a new `{}`.
         *
         * @param {String} excluded properties ...
         * @return {Function}
         */

        function exclude () {
            var excludes = [].slice.call(arguments);

            function excludeProps (res, obj) {
                Object.keys(obj).forEach(function (key) {
                    if (!~excludes.indexOf(key)) res[key] = obj[key];
                });
            }

            return function extendExclude () {
                var args = [].slice.call(arguments)
                    , i = 0
                    , res = {};

                for (; i < args.length; i++) {
                    excludeProps(res, args[i]);
                }

                return res;
            };
        };

        /*!
         * Primary Exports
         */

        module.exports = AssertionError;

        /**
         * ### AssertionError
         *
         * An extension of the JavaScript `Error` constructor for
         * assertion and validation scenarios.
         *
         * @param {String} message
         * @param {Object} properties to include (optional)
         * @param {callee} start stack function (optional)
         */

        function AssertionError (message, _props, ssf) {
            var extend = exclude('name', 'message', 'stack', 'constructor', 'toJSON')
                , props = extend(_props || {});

            // default values
            this.message = message || 'Unspecified AssertionError';
            this.showDiff = false;

            // copy from properties
            for (var key in props) {
                this[key] = props[key];
            }

            // capture stack trace
            ssf = ssf || arguments.callee;
            if (ssf && Error.captureStackTrace) {
                Error.captureStackTrace(this, ssf);
            }
        }

        /*!
         * Inherit from Error.prototype
         */

        AssertionError.prototype = Object.create(Error.prototype);

        /*!
         * Statically set name
         */

        AssertionError.prototype.name = 'AssertionError';

        /*!
         * Ensure correct constructor
         */

        AssertionError.prototype.constructor = AssertionError;

        /**
         * Allow errors to be converted to JSON for static transfer.
         *
         * @param {Boolean} include stack (default: `true`)
         * @return {Object} object that can be `JSON.stringify`
         */

        AssertionError.prototype.toJSON = function (stack) {
            var extend = exclude('constructor', 'toJSON', 'stack')
                , props = extend({ name: this.name }, this);

            // include stack if exists and not turned off
            if (false !== stack && this.stack) {
                props.stack = this.stack;
            }

            return props;
        };

    });
    require.register("chaijs-type-detect/lib/type.js", function(exports, require, module){
        /*!
         * type-detect
         * Copyright(c) 2013 jake luer <jake@alogicalparadox.com>
         * MIT Licensed
         */

        /*!
         * Primary Exports
         */

        var exports = module.exports = getType;

        /*!
         * Detectable javascript natives
         */

        var natives = {
            '[object Array]': 'array'
            , '[object RegExp]': 'regexp'
            , '[object Function]': 'function'
            , '[object Arguments]': 'arguments'
            , '[object Date]': 'date'
        };

        /**
         * ### typeOf (obj)
         *
         * Use several different techniques to determine
         * the type of object being tested.
         *
         *
         * @param {Mixed} object
         * @return {String} object type
         * @api public
         */

        function getType (obj) {
            var str = Object.prototype.toString.call(obj);
            if (natives[str]) return natives[str];
            if (obj === null) return 'null';
            if (obj === undefined) return 'undefined';
            if (obj === Object(obj)) return 'object';
            return typeof obj;
        }

        exports.Library = Library;

        /**
         * ### Library
         *
         * Create a repository for custom type detection.
         *
         * ```js
         * var lib = new type.Library;
         * ```
         *
         */

        function Library () {
            this.tests = {};
        }

        /**
         * #### .of (obj)
         *
         * Expose replacement `typeof` detection to the library.
         *
         * ```js
         * if ('string' === lib.of('hello world')) {
 *   // ...
 * }
         * ```
         *
         * @param {Mixed} object to test
         * @return {String} type
         */

        Library.prototype.of = getType;

        /**
         * #### .define (type, test)
         *
         * Add a test to for the `.test()` assertion.
         *
         * Can be defined as a regular expression:
         *
         * ```js
         * lib.define('int', /^[0-9]+$/);
         * ```
         *
         * ... or as a function:
         *
         * ```js
         * lib.define('bln', function (obj) {
 *   if ('boolean' === lib.of(obj)) return true;
 *   var blns = [ 'yes', 'no', 'true', 'false', 1, 0 ];
 *   if ('string' === lib.of(obj)) obj = obj.toLowerCase();
 *   return !! ~blns.indexOf(obj);
 * });
         * ```
         *
         * @param {String} type
         * @param {RegExp|Function} test
         * @api public
         */

        Library.prototype.define = function (type, test) {
            if (arguments.length === 1) return this.tests[type];
            this.tests[type] = test;
            return this;
        };

        /**
         * #### .test (obj, test)
         *
         * Assert that an object is of type. Will first
         * check natives, and if that does not pass it will
         * use the user defined custom tests.
         *
         * ```js
         * assert(lib.test('1', 'int'));
         * assert(lib.test('yes', 'bln'));
         * ```
         *
         * @param {Mixed} object
         * @param {String} type
         * @return {Boolean} result
         * @api public
         */

        Library.prototype.test = function (obj, type) {
            if (type === getType(obj)) return true;
            var test = this.tests[type];

            if (test && 'regexp' === getType(test)) {
                return test.test(obj);
            } else if (test && 'function' === getType(test)) {
                return test(obj);
            } else {
                throw new ReferenceError('Type test "' + type + '" not defined or invalid.');
            }
        };

    });
    require.register("chaijs-deep-eql/lib/eql.js", function(exports, require, module){
        /*!
         * deep-eql
         * Copyright(c) 2013 Jake Luer <jake@alogicalparadox.com>
         * MIT Licensed
         */

        /*!
         * Module dependencies
         */

        var type = require('type-detect');

        /*!
         * Buffer.isBuffer browser shim
         */

        var Buffer;
        try { Buffer = require('buffer').Buffer; }
        catch(ex) {
            Buffer = {};
            Buffer.isBuffer = function() { return false; }
        }

        /*!
         * Primary Export
         */

        module.exports = deepEqual;

        /**
         * Assert super-strict (egal) equality between
         * two objects of any type.
         *
         * @param {Mixed} a
         * @param {Mixed} b
         * @param {Array} memoised (optional)
         * @return {Boolean} equal match
         */

        function deepEqual(a, b, m) {
            if (sameValue(a, b)) {
                return true;
            } else if ('date' === type(a)) {
                return dateEqual(a, b);
            } else if ('regexp' === type(a)) {
                return regexpEqual(a, b);
            } else if (Buffer.isBuffer(a)) {
                return bufferEqual(a, b);
            } else if ('arguments' === type(a)) {
                return argumentsEqual(a, b, m);
            } else if (!typeEqual(a, b)) {
                return false;
            } else if (('object' !== type(a) && 'object' !== type(b))
                && ('array' !== type(a) && 'array' !== type(b))) {
                return sameValue(a, b);
            } else {
                return objectEqual(a, b, m);
            }
        }

        /*!
         * Strict (egal) equality test. Ensures that NaN always
         * equals NaN and `-0` does not equal `+0`.
         *
         * @param {Mixed} a
         * @param {Mixed} b
         * @return {Boolean} equal match
         */

        function sameValue(a, b) {
            if (a === b) return a !== 0 || 1 / a === 1 / b;
            return a !== a && b !== b;
        }

        /*!
         * Compare the types of two given objects and
         * return if they are equal. Note that an Array
         * has a type of `array` (not `object`) and arguments
         * have a type of `arguments` (not `array`/`object`).
         *
         * @param {Mixed} a
         * @param {Mixed} b
         * @return {Boolean} result
         */

        function typeEqual(a, b) {
            return type(a) === type(b);
        }

        /*!
         * Compare two Date objects by asserting that
         * the time values are equal using `saveValue`.
         *
         * @param {Date} a
         * @param {Date} b
         * @return {Boolean} result
         */

        function dateEqual(a, b) {
            if ('date' !== type(b)) return false;
            return sameValue(a.getTime(), b.getTime());
        }

        /*!
         * Compare two regular expressions by converting them
         * to string and checking for `sameValue`.
         *
         * @param {RegExp} a
         * @param {RegExp} b
         * @return {Boolean} result
         */

        function regexpEqual(a, b) {
            if ('regexp' !== type(b)) return false;
            return sameValue(a.toString(), b.toString());
        }

        /*!
         * Assert deep equality of two `arguments` objects.
         * Unfortunately, these must be sliced to arrays
         * prior to test to ensure no bad behavior.
         *
         * @param {Arguments} a
         * @param {Arguments} b
         * @param {Array} memoize (optional)
         * @return {Boolean} result
         */

        function argumentsEqual(a, b, m) {
            if ('arguments' !== type(b)) return false;
            a = [].slice.call(a);
            b = [].slice.call(b);
            return deepEqual(a, b, m);
        }

        /*!
         * Get enumerable properties of a given object.
         *
         * @param {Object} a
         * @return {Array} property names
         */

        function enumerable(a) {
            var res = [];
            for (var key in a) res.push(key);
            return res;
        }

        /*!
         * Simple equality for flat iterable objects
         * such as Arrays or Node.js buffers.
         *
         * @param {Iterable} a
         * @param {Iterable} b
         * @return {Boolean} result
         */

        function iterableEqual(a, b) {
            if (a.length !==  b.length) return false;

            var i = 0;
            var match = true;

            for (; i < a.length; i++) {
                if (a[i] !== b[i]) {
                    match = false;
                    break;
                }
            }

            return match;
        }

        /*!
         * Extension to `iterableEqual` specifically
         * for Node.js Buffers.
         *
         * @param {Buffer} a
         * @param {Mixed} b
         * @return {Boolean} result
         */

        function bufferEqual(a, b) {
            if (!Buffer.isBuffer(b)) return false;
            return iterableEqual(a, b);
        }

        /*!
         * Block for `objectEqual` ensuring non-existing
         * values don't get in.
         *
         * @param {Mixed} object
         * @return {Boolean} result
         */

        function isValue(a) {
            return a !== null && a !== undefined;
        }

        /*!
         * Recursively check the equality of two objects.
         * Once basic sameness has been established it will
         * defer to `deepEqual` for each enumerable key
         * in the object.
         *
         * @param {Mixed} a
         * @param {Mixed} b
         * @return {Boolean} result
         */

        function objectEqual(a, b, m) {
            if (!isValue(a) || !isValue(b)) {
                return false;
            }

            if (a.prototype !== b.prototype) {
                return false;
            }

            var i;
            if (m) {
                for (i = 0; i < m.length; i++) {
                    if ((m[i][0] === a && m[i][1] === b)
                        ||  (m[i][0] === b && m[i][1] === a)) {
                        return true;
                    }
                }
            } else {
                m = [];
            }

            try {
                var ka = enumerable(a);
                var kb = enumerable(b);
            } catch (ex) {
                return false;
            }

            ka.sort();
            kb.sort();

            if (!iterableEqual(ka, kb)) {
                return false;
            }

            m.push([ a, b ]);

            var key;
            for (i = ka.length - 1; i >= 0; i--) {
                key = ka[i];
                if (!deepEqual(a[key], b[key], m)) {
                    return false;
                }
            }

            return true;
        }

    });
    require.register("chai/index.js", function(exports, require, module){
        module.exports = require('./lib/chai');

    });
    require.register("chai/lib/chai.js", function(exports, require, module){
        /*!
         * chai
         * Copyright(c) 2011-2013 Jake Luer <jake@alogicalparadox.com>
         * MIT Licensed
         */

        var used = []
            , exports = module.exports = {};

        /*!
         * Chai version
         */

        exports.version = '1.8.1';

        /*!
         * Assertion Error
         */

        exports.AssertionError = require('assertion-error');

        /*!
         * Utils for plugins (not exported)
         */

        var util = require('./chai/utils');

        /**
         * # .use(function)
         *
         * Provides a way to extend the internals of Chai
         *
         * @param {Function}
         * @returns {this} for chaining
         * @api public
         */

        exports.use = function (fn) {
            if (!~used.indexOf(fn)) {
                fn(this, util);
                used.push(fn);
            }

            return this;
        };

        /*!
         * Primary `Assertion` prototype
         */

        var assertion = require('./chai/assertion');
        exports.use(assertion);

        /*!
         * Core Assertions
         */

        var core = require('./chai/core/assertions');
        exports.use(core);

        /*!
         * Expect interface
         */

        var expect = require('./chai/interface/expect');
        exports.use(expect);

        /*!
         * Should interface
         */

        var should = require('./chai/interface/should');
        exports.use(should);

        /*!
         * Assert interface
         */

        var assert = require('./chai/interface/assert');
        exports.use(assert);

    });
    require.register("chai/lib/chai/assertion.js", function(exports, require, module){
        /*!
         * chai
         * http://chaijs.com
         * Copyright(c) 2011-2013 Jake Luer <jake@alogicalparadox.com>
         * MIT Licensed
         */

        module.exports = function (_chai, util) {
            /*!
             * Module dependencies.
             */

            var AssertionError = _chai.AssertionError
                , flag = util.flag;

            /*!
             * Module export.
             */

            _chai.Assertion = Assertion;

            /*!
             * Assertion Constructor
             *
             * Creates object for chaining.
             *
             * @api private
             */

            function Assertion (obj, msg, stack) {
                flag(this, 'ssfi', stack || arguments.callee);
                flag(this, 'object', obj);
                flag(this, 'message', msg);
            }

            /*!
             * ### Assertion.includeStack
             *
             * User configurable property, influences whether stack trace
             * is included in Assertion error message. Default of false
             * suppresses stack trace in the error message
             *
             *     Assertion.includeStack = true;  // enable stack on error
             *
             * @api public
             */

            Assertion.includeStack = false;

            /*!
             * ### Assertion.showDiff
             *
             * User configurable property, influences whether or not
             * the `showDiff` flag should be included in the thrown
             * AssertionErrors. `false` will always be `false`; `true`
             * will be true when the assertion has requested a diff
             * be shown.
             *
             * @api public
             */

            Assertion.showDiff = true;

            Assertion.addProperty = function (name, fn) {
                util.addProperty(this.prototype, name, fn);
            };

            Assertion.addMethod = function (name, fn) {
                util.addMethod(this.prototype, name, fn);
            };

            Assertion.addChainableMethod = function (name, fn, chainingBehavior) {
                util.addChainableMethod(this.prototype, name, fn, chainingBehavior);
            };

            Assertion.overwriteProperty = function (name, fn) {
                util.overwriteProperty(this.prototype, name, fn);
            };

            Assertion.overwriteMethod = function (name, fn) {
                util.overwriteMethod(this.prototype, name, fn);
            };

            /*!
             * ### .assert(expression, message, negateMessage, expected, actual)
             *
             * Executes an expression and check expectations. Throws AssertionError for reporting if test doesn't pass.
             *
             * @name assert
             * @param {Philosophical} expression to be tested
             * @param {String} message to display if fails
             * @param {String} negatedMessage to display if negated expression fails
             * @param {Mixed} expected value (remember to check for negation)
             * @param {Mixed} actual (optional) will default to `this.obj`
             * @api private
             */

            Assertion.prototype.assert = function (expr, msg, negateMsg, expected, _actual, showDiff) {
                var ok = util.test(this, arguments);
                if (true !== showDiff) showDiff = false;
                if (true !== Assertion.showDiff) showDiff = false;

                if (!ok) {
                    var msg = util.getMessage(this, arguments)
                        , actual = util.getActual(this, arguments);
                    throw new AssertionError(msg, {
                        actual: actual
                        , expected: expected
                        , showDiff: showDiff
                    }, (Assertion.includeStack) ? this.assert : flag(this, 'ssfi'));
                }
            };

            /*!
             * ### ._obj
             *
             * Quick reference to stored `actual` value for plugin developers.
             *
             * @api private
             */

            Object.defineProperty(Assertion.prototype, '_obj',
                { get: function () {
                    return flag(this, 'object');
                }
                    , set: function (val) {
                    flag(this, 'object', val);
                }
                });
        };

    });
    require.register("chai/lib/chai/core/assertions.js", function(exports, require, module){
        /*!
         * chai
         * http://chaijs.com
         * Copyright(c) 2011-2013 Jake Luer <jake@alogicalparadox.com>
         * MIT Licensed
         */

        module.exports = function (chai, _) {
            var Assertion = chai.Assertion
                , toString = Object.prototype.toString
                , flag = _.flag;

            /**
             * ### Language Chains
             *
             * The following are provide as chainable getters to
             * improve the readability of your assertions. They
             * do not provide an testing capability unless they
             * have been overwritten by a plugin.
             *
             * **Chains**
             *
             * - to
             * - be
             * - been
             * - is
             * - that
             * - and
             * - have
             * - with
             * - at
             * - of
             * - same
             *
             * @name language chains
             * @api public
             */

            [ 'to', 'be', 'been'
                , 'is', 'and', 'have'
                , 'with', 'that', 'at'
                , 'of', 'same' ].forEach(function (chain) {
                    Assertion.addProperty(chain, function () {
                        return this;
                    });
                });

            /**
             * ### .not
             *
             * Negates any of assertions following in the chain.
             *
             *     expect(foo).to.not.equal('bar');
             *     expect(goodFn).to.not.throw(Error);
             *     expect({ foo: 'baz' }).to.have.property('foo')
             *       .and.not.equal('bar');
             *
             * @name not
             * @api public
             */

            Assertion.addProperty('not', function () {
                flag(this, 'negate', true);
            });

            /**
             * ### .deep
             *
             * Sets the `deep` flag, later used by the `equal` and
             * `property` assertions.
             *
             *     expect(foo).to.deep.equal({ bar: 'baz' });
             *     expect({ foo: { bar: { baz: 'quux' } } })
             *       .to.have.deep.property('foo.bar.baz', 'quux');
             *
             * @name deep
             * @api public
             */

            Assertion.addProperty('deep', function () {
                flag(this, 'deep', true);
            });

            /**
             * ### .a(type)
             *
             * The `a` and `an` assertions are aliases that can be
             * used either as language chains or to assert a value's
             * type.
             *
             *     // typeof
             *     expect('test').to.be.a('string');
             *     expect({ foo: 'bar' }).to.be.an('object');
             *     expect(null).to.be.a('null');
             *     expect(undefined).to.be.an('undefined');
             *
             *     // language chain
             *     expect(foo).to.be.an.instanceof(Foo);
             *
             * @name a
             * @alias an
             * @param {String} type
             * @param {String} message _optional_
             * @api public
             */

            function an (type, msg) {
                if (msg) flag(this, 'message', msg);
                type = type.toLowerCase();
                var obj = flag(this, 'object')
                    , article = ~[ 'a', 'e', 'i', 'o', 'u' ].indexOf(type.charAt(0)) ? 'an ' : 'a ';

                this.assert(
                    type === _.type(obj)
                    , 'expected #{this} to be ' + article + type
                    , 'expected #{this} not to be ' + article + type
                );
            }

            Assertion.addChainableMethod('an', an);
            Assertion.addChainableMethod('a', an);

            /**
             * ### .include(value)
             *
             * The `include` and `contain` assertions can be used as either property
             * based language chains or as methods to assert the inclusion of an object
             * in an array or a substring in a string. When used as language chains,
             * they toggle the `contain` flag for the `keys` assertion.
             *
             *     expect([1,2,3]).to.include(2);
             *     expect('foobar').to.contain('foo');
             *     expect({ foo: 'bar', hello: 'universe' }).to.include.keys('foo');
             *
             * @name include
             * @alias contain
             * @param {Object|String|Number} obj
             * @param {String} message _optional_
             * @api public
             */

            function includeChainingBehavior () {
                flag(this, 'contains', true);
            }

            function include (val, msg) {
                if (msg) flag(this, 'message', msg);
                var obj = flag(this, 'object')
                this.assert(
                    ~obj.indexOf(val)
                    , 'expected #{this} to include ' + _.inspect(val)
                    , 'expected #{this} to not include ' + _.inspect(val));
            }

            Assertion.addChainableMethod('include', include, includeChainingBehavior);
            Assertion.addChainableMethod('contain', include, includeChainingBehavior);

            /**
             * ### .ok
             *
             * Asserts that the target is truthy.
             *
             *     expect('everthing').to.be.ok;
             *     expect(1).to.be.ok;
             *     expect(false).to.not.be.ok;
             *     expect(undefined).to.not.be.ok;
             *     expect(null).to.not.be.ok;
             *
             * @name ok
             * @api public
             */

            Assertion.addProperty('ok', function () {
                this.assert(
                    flag(this, 'object')
                    , 'expected #{this} to be truthy'
                    , 'expected #{this} to be falsy');
            });

            /**
             * ### .true
             *
             * Asserts that the target is `true`.
             *
             *     expect(true).to.be.true;
             *     expect(1).to.not.be.true;
             *
             * @name true
             * @api public
             */

            Assertion.addProperty('true', function () {
                this.assert(
                    true === flag(this, 'object')
                    , 'expected #{this} to be true'
                    , 'expected #{this} to be false'
                    , this.negate ? false : true
                );
            });

            /**
             * ### .false
             *
             * Asserts that the target is `false`.
             *
             *     expect(false).to.be.false;
             *     expect(0).to.not.be.false;
             *
             * @name false
             * @api public
             */

            Assertion.addProperty('false', function () {
                this.assert(
                    false === flag(this, 'object')
                    , 'expected #{this} to be false'
                    , 'expected #{this} to be true'
                    , this.negate ? true : false
                );
            });

            /**
             * ### .null
             *
             * Asserts that the target is `null`.
             *
             *     expect(null).to.be.null;
             *     expect(undefined).not.to.be.null;
             *
             * @name null
             * @api public
             */

            Assertion.addProperty('null', function () {
                this.assert(
                    null === flag(this, 'object')
                    , 'expected #{this} to be null'
                    , 'expected #{this} not to be null'
                );
            });

            /**
             * ### .undefined
             *
             * Asserts that the target is `undefined`.
             *
             *     expect(undefined).to.be.undefined;
             *     expect(null).to.not.be.undefined;
             *
             * @name undefined
             * @api public
             */

            Assertion.addProperty('undefined', function () {
                this.assert(
                    undefined === flag(this, 'object')
                    , 'expected #{this} to be undefined'
                    , 'expected #{this} not to be undefined'
                );
            });

            /**
             * ### .exist
             *
             * Asserts that the target is neither `null` nor `undefined`.
             *
             *     var foo = 'hi'
             *       , bar = null
             *       , baz;
             *
             *     expect(foo).to.exist;
             *     expect(bar).to.not.exist;
             *     expect(baz).to.not.exist;
             *
             * @name exist
             * @api public
             */

            Assertion.addProperty('exist', function () {
                this.assert(
                    null != flag(this, 'object')
                    , 'expected #{this} to exist'
                    , 'expected #{this} to not exist'
                );
            });


            /**
             * ### .empty
             *
             * Asserts that the target's length is `0`. For arrays, it checks
             * the `length` property. For objects, it gets the count of
             * enumerable keys.
             *
             *     expect([]).to.be.empty;
             *     expect('').to.be.empty;
             *     expect({}).to.be.empty;
             *
             * @name empty
             * @api public
             */

            Assertion.addProperty('empty', function () {
                var obj = flag(this, 'object')
                    , expected = obj;

                if (Array.isArray(obj) || 'string' === typeof object) {
                    expected = obj.length;
                } else if (typeof obj === 'object') {
                    expected = Object.keys(obj).length;
                }

                this.assert(
                    !expected
                    , 'expected #{this} to be empty'
                    , 'expected #{this} not to be empty'
                );
            });

            /**
             * ### .arguments
             *
             * Asserts that the target is an arguments object.
             *
             *     function test () {
   *       expect(arguments).to.be.arguments;
   *     }
             *
             * @name arguments
             * @alias Arguments
             * @api public
             */

            function checkArguments () {
                var obj = flag(this, 'object')
                    , type = Object.prototype.toString.call(obj);
                this.assert(
                    '[object Arguments]' === type
                    , 'expected #{this} to be arguments but got ' + type
                    , 'expected #{this} to not be arguments'
                );
            }

            Assertion.addProperty('arguments', checkArguments);
            Assertion.addProperty('Arguments', checkArguments);

            /**
             * ### .equal(value)
             *
             * Asserts that the target is strictly equal (`===`) to `value`.
             * Alternately, if the `deep` flag is set, asserts that
             * the target is deeply equal to `value`.
             *
             *     expect('hello').to.equal('hello');
             *     expect(42).to.equal(42);
             *     expect(1).to.not.equal(true);
             *     expect({ foo: 'bar' }).to.not.equal({ foo: 'bar' });
             *     expect({ foo: 'bar' }).to.deep.equal({ foo: 'bar' });
             *
             * @name equal
             * @alias equals
             * @alias eq
             * @alias deep.equal
             * @param {Mixed} value
             * @param {String} message _optional_
             * @api public
             */

            function assertEqual (val, msg) {
                if (msg) flag(this, 'message', msg);
                var obj = flag(this, 'object');
                if (flag(this, 'deep')) {
                    return this.eql(val);
                } else {
                    this.assert(
                        val === obj
                        , 'expected #{this} to equal #{exp}'
                        , 'expected #{this} to not equal #{exp}'
                        , val
                        , this._obj
                        , true
                    );
                }
            }

            Assertion.addMethod('equal', assertEqual);
            Assertion.addMethod('equals', assertEqual);
            Assertion.addMethod('eq', assertEqual);

            /**
             * ### .eql(value)
             *
             * Asserts that the target is deeply equal to `value`.
             *
             *     expect({ foo: 'bar' }).to.eql({ foo: 'bar' });
             *     expect([ 1, 2, 3 ]).to.eql([ 1, 2, 3 ]);
             *
             * @name eql
             * @alias eqls
             * @param {Mixed} value
             * @param {String} message _optional_
             * @api public
             */

            function assertEql(obj, msg) {
                if (msg) flag(this, 'message', msg);
                this.assert(
                    _.eql(obj, flag(this, 'object'))
                    , 'expected #{this} to deeply equal #{exp}'
                    , 'expected #{this} to not deeply equal #{exp}'
                    , obj
                    , this._obj
                    , true
                );
            }

            Assertion.addMethod('eql', assertEql);
            Assertion.addMethod('eqls', assertEql);

            /**
             * ### .above(value)
             *
             * Asserts that the target is greater than `value`.
             *
             *     expect(10).to.be.above(5);
             *
             * Can also be used in conjunction with `length` to
             * assert a minimum length. The benefit being a
             * more informative error message than if the length
             * was supplied directly.
             *
             *     expect('foo').to.have.length.above(2);
             *     expect([ 1, 2, 3 ]).to.have.length.above(2);
             *
             * @name above
             * @alias gt
             * @alias greaterThan
             * @param {Number} value
             * @param {String} message _optional_
             * @api public
             */

            function assertAbove (n, msg) {
                if (msg) flag(this, 'message', msg);
                var obj = flag(this, 'object');
                if (flag(this, 'doLength')) {
                    new Assertion(obj, msg).to.have.property('length');
                    var len = obj.length;
                    this.assert(
                        len > n
                        , 'expected #{this} to have a length above #{exp} but got #{act}'
                        , 'expected #{this} to not have a length above #{exp}'
                        , n
                        , len
                    );
                } else {
                    this.assert(
                        obj > n
                        , 'expected #{this} to be above ' + n
                        , 'expected #{this} to be at most ' + n
                    );
                }
            }

            Assertion.addMethod('above', assertAbove);
            Assertion.addMethod('gt', assertAbove);
            Assertion.addMethod('greaterThan', assertAbove);

            /**
             * ### .least(value)
             *
             * Asserts that the target is greater than or equal to `value`.
             *
             *     expect(10).to.be.at.least(10);
             *
             * Can also be used in conjunction with `length` to
             * assert a minimum length. The benefit being a
             * more informative error message than if the length
             * was supplied directly.
             *
             *     expect('foo').to.have.length.of.at.least(2);
             *     expect([ 1, 2, 3 ]).to.have.length.of.at.least(3);
             *
             * @name least
             * @alias gte
             * @param {Number} value
             * @param {String} message _optional_
             * @api public
             */

            function assertLeast (n, msg) {
                if (msg) flag(this, 'message', msg);
                var obj = flag(this, 'object');
                if (flag(this, 'doLength')) {
                    new Assertion(obj, msg).to.have.property('length');
                    var len = obj.length;
                    this.assert(
                        len >= n
                        , 'expected #{this} to have a length at least #{exp} but got #{act}'
                        , 'expected #{this} to have a length below #{exp}'
                        , n
                        , len
                    );
                } else {
                    this.assert(
                        obj >= n
                        , 'expected #{this} to be at least ' + n
                        , 'expected #{this} to be below ' + n
                    );
                }
            }

            Assertion.addMethod('least', assertLeast);
            Assertion.addMethod('gte', assertLeast);

            /**
             * ### .below(value)
             *
             * Asserts that the target is less than `value`.
             *
             *     expect(5).to.be.below(10);
             *
             * Can also be used in conjunction with `length` to
             * assert a maximum length. The benefit being a
             * more informative error message than if the length
             * was supplied directly.
             *
             *     expect('foo').to.have.length.below(4);
             *     expect([ 1, 2, 3 ]).to.have.length.below(4);
             *
             * @name below
             * @alias lt
             * @alias lessThan
             * @param {Number} value
             * @param {String} message _optional_
             * @api public
             */

            function assertBelow (n, msg) {
                if (msg) flag(this, 'message', msg);
                var obj = flag(this, 'object');
                if (flag(this, 'doLength')) {
                    new Assertion(obj, msg).to.have.property('length');
                    var len = obj.length;
                    this.assert(
                        len < n
                        , 'expected #{this} to have a length below #{exp} but got #{act}'
                        , 'expected #{this} to not have a length below #{exp}'
                        , n
                        , len
                    );
                } else {
                    this.assert(
                        obj < n
                        , 'expected #{this} to be below ' + n
                        , 'expected #{this} to be at least ' + n
                    );
                }
            }

            Assertion.addMethod('below', assertBelow);
            Assertion.addMethod('lt', assertBelow);
            Assertion.addMethod('lessThan', assertBelow);

            /**
             * ### .most(value)
             *
             * Asserts that the target is less than or equal to `value`.
             *
             *     expect(5).to.be.at.most(5);
             *
             * Can also be used in conjunction with `length` to
             * assert a maximum length. The benefit being a
             * more informative error message than if the length
             * was supplied directly.
             *
             *     expect('foo').to.have.length.of.at.most(4);
             *     expect([ 1, 2, 3 ]).to.have.length.of.at.most(3);
             *
             * @name most
             * @alias lte
             * @param {Number} value
             * @param {String} message _optional_
             * @api public
             */

            function assertMost (n, msg) {
                if (msg) flag(this, 'message', msg);
                var obj = flag(this, 'object');
                if (flag(this, 'doLength')) {
                    new Assertion(obj, msg).to.have.property('length');
                    var len = obj.length;
                    this.assert(
                        len <= n
                        , 'expected #{this} to have a length at most #{exp} but got #{act}'
                        , 'expected #{this} to have a length above #{exp}'
                        , n
                        , len
                    );
                } else {
                    this.assert(
                        obj <= n
                        , 'expected #{this} to be at most ' + n
                        , 'expected #{this} to be above ' + n
                    );
                }
            }

            Assertion.addMethod('most', assertMost);
            Assertion.addMethod('lte', assertMost);

            /**
             * ### .within(start, finish)
             *
             * Asserts that the target is within a range.
             *
             *     expect(7).to.be.within(5,10);
             *
             * Can also be used in conjunction with `length` to
             * assert a length range. The benefit being a
             * more informative error message than if the length
             * was supplied directly.
             *
             *     expect('foo').to.have.length.within(2,4);
             *     expect([ 1, 2, 3 ]).to.have.length.within(2,4);
             *
             * @name within
             * @param {Number} start lowerbound inclusive
             * @param {Number} finish upperbound inclusive
             * @param {String} message _optional_
             * @api public
             */

            Assertion.addMethod('within', function (start, finish, msg) {
                if (msg) flag(this, 'message', msg);
                var obj = flag(this, 'object')
                    , range = start + '..' + finish;
                if (flag(this, 'doLength')) {
                    new Assertion(obj, msg).to.have.property('length');
                    var len = obj.length;
                    this.assert(
                        len >= start && len <= finish
                        , 'expected #{this} to have a length within ' + range
                        , 'expected #{this} to not have a length within ' + range
                    );
                } else {
                    this.assert(
                        obj >= start && obj <= finish
                        , 'expected #{this} to be within ' + range
                        , 'expected #{this} to not be within ' + range
                    );
                }
            });

            /**
             * ### .instanceof(constructor)
             *
             * Asserts that the target is an instance of `constructor`.
             *
             *     var Tea = function (name) { this.name = name; }
             *       , Chai = new Tea('chai');
             *
             *     expect(Chai).to.be.an.instanceof(Tea);
             *     expect([ 1, 2, 3 ]).to.be.instanceof(Array);
             *
             * @name instanceof
             * @param {Constructor} constructor
             * @param {String} message _optional_
             * @alias instanceOf
             * @api public
             */

            function assertInstanceOf (constructor, msg) {
                if (msg) flag(this, 'message', msg);
                var name = _.getName(constructor);
                this.assert(
                    flag(this, 'object') instanceof constructor
                    , 'expected #{this} to be an instance of ' + name
                    , 'expected #{this} to not be an instance of ' + name
                );
            };

            Assertion.addMethod('instanceof', assertInstanceOf);
            Assertion.addMethod('instanceOf', assertInstanceOf);

            /**
             * ### .property(name, [value])
             *
             * Asserts that the target has a property `name`, optionally asserting that
             * the value of that property is strictly equal to  `value`.
             * If the `deep` flag is set, you can use dot- and bracket-notation for deep
             * references into objects and arrays.
             *
             *     // simple referencing
             *     var obj = { foo: 'bar' };
             *     expect(obj).to.have.property('foo');
             *     expect(obj).to.have.property('foo', 'bar');
             *
             *     // deep referencing
             *     var deepObj = {
   *         green: { tea: 'matcha' }
   *       , teas: [ 'chai', 'matcha', { tea: 'konacha' } ]
   *     };

             *     expect(deepObj).to.have.deep.property('green.tea', 'matcha');
             *     expect(deepObj).to.have.deep.property('teas[1]', 'matcha');
             *     expect(deepObj).to.have.deep.property('teas[2].tea', 'konacha');
             *
             * You can also use an array as the starting point of a `deep.property`
             * assertion, or traverse nested arrays.
             *
             *     var arr = [
             *         [ 'chai', 'matcha', 'konacha' ]
             *       , [ { tea: 'chai' }
             *         , { tea: 'matcha' }
             *         , { tea: 'konacha' } ]
             *     ];
             *
             *     expect(arr).to.have.deep.property('[0][1]', 'matcha');
             *     expect(arr).to.have.deep.property('[1][2].tea', 'konacha');
             *
             * Furthermore, `property` changes the subject of the assertion
             * to be the value of that property from the original object. This
             * permits for further chainable assertions on that property.
             *
             *     expect(obj).to.have.property('foo')
             *       .that.is.a('string');
             *     expect(deepObj).to.have.property('green')
             *       .that.is.an('object')
             *       .that.deep.equals({ tea: 'matcha' });
             *     expect(deepObj).to.have.property('teas')
             *       .that.is.an('array')
             *       .with.deep.property('[2]')
             *         .that.deep.equals({ tea: 'konacha' });
             *
             * @name property
             * @alias deep.property
             * @param {String} name
             * @param {Mixed} value (optional)
             * @param {String} message _optional_
             * @returns value of property for chaining
             * @api public
             */

            Assertion.addMethod('property', function (name, val, msg) {
                if (msg) flag(this, 'message', msg);

                var descriptor = flag(this, 'deep') ? 'deep property ' : 'property '
                    , negate = flag(this, 'negate')
                    , obj = flag(this, 'object')
                    , value = flag(this, 'deep')
                        ? _.getPathValue(name, obj)
                        : obj[name];

                if (negate && undefined !== val) {
                    if (undefined === value) {
                        msg = (msg != null) ? msg + ': ' : '';
                        throw new Error(msg + _.inspect(obj) + ' has no ' + descriptor + _.inspect(name));
                    }
                } else {
                    this.assert(
                        undefined !== value
                        , 'expected #{this} to have a ' + descriptor + _.inspect(name)
                        , 'expected #{this} to not have ' + descriptor + _.inspect(name));
                }

                if (undefined !== val) {
                    this.assert(
                        val === value
                        , 'expected #{this} to have a ' + descriptor + _.inspect(name) + ' of #{exp}, but got #{act}'
                        , 'expected #{this} to not have a ' + descriptor + _.inspect(name) + ' of #{act}'
                        , val
                        , value
                    );
                }

                flag(this, 'object', value);
            });


            /**
             * ### .ownProperty(name)
             *
             * Asserts that the target has an own property `name`.
             *
             *     expect('test').to.have.ownProperty('length');
             *
             * @name ownProperty
             * @alias haveOwnProperty
             * @param {String} name
             * @param {String} message _optional_
             * @api public
             */

            function assertOwnProperty (name, msg) {
                if (msg) flag(this, 'message', msg);
                var obj = flag(this, 'object');
                this.assert(
                    obj.hasOwnProperty(name)
                    , 'expected #{this} to have own property ' + _.inspect(name)
                    , 'expected #{this} to not have own property ' + _.inspect(name)
                );
            }

            Assertion.addMethod('ownProperty', assertOwnProperty);
            Assertion.addMethod('haveOwnProperty', assertOwnProperty);

            /**
             * ### .length(value)
             *
             * Asserts that the target's `length` property has
             * the expected value.
             *
             *     expect([ 1, 2, 3]).to.have.length(3);
             *     expect('foobar').to.have.length(6);
             *
             * Can also be used as a chain precursor to a value
             * comparison for the length property.
             *
             *     expect('foo').to.have.length.above(2);
             *     expect([ 1, 2, 3 ]).to.have.length.above(2);
             *     expect('foo').to.have.length.below(4);
             *     expect([ 1, 2, 3 ]).to.have.length.below(4);
             *     expect('foo').to.have.length.within(2,4);
             *     expect([ 1, 2, 3 ]).to.have.length.within(2,4);
             *
             * @name length
             * @alias lengthOf
             * @param {Number} length
             * @param {String} message _optional_
             * @api public
             */

            function assertLengthChain () {
                flag(this, 'doLength', true);
            }

            function assertLength (n, msg) {
                if (msg) flag(this, 'message', msg);
                var obj = flag(this, 'object');
                new Assertion(obj, msg).to.have.property('length');
                var len = obj.length;

                this.assert(
                    len == n
                    , 'expected #{this} to have a length of #{exp} but got #{act}'
                    , 'expected #{this} to not have a length of #{act}'
                    , n
                    , len
                );
            }

            Assertion.addChainableMethod('length', assertLength, assertLengthChain);
            Assertion.addMethod('lengthOf', assertLength, assertLengthChain);

            /**
             * ### .match(regexp)
             *
             * Asserts that the target matches a regular expression.
             *
             *     expect('foobar').to.match(/^foo/);
             *
             * @name match
             * @param {RegExp} RegularExpression
             * @param {String} message _optional_
             * @api public
             */

            Assertion.addMethod('match', function (re, msg) {
                if (msg) flag(this, 'message', msg);
                var obj = flag(this, 'object');
                this.assert(
                    re.exec(obj)
                    , 'expected #{this} to match ' + re
                    , 'expected #{this} not to match ' + re
                );
            });

            /**
             * ### .string(string)
             *
             * Asserts that the string target contains another string.
             *
             *     expect('foobar').to.have.string('bar');
             *
             * @name string
             * @param {String} string
             * @param {String} message _optional_
             * @api public
             */

            Assertion.addMethod('string', function (str, msg) {
                if (msg) flag(this, 'message', msg);
                var obj = flag(this, 'object');
                new Assertion(obj, msg).is.a('string');

                this.assert(
                    ~obj.indexOf(str)
                    , 'expected #{this} to contain ' + _.inspect(str)
                    , 'expected #{this} to not contain ' + _.inspect(str)
                );
            });


            /**
             * ### .keys(key1, [key2], [...])
             *
             * Asserts that the target has exactly the given keys, or
             * asserts the inclusion of some keys when using the
             * `include` or `contain` modifiers.
             *
             *     expect({ foo: 1, bar: 2 }).to.have.keys(['foo', 'bar']);
             *     expect({ foo: 1, bar: 2, baz: 3 }).to.contain.keys('foo', 'bar');
             *
             * @name keys
             * @alias key
             * @param {String...|Array} keys
             * @api public
             */

            function assertKeys (keys) {
                var obj = flag(this, 'object')
                    , str
                    , ok = true;

                keys = keys instanceof Array
                    ? keys
                    : Array.prototype.slice.call(arguments);

                if (!keys.length) throw new Error('keys required');

                var actual = Object.keys(obj)
                    , len = keys.length;

                // Inclusion
                ok = keys.every(function(key){
                    return ~actual.indexOf(key);
                });

                // Strict
                if (!flag(this, 'negate') && !flag(this, 'contains')) {
                    ok = ok && keys.length == actual.length;
                }

                // Key string
                if (len > 1) {
                    keys = keys.map(function(key){
                        return _.inspect(key);
                    });
                    var last = keys.pop();
                    str = keys.join(', ') + ', and ' + last;
                } else {
                    str = _.inspect(keys[0]);
                }

                // Form
                str = (len > 1 ? 'keys ' : 'key ') + str;

                // Have / include
                str = (flag(this, 'contains') ? 'contain ' : 'have ') + str;

                // Assertion
                this.assert(
                    ok
                    , 'expected #{this} to ' + str
                    , 'expected #{this} to not ' + str
                );
            }

            Assertion.addMethod('keys', assertKeys);
            Assertion.addMethod('key', assertKeys);

            /**
             * ### .throw(constructor)
             *
             * Asserts that the function target will throw a specific error, or specific type of error
             * (as determined using `instanceof`), optionally with a RegExp or string inclusion test
             * for the error's message.
             *
             *     var err = new ReferenceError('This is a bad function.');
             *     var fn = function () { throw err; }
             *     expect(fn).to.throw(ReferenceError);
             *     expect(fn).to.throw(Error);
             *     expect(fn).to.throw(/bad function/);
             *     expect(fn).to.not.throw('good function');
             *     expect(fn).to.throw(ReferenceError, /bad function/);
             *     expect(fn).to.throw(err);
             *     expect(fn).to.not.throw(new RangeError('Out of range.'));
             *
             * Please note that when a throw expectation is negated, it will check each
             * parameter independently, starting with error constructor type. The appropriate way
             * to check for the existence of a type of error but for a message that does not match
             * is to use `and`.
             *
             *     expect(fn).to.throw(ReferenceError)
             *        .and.not.throw(/good function/);
             *
             * @name throw
             * @alias throws
             * @alias Throw
             * @param {ErrorConstructor} constructor
             * @param {String|RegExp} expected error message
             * @param {String} message _optional_
             * @see https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Error#Error_types
             * @api public
             */

            function assertThrows (constructor, errMsg, msg) {
                if (msg) flag(this, 'message', msg);
                var obj = flag(this, 'object');
                new Assertion(obj, msg).is.a('function');

                var thrown = false
                    , desiredError = null
                    , name = null
                    , thrownError = null;

                if (arguments.length === 0) {
                    errMsg = null;
                    constructor = null;
                } else if (constructor && (constructor instanceof RegExp || 'string' === typeof constructor)) {
                    errMsg = constructor;
                    constructor = null;
                } else if (constructor && constructor instanceof Error) {
                    desiredError = constructor;
                    constructor = null;
                    errMsg = null;
                } else if (typeof constructor === 'function') {
                    name = (new constructor()).name;
                } else {
                    constructor = null;
                }

                try {
                    obj();
                } catch (err) {
                    // first, check desired error
                    if (desiredError) {
                        this.assert(
                            err === desiredError
                            , 'expected #{this} to throw #{exp} but #{act} was thrown'
                            , 'expected #{this} to not throw #{exp}'
                            , desiredError
                            , err
                        );

                        return this;
                    }
                    // next, check constructor
                    if (constructor) {
                        this.assert(
                            err instanceof constructor
                            , 'expected #{this} to throw #{exp} but #{act} was thrown'
                            , 'expected #{this} to not throw #{exp} but #{act} was thrown'
                            , name
                            , err
                        );

                        if (!errMsg) return this;
                    }
                    // next, check message
                    var message = 'object' === _.type(err) && "message" in err
                        ? err.message
                        : '' + err;

                    if ((message != null) && errMsg && errMsg instanceof RegExp) {
                        this.assert(
                            errMsg.exec(message)
                            , 'expected #{this} to throw error matching #{exp} but got #{act}'
                            , 'expected #{this} to throw error not matching #{exp}'
                            , errMsg
                            , message
                        );

                        return this;
                    } else if ((message != null) && errMsg && 'string' === typeof errMsg) {
                        this.assert(
                            ~message.indexOf(errMsg)
                            , 'expected #{this} to throw error including #{exp} but got #{act}'
                            , 'expected #{this} to throw error not including #{act}'
                            , errMsg
                            , message
                        );

                        return this;
                    } else {
                        thrown = true;
                        thrownError = err;
                    }
                }

                var actuallyGot = ''
                    , expectedThrown = name !== null
                        ? name
                        : desiredError
                        ? '#{exp}' //_.inspect(desiredError)
                        : 'an error';

                if (thrown) {
                    actuallyGot = ' but #{act} was thrown'
                }

                this.assert(
                    thrown === true
                    , 'expected #{this} to throw ' + expectedThrown + actuallyGot
                    , 'expected #{this} to not throw ' + expectedThrown + actuallyGot
                    , desiredError
                    , thrownError
                );
            };

            Assertion.addMethod('throw', assertThrows);
            Assertion.addMethod('throws', assertThrows);
            Assertion.addMethod('Throw', assertThrows);

            /**
             * ### .respondTo(method)
             *
             * Asserts that the object or class target will respond to a method.
             *
             *     Klass.prototype.bar = function(){};
             *     expect(Klass).to.respondTo('bar');
             *     expect(obj).to.respondTo('bar');
             *
             * To check if a constructor will respond to a static function,
             * set the `itself` flag.
             *
             *     Klass.baz = function(){};
             *     expect(Klass).itself.to.respondTo('baz');
             *
             * @name respondTo
             * @param {String} method
             * @param {String} message _optional_
             * @api public
             */

            Assertion.addMethod('respondTo', function (method, msg) {
                if (msg) flag(this, 'message', msg);
                var obj = flag(this, 'object')
                    , itself = flag(this, 'itself')
                    , context = ('function' === _.type(obj) && !itself)
                        ? obj.prototype[method]
                        : obj[method];

                this.assert(
                    'function' === typeof context
                    , 'expected #{this} to respond to ' + _.inspect(method)
                    , 'expected #{this} to not respond to ' + _.inspect(method)
                );
            });

            /**
             * ### .itself
             *
             * Sets the `itself` flag, later used by the `respondTo` assertion.
             *
             *     function Foo() {}
             *     Foo.bar = function() {}
             *     Foo.prototype.baz = function() {}
             *
             *     expect(Foo).itself.to.respondTo('bar');
             *     expect(Foo).itself.not.to.respondTo('baz');
             *
             * @name itself
             * @api public
             */

            Assertion.addProperty('itself', function () {
                flag(this, 'itself', true);
            });

            /**
             * ### .satisfy(method)
             *
             * Asserts that the target passes a given truth test.
             *
             *     expect(1).to.satisfy(function(num) { return num > 0; });
             *
             * @name satisfy
             * @param {Function} matcher
             * @param {String} message _optional_
             * @api public
             */

            Assertion.addMethod('satisfy', function (matcher, msg) {
                if (msg) flag(this, 'message', msg);
                var obj = flag(this, 'object');
                this.assert(
                    matcher(obj)
                    , 'expected #{this} to satisfy ' + _.objDisplay(matcher)
                    , 'expected #{this} to not satisfy' + _.objDisplay(matcher)
                    , this.negate ? false : true
                    , matcher(obj)
                );
            });

            /**
             * ### .closeTo(expected, delta)
             *
             * Asserts that the target is equal `expected`, to within a +/- `delta` range.
             *
             *     expect(1.5).to.be.closeTo(1, 0.5);
             *
             * @name closeTo
             * @param {Number} expected
             * @param {Number} delta
             * @param {String} message _optional_
             * @api public
             */

            Assertion.addMethod('closeTo', function (expected, delta, msg) {
                if (msg) flag(this, 'message', msg);
                var obj = flag(this, 'object');
                this.assert(
                    Math.abs(obj - expected) <= delta
                    , 'expected #{this} to be close to ' + expected + ' +/- ' + delta
                    , 'expected #{this} not to be close to ' + expected + ' +/- ' + delta
                );
            });

            function isSubsetOf(subset, superset) {
                return subset.every(function(elem) {
                    return superset.indexOf(elem) !== -1;
                })
            }

            /**
             * ### .members(set)
             *
             * Asserts that the target is a superset of `set`,
             * or that the target and `set` have the same members.
             *
             *     expect([1, 2, 3]).to.include.members([3, 2]);
             *     expect([1, 2, 3]).to.not.include.members([3, 2, 8]);
             *
             *     expect([4, 2]).to.have.members([2, 4]);
             *     expect([5, 2]).to.not.have.members([5, 2, 1]);
             *
             * @name members
             * @param {Array} set
             * @param {String} message _optional_
             * @api public
             */

            Assertion.addMethod('members', function (subset, msg) {
                if (msg) flag(this, 'message', msg);
                var obj = flag(this, 'object');

                new Assertion(obj).to.be.an('array');
                new Assertion(subset).to.be.an('array');

                if (flag(this, 'contains')) {
                    return this.assert(
                        isSubsetOf(subset, obj)
                        , 'expected #{this} to be a superset of #{act}'
                        , 'expected #{this} to not be a superset of #{act}'
                        , obj
                        , subset
                    );
                }

                this.assert(
                    isSubsetOf(obj, subset) && isSubsetOf(subset, obj)
                    , 'expected #{this} to have the same members as #{act}'
                    , 'expected #{this} to not have the same members as #{act}'
                    , obj
                    , subset
                );
            });
        };

    });
    require.register("chai/lib/chai/interface/assert.js", function(exports, require, module){
        /*!
         * chai
         * Copyright(c) 2011-2013 Jake Luer <jake@alogicalparadox.com>
         * MIT Licensed
         */


        module.exports = function (chai, util) {

            /*!
             * Chai dependencies.
             */

            var Assertion = chai.Assertion
                , flag = util.flag;

            /*!
             * Module export.
             */

            /**
             * ### assert(expression, message)
             *
             * Write your own test expressions.
             *
             *     assert('foo' !== 'bar', 'foo is not bar');
             *     assert(Array.isArray([]), 'empty arrays are arrays');
             *
             * @param {Mixed} expression to test for truthiness
             * @param {String} message to display on error
             * @name assert
             * @api public
             */

            var assert = chai.assert = function (express, errmsg) {
                var test = new Assertion(null);
                test.assert(
                    express
                    , errmsg
                    , '[ negation message unavailable ]'
                );
            };

            /**
             * ### .fail(actual, expected, [message], [operator])
             *
             * Throw a failure. Node.js `assert` module-compatible.
             *
             * @name fail
             * @param {Mixed} actual
             * @param {Mixed} expected
             * @param {String} message
             * @param {String} operator
             * @api public
             */

            assert.fail = function (actual, expected, message, operator) {
                throw new chai.AssertionError({
                    actual: actual
                    , expected: expected
                    , message: message
                    , operator: operator
                    , stackStartFunction: assert.fail
                });
            };

            /**
             * ### .ok(object, [message])
             *
             * Asserts that `object` is truthy.
             *
             *     assert.ok('everything', 'everything is ok');
             *     assert.ok(false, 'this will fail');
             *
             * @name ok
             * @param {Mixed} object to test
             * @param {String} message
             * @api public
             */

            assert.ok = function (val, msg) {
                new Assertion(val, msg).is.ok;
            };

            /**
             * ### .notOk(object, [message])
             *
             * Asserts that `object` is falsy.
             *
             *     assert.notOk('everything', 'this will fail');
             *     assert.notOk(false, 'this will pass');
             *
             * @name notOk
             * @param {Mixed} object to test
             * @param {String} message
             * @api public
             */

            assert.notOk = function (val, msg) {
                new Assertion(val, msg).is.not.ok;
            };

            /**
             * ### .equal(actual, expected, [message])
             *
             * Asserts non-strict equality (`==`) of `actual` and `expected`.
             *
             *     assert.equal(3, '3', '== coerces values to strings');
             *
             * @name equal
             * @param {Mixed} actual
             * @param {Mixed} expected
             * @param {String} message
             * @api public
             */

            assert.equal = function (act, exp, msg) {
                var test = new Assertion(act, msg);

                test.assert(
                    exp == flag(test, 'object')
                    , 'expected #{this} to equal #{exp}'
                    , 'expected #{this} to not equal #{act}'
                    , exp
                    , act
                );
            };

            /**
             * ### .notEqual(actual, expected, [message])
             *
             * Asserts non-strict inequality (`!=`) of `actual` and `expected`.
             *
             *     assert.notEqual(3, 4, 'these numbers are not equal');
             *
             * @name notEqual
             * @param {Mixed} actual
             * @param {Mixed} expected
             * @param {String} message
             * @api public
             */

            assert.notEqual = function (act, exp, msg) {
                var test = new Assertion(act, msg);

                test.assert(
                    exp != flag(test, 'object')
                    , 'expected #{this} to not equal #{exp}'
                    , 'expected #{this} to equal #{act}'
                    , exp
                    , act
                );
            };

            /**
             * ### .strictEqual(actual, expected, [message])
             *
             * Asserts strict equality (`===`) of `actual` and `expected`.
             *
             *     assert.strictEqual(true, true, 'these booleans are strictly equal');
             *
             * @name strictEqual
             * @param {Mixed} actual
             * @param {Mixed} expected
             * @param {String} message
             * @api public
             */

            assert.strictEqual = function (act, exp, msg) {
                new Assertion(act, msg).to.equal(exp);
            };

            /**
             * ### .notStrictEqual(actual, expected, [message])
             *
             * Asserts strict inequality (`!==`) of `actual` and `expected`.
             *
             *     assert.notStrictEqual(3, '3', 'no coercion for strict equality');
             *
             * @name notStrictEqual
             * @param {Mixed} actual
             * @param {Mixed} expected
             * @param {String} message
             * @api public
             */

            assert.notStrictEqual = function (act, exp, msg) {
                new Assertion(act, msg).to.not.equal(exp);
            };

            /**
             * ### .deepEqual(actual, expected, [message])
             *
             * Asserts that `actual` is deeply equal to `expected`.
             *
             *     assert.deepEqual({ tea: 'green' }, { tea: 'green' });
             *
             * @name deepEqual
             * @param {Mixed} actual
             * @param {Mixed} expected
             * @param {String} message
             * @api public
             */

            assert.deepEqual = function (act, exp, msg) {
                new Assertion(act, msg).to.eql(exp);
            };

            /**
             * ### .notDeepEqual(actual, expected, [message])
             *
             * Assert that `actual` is not deeply equal to `expected`.
             *
             *     assert.notDeepEqual({ tea: 'green' }, { tea: 'jasmine' });
             *
             * @name notDeepEqual
             * @param {Mixed} actual
             * @param {Mixed} expected
             * @param {String} message
             * @api public
             */

            assert.notDeepEqual = function (act, exp, msg) {
                new Assertion(act, msg).to.not.eql(exp);
            };

            /**
             * ### .isTrue(value, [message])
             *
             * Asserts that `value` is true.
             *
             *     var teaServed = true;
             *     assert.isTrue(teaServed, 'the tea has been served');
             *
             * @name isTrue
             * @param {Mixed} value
             * @param {String} message
             * @api public
             */

            assert.isTrue = function (val, msg) {
                new Assertion(val, msg).is['true'];
            };

            /**
             * ### .isFalse(value, [message])
             *
             * Asserts that `value` is false.
             *
             *     var teaServed = false;
             *     assert.isFalse(teaServed, 'no tea yet? hmm...');
             *
             * @name isFalse
             * @param {Mixed} value
             * @param {String} message
             * @api public
             */

            assert.isFalse = function (val, msg) {
                new Assertion(val, msg).is['false'];
            };

            /**
             * ### .isNull(value, [message])
             *
             * Asserts that `value` is null.
             *
             *     assert.isNull(err, 'there was no error');
             *
             * @name isNull
             * @param {Mixed} value
             * @param {String} message
             * @api public
             */

            assert.isNull = function (val, msg) {
                new Assertion(val, msg).to.equal(null);
            };

            /**
             * ### .isNotNull(value, [message])
             *
             * Asserts that `value` is not null.
             *
             *     var tea = 'tasty chai';
             *     assert.isNotNull(tea, 'great, time for tea!');
             *
             * @name isNotNull
             * @param {Mixed} value
             * @param {String} message
             * @api public
             */

            assert.isNotNull = function (val, msg) {
                new Assertion(val, msg).to.not.equal(null);
            };

            /**
             * ### .isUndefined(value, [message])
             *
             * Asserts that `value` is `undefined`.
             *
             *     var tea;
             *     assert.isUndefined(tea, 'no tea defined');
             *
             * @name isUndefined
             * @param {Mixed} value
             * @param {String} message
             * @api public
             */

            assert.isUndefined = function (val, msg) {
                new Assertion(val, msg).to.equal(undefined);
            };

            /**
             * ### .isDefined(value, [message])
             *
             * Asserts that `value` is not `undefined`.
             *
             *     var tea = 'cup of chai';
             *     assert.isDefined(tea, 'tea has been defined');
             *
             * @name isDefined
             * @param {Mixed} value
             * @param {String} message
             * @api public
             */

            assert.isDefined = function (val, msg) {
                new Assertion(val, msg).to.not.equal(undefined);
            };

            /**
             * ### .isFunction(value, [message])
             *
             * Asserts that `value` is a function.
             *
             *     function serveTea() { return 'cup of tea'; };
             *     assert.isFunction(serveTea, 'great, we can have tea now');
             *
             * @name isFunction
             * @param {Mixed} value
             * @param {String} message
             * @api public
             */

            assert.isFunction = function (val, msg) {
                new Assertion(val, msg).to.be.a('function');
            };

            /**
             * ### .isNotFunction(value, [message])
             *
             * Asserts that `value` is _not_ a function.
             *
             *     var serveTea = [ 'heat', 'pour', 'sip' ];
             *     assert.isNotFunction(serveTea, 'great, we have listed the steps');
             *
             * @name isNotFunction
             * @param {Mixed} value
             * @param {String} message
             * @api public
             */

            assert.isNotFunction = function (val, msg) {
                new Assertion(val, msg).to.not.be.a('function');
            };

            /**
             * ### .isObject(value, [message])
             *
             * Asserts that `value` is an object (as revealed by
             * `Object.prototype.toString`).
             *
             *     var selection = { name: 'Chai', serve: 'with spices' };
             *     assert.isObject(selection, 'tea selection is an object');
             *
             * @name isObject
             * @param {Mixed} value
             * @param {String} message
             * @api public
             */

            assert.isObject = function (val, msg) {
                new Assertion(val, msg).to.be.a('object');
            };

            /**
             * ### .isNotObject(value, [message])
             *
             * Asserts that `value` is _not_ an object.
             *
             *     var selection = 'chai'
             *     assert.isObject(selection, 'tea selection is not an object');
             *     assert.isObject(null, 'null is not an object');
             *
             * @name isNotObject
             * @param {Mixed} value
             * @param {String} message
             * @api public
             */

            assert.isNotObject = function (val, msg) {
                new Assertion(val, msg).to.not.be.a('object');
            };

            /**
             * ### .isArray(value, [message])
             *
             * Asserts that `value` is an array.
             *
             *     var menu = [ 'green', 'chai', 'oolong' ];
             *     assert.isArray(menu, 'what kind of tea do we want?');
             *
             * @name isArray
             * @param {Mixed} value
             * @param {String} message
             * @api public
             */

            assert.isArray = function (val, msg) {
                new Assertion(val, msg).to.be.an('array');
            };

            /**
             * ### .isNotArray(value, [message])
             *
             * Asserts that `value` is _not_ an array.
             *
             *     var menu = 'green|chai|oolong';
             *     assert.isNotArray(menu, 'what kind of tea do we want?');
             *
             * @name isNotArray
             * @param {Mixed} value
             * @param {String} message
             * @api public
             */

            assert.isNotArray = function (val, msg) {
                new Assertion(val, msg).to.not.be.an('array');
            };

            /**
             * ### .isString(value, [message])
             *
             * Asserts that `value` is a string.
             *
             *     var teaOrder = 'chai';
             *     assert.isString(teaOrder, 'order placed');
             *
             * @name isString
             * @param {Mixed} value
             * @param {String} message
             * @api public
             */

            assert.isString = function (val, msg) {
                new Assertion(val, msg).to.be.a('string');
            };

            /**
             * ### .isNotString(value, [message])
             *
             * Asserts that `value` is _not_ a string.
             *
             *     var teaOrder = 4;
             *     assert.isNotString(teaOrder, 'order placed');
             *
             * @name isNotString
             * @param {Mixed} value
             * @param {String} message
             * @api public
             */

            assert.isNotString = function (val, msg) {
                new Assertion(val, msg).to.not.be.a('string');
            };

            /**
             * ### .isNumber(value, [message])
             *
             * Asserts that `value` is a number.
             *
             *     var cups = 2;
             *     assert.isNumber(cups, 'how many cups');
             *
             * @name isNumber
             * @param {Number} value
             * @param {String} message
             * @api public
             */

            assert.isNumber = function (val, msg) {
                new Assertion(val, msg).to.be.a('number');
            };

            /**
             * ### .isNotNumber(value, [message])
             *
             * Asserts that `value` is _not_ a number.
             *
             *     var cups = '2 cups please';
             *     assert.isNotNumber(cups, 'how many cups');
             *
             * @name isNotNumber
             * @param {Mixed} value
             * @param {String} message
             * @api public
             */

            assert.isNotNumber = function (val, msg) {
                new Assertion(val, msg).to.not.be.a('number');
            };

            /**
             * ### .isBoolean(value, [message])
             *
             * Asserts that `value` is a boolean.
             *
             *     var teaReady = true
             *       , teaServed = false;
             *
             *     assert.isBoolean(teaReady, 'is the tea ready');
             *     assert.isBoolean(teaServed, 'has tea been served');
             *
             * @name isBoolean
             * @param {Mixed} value
             * @param {String} message
             * @api public
             */

            assert.isBoolean = function (val, msg) {
                new Assertion(val, msg).to.be.a('boolean');
            };

            /**
             * ### .isNotBoolean(value, [message])
             *
             * Asserts that `value` is _not_ a boolean.
             *
             *     var teaReady = 'yep'
             *       , teaServed = 'nope';
             *
             *     assert.isNotBoolean(teaReady, 'is the tea ready');
             *     assert.isNotBoolean(teaServed, 'has tea been served');
             *
             * @name isNotBoolean
             * @param {Mixed} value
             * @param {String} message
             * @api public
             */

            assert.isNotBoolean = function (val, msg) {
                new Assertion(val, msg).to.not.be.a('boolean');
            };

            /**
             * ### .typeOf(value, name, [message])
             *
             * Asserts that `value`'s type is `name`, as determined by
             * `Object.prototype.toString`.
             *
             *     assert.typeOf({ tea: 'chai' }, 'object', 'we have an object');
             *     assert.typeOf(['chai', 'jasmine'], 'array', 'we have an array');
             *     assert.typeOf('tea', 'string', 'we have a string');
             *     assert.typeOf(/tea/, 'regexp', 'we have a regular expression');
             *     assert.typeOf(null, 'null', 'we have a null');
             *     assert.typeOf(undefined, 'undefined', 'we have an undefined');
             *
             * @name typeOf
             * @param {Mixed} value
             * @param {String} name
             * @param {String} message
             * @api public
             */

            assert.typeOf = function (val, type, msg) {
                new Assertion(val, msg).to.be.a(type);
            };

            /**
             * ### .notTypeOf(value, name, [message])
             *
             * Asserts that `value`'s type is _not_ `name`, as determined by
             * `Object.prototype.toString`.
             *
             *     assert.notTypeOf('tea', 'number', 'strings are not numbers');
             *
             * @name notTypeOf
             * @param {Mixed} value
             * @param {String} typeof name
             * @param {String} message
             * @api public
             */

            assert.notTypeOf = function (val, type, msg) {
                new Assertion(val, msg).to.not.be.a(type);
            };

            /**
             * ### .instanceOf(object, constructor, [message])
             *
             * Asserts that `value` is an instance of `constructor`.
             *
             *     var Tea = function (name) { this.name = name; }
             *       , chai = new Tea('chai');
             *
             *     assert.instanceOf(chai, Tea, 'chai is an instance of tea');
             *
             * @name instanceOf
             * @param {Object} object
             * @param {Constructor} constructor
             * @param {String} message
             * @api public
             */

            assert.instanceOf = function (val, type, msg) {
                new Assertion(val, msg).to.be.instanceOf(type);
            };

            /**
             * ### .notInstanceOf(object, constructor, [message])
             *
             * Asserts `value` is not an instance of `constructor`.
             *
             *     var Tea = function (name) { this.name = name; }
             *       , chai = new String('chai');
             *
             *     assert.notInstanceOf(chai, Tea, 'chai is not an instance of tea');
             *
             * @name notInstanceOf
             * @param {Object} object
             * @param {Constructor} constructor
             * @param {String} message
             * @api public
             */

            assert.notInstanceOf = function (val, type, msg) {
                new Assertion(val, msg).to.not.be.instanceOf(type);
            };

            /**
             * ### .include(haystack, needle, [message])
             *
             * Asserts that `haystack` includes `needle`. Works
             * for strings and arrays.
             *
             *     assert.include('foobar', 'bar', 'foobar contains string "bar"');
             *     assert.include([ 1, 2, 3 ], 3, 'array contains value');
             *
             * @name include
             * @param {Array|String} haystack
             * @param {Mixed} needle
             * @param {String} message
             * @api public
             */

            assert.include = function (exp, inc, msg) {
                var obj = new Assertion(exp, msg);

                if (Array.isArray(exp)) {
                    obj.to.include(inc);
                } else if ('string' === typeof exp) {
                    obj.to.contain.string(inc);
                } else {
                    throw new chai.AssertionError(
                        'expected an array or string'
                        , null
                        , assert.include
                    );
                }
            };

            /**
             * ### .notInclude(haystack, needle, [message])
             *
             * Asserts that `haystack` does not include `needle`. Works
             * for strings and arrays.
             *i
             *     assert.notInclude('foobar', 'baz', 'string not include substring');
             *     assert.notInclude([ 1, 2, 3 ], 4, 'array not include contain value');
             *
             * @name notInclude
             * @param {Array|String} haystack
             * @param {Mixed} needle
             * @param {String} message
             * @api public
             */

            assert.notInclude = function (exp, inc, msg) {
                var obj = new Assertion(exp, msg);

                if (Array.isArray(exp)) {
                    obj.to.not.include(inc);
                } else if ('string' === typeof exp) {
                    obj.to.not.contain.string(inc);
                } else {
                    throw new chai.AssertionError(
                        'expected an array or string'
                        , null
                        , assert.notInclude
                    );
                }
            };

            /**
             * ### .match(value, regexp, [message])
             *
             * Asserts that `value` matches the regular expression `regexp`.
             *
             *     assert.match('foobar', /^foo/, 'regexp matches');
             *
             * @name match
             * @param {Mixed} value
             * @param {RegExp} regexp
             * @param {String} message
             * @api public
             */

            assert.match = function (exp, re, msg) {
                new Assertion(exp, msg).to.match(re);
            };

            /**
             * ### .notMatch(value, regexp, [message])
             *
             * Asserts that `value` does not match the regular expression `regexp`.
             *
             *     assert.notMatch('foobar', /^foo/, 'regexp does not match');
             *
             * @name notMatch
             * @param {Mixed} value
             * @param {RegExp} regexp
             * @param {String} message
             * @api public
             */

            assert.notMatch = function (exp, re, msg) {
                new Assertion(exp, msg).to.not.match(re);
            };

            /**
             * ### .property(object, property, [message])
             *
             * Asserts that `object` has a property named by `property`.
             *
             *     assert.property({ tea: { green: 'matcha' }}, 'tea');
             *
             * @name property
             * @param {Object} object
             * @param {String} property
             * @param {String} message
             * @api public
             */

            assert.property = function (obj, prop, msg) {
                new Assertion(obj, msg).to.have.property(prop);
            };

            /**
             * ### .notProperty(object, property, [message])
             *
             * Asserts that `object` does _not_ have a property named by `property`.
             *
             *     assert.notProperty({ tea: { green: 'matcha' }}, 'coffee');
             *
             * @name notProperty
             * @param {Object} object
             * @param {String} property
             * @param {String} message
             * @api public
             */

            assert.notProperty = function (obj, prop, msg) {
                new Assertion(obj, msg).to.not.have.property(prop);
            };

            /**
             * ### .deepProperty(object, property, [message])
             *
             * Asserts that `object` has a property named by `property`, which can be a
             * string using dot- and bracket-notation for deep reference.
             *
             *     assert.deepProperty({ tea: { green: 'matcha' }}, 'tea.green');
             *
             * @name deepProperty
             * @param {Object} object
             * @param {String} property
             * @param {String} message
             * @api public
             */

            assert.deepProperty = function (obj, prop, msg) {
                new Assertion(obj, msg).to.have.deep.property(prop);
            };

            /**
             * ### .notDeepProperty(object, property, [message])
             *
             * Asserts that `object` does _not_ have a property named by `property`, which
             * can be a string using dot- and bracket-notation for deep reference.
             *
             *     assert.notDeepProperty({ tea: { green: 'matcha' }}, 'tea.oolong');
             *
             * @name notDeepProperty
             * @param {Object} object
             * @param {String} property
             * @param {String} message
             * @api public
             */

            assert.notDeepProperty = function (obj, prop, msg) {
                new Assertion(obj, msg).to.not.have.deep.property(prop);
            };

            /**
             * ### .propertyVal(object, property, value, [message])
             *
             * Asserts that `object` has a property named by `property` with value given
             * by `value`.
             *
             *     assert.propertyVal({ tea: 'is good' }, 'tea', 'is good');
             *
             * @name propertyVal
             * @param {Object} object
             * @param {String} property
             * @param {Mixed} value
             * @param {String} message
             * @api public
             */

            assert.propertyVal = function (obj, prop, val, msg) {
                new Assertion(obj, msg).to.have.property(prop, val);
            };

            /**
             * ### .propertyNotVal(object, property, value, [message])
             *
             * Asserts that `object` has a property named by `property`, but with a value
             * different from that given by `value`.
             *
             *     assert.propertyNotVal({ tea: 'is good' }, 'tea', 'is bad');
             *
             * @name propertyNotVal
             * @param {Object} object
             * @param {String} property
             * @param {Mixed} value
             * @param {String} message
             * @api public
             */

            assert.propertyNotVal = function (obj, prop, val, msg) {
                new Assertion(obj, msg).to.not.have.property(prop, val);
            };

            /**
             * ### .deepPropertyVal(object, property, value, [message])
             *
             * Asserts that `object` has a property named by `property` with value given
             * by `value`. `property` can use dot- and bracket-notation for deep
             * reference.
             *
             *     assert.deepPropertyVal({ tea: { green: 'matcha' }}, 'tea.green', 'matcha');
             *
             * @name deepPropertyVal
             * @param {Object} object
             * @param {String} property
             * @param {Mixed} value
             * @param {String} message
             * @api public
             */

            assert.deepPropertyVal = function (obj, prop, val, msg) {
                new Assertion(obj, msg).to.have.deep.property(prop, val);
            };

            /**
             * ### .deepPropertyNotVal(object, property, value, [message])
             *
             * Asserts that `object` has a property named by `property`, but with a value
             * different from that given by `value`. `property` can use dot- and
             * bracket-notation for deep reference.
             *
             *     assert.deepPropertyNotVal({ tea: { green: 'matcha' }}, 'tea.green', 'konacha');
             *
             * @name deepPropertyNotVal
             * @param {Object} object
             * @param {String} property
             * @param {Mixed} value
             * @param {String} message
             * @api public
             */

            assert.deepPropertyNotVal = function (obj, prop, val, msg) {
                new Assertion(obj, msg).to.not.have.deep.property(prop, val);
            };

            /**
             * ### .lengthOf(object, length, [message])
             *
             * Asserts that `object` has a `length` property with the expected value.
             *
             *     assert.lengthOf([1,2,3], 3, 'array has length of 3');
             *     assert.lengthOf('foobar', 5, 'string has length of 6');
             *
             * @name lengthOf
             * @param {Mixed} object
             * @param {Number} length
             * @param {String} message
             * @api public
             */

            assert.lengthOf = function (exp, len, msg) {
                new Assertion(exp, msg).to.have.length(len);
            };

            /**
             * ### .throws(function, [constructor/string/regexp], [string/regexp], [message])
             *
             * Asserts that `function` will throw an error that is an instance of
             * `constructor`, or alternately that it will throw an error with message
             * matching `regexp`.
             *
             *     assert.throw(fn, 'function throws a reference error');
             *     assert.throw(fn, /function throws a reference error/);
             *     assert.throw(fn, ReferenceError);
             *     assert.throw(fn, ReferenceError, 'function throws a reference error');
             *     assert.throw(fn, ReferenceError, /function throws a reference error/);
             *
             * @name throws
             * @alias throw
             * @alias Throw
             * @param {Function} function
             * @param {ErrorConstructor} constructor
             * @param {RegExp} regexp
             * @param {String} message
             * @see https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Error#Error_types
             * @api public
             */

            assert.Throw = function (fn, errt, errs, msg) {
                if ('string' === typeof errt || errt instanceof RegExp) {
                    errs = errt;
                    errt = null;
                }

                new Assertion(fn, msg).to.Throw(errt, errs);
            };

            /**
             * ### .doesNotThrow(function, [constructor/regexp], [message])
             *
             * Asserts that `function` will _not_ throw an error that is an instance of
             * `constructor`, or alternately that it will not throw an error with message
             * matching `regexp`.
             *
             *     assert.doesNotThrow(fn, Error, 'function does not throw');
             *
             * @name doesNotThrow
             * @param {Function} function
             * @param {ErrorConstructor} constructor
             * @param {RegExp} regexp
             * @param {String} message
             * @see https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Error#Error_types
             * @api public
             */

            assert.doesNotThrow = function (fn, type, msg) {
                if ('string' === typeof type) {
                    msg = type;
                    type = null;
                }

                new Assertion(fn, msg).to.not.Throw(type);
            };

            /**
             * ### .operator(val1, operator, val2, [message])
             *
             * Compares two values using `operator`.
             *
             *     assert.operator(1, '<', 2, 'everything is ok');
             *     assert.operator(1, '>', 2, 'this will fail');
             *
             * @name operator
             * @param {Mixed} val1
             * @param {String} operator
             * @param {Mixed} val2
             * @param {String} message
             * @api public
             */

            assert.operator = function (val, operator, val2, msg) {
                if (!~['==', '===', '>', '>=', '<', '<=', '!=', '!=='].indexOf(operator)) {
                    throw new Error('Invalid operator "' + operator + '"');
                }
                var test = new Assertion(eval(val + operator + val2), msg);
                test.assert(
                    true === flag(test, 'object')
                    , 'expected ' + util.inspect(val) + ' to be ' + operator + ' ' + util.inspect(val2)
                    , 'expected ' + util.inspect(val) + ' to not be ' + operator + ' ' + util.inspect(val2) );
            };

            /**
             * ### .closeTo(actual, expected, delta, [message])
             *
             * Asserts that the target is equal `expected`, to within a +/- `delta` range.
             *
             *     assert.closeTo(1.5, 1, 0.5, 'numbers are close');
             *
             * @name closeTo
             * @param {Number} actual
             * @param {Number} expected
             * @param {Number} delta
             * @param {String} message
             * @api public
             */

            assert.closeTo = function (act, exp, delta, msg) {
                new Assertion(act, msg).to.be.closeTo(exp, delta);
            };

            /**
             * ### .sameMembers(set1, set2, [message])
             *
             * Asserts that `set1` and `set2` have the same members.
             * Order is not taken into account.
             *
             *     assert.sameMembers([ 1, 2, 3 ], [ 2, 1, 3 ], 'same members');
             *
             * @name sameMembers
             * @param {Array} superset
             * @param {Array} subset
             * @param {String} message
             * @api public
             */

            assert.sameMembers = function (set1, set2, msg) {
                new Assertion(set1, msg).to.have.same.members(set2);
            }

            /**
             * ### .includeMembers(superset, subset, [message])
             *
             * Asserts that `subset` is included in `superset`.
             * Order is not taken into account.
             *
             *     assert.includeMembers([ 1, 2, 3 ], [ 2, 1 ], 'include members');
             *
             * @name includeMembers
             * @param {Array} superset
             * @param {Array} subset
             * @param {String} message
             * @api public
             */

            assert.includeMembers = function (superset, subset, msg) {
                new Assertion(superset, msg).to.include.members(subset);
            }

            /*!
             * Undocumented / untested
             */

            assert.ifError = function (val, msg) {
                new Assertion(val, msg).to.not.be.ok;
            };

            /*!
             * Aliases.
             */

            (function alias(name, as){
                assert[as] = assert[name];
                return alias;
            })
                ('Throw', 'throw')
                ('Throw', 'throws');
        };

    });
    require.register("chai/lib/chai/interface/expect.js", function(exports, require, module){
        /*!
         * chai
         * Copyright(c) 2011-2013 Jake Luer <jake@alogicalparadox.com>
         * MIT Licensed
         */

        module.exports = function (chai, util) {
            chai.expect = function (val, message) {
                return new chai.Assertion(val, message);
            };
        };


    });
    require.register("chai/lib/chai/interface/should.js", function(exports, require, module){
        /*!
         * chai
         * Copyright(c) 2011-2013 Jake Luer <jake@alogicalparadox.com>
         * MIT Licensed
         */

        module.exports = function (chai, util) {
            var Assertion = chai.Assertion;

            function loadShould () {
                // modify Object.prototype to have `should`
                Object.defineProperty(Object.prototype, 'should',
                    {
                        set: function (value) {
                            // See https://github.com/chaijs/chai/issues/86: this makes
                            // `whatever.should = someValue` actually set `someValue`, which is
                            // especially useful for `global.should = require('chai').should()`.
                            //
                            // Note that we have to use [[DefineProperty]] instead of [[Put]]
                            // since otherwise we would trigger this very setter!
                            Object.defineProperty(this, 'should', {
                                value: value,
                                enumerable: true,
                                configurable: true,
                                writable: true
                            });
                        }
                        , get: function(){
                        if (this instanceof String || this instanceof Number) {
                            return new Assertion(this.constructor(this));
                        } else if (this instanceof Boolean) {
                            return new Assertion(this == true);
                        }
                        return new Assertion(this);
                    }
                        , configurable: true
                    });

                var should = {};

                should.equal = function (val1, val2, msg) {
                    new Assertion(val1, msg).to.equal(val2);
                };

                should.Throw = function (fn, errt, errs, msg) {
                    new Assertion(fn, msg).to.Throw(errt, errs);
                };

                should.exist = function (val, msg) {
                    new Assertion(val, msg).to.exist;
                }

                // negation
                should.not = {}

                should.not.equal = function (val1, val2, msg) {
                    new Assertion(val1, msg).to.not.equal(val2);
                };

                should.not.Throw = function (fn, errt, errs, msg) {
                    new Assertion(fn, msg).to.not.Throw(errt, errs);
                };

                should.not.exist = function (val, msg) {
                    new Assertion(val, msg).to.not.exist;
                }

                should['throw'] = should['Throw'];
                should.not['throw'] = should.not['Throw'];

                return should;
            };

            chai.should = loadShould;
            chai.Should = loadShould;
        };

    });
    require.register("chai/lib/chai/utils/addChainableMethod.js", function(exports, require, module){
        /*!
         * Chai - addChainingMethod utility
         * Copyright(c) 2012-2013 Jake Luer <jake@alogicalparadox.com>
         * MIT Licensed
         */

        /*!
         * Module dependencies
         */

        var transferFlags = require('./transferFlags');

        /*!
         * Module variables
         */

// Check whether `__proto__` is supported
        var hasProtoSupport = '__proto__' in Object;

// Without `__proto__` support, this module will need to add properties to a function.
// However, some Function.prototype methods cannot be overwritten,
// and there seems no easy cross-platform way to detect them (@see chaijs/chai/issues/69).
        var excludeNames = /^(?:length|name|arguments|caller)$/;

// Cache `Function` properties
        var call  = Function.prototype.call,
            apply = Function.prototype.apply;

        /**
         * ### addChainableMethod (ctx, name, method, chainingBehavior)
         *
         * Adds a method to an object, such that the method can also be chained.
         *
         *     utils.addChainableMethod(chai.Assertion.prototype, 'foo', function (str) {
 *       var obj = utils.flag(this, 'object');
 *       new chai.Assertion(obj).to.be.equal(str);
 *     });
         *
         * Can also be accessed directly from `chai.Assertion`.
         *
         *     chai.Assertion.addChainableMethod('foo', fn, chainingBehavior);
         *
         * The result can then be used as both a method assertion, executing both `method` and
         * `chainingBehavior`, or as a language chain, which only executes `chainingBehavior`.
         *
         *     expect(fooStr).to.be.foo('bar');
         *     expect(fooStr).to.be.foo.equal('foo');
         *
         * @param {Object} ctx object to which the method is added
         * @param {String} name of method to add
         * @param {Function} method function to be used for `name`, when called
         * @param {Function} chainingBehavior function to be called every time the property is accessed
         * @name addChainableMethod
         * @api public
         */

        module.exports = function (ctx, name, method, chainingBehavior) {
            if (typeof chainingBehavior !== 'function')
                chainingBehavior = function () { };

            Object.defineProperty(ctx, name,
                { get: function () {
                    chainingBehavior.call(this);

                    var assert = function () {
                        var result = method.apply(this, arguments);
                        return result === undefined ? this : result;
                    };

                    // Use `__proto__` if available
                    if (hasProtoSupport) {
                        // Inherit all properties from the object by replacing the `Function` prototype
                        var prototype = assert.__proto__ = Object.create(this);
                        // Restore the `call` and `apply` methods from `Function`
                        prototype.call = call;
                        prototype.apply = apply;
                    }
                    // Otherwise, redefine all properties (slow!)
                    else {
                        var asserterNames = Object.getOwnPropertyNames(ctx);
                        asserterNames.forEach(function (asserterName) {
                            if (!excludeNames.test(asserterName)) {
                                var pd = Object.getOwnPropertyDescriptor(ctx, asserterName);
                                Object.defineProperty(assert, asserterName, pd);
                            }
                        });
                    }

                    transferFlags(this, assert);
                    return assert;
                }
                    , configurable: true
                });
        };

    });
    require.register("chai/lib/chai/utils/addMethod.js", function(exports, require, module){
        /*!
         * Chai - addMethod utility
         * Copyright(c) 2012-2013 Jake Luer <jake@alogicalparadox.com>
         * MIT Licensed
         */

        /**
         * ### .addMethod (ctx, name, method)
         *
         * Adds a method to the prototype of an object.
         *
         *     utils.addMethod(chai.Assertion.prototype, 'foo', function (str) {
 *       var obj = utils.flag(this, 'object');
 *       new chai.Assertion(obj).to.be.equal(str);
 *     });
         *
         * Can also be accessed directly from `chai.Assertion`.
         *
         *     chai.Assertion.addMethod('foo', fn);
         *
         * Then can be used as any other assertion.
         *
         *     expect(fooStr).to.be.foo('bar');
         *
         * @param {Object} ctx object to which the method is added
         * @param {String} name of method to add
         * @param {Function} method function to be used for name
         * @name addMethod
         * @api public
         */

        module.exports = function (ctx, name, method) {
            ctx[name] = function () {
                var result = method.apply(this, arguments);
                return result === undefined ? this : result;
            };
        };

    });
    require.register("chai/lib/chai/utils/addProperty.js", function(exports, require, module){
        /*!
         * Chai - addProperty utility
         * Copyright(c) 2012-2013 Jake Luer <jake@alogicalparadox.com>
         * MIT Licensed
         */

        /**
         * ### addProperty (ctx, name, getter)
         *
         * Adds a property to the prototype of an object.
         *
         *     utils.addProperty(chai.Assertion.prototype, 'foo', function () {
 *       var obj = utils.flag(this, 'object');
 *       new chai.Assertion(obj).to.be.instanceof(Foo);
 *     });
         *
         * Can also be accessed directly from `chai.Assertion`.
         *
         *     chai.Assertion.addProperty('foo', fn);
         *
         * Then can be used as any other assertion.
         *
         *     expect(myFoo).to.be.foo;
         *
         * @param {Object} ctx object to which the property is added
         * @param {String} name of property to add
         * @param {Function} getter function to be used for name
         * @name addProperty
         * @api public
         */

        module.exports = function (ctx, name, getter) {
            Object.defineProperty(ctx, name,
                { get: function () {
                    var result = getter.call(this);
                    return result === undefined ? this : result;
                }
                    , configurable: true
                });
        };

    });
    require.register("chai/lib/chai/utils/flag.js", function(exports, require, module){
        /*!
         * Chai - flag utility
         * Copyright(c) 2012-2013 Jake Luer <jake@alogicalparadox.com>
         * MIT Licensed
         */

        /**
         * ### flag(object ,key, [value])
         *
         * Get or set a flag value on an object. If a
         * value is provided it will be set, else it will
         * return the currently set value or `undefined` if
         * the value is not set.
         *
         *     utils.flag(this, 'foo', 'bar'); // setter
         *     utils.flag(this, 'foo'); // getter, returns `bar`
         *
         * @param {Object} object (constructed Assertion
         * @param {String} key
         * @param {Mixed} value (optional)
         * @name flag
         * @api private
         */

        module.exports = function (obj, key, value) {
            var flags = obj.__flags || (obj.__flags = Object.create(null));
            if (arguments.length === 3) {
                flags[key] = value;
            } else {
                return flags[key];
            }
        };

    });
    require.register("chai/lib/chai/utils/getActual.js", function(exports, require, module){
        /*!
         * Chai - getActual utility
         * Copyright(c) 2012-2013 Jake Luer <jake@alogicalparadox.com>
         * MIT Licensed
         */

        /**
         * # getActual(object, [actual])
         *
         * Returns the `actual` value for an Assertion
         *
         * @param {Object} object (constructed Assertion)
         * @param {Arguments} chai.Assertion.prototype.assert arguments
         */

        module.exports = function (obj, args) {
            var actual = args[4];
            return 'undefined' !== typeof actual ? actual : obj._obj;
        };

    });
    require.register("chai/lib/chai/utils/getEnumerableProperties.js", function(exports, require, module){
        /*!
         * Chai - getEnumerableProperties utility
         * Copyright(c) 2012-2013 Jake Luer <jake@alogicalparadox.com>
         * MIT Licensed
         */

        /**
         * ### .getEnumerableProperties(object)
         *
         * This allows the retrieval of enumerable property names of an object,
         * inherited or not.
         *
         * @param {Object} object
         * @returns {Array}
         * @name getEnumerableProperties
         * @api public
         */

        module.exports = function getEnumerableProperties(object) {
            var result = [];
            for (var name in object) {
                result.push(name);
            }
            return result;
        };

    });
    require.register("chai/lib/chai/utils/getMessage.js", function(exports, require, module){
        /*!
         * Chai - message composition utility
         * Copyright(c) 2012-2013 Jake Luer <jake@alogicalparadox.com>
         * MIT Licensed
         */

        /*!
         * Module dependancies
         */

        var flag = require('./flag')
            , getActual = require('./getActual')
            , inspect = require('./inspect')
            , objDisplay = require('./objDisplay');

        /**
         * ### .getMessage(object, message, negateMessage)
         *
         * Construct the error message based on flags
         * and template tags. Template tags will return
         * a stringified inspection of the object referenced.
         *
         * Message template tags:
         * - `#{this}` current asserted object
         * - `#{act}` actual value
         * - `#{exp}` expected value
         *
         * @param {Object} object (constructed Assertion)
         * @param {Arguments} chai.Assertion.prototype.assert arguments
         * @name getMessage
         * @api public
         */

        module.exports = function (obj, args) {
            var negate = flag(obj, 'negate')
                , val = flag(obj, 'object')
                , expected = args[3]
                , actual = getActual(obj, args)
                , msg = negate ? args[2] : args[1]
                , flagMsg = flag(obj, 'message');

            msg = msg || '';
            msg = msg
                .replace(/#{this}/g, objDisplay(val))
                .replace(/#{act}/g, objDisplay(actual))
                .replace(/#{exp}/g, objDisplay(expected));

            return flagMsg ? flagMsg + ': ' + msg : msg;
        };

    });
    require.register("chai/lib/chai/utils/getName.js", function(exports, require, module){
        /*!
         * Chai - getName utility
         * Copyright(c) 2012-2013 Jake Luer <jake@alogicalparadox.com>
         * MIT Licensed
         */

        /**
         * # getName(func)
         *
         * Gets the name of a function, in a cross-browser way.
         *
         * @param {Function} a function (usually a constructor)
         */

        module.exports = function (func) {
            if (func.name) return func.name;

            var match = /^\s?function ([^(]*)\(/.exec(func);
            return match && match[1] ? match[1] : "";
        };

    });
    require.register("chai/lib/chai/utils/getPathValue.js", function(exports, require, module){
        /*!
         * Chai - getPathValue utility
         * Copyright(c) 2012-2013 Jake Luer <jake@alogicalparadox.com>
         * @see https://github.com/logicalparadox/filtr
         * MIT Licensed
         */

        /**
         * ### .getPathValue(path, object)
         *
         * This allows the retrieval of values in an
         * object given a string path.
         *
         *     var obj = {
 *         prop1: {
 *             arr: ['a', 'b', 'c']
 *           , str: 'Hello'
 *         }
 *       , prop2: {
 *             arr: [ { nested: 'Universe' } ]
 *           , str: 'Hello again!'
 *         }
 *     }
         *
         * The following would be the results.
         *
         *     getPathValue('prop1.str', obj); // Hello
         *     getPathValue('prop1.att[2]', obj); // b
         *     getPathValue('prop2.arr[0].nested', obj); // Universe
         *
         * @param {String} path
         * @param {Object} object
         * @returns {Object} value or `undefined`
         * @name getPathValue
         * @api public
         */

        var getPathValue = module.exports = function (path, obj) {
            var parsed = parsePath(path);
            return _getPathValue(parsed, obj);
        };

        /*!
         * ## parsePath(path)
         *
         * Helper function used to parse string object
         * paths. Use in conjunction with `_getPathValue`.
         *
         *      var parsed = parsePath('myobject.property.subprop');
         *
         * ### Paths:
         *
         * * Can be as near infinitely deep and nested
         * * Arrays are also valid using the formal `myobject.document[3].property`.
         *
         * @param {String} path
         * @returns {Object} parsed
         * @api private
         */

        function parsePath (path) {
            var str = path.replace(/\[/g, '.[')
                , parts = str.match(/(\\\.|[^.]+?)+/g);
            return parts.map(function (value) {
                var re = /\[(\d+)\]$/
                    , mArr = re.exec(value)
                if (mArr) return { i: parseFloat(mArr[1]) };
                else return { p: value };
            });
        };

        /*!
         * ## _getPathValue(parsed, obj)
         *
         * Helper companion function for `.parsePath` that returns
         * the value located at the parsed address.
         *
         *      var value = getPathValue(parsed, obj);
         *
         * @param {Object} parsed definition from `parsePath`.
         * @param {Object} object to search against
         * @returns {Object|Undefined} value
         * @api private
         */

        function _getPathValue (parsed, obj) {
            var tmp = obj
                , res;
            for (var i = 0, l = parsed.length; i < l; i++) {
                var part = parsed[i];
                if (tmp) {
                    if ('undefined' !== typeof part.p)
                        tmp = tmp[part.p];
                    else if ('undefined' !== typeof part.i)
                        tmp = tmp[part.i];
                    if (i == (l - 1)) res = tmp;
                } else {
                    res = undefined;
                }
            }
            return res;
        };

    });
    require.register("chai/lib/chai/utils/getProperties.js", function(exports, require, module){
        /*!
         * Chai - getProperties utility
         * Copyright(c) 2012-2013 Jake Luer <jake@alogicalparadox.com>
         * MIT Licensed
         */

        /**
         * ### .getProperties(object)
         *
         * This allows the retrieval of property names of an object, enumerable or not,
         * inherited or not.
         *
         * @param {Object} object
         * @returns {Array}
         * @name getProperties
         * @api public
         */

        module.exports = function getProperties(object) {
            var result = Object.getOwnPropertyNames(subject);

            function addProperty(property) {
                if (result.indexOf(property) === -1) {
                    result.push(property);
                }
            }

            var proto = Object.getPrototypeOf(subject);
            while (proto !== null) {
                Object.getOwnPropertyNames(proto).forEach(addProperty);
                proto = Object.getPrototypeOf(proto);
            }

            return result;
        };

    });
    require.register("chai/lib/chai/utils/index.js", function(exports, require, module){
        /*!
         * chai
         * Copyright(c) 2011 Jake Luer <jake@alogicalparadox.com>
         * MIT Licensed
         */

        /*!
         * Main exports
         */

        var exports = module.exports = {};

        /*!
         * test utility
         */

        exports.test = require('./test');

        /*!
         * type utility
         */

        exports.type = require('./type');

        /*!
         * message utility
         */

        exports.getMessage = require('./getMessage');

        /*!
         * actual utility
         */

        exports.getActual = require('./getActual');

        /*!
         * Inspect util
         */

        exports.inspect = require('./inspect');

        /*!
         * Object Display util
         */

        exports.objDisplay = require('./objDisplay');

        /*!
         * Flag utility
         */

        exports.flag = require('./flag');

        /*!
         * Flag transferring utility
         */

        exports.transferFlags = require('./transferFlags');

        /*!
         * Deep equal utility
         */

        exports.eql = require('deep-eql');

        /*!
         * Deep path value
         */

        exports.getPathValue = require('./getPathValue');

        /*!
         * Function name
         */

        exports.getName = require('./getName');

        /*!
         * add Property
         */

        exports.addProperty = require('./addProperty');

        /*!
         * add Method
         */

        exports.addMethod = require('./addMethod');

        /*!
         * overwrite Property
         */

        exports.overwriteProperty = require('./overwriteProperty');

        /*!
         * overwrite Method
         */

        exports.overwriteMethod = require('./overwriteMethod');

        /*!
         * Add a chainable method
         */

        exports.addChainableMethod = require('./addChainableMethod');


    });
    require.register("chai/lib/chai/utils/inspect.js", function(exports, require, module){
// This is (almost) directly from Node.js utils
// https://github.com/joyent/node/blob/f8c335d0caf47f16d31413f89aa28eda3878e3aa/lib/util.js

        var getName = require('./getName');
        var getProperties = require('./getProperties');
        var getEnumerableProperties = require('./getEnumerableProperties');

        module.exports = inspect;

        /**
         * Echos the value of a value. Trys to print the value out
         * in the best way possible given the different types.
         *
         * @param {Object} obj The object to print out.
         * @param {Boolean} showHidden Flag that shows hidden (not enumerable)
         *    properties of objects.
         * @param {Number} depth Depth in which to descend in object. Default is 2.
         * @param {Boolean} colors Flag to turn on ANSI escape codes to color the
         *    output. Default is false (no coloring).
         */
        function inspect(obj, showHidden, depth, colors) {
            var ctx = {
                showHidden: showHidden,
                seen: [],
                stylize: function (str) { return str; }
            };
            return formatValue(ctx, obj, (typeof depth === 'undefined' ? 2 : depth));
        }

// https://gist.github.com/1044128/
        var getOuterHTML = function(element) {
            if ('outerHTML' in element) return element.outerHTML;
            var ns = "http://www.w3.org/1999/xhtml";
            var container = document.createElementNS(ns, '_');
            var elemProto = (window.HTMLElement || window.Element).prototype;
            var xmlSerializer = new XMLSerializer();
            var html;
            if (document.xmlVersion) {
                return xmlSerializer.serializeToString(element);
            } else {
                container.appendChild(element.cloneNode(false));
                html = container.innerHTML.replace('><', '>' + element.innerHTML + '<');
                container.innerHTML = '';
                return html;
            }
        };

// Returns true if object is a DOM element.
        var isDOMElement = function (object) {
            if (typeof HTMLElement === 'object') {
                return object instanceof HTMLElement;
            } else {
                return object &&
                    typeof object === 'object' &&
                    object.nodeType === 1 &&
                    typeof object.nodeName === 'string';
            }
        };

        function formatValue(ctx, value, recurseTimes) {
            // Provide a hook for user-specified inspect functions.
            // Check that value is an object with an inspect function on it
            if (value && typeof value.inspect === 'function' &&
                // Filter out the util module, it's inspect function is special
                value.inspect !== exports.inspect &&
                // Also filter out any prototype objects using the circular check.
                !(value.constructor && value.constructor.prototype === value)) {
                var ret = value.inspect(recurseTimes);
                if (typeof ret !== 'string') {
                    ret = formatValue(ctx, ret, recurseTimes);
                }
                return ret;
            }

            // Primitive types cannot have properties
            var primitive = formatPrimitive(ctx, value);
            if (primitive) {
                return primitive;
            }

            // If it's DOM elem, get outer HTML.
            if (isDOMElement(value)) {
                return getOuterHTML(value);
            }

            // Look up the keys of the object.
            var visibleKeys = getEnumerableProperties(value);
            var keys = ctx.showHidden ? getProperties(value) : visibleKeys;

            // Some type of object without properties can be shortcutted.
            // In IE, errors have a single `stack` property, or if they are vanilla `Error`,
            // a `stack` plus `description` property; ignore those for consistency.
            if (keys.length === 0 || (isError(value) && (
                (keys.length === 1 && keys[0] === 'stack') ||
                    (keys.length === 2 && keys[0] === 'description' && keys[1] === 'stack')
                ))) {
                if (typeof value === 'function') {
                    var name = getName(value);
                    var nameSuffix = name ? ': ' + name : '';
                    return ctx.stylize('[Function' + nameSuffix + ']', 'special');
                }
                if (isRegExp(value)) {
                    return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
                }
                if (isDate(value)) {
                    return ctx.stylize(Date.prototype.toUTCString.call(value), 'date');
                }
                if (isError(value)) {
                    return formatError(value);
                }
            }

            var base = '', array = false, braces = ['{', '}'];

            // Make Array say that they are Array
            if (isArray(value)) {
                array = true;
                braces = ['[', ']'];
            }

            // Make functions say that they are functions
            if (typeof value === 'function') {
                var name = getName(value);
                var nameSuffix = name ? ': ' + name : '';
                base = ' [Function' + nameSuffix + ']';
            }

            // Make RegExps say that they are RegExps
            if (isRegExp(value)) {
                base = ' ' + RegExp.prototype.toString.call(value);
            }

            // Make dates with properties first say the date
            if (isDate(value)) {
                base = ' ' + Date.prototype.toUTCString.call(value);
            }

            // Make error with message first say the error
            if (isError(value)) {
                return formatError(value);
            }

            if (keys.length === 0 && (!array || value.length == 0)) {
                return braces[0] + base + braces[1];
            }

            if (recurseTimes < 0) {
                if (isRegExp(value)) {
                    return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
                } else {
                    return ctx.stylize('[Object]', 'special');
                }
            }

            ctx.seen.push(value);

            var output;
            if (array) {
                output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
            } else {
                output = keys.map(function(key) {
                    return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
                });
            }

            ctx.seen.pop();

            return reduceToSingleString(output, base, braces);
        }


        function formatPrimitive(ctx, value) {
            switch (typeof value) {
                case 'undefined':
                    return ctx.stylize('undefined', 'undefined');

                case 'string':
                    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                        .replace(/'/g, "\\'")
                        .replace(/\\"/g, '"') + '\'';
                    return ctx.stylize(simple, 'string');

                case 'number':
                    return ctx.stylize('' + value, 'number');

                case 'boolean':
                    return ctx.stylize('' + value, 'boolean');
            }
            // For some reason typeof null is "object", so special case here.
            if (value === null) {
                return ctx.stylize('null', 'null');
            }
        }


        function formatError(value) {
            return '[' + Error.prototype.toString.call(value) + ']';
        }


        function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
            var output = [];
            for (var i = 0, l = value.length; i < l; ++i) {
                if (Object.prototype.hasOwnProperty.call(value, String(i))) {
                    output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
                        String(i), true));
                } else {
                    output.push('');
                }
            }
            keys.forEach(function(key) {
                if (!key.match(/^\d+$/)) {
                    output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
                        key, true));
                }
            });
            return output;
        }


        function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
            var name, str;
            if (value.__lookupGetter__) {
                if (value.__lookupGetter__(key)) {
                    if (value.__lookupSetter__(key)) {
                        str = ctx.stylize('[Getter/Setter]', 'special');
                    } else {
                        str = ctx.stylize('[Getter]', 'special');
                    }
                } else {
                    if (value.__lookupSetter__(key)) {
                        str = ctx.stylize('[Setter]', 'special');
                    }
                }
            }
            if (visibleKeys.indexOf(key) < 0) {
                name = '[' + key + ']';
            }
            if (!str) {
                if (ctx.seen.indexOf(value[key]) < 0) {
                    if (recurseTimes === null) {
                        str = formatValue(ctx, value[key], null);
                    } else {
                        str = formatValue(ctx, value[key], recurseTimes - 1);
                    }
                    if (str.indexOf('\n') > -1) {
                        if (array) {
                            str = str.split('\n').map(function(line) {
                                return '  ' + line;
                            }).join('\n').substr(2);
                        } else {
                            str = '\n' + str.split('\n').map(function(line) {
                                return '   ' + line;
                            }).join('\n');
                        }
                    }
                } else {
                    str = ctx.stylize('[Circular]', 'special');
                }
            }
            if (typeof name === 'undefined') {
                if (array && key.match(/^\d+$/)) {
                    return str;
                }
                name = JSON.stringify('' + key);
                if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
                    name = name.substr(1, name.length - 2);
                    name = ctx.stylize(name, 'name');
                } else {
                    name = name.replace(/'/g, "\\'")
                        .replace(/\\"/g, '"')
                        .replace(/(^"|"$)/g, "'");
                    name = ctx.stylize(name, 'string');
                }
            }

            return name + ': ' + str;
        }


        function reduceToSingleString(output, base, braces) {
            var numLinesEst = 0;
            var length = output.reduce(function(prev, cur) {
                numLinesEst++;
                if (cur.indexOf('\n') >= 0) numLinesEst++;
                return prev + cur.length + 1;
            }, 0);

            if (length > 60) {
                return braces[0] +
                    (base === '' ? '' : base + '\n ') +
                    ' ' +
                    output.join(',\n  ') +
                    ' ' +
                    braces[1];
            }

            return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
        }

        function isArray(ar) {
            return Array.isArray(ar) ||
                (typeof ar === 'object' && objectToString(ar) === '[object Array]');
        }

        function isRegExp(re) {
            return typeof re === 'object' && objectToString(re) === '[object RegExp]';
        }

        function isDate(d) {
            return typeof d === 'object' && objectToString(d) === '[object Date]';
        }

        function isError(e) {
            return typeof e === 'object' && objectToString(e) === '[object Error]';
        }

        function objectToString(o) {
            return Object.prototype.toString.call(o);
        }

    });
    require.register("chai/lib/chai/utils/objDisplay.js", function(exports, require, module){
        /*!
         * Chai - flag utility
         * Copyright(c) 2012-2013 Jake Luer <jake@alogicalparadox.com>
         * MIT Licensed
         */

        /*!
         * Module dependancies
         */

        var inspect = require('./inspect');

        /**
         * ### .objDisplay (object)
         *
         * Determines if an object or an array matches
         * criteria to be inspected in-line for error
         * messages or should be truncated.
         *
         * @param {Mixed} javascript object to inspect
         * @name objDisplay
         * @api public
         */

        module.exports = function (obj) {
            var str = inspect(obj)
                , type = Object.prototype.toString.call(obj);

            if (str.length >= 40) {
                if (type === '[object Function]') {
                    return !obj.name || obj.name === ''
                        ? '[Function]'
                        : '[Function: ' + obj.name + ']';
                } else if (type === '[object Array]') {
                    return '[ Array(' + obj.length + ') ]';
                } else if (type === '[object Object]') {
                    var keys = Object.keys(obj)
                        , kstr = keys.length > 2
                            ? keys.splice(0, 2).join(', ') + ', ...'
                            : keys.join(', ');
                    return '{ Object (' + kstr + ') }';
                } else {
                    return str;
                }
            } else {
                return str;
            }
        };

    });
    require.register("chai/lib/chai/utils/overwriteMethod.js", function(exports, require, module){
        /*!
         * Chai - overwriteMethod utility
         * Copyright(c) 2012-2013 Jake Luer <jake@alogicalparadox.com>
         * MIT Licensed
         */

        /**
         * ### overwriteMethod (ctx, name, fn)
         *
         * Overwites an already existing method and provides
         * access to previous function. Must return function
         * to be used for name.
         *
         *     utils.overwriteMethod(chai.Assertion.prototype, 'equal', function (_super) {
 *       return function (str) {
 *         var obj = utils.flag(this, 'object');
 *         if (obj instanceof Foo) {
 *           new chai.Assertion(obj.value).to.equal(str);
 *         } else {
 *           _super.apply(this, arguments);
 *         }
 *       }
 *     });
         *
         * Can also be accessed directly from `chai.Assertion`.
         *
         *     chai.Assertion.overwriteMethod('foo', fn);
         *
         * Then can be used as any other assertion.
         *
         *     expect(myFoo).to.equal('bar');
         *
         * @param {Object} ctx object whose method is to be overwritten
         * @param {String} name of method to overwrite
         * @param {Function} method function that returns a function to be used for name
         * @name overwriteMethod
         * @api public
         */

        module.exports = function (ctx, name, method) {
            var _method = ctx[name]
                , _super = function () { return this; };

            if (_method && 'function' === typeof _method)
                _super = _method;

            ctx[name] = function () {
                var result = method(_super).apply(this, arguments);
                return result === undefined ? this : result;
            }
        };

    });
    require.register("chai/lib/chai/utils/overwriteProperty.js", function(exports, require, module){
        /*!
         * Chai - overwriteProperty utility
         * Copyright(c) 2012-2013 Jake Luer <jake@alogicalparadox.com>
         * MIT Licensed
         */

        /**
         * ### overwriteProperty (ctx, name, fn)
         *
         * Overwites an already existing property getter and provides
         * access to previous value. Must return function to use as getter.
         *
         *     utils.overwriteProperty(chai.Assertion.prototype, 'ok', function (_super) {
 *       return function () {
 *         var obj = utils.flag(this, 'object');
 *         if (obj instanceof Foo) {
 *           new chai.Assertion(obj.name).to.equal('bar');
 *         } else {
 *           _super.call(this);
 *         }
 *       }
 *     });
         *
         *
         * Can also be accessed directly from `chai.Assertion`.
         *
         *     chai.Assertion.overwriteProperty('foo', fn);
         *
         * Then can be used as any other assertion.
         *
         *     expect(myFoo).to.be.ok;
         *
         * @param {Object} ctx object whose property is to be overwritten
         * @param {String} name of property to overwrite
         * @param {Function} getter function that returns a getter function to be used for name
         * @name overwriteProperty
         * @api public
         */

        module.exports = function (ctx, name, getter) {
            var _get = Object.getOwnPropertyDescriptor(ctx, name)
                , _super = function () {};

            if (_get && 'function' === typeof _get.get)
                _super = _get.get

            Object.defineProperty(ctx, name,
                { get: function () {
                    var result = getter(_super).call(this);
                    return result === undefined ? this : result;
                }
                    , configurable: true
                });
        };

    });
    require.register("chai/lib/chai/utils/test.js", function(exports, require, module){
        /*!
         * Chai - test utility
         * Copyright(c) 2012-2013 Jake Luer <jake@alogicalparadox.com>
         * MIT Licensed
         */

        /*!
         * Module dependancies
         */

        var flag = require('./flag');

        /**
         * # test(object, expression)
         *
         * Test and object for expression.
         *
         * @param {Object} object (constructed Assertion)
         * @param {Arguments} chai.Assertion.prototype.assert arguments
         */

        module.exports = function (obj, args) {
            var negate = flag(obj, 'negate')
                , expr = args[0];
            return negate ? !expr : expr;
        };

    });
    require.register("chai/lib/chai/utils/transferFlags.js", function(exports, require, module){
        /*!
         * Chai - transferFlags utility
         * Copyright(c) 2012-2013 Jake Luer <jake@alogicalparadox.com>
         * MIT Licensed
         */

        /**
         * ### transferFlags(assertion, object, includeAll = true)
         *
         * Transfer all the flags for `assertion` to `object`. If
         * `includeAll` is set to `false`, then the base Chai
         * assertion flags (namely `object`, `ssfi`, and `message`)
         * will not be transferred.
         *
         *
         *     var newAssertion = new Assertion();
         *     utils.transferFlags(assertion, newAssertion);
         *
         *     var anotherAsseriton = new Assertion(myObj);
         *     utils.transferFlags(assertion, anotherAssertion, false);
         *
         * @param {Assertion} assertion the assertion to transfer the flags from
         * @param {Object} object the object to transfer the flags too; usually a new assertion
         * @param {Boolean} includeAll
         * @name getAllFlags
         * @api private
         */

        module.exports = function (assertion, object, includeAll) {
            var flags = assertion.__flags || (assertion.__flags = Object.create(null));

            if (!object.__flags) {
                object.__flags = Object.create(null);
            }

            includeAll = arguments.length === 3 ? includeAll : true;

            for (var flag in flags) {
                if (includeAll ||
                    (flag !== 'object' && flag !== 'ssfi' && flag != 'message')) {
                    object.__flags[flag] = flags[flag];
                }
            }
        };

    });
    require.register("chai/lib/chai/utils/type.js", function(exports, require, module){
        /*!
         * Chai - type utility
         * Copyright(c) 2012-2013 Jake Luer <jake@alogicalparadox.com>
         * MIT Licensed
         */

        /*!
         * Detectable javascript natives
         */

        var natives = {
            '[object Arguments]': 'arguments'
            , '[object Array]': 'array'
            , '[object Date]': 'date'
            , '[object Function]': 'function'
            , '[object Number]': 'number'
            , '[object RegExp]': 'regexp'
            , '[object String]': 'string'
        };

        /**
         * ### type(object)
         *
         * Better implementation of `typeof` detection that can
         * be used cross-browser. Handles the inconsistencies of
         * Array, `null`, and `undefined` detection.
         *
         *     utils.type({}) // 'object'
         *     utils.type(null) // `null'
         *     utils.type(undefined) // `undefined`
         *     utils.type([]) // `array`
         *
         * @param {Mixed} object to detect type of
         * @name type
         * @api private
         */

        module.exports = function (obj) {
            var str = Object.prototype.toString.call(obj);
            if (natives[str]) return natives[str];
            if (obj === null) return 'null';
            if (obj === undefined) return 'undefined';
            if (obj === Object(obj)) return 'object';
            return typeof obj;
        };

    });


    require.alias("chaijs-assertion-error/index.js", "chai/deps/assertion-error/index.js");
    require.alias("chaijs-assertion-error/index.js", "chai/deps/assertion-error/index.js");
    require.alias("chaijs-assertion-error/index.js", "assertion-error/index.js");
    require.alias("chaijs-assertion-error/index.js", "chaijs-assertion-error/index.js");
    require.alias("chaijs-deep-eql/lib/eql.js", "chai/deps/deep-eql/lib/eql.js");
    require.alias("chaijs-deep-eql/lib/eql.js", "chai/deps/deep-eql/index.js");
    require.alias("chaijs-deep-eql/lib/eql.js", "deep-eql/index.js");
    require.alias("chaijs-type-detect/lib/type.js", "chaijs-deep-eql/deps/type-detect/lib/type.js");
    require.alias("chaijs-type-detect/lib/type.js", "chaijs-deep-eql/deps/type-detect/index.js");
    require.alias("chaijs-type-detect/lib/type.js", "chaijs-type-detect/index.js");
    require.alias("chaijs-deep-eql/lib/eql.js", "chaijs-deep-eql/index.js");
    require.alias("chai/index.js", "chai/index.js");if (typeof exports == "object") {
        module.exports = require("chai");
    } else if (typeof define == "function" && define.amd) {
        define(function(){ return require("chai"); });
    } else {
        this["chai"] = require("chai");
    }})();