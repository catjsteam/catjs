var _cat = {
    utils: {},
    plugins:{}
};

_cat.core = function() {

    var _context = function() {

        var _scraps = {};

        function _Scrap(config) {

            var me = this;

            (function() {
                var key;

                for (key in config) {
                    me[key] = config[key];
                }
            })();
        }

        _Scrap.prototype.get = function(key) {
            return this[key];
        };

        _Scrap.prototype.getArg = function(key) {
            if (this.scrap && this.scrap.arguments) {
                return this.arguments[this.scrap.arguments[key]];
            }
        };


        return {

            get: function(pkgName) {
                if (!pkgName) {
                    return undefined;
                }
                return _scraps[pkgName];
            },

            "$$put": function(pkgName, config) {
                if (!pkgName) {
                    return pkgName;
                }
                _scraps[pkgName] = new _Scrap(config);
            }
        };

    }(),
        _config,
        _log = console;

    return {

        log: _log,

        plugin: function(key) {
            var plugins;
            if (key) {
                plugins = _cat.plugins;
                if (plugins[key]) {
                    return plugins[key];
                }
            }
        },

        define: function(key, func) {
            _cat[key] = func;
        },


        getConfig: function ()
        {
            //try - catch
            var x;

            try
            {
                if (XMLHttpRequest) {
                    var xmlhttp =  new XMLHttpRequest();
                    xmlhttp.open("GET", "config.json", false);
                    xmlhttp.send();
                    var configText = xmlhttp.responseText;
                    _config = JSON.parse(configText);
                }
            }
            catch(err)
            {
                //todo: log error
            }


            //return x;
            return _config;
        },


        /**
         * CAT core definition, used when injecting cat call
         *
         * @param config
         */
        action: function(config) {
            var scrap = config.scrap,
                catInternalObj,
                catObj,
                passedArguments,
                idx = 0, size = arguments.length,
                pkgName;

            if (scrap) {
                if (scrap.pkgName) {

                    // collect arguments
                    if (arguments.length > 1) {
                        passedArguments = [];
                        for (idx = 1; idx<size; idx++) {
                            passedArguments.push(arguments[idx]);
                        }
                    }

                    // call cat user functionality
                    catInternalObj = _cat[scrap.pkgName];
                    if (catInternalObj && catInternalObj.init) {
                        _context["$$put"]({
                            scrap: scrap,
                            arguments: passedArguments

                        });
                        catInternalObj.init.call(_context.get(scrap.pkgName), _context);
                    }

                    // cat internal code
                    pkgName = [scrap.pkgName, "$$cat"].join("");
                    catObj = _cat[pkgName];
                    if (catObj) {
                        _context["$$put"]({
                            scrap: scrap,
                            arguments: passedArguments

                        }, pkgName);
                        catObj.apply(_context, passedArguments);
                    }
                }
                console.log("Scrap call: ",config, " scrap: " + scrap.name);
            }

        }

    };

}();

if (typeof exports === "object") {
    module.exports = _cat;
}