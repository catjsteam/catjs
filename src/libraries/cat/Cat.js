var _cat = {
    utils: {},
    plugins: {},
    ui: {},
    errors: {}
};

var hasPhantomjs = false;

_cat.core = function () {

    var managerScraps = [],
        testNumber = 0,
        getScrapTestInfo,
        addScrapToManager,
        _vars, _managers, _context,
        _config, _log,
        _guid,
        _enum,
        _runModeValidation,
        _catjspath;

    addScrapToManager = function (testsInfo, scrap) {

        var i, test, testRepeats,
            testDelay, preformVal, pkgNameVal,
            catConfig = _cat.core.getConfig(),
            delay = catConfig.getTestDelay();

        for (i = 0; i < testsInfo.length; i++) {
            testNumber--;
            test = testsInfo[i];

            testRepeats = parseInt((test.repeat ? test.repeat : 1));
            test.repeat = "repeat(" + testRepeats + ")";
            testDelay = "delay(" + (test.delay ? test.delay : delay) + ")";
            preformVal = "@@" + scrap.name[0] + " " + testRepeats;
            pkgNameVal = scrap.pkgName + "$$cat";
            if (test.scenario) {
                scrap.scenario = test.scenario;
            }
            managerScraps[test.index] = {"preform": preformVal,
                "pkgName": pkgNameVal,
                "repeat": testRepeats,
                "delay": testDelay,
                "name": scrap.name[0],
                "scrap": scrap};
        }

    };

    getScrapTestInfo = function (tests, scrapName) {
        var scrapTests = [],
            i, size,
            validate = 0,
            tempInfo,
            testsNames = [],
            testsname;

        if (tests && scrapName) {
            size = tests.length;
            for (i = 0; i < size; i++) {
                testsname = tests[i].name;
                testsNames.push(testsname);
                if (testsname === scrapName) {
                    tempInfo = {"name": testsname,
                        "scenario": tests[i].scenario,
                        "wasRun": tests[i].wasRun,
                        "delay": tests[i].delay,
                        "repeat": tests[i].repeat};
                    tempInfo.index = i;
                    scrapTests.push(tempInfo);
                    validate++;
                }
            }
        }

        if (!_cat.core.ui.isOpen()) {
            _cat.core.ui.on();
        }

        if (!validate) {
            _log.log("[catjs Info] skipping scrap: '" + scrapName + ";  Not included in the test project: [ " + (tests && testsNames ? testsNames.join(", ") : "" ) + "]");
        }
        return scrapTests;
    };


    _vars = {};
    _managers = {};
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
            },

            getAll: function () {
                return _scraps;
            }
        };

    }();

    _log = console;

    (function () {
        if (!String.prototype.trim) {
            String.prototype.trim = function () {
                return this.replace(/^\s+|\s+$/g, '');
            };
        }
    })();

    function _import(query, callback) {

        var type = _cat.utils.Utils.querystring("type", query),
            basedir = _cat.utils.Utils.querystring("basedir", query),
            libs = _cat.utils.Utils.querystring("libs", query),
            idx = 0, size;

        if (type === "import") {
            libs = libs.split(",");
            size = libs.length;
            for (; idx < size; idx++) {

                libs[idx] = [basedir, libs[idx], (_cat.utils.Utils.extExists(libs[idx]) ? "" : ".js")].join("");
            }
            _cat.utils.Loader.requires(libs, callback);
        }

    }

    return {

        log: _log,

        onload: function (libs) {

            // @deprecated - injecting the library directly to the code.
            // load the libraries
            //_import(libs);

            // catjs initialization
            //_cat.core.init();

        },

        init: function (config) {

            // set catjs path
            if (config) {
                if ("catjspath" in config) {
                    _catjspath = config.catjspath;
                }
            }

            _cat.utils.TestsDB.init();

                // plugin initialization
            (function() {
                var key;
                if (typeof _cat.plugins.jquery !== "undefined") {
                    for (key in _cat.plugins.jquery.actions) {
                        if (_cat.plugins.jquery.actions.hasOwnProperty(key)) {
                            _cat.plugins.jqm.actions[key] = _cat.plugins.jquery.actions[key];
                        }
                    }
                }
            })();            

            _enum = _cat.core.TestManager.enum;
            
            _guid = _cat.utils.Storage.getGUID();
            
            _config = new _cat.core.Config({
                hasPhantomjs: hasPhantomjs
            });

            // display the ui, if you didn't already
            if (_config.isUI()) {
                _cat.core.ui.enable();
                if (!_cat.core.ui.isOpen()) {
                    _cat.core.ui.on();
                }
            } else {
                _cat.core.ui.disable();
                _cat.core.ui.off();
                _cat.core.ui.destroy();
            }
            
            // Test Manager Init
            _cat.core.TestManager.init();
            
            // set scrap data info
            _cat.core.TestManager.setSummaryInfo(_cat.core.getSummaryInfo());                       

            if (_config.isErrors()) {

                // register DOM's error listener
                _cat.core.errors.listen(function (message, filename, lineno, colno, error) {

                    var catconfig = _cat.core.getConfig(),
                        reportFormats;

                    if (catconfig.isReport()) {
                        reportFormats = catconfig.getReportFormats();
                    }

                    // create catjs assertion entry
                    _cat.utils.assert.create({
                        name: "generalJSError",
                        displayName: "General JavaScript Error",
                        status: "failure",
                        message: [message, " ;file: ", filename, " ;line: ", lineno, " ;column:", colno, " ;error:", error ].join(" "),
                        success: false,
                        ui: catconfig.isUI(),
                        send: reportFormats
                    });
                });
            }
        },

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

                var catConfig = _cat.core.getConfig(),
                    testdelay = catConfig.getTestDelay(),
                    delay = (config.delay || testdelay ),
                    repeat = (config.repeat || 1),
                    idx = 0,
                    func = function () {
                        var funcvar = (config.implKey ? _cat.core.getDefineImpl(config.implKey) : undefined);

                        if (funcvar && funcvar.call) {
                            funcvar.call(this);
                            config.callback.call(config);
                        }
                    };

                totalDelay = 0;
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
            if (key.indexOf("$$cat") === -1) {
                key += "$$cat";
            }
            return _vars[key];
        },
        
        getScraps: function() {
            
            var key, item, arr=[];
            for (key in _vars) {
                item = _vars[key];
                if (item && "scrap" in item) {
                    arr.push(item.scrap);
                }
            }
            
            return arr;  
        },

        getScrapByName : function(searchName) {
            var scraps = this.getScraps(),
                scrap,
                scrapName,
                i;

            for (i = 0; i < scraps.length; i++) {
                scrap = scraps[i];
                scrapName = scrap.name;
                scrapName = (Array.isArray(scrapName) ? scrapName[0] : scrapName);
                if (scrapName === searchName) {
                    return scrap;
                }
            }

        },


        getScrapById : function(searchId) {
            var scraps = this.getScraps(),
                scrap,
                scrapId,
                i;

            for (i = 0; i < scraps.length; i++) {
                scrap = scraps[i];
                scrapId = scrap.id;
                if (scrapId && scrapId === searchId) {
                    return scrap;
                }
            }

        },


        getSummaryInfo: function() {
          
            var scraps = _cat.core.getScraps(),
                info = {assert: {total: 0}},
                assertinfo = info.assert;
            
            if (scraps) {
                scraps.forEach(function(scrap) {
                    var assert;
                    if (scrap) {
                        assertinfo.total += ( ("assert" in scrap && scrap.assert.length > 0) ? scrap.assert.length : 0) ;
                    }
                });
            }
            
            return info;
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
            var scrap,
                runat, manager,
                pkgname, args = arguments,
                catConfig,
                tests,
                storageEnum = _cat.utils.Storage.enum,
                managerScrap, tempScrap,
                i, j, scrapobj;

            try {
                scrapobj = _cat.core.getVar(config.pkgName);
                if (scrapobj) {
                    scrap = scrapobj.scrap;
                }

                catConfig = _cat.core.getConfig();
                tests = (catConfig ? catConfig.getTests() : []);
                
            } catch(e) {
                _log.error("[catjs core] Could not load the following scrap by package name:", config.pkgName, " catjs project sources (cat.src.js) probably didn't load properly and catjs core not initialized. error: ", e );
                
                return undefined;
            }
            
            // The test ended ignore any action called
            if (_cat.core.TestManager.isTestEnd()) {                
                return undefined;
            }
                        
            if ((catConfig) && (catConfig.getRunMode() === _enum.TEST_MANAGER)) {
                if (tests.length > 0) {
                    _cat.core.clientmanager.signScrap(scrap, catConfig, arguments, tests);
                } else {
                    
                    _cat.core.TestManager.send({signal: 'NOTEST'});
                    _cat.core.TestManager.send({signal: 'TESTEND'});
                }

            } else {
                if ((catConfig) && (catConfig.getRunMode() === _enum.TEST_MANAGER_OFFLINE)) {
                    // check if the test name is in the cat.json
                    var scrapsTestsInfo = getScrapTestInfo(tests, scrap.name[0]);


                    pkgname = scrap.pkgName;
                    _cat.core.defineImpl(pkgname, function () {
                        var scrap = (config ? config.scrap : undefined);
                        if (scrap && scrap.scenario) {
                            _cat.utils.Storage.set(storageEnum.CURRENT_SCENARIO, scrap.scenario.name, storageEnum.SESSION);
                        }
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
                            managerScrap = managerScraps[managerScraps.length - 1];

                            // clear run-mode validation
                            clearInterval(_runModeValidation);


                            managerScrap.scrap.catui = ["on"];
                            managerScrap.scrap.manager = ["true"];


                            pkgname = managerScrap.scrap.pkgName;
                            if (!pkgname) {
                                _cat.core.log.error("[catjs action] Scrap's Package name is not valid");
                            } else {


                                for (i = 0; i < managerScraps.length; i++) {
                                    tempScrap = managerScraps[i];
                                    _cat.core.setManager(managerScrap.scrap.name[0], tempScrap.pkgName);
                                    // set number of repeats for scrap
                                    for (j = 0; j < tempScrap.repeat; j++) {
                                        _cat.core.setManagerBehavior(managerScrap.scrap.name[0], tempScrap.scrap.name[0], tempScrap.delay);
                                    }
                                }


                                /*  CAT UI call  */
                                _cat.core.ui.on();

                                /*  Manager call  */
                                (function () {
                                    _cat.core.managerCall(managerScrap.scrap.name[0], function () {                                       
                                        _cat.utils.TestManager.send('TESTEND');
                                    });
                                })();


                            }
                        }

                    }
                } else {

                    if (typeof catConfig === 'undefined' || catConfig.getRunMode() === _enum.ALL) {
                        runat = (("run@" in scrap) ? scrap["run@"][0] : undefined);
                        if (runat) {
                            manager = _cat.core.getManager(runat);
                            if (manager) {
                                pkgname = scrap.pkgName;
                                if (!pkgname) {
                                    _cat.core.log.error("[catjs action] Scrap's Package name is not valid");
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
                        _cat.core.log.info("[catjs action] " + scrap.name[0] + " was not run as it does not appears in testManager");
                    }
                }

            }

        },

        getConfig: function () {
            return (_config.available() ? _config : undefined);
        },


        /**
         * CAT core definition, used when injecting cat call
         *
         * @param config
         */
        actionimpl: function (thiz, config) {
            var scrap = _cat.core.getVar(config.pkgName).scrap,
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
                            arguments: passedArguments,
                            scrapinfo: ("scrapinfo" in config ? config.scrapinfo : undefined)

                        }, pkgName);
                        catObj.apply(_context, passedArguments);
                    }
                }
                _log.log("[catjs] Scrap call: ", config, " scrap: " + scrap.name + " this:" + thiz);
            }

        },

        guid: function () {
            return _guid;
        },

        getBaseUrl: function (url) {
            var regHtml,
                endInPage,
                pathname,
                result;

            var script, source, head;

            script = document.getElementById("catjsscript");
            if (script) {
                source = script.src;
                
            } else {
                source = _catjspath;
            }

            if (source) {
                if (source.indexOf("cat/lib/cat.js") !== -1) {
                    head = (source.split("cat/lib/cat.js")[0] || "");                
                } else {
                    head = (source.split("cat/lib/cat/cat.js")[0] || "");
                }
            } else {
                _log.warn("[catjs getBaseUrl] No valid base url was found ");
            }            
            
//
//
//            regHtml = "([/]?.*[/]*[/])+(.*[\\.html]?)";
//            endInPage = new RegExp(regHtml + "$");
//            pathname = window.location.pathname;
//            result = endInPage.exec(pathname);
//
//            if (result !== null) {
//                pathname = (RegExp.$1);
//            }
//            return  ([window.location.origin, pathname, (url || "")].join("") || "/");
            return  ([head, (url || "")].join("") || "/");
        }

    };

}();

if (typeof exports === "object") {
    module.exports = _cat;
}