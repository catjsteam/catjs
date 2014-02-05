var _scrapEnum = require("./../ScrapEnum.js"),
    _log = catrequire("cat.global").log(),
    _props = catrequire("cat.props"),
    _utils = catrequire("cat.utils"),
    _regutils = catrequire("cat.regexp.utils");

module.exports = function () {

    /**
     * Extract scrap name out of single scrap line @\\[scrap@(.*)
     *
     * @param line
     * @returns {*}
     * @private
     */
    var escapedScrapOpen = _regutils.preparePattern(_scrapEnum.scrapEnum.open),
        _extractScrapName = function (line) {

            return _regutils.getMatchedValue(line, [escapedScrapOpen, _scrapEnum.scrapEnum.name, "@", "(.*)"].join(""));
        },

        /**
         *  Validate open scrap block rule @\\[(scrap)
         */
            _validScrapAnchorName = function (line) {

            return _regutils.getMatchedValue(line, [escapedScrapOpen, "(", _scrapEnum.scrapEnum.name, ")"].join(""));
        };

    return {

        parse: function (scrapCommentBlock) {

            var idx = 0, size, comment, commentobj,
                scrap = [-1, -1],
                lineNumber = [0, 0],
                commentBlock = {},
                scraps = [],
                currentScrap = [],
                scrapAttrBlockName,
                scrapBlockName,
                tmpString, tmpPos;

            // copy initial scrap info object template
            _scrapEnum.getScrapEnum("scrapinfo", commentBlock);

            if (scrapCommentBlock) {
                size = scrapCommentBlock.length;
                for (; idx < size; idx++) {
                    // see the Comment parser class for the object reference ({line: , number:, pos: })
                    commentobj = scrapCommentBlock[idx];
                    if (idx === 0) {
                        commentBlock.start.line = commentobj.number;
                        commentBlock.start.col = commentobj.col;
                    } else if (idx === size - 1) {
                        commentBlock.end.line = commentobj.number;
                        commentBlock.end.col = commentobj.col;
                    }

                    comment = ((commentobj && commentobj.line) ? commentobj.line : undefined);
                    if (comment) {
                        if (scrap[0] === -1) {
                            scrap[0] = comment.indexOf((_scrapEnum.scrapEnum.open));
                        }
                        scrap[1] = comment.indexOf(_scrapEnum.scrapEnum.close);

                        // opened block was found
                        if (scrap[0] > -1 && scrap[1] === -1) {
                            if (!scrapBlockName) {
                                // extract scrap name from the first block comment e.g. @[name
                                tmpString = comment.substring(scrap[0]);
                                scrapBlockName = _validScrapAnchorName(tmpString);
                                scrapAttrBlockName = _extractScrapName(tmpString);
                                lineNumber[0] = commentobj.number;
                            }
                            currentScrap.push(comment);
                        }

                        // closed block was found
                        if (scrap[1] > -1) {
                            scrap[1] += _scrapEnum.scrapEnum.close.length;
                            // valid comment
                            currentScrap.push(comment);
                            if (scrapBlockName === _scrapEnum.scrapEnum.name) {
                                lineNumber[1] = commentobj.number;

                                scraps.push(
                                    {
                                        attrs: {
                                            name: scrapAttrBlockName
                                        },
                                        name: scrapBlockName,
                                        rows: currentScrap.splice(0),
                                        start: {line: lineNumber[0], col: scrap[0]},
                                        end: {line: lineNumber[1], col: scrap[1]},
                                        comment: commentBlock
                                    });
                            }
                            if (scrap[0] < -1 || lineNumber[0] > lineNumber[1]) {
                                currentScrap = [];
                                _log.warning(_props.get("cat.scrap.validation.close").format("[scrap plugin]"));
                            }

                            // reset for the next scrap if exists
                            lineNumber = [0, 0];
                            scrap = [-1, -1];
                            scrapBlockName = undefined;

                        }

                    }
                }
            }

            return (scraps.length > 0 ? scraps : undefined);
        }

    };

}();