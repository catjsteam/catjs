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
                var tempInfo = tests[i];
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
                var innerConfigMap = [];
                if (innerConfig.tests) {
                    for (var i = 0; i < innerConfig.tests.length; i++) {
                        innerConfig.tests[i].wasRun = false;
                        innerConfigMap.push(innerConfig.tests[i]);
                    }
                }
                return innerConfigMap;
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
                                _cat.core.setManagerBehavior(managerScrap.scrap.name[0], tempScrap.scrap.name[0], tempScrap.repeat);
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
