var _utils = catrequire("cat.utils"),
    _props = catrequire("cat.props"),
    _md = catrequire("cat.mdata"),
    _typedas = require("typedas"),
    _log = catrequire("cat.global").log();


module.exports = function () {

    var __id = 0,

        _scraps = [],

        _scrapEnum = {
            open: "@[",
            close: "]@",
            single: "@@",
            name: "scrap"
        },

        _scrapId = function() {
            __id++;
            return ["scrap",__id].join("_");
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

            this.generate = function() {
                return ( this.output ? this.output.join(" \n ") : "");
            };

            this.print = function(line) {
                this.output.push(line);
            };

            this.apply = function() {
                _utils.forEachProp(me.config, function(prop) {
                    var func;
                    if (prop) {
                        func = me[prop + "Apply"];
                        if (func) {
                            func.call(me, {});
                        }
                    }
                });
            };

            this.serialize = function() {
                var data = {};
                _utils.forEachProp(me.config, function(key) {
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
            var idx = 0, size, comment,
                scrap = [-1, -1],
                scraps = [],
                currentScrap = [],
                scrapBlockName,
                tmpString, tmpPos;

            if (scrapCommentBlock) {
                size = scrapCommentBlock.length;
                for (; idx < size; idx++) {
                    comment = scrapCommentBlock[idx];
                    if (comment) {
                        if (scrap[0] === -1) {
                            scrap[0] = comment.indexOf((_scrapEnum.open));
                        }
                        scrap[1] = comment.indexOf(_scrapEnum.close);
                        if (scrap[0] > -1 && scrap[1] === -1) {
                            if (!scrapBlockName) {
                                // extract scrap name from the first block comment e.g. @[name
                                tmpString = comment.substring(scrap[0]);
                                tmpPos = (tmpString.indexOf(" "));
                                tmpPos = (tmpPos === -1 ? tmpPos = tmpString.length : tmpPos);
                                scrapBlockName = tmpString.substring((scrap[0]), tmpPos);
                            }
                            currentScrap.push(comment);
                        }
                        if (scrap[1] > -1) {
                            if (scrap[0] < -1 || scrap[0] > scrap[1]) {
                                currentScrap = [];
                                _log.warning(_props.get("cat.scrap.validation.close").format("[scrap plugin]"));
                            }
                            // valid comment
                            currentScrap.push(comment);
                            if (scrapBlockName === _scrapEnum.name) {
                                scraps.push({name: scrapBlockName, rows: currentScrap.splice(0)});
                            }
                        }

                    }
                }
            }

            return scraps;
        };

    return {

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
                file;

            if (configArg) {
                scrapBlock = configArg.scrapComment;
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

            config.file = configArg.file;
            scrap = new me.clazz(config);
            if (scrap) {
                _scraps.push(scrap);
            }
        },

        apply: function (key, config) {
            var metaData = {},
                fileName;
            if (_scraps) {
                _scraps.forEach(function(scrap){
                    if (scrap) {
                        scrap.apply();

                        fileName = scrap.get("file");
                        if (!metaData[fileName]) {
                            metaData[fileName] = {};
                        }
                        metaData[fileName][scrap.get("name")] = scrap.serialize();
                    }
                });
            }

            _md.write(JSON.stringify(metaData));

        },

        get: function (key) {
            return new this.clazz({id: key})
        },

        getScrapBlockInfo: function () {
            return _scrapEnum;
        },

        getScraps: function() {
            return _scraps;
        },

        extractScrapBlock: _extractScrapBlock
    };
}();