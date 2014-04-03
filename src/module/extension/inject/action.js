var _fs = require('fs.extra'),
    _path = require('path'),
    _lineReader = require('line-reader'),
    _global = catrequire("cat.global"),
    _log = _global.log(),
    _mdata = catrequire("cat.mdata"),
    _Scrap = catrequire("cat.common.scrap"),
    _utils = catrequire("cat.utils"),
    _tplutils = catrequire("cat.tpl.utils"),
    _props = catrequire("cat.props"),
    _basePlugin = require("./../Base.js"),
    _project = catrequire("cat.project"),
    _beautify = require('js-beautify').js_beautify,
    _extutils = catrequire("cat.ext.utils");


/**
 * Injection extension for CAT
 *
 * @type {module.exports}
 */
module.exports = _basePlugin.ext(function () {

    var _me = this,
        _mdobject,
        _scrapEnum = _Scrap.getScrapEnum(),

        /**
         * Generate CAT source test project files according to the metadata
         *
         * @param scraps The scraps data
         * @param fileName The reference file to be processed
         */
            _generateSourceProject = function (scraps, file) {

            function _generateCATFileInfo(scraps, targetfile) {

                var outputjs = [],
                    projectTarget = _me._project.getInfo("target");

                scraps.forEach(function (scrap) {
                    var out,
                        runat,
                        managerout,
                        pkgname,
                        engine = scrap.$getEngine(),
                        args = scrap.get("arguments"),
                        scrapvar;

                    if (engine === _scrapEnum.engines.JS ||
                        engine === _scrapEnum.engines.HTML_EMBED_JS) {

                        runat = scrap.get("run@");
                        pkgname = _extutils.getCATInfo({scrap: scrap, file: file, basepath: projectTarget}).pkgName;
                        scrap.set("pkgName", pkgname);

                        pkgname = [pkgname, "cat"].join("$$");
                        scrapvar = ["{ scrap:", JSON.stringify(scrap.serialize()), "}"].join("");

                        if (runat) {
                            managerout = _tplutils.template({
                                    name: "scrap/_func_manager",
                                    data: {
                                        name: pkgname,
                                        runat: runat
                                    }
                                }
                            );
                        }

                        if (managerout) {
                            outputjs.push(managerout);
                        }

                        outputjs.push(_tplutils.template({
                                name: "scrap/_func_declare",
                                data: {
                                    name: pkgname,
                                    scrap: scrapvar,
                                    type: "scrap"
                                }
                            }
                        ));

                        outputjs.push(_tplutils.template({
                                name: "scrap/_func",
                                data: {
                                    name: pkgname,
                                    arguments: (args ? args.join(",") : undefined),
                                    output: scrap.generate()}
                            }
                        ));


                    }
                });

                return {
                    output: outputjs.join(""),
                    file: _extutils.getCATInfo({file: targetfile}).file
                };

            }

            function _generateUserFileInfo(scraps, targetfile) {

                var outputjs = [],
                    projectTarget = _me._project.getInfo("target");

                scraps.forEach(function (scrap) {
                    var out,
                        engine = scrap.$getEngine(),
                        pkgName;

                    if (engine === _scrapEnum.engines.JS ||
                        engine === _scrapEnum.engines.HTML_EMBED_JS) {

                        pkgName = _extutils.getUserInfo({scrap: scrap, file: file, basepath: projectTarget}).pkgName;
                        scrap.set("pkgName", pkgName);

                        out = _tplutils.template({
                                name: "scrap/_func_user",
                                data: {name: _extutils.getUserInfo({scrap: scrap, file: file, basepath: projectTarget}).pkgName,
                                    func: "" }
                            }
                        );

                        outputjs.push(out);

                    }
                });

                return {
                    output: outputjs.join(""),
                    file: _extutils.getUserInfo({file: targetfile}).file
                };

            }

            function _writeJSContentToFile(scraps, contentFunc, targetfile) {

                var info = contentFunc.call(this, scraps, targetfile),
                    fileContent = info.output;

                function _validateFileExt(file) {

                    var path, ext, name;
                    if (file) {
                        name = _path.basename(file);
                        ext = _path.extname(file);
                        name = [name.split(".")[0], "js"].join(".");
                        if (ext !== ".js") {
                            path = _path.dirname(file);
                            file = _path.join(path, name);
                        }
                    }

                    return file;
                }

                if (fileContent) {
                    fileContent = _beautify(fileContent, { indent_size: 2 });
                    try {
                        info.file = _validateFileExt(info.file);
                        _fs.writeFileSync(info.file, fileContent);
                        _log.debug(_props.get("cat.source.project.file.create").format("[inject ext]", targetfile));
                    } catch (e) {
                        _utils.error(_props.get("cat.error").format("[inject ext]", e));
                    }
                }

            }

            /**
             * Copy any resources to the project environment in here
             */
            function copyResources() {

            }

            var filepath = ((_mdobject.project && _mdobject.project.basepath) ? _utils.getRelativePath(file, _mdobject.project.basepath) : undefined),
                targetfile, targetfolder;

            // copy resources
            copyResources();

            targetfile = _path.join(_project.getInfo("source"), filepath);
            targetfolder = _path.dirname(targetfile);
            if (targetfolder) {
                if (!_fs.existsSync(targetfolder)) {
                    _utils.mkdirSync(targetfolder);
                }
            }
//            if (_fs.existsSync(targetfile)) {
//                _log.debug(_props.get("cat.source.project.file.exists").format("[inject ext]", targetfile));
//            }

            // TODO filter scraps arrays according to its $type (js, html, etc)

//            // apply all scraps
//            scraps.forEach(function (scrap) {
//                scrap.apply(scrap);
//            });

            // inject and generate proper content for JS files type
            _writeJSContentToFile(scraps, _generateCATFileInfo, targetfile);
            if (!_fs.existsSync(targetfile)) {
                _writeJSContentToFile(scraps, _generateUserFileInfo, targetfile);
            }

            //_Scrap.apply({scraps: scraps});

        },

        /**
         * Inject CAT calls to the proper location according to the scraps data
         *
         * @param scraps The scraps data
         * @param file The reference file to be processed
         */
            _injectScrapCall = function (scraps, file, callback) {

            var lines = [] , lineNumber = 1,
                commentinfos = [];

            function _injectCodeByScrap(line) {

                /*
                 *  In case there are more than one scrap per comment we need to store the
                 *  Info for all the scrap related to that comment.
                 */
                var prevCommentInfo,
                    size = commentinfos.length,
                    counter = 0;

                commentinfos.forEach(function (info) {

                    var content,
                        scraplcl = info.scrap,
                        injectinfo = scraplcl.get("injectinfo"),
                        scrapCtxArguments,
                        param1,
                        engine,
                        replaceinfo,
                        isLineNumber = false;

                    function removeOldCall() {
                        var startpos, endpos;

                        if (injectinfo && injectinfo.start) {
                            startpos = [injectinfo.start.line, injectinfo.start.col];
                            endpos = [injectinfo.end.line, injectinfo.end.col];

                            if (lineNumber === startpos[0]) {
                                line = [line.substring(0, startpos[1]), line.substring(endpos[1])].join("");
                            }
                        }
                    }

                    /**
                     * Process a single line according to a given info by line.
                     */
                    function processSingleLine() {

                        scrapCtxArguments = scraplcl.generateCtxArguments();
                        param1 = [["{ scrap:", JSON.stringify(scraplcl.serialize()), "}"].join("")];

                        // add context arguments if exists
                        if (scrapCtxArguments && scrapCtxArguments.length > 0) {
                            param1 = param1.concat(scrapCtxArguments);
                        }
                        // we need to reevaluate the injected calls
                        if (injectinfo) {
                            removeOldCall();
                        }

                        if (replaceinfo) {
                            return line;
                        }

                        if (engine === _scrapEnum.engines.JS) {
                            // JS file type call
                            content = _tplutils.template({
                                    name: "scrap/_cat_call",
                                    data: {param1: param1.join(",")}
                                }
                            );
                        } else if (engine === _scrapEnum.engines.HTML_EMBED_JS) {
                            // Embed Javascript block for HTML file
                            content = _tplutils.template({
                                    name: "scrap/_cat_embed_js",
                                    data: {param1: param1.join(",")}
                                }
                            );

                        } else if (engine === _scrapEnum.engines.HTML_IMPORT_JS) {
                            // HTML import javascript file
                            content = scraplcl.generate();


                        } else if (engine === _scrapEnum.engines.HTML_EMBED_INSERT) {

                            // Inject the scrap line to the file untouched
                            content = scraplcl.generate();

                        }

                        content = (_utils.prepareCode(content) || "");
                        if (prevCommentInfo) {
                            line = [line.substring(0, prevCommentInfo.end.col), content , line.substring(prevCommentInfo.end.col, line.length)].join("");
                        } else {
                            line = [line.substring(0, info.col), content , line.substring(info.col, line.length)].join("");
                        }

                        /*
                         *  In case we already injected content related to that comment.
                         *  We can get more than one scrap per comment.
                         *  Get the last injected call info.
                         */
                        if (prevCommentInfo) {
                            prevCommentInfo = {start: {line: lineNumber, col: prevCommentInfo.end.col}, end: {line: lineNumber, col: (prevCommentInfo.end.col + content.length)}};
                        } else {
                            prevCommentInfo = {start: {line: lineNumber, col: info.col}, end: {line: lineNumber, col: (info.col + content.length)}};
                        }
                        scraplcl.set("injectinfo", prevCommentInfo);
                    }

                    /**
                     * Process replace info
                     */
                    function processReplaceInfo() {
                        var markDefault = {
                            prefix: "/*",
                            suffix: "*/"
                        }, mark;

                        if (scraplcl.$getBehavior()) {

                            if (engine === _scrapEnum.engines.JS) {
                                // JS file type call
                                mark = markDefault;

                            } else if (engine === _scrapEnum.engines.HTML_EMBED_JS) {
                                // Embed Javascript block for HTML file
                                mark = markDefault;

                            }

                            return replaceinfo.apply({lines: lines, line: line, row: lineNumber, mark: mark});
                        }

                        return undefined;
                    }


                    if (scraplcl) {
                        replaceinfo = scraplcl.get("replaceinfo");
                    }


                    if (lineNumber === info.line || replaceinfo) {

                        isLineNumber = (lineNumber === info.line);
                        engine = scraplcl.$getEngine();

                        processReplaceInfo();

                        if (isLineNumber) {
                            processSingleLine();
                        }

                    }

                    counter++;
                });

                return line;
            }

            // get scrap info
            scraps.forEach(function (scrap) {
                var commentinfo = scrap.get("commentinfo");
                if (commentinfo) {
                    commentinfos.push({col: commentinfo.end.col, line: commentinfo.end.line, scrap: scrap});
                }
            });

            _lineReader.eachLine(file,function (line) {

                line = _injectCodeByScrap(line);
                lines.push(line + "\n");

                // use 'return false' to stop this madness
                lineNumber++;

            }).then(function () {

                    try {
                        _fs.writeFileSync(file, lines.join(""));
                        _log.debug(_props.get("cat.mdata.write").format("[inject ext]"));

                    } catch (e) {
                        _utils.error(_props.get("cat.error").format("[inject ext]", e));
                    }

                    callback.call(this);

                });

        },

        /**
         * Generate CAT test project and create the proper functionality according to the scraps
         * Injects the proper calls according to the scraps
         *
         * @param scraps The scraps data
         * @param fileName The reference file to be processed
         */
            _inject = function (scraps, fileName, callback) {

            var file = fileName;

            if (file) {
                if (_fs.existsSync(file)) {
                    _generateSourceProject(scraps, file);

                    _injectScrapCall(scraps, file, function () {
                        callback.call(this);
                    });

                }

            }
        },

        _module = {

            /**
             * Plugin initialization
             * Reads the data out of CAT metadata file
             * Go over the files and inject the data according to the metadata information
             */
            init: function (config, ext) {
                _me.initialize(config, ext);

            },

            /**
             * Apply sync changes coming from the watch.
             *
             * @param config
             */
            watch: function (config) {
                console.log("inject");

                var emitter = _me.getEmitter();

                emitter.emit("job.done", {status: "done"});
            },

            /**
             * Empty apply method for the inject extension
             *
             */
            apply: function (config) {

                var data,
                    files, filesArr = [],
                    counter = -1,
                    emitter = _me.getEmitter();

                function _apply(filename) {

                    var scraps = [],
                        scrapName,
                        scrapData,
                        scrap,
                        scrapDataObj;

                    if (filename) {


                        scrapDataObj = files[filename];
                        scraps = [];

                        if (scrapDataObj) {
                            for (scrapName in scrapDataObj) {
                                scrapData = scrapDataObj[scrapName];
                                if (scrapData) {
                                    scrap = new _Scrap.clazz(scrapData);
                                    if (scrap) {
                                        scraps.push(scrap);
                                    }
                                }
                            }
                        }

                        // apply all scraps
                        _Scrap.apply({scraps: scraps});

                        _inject(scraps, filename, function () {
                            counter++;
                            _apply(filesArr[counter]);

                            // update the scrap data w/o running scrap apply
                            _Scrap.apply({scraps: scraps, apply: false});
                        });
                    } else {
                        //  _Scrap.apply({scraps: scraps});
                        emitter.emit("job.done", {status: "done"});
                    }
                }

                _me.apply(config);

                if (_mdata) {
                    _mdata.readAsync(function () {
                        var fileName;
                        if (this.data) {
                            _mdobject = JSON.parse(this.data);

                            if (_mdobject) {

                                // TODO go over the updates for the file that was changed...
                                files = _mdobject.files;
                                if (files) {
                                    for (fileName in files) {
                                        if (fileName) {
                                            filesArr.push(fileName);
                                        }
                                    }
                                }

                                if (filesArr && filesArr.length > 0) {
                                    counter = 0;
                                    _apply(filesArr[counter]);
                                }
                            }

                        }
                    });
                }
            }
        };

    return _module;
});