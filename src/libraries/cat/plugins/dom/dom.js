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


            /**
             * A basic compare a given base64 image to a snapshot
             * TODO TBD support additional functionality: ignore colors, antialiasing, etc..
             * 
             * @param config
             *          name {String} The snapshot name
             *          base64 {String} base64 encoded image string
             *          selector {String} snapshot query selector
             *          callback {Function} data rgument passed represent the compare result { analysis: .. , compare: }
             */
            snapshotCompare: function(config) {
                
                if (! config ) {
                    config = {};
                }
                _catjs.plugin.get("dom").actions.snapshot(config.selector, config.name , function(data){

                    var result = { analysis: null, compare: null},
                        deferred = Q.defer();
                    
                    resemble( data ).onComplete(function(data){
                        result.analysis = data;
                        if (!config.base64) {
                            deferred.resolve(result);
                        }
                    });

                    if (config.base64) {
                        resemble(data).compareTo(config.base64).onComplete(function(data){
                            result.compare = data;
                            deferred.resolve(result);
                        });
                    }
                    
                    deferred.promise.then(function(data) {
                        if (config.callback) {
                            config.callback.call(this, data);
                        }                        
                    });
                    
                });  
                
            },

            /**
             * Take a snapshot
             *
             * @param config
             *          selector {String} snapshot query selector
             *          overrideScrapName {String} Override the system name
             *          callback {Function} data argument passed represents the snapshot as base64 string 
             */
            snapshot: function (idName, overrideScrapName, callback) {

                var elt,
                    me = this;


                function _isCanvasSupported() {
                    var elem = document.createElement('canvas');
                    return !!(elem.getContext && elem.getContext('2d'));
                }

                function _outerHTML(node){
                    
                    return node.outerHTML || (
                        function(n){
                            var div = document.createElement('div'), h;
                            div.appendChild( n.cloneNode(true) );
                            h = div.innerHTML;
                            div = null;
                            return h;
                        })(node);
                }
                
                function _getSVGTxt(elt) {
                    
                    var str;             
                    
                    if (elt.parentNode.innerHTML) {                        
                        str = _outerHTML(elt);
                        
                    } 
                    
                    return str;
                }
                
                function _createCanvasElement(elt) {
                    
                    var canvaselt = document.createElement("canvas"),
                        bounds = elt.getBoundingClientRect();
                    
                    canvaselt.width = bounds.width + "px";
                    canvaselt.height = bounds.height + "px";
                    
                    return canvaselt;
                }

                /**
                 * capture canvas data
                 *
                 * @param elt
                 * @returns {undefined}
                 * @private
                 */
                function _captureCanvas(elt, callback) {

                    var nodeName, tagMethod,
                        serverURL = _cat.utils.Request.generate({service: "screenshot"}),
                        methods = {
                            
                            "canvas": function(elt) {
                                _save(_getData(elt));

                            },
                            
                            "svg": function(elt) {

                                var canelt = _createCanvasElement(elt),
                                    svgtxt = _getSVGTxt(elt);
                                
                                if (typeof canvg !== "undefined") {
                                    canvg(canelt, svgtxt);
                                    _save(_getData(canelt));
                                    
                                } else {
                                    _cat.core.log.warn("[catjs dom plugin] SVG element was found nut no valid 'canvg' handle was found, consider adding it as a dependency in your catproject.json ");                                    
                                }
                                
                            },
                            
                            "*": function(elt) {
                                
                                if (typeof html2canvas !== "undefined") {

                                    html2canvas(elt).then(function (canvas) {
                                        _save(_getData(canvas));
                                    }).catch(function(err) {
                                            if (err) {
                                                _cat.core.log.error("[catjs html2canvas] failed to render the given dom element, \nerror: " ,err);
                                            }
                                        });
                                } else {
                                    _cat.core.log.warn("[catjs dom plugin] DOM element was found but no valid 'html2canvas' handle was found, consider adding it as a dependency in your catproject.json ");
                                }

                            }
                            
                        };
                    

                    function _getData(canvas) {
                        var data;

                        if (canvas.toDataURL) {
                            data = canvas.toDataURL("image/png");
                        }

                        return data;
                    }

                    function _save(data) {

                        var base64;
                        
                        function _prepareImage(data) {
                            return data.replace(/^data:image\/png;base64,/, "");
                        }

                        if (data) {

                            if (overrideScrapName) {
                                overrideScrapName = "_$$_" + overrideScrapName;
                            }

                            base64 = _prepareImage(data);
                            
                            _cat.utils.AJAX.sendRequestAsync({
                                url: serverURL,
                                method: "POST",
                                data: {
                                    pic: base64,
                                    scrapName: (overrideScrapName || ( "scrap" in me ? me.scrap.name : "temp" )),
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

                            if (callback) {
                                callback.call(this, data);
                            }
                        }
                    }

                    if (elt) {

                        // DOM element case
                        if (elt.nodeType && elt.nodeType === 1) {

                            // canvas element case
                            nodeName = elt.nodeName;
                            nodeName = (nodeName ? nodeName.toLowerCase() : undefined);
                            tagMethod = (nodeName &&  methods[nodeName] ? methods[nodeName] :  methods["*"]);
                            if (tagMethod) {
                                tagMethod.call(this, elt);                            
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
                elt = _cat.utils.plugins.jqhelper.dom(elt);
                    
                if (elt) {
                    if (_cat.utils.Utils.getType(elt) === "array") {


                    } else {
                        _captureCanvas(elt, callback);
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
                elt = _cat.utils.plugins.jqhelper.dom(elt);
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
                if ( _cat.utils.plugins.jqhelper.isdom())  {
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

            },

            select: function(opt, index) {

                _cat.utils.Utils.prepareProps({
                    global: {
                        obj: opt
                    },
                    props: [
                        {
                            key: "element",
                            require: true
                        }
                    ]
                });

                var elt = _module.utils.getElt(opt.element);
                elt = _cat.utils.plugins.jqhelper.dom(elt);                
                if (elt) {                  

                    _module.actions.fire("mouseenter", {element: elt});                    
                    _module.actions.fire("mouseover", {element: elt});                    
                    _module.actions.fire("mousemove", {element: elt});                    

                    if (elt[index]) {
                        elt[index].selected = true;                    
                    }

                    _module.actions.fire("mousedown", {element: elt});                    
                    _module.actions.fire("focus", {element: elt});
                    _module.actions.fire("input", {element: elt});
                    _module.actions.fire("change", {element: elt});
                    
                    setTimeout(function() {
                        _module.actions.fire("mouseup", {element: elt});                                                            
                        _module.actions.fire("click", {element: elt});
                        _module.actions.fire("blur", {element: elt});
                    }, 0);
                }

            }

        }


    };

    return _module;

}();
