var _lineReader = require('line-reader'),
    _fs = require("fs.extra"),

    _comments = [],

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
            opened = 0,
            comment = [],
            comments = [],
            file = config.file,
            cb = config.callback,
            me = this,
            lineNumber = 1;


        _lineReader.eachLine(file,function (line) {

            var typeOpenAPos = line.indexOf(openBlock[0]),
                typeOpenBPos = line.indexOf(openBlock[1]),
                typeCloseAPos = line.indexOf(closeBlock[0]),
                typeCloseBPos = line.indexOf(closeBlock[1]),
                collected = 0;

            if ((typeOpenAPos != -1 || typeOpenBPos != -1)) {
                opened = 1;
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
            if (opened && (typeCloseAPos != -1 || typeCloseBPos != -1)) {
                opened = 0;
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
                comment = [];

            }


            if (opened) {
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
            lineNumber++;

        }).then(function () {
                _comments.push(comment);
                cb.call(me, comments)

            });


    };

module.exports = function () {

    return {

        parse: function (config) {

            var file = config.file;
            if (file && _fs.existsSync(file)) {
                _commentParser(config);
            }
        },

        getComments: function() {
            return _comments;
        }
    };
}();