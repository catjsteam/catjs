var _utils = catrequire("cat.utils"),
    _props = catrequire("cat.props"),
    _md = catrequire("cat.mdata"),
    _typedas = require("typedas"),
    _log = catrequire("cat.global").log(),
    _scrapEnum = require("./ScrapEnum.js"),
    _clazz = require("./ScrapItem.js");


module.exports = function () {

    var _scraps = [],

        /**
         * Extract scrap block out of comment
         *
         * @param scrapCommentBlock
         * @returns {Array}
         * @private
         */
         _extractScrapBlock = function (scrapCommentBlock) {

            var idx = 0, size, comment, commentobj,
                scrap = [-1, -1],
                lineNumber = [0, 0],
                commentBlock = {},
                scraps = [],
                currentScrap = [],
                scrapBlockName,
                tmpString, tmpPos;

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
                            scrap[0] = comment.indexOf((_scrapEnum.scrapEnum.open));
                        }
                        scrap[1] = comment.indexOf(_scrapEnum.scrapEnum.close);

                        // opened block was found
                        if (scrap[0] > -1 && scrap[1] === -1) {
                            if (!scrapBlockName) {
                                // extract scrap name from the first block comment e.g. @[name
                                tmpString = comment.substring(scrap[0]);
                                tmpPos = (tmpString.indexOf(" "));
                                tmpPos = (tmpPos === -1 ? tmpPos = (tmpString.indexOf(_scrapEnum.scrapEnum.name) + _scrapEnum.scrapEnum.name.length) : tmpPos);
                                scrapBlockName = tmpString.substring(_scrapEnum.scrapEnum.open.length, tmpPos);
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
                            scrapBlockName = undefined

                        }

                    }
                }
            }

            return scraps;
        };


    return {

        getEnum: function (key) {
            return  _scrapEnum.getScrapEnum(key);
        },

        clazz: _clazz,

        /**
         * Add custom functionality to CAT's Scrap entity
         *
         * @param config
         */
        add: function (config) {
            if (!config) {
                _utils.error(_props.get("cat.error.config").format("[Scrap Entity]"));
            }

            var attrName = config.name,
                func = config.func,
                single = config.single;

            _clazz.prototype[attrName + "Init"] = function () {
                if (single !== undefined) {
                    this.setSingle(attrName, single);
                }
            };

            _clazz.prototype[attrName + "Apply"] = function (config) {
                return func.call(this, config);
            }
        },

        create: function (configArg) {

            var scrapBlock,
                file,
                fileinfo = {},
                commentinfo;

            if (configArg) {
                scrapBlock = configArg.scrapComment;
                if (scrapBlock) {
                    _scrapEnum.getScrapEnum("scrapinfo", fileinfo);
                    fileinfo.start = scrapBlock.start;
                    fileinfo.end = scrapBlock.end;
                    commentinfo = scrapBlock.comment;
                }
                file = configArg.file;
            }

            if (!scrapBlock || (scrapBlock && scrapBlock.rows && !_typedas.isArray(scrapBlock.rows))) {
                return undefined;
            }
            var rows = scrapBlock.rows,
                idx = 1, size = rows.length, row, scrapRowData = [],
                scrap, config = {},
                configKey, configVal,
                scrapBlockInfo = _scrapEnum.scrapEnum,
                single = scrapBlockInfo.single,
                multiOpen = scrapBlockInfo.open,
                multiClose = scrapBlockInfo.close,
                pos, startrow,
                me = this;

            // scan rows (exclude the fitrs & last rows scrap block["@[scrap" .. "]@]
            for (; idx < size - 1; idx++) {
                row = rows[idx];
                if (row) {
                    // config.row = row;
                    pos = row.indexOf(single);
                    if (pos === -1) {
                        pos = row.indexOf(multiOpen);
                        if (pos > -1) {

                        }
                    }

                    // look for single line scrap
                    if (pos > -1) {
                        startrow = row.substring(pos);
                        configKey = startrow.substring(single.length, startrow.indexOf(" "));
                        configVal = startrow.substring(startrow.indexOf(" ") + 1);

                        // set scrap property / value
                        if (configKey) {
                            if (!config[configKey]) {
                                config[configKey] = [configVal];
                            } else {
                                config[configKey].push(configVal)
                            }
                        }
                    }
                }
            }

            config.file = file;
            config.scrapinfo = fileinfo;
            config.commentinfo = commentinfo;
            if (!config.name) {
                _log.error(_props.get("cat.error.scrap.property.required").format("[scrap entity]", 'name'));
                return undefined;
            }
            scrap = new _clazz(config);
            if (scrap) {
                _scraps.push(scrap);
            }

            return scrap;
        },

        normalize: function (scraps) {
            var config = { files: {}}

            if (scraps) {
                scraps.forEach(function (scrap) {
                    var fileName;
                    if (scrap) {
                        fileName = scrap.get("file");
                        if (fileName) {
                            if (!config.files[fileName]) {
                                config.files[fileName] = {};
                            }
                            config.files[fileName][scrap.get("name")] = scrap.serialize();
                        }
                    }
                });

                _md.normalize(config);
            }
        },

        /**
         * Apply scrap(s)
         *
         * In case a specific scrap(s) is passed to the config argument
         * it will be processed or else this.getScraps() will be used
         * for applying all of the stored scraps
         *
         *
         * @param config The configuration data
         *              basePath[optional] - the base project path
         *              scraps[optional] - scraps to apply
         */
        apply: function (config) {

            function _apply(scrap) {

                if (scrap) {
                    scrap.apply();

                    fileName = scrap.get("file");
                    if (!metaData.files[fileName]) {
                        root = metaData.files;
                        root[fileName] = {};
                    }
                    root[fileName][scrap.get("name")] = scrap.serialize();
                }
            }

            var metaData = {files: {}, project: {}},
                fileName, scrap, scraps,
                root, baseClonedProjectPath,
                updateobj = {files: metaData.files, project: metaData.project};

            if (config) {
                scraps = (config.scraps || _scraps);

                if (config.basePath) {
                    baseClonedProjectPath = config.basePath;
                    metaData.project.basepath = baseClonedProjectPath;

                } else {
                    delete updateobj.project;
                }
            }

            scraps.forEach(function (scrap) {
                _apply(scrap);
            });

            // create meta data file
            _md.update(updateobj);

        },

        get: function (key) {
            return new _clazz({id: key})
        },

        getScrapEnum: function () {
            return _scrapEnum.scrapEnum;
        },

        getScraps: function () {
            return _scraps;
        },

        extractScrapBlock: _extractScrapBlock
    };
}();