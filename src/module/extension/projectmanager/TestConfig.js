function TestConfig(config) {

    var me = this;
    
    this.tests = config.tests;
    this.testsmap = {};

    this.tests.forEach(function(test) {
        if (test) {
            me.testsmap[test.index] = test;
        }
    });

    this.scrapReadyIndex = 0;
    this.resQueue = {}
}

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

TestConfig.prototype.isInQueue = function(idx) {
    if (this.resQueue[idx]) {
        return true;
    }
    return false;
};


module.exports = TestConfig;