var _global = catrequire("cat.global"),
    _log = _global.log(),
    _fs = require("fs"),
    _catcli = (catrequire ? catrequire("cat.cli") : null),
    _configs;

function _read() {

    // read configuration
    var path = require("path"),
        configPath,
        data,
        project, sourceFolder;

    if (_catcli) {
        project = _catcli.getProject();
        if (project) {
            try {
                sourceFolder = project.getInfo("source");
                configPath = path.join(sourceFolder, "/config/cat.json");

            } catch (e) {
                _log.error("[catjs server (config module)] Failed to load cat.json test project, No CAT test project is available.", e);
            }
        } else {
            _log.error("[catjs server (config module)] Failed to load cat.json test project, No CAT project is available.");
        }
    }

    if (configPath && _fs.existsSync(configPath)) {
        data = _fs.readFileSync(configPath, 'utf8');
        return JSON.parse(data);
    }

    return undefined;
}

function _Configs() {
    this.configs = {};
}

_Configs.prototype.set = function(config) {
    this.configs[config.id] = config;
};

_Configs.prototype.get = function(key) {
    return (this.configs ? this.configs[key] : undefined);
};

_Configs.prototype.destroy = function() {
    this.configs = {};
};

_configs = new _Configs();


module.exports = function () {

    return {

        /**
         * @deprecated Use the post method since we need the running project cat.json test project (runtime)
         *
         * Load the local project cat.json file
         *
         * @returns {*}
         */
        get: function () {
            return _read();
        },

        post: function (req, res) {
            
            var status = false,
                id;
            
            // store the incoming test project
            if (req.body) {
                _configs.set(req.body);  
                id = req.body.id;
                status = true;
            }    
            
            return {
                id: id,
                config: _configs,
                response: res,
                status: status
            }
        },

        /**
         * 
         * @param config {Object}
         *              id {String} test id
         *              config {Object} The incoming configuration
         *              response {Object} HTTP Response
         *              status {Boolean} The response status
         */
        response: function(config) {
            
            var res = config.response,
                catjsconfig = config.config,
                id = config.id,
                status = config.status,
                currentIndex = config.currentIndex;
            
            res.setHeader('Content-Type', 'text/javascript;charset=UTF-8');
            if (status) {
                res.send('{"status": "ready", "currentIndex" : ' + currentIndex  + ' }');
                
            } else {
                res.send('{"status": "error", "error":{ msg:"request body is not valid, check your cat.json file" }}, "currentIndex": 0');
            }
        },


        getConfig: function(id) {
            return _configs.get(id);
        }
    };

}();