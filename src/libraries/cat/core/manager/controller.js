_cat.core.manager.controller = function () {

    var _module,
        deffer = Q;

    _module = {

        state: function() {
            return _cat.core.manager.statecontroller;
        },


    /**
         * Invoke a given client command
         *
         * Config:
         *       methods {Array} string javascript functions reference
         *       commands {Array} string javascript statements
         *       context {Object} catjs context object
         *
         *
         * @param config
         */
        invoke: function (config) {
            
            var codeCommands, 
                context, 
                methods, 
                commands = [],
                delayManagerCommands,
                currentState,
                runStatus;

            delayManagerCommands = function (dmcommands, dmcontext) {

                var indexCommand = 0,
                    catConfig = _cat.core.getConfig(),
                    _enum = catConfig.getTestsTypes(),
                    executeCode,
                    delay = catConfig.getTestDelay(),
                    scrap = ("scrap" in dmcontext  ? dmcontext.scrap : undefined),
                    standalone = _cat.utils.scrap.isStandalone(scrap),
                    testobj, currentTestIdx,
                    ideffer = Q;

                currentState = _cat.core.manager.client.getCurrentState();
                runStatus = _cat.core.manager.client.getRunStatus();
                    
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


                    _cat.core.manager.client.updateTimeouts(scrap);

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

                            _cat.core.ui.setContent({
                                style: 'color:#0080FF, font-size: 10px',
                                header: ((scrap && "name" in scrap && scrap.name) || "'NA'"),
                                desc: (description.length > 0 ? description.join("_$$_") : description.join("")),
                                tips: {},
                                currentState: currentState
                            });

                            /*jshint loopfunc:true */

                            if (_cat.utils.Utils.getType(commandObj) === "string") {

                                commandObj = (commandObj ? commandObj.trim() : undefined);
                                ideffer = ideffer[(ideffer.then ? "then" : "fcall")](function() {
                                    return new Function(functionargskeys.join(","), "return " + commandObj).apply(this, functionargs);
                                });

                            } else if (_cat.utils.Utils.getType(commandObj) === "function") {
                                ideffer = ideffer[(ideffer.then ? "then" : "fcall")](function() {
                                    commandObj.apply(this, functionargs);
                                });
                            }

                        } else {
                            console.warn("[CatJS] Ignore, Not a valid command: ", commandObj);
                        }

                        return ideffer;
                    }

                    runStatus.numRanSubscrap = runStatus.numRanSubscrap + size;

                    if ((runStatus.numRanSubscrap === runStatus.subscrapReady) && runStatus.scrapReady === runStatus.scrapsNumber) {
                        var reportFormats;
                        if (catConfig.isReport()) {
                            reportFormats = catConfig.getReportFormats();
                        }

                        _cat.core.manager.client.endTest({reportFormats: reportFormats}, (runStatus.intervalObj ? runStatus.intervalObj.interval : undefined));
                    }

                };

                runStatus.subscrapReady = runStatus.subscrapReady + dmcommands.length;

                if ( ((catConfig) && (catConfig.getRunMode() === _enum.TEST_MANAGER)) && !standalone) {
                    
                    return executeCode(dmcommands, dmcontext);
                   
                } else {
                    
                    // Todo need to be tested
                    deffer.fcall(function(){return executeCode(dmcommands, dmcontext);});
                }

                return deffer;
            };
            
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
        }
    };


    return _module;

}();