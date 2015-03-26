var _cat = {
    utils: { plugins: { jqhelper: {}}},
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
        _module,
        _vars, _managers, _context,
        _config, _log,
        _guid,
        _enum,
        _runModeValidation,
        _catjspath,
        _rootcatcore,
        _rootWindow,
        _actionQueue = [],
        _isStateReady = false,
        _isReady = function() {

            var me = this;

            /**
             * [recursion] When catjs library is ready process the scraps waiting in the queue
             * 
             * @private
             */
            function _processAction() {
                var action;
                
                if (_actionQueue.length > 0) {
                    action = _actionQueue.shift();
                    if (action) {
                        _module.action.apply(me, action.args);
                    }
                    if (_actionQueue.length > 0) {
                        _processAction();
                    }
                }
            }                       
            
            if (_isStateReady) {
                _processAction();
            }
            
            return _isStateReady;
        };

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

    _module = {

        log: _log,

        onload: function (libs) {

            // @deprecated - injecting the library directly to the code.
            // load the libraries
            //_import(libs);

            // catjs initialization
            //_cat.core.init();

        },

        angular: function(config) {
            
            var ng = ((config && ("ng" in config) && config.ng ? config.ng : undefined) || (typeof angular !== "undefined" ? angular : undefined)),
               nghandle = ((config && ("app" in config) && config.app ? config.app : undefined)),
                versionMajor, versionMinor;


            versionMajor = ng.version.major;
            versionMinor = ng.version.minor;

            _log.log("[catjs core] angular (" + ng.version.full + ") handle found, initializing");
            
            function createCatjsModule() {

                var catjsmodule;
                
                try {
                
                    catjsmodule = ng.module("catjsmodule");
                    
                } catch(e) {
                   
                    // not exists ... 
                    
                }
                
                if (!catjsmodule) {
                    // debug _log.log("[catjs script directive] ng module directive initialization");
                    ng.module("catjsmodule", []).
                        directive('script', function() {
                            return {
                                restrict: 'E',
                                scope: false,
                                link: function(scope, elem, attr) {
                                    if (attr.id && attr.id === '__catjs_script_element') {
                                        _log.log("[catjs script directive] angularjs script directive found, processing the script element");
                                        var code = (elem ? elem.text() : undefined),
                                            _f;
    
                                        if (code) {
                                            _f = new Function(code);
                                            // debug _log.log("[catjs script directive] angularjs script directive, executing: ", elem.text());
    
                                            _f.call(this);
                                        }
                                    }
                                }
                            };
                        }).directive('link', function() {
                            return {
                                restrict: 'E',
                                scope: false,
                                link: function(scope, elem, attr) {
                                    if (attr.href.indexOf("cat.css" !== -1)) {
                                        var head = document.querySelector("head"),
                                            link;
                                        if (head) {
                                            link = document.createElement("link");
                                            link.rel = "stylesheet";
                                            link.href = attr.href;
                                            head.appendChild(link);
                                        }
                                    }
                                }
                            };
                        });
                }
            }
                    
            /* AngularJS Initialization */
            function ngscript(ng) {
                'use strict';

                var moduleName,
                    moduleNames,
                    nodeModuleObjectType;
                          
                function _require(app, moduleName) {
                    
                    if (app) {

                        _log.log("[catjs core angular] adding directives to module:" + (moduleName || " Not Spcified "));


                        app.requires.push("catjsmodule");

                    } else {
                        _log.warn("[catjs core angular] failed to initial angular module, test might not properly executed");
                    }
                }
                
                function _requireall(moduleNames) {

                    moduleNames.forEach(function(moduleName) {

                        var app;
                        
                        if (moduleName) {
                            
                            try {
                                app = ng.module(moduleName);
        
                            } catch(e) {
                                _log.warn("[catjs core angular] module name: ", moduleName, " has not being created, you might want to move the registration annotation after it's being initiated.");
                            }
        
                            _require(app, moduleName);
                        }                        
                    });
                }
            
                moduleName = (config && "moduleName" in config ? config.moduleName : "ng");
                               
                
                if (versionMajor === 1 ) {
            
                    if (nghandle) {          
                        _require(nghandle, moduleName);
                        
                    } else if (moduleName) {

                        nodeModuleObjectType = _cat.utils.Utils.getType(moduleName);
                        if (nodeModuleObjectType === "string") {
                            moduleNames = [moduleName]; 
                            
                        } else if (nodeModuleObjectType === "array" && moduleName.length > 0) {
                            moduleNames = moduleName;
                        }
                       
                        _requireall(moduleNames);
                    }
                             
                }
            }

            if (ng) {                                
                
                createCatjsModule();
                ngscript(ng);

            }

        },
        
        init: function (config) {

            var parentWindow,
                me = this;

            if (_cat.utils.iframe.isIframe()) {
                parentWindow = _rootWindow();
                try {
                    _rootcatcore = parentWindow.window._cat;
                } catch(e) {
                    _log.error("[catjs core] failed to resolve the parent window error:",e);
                }
             }
            
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
            
            _isStateReady = true;
            _isReady();
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

        getRootCatCore: function() {
          return _rootcatcore;            
        },
        
        getVar: function (key) {
            if (key.indexOf("$$cat") === -1) {
                key += "$$cat";
            }
            return _vars[key];
        },
        
        getScrapName: function(scrapName) {
            var scrapNameVal = (_cat.utils.Utils.isArray(scrapName) ?  scrapName[0] : scrapName);
            
            return scrapNameVal;
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

        validateUniqueScrapInfo: function(searchName) {
            var list = _module.getScrapsByName(searchName),
                size = (list ? list.length : 0),
                message;

            if (size === 0) {
                message = ["The scrap named '", searchName ,"' was not found. results:["];
            } else if (size > 0) {
                message = ["The scrap named '", searchName ,"' is ",(size > 1 ? "not ": ""), "unique. results: ["];
            }
            
            list.forEach(function(scrap) {
               message.push(_module.getScrapName(scrap.name), " (", scrap.pkgName , "); "); 
            });

            message.push("]");
            
            return message.join("");
        },
        
        /**
         * Get all match scraps by name
         * 
         * @param searchName {String} The scrap name
         * @returns {Array} Scrap object
         */
        getScrapsByName: function(searchName) {
            var scraps = this.getScraps(),
                scrap,
                scrapName,
                i, list = [];

            for (i = 0; i < scraps.length; i++) {
                scrap = scraps[i];
                scrapName = scrap.name;
                scrapName = (Array.isArray(scrapName) ? scrapName[0] : scrapName);
                if (scrapName === searchName) {
                    list.push(scrap);
                }
            }            
            
            return list;
        },

        /**
         * I feel lucky, Get the first scrap match by a name
         * 
         * @param searchName {String} The scrap name
         * @returns {*} Scrap object
         */
        getScrapByName : function(searchName) {
            var list = _module.getScrapsByName(searchName);
            return (list && list.length > 0 ? list[0] : undefined);
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

        actionInternal: function (thiz, config) {
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
        
        action: function(thiz, config) {

            _log.log("[catjs core evaluation] scrap [package name: ", config.pkgName, "  args: ", arguments, "]");
            
            if (!_isReady()) {
                _actionQueue.push({args: arguments});
            } else {
                _module.actionInternal.apply(this, arguments);
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
                    _log.log("[catjs core execution] scrap [name: " + _module.getScrapName(scrap.name) + ", pkgName:", config.pkgName, "configuration: ", config, "]");

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
            
            return  ([head, (url || "")].join("") || "/");
        }
    };
    
    return _module;

}();

if (typeof exports === "object") {
    module.exports = _cat;
}
_cat.core.Config = function(args) {

    var innerConfig,
        xmlhttp,
        configText,
        me = this,
        catjson = "cat/config/cat.json",
        _log = _cat.core.log,
        _enum = _cat.core.TestManager.enum,
        hasPhantomjs = args.hasPhantomjs;

    try {

        xmlhttp = _cat.utils.AJAX.sendRequestSync({
            url: _cat.core.getBaseUrl(catjson)
        });
        if (xmlhttp) {
            configText = xmlhttp.responseText;
            if (configText) {
                try {
                    innerConfig = JSON.parse(configText);
                } catch (e) {
                    _cat.core.log.error("[CAT Core] cat.json parse error: ", e);
                }
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

        this.getName = function () {
            return innerConfig.name;
        };

        this.getIp = function () {
            if (innerConfig.ip) {
                return innerConfig.ip;
            } else {
                return  document.location.hostname;
            }
        };
        
        this.getMethod = function () {
            if (innerConfig.method) {
                return innerConfig.method;
            } else {
                return  "http";
            }
        };

        this.getPort = function () {
            if (innerConfig.port) {
                return innerConfig.port;
            } else {
                return  document.location.port;
            }
        };

        this.isTests = function() {
            var tests = this.getTests();
            if (tests && tests.length && tests.length > 0) {
                return true;
            }
            
            return false;
        };

        /**
         * Validate if the current test is in the test scenarios scope and 
         * did not exceeded the test project index
         * 
         * @param currentidx {Number} The current test index 
         * @returns {boolean} If the test has ended return true or else false
         */
        this.isTestEnd = function(currentidx) {

            var tests = this.getTests(),
                size;
            
            if (tests && tests.length) {
                
                size = tests.length;
                if (currentidx >= size) {
                
                    return true;
                }
            }

            return false;
        };
        
        this.getTest = function(idx) {
          
            var tests = this.getTests();
            if (tests && tests.length && tests.length > 0) {
                return tests[idx];
            }
            
            return undefined;
        };
        
        this.getTestNames = function() {
            var list = this.getTests(),
                names = [];
            list.forEach(function(test){
               if (test) {
                   names.push(test.scenario.name + ":" + test.name);
               } 
            });
            
            return names.join(",");
        };
        
        this.getTests = function () {

            function _GetTestsClass(config) {

                this.globalTests = [];
                
                // do this once
                this.setTests = function (config) {

                    var getScenarioTests = function (testsList, globalDelay, scenarioName) {
                            var innerConfigMap = [],
                                repeatFlow, i, j, tempArr;
                            
                            if (testsList.tests) {
                                for (i = 0; i < testsList.tests.length; i++) {
                                    if (!(testsList.tests[i].disable)) {
                                        if (testsList.tests[i].tests) {
                                            repeatFlow = testsList.tests[i].repeat ? testsList.tests[i].repeat : 1;

                                            for (j = 0; j < repeatFlow; j++) {
                                                tempArr = getScenarioTests(testsList.tests[i], testsList.tests[i].delay);
                                                innerConfigMap = innerConfigMap.concat(tempArr);
                                            }

                                        } else {

                                            // set the global delay
                                            if (!testsList.tests[i].delay && globalDelay) {
                                                testsList.tests[i].delay = globalDelay;
                                            }
                                            testsList.tests[i].wasRun = false;
                                            testsList.tests[i].scenario = {
                                                name: (scenarioName || null), 
                                                path: (testsList.path || null)
                                            };
                                            innerConfigMap.push(testsList.tests[i]);

                                        }
                                    }
                                }
                            }

                            return innerConfigMap;

                        },                       
                        i, j, temp, testcounter = 0,
                        testsFlow, scenarios, scenario,
                        repeatScenario, currTest, currentTestName, currentTestPathTest,
                        me = this,
                        _addToGlobal = function(temp) {
                            temp.tests.forEach(function() {
                                me.globalTests.push(null);
                            });
                        };

                    testsFlow = config.tests;
                    scenarios = config.scenarios;
                    for (i = 0; i < testsFlow.length; i++) {
                        currTest = testsFlow[i];
                        currentTestPathTest = _cat.utils.Utils.pathMatch(currTest.path);
                        
                        if (!currTest || !("name" in currTest) ||!currentTestPathTest) {
                            if (!("name" in currTest)) {
                                _log.warn("[CAT] 'name' property is missing for the test configuration, see cat.json ");
                            }

                            temp = scenarios[currTest.name];
                            if (temp.tests) {
                                _addToGlobal(temp);
                            }
                            
                            continue;
                        }
                        currentTestName = currTest.name;
                        scenario = scenarios[currentTestName];

                        if (scenario) {
                            repeatScenario = (scenario.repeat ? scenario.repeat : 1);
                            for (j = 0; j < repeatScenario; j++) {
                                temp = (getScenarioTests(scenario, scenario.delay, currentTestName));
                                this.globalTests = this.globalTests.concat(temp);
                            }
                        } else {
                            _log.warn("[CAT] No valid scenario '", currTest.name, "' was found, double check your cat.json project");
                        }
                    }
                };

                if (_GetTestsClass._singletonInstance) {
                    return _GetTestsClass._singletonInstance;
                }

                this.setTests(config);

                _GetTestsClass._singletonInstance = this;

                this.getTests = function () {
                    return this.globalTests;
                };
            }
            
            var tests = new _GetTestsClass(innerConfig);

            return tests.getTests();

        };

        this.getTestDelay = function () {
            return (innerConfig["run-test-delay"] || 2000);
        };

        this.getRunMode = function () {
            return (innerConfig["run-mode"] || "all");
        };

        this.getTimeout = function () {
            var timeout = innerConfig["test-failure-timeout"];
            if (timeout) {
                timeout = parseInt(timeout);
                if (isNaN(timeout)) {
                    timeout = 30;
                }
            }
            timeout = timeout * 1000;
            return timeout;
        };

        this.isReportType = function (key) {
            var formats = me.getReportFormats(),
                i, size, item;

            if (formats && formats.length > 0) {
                size = formats.length;
                for (i = 0; i < size; i++) {
                    item = formats[i];
                    if (item === key) {
                        return true;
                    }
                }
            }

            return false;
        };

        this.isJUnitSupport = function () {

            return this.isReportType("junit");
        };

        this.isConsoleSupport = function () {

            return this.isReportType("console");
        };

        this.getReportFormats = function () {

            var format = [],
                report;

            if (_cat.utils.Utils.validate(innerConfig, "report")) {

                report = innerConfig.report;
                format = (report.format ? report.format : format);
            }

            return format;
        };

        this.isReport = function () {

            if (_cat.utils.Utils.validate(innerConfig, "report") && _cat.utils.Utils.validate(innerConfig.report, "disable", false)) {

                return true;
            }

            return false;
        };

        this.isErrors = function () {

            if (_cat.utils.Utils.validate(innerConfig, "assert") && _cat.utils.Utils.validate(innerConfig.assert, "errors", true)) {

                return true;
            }
            return false;
        };

        this.isUI = function () {
            if (_cat.utils.Utils.validate(innerConfig, "ui", true)) {

                return true;
            }

            return false;
        };

        this.getTestsTypes = function () {
            return _enum;
        };

    }

    this.hasPhantom = function () {
        return hasPhantomjs;
    };

    this.available = function () {
        return (innerConfig ? true : false);
    };
};
/**
 * General error handling for the hosted application
 * @type {_cat.core.errors}
 */
_cat.core.errors = function () {

    var _originalErrorListener,
        _listeners = [];

    if (window.onerror) {
        _originalErrorListener = window.onerror;
    }

    window.onerror = function(message, filename, lineno, colno, error) {

        var me = this;

        // call super
        if (_originalErrorListener) {
            _originalErrorListener.call(this, message, filename, lineno, colno, error);
        }

        // print the error
        _listeners.forEach(function(listener) {
            listener.call(me, message, filename, lineno, colno, error);
        });
    };

    return {

        listen: function(listener) {
            _listeners.push(listener);
        }
    };

}();
_cat.utils.assert = function () {


    function _sendTestResult(data) {

        var config = _cat.core.getConfig();

        if (config) {
            _cat.utils.AJAX.sendRequestSync({
                url: _cat.core.TestManager.generateAssertCall(config, data)
            });
        }
    }

    return {

        /**
         * Send assert message to the UI and/or to catjs server
         *
         * @param config
         *      name {String} The test name
         *      displayName {String} The test display name
         *      status {String} The status of the test (success | failure)
         *      message {String} The assert message
         *      success {Boolean} Whether the test succeeded or not
         *      ui {Boolean} Display the assert data in catjs UI
         *      send {Boolean} Send the assert data to the server
         */
        create: function (config) {

            if (!config) {
                return;
            }

            var testdata,
                total, failed, passed, tests;

            if (config.status && config.message && config.name && config.displayName) {


                testdata = _cat.core.TestManager.addTestData({
                    name: config.name,
                    type: config.type,
                    displayName: config.displayName,
                    status: config.status,
                    message: config.message,
                    success: (("success" in config && config.success) ? true : false), 
                    reportFormats: config.send

                });

                if (config.ui) {
                    total = _cat.core.TestManager.getTestCount();
                    passed = _cat.core.TestManager.getTestSucceededCount();
                    failed = total - passed;
                    tests =  (_cat.core.TestManager.getSummaryInfo().assert.total || "?");
                    _cat.core.ui.setContent({
                        style: ( (testdata.getStatus() === "success") ? "color:green" : "color:red" ),
                        header: testdata.getDisplayName(),
                        desc: testdata.getMessage(),
                        tips: {tests: tests ,passed: (!isNaN(passed) ? passed : "?"), failed: (!isNaN(failed) ? failed : "?"), total: (!isNaN(total) ? total: "?")},
                        elementType : ( (testdata.getStatus() === "success") ? "listImageCheck" : "listImageCross" )
                    });
                }

                // TODO parse report formats : consider api for getConsole; getJUnit ...
                if (config.send) {
                    _sendTestResult(testdata);
                }
            }
        }

    };

}();
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
            _cat.core.log.info("[catjs chai utils] Chai library is not supported, skipping annotation 'assert', consider adding it to the .catproject dependencies");
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

        /**
         * This is an assert
         * In case of compile (nodejs) use assert_call.tpl 
         * 
         * Examples:
         *   
         *   // Code String case: 
         *   _cat.core.clientmanager.delayManager({
         *       commands: [
         *           function(context, thi$, testButton) {
         *               _cat.utils.chai.assert(context);
         *           }
         *       ],
         *       context: {
         *           'code': ["assert", "ok(testButton[0],\"No valid test element button\")\n"].join("."),
         *           'fail': true,
         *           scrapName: 'assert',
         *           scrap: _ipkg.scrap,
         *           args: _args,
         *           scrapRowIdx: 0
         *       }
         *   });
         *   
         *   // Code function case:
         *   
         * @param config
         * @constructor
         */
        assert: function (config) {

            if (!_state) {
                _isSupported();
            }

            var code,
                result,
                fail,
                failure,
                scrap = config.scrap,
                scrapName = (_cat.utils.Utils.isArray(scrap.name) ?  scrap.name[0] : scrap.name),
                scrapDescription = (scrap.description ? scrap.description[0] : undefined),
                testName = (scrapName || "NA"),
                key, items=[], args=[],
                catconfig = _cat.core.getConfig(),
                reportFormats;

            if (_chai) {
                if (config) {
                    code = config.code;
                    fail = config.fail;
                }
                if (assert) {
                    var success = true;
                    var output;
                    if (code) {
                        try {
                            
                            if (_cat.utils.Utils.isFunction(code)) {
                                
                                result = code.apply(this, arguments);
                                
                            } else if (_cat.utils.Utils.isString(code)) { 
                                
                                items.push(assert);
                                    args.push("assert");
                                    for (key in config.args) {
                                    if (config.args.hasOwnProperty(key)) {
                                        args.push(key);
                                        items.push(config.args[key]);
                                    }
                                }
    
                                if (code.indexOf("JSPath.") !== -1) {
                                    items.push((typeof JSPath !== "undefined" ? JSPath : undefined));
                                    args.push("JSPath");
                                    result =  new Function(args, "if (JSPath) { return " + code + "} else { console.log('Missing dependency : JSPath');  }").apply(this, items);
                                } else {
                                    result =  new Function(args, "return " + code).apply(this, items);
                                }
                            }

                        } catch (e) {
                            success = false;
                            output = ["[CAT] Test failed, exception: ", e].join("");
                        }
                    }

                    if (success) {
                        output = "Test Passed";
                    }

                    if (catconfig.isReport()) {
                        reportFormats = catconfig.getReportFormats();
                    }

                    // create catjs assertion entry
                    _cat.utils.assert.create({
                        name: testName,
                        displayName:  (scrapDescription || _getDisplayName(testName)),
                        status: (success ? "success" : "failure"),
                        message: output,
                        success: success,
                        ui: catconfig.isUI(),
                        send: reportFormats
                    });

                    if (!success) {
                        console.warn((output || "[CAT] Hmmm... It's an error alright, can't find any additional information"), (fail || ""));
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
_cat.core.clientmanager = function () {

    var tests,
        commitScrap,
        getScrapTestInfo,
        totalDelay,
        runStatus,
        checkIfExists,
        updateTimeouts,
        initCurrentState = false,
        startInterval,
        delayManagerCommands,
        getScrapInterval,
        setupInterval,
        intervalObj,
        endTest,
        testQueue,
        currentState = { index: 0, testend: false },
        clientmanagerId,
        _log = _cat.core.log;


    endTest = function (opt, interval) {

        // set state flag
        currentState.testend = true;
        
        _cat.core.TestManager.send({signal: 'TESTEND', error: opt.error});
        if (interval === -1) {
            _log.log("[catjs client manager] Test End");
        } else {
            clearInterval(interval);
        }
    };

    runStatus = {
        "scrapReady": 0,
        "subscrapReady": 0,
        "numRanSubscrap": 0,
        "scrapsNumber": 0

    };

    getScrapInterval = function (scrap) {
        var scrapId = scrap.id;

        if (!runStatus.intervalObj) {
            runStatus.intervalObj = {
                "interval": undefined,
                "counter": 0,
                "signScrapId": scrapId
            };
        } else {
            runStatus.intervalObj.signScrapId = scrapId;
        }

        if (intervalObj) {
            clearInterval(intervalObj.interval);
        }

        return runStatus.intervalObj;
    };


    setupInterval = function (config, scrap) {

        var tests,
            testManager, 
            validateExists,
            item;

        intervalObj = getScrapInterval(scrap);

        tests = config.getTests();
        if (tests) {
            item = tests[tests.length - 1];
            if (item) {
                testManager = ( item.name || "NA");
            }
        }


        validateExists = _cat.core.getScrapById(intervalObj.signScrapId);
        
        if ( (_cat.core.getScrapName(scrap.name) === _cat.core.getScrapName(validateExists.name)) && !intervalObj.interval ) {
        
            intervalObj.interval = setInterval(function () {
    
                var msg = ["No test activity, retry: "];
                if (intervalObj.counter < 3) {
                    intervalObj.counter++;
    
                    msg.push(intervalObj.counter);
    
                    _cat.core.ui.setContent({
                        header: "Test Status",
                        desc: msg.join(""),
                        tips: {},
                        style: "color:gray",
                        currentState: currentState
                    });
    
                    _log.log("[CatJS client manager] ", msg.join(""));
    
                } else {
                    var err = "run-mode=tests catjs manager '" + testManager + "' is not reachable or not exists, review the test name and/or the tests code.";
    
                    _log.log("[catjs client manager] error: ", err);
                    endTest({error: err}, (runStatus ? runStatus.intervalObj : undefined));
                    clearInterval(intervalObj.interval);
                }
            }, config.getTimeout() / 3);
        }
        
        return;
    };


    commitScrap = function (scrap, args) {
        var scrapInfo,
            repeat,
            scrapInfoArr,
            infoIndex,
            repeatIndex,
            size;

        scrapInfoArr = getScrapTestInfo(scrap);
        size = scrapInfoArr.length;
        for (infoIndex = 0; infoIndex < size; infoIndex++) {
            scrapInfo = scrapInfoArr[infoIndex];
            repeat = scrapInfo.repeat || 1;
            for (repeatIndex = 0; repeatIndex < repeat; repeatIndex++) {
                _cat.core.actionimpl.apply(this, args);
            }
        }
    };


    getScrapTestInfo = function (scrap) {
        var scrapTests = [],
            i, size,
            validate = 0,
            tempInfo,
            scrapName = scrap.name,
            idx = (!isNaN(scrap.index) ? scrap.index : -1),
            testItem,
            isStandalone = _isStandalone(scrap);

        function setScrapTests(test) {
            tempInfo = {
                "name": test.name,
                "scenario": (test.scenario || undefined),
                "wasRun": (test.wasRun || false),
                "delay": (test.delay || undefined),
                "repeat": (test.repeat || undefined)
            };
            tempInfo.index = i;
            scrapTests.push(tempInfo);
            validate++;
        }

        if (isStandalone) {
            setScrapTests({
                name: scrapName
            });

        } else if (tests && scrapName) {
            /* 
            size = tests.length;
            for (i = 0; i < size; i++) {

                if (tests[i].name === scrapName) {
                    setScrapTests(tests[i]);
                }
            } 
            */
            testItem = (idx !== -1 ? tests[idx] : undefined);
            if (testItem && testItem.name === scrapName) {
                setScrapTests(testItem);
            }
        }

        if (!validate) {
            console.warn("[CatJS] Failed to match a scrap with named: '" + scrapName + "'. Check your cat.json project");
            if (!_cat.core.ui.isOpen()) {
                _cat.core.ui.on();
            }
        }
        return scrapTests;
    };

    checkIfExists = function (scrapName, tests) {

        var indexScrap = 0, size = (tests && tests.length ? tests.length : 0),
            testitem, path;      
        
        for (; indexScrap < size; indexScrap++) {
            testitem = tests[indexScrap];
            if (testitem) {
                path = testitem.scenario.path;
                if (testitem && testitem.name === scrapName && _cat.utils.Utils.pathMatch(path)) {
                    return {scrap: testitem, idx: indexScrap};
                }
            }
        }
        return undefined;
    };

    totalDelay = 0;

    updateTimeouts = function (scrap) {
        var scrapId = scrap.id;

        if (runStatus.intervalObj && (scrapId !== runStatus.intervalObj.signScrapId)) {
            runStatus.intervalObj.signScrapId = scrapId;
            runStatus.intervalObj.counter = 0;
        }
    };

    startInterval = function (catConfig, scrap) {
        setupInterval(catConfig, scrap);
    };

    delayManagerCommands = function (dmcommands, dmcontext) {

        var indexCommand = 0,
            catConfig = _cat.core.getConfig(),
            _enum = catConfig.getTestsTypes(),
            executeCode,
            delay = catConfig.getTestDelay(),
            scrap = ("scrap" in dmcontext  ? dmcontext.scrap : undefined),
            standalone = _isStandalone(scrap),
            testobj, currentTestIdx,
            manager = false,
            me = this;

        currentTestIdx = currentState.index;
        testobj = catConfig.getTest(currentTestIdx);
        if (testobj) {
            if ("delay" in testobj) {
                delay = testobj.delay; 
            }
        }
        
        executeCode = function (codeCommandsArg, contextArg) {
            var commandObj,
                scrap = contextArg.scrap,
                size = (codeCommandsArg ? codeCommandsArg.length : undefined),
                functionargskeys = [],
                functionargs = [],
                contextkey,
                scrapName = ("scrapName" in contextArg ? contextArg.scrapName : undefined),
                scrapRowIdx = ("scrapRowIdx" in contextArg ? contextArg.scrapRowIdx : undefined),
                description = [],
                rows, idx = 0, rowssize = 0, row;


            updateTimeouts(scrap);

            for (indexCommand = 0; indexCommand < size; indexCommand++) {
                commandObj = codeCommandsArg[indexCommand];

                if (commandObj) {
                    functionargskeys.push("context");
                    functionargs.push(contextArg);

                    if (contextArg && contextArg.args) {
                        for (contextkey in contextArg.args) {
                            if (contextArg.args.hasOwnProperty(contextkey)) {
                                functionargskeys.push(contextkey);
                                functionargs.push(contextArg.args[contextkey]);
                            }
                        }
                    }

                    rows = ( (scrap && scrapName && scrapName in scrap) ? scrap[scrapName] : [commandObj]);
                    if (rows) {
                        description.push(rows[scrapRowIdx] || rows[0]);
                    }

//                    rowssize = rows.length;
//                    for (; idx<rowssize; idx++) {
//                        row = rows[idx];
//                        if (row) {
//                            description.push(row);
//                        }
//                    }

                    _cat.core.ui.setContent({
                        style: 'color:#0080FF, font-size: 10px',
                        header: ((scrap && "name" in scrap && scrap.name) || "'NA'"),
                        desc: (description.length > 0 ? description.join("_$$_") : description.join("")),
                        tips: {},
                        currentState: currentState
                    });

                    if (_cat.utils.Utils.getType(commandObj) === "string") {
                        commandObj = (commandObj ? commandObj.trim() : undefined);
                        new Function(functionargskeys.join(","), "return " + commandObj).apply(this, functionargs);

                    } else if (_cat.utils.Utils.getType(commandObj) === "function") {
                        commandObj.apply(this, functionargs);
                    }

                } else {
                    console.warn("[CatJS] Ignore, Not a valid command: ", commandObj);
                }
            }

            runStatus.numRanSubscrap = runStatus.numRanSubscrap + size;

            if ((runStatus.numRanSubscrap === runStatus.subscrapReady) && runStatus.scrapReady === runStatus.scrapsNumber) {
                var reportFormats;
                if (catConfig.isReport()) {
                    reportFormats = catConfig.getReportFormats();
                }

                // TODO change clear interval
                endTest({reportFormats: reportFormats}, (runStatus.intervalObj ? runStatus.intervalObj.interval : undefined));
            }

        };

        runStatus.subscrapReady = runStatus.subscrapReady + dmcommands.length;

        if ( ((catConfig) && (catConfig.getRunMode() === _enum.TEST_MANAGER)) && !standalone) {
            setTimeout(function () {
                executeCode(dmcommands, dmcontext);
            }, totalDelay);
            totalDelay += delay;
        } else {
            executeCode(dmcommands, dmcontext);
        }
        
       /* if ( ((catConfig) && (catConfig.getRunMode() === _enum.TEST_MANAGER)) && !standalone) {
            manager = true;             
                        
        } else {
            manager = false;
        }

        _cat.core.controller.add(
            {
                fn: function() {
                    executeCode(dmcommands, dmcontext);
                },
                manager: manager,
                totalDelay: totalDelay,
                delay : totalDelay,
                me: me
            });
            */
    };

    function _preScrapProcess(config, args) {
        config.args = args;
        if (args.length && args.length > 1 && (_cat.utils.Utils.getType(args[1]) === "object")) {
            args[1].scrapinfo = config.scrapInfo;
        }
    }

    function _process(config) {
        var scrap = config.scrapInfo,
            args = config.args,
            fullScrap;

        if (scrap) {
            runStatus.scrapReady = parseInt(scrap ? scrap.index : 0) + 1;
            commitScrap(scrap, args);
        }

        fullScrap = _cat.core.getScrapByName(scrap.name);
        if (fullScrap) {
            broadcastAfterProcess(fullScrap);
        }

    }

    function _isStandalone(scrap) {
        var standalone = ("$standalone" in scrap ? scrap.$standalone : undefined);
        return standalone;
    }

    function _nextScrap(config) {

        var scrap = config.scrap,
            tests = config.tests,
            args = config.args,
            testsize = tests.length,
            currentStateIdx = currentState.index,
            scrapName = (_cat.utils.Utils.isArray(scrap.name) ?  scrap.name[0] : scrap.name),
            exists = checkIfExists(scrapName, tests),
            preScrapConfig;

        if ((exists && (!testQueue.get(currentStateIdx - 1).first()) && (exists.idx === (currentStateIdx - 1)) || _isStandalone(scrap))) {
            preScrapConfig = {scrapInfo: scrap, args: args};
            _preScrapProcess(preScrapConfig, args);
            commitScrap({$standalone: scrap.$standalone, name: scrapName}, args);

        } else if (exists && (currentStateIdx < testsize)) {
            return true;
        }


        return false;
    }

    /**
     * Broadcast to execute the ready process and share the current state
     * 
     * @param doprocess {Boolean} Whether to process or not  
     * 
     * @private
     */
    function broadcastProcess(doprocess, dostate) {

        var topic = "process." + _cat.core.clientmanager.getClientmanagerId();

        doprocess = (doprocess === undefined ? true : doprocess);
        dostate = (dostate === undefined ? true : dostate);
        
        flyer.broadcast({
            channel: "default",
            topic: topic,
            data: {
                totalDelay: totalDelay,
                currentState: (dostate ? currentState : undefined),
                doprocess: (doprocess || true)
            }
        });
    }


    /**
     * Listener for the process broadcaster
     * 
     * @private
     */
    function _subscribeProcess() {
        flyer.subscribe({
            channel: "default",
            topic: "process.*",
            callback: function(data, topic, channel) {
                var clientTopic = "process." + _cat.core.clientmanager.getClientmanagerId();
                
                // update the current state
                if ("currentState" in data && data.currentState) {
                    currentState = data.currentState;   
                }  
                
                // update the total delay
                if ("currentState" in data && data.totalDelay) {
                    totalDelay = data.totalDelay;   
                }                
                
                // check if it's the same frame
                if (topic !== clientTopic) {      
                    
                    if (data.doprocess) {
                        _processReadyScraps(true);
                    }

                }
            }
        });
    }

    _subscribeProcess();


    function broadcastAfterProcess(fullScrap) {
        var topic = "afterprocess." + _cat.core.clientmanager.getClientmanagerId();

        flyer.broadcast({
            channel: "default",
            topic: topic,
            data: fullScrap
        });

    }



    function _subscribeAfterProcess() {
        flyer.subscribe({
            channel: "default",
            topic: "afterprocess.*",
            callback: function(data, topic, channel) {
                var clientTopic = "afterprocess." + _cat.core.clientmanager.getClientmanagerId();
                // check if it's the same frame
                //if (topic !== clientTopic) {
                    _cat.core.clientmanager.removeIntervalFromBroadcast(data);
                //}

            }
        });
    }

    _subscribeAfterProcess();




    function _processReadyScraps(cameFromBroadcast) {
        var idx = currentState.index,
            catConfig, test,
            testitem = testQueue.get({index: idx}),
            testname,
            emptyQueue = testQueue.isEmpty(),
            queuedesc = (emptyQueue ? "no " : ""),
            firstfound = false,
            broadcast = false;


        // TODO add as a debug info
        catConfig = _cat.core.getConfig();
        test = catConfig.getTest(idx);
        testname = (test ? _cat.core.getScrapName(test.name) : undefined );
        if (testname) {
            _log.log("[catjs client manager status] scraps execution status: ready; There are " + queuedesc + "scraps in the queue. current index: ", idx, " test: ", testname);
            _log.log("[catjs client manager status] ", _cat.core.validateUniqueScrapInfo(testname));
        } else {
            _log.log("[catjs client manager status] scraps execution status: ready; current index: ", idx);
        }
        
        if (testitem.first()) {
            var configs = testitem.all();
            configs.forEach(function(config) {
                if (config) {
                    _process(config);
                  
                    currentState.index++;

                    if (intervalObj && intervalObj.interval) {
                        clearInterval(intervalObj.interval);
                    }                   
                    _processReadyScraps(false);
                } 
            });
            testitem.deleteAll();
            broadcastProcess(false, true);
            firstfound = true;
        } else {
            if (!cameFromBroadcast) {
                broadcastProcess(true, true);
                broadcast = true;                
            }
        }        
    }

    function scrapTestIndex(scrap) {
        var index;
        for (index = 0; index < tests.length; index++) {
            if (tests && tests[index] && scrap.name[0] === tests[index].name) {
                return index;
            }
        }
    }




    return {



        signScrap: function (scrap, catConfig, args, _tests) {
            var urlAddress,
                config,
                scrapName,
                currentStateIdx,
                reportFormats;
            
            if (!testQueue) {
                testQueue = new _cat.core.TestQueue();
            }
            
            runStatus.scrapsNumber = _tests.length;
            tests = _tests;
            scrapName = (_cat.utils.Utils.isArray(scrap.name) ?  scrap.name[0] : scrap.name);

            currentStateIdx = currentState.index;
            if (catConfig.isTestEnd(currentStateIdx)) {

                //currentState.testend = true;
                
                return undefined; 
            }
            
            if (_nextScrap({scrap: scrap, tests: tests, args: args})) {
                startInterval(catConfig, scrap);
                urlAddress = _cat.utils.Utils.getCatjsServerURL("/scraps?scrap=" + scrapName + "&" + "testId=" + _cat.core.guid());

                config = {
                    
                    url: urlAddress,
                    
                    callback: function () {

                        var response = JSON.parse(this.responseText),
                            scraplist, reportFormats, errmsg;

                        function _add2Queue(config) {
                            var scrapInfo,
                                counter,
                                configclone = {};
                            
                            _preScrapProcess(config, args);
                            scrapInfo = config.scrapInfo;                            
                            testQueue.add(scrapInfo.index, config);
                            //counter = scrapInfo.index;
                            counter = 0;
                            
                            if (tests) {
                                tests.forEach(function(test) {
                                    var name, testname, size;
                                    
                                    function _setScrapInfoProperty(name, dest, src, srcScrapPropName, destScrapPropName, value) {
                                        if (name in test) {
                                            dest[destScrapPropName][name] = (value !== undefined ? value : src[name]);
                                        } else {
                                            delete dest[destScrapPropName][name];
                                        }
                                    }
                                    
                                    function _scrapInfoSerialization(dest, src, srcScrapPropName, destScrapPropName) {

                                        dest[destScrapPropName] = JSON.parse(JSON.stringify(config[srcScrapPropName]));
                                        dest[destScrapPropName].index = counter;
                                        _setScrapInfoProperty("delay", dest, src, srcScrapPropName, destScrapPropName);
                                        _setScrapInfoProperty("repeat", dest, src, srcScrapPropName, destScrapPropName);
                                        _setScrapInfoProperty("run", dest, src, srcScrapPropName, destScrapPropName, true);
                                    }
                                    
                                    size = tests.length;
                                    if (test && "name" in test &&  scrapInfo.index < size && counter < size && counter > scrapInfo.index) {
                                        name = _cat.core.getScrapName(scrapInfo.name);
                                        testname = _cat.core.getScrapName(test.name);
                                        
                                        if (name === testname) {
                                            // config.index = counter;
                                            configclone[counter] = {};

                                            _scrapInfoSerialization(configclone[counter], test, "scrapInfo", "scrapInfo");
                                            configclone[counter].args = config.args;
                                            _scrapInfoSerialization(configclone[counter].args[1], test, "scrapInfo", "scrapinfo");
                                            
                                            testQueue.add(counter, configclone[counter]);
                                        }
                                    }
                                    counter++;
                                });
                            }
                        }

                        if (!response.scrapInfo) {
                            errmsg = ["[catjs client manager] Something went wrong processing the scrap request, check your cat.json test project. current scrap index:", currentState.index, "; url:", urlAddress].join("");
                            _log.error(errmsg);

                            if (catConfig.isReport()) {
                                reportFormats = catConfig.getReportFormats();
                            }

                            endTest({error: errmsg}, (runStatus ? runStatus.intervalObj : undefined));

                            return undefined;
                        }
                        
                        if (response.ready) {
                            
                            if (!initCurrentState && !_cat.utils.iframe.isIframe()) {
                                initCurrentState = true;
                                currentState.index = (response.readyScraps && response.readyScraps[0] ? response.readyScraps[0].index : 0);
                            }


                            scraplist = response.readyScraps;
                            if (scraplist) {
                                scraplist.forEach(function (scrap) {
                                    var config = testQueue.get(scrap).first();
                                    if (config) {
                                        // already in queue;

                                    } else {
                                        var realScrap = _cat.core.getScrapByName(scrap.name);

                                        if (args[1].pkgName === realScrap.pkgName) {
                                            _add2Queue({scrapInfo: scrap, args: args});
                                        }
                                    }

                                });
                            }
                        } else {

                            _add2Queue({scrapInfo: response.scrapInfo, args: args});
                        }

                        _processReadyScraps(false);
                    }
                };

                _cat.utils.AJAX.sendRequestAsync(config);
                
            } else {
                _log.log("[catjs client manager] scrap was not signed. probably not part of the scenario [scrap: ", _cat.core.getScrapName(scrap.name), ", tests: [", catConfig.getTestNames() , "]]");
            } 

        },

        /**
         * Delay a set of UI actions commands
         *
         * Config:
         *       methods {Array} string javascript functions reference
         *       commands {Array} string javascript statements
         *       context {Object} catjs context object
         *
         *
         * @param config
         */
        delayManager: function (config) {
            var codeCommands, context, methods, commands = [];

            (function init() {
                if (config) {
                    codeCommands = ("commands" in config ? config.commands : undefined);
                    methods = ("methods" in config ? config.methods : undefined);
                    context = ("context" in config ? config.context : undefined);
                }
            })();

            commands = commands.concat((codeCommands || []));
            commands = commands.concat((methods || []));

            delayManagerCommands(commands, context);
        },

        removeIntervalFromBroadcast : function(scrap) {
            var intervalScrap,
                runIndex,
                intervalIndex;

            if (intervalObj) {
                intervalScrap = _cat.core.getScrapById(intervalObj.signScrapId);

                runIndex = scrapTestIndex(scrap);
                intervalIndex = scrapTestIndex(intervalScrap);

                if (intervalObj && intervalObj.interval && intervalIndex < runIndex) {

                    clearInterval(intervalObj.interval);
                }
            }
        },

        getClientmanagerId : function() {

            if (!clientmanagerId) {
                clientmanagerId = _cat.utils.Utils.generateGUID();
            }
            return clientmanagerId;
        }

    };
}();
_cat.core.controller = function () {

    var _queue = [],
        _Action = function (config) {
            var me = this;

            this.config = config;
            this.get = function (key) {
                return me.config[key];
            };

        },

        _module = {

            add: function (config) {

                _cat.utils.Utils.prepareProps(
                    {
                        global: {
                            obj: config
                        },
                        props: [
                            {
                                key: "me",
                                default: this
                            },
                            {
                                key: "fn"
                            },
                            {
                                key: "delay",
                                default: 0
                            },
                            {
                                key: "totalDelay",
                                default: 0
                            },
                            {
                                key: "manager",
                                require: true
                            }
                        ]
                    });

                if (config.manager) {

                   // _queue.push(new _Action(config));
                    config.fn.call(config.me);
//                if (config.fn) {
//                    setTimeout(function () {
//                        fn.call(config.me);
//                    }, totalDelay);
//                    totalDelay += delay;
//                }

                }                
            },

            run: function() {

                
            }

        };


    return _module;

}();
_cat.core.wait = function () {

    var _module = {
        
        
        
    };

}();
/**
 * JQuery / JQlite (Angular) helper 
 * 
 * Common layer to make a smooth bridge between the functionality
 * 
 * @type {_cat.utils.plugins.jqhelper}
 */
_cat.utils.plugins.jqhelper = function() {
    
    var _module = {

        isjquery: function() {
            if (typeof $ !== "undefined") {
                return true;
            }
            return false;
        },
        
        isangular: function() {
            if (typeof angular !== "undefined") {
                return true;
            }
            return false;
        },
        
        /**
         * Get the jquery or jqlite handle
         * 
         * @param autodetect {String} if "*" auto detect the returned handle or else specify [jqlite | jquery]
         * @returns {*}
         */
        $: function(autodetect) {
            
            var _methods = {},
                    _map = {};
            
            autodetect = (autodetect || "*");

            _methods._empty = function() {
                return function(element){
                    var elt;
                    
                    if (element) {
                        
                        if (typeof element === "object") {
                            return element;
                            
                        } else if (typeof element === "string") {
                            elt = document.getElementById(element);
                            
                            if (!elt) {
                                elt = document.querySelector(element);
                            }                                                        
                        }
                    }
                    
                    return elt;                                        
                };
            };

            _methods._jqlite = function() {
                if (_module.isangular()) {
                    return angular.element;
                }
                return undefined;
            };
            
            _methods._jquery = function() {
                if (_module.isjquery()) {
                    return $;
                }
                return undefined;
            };
            
            _map["angular"] = function() {
                return (_methods._jqlite() || _methods._empty());
            };
            
            _map["jquery"] = function() {
                return (_methods._jquery() || _methods._empty());
            };
            
            _map["*"] = function() {
                var _$ =  (_methods._jquery() || _methods._jqlite());
                return (_$ || _methods._empty());
            };
            
            if (!(autodetect in _map)) {
                _cat.core.log.warn("[catjs jqhelper plugin] no valid functionality for :", autodetect);
            }
            return _map[autodetect].call(this);
        },

        /**
         * Get a generic element depends on the autodetect argument 
         * 
         * @param val {*} an element reference or a string DOM query
         * @param autodetect {String} if "*" auto detect the returned handle or else specify [jqlite | jquery]
         * @returns {*}
         */
        getElt: function (val, autodetect) {
            var sign,
                _$ = _module.$(autodetect);
            
            if ( typeof val === "string") {
                val = val.trim();
                sign = val.charAt(0);

                return (_$ ? _$(val) : undefined);

            } else if (typeof val === "object") {
                return _$(val);
            }
        },

        /**
         * Trigger an event with a given object
         *
         * @param element {Object} The element to trigger from (The element JQuery representation id/class or the object itself)
         * @param eventType {String} The event type name
         * @param autodetect {String} if "*" auto detect the returned handle or else specify [jqlite | jquery]
         *
         * @private
         */
        trigger: function () {
            
            // args[0] element | args[1] eventType | args[2] autodetect
            var e, newEvent, newEventOpt, idx = 0, size,
                args = arguments,
                autodetect = args[2],
                elt = (args ? _module.getElt( args[0], autodetect) : undefined),
                eventType = (args ? args[1] : undefined),
                typeOfEventArgument = _cat.utils.Utils.getType(eventType),
                typeOfEventArrayItem,
                _$ = _module.$(autodetect),
                isAngular = ( autodetect && autodetect === "angular" ),
                triggerFn = (isAngular ? "triggerHandler" : "trigger"),
                eventFn;

            function getOpt(opt) {
                var key, newOpt = {};
                if (opt) {
                    for (key in opt) {
                        if (opt.hasOwnProperty(key)) {
                            newOpt[key] = opt[key];
                        }
                    }
                    if ("keyCode" in newOpt) {
                        newOpt.which = newOpt.keyCode;

                    } else if ("which" in newOpt) {
                        newOpt.keyCode = newOpt.which;
                    }
                }

                return newOpt;
            }

            function createNewEvent(eventType) {
                var newEventOpt = getOpt(eventType.opt),
                newEvent = _$.Event(eventType.type, newEventOpt);
                
                return newEvent; 
            }
            
            eventFn = function(elt, triggerFn, event, eventType) {
                var opt;
                
                if (!isAngular) {
                    elt[triggerFn](event);
                    
                } else {
                    if (eventType) {
                        if ("opt" in eventType) {
                            opt = getOpt(eventType.opt);
                        }
                        elt[triggerFn](eventType.type, opt);
                        
                    } else {
                        elt[triggerFn](event);
                    }
                }
            };
            
            if (elt && eventType) {
                if (typeOfEventArgument === "string") {
                    eventFn(elt, triggerFn, eventType);

                } else if (typeOfEventArgument === "object") {            
                    newEvent = createNewEvent(eventType);
                    eventFn(elt, triggerFn, newEvent, eventType);

                } else if (typeOfEventArgument === "array" && eventType.length > 0) {
                    size = typeOfEventArgument.length;
                   
                    for (idx = 0; idx < size; idx++) {
                        e = eventType[idx];
                        if (e) {
                            typeOfEventArrayItem = _cat.utils.Utils.getType(eventType);
                            if (typeOfEventArrayItem === "string") {
                                eventFn(elt, triggerFn, e);
                            } else {
                                newEvent = createNewEvent(eventType);
                                eventFn(elt, triggerFn, newEvent, eventType);
                            }

                        }
                    }
                }
            }
        },

        setText: function (idName, value, usevents, callback, autodetect) {
            var _$ = _module.$(autodetect);
            
            if (usevents === undefined) {
                usevents = true;
            }
            
            _$(document).ready(function () {
                var elt = _module.getElt(idName, autodetect);

                if (usevents) {
                    _module.trigger(elt, "mouseenter", autodetect);
                    _module.trigger(elt, "mouseover", autodetect);
                    _module.trigger(elt, "mousemove", autodetect);
                    _module.trigger(elt, "focus", autodetect);
                    _module.trigger(elt, "mousedown", autodetect);
                    _module.trigger(elt, "mouseup", autodetect);
                    _module.trigger(elt, "click", autodetect);
                }

                elt.val(value);

                if (usevents) {
                    _module.trigger(elt, "keydown", autodetect);
                    _module.trigger(elt, "keypress", autodetect);
                    _module.trigger(elt, "keyup", autodetect);
                    _module.trigger(elt, "mousemove", autodetect);
                    _module.trigger(elt, "mouseleave", autodetect);
                    _module.trigger(elt, "mouseout", autodetect);
                    _module.trigger(elt, "blur", autodetect);
                }

                _module.trigger(elt, "input", autodetect);


                if (callback) {
                    return callback.call(this, elt);
                }
            });
        },

        getValue: function(idName, callback, autodetect) {
            _module.$(autodetect)(document).ready(function () {
                var elt = _module.getElt(idName, autodetect);
                elt.val();

                if (callback) {
                    return callback.call(this, elt);
                }
            });
        }
        
    };
    
    return _module;
    
}();
_cat.utils.plugins.simulate = function() {
    
    var _module = {
        
        drag: function(opt) {

            _cat.utils.Utils.prepareProps(
                {
                    global: {
                        obj: opt
                    },
                    props: [
                        {
                            key: "element",
                            require: true
                        },
                        {
                            key: "target"
                        },
                        {
                            key: "offset",
                            default: {x:0, y:0}
                        },
                        {
                            key: "cords",
                            default: false
                        },
                        {
                            key: "steps",
                            default: {delay: 0, count: 1}
                        }
                    ]
                });

            _cat.plugins.dom.fire("mouseenter", {"element": opt.element});
            _cat.plugins.dom.fire("mousedown", {"element": opt.element});
            _cat.plugins.dom.fire("mousemove", opt);
            _cat.plugins.dom.fire("mouseup", {"element": opt.element});            
        } 
    };
    
    return _module;

}();
_cat.core.TestAction = function () {

    return {

        NOTEST: function(opt) {
            var guid = _cat.core.guid(),
                testdata,
                config = _cat.core.getConfig();

            opt = (opt || {});

            testdata = _cat.core.TestManager.addTestData({
                name: "NOTEST",
                displayName: "No valid tests were found",
                message: "See cat.json configuration file for adding tests to scenarios",
                status: "sysout",
                error: (opt.error || ""),
                reportFormats: opt.reportFormats
            });

            if (config.isUI()) {
                _cat.core.ui.setContent({
                    header: testdata.getDisplayName(),
                    desc: testdata.getMessage(),
                    tips: {tests: "?" ,passed: "?", failed: "?", total: "?"},
                    style: "color:gray"
                });
            }
            
            // server signal notification
            if (config.isReport()) {
                               
                if (config) {
                    _cat.utils.AJAX.sendRequestSync({
                        url: _cat.core.TestManager.generateAssertCall(config, testdata)
                    });
                }
            }  
        },
        
        TESTSTART: function (opt) {

            var guid = _cat.core.guid(),
                testdata,            
                config = _cat.core.getConfig();

            opt = (opt || {});
                
            // server signal notification
            if (config.isReport()) {
                testdata = _cat.core.TestManager.addTestData({
                    name: "Start",
                    displayName: "start",
                    status: "Start",
                    message: "Start",
                    error: (opt.error || ""),
                    reportFormats: opt.reportFormats
                });

                if (config) {
                    _cat.utils.AJAX.sendRequestSync({
                        url: _cat.core.TestManager.generateAssertCall(config, testdata)
                    });
                }
            }
        },

        TESTEND: function (opt) {

            var timeout = _cat.core.TestManager.getDelay(),
                config, testdata;

            opt = (opt || {});
            config = _cat.core.getConfig();

            // ui signal notification
            if (config.isUI()) {

                timeout = (opt["timeout"] || 2000);

                setTimeout(function () {
                    var testCount;
                    if (opt.error) {
                        _cat.core.ui.setContent({
                            header: "Test failed with errors",
                            desc: opt.error,
                            tips: {status: "failed"},
                            style: "color:red"
                        });

                    } 
                }, (timeout));
            }

            // server signal notification
            if (config.isReport()) {
                testdata = _cat.core.TestManager.addTestData({
                    name: "End",
                    displayName: "End",
                    status: "End",
                    message: "End",
                    error: (opt.error || ""),
                    reportFormats: opt.reportFormats
                });

                if (config) {
                    _cat.utils.AJAX.sendRequestSync({
                        url: _cat.core.TestManager.generateAssertCall(config, testdata)
                    });
                    _cat.core.TestManager.testEnd();
                }
            }


        },

        KILL: function () {

            // close CAT UI
            _cat.core.ui.off();

        }
    };

}();
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
        _testEnd = false,
        _globalTestData = {};


    return {
        
        init: function() {
            
            // register signals
            _cat.utils.Signal.register([
                {signal: "KILL", impl: _cat.core.TestAction.KILL},
                {signal: "TESTEND", impl: _cat.core.TestAction.TESTEND},
                {signal: "NOTEST", impl: _cat.core.TestAction.NOTEST},
                {signal: "TESTSTART", impl: _cat.core.TestAction.TESTSTART}
            ]);

            // START test signal
            var config = _cat.core.getConfig(),
                isIframe = _cat.utils.iframe.isIframe();
            
            // TODO we need to set test start signal via an API
            if (config.getTests() && !isIframe) {
                _cat.core.ui.on();
                _cat.core.TestManager.send({signal:"TESTSTART"});
                
                if (!config.isTests()) {
                    _cat.core.TestManager.send({signal: 'NOTEST'});
                    _cat.core.TestManager.send({signal: 'TESTEND'});
                }
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

        testEnd: function() {
            _testEnd = true;            
        },
        
        isTestEnd: function() {
            return _testEnd;            
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
         *      status - The test status ["Start" | "End" | "success" | "failure" | "sysout"]
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

_cat.core.TestQueue = function () {

    var _Queue = function (key) {

            this.key = key;
            this.items = [];
        },
        _queue = {},
        _module;    
        
    _Queue.prototype.empty = function () {
        return (this.key ? false : true);
    };

    _Queue.prototype.add = function (config) {
        this.items.push(config);
    };

    _Queue.prototype.all = function () {
        return this.items;
    };

    _Queue.prototype.first = function () {
        return (this.size() > 0 ? this.items[0] : undefined);
    };

    _Queue.prototype.deleteFirst = function () {
        if (this.size() > 0) {
            this.items.shift();         
        }
    };

    _Queue.prototype.delete = function (idx) {
        if (this.size() > 0) {
            this.items.splice(idx, 1);
        }
    };

    _Queue.prototype.deleteAll = function () {
        if (this.size() > 0) {
            this.items = [];
        }
    };

    _Queue.prototype.size = function () {
        return this.items.length;
    };

    _module = {

        isEmpty: function () {
            return _cat.utils.Utils.isEmpty(_queue);
        },

        get: function (scrap) {
            var index, 
                queue,
                found;

            index = (scrap ? scrap.index : -1);
            if (index > -1) {
                queue = _queue[index];                    
            }
            return (queue ? queue : new _Queue());
        },

        add: function (key, config) {
            var queue = _module.get(config);
            
            if (!_queue[key]) {
                queue = _queue[key] = new _Queue();
            }
            queue.add(config);
        }
    };

    return _module;
};
_cat.core.ui = function () {

    function _addEventListener(elem, event, fn) {
        if (typeof($) !== "undefined") {
           if (event === "load") {
               $( document ).ready(fn);
           } else {
               $( elem ).on( event, fn);
           }
        } else {
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
    }

    function _setInternalContent(elt, text, style, attr) {
        
        var styleAttrs = (style ? style.split(";") : []);

        if (elt) {
            styleAttrs.forEach(function (item) {
                var value = (item ? item.split(":") : undefined);
                if (value) {
                    elt.style[value[0]] = value[1];
                }
            });

            elt[attr] = text;
        }        
    }
    
    function _setText(elt, text, style) {

        _setInternalContent(elt, text, style, "textContent");
    } 
    
    function _setHTML(elt, text, style) {

        _setInternalContent(elt, text, style, "innerHTML");
    }

    function _appendUI() {
        if (__catElement) {
            if (document.body) {
                document.body.appendChild(__catElement);
            } else {
                console.warn("[CatJS UI] failed to display catjs UI. HTML Body element is not exists or not valid");
            }
        }
    }
    
    function _create() {

        if (typeof document !== "undefined") {
            var isIframe = _cat.utils.iframe.isIframe() ? "catuiiframe" : "";

            __catElement = document.createElement("DIV");

            __catElement.id = "__catelement";
            __catElement.className = "cat-status-container " + isIframe;
            __catElement.style.width = "200px";
            __catElement.style.height = "200px";
            __catElement.style.position = "fixed";
            __catElement.style.bottom = "10px";
            __catElement.style.zIndex = "10000000";
            __catElement.style.display = "none";
            __catElement.innerHTML =

                '<div id="cat-status" class="cat-dynamic cat-status-open">' +
                    '<div id=loading></div>' +
                    '<div id="catlogo" ></div>' +
                    '<div id="catHeader"><div>CatJS Console</div><span id="catheadermask">click to mask on/off</span></div>' +
                    '<div class="text-tips">' +
                    '   <div class="tests">Tests <span style="color:green">passed</span> : <span  id="tests_passed">0</span></div>' +
                    '   <div class="tests">Tests <span style="color:red">failed</span> : <span  id="tests_failed">0</span></div>' +
                    '   <div class="tests"><span  id="tests_total_counter">0</span> Tests Total </div>' +
                    '   <div class="tests"><span  id="tests_status"></span></div>' +
                    '</div>' +
                    '<div id="cat-status-content">' +
                        '<ul id="testList"></ul>' +
                    '</div>' +
                '</div>'+
                '<div id="catmask"></div>';

            // add  id="catmask" class="fadeMe" to enable the mask
            _appendUI();
           
        }
    }

    function _getCATElt() {
        var catelement;
        
        if (typeof document !== "undefined") {
            catelement = document.getElementById("__catelement");
            
            if (!catelement) {
                _appendUI();
            }
            
            return catelement;
        }
        return undefined;
    }

    function _getCATStatusElt() {

        var catStatusElt,
            catElement = _getCATElt();
        if (catElement) {
            catStatusElt = (catElement.childNodes[0] ? catElement.childNodes[0] : undefined);

            if ( __cache.length > 0) {
                _me.setContent(__cache.shift());
            }
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
            tips: {tests: "?" ,passed: "?", failed: "?", total: "?"},
            reset: true
        });
    }


    function _subscribeUI() {
        flyer.subscribe({
            channel: "default",
            topic: "setContent.*",
            callback: function(data, topic, channel) {
                var clientTopic = "setContent." + _cat.core.clientmanager.getClientmanagerId();
                // check if it's the same frame
                if (topic !== clientTopic && !_cat.utils.iframe.isIframe()) {
                    _cat.core.ui.setContent(data);
                }

            }
        });
    }

    _subscribeUI();

    var __cache = [],
        __catElement,
        _disabled = false,
        _islogolistener = false,

        _loaderListener = false,
        _me = {

            disable: function () {
                _disabled = true;
            },

            enable: function () {
                _disabled = false;
            },

            /**
             * Display the CAT widget (if not created it will be created first)
             *
             */
            on: function () {

                if (_disabled) {
                    return;
                }

                if ((!_loaderListener) || true) {
                    _loaderListener = true;
                    _addEventListener(window, "load", function (e) {

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
                                listener = function () {
                                    if (catmask) {
                                        catmask.classList.toggle("fadeMe");
                                    }
                                },
                                bubblefalse = function(e) {
                                    if (e) {
                                        e.stopPropagation();
                                    }
                                };

                            if (!_islogolistener && logoelt && catmask && catmask.classList) {
                                // toggle mask
                                _addEventListener(logoelt, "click", listener);
                                
                                // stop propagation
                                /* _addEventListener(catmask, "mouseover", bubblefalse);
                                _addEventListener(catmask, "mousemove", bubblefalse);
                                _addEventListener(catmask, "mouseup", bubblefalse);
                                _addEventListener(catmask, "mousedown", bubblefalse);
                                _addEventListener(catmask, "click", bubblefalse);
                                */
                                _islogolistener = true;
                            }

                        }

                    });
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
                if (_disabled) {
                    return;
                }

                var catElement = _getCATElt(),
                    catStatusElt = _getCATStatusElt(),
                    catStatusContentElt = _getCATStatusContentElt();

                if (catElement) {
                    catStatusElt = _getCATStatusElt();
                    if (catStatusElt) {
                        _resetContent();

                        catStatusElt.classList.toggle("cat-status-close");

                        //if (catStatusContentElt) {
                        //    catStatusContentElt.classList.toggle("displayoff");
                        //}
                    }
                }


            },

            isOpen: function () {
                var catElement = _getCATElt(),
                    catStatusElt = _getCATStatusElt();

                if (catElement) {
                    catStatusElt = _getCATStatusElt();
                    if (catStatusElt) {

                        if (catStatusElt.classList.contains("cat-status-close")) {
                            return false;
                        }
                    }
                } else {

                    return false;
                }

                return true;
            },

            isContent: function () {

                function _isText(elt) {
                    if (elt && elt.innerText && ((elt.innerText).trim())) {
                        return true;
                    }
                    return false;
                }

                var catStatusContentElt = _getCATStatusContentElt(),
                    bool = 0;

                bool += (_isText(catStatusContentElt.childNodes[1]) ? 1 : 0);

                if (bool === 1) {
                    return true;
                }

                return false;
            },


            markedElement: function (elementId) {
                var element = document.getElementById(elementId);
                element.className = element.className + " markedElement";
            },

            setContentTip: function (config) {

                var testsFailed = document.getElementById("tests_failed"),
                    testsPassed = document.getElementById("tests_passed"),
                    testsTotal = document.getElementById("tests_total"),
                    testsTotalCounter = document.getElementById("tests_total_counter"),
                    testsStatusDesc = document.getElementById("tests_status"),
                    failedStatus = "<span class=\"test_failed\"> Test Failed </span>",
                    passedStatus = "<span class=\"test_succeeded\"> Test End Successfully </span>",
                    testStatus;

                if ("tips" in config) {
                    if ("tips" in config && config.tips) {
                        testStatus = config.tips;
                        if (testStatus) {
                            if ("failed" in testStatus) {
                                _setText(testsFailed, testStatus.failed);
                            }
                            if ("passed" in testStatus) {
                                _setText(testsPassed, testStatus.passed);
                            }
//                            if ("tests" in testStatus) {
//                                _setText(testsTotal, testStatus.tests);
//                            }
                            if ("total" in testStatus) {
                                _setText(testsTotalCounter, testStatus.total);
                            }
                            if ("status" in testStatus) {
                                _setHTML(testsStatusDesc, (testStatus.status === "succeeded" ? passedStatus : failedStatus));

                            }
                        }

                    }
                }

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
                    catElement,
                    isOpen = false,
                    reset,
                    me = this,
                    isIframe = _cat.utils.iframe.isIframe(),
                    rootcore = _cat.core.getRootCatCore();

                if (isIframe && rootcore) {
                    rootcore.core.ui.setContent(config);
                    return undefined;
                }


                catElement = _getCATElt();
                reset = ("reset" in config ? config.reset : false);
                
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
                                    }, 0);
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


                                setTimeout(function () {

                                    // add element to ui test list
                                    if ("header" in config && config.header) {
                                        _setText(newLI.childNodes[0], config.header, config.style);
                                    }
                                    if ("desc" in config && config.desc) {
                                        if (config.desc.indexOf("_$$_") !== -1) {
                                            config.desc = config.desc.split("_$$_").join("<br/>");
                                            _setHTML(newLI.childNodes[1], config.desc, config.style);
                                        } else {
                                            _setText(newLI.childNodes[1], config.desc, config.style);
                                        }
                                    }

                                    me.setContentTip(config);

                                    if (config.header || config.desc) {
                                        if ("elementType" in config) {
                                            newLI.className = newLI.className + " " + config.elementType;
    
                                        } else {
                                            newLI.className = newLI.className + " listImageInfo";
                                        }
                                    }
                                }, 0);
                            }

                        }
                    }
                } else {
                    __cache.push(config);
                }

                //this.iframeBrodcast(config);
            },

            iframeBrodcast : function(config) {
                var isIframe = _cat.utils.iframe.isIframe(),
                    topic;

                if (isIframe) { // && (config.header || config.desc)) {
//                    catParent = window.parent._cat;
//                    catParent.core.ui.setContent(config);
                    topic = "setContent." + _cat.core.clientmanager.getClientmanagerId();
                    flyer.broadcast({
                        channel: "default",
                        topic: topic,
                        data: config
                    });

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
        _cat.utils.log.info("[catjs ajax] Not valid AJAX handle was found");
        return {};
    }

    var _queue = [],
        _running = 0;
    
    
    function _execAsync() {
        var currentxmlhttp,
            requestHeaderList,
            data, type,
            config,
            xmlhttp;
        
        if (_running === 0 && _queue.length > 0) {
            currentxmlhttp = _queue.shift();
            config = currentxmlhttp.config;
            xmlhttp = currentxmlhttp.xmlhttp;
            
            xmlhttp.open(config.method, config.url, config.async);

            requestHeaderList = config.headers;
            if (requestHeaderList) {
                requestHeaderList.forEach(function(header) {
                    
                    if (header) {
                        xmlhttp.setRequestHeader(header.name, header.value);
                    }
                });
            }
            
            data = config.data;
            type = _cat.utils.Utils.getType(data);
            if (type !== "string") {
                try {
                    data = JSON.stringify(data);
                } catch (e) {
                    _cat.utils.log.warn("[catjs ajax] failed to serialize the post request data ");
                }
            }

            xmlhttp.send(data);
            _running++;
        }
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
            // TODO
            // config.url = encodeURI(config.url);
            _cat.core.log.info("[catjs ajax] sending REST request: " + config.url);

            try {
                xmlhttp.open((config.method || "GET"), config.url, false);
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
         *      url {String} The url to send
         *      header {Array} The request header objects
         *          object: header {String} The header name 
         *                  value {String} The header value
         *      method {String} The request method
         *      data {*} The data to be passed in case of post method is being used
         *      onerror {Function} [optional] error listener
         *      onreadystatechange {Function} [optional] ready listener
         *      callback {Function} [optional] instead of using onreadystatechange this callback will occur when the call is ready
         */
        sendRequestAsync: function(config) {
            
            var xmlhttp = new XMLHttpRequest(),
                data = ("data" in config ? config.data : undefined),
                requestHeader, requestHeaderType, requestHeaderList,
                onerror = function (e) {
                    _cat.core.log.error("[CAT CHAI] error occurred: ", e, "\n");
                },
                onreadystatechange = function () {
                    
                    if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
                        // _cat.core.log("completed\n" + xmlhttp.responseText);
                        if ("callback" in config && config.callback) {
                            config.callback.call(this, xmlhttp);
                        }

                        _running--;
                        _execAsync();
                    }
                };


            requestHeader = ("header" in config ? config.header : undefined);
            if (requestHeader) {
                requestHeaderType = _cat.utils.Utils.getType(requestHeader);
                
                if (requestHeaderType === "object") {
                    requestHeaderList = [requestHeader];
                    
                } else if (requestHeaderType === "array") {
                    requestHeaderList = requestHeader;
                }
                
               
            }
            
            xmlhttp.onreadystatechange = (("onreadystatechange" in config) ? config.onreadystatechange : onreadystatechange);
            xmlhttp.onerror = (("onerror" in config) ? config.onerror : onerror);

            _queue.push({xmlhttp: xmlhttp, config:{data: data, headers: requestHeaderList, method: (config.method || "GET"), url: config.url, async: true}});

            _execAsync();
           
        }

    };

}();
_cat.utils.iframe = function() {
    return {
        isIframe : function() {
            try {
                return window.self !== window.top;
            } catch (e) {
                return true;
            }
        }
    };
}();
_cat.utils.Loader = function () {

    var _libslength = 0,
        _ready = 0,
        _module = {

        require: function (file, callback) {

            function _css(file) {
                var node = document.createElement('link'),
                    head = (document.head || document);

                node.rel = 'stylesheet';
                node.type = 'text/css';
                node.href = file;

                node.onload = function() {
                    _ready++;
                    if (_ready === _libslength) {
                        if (callback && callback.call) {
                            callback.call(this);
                        }
                    }
                };

                document.head.appendChild(node);
            }

            function _js(file) {
                var node = document.createElement('script'),
                    head = (document.head || document);

                node.type = "text/javascript";
                node.src = file;
                node.onload = function() {
                    _ready++;
                    if (_ready === _libslength) {
                        if (callback && callback.call) {
                            callback.call(this);
                        }
                    }
                };
                
                head.appendChild(node);
            }

            var jsfile_extension = /(.js)$/i,
                cssfile_extension = /(.css)$/i;

            if (jsfile_extension.test(file)) {
                _js(file);

            } else if (cssfile_extension.test(file)) {
                _css(file);

            } else {
                console.warn("[catjs] no valid file was found ", (file || "NA"));
            }
        },

        requires: function () {

            var index = 0;

            return function (files, callback) {
                _libslength = files.length;
                
                if (!_libslength) {
                    return undefined;
                }
                
                index += 1;
                _module.require(files[index - 1], ((index === files.length) ? callback : undefined));

                if (index === files.length) {
                    index = 0;
                    
                } else {
                    _module.requires(files, callback);
                }
            };

        }()

    };

    return _module;

}();


//Utilities.requires(["cat.css", "cat.js", "chai.js"], function(){
//    //Call the init function in the loaded file.
//    console.log("generation done");
//})

_cat.utils.Request = function () {
   
    return {

        /**
         * Generates request for catjs monitoring server
         * 
         * @param config {Object} The main object
         *      service {String} The service url name
         *      params {Object} Request parameters
         *      cache {Boolean} Enable url cache
         *      
         * @returns {*}
         */
        generate: function(config) {

            var service = config.service, 
                paramsarg = config.params,
                params = [],
                key, param, counter= 0,
                uri;
            
            function getURI() {
                var catconfig,
                    method, ip, port,
                    uri;

                catconfig = _cat.core.getConfig();
                if (catconfig) {
                    method = catconfig.getMethod();
                    ip = catconfig.getIp();
                    port = catconfig.getPort();

                    uri = [method, "://", ip, ":", port, "/", service].join("");
                }
                
                return uri;
            }
            
            function _addKey(params, key, param) {
                params.push(key);
                params.push("=");
                params.push(param);
            }

            if ("cache" in config && params) {
                params.cache = (new Date()).toUTCString();
            }
            
            for (key in paramsarg) {
                if (paramsarg.hasOwnProperty(key)) {
                    param = paramsarg[key];
                    if (param) {
                        if (counter === 0) {
                            params.push("?");
                        } else {
                            params.push("&");
                        }
                        _addKey(params, key, param);
                        counter++;
                    }
                }
            }                        

            uri = getURI();
            if (!uri) {
                _cat.core.log.error("[catjs request] Failed to resolve catjs server address");
                
                return undefined;
            }
            
            return [uri, params.join("")].join("");
                          
        }    
        
    };

}();

_cat.utils.Signal = function () {

    var _funcmap = {       };

    return {

        register: function(arr) {
            if (arr) {
                arr.forEach(function(item) {
                    _funcmap[item.signal] = item.impl;
                });
            }
           
        },
        
        send: function (flag, opt) {

            if (flag && _funcmap[flag]) {
                _funcmap[flag].call(this, opt);
            }

        }

    };

}();
_cat.utils.Storage = function () {

    var _catjsLocal, _catjsSession;

    function _getStorage(type) {
        if (type) {
            return window[_enum[type]];
        }
    }

    function _base(type) {
        if (!type) {
            console.warning("[CAT] Storage; 'type' argument is not valid");
        }

        return _getStorage(type);
    }

    var _enum = {
        guid : "cat.core.guid",
        session: "sessionStorage",
        local: "localStorage"
    },
        _storageEnum = {
            CURRENT_SCENARIO: "current.scenario",
            SESSION: "session",
            LOCAL: "local"
        },
        _module;

    function _init() {
        var localStorage = _getStorage("local"),
            sessionStorage = _getStorage("session");

        if (sessionStorage.catjs) {
            _catjsSession = JSON.parse(sessionStorage.catjs);
        }
        if (localStorage.catjs) {
            _catjsLocal = JSON.parse(localStorage.catjs);
        }
    }

    _init();

    _module =  {


        /**
         *  Set value to a storage
         *
         * @param key The key to be stored
         * @param value The value to set
         * @param type session | local
         */
        set: function(key, value, type) {

            var storage = _base(type);
            if (storage) {
                if (!_catjsSession) {
                    _catjsSession = {};
                }
                _catjsSession[key] = value;
                storage.catjs = JSON.stringify(_catjsSession);
            }
        },

        /**
         *  Get value from the storage
         *
         * @param key
         * @param type session | local
         */
        get: function(key, type) {

            var storage = _base(type);
            if (storage) {
                if (!storage.catjs) {
                    return undefined;
                }

                _catjsSession = JSON.parse(storage.catjs);
                if (!_catjsSession) {
                    return undefined;
                }

                return _catjsSession[key];
            }

        },

        getGUID: function() {

            var guid = _module.get(_enum.guid, _storageEnum.SESSION);

            if (!guid) {
                guid =_cat.utils.Utils.generateGUID();
                _module.set(_enum.guid, guid, _storageEnum.SESSION);
            }

            return guid;

        },

        enum: _storageEnum

    };

    return _module;
}();

_cat.utils.TestsDB = function() {

    var _data,
        _testnextcache = {},
        _variableNameMap = {};

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

        counter: function(variableName) {
            if (!(variableName in _variableNameMap)) {
                _variableNameMap[variableName] = {counter: -1};
            }
            _variableNameMap[variableName].counter++;
            
            return _variableNameMap[variableName].counter;
        },
        
        getData : function() {
            return _data;
        },

        init : function() {
            _cat.utils.AJAX.sendRequestAsync({
                url :  _cat.core.getBaseUrl("cat/config/testdata.json"),
                callback : {
                    call : function(check) {
                        var incomingdata = check.response,
                            type, validata = false, errors;
                        
                        if (incomingdata) {
                            type = _cat.utils.Utils.getType(incomingdata);
                            if (type === "string") {
                                try {
                                    _data = JSON.parse(incomingdata);
                                    validata = true;
                                } catch(e) {
                                    errors = e;
                                }
                            }
                        }

                        if (!validata) {
                            _cat.core.log.warn("[catjs testdb] No valid test data was found, any '@d' API usage related will be skipped (see src/config/testdata.json), errors:", (errors ? errors : " NA"));
                        }

                    }
                }
            });
        },

        getDB : function() {
            return TestDB.getDB();
        },

        get : function(field) {
            var temp = " _data" + field;
            return eval(temp);
        },

        set : function(field, value) {
            return TestDB.set(field, value);
        },
        
        find : function(field) {
            var code = "JSPath.apply('" + field + "', _data);";

            return (new Function("JSPath", "_data", "if (JSPath) { return " + code + "} else { console.log('Missing dependency : JSPath');  }").apply(this, [(typeof JSPath !== "undefined" ? JSPath : undefined), _data]) || "");
        },
        random: function(field) {

            function _random(min, max) {
                return Math.floor(Math.random() * (max - min + 1)) + min;
            }

            var result = this.find(field),
                cell=0;

            if (result && result.length) {
                cell = _random(0, result.length-1);
                return result[cell];
            }

            return result;
        },
        next: function(field) {

            var result = this.find(field),
                cell=0;

            if (result && result.length) {
                if (_testnextcache[field] !== undefined && _testnextcache[field] != null) {
                    _testnextcache[field]++;
                } else {
                    _testnextcache[field] = 0;
                }
                return result[_testnextcache[field]];
            }

            return result;
        }
    };
}();
if (typeof(_cat) !== "undefined") {

    _cat.utils.Utils = function () {

        var _module = {

            /**
             * check if the path argument exists in the current location  
             *
             * @param path {*} a given path list of type Array or String
             * @returns {boolean} whether one of the path exists
             */
            pathMatch: function (path) {
                var location = window.location.href,
                    type, n=0;

                if (path) {
                    type = _cat.utils.Utils.getType(path);
                    if (type === "string") {
                        path = [path];
                    }

                    path.forEach(function (item) {
                        if (item) {
                            if (location.indexOf(path) !== -1) {
                                n++;
                            }
                        }
                    });
                } else {
                    return true;
                }

                return (n > 0 ? true : false);
            },

            isEmpty: function (srcobj) {
                var key,
                    n = 0,
                    result = false;

                if (!srcobj) {
                    return true;
                }

                if (Object.keys) {
                    result = (Object.keys(srcobj).length === 0);

                } else {
                    for (key in srcobj) {
                        if (srcobj.hasOwnProperty(key)) {
                            n++;
                            break;
                        }
                    }

                    result = (n === 0);
                }

                return result;
            },

            /**
             * Setting the reference object with default values or undefined for unassigned properties
             * e.g. { global: {obj: obj}, props: [{key: "test", default: 1}] }
             *
             *
             * @param value {Object} props values
             *          global {Object} global references
             *               obj {Object} [optional] The object to be copied the property from
             *
             *          props {Array} prop value
             *              key {String} The property key
             *              obj {Object} [optional] The object to be copied the property from
             *              default {Object} [optional] A default value
             *              require {Boolean} Warning about undefined value, default set to false
             *
             */
            prepareProps: function (value) {

                var globalreference, refobj;

                if (value) {
                    if ("global" in value && value.global) {
                        globalreference = value.global.obj;
                    }
                    if ("props" in value && value.props && _module.getType(value.props) === "array") {
                        value.props.forEach(function (prop) {

                            var defaultval;

                            if (!("require" in prop)) {
                                prop.require = false;
                            }
                            if (!("key" in prop)) {
                                throw new Error("[catjs utils] 'key' is a required property for method 'getProps' ");
                            }

                            defaultval = ("default" in prop ? prop.default : undefined);
                            refobj = ("obj" in prop ? prop.obj : globalreference);

                            refobj[prop.key] = (prop.key in refobj ? refobj[prop.key] : defaultval);

                            if (prop.require && (refobj[prop.key] === undefined || refobj[prop.key] === null)) {
                                throw new Error("[catjs utils prepareProps] property '" + prop.key + "' is required ");
                            }


                        });
                    }
                }
            },

            getCatjsServerURL: function (url) {

                var catConfig = _cat.core.getConfig(),
                    port = catConfig.getPort(),
                    host = catConfig.getIp(),
                    method = catConfig.getMethod(),
                    slashPos = -1;

                if (url) {
                    slashPos = url.indexOf("/");
                    if (slashPos !== 0) {
                        url = "/" + url;
                    }
                } else {
                    url = "/";
                }

                return [method, "://", host, ":", port, url].join("");

            },

            querystring: function (name, query) {
                var re, r = [], m;

                re = new RegExp('(?:\\?|&)' + name + '=(.*?)(?=&|$)', 'gi');
                while ((m = re.exec(query || document.location.search)) != null) {
                    r[r.length] = m[1];
                }
                return (r && r[0] ? r[0] : undefined);
            },

            getType: function (obj) {
                if (!obj) {
                    return undefined;
                }
                return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase();

            },

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

            },

            /**
             * Validates an object and availability of its properties
             *
             */
            validate: function (obj, key, val) {
                if (obj) {

                    // if key is available
                    if (key !== undefined) {

                        if (key in obj) {

                            if (obj[key] !== undefined) {

                                if (val !== undefined) {
                                    if (obj[key] !== val) {
                                        return false;
                                    }
                                }

                                return true;
                            }

                        }

                        return false;


                    } else {

                        return true;
                    }

                }

                return false;
            }
        };

        (function () {
            var types = ['Array', 'Function', 'Object', 'String', 'Number'],
                typesLength = types.length;

            function _getType(type) {
                return function (o) {
                    return !!o && ( Object.prototype.toString.call(o) === '[object ' + type + ']' );
                };
            }

            while (typesLength--) {

                _module['is' + types[typesLength]] = _getType(types[typesLength]);
            }
        })();

        return _module;

    }();


} else {

    var _cat = {
        utils: {
            Utils: {}
        }
    };

}
_cat.utils.Utils.generateGUID = function () {

    //GUID generator
    function S4() {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    }

    function guid() {
        return [S4(), S4(), "-", S4(), "-", S4(), "-", S4(), "-", S4(), S4(), S4()].join("");
    }

    return guid();
};

_cat.utils.Utils.extExists = function (value) {
    var pos;
    if (value) {
        pos = value.lastIndexOf(".");
        if (pos !== -1) {
            if (value.lastIndexOf(".js") !== -1 || value.lastIndexOf(".css") !== -1) {
                return true;
            }
        }
    }
    return false;
};

if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
        // nodejs support

        module.exports.generateGUID = _cat.utils.Utils.generateGUID;
        module.exports.extExists = _cat.utils.Utils.extExists;

    }
}


_cat.plugins.angular = function () {

    var   _log = _cat.core.log,
        
        _module = {

        utils: function () {

            var oldElement = "",
                _getargs = function(parentargs, autodetect) {
                    var args = [].slice.call(parentargs);
                    args.push(autodetect);
                    
                    return args;
                };

            return {

                $: function() {
                    return _cat.utils.plugins.jqhelper.$("angular");
                },

                setBoarder: function (element) {
                    if (oldElement) {
                        oldElement.classList.remove("markedElement");
                    }

                    if (element) {
                        element.className = element.className + " markedElement";
                    }
                    oldElement = element;

                },

                /**
                 * Get a an angular element 
                 *
                 * @param val {*} an element reference or a string DOM query
                 * @param autodetect {String} if "*" auto detect the returned handle or else specify [angular | jquery]
                 * @returns {*}
                 */
                getElt: function (val) {
                    var args = _getargs(arguments, "angular");
                    return _cat.utils.plugins.jqhelper.getElt.apply(this, args);
                },

                /**
                 * Trigger an event with a given object
                 *
                 * @param element {Object} The element to trigger from (The element JQuery representation id/class or the object itself)
                 * @param eventType {String} The event type name
                 * @param autodetect {String} if "*" auto detect the returned handle or else specify [angular | jquery]
                 *
                 * @private
                 */
                trigger: function() {
                    var args, result;
                    
                    args = _getargs(arguments, "angular");
                    
                    try {
                        result = _cat.utils.plugins.jqhelper.trigger.apply(this, args);
                    } catch (e) {
                        _log.warn("[catjs angular plugin] The trigger action failed with errors: ", e, " arguments:", JSON.stringify(args));   
                    }
                    
                    return result;
                },

                setText: function() {
                    var args = _getargs(arguments, "angular");
                    return _cat.utils.plugins.jqhelper.setText.apply(this, args);
                }
            };

        }(),

        actions: {

            /**
             * Trigger an event with a given object
             *
             * @param element {Object} The element to trigger from (The element JQuery representation id/class or the object itself)
             * @param eventType {String} The event type name
             * @param autodetect {String} if "*" auto detect the returned handle or else specify [angular | jquery]
             *
             * @private
             */
            trigger: function(element, eventType) {   
                var elt;
                
                if (element) {
                    elt = _module.utils.getElt(element);
                    if (elt) {
                        _module.utils.trigger(element, eventType);   
                    }                                        
                }                
            },
            
            setText: function(idName, value, usevents) {
                _module.utils.setText(idName, value, usevents, function(elt) {
                    _cat.plugins.jquery.utils.setBoarder(elt.eq(0)[0]);
                });
            },
            
            require: function(modules) {                
                var args = (modules ? {moduleName: modules} : undefined);
                _cat.core.angular(args);
            }
         
            
        }
    };
    
    return _module;

}();

_cat.plugins.deviceinfo = function () {



    return {

        actions: {


            deviceinfo: function (interval) {
                 if (typeof interval === "undefined") {
                     interval = true;
                 }

                var url = "catjsdeviceinfo://interval=" + interval + "&deviceId=" + _cat.core.guid(),
                    iframe = document.createElement("IFRAME");

                iframe.setAttribute("src", url);
                document.documentElement.appendChild(iframe);
                iframe.parentNode.removeChild(iframe);
                iframe = null;
            }
        }


    };

}();

var animation = false;


_cat.plugins.dom = function () {

    var _module,
        _eventdata = { dataTransfer: null };

    function _findPosition(obj) {

        function _native(obj) {
            var left, top;
            left = top = 0;
            if (obj.offsetParent) {
                do {
                    left += obj.offsetLeft;
                    top += obj.offsetTop;
                } while (obj = obj.offsetParent);
            } else {
                left += (obj.offsetLeft || 0);
                top += (obj.offsetTop || 0);
            }
            return {
                left: left,
                top: top,
                right: 0,
                bottom: 0
            };
        }

        if (obj) {
            if (typeof jQuery !== "undefined" && obj instanceof jQuery) {
                obj = obj[0];
            }
            if (obj) {
                //if (obj.getBoundingClientRect) {
                //    return obj.getBoundingClientRect();
                //} else {
                    return _native(obj);
                //}
            }
        }

        return undefined;
    }

    /**
     * Fire one or more DOM events according to a given element or coordinates {x, y}
     *
     * @param event {String} DOM event type name
     * @param opt {Object} event options
     * @returns {*}
     * @private
     */
    function _fireEvent(event, opt, callback) {

        var eventObj,
            position = false,
            pos,
            x = 0,
            y = 0,
            targetx,
            targety,
            steps,
            stepx, stepy,
            counter, index, delay,
            offsetx = opt.offset.x,
            offsety = opt.offset.y,
            elt;

        function _getSteps() {
            var steps = opt.steps;
            if (!("delay" in steps)) {
                steps.delay = 0;
            }
            if (!("count" in steps)) {
                steps.count = 1;
            }
            return steps;
        }

        function _createEvent(type, opt) {

            var event,
                x = opt.x, y = opt.y;


            if (type in {"dragstart": 1, "drop": 1, "dragover": 1}) {

                event = document.createEvent("CustomEvent");
                event.initCustomEvent(type, true, true, null);
                if (type === "dragstart" || !_eventdata.dataTransfer) {
                    _eventdata.dataTransfer = {
                        data: {
                        },
                        setData: function (type, val) {
                            _eventdata.dataTransfer.data[type] = val;
                        },
                        getData: function (type) {
                            return _eventdata.dataTransfer.data[type];
                        }
                    };
                }
                event.dataTransfer = _eventdata.dataTransfer;

            } else {

                _cat.core.log.info("[catjs dom fire] Event type:", type, " client cords [x, y]:  ", x, y);
                event = document.createEvent("MouseEvents");
                event.initMouseEvent(type, true, true, window,
                    0, 0, 0, x, y, false, false, false, 0, null);
            }
            return event;
        }

        function _dispatch() {

            var eletOffset, eltoffsetx, eltoffsety;
            
            function isDocument(ele) {
                var documenttest = /\[object (?:HTML)?Document\]/;
                return documenttest.test(Object.prototype.toString.call(ele));
            }

            if (event) {

                index++;

                if (document.createEvent) {

                    if (isNaN(stepx)) {
                        stepx = 0;
                    }
                    if (isNaN(stepy)) {
                        stepy = 0;
                    }
                    
                    eletOffset = _findPosition(opt.element);

                    if (event === "mousemove" || opt.cords) {

                        if (index === 1 && (_cat.utils.plugins.jqhelper.isjquery())) {
                            eletOffset = _findPosition(opt.element);

                            x -= eltoffsetx = (eletOffset.left || 0);
                            y -= eltoffsety = (eletOffset.top || 0);

                        }

                        x += stepx + (offsetx / counter);
                        y += stepy + (offsety / counter);

                        x = Math.round(x);
                        y = Math.round(y);

                    } else {
                        x = 0;
                        y = 0;
                    }                   

                    eventObj = _createEvent(event, {x: x, y: y});
                    elt.dispatchEvent(eventObj);

                } else {

                    elt.fireEvent("on" + event);
                }

                if (index < counter) {
                    setTimeout(_dispatch, delay);

                } else {
                    callback.call(this);
                }

            } else {
                _cat.core.log.warn("[catjs dom fire event] No valid event was found");
            }

        }

        if (!event) {
            return undefined;
        }

        steps = _getSteps();

        // resolve target element data
        if (opt.target) {
            if (_cat.utils.Utils.getType(opt.target) === "object") {
                if ("x" in opt.target && "y" in opt.target) {
                    targetx = opt.target.x;
                    targety = opt.target.y;
                }

            } else {
                pos = _findPosition(opt.target);
                if (pos) {
                    targetx = pos.left;
                    targety = pos.top;
                }
            }
        }

        // resolve element data
        if (_cat.utils.Utils.getType(opt.element) === "object") {
            if ("x" in opt.element && "y" in opt.element) {
                x = opt.element.x;
                y = opt.element.y;
                position = true;
            }
        } else if (opt.cords || targetx) {
            if (typeof opt.cords === "object") {
                pos = _findPosition(opt.cords);
            } else if (typeof opt.cords === "boolean") {
                pos = _findPosition(opt.element);
            }
            if (pos) {
                x = pos.left;
                y = pos.top;
                position = true;
            }
        }

        if (position) {
            if (document.elementFromPoint) {
                elt = document.elementFromPoint(x, y);
            }
            if (!elt) {
                elt = opt.element;
            }

        } else {
            elt = opt.element;
        }

        if (!elt) {
            _cat.core.log.warn("[catjs dom fire event] No valid element was found");
            return undefined;
        }

        index = 0;
        delay = steps.delay;
        counter = steps.count;

        if (targetx !== undefined) {
            stepx = (targetx - x) / counter;
            stepy = (targety - y) / counter;

        } else {
            // TBD        
        }


        _dispatch();
    }

    function _addEventListener(event, elem, fn) {
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

    function _getargs(parentargs, autodetect) {
        var args = [].slice.call(parentargs);
        args.push(autodetect);

        return args;
    }

    function _getElt(val) {
        var args = _getargs(arguments, "*");
        return _cat.utils.plugins.jqhelper.getElt.apply(this, args);
    }

    _module = {


        utils: function () {

            var oldElement = "";


            return {

                $: function () {
                    return _cat.utils.plugins.jqhelper.$();
                },

                setBoarder: function (element) {
                    if (oldElement) {
                        oldElement.classList.remove("markedElement");
                    }

                    if (element) {
                        element.className = element.className + " markedElement";
                    }
                    oldElement = element;

                },

                findPosition: function (obj) {
                    return _findPosition(obj);
                },

                getElt: function (val) {
                    return _getElt(val);
                },

                trigger: function () {
                    var args = _getargs(arguments, "*");
                    return _cat.utils.plugins.jqhelper.trigger.apply(this, args);
                },

                setText: function () {
                    var args = _getargs(arguments, "*");
                    return _cat.utils.plugins.jqhelper.setText.apply(this, args);
                }
            };

        }(),

        actions: {


            snapshot: function (idName) {

                var elt,
                    me = this;


                function _isCanvasSupported() {
                    var elem = document.createElement('canvas');
                    return !!(elem.getContext && elem.getContext('2d'));
                }

                /**
                 * capture canvas data
                 *
                 * @param elt
                 * @returns {undefined}
                 * @private
                 */
                function _captureCanvas(elt) {

                    var data,
                        serverURL = _cat.utils.Utils.getCatjsServerURL("/screenshot");

                    function _getData(canvas) {
                        var data;

                        if (canvas.toDataURL) {
                            data = canvas.toDataURL("image/png");
                        }

                        return data;
                    }

                    function _save(data) {

                        function _prepareImage(data) {
                            return data.replace(/^data:image\/png;base64,/, "");
                        }

                        if (data) {

                            _cat.utils.AJAX.sendRequestAsync({
                                url: serverURL,
                                method: "POST",
                                data: {
                                    pic: _prepareImage(data),
                                    scrapName: ( "scrap" in me ? me.scrap.name : "temp" ),
                                    deviceId: _cat.core.guid()
                                },
                                header: [
                                    {name: "Content-Type", value: "application/json;charset=UTF-8"}
                                ],
                                callback: function () {
                                    if (this.responseText) {
                                        _cat.core.log.info("[catjs dom snapshot] request processed successfully response: ", this.responseText);
                                    }
                                }
                            });
                        }
                    }

                    if (elt) {

                        // DOM element case
                        if (elt.nodeType && elt.nodeType === 1) {


                            // canvas element case
                            if (elt.nodeName.toLowerCase() === "canvas") {

                                _save(_getData(elt));

                                // try using html2canvas    
                            } else {
                                if (typeof html2canvas !== "undefined") {

                                    html2canvas(elt).then(function (canvas) {
                                        _save(_getData(canvas));
                                    });
                                } else {
                                    _cat.core.log.warn("[catjs dom plugin] no valid 'html2canvas' handle was found, consider adding it as a dependency in your catproject.json ");
                                }
                            }
                        }
                    }
                }

                // test if canvas supported
                if (!_isCanvasSupported()) {
                    _cat.core.log.warn("[catjs dom plugin] Your browser doesn't support canvas element ");

                    return undefined;
                }

                elt = _module.utils.getElt(idName);
                if (_cat.utils.plugins.jqhelper.isjquery() || _cat.utils.plugins.jqhelper.isangular()) {
                    elt = elt[0];
                }
                
                if (elt) {
                    if (_cat.utils.Utils.getType(elt) === "array") {


                    } else {
                        _captureCanvas(elt);
                    }
                }


            },

            /**
             * Listen to a DOM event
             *
             * @param event {*} a given event name or an array of names
             * @param opt {Object} event's listener options
             *      element {*} The DOM element to be listen to or coordinates {x, y}
             *      listener {Function} Listener functionality
             */
            listen: function (event, opt) {

                _cat.utils.Utils.prepareProps(
                    {
                        global: {
                            obj: opt
                        },
                        props: [
                            {
                                key: "element",
                                require: true
                            },
                            {
                                key: "listener",
                                require: true
                            }
                        ]
                    });

                var elt = _module.utils.getElt(opt.element);
                // todo a generic code please..
                if (_cat.utils.plugins.jqhelper.isjquery() || _cat.utils.plugins.jqhelper.isangular() ) {
                    elt = elt[0];
                }
                if (elt) {
                    _addEventListener(event, elt, opt.listener);
                }
            },

            /**
             * Fire a DOM event
             *
             * @param event {*} a given event name or an array of names
             * @param opt {Object} event's fire options
             *      element {*} The DOM element to be fired or coordinates {x, y}
             *      cords {Boolean} combined with the given element or target element, get its coordinates or else use the element
             *      repeat {Number} Number of calls
             *      delay {Number} delay in milliseconds between calls
             */
            fire: function (event, opt, callback) {

                var items, index = 0, size;

                if (!event || !opt) {
                    _cat.core.log.warn("[catjs plugin dom fire] no valid event and/or element were found");
                    return undefined;
                }

                if (_cat.utils.Utils.getType(opt) === "string") {
                    opt = {element: opt};
                }

                _cat.utils.Utils.prepareProps(
                    {
                        global: {
                            obj: opt
                        },
                        props: [
                            {
                                key: "element",
                                require: true
                            },
                            {
                                key: "target"
                            },
                            {
                                key: "offset",
                                default: {x: 0, y: 0}
                            },
                            {
                                key: "cords",
                                default: false
                            },
                            {
                                key: "steps",
                                default: {delay: 0, count: 1}
                            }
                        ]
                    });                
                
                if (_cat.utils.Utils.getType(event) === "array") {
                    items = event;

                } else if (_cat.utils.Utils.getType(event) === "string") {
                    items = [event];

                } else {
                    items = [];
                }

                opt.element = _module.utils.getElt(opt.element);                
                opt.target = (opt.target ? _module.utils.getElt(opt.target) : opt.target);
                
                // todo a generic code please..
                if (_cat.utils.plugins.jqhelper.isjquery() || _cat.utils.plugins.jqhelper.isangular()) {
                    opt.element = opt.element[0];
                    if (opt.target && opt.target[0]) {
                        opt.target = opt.target[0];
                    }
                }


                function firecallback() {
                    index++;
                    if (index < size) {
                        _fireEvent(items[index], opt, firecallback);
                    }
                }

                size = items.length;
                _fireEvent(items[index], opt, firecallback);

            }

        }


    };

    return _module;

}();

_cat.plugins.enyo = function () {

    var _me;

    function _noValidMessgae(method) {
        return ["[cat enyo plugin] ", method, "call failed, no valid argument(s)"].join("");
    }

    function _genericAPI(element, name) {
        if (name) {
            if (!element) {
                _cat.core.log.info("[catjs enyo plugin]", _noValidMessgae("next"));
            }
            if (element[name]) {
                element[name]();
            } else {
                _cat.core.log.info("[catjs enyo plugin] No valid method was found, '" + name + "'");
            }
        }
    }

    _me = {

        actions: {


            waterfall: function (element, eventName) {
                if (!element || !eventName) {
                    _cat.core.log.info("[catjs enyo plugin]", _noValidMessgae("waterfall"));
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

    var _module = {

        actions: {

            selectTab: function (idName) {
                _cat.plugins.jquery.utils.$()(document).ready(function(){
                    var elt =  _cat.plugins.jquery.utils.getElt(idName);
                    elt.trigger('click');

                    _cat.plugins.jquery.utils.setBoarder( elt.eq(0)[0]);
                });

            },

            selectMenu : function (selectId, value) {
                _cat.plugins.jquery.utils.$()(document).ready(function(){
                    var elt =  _cat.plugins.jquery.utils.getElt(selectId);
                    if (typeof value === 'number') {
                        elt.find(" option[value=" + value + "]").attr('selected','selected');
                    } else if (typeof value === 'string') {
                        elt.find(" option[id=" + value + "]").attr('selected','selected');
                    }
                    elt.selectmenu("refresh", true);

                    _cat.plugins.jquery.utils.setBoarder( elt.eq(0)[0]);
                });
            },

            swipeItemLeft : function(idName) {
                _cat.plugins.jquery.utils.$()(document).ready(function(){
                    var elt =  _cat.plugins.jquery.utils.getElt(idName);

                    elt.swipeleft();
                    _cat.plugins.jquery.utils.setBoarder( elt.eq(0)[0]);
                });
            },

            swipeItemRight : function(idName) {
                _cat.plugins.jquery.utils.$()(document).ready(function(){
                    var elt =  _cat.plugins.jquery.utils.getElt(idName);
                    elt.swiperight();

                    _cat.plugins.jquery.utils.setBoarder( elt.eq(0)[0]);
                });
            },

            swipePageLeft : function() {
                _cat.plugins.jquery.utils.$()(document).ready(function(){
                    _cat.plugins.jquery.utils.$()( ".ui-page-active" ).swipeleft();

                });
            },

            swipePageRight : function() {
                _cat.plugins.jquery.utils.$()(document).ready(function(){

                    var prev = _cat.plugins.jquery.utils.$()( ".ui-page-active" ).jqmData( "prev" );

                });
            },

            tap: function (idName) {
                _cat.plugins.jquery.utils.$()(document).ready(function(){
                    var elt =  _cat.plugins.jquery.utils.getElt(idName);
                    elt.trigger('tap');

                    _cat.plugins.jquery.utils.setBoarder( elt.eq(0)[0]);
                });
            },

            slide : function (idName, value) {
                _cat.plugins.jquery.utils.$()(document).ready(function(){
                    var elt =  _cat.plugins.jquery.utils.getElt(idName);

                    elt.val(value).slider("refresh");
                    _cat.plugins.jquery.utils.setBoarder( elt.eq(0)[0]);
                });
            },

            searchInListView : function (listViewId, newValue) {
                _cat.plugins.jquery.utils.$()(document).ready(function(){
                    var elt =  _cat.plugins.jquery.utils.getElt(listViewId),
                        listView = elt[0],
                        parentElements = listView.parentElement.children,
                        form = parentElements[_cat.plugins.jquery.utils.$().inArray( listView, parentElements ) - 1];

                    _cat.plugins.jquery.utils.$()( form ).find( "input" ).focus();
                    _cat.plugins.jquery.utils.$()( form ).find( "input" ).val(newValue);
                    _cat.plugins.jquery.utils.$()( form ).find( "input" ).trigger( 'change' );
                });
            }
        }
    };
    
    return _module;

}();

var animation = false;

_cat.plugins.jquery = function () {

    var _module = {

        utils: function () {

            var oldElement = "",
                _getargs = function(parentargs, autodetect) {
                    var args = [].slice.call(parentargs);
                    args.push(autodetect);

                    return args;
                };


            return {                              
                
                $: function() {
                    return _cat.utils.plugins.jqhelper.$();
                },
                
                setBoarder: function (element) {
                    if (oldElement) {
                        oldElement.classList.remove("markedElement");
                    }

                    if (element) {
                        element.className = element.className + " markedElement";
                    }
                    oldElement = element;

                },

                getElt: function (val) {
                    var args = _getargs(arguments, "jquery");
                    return _cat.utils.plugins.jqhelper.getElt.apply(this, args);
                },
                
                trigger: function() {
                    var args = _getargs(arguments, "jquery");
                    return _cat.utils.plugins.jqhelper.trigger.apply(this, args);
                },
                
                setText: function() {
                    var args = _getargs(arguments, "jquery");
                    return _cat.utils.plugins.jqhelper.setText.apply(this, args);
                }          
            };

        }(),

        actions: {


            scrollTo: function (idName) {

                _cat.plugins.jquery.utils.$()(document).ready(function () {
                    var elt = _cat.plugins.jquery.utils.getElt(idName),
                        stop = elt.offset().top,
                        delay = 1000;

                    _cat.plugins.jquery.utils.$()('body,html').animate({scrollTop: stop}, delay);

                    _cat.plugins.jquery.utils.setBoarder(elt.eq(0)[0]);
                });

            },


            scrollTop: function () {

                _cat.plugins.jquery.utils.$()(document).ready(function () {
                    _cat.plugins.jquery.utils.$()('html, body').animate({scrollTop: 0}, 1000);
                });

            },

            scrollToWithRapper: function (idName, rapperId) {

                _cat.plugins.jquery.utils.$()(document).ready(function () {
                    var elt = _cat.plugins.jquery.utils.getElt(idName),
                        stop = elt.offset().top,
                        delay = 1000;

                    _cat.plugins.jquery.utils.getElt(rapperId).animate({scrollTop: stop}, delay);
                    _cat.plugins.jquery.utils.setBoarder(_cat.plugins.jquery.utils.getElt(idName).eq(0)[0]);
                });

            },

            clickRef: function (idName) {
                _cat.plugins.jquery.utils.$()(document).ready(function () {
                    var elt = _cat.plugins.jquery.utils.getElt(idName);

                    elt.trigger('click');
                    window.location = elt.attr('href');

                    _cat.plugins.jquery.utils.setBoarder(elt.eq(0)[0]);
                });

            },


            clickButton: function (idName) {
                _cat.plugins.jquery.utils.$()(document).ready(function () {
                    var elt = _cat.plugins.jquery.utils.getElt(idName);

                    _cat.plugins.jquery.utils.$()('.ui-btn').removeClass('ui-focus');
                    elt.trigger('click');
                    elt.closest('.ui-btn').addClass('ui-focus');

                    _cat.plugins.jquery.utils.setBoarder(elt.eq(0)[0]);
                });

            },


            click: function (idName) {
                _cat.plugins.jquery.utils.$()(document).ready(function () {
                    var elt = _cat.plugins.jquery.utils.getElt(idName);
                    elt.trigger('click');

                    _cat.plugins.jquery.utils.setBoarder(elt.eq(0)[0]);
                });
            },


            setCheck: function (idName) {
                _cat.plugins.jquery.utils.$()(document).ready(function () {
                    var elt = _cat.plugins.jquery.utils.getElt(idName);

                    elt.prop("checked", true).checkboxradio("refresh");
                    _cat.plugins.jquery.utils.setBoarder(elt.eq(0)[0]);
                });

            },


            setText: function (idName, value, usevents) {
                _module.utils.setText(idName, value, usevents, function(elt) {
                    _cat.plugins.jquery.utils.setBoarder(elt.eq(0)[0]);
                });
            },
            
            getValue: function(idName) {
                _cat.plugins.jquery.utils.$()(document).ready(function () {
                    var elt = _cat.plugins.jquery.utils.getElt(idName);
                    elt.val();
                });                
            },

            checkRadio: function (className, idName) {
                _cat.plugins.jquery.utils.$()(document).ready(function () {
                    _cat.plugins.jquery.utils.$()("." + className).prop("checked", false).checkboxradio("refresh");
                    _cat.plugins.jquery.utils.$()("#" + idName).prop("checked", true).checkboxradio("refresh");


                    _cat.plugins.jquery.utils.setBoarder(_cat.plugins.jquery.utils.$()("label[for='" + idName + "']").eq(0)[0]);

                });

            },

            collapsible: function (idName) {
                _cat.plugins.jquery.utils.$()(document).ready(function () {
                    var elt = _cat.plugins.jquery.utils.getElt(idName);

                    elt.children(".ui-collapsible-heading").children(".ui-collapsible-heading-toggle").click();
                    _cat.plugins.jquery.utils.setBoarder(elt.eq(0)[0]);
                });

            },

            backClick: function () {
                _cat.plugins.jquery.utils.$()(document).ready(function () {
                    _cat.plugins.jquery.utils.$()('[data-rel="back"]')[0].click();
                });
            }
        }
    };

    return _module;

}();

_cat.plugins.screenshot = function () {



    return {

        actions: {


            screenshot: function (scrapName) {

                var url = "catjsgetscreenshot://scrapName=" + scrapName + "&deviceId=" + _cat.core.guid(),
                iframe = document.createElement("IFRAME");

                iframe.setAttribute("src", url);
                document.documentElement.appendChild(iframe);
                iframe.parentNode.removeChild(iframe);
                iframe = null;
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

_cat.plugins.testdata = function () {
   
    var _module = {

        actions: {
        
        }
    };

    (function() {
        var testdb = _cat.utils.TestsDB,
            key;
        
        for (key in testdb) {
            if (testdb.hasOwnProperty(key)) {
                _module.actions[key] = _cat.utils.TestsDB[key];
            }
        }
        
    })();

    return _module;

}();

function _catjs_settings() {
    var _topWindow,
        _isIframe = function() {
            try {
                return window.self !== window.top;

            } catch (e) {
                return true;
            }
        },

        _rootWindow = function() {

            function _getTopWindow(parentarg) {
                if (!parentarg) {
                    parentarg = window;
                }
                parentarg = parentarg.parent;
                if(window.top !== parentarg) {
                    _getTopWindow(parentarg);
                }
                return parentarg;
            }

            if(window.top === window.self) {

                return window.top;

            } else {

                return _getTopWindow();
            }
        };

    if (_isIframe() ){
        _topWindow = _rootWindow();
        if (_topWindow && _topWindow._cat) {
            _cat = _topWindow._cat;

            return true;
        }
    }

    return false;
}

if (typeof exports !== "object") {

    _catjs_settings();

}