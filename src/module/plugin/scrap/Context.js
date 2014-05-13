
var _log = catrequire("cat.global").log(),
    _clazz;


/**
 * Scrap context class
 * The context data is passed between the annotation's scrap
 */
_clazz = function () {

    this.$$context = {};

};

_clazz.prototype.set = function (key, value) {
    if (key) {
        this.$$context[key] = value;
    }
};

_clazz.prototype.get = function (key) {
    if (key) {
        return this.$$context[key];
    }
    return undefined;
};

_clazz.prototype.destroy = function() {
    this.$$context = {};
};

module.exports = _clazz;