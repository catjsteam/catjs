/**
 * General error handling for the hosted application
 * @type {_cat.core.errors}
 */
_cat.core.errors = function () {

    var _originalErrorListener,
        _listeners = [];

    if (window.onerror) {
        _originalErrorListener = window.onerror;
    }

    window.onerror = function(message, filename, lineno, colno, error) {

        var me = this;

        // call super
        if (_originalErrorListener) {
            _originalErrorListener.call(this, message, filename, lineno, colno, error);
        }

        // print the error
        _listeners.forEach(function(listener) {
            listener.call(me, message, filename, lineno, colno, error);
        });
    };

    return {

        listen: function(listener) {
            _listeners.push(listener);
        }
    };

}();