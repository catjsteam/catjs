var _utils = catrequire("cat.utils"),
    _regutils = catrequire("cat.regexp.utils"),
    _props = catrequire("cat.props"),
    _md = catrequire("cat.mdata"),
    _typedas = require("typedas"),
    _log = catrequire("cat.global").log(),
    _clazz = require("./ScrapItem.js"),
    _parser = require("./parser/Parser.js"),
    _scrapEnum = require("./ScrapEnum.js"),
    _commonparser = require("./parser/CommonParser.js"),
    _ScrapConfigItem = require("./ScrapConfigItem.js"),
    _scrapUtils = require("./ScrapUtils.js"),
    _cache = require("./Cache.js");

// destroy scraps cache
_cache.destroy();    


module.exports = function () {

    var _scrapNames = ["name"],
        _scraps = [],
        _scrapmap,

        /**
         * Extract scrap block out of comment
         *
         * @param scrapCommentBlock
         * @returns {Array}
         * @private
         */
            _extractScrapBlock = function (scrapCommentBlock) {

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

            _scrapNames.push(attrName);

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
            };
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
                idx = 1, size = rows.length, row,
                scrap, config = {},
                configKey, configVal,
                multiRowOpenExp = "@@(.*)([\\[]+)(.*)([\\s].*)",
                multiRowCloseExp = "(.*)?([\\]])([\\s]?.*)",
                multiRowExp = "@@(.*)([\\[]+)(.*)([\\]]+.*?)([\\s]?.*)",
                closeRow, singleRow, multiRowOpen, multiRow,
                data,
                idxi= 0, sizei= 0, itemi,
            // 0-don't push, 1-push data, 2-push data and break
                pushdata = 0,
                matchName, sign, hint;

            // scan rows (exclude the fitrs & last rows scrap block["@[scrap" .. "]@]
            for (; idx < size - 1; idx++) {
                singleRow = null;
                data = null;
                idxi=0; sizei = 0;

                row = rows[idx];
                if (row) {
                    if (multiRowOpen) {
                        closeRow = _regutils.getMatch(row, multiRowCloseExp);
                    }

                    if (multiRowOpen && !closeRow) {
                        multiRowOpen.push(row);

                    } else {

                        if (!closeRow && ! multiRowOpen) {
                            // @@(.*)\s(.*)\s(.*)
                            singleRow = _regutils.getMatch(row, "@@(.*?\\[[\\s]+)(.*)");
                            if (!singleRow) {
                                singleRow = _regutils.getMatch(row, "@@(.*?[\\s]+)(.*)");
                            } else {
                                singleRow = null;
                            }
                        }

                        if (singleRow) {

                            // single row annotation expression
                            configKey = singleRow[1];
                            configVal = singleRow[2];

                            // Interpret name (name, sign [!, =, @] see _commonparser.parseName)
                            matchName = _commonparser.parseName(configKey);
                            if (matchName) {
                                if (hint) {
                                    configKey = matchName.name;
                                }
                                sign = matchName.sign;
                                hint = matchName.hint;

                            } else {
                                sign = undefined;
                            }

                            // set scrap property / value
                            _scrapUtils.putScrapConfig(config, configKey, _ScrapConfigItem.create({value: configVal, sign:sign, hint:hint}));

                        } else {

                            if (!closeRow && ! multiRowOpen) {
                                // multi row annotation expression
                                multiRow = _regutils.getMatch(row + " ", multiRowExp);
                                multiRowOpen =  _regutils.getMatch(row + " ", multiRowOpenExp);
                            }

                            if (multiRow) {
                                // we have all we need
                                configKey = multiRow[1];
                                data = _scrapUtils.collectDataConfig(multiRow);

                                // set scrap property / value
                                //TODO !!! support for  _ScrapConfigItem.create({value: configVal, sign:sign}));

                            } else if (multiRowOpen) {
                                // we wait for closing sign ']'
                                if (closeRow) {
                                    multiRowOpen = multiRowOpen.concat(_scrapUtils.normalizeData(closeRow));

                                    // we have all we need
                                    configKey = multiRowOpen[1];
                                    data = _scrapUtils.collectDataConfig(multiRowOpen);
                                }
                            }

                            if (data) {
                                // try getting the data
                                try{
                                    data = _scrapUtils.cleanArray(data);
                                    data = _scrapUtils.parseData(data);
                                    if (data) {
                                        configVal = (data ? JSON.parse(data.join("")) : undefined);
                                        _scrapUtils.putScrapConfig(config, configKey, configVal);
                                    }
                                } catch(e) {
                                    console.log(e);
                                }


                                // reset
                                closeRow = null;
                                multiRow = null;
                                multiRowOpen = null;
                            }
                        }
                    }
                }
            }

            config.file = file;

            if ( config.file ) {
                config.file = config.file.split("\\").join("/");
                config.file = config.file.split("//").join("/");
            }

            config.scrapinfo = fileinfo;
            config.commentinfo = commentinfo;
            if (!config.name) {
                //_utils.log("error", _props.get("cat.error.scrap.property.required").format("[scrap entity]", 'name'));
                //return undefined;
            }
            scrap = new _clazz(config);
            if (scrap) {
                _scraps.push(scrap);
            }

            return scrap;
        },

        normalize: function (scraps) {
            var config = { files: {}};

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
                    if (isApply) {
                        scrap.buildContext(_scrapNames);
                        scrap.apply();
                    }

                    fileName = scrap.get("file");
                    if (!metaData.files[fileName]) {
                        root = metaData.files;
                        root[fileName] = {};
                    }
                    root[fileName][scrap.get("name")] = scrap.serialize();
                }
            }

            var metaData = {files: {}, project: {}},
                fileName, scraps,
                root, baseClonedProjectPath,
                updateobj = {files: metaData.files, project: metaData.project},
                isApply;

            if (config) {

                isApply = ("apply" in config ? config.apply : true);
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
            
            if ("callback" in config) {
                config.callback.call(this, scraps);
            }

        },

        get: function (key) {
            return new _clazz({id: key});
        },

        getScrapEnum: function () {
            return _scrapEnum.scrapEnum;
        },

        getScraps: function () {

            var data, key, scrap, file,
                scrapkey;
            if (!_scraps || (_scraps && _scraps.length === 0)) {
                data = _md.read();
                if (data) {
                    data = JSON.parse(data);
                    if (data.files) {
                        for (key in data.files) {
                            file = data.files[key];
                            if (file) {

                                for (scrapkey in file) {

                                    scrap = new _clazz(file[scrapkey]);
                                    if (scrap) {
                                        _scraps.push(scrap);
                                    }

                                }
                            }
                        }
                    }
                }
            }

            return _scraps;
        },

        getScrap: function(key) {
              if (!_scrapmap && _scraps) {
                  _scrapmap = {};
                  _scraps.forEach(function(scrap) {

                      if (scrap) {
                        _scrapmap[scrap.id()] = scrap;
                      }

                  });
              }

            return _scrapmap[key];
        },

        extractScrapBlock: _extractScrapBlock
    };
}();