var _scrapEnum = require("./../ScrapEnum.js"),
    _log = catrequire("cat.global").log(),
    _props = catrequire("cat.props"),
    _utils = catrequire("cat.utils"),
    _regutils = catrequire("cat.regexp.utils");

module.exports = function () {

    /**
     * extract scrap name @@scrap[scrap name][.. @@[attr]value]
     *
     * @param line
     * @private
     */
    var _singlelineEnum,

        /**
         *  Extract scrap name out of single scrap line @@scrap(.*)@[name]@@
         */
            _extractScrapName = function (line) {

            return _regutils.getMatchedValue(line, "@@scrap@(.*)[@@]?(.*)?");
        },

        /**
         *  Validate scrap single line rule @@(scrap)@
         */
            _validScrapAnchorName = function (line) {

            return _regutils.getMatchedValue(line, [_scrapEnum.scrapEnum.single, "(", _scrapEnum.scrapEnum.name, ")", "@"].join(""));

        };


    return {

        parse: function (scrapCommentBlock) {

            var idx = 0, size, comment, commentobj,
                scrap = [-1, -1],
                lineNumber = [0, 0],
                commentBlock = {},
                scraps = [],
                currentScrap = [],
                scrapBlockName,
                scrapAttrBlockName,
                tmpString,
                attrs = [];

            _singlelineEnum = _scrapEnum.getSingleLineEnum();

            // copy initial scrap info object template
            _scrapEnum.getScrapEnum("scrapinfo", commentBlock);

            if (scrapCommentBlock) {
                size = scrapCommentBlock.length;
                for (; idx < size; idx++) {

                    // see the Comment parser class for the object reference ({line: , number:, pos: })
                    commentobj = scrapCommentBlock[idx];
                    if (idx == 0) {
                        commentBlock.start.line = commentobj.number;
                        commentBlock.start.col = commentobj.col;
                    } else if (idx == size - 1) {
                        commentBlock.end.line = commentobj.number;
                        commentBlock.end.col = commentobj.col;
                    }

                    comment = ((commentobj && commentobj.line) ? commentobj.line : undefined);
                    if (comment) {
                        if (scrap[0] === -1) {
                            scrap[0] = comment.indexOf(_singlelineEnum);
                        }

                        // opened block was found
                        if (scrap[0] > -1) {
                            scrap[1] = comment.length;

                            if (!scrapBlockName) {
                                // extract scrap name from the first block comment e.g. @[name
                                tmpString = comment.substring(scrap[0]);
                                scrapBlockName = _validScrapAnchorName(tmpString);
                                scrapAttrBlockName = _extractScrapName(tmpString);
                                if (scrapAttrBlockName.indexOf("@@") != -1) {
                                    attrs = scrapAttrBlockName.split("@@");
                                    scrapAttrBlockName = attrs.shift();
                                }

                                lineNumber[0] = commentobj.number;
                            }
//                            if (currentScrap.length === 0) {
//                                currentScrap.push(comment);
//                            }
                        }

                        // closed block was found
                        if (scrap[1] > -1) {
                            scrap[1] += _scrapEnum.scrapEnum.close.length;
                            // valid comment
                            currentScrap.push("@[scrap");
                            currentScrap.push("@@name " + scrapAttrBlockName);
                            currentScrap.push("@@" + attrs[0]);
                            currentScrap.push("]@");
                            if (scrapBlockName === _scrapEnum.scrapEnum.name) {
                                lineNumber[1] = commentobj.number;
                                scraps.push(
                                    {
                                        attrs: {
                                            name: scrapAttrBlockName,
                                            attrs: attrs
                                        },
                                        name: scrapBlockName,
                                        rows: currentScrap.splice(0),
                                        start: {line: lineNumber[0], col: scrap[0]},
                                        end: {line: lineNumber[1], col: scrap[1]},
                                        comment: commentBlock
                                    });
                            }

                            // reset for the next scrap if exists
                            lineNumber = [0, 0];
                            scrap = [-1, -1];
                            scrapBlockName = undefined

                        }

                    }
                }
            }

            return (scraps.length > 0 ? scraps : undefined);
        }

    };

}();