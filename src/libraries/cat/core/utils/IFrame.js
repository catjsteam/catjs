_cat.utils.iframe = function() {
    return {
        isIframe : function() {
            try {
                return window.self !== window.top;
            } catch (e) {
                return true;
            }
        }
    };
}();