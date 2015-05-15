var _cat = {
    utils: { plugins: { jqhelper: {}}},
    plugins: {},
    ui: {},
    errors: {}    
}, _catjs = {};

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
        _catjspath,
        _rootcatcore,
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

            var me = this,
                _ownerWin = function (elt) {
                    if (elt) {
                        return (elt.ownerDocument.defaultView || elt.ownerDocument.parentWindow);
                    }

                    return undefined;
                }, win = (_ownerWin((config && "win" in config ? config.win : undefined)) || window);
            
            
            function _configCallback(config, rootcatcore) {

                function _postinit(responseData) {

                    if (responseData) {
                        // update the client manager with the incoming server data such as: current index
                        _cat.core.manager.client.setCurrentState(responseData);
                    }
                    
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
                    _cat.core.TestManager.init(responseData);

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

                    // setup the failure interval in case the tests will not be reached...
                    _cat.core.manager.client.setFailureInterval(_config);
                }
                
                if (config) {

                    if (rootcatcore) {

                        _cat.utils.TestsDB.init( rootcatcore.utils.TestsDB.getData() );
                        
                    } else {
                        _cat.utils.TestsDB.init();
                    }

                    _enum = _cat.core.TestManager.enum;
                    
                    if (rootcatcore) {
                        _guid = rootcatcore.utils.Storage.getGUID();
                        _postinit();
                        
                    } else {
                        _guid = _cat.utils.Storage.getGUID();

                        config.id = _guid;
                        _cat.utils.AJAX.sendRequestAsync({
                            url : _cat.core.getBaseUrl("catjsconfig"),
                            method: "POST",
                            header: [{name: "Content-Type", value: "application/json;charset=UTF-8"}],
                            data: config,
                            callback : {
                                call : function(xmlhttp) {
                                    var configText = xmlhttp.response,
                                        currentIndex = 0,
                                        responseObject;
                                    
                                    if (configText) {
                                        
                                        try {
                                            // returned object {status: [ready | error], error: {msg: ''}, currentIndex:[0 | Number]}
                                            responseObject = JSON.parse(configText);
                                            if (responseObject) {
                                                currentIndex = responseObject.currentIndex;
                                            }
                                            
                                        } catch(e) {
                                            // could not parse the request 
                                        }
                                        
                                        _postinit({currentIndex: currentIndex});

                                    }
                                }
                            }
                        });
                    }

                  
                }
                
            }
            
            // set catjs path
            if (config) {
                if ("catjspath" in config) {
                    _catjspath = config.catjspath;
                }
            }

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
            
            if (_cat.utils.iframe.isIframe(win)) {
                try {
                    _rootcatcore = _cat.utils.iframe.catroot(win);
                    _config = _rootcatcore.core.getConfig();                
                    _configCallback(config, _rootcatcore);
                    
                } catch(e) {
                    _log.error("[catjs core] failed to resolve the parent window error:",e);
                }
            }
            
            //_cat.core.manager.client.setFailureInterval();
            
            if (!_rootcatcore) {
                _config = new _cat.core.Config({
                    
                    hasPhantomjs: hasPhantomjs,
                    
                    log: _log,
                    
                    callback: function(config) {
                        _configCallback(config);
                    }
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
                    _cat.core.manager.client.signScrap(scrap, catConfig, arguments, tests);
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

                            managerScrap.scrap.catui = ["on"];
                            managerScrap.scrap.manager = ["true"];


                            pkgname = managerScrap.scrap.pkgName;
                            if (!pkgname) {
                                _log.error("[catjs action] Scrap's Package name is not valid");
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
                                    _log.error("[catjs action] Scrap's Package name is not valid");
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
                        _log.info("[catjs action] " + scrap.name[0] + " was not run as it does not appears in testManager");
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
                            scrapinfo: ("scrapinfo" in config ? config.scrapinfo : undefined),
                            def:  ("def" in config ? config.def : undefined),
                            done:  ("done" in config ? config.done : undefined)

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
        },
        
        manager: {},
        
        alias: function(name, obj) {
            var names, idx, size, key, aliasobj = _catjs;
            
            names = name.split(".");
            size = names.length;
            for (idx=0; idx<size; idx++) {
                key = names[idx];
                if (key) {
                    if (idx === size-1) {
                        if (aliasobj) {
                            aliasobj[key] = (obj || {});
                        }
                    } else {
                        if (!_catjs[key]) {
                            _catjs[key] = {};
                        }
                        aliasobj = _catjs[key];
                    }
                }
            }
        }
    };
    
    return _module;

}();

if (typeof exports === "object") {
    module.exports = _cat;
}