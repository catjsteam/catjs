_cat.core.ui = function () {

    function _create() {

        var catElement;
        if (typeof document !== "undefined") {
            var catElement = document.createElement("DIV");

            catElement.id = "__catelement";
            catElement.style.width = "200px";
            catElement.style.height = "200px";
            catElement.style.position = "fixed";
            catElement.style.bottom = "10px";
            catElement.style.zIndex = "10000000";
            catElement.style.display = "none";
            catElement.innerHTML = '<div id="cat-status" class="cat-dynamic cat-status-open">' +
                '<div id=loading></div>' +
                '<div id="catlogo"></div>' +
                '<div id="cat-status-content">' +
                '<div class="text-tips"></div>' +
                '<div class="text-top"><span style="color:green">This is a text</span></div>' +
                '<div class="text">this is a text</div>' +
                '</div>' +
                '</div>';

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
                catStatusContentElt = catStatusElt.childNodes[2];
            }
        }

        return catStatusContentElt;
    }

    function _resetContent() {
        _me.setContent({
            header: "",
            desc: "",
            tips: ""
        });
    }

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
                catElement = _getCATElt();

            function _setText(elt, text, style) {

                var styleAttrs = (style ? style.split(";") : []);

                if (elt) {
                    styleAttrs.forEach(function (item) {
                        var value = (item ? item.split(":") : undefined);
                        if (value) {
                            elt.style[value[0]] = value[1];
                        }
                    });
                    elt.innerText = text;
                }
            }

            if (catElement) {
                catStatusContentElt = _getCATStatusContentElt();
                if (catStatusContentElt) {
                    if (config) {
                        if (config.header) {
                            _me.on();
                            if (!_me.isOpen()) {
                                _me.toggle();
                            }
                        }

                        setTimeout(function() {
                            if ("header" in config) {
                                _setText(catStatusContentElt.childNodes[1], config.header, config.style);
                            }
                            if ("desc" in config) {
                                _setText(catStatusContentElt.childNodes[2], config.desc, config.style);
                            }
                            if ("tips" in config) {
                                _setText(catStatusContentElt.childNodes[0], config.tips, config.style);
                            }

//                            if (config.header) {
//                                setTimeout(function () {
//                                    _me.toggle();
//                                }, 2000)
//                            }
                        }, 500);
                    }
                }
            }
        }

    };

    return _me;

}();