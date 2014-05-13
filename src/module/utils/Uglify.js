var _uglify= require("uglify-js"),
    _global = catrequire("cat.global"),
    _log = _global.log(),
    _props = catrequire("cat.props"),
    _utils = catrequire("cat.utils");

module.exports = function() {

    function _code(config) {

        if (!config) {
            _log.warning(_props.get("cat.arguments.missing").format("[uglify utils]", "config"));
            return undefined;
        }

        var code = config.code,
            streamoptDefault = {
                semicolons: false
            },
            streamoptArg = config.streamopt,
            streamopt,
            stream,
            ast;

        if (code) {
            ast = _uglify.parse(code);

            if (streamopt) {
                streamopt = _utils.copyObjProps(streamoptDefault, streamoptArg, false);
            } else {
                streamopt = streamoptDefault;
            }

            stream = _uglify.OutputStream(streamopt);
            ast.print(stream);
            code = stream.toString();

        } else {
            _log.warning(_props.get("cat.arguments.missing").format("[uglify utils]", "config.code"));
        }

        return {code: code, ast:ast};
    }

    return {

        /**
         * Get one line code snippet w/o semicolon by default,
         * use the stream options to change it.
         *
         * @param config
         *      code: The code snippet
         *      streamopt: The uglifyjs stream options
         *
         * @return {string} The code snippet representation
         */
        getCodeSnippet: function(config) {

            var baseCode = _code(config);
            return (baseCode ? baseCode.code : undefined);
        },

        /**
         * Get the actual javascript object that was interpreted out of the code snippet
         *
         * @param config
         *      code: The code snippet
         *      streamopt: The uglifyjs stream options
         *
         * @returns {*} The object interpreted out of the code snippet
         */
        getActualSnippet: function(config) {

            var code = _code(config),
                interpretedCode;
            if (code && code.code) {
                interpretedCode =  JSON.parse(code.code);
            }

            return interpretedCode;
        },

        /**
         * TODO better job on the walk to get a function and expression call
         *
         * @param config
         */
        walk: function(config) {
            var call_expression = null, walker = new _uglify.TreeWalker(function(node, descend){
                if (node instanceof _uglify.AST_Call) {
                    var tmp = call_expression;
                    call_expression = node;
                    descend();
                    call_expression = tmp;
                    return true; // prevent descending again
                }
                if (node instanceof _uglify.AST_String && call_expression) {
                    console.log("Found string: %s at %d,%d", node.getValue(),
                        node.start.line, node.start.col);
                }
            }), baseCode = _code(config);

            if (baseCode.ast) {
                baseCode.ast.walk(walker);
            }
        }

    };

}();