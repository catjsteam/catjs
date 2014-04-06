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
                    if (!(testList.tests[i].disable)) {
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
                        if (callsIdx < matchvalues.length) {
                            __callMatchValues(callsIdx, callback);
                        }

                        if (callbackCounter === matchvalues.length) {
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