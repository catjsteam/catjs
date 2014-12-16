var _ = require("underscore");

module.exports = function() {

    var _Printer = function() {
        this.output = [];

    };

    _Printer.prototype.generate = function () {
        return ( this.output ? this.output.join(" \n ") : "");
    };

    _Printer.prototype.print = function (line) {
        if (line) {
            if (_.isArray(line)) {
                this.output = this.output.concat(line);
            } else {
                this.output.push(line);
            }
        }
    };

    return _Printer;
}();