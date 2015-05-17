var _path = require("path"),
    _fs = require("fs"),
    _catmodule;

function _getCatModule() {
    
    if (!_catmodule) {
        console.error("[common test core] catjs module is not valid, use init method for setting the base path");
    }
    
    return _catmodule;
}

function _moduleLookup(patharg, filename) {

    var catjsmain = _path.resolve(_path.join(patharg, filename)),
        module;

    console.log("[common test core] Looking for file: ", catjsmain);

    if (_fs.existsSync(catjsmain)) {
        try {
            module = require(catjsmain);

            console.log("[common test core] catjs module loaded successfully");
            return module;

        } catch (e) {
            console.log("[common test core] Failed to load the requested file as a module error:", e);
        }

    } else {
        console.log("[common test core] File was not found");
        
    }

    return module;

}

/**
 * Create catjs project 
 *
 * @param config
 *          basepath {String} base catjs path
 *          init {String} The project type (cat [default] | server | example)
 *          testname {String} the test name ["catjstest"]
 *          appath {String} The application path [.]
 *          protocol {String} The server protocol [http]
 *          port {String} The server port [8089]
 *          host {String} The server host [localhost]
 *          callback {Function} post project creation callback
 *
 * @private
 */
function _createCatProject(config) {

    _getCatModule().init({
        init: (config.init || "cat"),
        schema: {
            properties: {
                name: (config.testname || "catjstest"),
                serverhost: (config.host || "localhost"),
                serverport: (config.port || "8089"),
                serverprotocol: (config.protocol || "http"),
                appath: (config.appath || ".")
            }
        },
        callback: config.callback
    });
}

/**
 * Run the catjs tasks
 * 
 * @param config {Object}
 *          tasks {Array} The tasks array
 *          taskcb {Function} The task callback (function (task) {})
 *          callback {Function} Post run callback (function () {})
 *  
 * @private
 */
function _run(config) {
    
    if (_fs.existsSync('./cat-project')) {

        process.chdir('./cat-project');

        _getCatModule().init({
            task: config.tasks,
            taskcb: function (task) {
                
            },
            callback: function () {

            }});
        
        return true;
    }
}

/**
 * Create a new server based project and run it
 * 
 * @param config {Object}
 *              protocol {String} The server protocol [http]
 *              port {String} The server port [8081]
 *              host {String} The server host [localhost]
 * 
 * @private
 */
function _standaloneServer(config) {

    var run = _run({
        tasks:["t@server.start"]
    });
    
    if (!run) {
        _createCatProject({
            
            init: "server",
            host: (config.host || "localhost"),
            port: (config.port || "8081"),
            protocol: (config.protocol || "http"),
            callback: function() {
                _run({
                    tasks:["t@server.start"]
                });
            }
        });
    }   
}

module.exports = function () {
    
    return {

        init: function(basepath) {
            _catmodule = _moduleLookup(basepath, "src/module/CATCli.js");
        },
        
        createCatProject: _createCatProject,
        standaloneServer: _standaloneServer,
        run: _run
    }
        
}();

