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
                '<div id="catmask" class="fadeMe"></div>';

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