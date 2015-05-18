_cat.core.manager.statecontroller = function () {

    // jshint supernew: true

    var _queue =
            /**
             *  General queue class
             */
                function () {

                this._queue = [];
                this._busy = false;

                this.add = function (obj) {
                    this._queue.push(obj);
                };
                this.next = function () {
                    return this._queue.shift();
                };
                this.hasnext = function () {
                    return (this._queue.length > 0 ? true : false);
                };
                this.empty = function () {
                    return (this._queue.length === 0 ? true : false);
                };
                this.clean = function () {
                    this._queue = [];
                };
                this.busy = function (status) {
                    if (status !== undefined) {
                        this._busy = status;
                    }
                    return this._busy;
                };
            },
        _q = new _queue(),
        _steps = 10,
        _defer,
        _module,
        _scrapspool = new _queue();

    _module = {

        defer: function (def) {
            _defer = def;
        },


        resolve: function (obj) {
            _defer.resolve(obj);

        },

        wait: function (config) {

            var counter = 0,
                ihandle,
                match,
                me = this,
                __wait, __onready;

            function _test(item) {

                var valid = 0,
                    test, testobj;

                if ("match" in item) {
                    match = item.match;
                    if (match && match !== "undefined") {
                        if (typeof match === "function") {

                            test = match.apply(me, ("context" in config ? config.context : []));

                        } else if (typeof match === "object" || typeof match === "string") {

                            testobj = _cat.utils.plugins.jqhelper.getElt(match);
                            if (testobj) {
                                testobj = _cat.utils.plugins.jqhelper.dom(testobj);
                                if (testobj) {
                                    test = true;
                                }
                            }
                        }

                        if (!test) {
                            valid++;
                        }
                    }
                }

                return (valid > 0 ? false : true);
            }

            function _wait(item) {

                var steps = ( ("steps" in item) ? (item.steps || 1) : _steps ),
                    wait = Math.max(Math.floor(item.delay / steps), 0);

                ihandle = setInterval(function () {

                    var test;
                    counter++;

                    test = _test(item);
                    if (test) {
                        //console.log("test is valid!... continue");
                        if ("match" in item) {
                            counter = steps;
                        }
                    }

                    if (counter === steps) {
                        if (!test) {
                            console.warn("[catjs wait] One or more Objects was not resolved, but the timeout expired");
                            if (chai) {
                                chai.assert.ok(test, 'One or more Objects was not resolved, but the timeout expired');
                            }
                        }

                        if ("callback" in item) {
                            item.callback.apply(_module, ("context" in config ? config.context : []));
                        }

                        counter = 0;
                        clearInterval(ihandle);
                        if (_q.empty()) {
                            _q.busy(false);
                            _defer.resolve();
                        } else {
                            _q.busy(true);
                            _wait(_q.next());
                        }
                    }

                }, wait);
            }

            __onready = function (config) {
                if (_q.busy()) {
                    _q.add(config);

                } else {
                    _q.busy(true);
                    _wait(config);
                }
            };

            __wait = function () {
                var args = arguments;

                __onready(args[0]);

                return {
                    promise: _defer.promise,
                    wait: __wait
                };
            };

            __onready(config);

            return {
                promise: _defer.promise,
                wait: __wait
            };
        },

        next: function (config, callback) {

            var defer, methods, delay,
                currentconfig, nextTest, catconfig,
                clientManager = _cat.core.manager.client,
                runStatus, done;

            if (config) {
                _scrapspool.add(config);
            }

            if (!_scrapspool.busy()) {

                currentconfig = _scrapspool.next();
                catconfig = _cat.core.getConfig();
                nextTest = catconfig.getNextTest();
                if (nextTest) {
                    // we have more tests to run
                    clientManager.setFailureInterval(catconfig, ( nextTest ? {id: nextTest.name, name: nextTest.name} : undefined ));
                                                      
                    if (!catconfig.hasNextTest() ) {
                        done = function () {
                            // last scrap done callback
                                           
                        };
                    }
                    
                } else {
                    // this is the last test 
                    runStatus = clientManager.getRunStatus();
                    clientManager.endTest({}, runStatus);

                    if (callback) {
                        callback.call();
                    }
                }
                if (!currentconfig) {
                    return undefined;
                }

                defer = currentconfig.defer;
                methods = currentconfig.methods;
                delay = ("delay" in currentconfig ? currentconfig.delay : 0);

                _scrapspool.busy(true);
                defer.delay(delay).then(function () {

                    defer.fcall(function () {
                        var cell = methods.shift(),
                            def = Q.defer();

                        _module.defer(def);

                        (function () {
                            cell.call(this, def, done);
                            
                            return def;

                        })(def).promise.then(function () {
                                _scrapspool.busy(false);
                                _module.next(undefined, callback);    
                                
                                
                            });

                        
                    });

                    

                }).catch(function (err) {
                        console.error(err);
                    });                              
            }
        }

    };

    return _module;

}();