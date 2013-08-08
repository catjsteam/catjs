var _lineReader = require('line-reader'),
    _fs = require("fs.extra");

module.exports = function () {

    var me = this,
        _comments = [],
        _records = {},

        /**
         *  Going over the file lines, looking for comments
         *
         *  @return comments of Array type, each cell comprised of:
         *      line - The line data
         *      number - The line number that was found in the file
         *      pos - The pos of the first character on that line
         */
         _commentParser = function (config) {

            var openBlock = ["/*", "<!--"],
                closeBlock = ["*/", "-->"],
                single = ["//"],
                file = config.file,
                cb = config.callback;

            _records[file] = {lineNumber: 1, comment: [], comments: [], opened: 0};

            _lineReader.eachLine(file,function (line) {

                var lineNumber = _records[file].lineNumber,
                    typeOpenAPos = line.indexOf(openBlock[0]),
                    typeOpenBPos = line.indexOf(openBlock[1]),
                    typeCloseAPos = line.indexOf(closeBlock[0]),
                    typeCloseBPos = line.indexOf(closeBlock[1]),
                    collected = 0,
                    comment = _records[file].comment,
                    comments = _records[file].comments;

                if ((typeOpenAPos != -1 || typeOpenBPos != -1)) {
                    _records[file].opened = 1;
                    collected = 1;
                    if (typeOpenAPos != -1) {
                        //comment.push(line.substring(typeOpenAPos));
                        comment.push({
                            line: line.substring(typeOpenAPos),
                            number: lineNumber,
                            col: typeOpenAPos
                        });
                    }
                    if (typeOpenBPos != -1) {
                        //comment.push(line.substring(typeOpenBPos));
                        comment.push({
                            line: line.substring(typeOpenBPos),
                            number: lineNumber,
                            col: typeOpenBPos
                        });
                    }
                }
                if (_records[file].opened && (typeCloseAPos != -1 || typeCloseBPos != -1)) {
                    _records[file].opened = 0;
                    if (comment.length > 1) {
                        if (typeCloseAPos != -1) {
//                        comment.push(line.substring(0, (typeCloseAPos + closeBlock[0].length)));
                            comment.push({
                                line: line.substring(0, (typeCloseAPos + closeBlock[0].length)),
                                number: lineNumber,
                                col: (typeCloseAPos + closeBlock[0].length)
                            });
                        }
                        if (typeCloseBPos != -1) {
                            //comment.push(line.substring(0, (typeCloseBPos + closeBlock[1].length)));
                            comment.push({
                                line: line.substring(0, (typeCloseBPos + closeBlock[1].length)),
                                number: lineNumber,
                                col: (typeCloseBPos + closeBlock[1].length)
                            });
                        }
                    }
                    comments.push(comment.slice(0));
                    _records[file].comment = [];

                }


                if (_records[file].opened) {
                    if (collected) {
                        collected = 0;
                    } else {
                        comment.push({
                            line: line,
                            number: lineNumber,
                            col: 0
                        });
                    }
                }

                // use 'return false' to stop this madness
                _records[file].lineNumber++;

            }).then(function () {
                    _records[file].lineNumber--;
                    _comments.push(_records[file].comment);
                    cb.call(me, _records[file].comments)

                });


        };

    return {

        parse: function (config) {

            var file = config.file;
            if (file && _fs.existsSync(file)) {
                _commentParser(config);
            }
        },

        getComments: function () {
            return _comments;
        }
    };
}();