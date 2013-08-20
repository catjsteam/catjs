var _utils = catrequire("cat.utils"),
    _props = catrequire("cat.props"),
    _md = catrequire("cat.mdata"),
    _typedas = require("typedas"),
    _log = catrequire("cat.global").log(),
    _clazz = require("./ScrapItem.js"),
    _parser = require("./parser/Parser.js"),
    _scrapEnum = require("./ScrapEnum.js");


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

//            var idx = 0, size, comment, commentobj,
//                scrap = [-1, -1],
//                lineNumber = [0, 0],
//                commentBlock = {},
//                scraps = [],
//                currentScrap = [],
//                scrapBlockName,
//                tmpString, tmpPos;


            return _parser.parse(scrapCommentBlock);
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
                single = config.single,
                singleton = config.singleton;

            _clazz.prototype[attrName + "Init"] = function () {
                if (single !== undefined) {
                    this.setSingle(attrName, single);
                }
                if (singleton !== undefined) {
                    this.setSingleton(attrName, singleton);
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