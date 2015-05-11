
var linit = catrequire("cat.init"),
    _prompt = require('prompt'),
    _utils = catrequire("cat.utils");

module.exports = function () {

    function _createProject(args, appPath, initProjectType, callback) {

        if (!args.appath) {
            args.appath = appPath;
        }
        args.projectname = initProjectType;
        args.callback = callback;
        linit.create(args);
    }


    return {
        
        command: function(config) {

            var schema,
                initProjectType,
                callback,
                
                Schema =  function(args) {
                    this.type = (args.type || "string");
                    this.pattern = args.pattern;
                    this.message = args.message;
                    this.required = args.required;
                    this.default = args.default;
                    this.description  = args.description;
                },                
                appPath;


            _utils.prepareProps({
                global: {obj: config},
                props: [
                    {key: "schema", require: false},
                    {key: "initProjectType", require: false, default: "cat"},
                    {key: "callback", require: false}
                ]
            });

            schema = config.schema;
            initProjectType = config.initProjectType;
            callback = config.callback;
            
            if (linit) {

                if (!schema) {

                    // user prompt section
                    _prompt.start();


                    schema = {
                        properties: {
                            name: new Schema({
                                type: "string",
                                pattern: /^[a-zA-Z0-9\-]+$/,
                                message: 'Name must be only letters, numbers or dashes',
                                required: true,
                                description: "Enter the project name"
                            }),
                            serverhost: new Schema({
                                type: "string",
                                required: false,
                                default: "localhost",
                                description: "Enter catjs server's host name"
                            }),
                            serverport: new Schema({
                                type: "string",
                                required: false,
                                default: "8089",
                                description: "Enter catjs server's port"
                            }),
                            serverprotocol: new Schema({
                                type: "string",
                                required: false,
                                default: "http",
                                description: "Enter catjs server's protocol"
                            }),
                            analytics: new Schema({
                                type: "string",
                                required: false,
                                default: "Y",
                                description: "May catjs anonymously report usage statistics to improve the tool over time?"
                            })
                        }
                    };

                } else {
                    _prompt = null;
                }

                if (initProjectType === "example") {
                    // apppath will be set automatically
                    appPath = "./../app";

                } else {
                    if (!schema.properties.appath) {
                        schema.properties.appath = new Schema({
                            type: "string",
                            required: true,
                            default: "./..",
                            description: "Enter application's directory [./..] "
                        });
                    }
                }

                if (_prompt) {
                    _prompt.get(schema, function (err, args) {
                        _createProject(args, appPath, initProjectType);
                    });

                } else {
                    _createProject(schema.properties, appPath, initProjectType);
                }
            }
            
        }
        
    };
    
}();