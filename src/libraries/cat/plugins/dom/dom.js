var animation = false;


_cat.plugins.dom = function () {

    function _fireEvent(name, elt) {

        var clickEvent;

        if (!elt || !name) {
            return undefined;
        }

        if (document.createEvent) {

            clickEvent = document.createEvent("MouseEvents");
            clickEvent.initMouseEvent(name, true, true, window,
                0, 0, 0, 0, 0, false, false, false, 0, null);
            elt.dispatchEvent(clickEvent);

        } else {

            elt.fireEvent("on" + name);
        }
    }

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

    var _module = {


        utils: function () {

            var oldElement = "",
                _getargs = function (parentargs, autodetect) {
                    var args = [].slice.call(parentargs);
                    args.push(autodetect);

                    return args;
                };


            return {

                $: function () {
                    return _cat.utils.plugins.$();
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
                    var args = _getargs(arguments, "*");
                    return _cat.utils.plugins.getElt.apply(this, args);
                },

                trigger: function () {
                    var args = _getargs(arguments, "*");
                    return _cat.utils.plugins.trigger.apply(this, args);
                },

                setText: function () {
                    var args = _getargs(arguments, "*");
                    return _cat.utils.plugins.setText.apply(this, args);
                }
            };

        }(),

        actions: {


            snapshot: function (idName) {

                var _$, elt,
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
                                callback: function() {
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
                                    
                                    html2canvas(elt).then(function(canvas) {
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

                _$ = _module.utils.$();
                elt = _$(idName);

                if (elt) {
                    if (_cat.utils.Utils.getType(elt) === "array") {


                    } else {
                        _captureCanvas(elt);
                    }
                }


            },

            listen: function (name, idName, callback) {

                var elt = _module.utils.getElt(idName);

                if (elt) {
                    _addEventListener(elt, name, callback);
                }
            },

            fire: function (name, idName) {

                var elt = _module.utils.getElt(idName);

                if (elt) {
                    _fireEvent(elt, name);
                }

            }


        }


    };

    return _module;

}();
