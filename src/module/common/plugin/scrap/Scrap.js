var _utils = catrequire("cat.utils"),
    _props = catrequire("cat.props"),
    _md = catrequire("cat.mdata"),
    _typedas = require("typedas"),
    _log = catrequire("cat.global").log();


module.exports = function () {

    var __id = 0,

        _getScrapEnum = function (key) {
            var obj = {};
            _utils.copyObjProps(_scrapEnum[key], obj);

            return obj;
        },

        _scrapBaseEnum = {
            "_info": {
                start: {
                    line: -1,
                    col: -1
                },
                end: {
                    line: -1,
                    col: -1
                }
            }
        },

        _scraps = [],

        _scrapEnum = {
            open: "@[",
            close: "]@",
            single: "@@",
            name: "scrap",

            "injectinfo": _scrapBaseEnum["_info"],
            "scrapinfo": _scrapBaseEnum["_info"]
        },

        _scrapId = function () {
            __id++;
            return ["scrap", __id].join("_");
        },

        /**
         * Scrap class
         */
            _clazz = function (config) {

            var me = this;

            function _init(name, defaultValue) {

                // set default values
                if (me.config[name] === undefined) {
                    me.set(name, defaultValue);
                }
            }

            if (!config) {
                _utils.error(_props.get("cat.error.config").format("[Scrap Entity]"));
            }

            this.config = config;
            this.output = [];

            this.getEnum = _getScrapEnum;

            this.set = function (key, value) {
                if (key) {
                    config[key] = value;
                    this[key] = function () {
                        return this.config[key];
                    };
                }
            };

            // defaults
            (function () {
                if (me.config) {
                    _utils.forEachProp(me.config, function (key) {
                        if (key) {
                            me[key] = function () {
                                return this.config[key];
                            };
                        }
                    });
                }
            })();

            // set default values
            _init("single", false);
            _init("id", _scrapId());

            this.isSingle = function () {
                return this.config.single;
            };

            this.get = function (key) {
                if (key) {
                    return this[key]();
                }
            };

            this.generate = function () {
                return ( this.output ? this.output.join(" \n ") : "");
            };

            this.print = function (line) {
                this.output.push(line);
            };

            this.apply = function () {
                _utils.forEachProp(me.config, function (prop) {
                    var func;
                    if (prop) {
                        func = me[prop + "Apply"];
                        if (func) {
                            func.call(me, {});
                        }
                    }
                });
            };

            this.serialize = function () {
                var data = {};
                _utils.forEachProp(me.config, function (key) {
                    if (key) {
                        data[key] = this[key];
                    }
                });
                return data;
            };

        },

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
                commentBlock = _getScrapEnum("scrapinfo"),
                scraps = [],
                currentScrap = [],
                scrapBlockName,
                tmpString, tmpPos;

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
                            scrap[0] = comment.indexOf((_scrapEnum.open));
                        }
                        scrap[1] = comment.indexOf(_scrapEnum.close);

                        // opened block was found
                        if (scrap[0] > -1 && scrap[1] === -1) {
                            if (!scrapBlockName) {
                                // extract scrap name from the first block comment e.g. @[name
                                tmpString = comment.substring(scrap[0]);
                                tmpPos = (tmpString.indexOf(" "));
                                tmpPos = (tmpPos === -1 ? tmpPos = tmpString.length : tmpPos);
                                scrapBlockName = tmpString.substring(_scrapEnum.open.length, tmpPos);
                                lineNumber[0] = commentobj.number;
                            }
                            currentScrap.push(comment);
                        }

                        // closed block was found
                        if (scrap[1] > -1) {
                            scrap[1] += _scrapEnum.close.length;
                            // valid comment
                            currentScrap.push(comment);
                            if (scrapBlockName === _scrapEnum.name) {
                                lineNumber[1] = commentobj.number;
                                scraps.push({name: scrapBlockName, rows: currentScrap.splice(0), start: {line: lineNumber[0], col: scrap[0]}, end: {line: lineNumber[1], col: scrap[1]}, comment: commentBlock });
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

    // Scrap class prototype
    _clazz.prototype.update = function (key, config) {

        var injectinfo = this.config[key];
        if (!injectinfo) {
            this.config[key] = this.getEnum(key);
        }
        _utils.copyObjProps(this.config[key], config);

    };

    return {

        getEnum: function (key) {
            return _getScrapEnum(key);
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
                func = config.func;

            _clazz.prototype[attrName] = function () {
                return this.config[attrName];
            };

            _clazz.prototype[attrName + "Apply"] = function (config) {
                return func.call(this, config);
            }
        },

        create: function (configArg) {

            var scrapBlock,
                file,
                fileinfo,
                commentinfo;

            if (configArg) {
                scrapBlock = configArg.scrapComment;
                if (scrapBlock) {
                    fileinfo = _getScrapEnum("scrapinfo");
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
                scrapBlockInfo = this.getScrapBlockInfo(),
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
                        config.single = true;

                        if (configKey) {
                            config[configKey] = configVal;
                        }
                    }
                }
            }

            config.file = file;
            config.scrapinfo = fileinfo;
            config.commentinfo = commentinfo;
            scrap = new me.clazz(config);
            if (scrap) {
                _scraps.push(scrap);
            }

            return scrap;
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
            return new this.clazz({id: key})
        },

        getScrapBlockInfo: function () {
            return _scrapEnum;
        },

        getScraps: function () {
            return _scraps;
        },

        extractScrapBlock: _extractScrapBlock
    };
}();