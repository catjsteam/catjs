_cat.core.TestsDB = function() {


    function _TestsDB() {

        this._DB = undefined;
        var me = this;

        _cat.utils.AJAX.sendRequestAsync({url : "tests_db.json", callback : {call : function(check) {
            me._DB = JSON.parse(check.response);
        }}});

        this.getDB = function() { return this._DB; };

        var getProp = function (propString, obj) {
            var current = obj;
            var split = propString.split('.');

            for (var i = 0; i < split.length; i++) {
                if (current.hasOwnProperty(split[i])) {
                    current = current[split[i]];
                }
            }

            return current;
        };

        var setProp = function (propString, value, obj) {
            var current = obj;
            var split = propString.split('.');

            for (var i = 0; i < split.length - 1; i++) {
                if (current.hasOwnProperty(split[i])) {
                    current = current[split[i]];
                }
            }

            current[split[split.length - 1]] = value;
            return current[split[split.length - 1]];
        };

        this.get = function(field) { return getProp(field, this._DB); };
        this.set = function(field, value) { return setProp(field, value, this._DB); };


    }

    var TestDB;

    return {

        init : function() {
            TestDB = new _TestsDB();
            return TestDB;
        },

        getDB : function() {
            return TestDB.getDB();
        },

        get : function(field) {
            return TestDB.get(field);
        },

        set : function(field, value) {
            return TestDB.set(field, value);
        }


    };


}();



























function TestDB (){

    var testDBJson;
    try
    {
        if (XMLHttpRequest && !testDBJson) {
            var xmlhttp =  new XMLHttpRequest();
            xmlhttp.open("GET", "tests_db.json", false);
            xmlhttp.send();
            var dbText = xmlhttp.responseText;
            testDBJson = JSON.parse(dbText);
        }
    }
    catch(err)
    {
        //todo: log error
    }


    var getProp = function (propString) {
        var current = testDBJson;
        var split = propString.split('.');

        for (var i = 0; i < split.length; i++) {
            if (current.hasOwnProperty(split[i])) {
                current = current[split[i]];
            }
        }

        return current;
    };

    var setProp = function (propString, value) {
        var current = testDBJson;
        var split = propString.split('.');

        for (var i = 0; i < split.length - 1; i++) {
            if (current.hasOwnProperty(split[i])) {
                current = current[split[i]];
            }
        }

        current[split[split.length - 1]] = value;
        return current[split[split.length - 1]];
    };




    this.getDB = function() { return testDBJson; };
    this.get = function(feild) { return getProp(feild); };
    this.set = function(feild, value) { return setProp(feild, value); };

    this.hasPhantom = function (){
        return typeof phantom !== 'undefined';
    };
}