var _parsers = [];

(function(){
    var parsers = [
        "SimpleParser",
        "SimpleSingleParser"
    ];

    parsers.forEach(function(parser) {
        _parsers.push(require(["./",parser].join("")));
    });

})();

/**
 * TODO create a base class
 *
 * @type {module.exports}
 */
module.exports = function() {

    return  {

        parse: function(scrapCommentBlock) {

            var scraps = [],
                scrap;

            _parsers.forEach(function(parser){
                if (parser) {
                    scrap = parser.parse(scrapCommentBlock);
                    if (scrap) {
                        scraps = scraps.concat(scrap);
                    }
                }
            });

            return scraps;

        }
    };

}();