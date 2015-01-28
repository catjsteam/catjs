var _fs = require('fs.extra'),
    _path = require('path'),
    _lineReader = require('line-reader'),
    _global = catrequire("cat.global"),
    _log = _global.log(),
    _mdata = catrequire("cat.mdata"),
    _Scrap = catrequire("cat.common.scrap"),
    _utils = catrequire("cat.utils"),
    _sysutils = catrequire("cat.sys.utils"),
    _tplutils = catrequire("cat.tpl.utils"),
    _props = catrequire("cat.props"),
    _basePlugin = require("./../Base.js"),
    _project = catrequire("cat.project"),
    _beautify = require('js-beautify').js_beautify,
    _processReplacenfo = require("./parser/replaceInfo.js"),
    _processSingleLine = require("./parser/singleLine.js"),
    _generateManagerInfo = require("./build/manager.js"),
    _entityutils = catrequire("cat.entity");


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

            function _writeJSContentToFile(scraps, contentFunc, targetfile) {

                var info = contentFunc.call(_me, scraps, file, targetfile),
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
                        _fs.writeFileSync(info.file, fileContent, {mode: 0777});
                        _fs.chmodSync(info.file, 0777);
                        _log.debug(_props.get("cat.source.project.file.create").format("[inject ext]", targetfile));
                    } catch (e) {
                        _utils.error(_props.get("cat.error").format("[inject ext]", e));
                    }
                }

            }

            var filepath,
                targetfile, targetfolder, targetInternalFolder,
                home = _global.get("home"),
                catworkdir = _sysutils.getCatProjectPath(),
                internalTargetfile, folderCounter = 0;


            /* 
             TODO replace path resolving with require("path")
             Get the current file information and write it to the sources project location
             */

            // 
            filepath = ((_mdobject.project && _mdobject.project.basepath) ? _utils.getRelativePath(file, _mdobject.project.basepath) : undefined),

                internalTargetfile = _path.join(catworkdir, "cache", filepath);
            targetfile = _path.join(_project.getInfo("source"), filepath);

            targetfolder = _path.dirname(targetfile);
            if (targetfolder) {
                if (!_fs.existsSync(targetfolder)) {
                    folderCounter = _sysutils.getFoldersCount(filepath);
                    console.log(targetfolder);
                    _fs.mkdirpSync(targetfolder, {mode: 0777});
                    _sysutils.chmodSyncOffset(targetfolder, 0777, folderCounter);
                }
            }
            
            targetInternalFolder = _path.dirname(internalTargetfile);
            if (targetInternalFolder) {
                if (!_fs.existsSync(targetInternalFolder)) {
                    folderCounter = _sysutils.getFoldersCount(filepath);
                    _fs.mkdirpSync(targetInternalFolder, {mode: 0777});
                    _sysutils.chmodSyncOffset(targetInternalFolder, 0777, folderCounter);
                }
            }

            // inject and generate proper content for JS files type
            _writeJSContentToFile(scraps, _generateManagerInfo.getCache, internalTargetfile);
            _writeJSContentToFile(scraps, _generateManagerInfo.getIncludeCache, internalTargetfile);
            /* @Obsolete - user code generation is being refactored [WIP]
             if (!_fs.existsSync(targetfile)) {            
             _writeJSContentToFile(scraps, _generateManagerInfo.getUser, targetfile);
             }
             */

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
                var lineobj = {line: line},
                    counter = 0;

                commentinfos.forEach(function (info) {

                    var scraplcl = info.scrap,
                        injectinfo = scraplcl.get("injectinfo"),
                        replaceinfo,
                        isLineNumber = false;


                    if (scraplcl) {
                        replaceinfo = scraplcl.get("replaceinfo");
                    }


                    if (lineNumber === info.line || replaceinfo) {

                        isLineNumber = (lineNumber === info.line);

                        _processReplacenfo({
                            lines: lines,
                            line: lineobj,
                            scraplcl: scraplcl,
                            lineNumber: lineNumber,
                            replaceinfo: replaceinfo
                        });

                        if (isLineNumber) {

                            _processSingleLine({
                                injectinfo: injectinfo,
                                info: info,
                                line: lineobj,
                                scraplcl: scraplcl,
                                lineNumber: lineNumber,
                                replaceinfo: replaceinfo
                            });
                        }

                    }

                    counter++;
                });

                return lineobj.line;
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
                        _fs.writeFileSync(file, lines.join(""), {mode: 0777});
                        _fs.chmodSync(file, 0777);
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

                var emitter = _me.getEmitter();

                emitter.emit("job.done", {status: "done"});
            },

            /**
             * Empty apply method for the inject extension
             *
             */
            apply: function (config) {

                var files, filesArr = [],
                    counter = -1,
                    emitter = _me.getEmitter(),
                    // load Jasmine entity
                    jasmine = _entityutils.getEntity("jasmine");

                function _apply(filename, callback) {

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
                        _Scrap.apply({scraps: scraps, apply: true});

                        _inject(scraps, filename, function () {
                            counter++;
                            _apply(filesArr[counter], callback);

                            
                            // update the scrap data 
                            _Scrap.apply({
                                scraps: scraps,
                                apply: true,
                                callback: function (scraps) {
                                    
                                }
                            });

                            if (counter === filesArr.length) {
                                if (callback) {
                                    callback.call(this);
                                }
                            }

                        });
                    } 
                }

                _me.apply(config);

                if (_mdata) {
                    _mdata.readAsync(function () {
                        var fileName, 
                            scrapslcl;
                        
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

                                    _apply(filesArr[counter], function () {
                                        scrapslcl = _Scrap.getScraps();
                                        _Scrap.apply({scraps: scrapslcl, apply: false});

                                        // apply Jasmine entity (generate the scrap data using jasmine printer)
                                        jasmine.apply(scrapslcl);
                                        
                                        // flush Jasmine data to the files
                                        jasmine.flush();

                                        // Task has ended
                                        emitter.emit("job.done", {status: "done"});

                                    });
                                }
                            }

                        } else {
                            emitter.emit("job.done", {status: "done"});
                        }
                    });
                } else {
                    emitter.emit("job.done", {status: "done"});
                }
            }
        };

    return _module;
});