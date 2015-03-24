var _utils = catrequire("cat.utils");

function TestConfig(config) {

    var me = this;
    
    this.tests = config.tests;
    this.request = config.request;
    this.testsmap = {};

    this.tests.forEach(function(test) {
        var pathmatch = true;
        if (test) {
            if (test.path) {
                pathmatch = _utils.pathMatch(me.request, test.path);
            }
            if (!pathmatch) {
                test.skip = true;
            } else {
                test.skip = false;
            }
            
            me.testsmap[test.index] = test;                
        }
    });

    this.scrapReadyIndex = 0;
    this.resQueue = {}
}

TestConfig.prototype.skip = function() {
    var index = this.getIndex(),
        test = this.testsmap[index];
    
    return (test ? test.skip : false);
};

TestConfig.prototype.getTests = function() {
    return this.tests;
};

TestConfig.prototype.getTest = function(idx) {
    return this.testsmap[idx];
};

TestConfig.prototype.remove = function(idx) {
    this.resQueue[idx] = undefined;
};

TestConfig.prototype.getTests = function() {
    return this.tests;
};

TestConfig.prototype.next = function() {
    this.scrapReadyIndex++;
};

TestConfig.prototype.getIndex = function() {
    return this.scrapReadyIndex;
};

TestConfig.prototype.setIndex = function(idx) {
    this.scrapReadyIndex = idx;
};

TestConfig.prototype.isInQueue = function(idx) {
    if (this.resQueue[idx]) {
        return true;
    }
    return false;
};


module.exports = TestConfig;