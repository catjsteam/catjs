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
                    '<div class="text-tips">' +
                    '   <div class="tests">Tests <span style="color:green">passed</span> : <span  id="tests_passed">0</span></div>' +
                    '   <div class="tests">Tests <span style="color:red">failed</span> : <span  id="tests_failed">0</span></div>' +
                    '   <div class="tests"><span  id="tests_total_counter">0</span> Tests Total (<span  id="tests_total">0</span>)</div>' +
                    '</div>' +
                    '<div id="cat-status-content">' +
                    '<ul id="testList"></ul>' +
                    '</div>' +
                    '<div id="catmask" class="fadeMe"></div>' +
                    '</div>';                   

            if (document.body) {
                document.body.appendChild(catElement);
            }
        }
    }

    function _getCATElt() {
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

    var _disabled = false,
        _onloadIstener,
        _loaderListener = false,
        _me =  {

        disable: function() {
            _disabled = true;
        },

        enable: function() {
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
           
            if (!_loaderListener) {
                _loaderListener = true;
                _addEventListener(window, "load", function(e) {
                    
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
        
                        if (catElement) {
                            _onloadIstener = false;    
                        }
                        
                        // set logo listener
                        var logoelt = document.getElementById("catlogo"),
                            catmask = document.getElementById("catmask"),
                            listener = function() {                            
                                if (catmask) {
                                    catmask.classList.toggle("fadeMe");
                                }
                            };
        
                        if (logoelt && catmask && catmask.classList) {
                            _addEventListener(logoelt, "click", listener);
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

                    if (catStatusContentElt) {
                        catStatusContentElt.classList.toggle("displayoff");
                    }
                }
            }


        },

        isOpen: function() {
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

        setContentTip: function(config) {

            var  testsFailed =  document.getElementById("tests_failed"),
                testsPassed =  document.getElementById("tests_passed"),
                testsTotal =  document.getElementById("tests_total"),
                testsTotalCounter =  document.getElementById("tests_total_counter"),
                testStatus;

            if ("tips" in config) {
                if ("tips" in config && config.tips) {
                    testStatus  = config.tips;
                    if (testStatus) {
                        if ("failed" in testStatus) {
                            _setText(testsFailed, testStatus.failed);
                        }
                        if ("passed" in testStatus) {
                            _setText(testsPassed, testStatus.passed);
                        }
                        if ("tests" in testStatus) {
                            _setText(testsTotal, testStatus.tests);
                        }
                        if ("total" in testStatus) {
                            _setText(testsTotalCounter, testStatus.total);
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
                catElement = _getCATElt(),
                isOpen = false,
                reset = ("reset" in config ? config.reset : false),
                me = this;

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

                           
                            
                            
                            setTimeout(function() {
                              
                                // add element to ui test list
                                if ("header" in config) {
                                    _setText(newLI.childNodes[0]  , config.header, config.style);
                                }
                                if ("desc" in config) {
                                    _setText(newLI.childNodes[1], config.desc, config.style);
                                }

                                me.setContentTip(config);
                                
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