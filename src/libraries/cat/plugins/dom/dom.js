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

                    if (event === "mousemove") {

                        if (index === 1 && _cat.utils.plugins.jqhelper.isjquery()) {
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
            pos = _findPosition(opt.element);
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
                if (_cat.utils.plugins.jqhelper.isjquery()) {
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
                if (_cat.utils.plugins.jqhelper.isjquery()) {
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
                if (_cat.utils.plugins.jqhelper.isjquery()) {
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
