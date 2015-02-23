_cat.plugins.testdata = function () {
   
    var _module = {

        actions: {
        
        }
    };

    (function() {
        var testdb = _cat.utils.TestsDB,
            key;
        
        for (key in testdb) {
            if (testdb.hasOwnProperty(key)) {
                _module.actions[key] = _cat.utils.TestsDB[key];
            }
        }
        
    })();

    return _module;

}();
