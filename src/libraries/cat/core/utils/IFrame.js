_cat.utils.iframe = function() {
    var _module = {

        rootWindow: function() {
            
            function _getTopWindow(parentarg) {
                if (!parentarg) {
                    parentarg = window;
                }
                parentarg = parentarg.parent;
                if(window.top !== parentarg) {
                    _getTopWindow(parentarg);
                }
                return parentarg;
            }
    
            if(window.top === window.self) {
    
                return window.top;
    
            } else {
    
                return _getTopWindow();
            }
        },
        
        catroot: function(win) {

            var carroot;

            if (_module.isIframe(win) ){
                carroot = _module.rootWindow();
                if (carroot && carroot._cat) {                    
                    return carroot._cat;
                }
            }
            
            return undefined;
        },

        isIframe : function(win) {
            win = (win || window);
            try {
                return win !== win.top;
            } catch (e) {
                return true;
            }
        }                
    };
    
    return _module;
}();