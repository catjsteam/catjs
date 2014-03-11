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