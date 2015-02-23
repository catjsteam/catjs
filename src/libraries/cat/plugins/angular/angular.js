_cat.plugins.angular = function () {

    var   _log = _cat.core.log,
        
        _module = {

        utils: function () {

            var oldElement = "",
                _getargs = function(parentargs, autodetect) {
                    var args = [].slice.call(parentargs);
                    args.push(autodetect);
                    
                    return args;
                };

            return {

                $: function() {
                    return _cat.utils.plugins.$("angular");
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

                /**
                 * Get a an angular element 
                 *
                 * @param val {*} an element reference or a string DOM query
                 * @param autodetect {String} if "*" auto detect the returned handle or else specify [angular | jquery]
                 * @returns {*}
                 */
                getElt: function (val) {
                    var args = _getargs(arguments, "angular");
                    return _cat.utils.plugins.getElt.apply(this, args);
                },

                /**
                 * Trigger an event with a given object
                 *
                 * @param element {Object} The element to trigger from (The element JQuery representation id/class or the object itself)
                 * @param eventType {String} The event type name
                 * @param autodetect {String} if "*" auto detect the returned handle or else specify [angular | jquery]
                 *
                 * @private
                 */
                trigger: function() {
                    var args, result;
                    
                    args = _getargs(arguments, "angular");
                    
                    try {
                        result = _cat.utils.plugins.trigger.apply(this, args);
                    } catch (e) {
                        _log.warn("[catjs angular plugin] The trigger action failed with errors: ", e, " arguments:", JSON.stringify(args));   
                    }
                    
                    return result;
                },

                setText: function() {
                    var args = _getargs(arguments, "angular");
                    return _cat.utils.plugins.setText.apply(this, args);
                }
            };

        }(),

        actions: {

            /**
             * Trigger an event with a given object
             *
             * @param element {Object} The element to trigger from (The element JQuery representation id/class or the object itself)
             * @param eventType {String} The event type name
             * @param autodetect {String} if "*" auto detect the returned handle or else specify [angular | jquery]
             *
             * @private
             */
            trigger: function(element, eventType) {
                
                var elt;
                
                if (element) {
                    elt = _module.utils.getElt(element);
                    if (elt) {
                        _module.utils.trigger(element, eventType);   
                    }                                        
                }
                
            },
            
            setText: function(idName, value, usevents) {
                _module.utils.setText(idName, value, usevents, function(elt) {
                    _cat.plugins.jquery.utils.setBoarder(elt.eq(0)[0]);
                });
            }
         
            
        }
    };
    
    return _module;

}();
