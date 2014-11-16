var Params = require("./Params.js"),
    Assert = function(config) {

        this._params = new Params(config);

    };

Assert.prototype.getParams = function() {
    return this._params;  
}; 

module.exports = Assert;