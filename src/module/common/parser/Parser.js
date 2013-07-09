

module.exports = function() {

    return  {

        get: function(parser) {
            return require("./" + parser);
        }
    };

}();