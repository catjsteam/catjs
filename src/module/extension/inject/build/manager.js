var _generateUserFileInfo = require("./user.js"),
    _generateCATFileInfo = require("./cache.js");

module.exports = function() {
    
    return {
        
        getUser: function(scraps, sourcefile, targetfile) {
            return _generateUserFileInfo(scraps, sourcefile, targetfile);       
        },
        
        getCache: function(scraps, sourcefile, targetfile) {
            return _generateCATFileInfo(scraps, sourcefile, targetfile).cache;
        },
        
        getIncludeCache: function(scraps, sourcefile, targetfile) {
            return _generateCATFileInfo(scraps, sourcefile, targetfile).include;
        }
        
    };
    
}();