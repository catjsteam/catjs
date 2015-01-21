diff --git a/src/libraries/cat/Cat.js b/src/libraries/cat/Cat.js
index 6cc5a78..d815373 100755
--- a/src/libraries/cat/Cat.js
+++ b/src/libraries/cat/Cat.js
@@ -187,8 +187,7 @@ _cat.core = function () {
             _enum = _cat.core.TestManager.enum;
             
             _guid = _cat.utils.Storage.getGUID();
-
-            // 
+            
             _config = new _cat.core.Config({
                 hasPhantomjs: hasPhantomjs
             });
@@ -675,8 +674,14 @@ _cat.core = function () {
 
             script = document.getElementById("catjsscript");
             source = script.src;
-            head = (source.split("cat/lib/cat.js")[0] || "");
 
+            if (source.indexOf("cat/lib/cat.js") !== -1) {
+                head = (source.split("cat/lib/cat.js")[0] || "");                
+            } else {
+                head = (source.split("cat/lib/cat/cat.js")[0] || "");
+            }
+            
+            
 //
 //
 //            regHtml = "([/]?.*[/]*[/])+(.*[\\.html]?)";
diff --git a/src/libraries/cat/core/Config.js b/src/libraries/cat/core/Config.js
index 38fcb67..c79a213 100644
--- a/src/libraries/cat/core/Config.js
+++ b/src/libraries/cat/core/Config.js
@@ -63,6 +63,15 @@ _cat.core.Config = function(args) {
             }
         };
 
+        this.isTests = function() {
+            var tests = this.getTests();
+            if (tests && tests.length && tests.length > 0) {
+                return true;
+            }
+            
+            return false;
+        };
+        
         this.getTests = function () {
 
             function _GetTestsClass(config) {
diff --git a/src/libraries/cat/core/test/TestManager.js b/src/libraries/cat/core/test/TestManager.js
index 69de066..d3ec1ad 100755
--- a/src/libraries/cat/core/test/TestManager.js
+++ b/src/libraries/cat/core/test/TestManager.js
@@ -98,10 +98,16 @@ _cat.core.TestManager = function() {
 
             // START test signal
             var config = _cat.core.getConfig();
+            
             // TODO we need to set test start signal via an API
             if (config.getTests()) {
                 _cat.core.ui.on();
                 _cat.core.TestManager.send({signal:"TESTSTART"});
+                
+                if (!config.isTests()) {
+                    _cat.core.TestManager.send({signal: 'NOTEST'});
+                    _cat.core.TestManager.send({signal: 'TESTEND'});
+                }
             }
         },
 
diff --git a/src/libraries/cat/target/cat.js b/src/libraries/cat/target/cat.js
index 588052c..acbc02b 100644
--- a/src/libraries/cat/target/cat.js
+++ b/src/libraries/cat/target/cat.js
@@ -187,8 +187,7 @@ _cat.core = function () {
             _enum = _cat.core.TestManager.enum;
             
             _guid = _cat.utils.Storage.getGUID();
-
-            // 
+            
             _config = new _cat.core.Config({
                 hasPhantomjs: hasPhantomjs
             });
@@ -675,8 +674,14 @@ _cat.core = function () {
 
             script = document.getElementById("catjsscript");
             source = script.src;
-            head = (source.split("cat/lib/cat.js")[0] || "");
 
+            if (source.indexOf("cat/lib/cat.js") !== -1) {
+                head = (source.split("cat/lib/cat.js")[0] || "");                
+            } else {
+                head = (source.split("cat/lib/cat/cat.js")[0] || "");
+            }
+            
+            
 //
 //
 //            regHtml = "([/]?.*[/]*[/])+(.*[\\.html]?)";
@@ -763,6 +768,15 @@ _cat.core.Config = function(args) {
             }
         };
 
+        this.isTests = function() {
+            var tests = this.getTests();
+            if (tests && tests.length && tests.length > 0) {
+                return true;
+            }
+            
+            return false;
+        };
+        
         this.getTests = function () {
 
             function _GetTestsClass(config) {
@@ -1878,10 +1892,16 @@ _cat.core.TestManager = function() {
 
             // START test signal
             var config = _cat.core.getConfig();
+            
             // TODO we need to set test start signal via an API
             if (config.getTests()) {
                 _cat.core.ui.on();
                 _cat.core.TestManager.send({signal:"TESTSTART"});
+                
+                if (!config.isTests()) {
+                    _cat.core.TestManager.send({signal: 'NOTEST'});
+                    _cat.core.TestManager.send({signal: 'TESTEND'});
+                }
             }
         },
 
diff --git a/src/module/CAT.js b/src/module/CAT.js
index 1b4e091..4986aac 100644
--- a/src/module/CAT.js
+++ b/src/module/CAT.js
@@ -375,7 +375,8 @@ var CAT = function () {
                                 schema.properties.appath = new Schema({
                                     type: "string",
                                     required: true,
-                                    description: "Enter your project's (application) path"
+                                    default: "./..",
+                                    description: "Enter application's directory [./..] "
                                 });
                             }
                         }
diff --git a/src/module/config/CATConfig.js b/src/module/config/CATConfig.js
index 83de65f..990d97f 100644
--- a/src/module/config/CATConfig.js
+++ b/src/module/config/CATConfig.js
@@ -1,344 +0,0 @@
-var _global = catrequire("cat.global"),
-    _utils = catrequire("cat.utils"),
-    _log = _global.log(),
-    _path = require("path"),
-    _fsconfig = catrequire("cat.config.utils"),
-    _typedas = require("typedas"),
-    _props = catrequire("cat.props"),
-    _watch = catrequire("cat.watch"),
-    _catconfig,
-    _loadCATConfig,
-
-    /**
-     * CAT Configuration class
-     *
-     * Loads CAT internal configuration from resources/cat.json file
-     *  and creates a configuration instance
-     *
-     * @param externalConfig The passed configuration
-     *          emitter - The emitter reference
-     *          project - Cat project
-     *          grunt - The grunt reference (if available)
-     *
-     * @param data The incoming row configuration data
-     */
-     _CATConfig = function (externalConfig, data) {
-
-        var me = this,
-            idx = 0, size, project, pluginsPath = [],
-            dependencies = [],
-            librariesConfig = [],
-            librariesDefault = ["underscore", "js.utils", "jspath", "chai",  "cat"],
-            libraryBuildConfig, dependenciesInfo,
-            appTargetPath, appPath, jshint, minifyplugin,
-            scrapfilter, projectcopy,
-            scrapscan, customPlugins,
-            cattarget, targetfolder,
-            manifest,
-            libIdx= 0,
-            rmIdx=-1;
-
-        /**
-         * Extension initialization
-         *
-         * @param ext
-         * @private
-         */
-        function _extension(ext) {
-            if (ext && ext.name) {
-
-                ext.getPhase = function() {
-                    return (ext.phase || "default");
-                };
-                me._extmap[ext.name] = {externalConfig: externalConfig, ext: ext, ref: null};
-            }
-        }
-
-        this._extmap = {};
-        this._watch = {};
-        this.extensions = data.extensions;
-        this.plugins = data.plugins;
-        this.externalConfig = externalConfig;
-
-        if (this.extensions) {
-
-            if (_typedas.isArray(this.extensions)) {
-                // Index the extensions entries
-                size = this.extensions.length;
-                for (; idx < size; idx++) {
-                    _extension(this.extensions[idx]);
-                }
-            }
-
-            // load CAT environment variables and update the project class
-            this.env = data.env;
-            if (this.externalConfig) {
-                project = this.externalConfig.project;
-                if (project) {
-
-                    if (data && data.extensions) {
-                        data.extensions.forEach(function(ext) {
-                            if (ext && ext.name) {
-                                dependencies.push({
-                                    name: ext.name,
-                                    type: ext.name
-                                });
-                            }
-                        });
-                        // add internal extensions info
-                        project.appendEntity("dependencies", dependencies);
-                    }
-
-                    // set environment info
-                    project.setInfo("template", this.env.template);
-                    project.setInfo("libraries", this.env.libraries);
-                    this.plugins.forEach(function(path){
-                        pluginsPath.push(_path.join(cathome, path));
-                    });
-                    project.addPluginLocations(pluginsPath);
-
-                    customPlugins = [];
-                    librariesConfig = ["cat"];
-                    targetfolder = project.getInfo("target");
-                    cattarget = (project.getInfo("cattarget") || "./");
-
-                    appTargetPath = _path.join("./", _path.relative(_path.resolve("."), targetfolder), project.name);
-                    appPath = project.getInfo("apppath");
-
-                    if (appPath) {
-                        projectcopy= {
-                            "name": "p@project.copy",
-                            "type": "copy",
-                            "dependency": "scan",
-                            "path": appPath,
-                            "from": {
-                                "path": "/"
-                            },
-                            "to": {
-                                "path": appTargetPath
-                            }
-                        };
-                        customPlugins.push(projectcopy);
-
-                    } else  {
-                        _log.log("error", "[CAT config] 'apppath property is missing or not valid. See catproject.json spec");
-                    }
-
-                    scrapscan =   {
-                        "name": "p@init.scrap",
-                        "type": "scrap",
-                        "dependency": "scan"
-                    };
-
-                    scrapfilter = project.getInfo("scrapfilter");
-                    if (scrapfilter) {
-                        scrapscan.filters = scrapfilter;
-                    }
-                    customPlugins.push(scrapscan);
-
-                    jshint = project.getInfo("jshint");
-                    minifyplugin = {
-                        "name": "p@project.minify",
-                        "type": "minify",
-                        "path": _path.join(appTargetPath, cattarget, "/cat/lib/cat"),
-                        "filename": "cat.src.js",
-                        "src":[["./cache/",  project.name, "/**/*.js"].join(""),["./src/",  project.name, "/**/*.js"].join(""), "./src/common/**/*.js"]
-                    };
-                    if (jshint) {
-                        minifyplugin.jshint = jshint;
-                    }
-                    
-                    customPlugins = customPlugins.concat([
-                        {
-                            "name": "p@lib.copy",
-                            "type": "copy",
-                            "from": {
-                                "path": "./lib"
-                            },
-                            "to": {
-                                "path": _path.join(appTargetPath, cattarget, "/cat/lib")
-                            }
-                        },
-                        {
-                            "name": "p@lib.parse",
-                            "type": "fileparse",
-                            "dependency": "manager",
-                            "files": [_path.join(appTargetPath, cattarget, "/cat/lib/cat/cat.js")],
-                            "pattern": "_getBase=\"(.*)\";",
-                            "replace": "_getBase=\"" + cattarget + "\";",
-                            "applyto":["content"],
-                            "flags": "g"
-                        },
-                        {
-                            "name": "p@src.copy",
-                            "type": "copy",
-                            "from": {
-                                "path": "./src/config"
-                            },
-                            "to": {
-                                "path": _path.join(appTargetPath, cattarget, "/cat/config")
-                            }
-                        }, minifyplugin                        
-                        ]);
-
-                    dependenciesInfo = project.getInfo("dependencies");
-                    if (!dependenciesInfo) {
-                        librariesConfig = dependenciesInfo = librariesDefault;
-
-                    } else {
-                        librariesConfig = dependenciesInfo;
-                        if (!librariesConfig || (!_typedas.isArray(librariesConfig))) {
-                            librariesConfig = librariesDefault;
-
-                        } else {
-                            libIdx= 0;
-                            rmIdx=-1;
-
-                            librariesConfig.forEach(function(item) {
-                                if (item === "cat") {
-                                    rmIdx = libIdx;
-                                }
-                                libIdx++;
-                            });
-
-                            // remove "cat" if was found
-                            if (rmIdx > -1) {
-                                librariesConfig.splice(rmIdx, 1);
-                            }
-
-                            // set "cat" to be last
-                            librariesConfig.push("cat");
-                        }
-                    }
-
-                    //librariesConfig.unshift("cat.css");
-                    //librariesConfig.push("cat.src.js");
-
-                    project.setInfo("dependencies", librariesConfig);                                                  
-                    
-                    libraryBuildConfig = {
-                        "name": "p@libraries.build",
-                        "type": "libraries",
-                        "dependency": "manager",
-                        "imports": librariesConfig,
-                        "action": "build"
-                    };
-                    customPlugins.push(libraryBuildConfig);
-
-                    project.appendEntity("plugins", customPlugins);
-
-
-                } else {
-                    _log.warning(_props.get("cat.project.env.failed").format("[CAT Config Loader]"));
-                }
-            }
-
-        }
-    };
-
-    /**
-     *  Sync configuration for a single task.
-     *  e.g. scan that applied for scanning a deep folder gets to process one file.
-     *
-     * @param config
-     */
-    _CATConfig.prototype.watch = function(config) {
-        this._watch.impl = config.impl;
-    };
-
-    _CATConfig.prototype.getWatch = function() {
-        return this._watch.impl;
-    };
-
-    _CATConfig.prototype.isWatch = function() {
-        return (this._watch.impl ? true : false);
-    };
-
-    _CATConfig.prototype.getExtension = function (key) {
-        if (key && this._extmap) {
-            return this._extmap[key];
-        }
-    };
-
-    /**
-     *  TODO move any externalConfig direct access properties to use this function
-     *
-     * @returns {*}
-     */
-    _CATConfig.prototype.getProject = function () {
-        if ( this.externalConfig) {
-            return  this.externalConfig.project;
-        }
-    };
-
-    /**
-     *  TODO move any externalConfig direct access properties to use this function
-     *
-     * @returns {*}
-     */
-    _CATConfig.prototype.getGrunt = function () {
-        if ( this.externalConfig) {
-            return  this.externalConfig.grunt;
-        }
-    };
-
-    /**
-     *  TODO move any externalConfig direct access properties to use this function
-     *
-     * @returns {*}
-     */
-    _CATConfig.prototype.getEmitter = function () {
-        if ( this.externalConfig) {
-            return  this.externalConfig.emitter;
-        }
-    };
-
-
-/**
- * Load cat.json internal configuration file
- * CAT configuration include the internal extensions meta data.
- *
- * @param externalConfig
- * @param path
- * @returns {*}
- * @private
- */
-_loadCATConfig = function (externalConfig, path) {
-
-    try {
-        (new _fsconfig(path, function (data) {
-            if (data) {
-
-                _catconfig = new _CATConfig(externalConfig, data);
-
-            } else {
-                _log.error(_props.get("cat.error.config").format("[CAT Config Loader]"));
-            }
-        }));
-    } catch (e) {
-        _log.error(_props.get("cat.error.config").format("[CAT Config Loader]"), e);
-    }
-
-    return _catconfig;
-};
-
-
-module.exports = function () {
-
-    return {
-        /**
-         * Loading internal CAT configuration
-         *
-         * @param externalConfig The configuration to be passed for all config classes
-         *      - emitter The emitter reference
-         *      - grunt The grunt reference
-         *      - project The current running project
-         */
-        load: function (externalConfig) {
-
-            var path = [cathome, "resources/cat.json"].join("/");
-
-            return _loadCATConfig(externalConfig, path);
-        }
-    };
-}();
\ No newline at end of file
diff --git a/src/module/config/project/Filter.js b/src/module/config/project/Filter.js
index ac94b19..e3c6e02 100644
--- a/src/module/config/project/Filter.js
+++ b/src/module/config/project/Filter.js
@@ -5,9 +5,8 @@ module.exports = function (config) {
     var me = this;
 
     if (config) {
-        this.type = (config.type || undefined);
+        this.type = (config.type || "*"); // * || file || folder
         this.pattern = (config.pattern || undefined);
-        this.ext = (config.ext || undefined);
         this.exclude = (config.exclude || undefined);
 
         this.apply = function (callback) {
diff --git a/src/module/extension/Base.js b/src/module/extension/Base.js
index 8b1e85d..53c124e 100644
--- a/src/module/extension/Base.js
+++ b/src/module/extension/Base.js
@@ -1,5 +1,9 @@
 var _log = catrequire("cat.global").log(),
-    _props = catrequire("cat.props");
+    _props = catrequire("cat.props"),
+    _ = require("underscore"),
+    _path = require("path"),
+    _fs = require("fs"),
+    _minimatch = require("minimatch");
 
 /**
  * Abstract Base extension functionality
@@ -26,6 +30,7 @@ module.exports = function () {
             if (config.internalConfig) {
                 pluginHandle = config.internalConfig.pluginHandle;
                 this._data = (pluginHandle ? pluginHandle.data : undefined);
+                this._plugin = (pluginHandle ? pluginHandle : undefined);
             }
         };
 
@@ -77,6 +82,82 @@ module.exports = function () {
             return this._mode;
         };
 
+        /**
+         * Filters for excluding/include file extensions
+         *
+         *  "filters": [{ 
+         *     "type": "*",
+         *     "pattern": ["/cat-project"],
+         *     "exclude": true
+         *  }]
+         *          
+         * @param filters
+         * @param file The reference object of type file|folder
+         * @isdirectory {String} [optional] * || file || folder 
+         * 
+         * @returns {boolean} true filter match or else false
+         */
+        proto.applyFilters = function (filters, file, isdirectory) {
+
+            var exitCondition = 0;
+
+            function patternMatch() {
+                
+                if (!this.pattern) {
+                    return false;
+                }
+                var size = this.pattern.length, idx = 0, 
+                    item
+
+                for (; idx < size; idx++) {
+                    
+                    item = this.pattern[idx];
+                    if (_minimatch(file, item, { matchBase: true })) {
+                        return true;
+                    }
+                    
+                }
+                return false;
+            }
+            
+
+            if (file && filters && _.isArray(filters)) {
+
+                filters.forEach(function (filter) {
+                    if (filter) {
+                        filter.apply(function () {
+                            
+                            var isPattern;
+                            
+                            if (this.type === isdirectory || this.type === "*") {
+                                
+                                // take the parent into the condition
+                                if (this.pattern) {
+                                    isPattern = patternMatch.call(this);
+                                    if (!isPattern) {
+                                        return undefined;
+                                    }
+                                }
+
+                                if (!this.exclude) {
+                                    exitCondition = 0;
+                                } else {
+                                    exitCondition = 1;
+                                }
+                            }
+                        });
+                    }
+                });
+
+                if (exitCondition > 0) {
+                    return true;
+                }
+
+            }
+
+            return false;
+        };
+
     };
 
     return {
diff --git a/src/module/extension/scan/action.js b/src/module/extension/scan/action.js
index bc9660d..73fa6da 100644
--- a/src/module/extension/scan/action.js
+++ b/src/module/extension/scan/action.js
@@ -43,23 +43,42 @@ module.exports = _basePlugin.ext(function () {
 
                         file = dir + '/' + file;
                         file = file.split("//").join("/");
+                        
                         _fs.stat(file, function (err, stat) {
+                            
+                            var validfilter;
+                            
+                            if (err) {
+                                _utils.error("[scan extension] Error occur while scanning the file system, error", err);
+                            }
+                                                        
                             if (stat && stat.isDirectory()) {
-                                // On Directory
-                                _emitter.emit("scan.folder", file);
-                                //_log.debug("[SCAN] folder: " + file);
-                                walk(file, function (err, res) {
-                                    //results = results.concat(res);
-                                    //copyAction.folder(res);
+                                
+                                validfilter = _me.applyFilters(_me._plugin.filters, file, "folder");
+                                if (validfilter) {
                                     next();
-                                });
+                                    
+                                } else {
+                                
+                                    // On Directory
+                                    _emitter.emit("scan.folder", file);
+                                    walk(file, function (err, res) {
+                                        next();
+                                    });
+                                }
+                                
                             } else {
-                                // On File
-                                //copyAction.file(file);
-                                _emitter.emit("scan.file", file);
-                                //_log.debug("[SCAN] file: " + file + "; ext: " + _path.extname(file));
-                                results.push(file);
-                                next();
+                                
+                                validfilter = _me.applyFilters(_me._plugin.filters, file, "file");
+                                if (validfilter) {
+                                    next();
+                                    
+                                } else {
+                                    // On File
+                                    _emitter.emit("scan.file", file);
+                                    results.push(file);
+                                    next();
+                                }                                
                             }
                         });
                     })();
@@ -123,16 +142,15 @@ module.exports = _basePlugin.ext(function () {
                 _me.apply(config);
                 data = _me._data;
 
-                if (data.path) {
+                if (data && data.path) {
                     dir = data.path;
 
                 } else {
                     dir = config.path;
                 }
 
-
                 if (!dir) {
-                    _utils.error(_props.get("cat.error.config").format("[scan ext]"));
+                    _utils.error(_props.get("cat.error.config").format("[scan extension]"));
                 }
                 _walk(dir);
             },
diff --git a/src/module/plugin/Base.js b/src/module/plugin/Base.js
index a4233b4..cd14524 100644
--- a/src/module/plugin/Base.js
+++ b/src/module/plugin/Base.js
@@ -109,84 +109,6 @@ module.exports = function () {
 
             return true;
         };
-
-        /**
-         * Filters for excluding/include file extensions
-         *
-         * @param filters
-         * @param typeObj The reference object of type file|folder
-         * @returns {boolean}
-         */
-        proto.applyFileExtFilters = function (filters, typeObj) {
-
-            var exitCondition = 0,
-                me = this;
-
-            function patternMatch() {
-                if (!this.pattern) {
-                    return false;
-                }
-                var size = this.ext.length, idx = 0, item;
-
-                for (; idx<size; idx++) {
-                    item = this.pattern[idx];
-                    if (_minimatch(typeObj, item, { matchBase: true })) {
-                        return true;
-                    }
-                }
-                return false;
-            }
-
-            function extMatch() {
-
-                if (!this.ext) {
-                    return undefined;
-                }
-                var extName = _path.extname(typeObj),
-                    size = this.ext.length, idx = 0, item,
-                    isPattern;
-
-                for (; idx<size; idx++) {
-                    item = this.ext[idx];
-                    if ( (item === extName || item === "*") ) {
-
-                        // take the parent into the condition
-                        if (this.pattern) {
-                            isPattern = patternMatch.call(this);
-                            if (!isPattern) {
-                                continue;
-                            }
-                        }
-
-                        if (!this.exclude) {
-                            exitCondition = 0;
-                        } else {
-                            exitCondition = 1;
-                        }
-
-                    }
-                }
-            }
-
-            if (typeObj && filters && _typedas.isArray(filters)) {
-
-                filters.forEach(function (filter) {
-                    if (filter) {
-                        filter.apply(function () {
-                            extMatch.call(this);
-                        });
-                    }
-                });
-
-                if (exitCondition > 0) {
-                    return true;
-                }
-
-            }
-
-            return false;
-        };
-
     }
 
     return {
diff --git a/src/module/plugin/copy.js b/src/module/plugin/copy.js
index c2655ed..8a885c3 100644
--- a/src/module/plugin/copy.js
+++ b/src/module/plugin/copy.js
@@ -110,18 +110,15 @@ module.exports = _basePlugin.ext(function () {
             }
             if (file) {
                 from = _getRelativeFile(file);
-
-                if (!_me.applyFileExtFilters(filters, file)) {
-
-                    _utils.copySync(file, _path.normalize(_to + "/" + from), function (err) {
-                        if (err) {
-                            _log.error("[copy action] failed to copy file: " + file + "err: " + err);
-                            throw err;
-                        }
-                    });
-
-
-                }
+                
+                _utils.copySync(file, _path.normalize(_to + "/" + from), function (err) {
+                    if (err) {
+                        _log.error("[copy action] failed to copy file: " + file + "err: " + err);
+                        throw err;
+                    }
+                });
+    
+    
             }
 
             _emitter.emit("job.copy.wait", {status: "wait"});
diff --git a/src/module/plugin/minify.js b/src/module/plugin/minify.js
index 0d33a1b..db418e3 100644
--- a/src/module/plugin/minify.js
+++ b/src/module/plugin/minify.js
@@ -208,8 +208,12 @@ module.exports = _basePlugin.ext(function () {
                                 jshint: jshint
                             });
                         }
+                    } else {
+                        _fs.writeFileSync(_path.join(path, name), "",  { mode: 0777 })
                     }
                 } else {
+                    
+                    
                     _log.error("[CAT clean plugin] 'src' property is required ");
                 }
 
diff --git a/src/module/plugin/scrap.js b/src/module/plugin/scrap.js
index 099759d..98be45b 100644
--- a/src/module/plugin/scrap.js
+++ b/src/module/plugin/scrap.js
@@ -101,53 +101,47 @@ module.exports = _basePlugin.ext(function () {
                 return undefined;
             }
             if (file) {
-                from = _utils.getRelativePath(file, _basePath);
-                //_log.debug("[scrap Action] scan file: " + from);
-
-                if (!_me.applyFileExtFilters(filters, file)) {
-                    if (!_parsers["Comment"]) {
-                        _parsers["Comment"] = _parser.get("Comment");
-                    }
-                    _parsers["Comment"].parse({file: file, callback: function (comments) {
-
-                        var scrapComment,
-                            scrap, scraps, scrapObjs=[],
-                            size = 0, idx = 0;
-
-                        if (comments && _typedas.isArray(comments)) {
-
-                            scraps = _extractValidScrapRoot(comments);
-                            if (scraps && _typedas.isArray(scraps) && scraps.length > 0) {
-                                size = scraps.length;
-                                for (idx = 0; idx < size; idx++) {
-                                    scrapComment = scraps[idx];
-                                    scrap = _Scrap.create({
-                                        file: file,
-                                        scrapComment: scrapComment
+         
+                if (!_parsers["Comment"]) {
+                    _parsers["Comment"] = _parser.get("Comment");
+                }
+                _parsers["Comment"].parse({file: file, callback: function (comments) {
+
+                    var scrapComment,
+                        scrap, scraps, scrapObjs=[],
+                        size = 0, idx = 0;
+
+                    if (comments && _typedas.isArray(comments)) {
+
+                        scraps = _extractValidScrapRoot(comments);
+                        if (scraps && _typedas.isArray(scraps) && scraps.length > 0) {
+                            size = scraps.length;
+                            for (idx = 0; idx < size; idx++) {
+                                scrapComment = scraps[idx];
+                                scrap = _Scrap.create({
+                                    file: file,
+                                    scrapComment: scrapComment
+                                });
+
+                                if (scrap) {
+                                    scrapObjs.push(scrap);
+
+                                    _Scrap.apply({
+                                        basePath: _basePath,
+                                        scraps: [scrap],
+                                        apply: true
                                     });
-
-                                    if (scrap) {
-                                        scrapObjs.push(scrap);
-
-                                        _Scrap.apply({
-                                            basePath: _basePath,
-                                            scraps: [scrap],
-                                            apply: true
-                                        });
-                                    }
                                 }
-                                _Scrap.normalize(scrapObjs);
                             }
-
+                            _Scrap.normalize(scrapObjs);
                         }
 
-                        _emitter.emit("job.scrap.wait", {status: "wait"});
+                    }
 
-                    }});
-                } else {
-                    //_log.debug("[Copy Action] filter match, skipping file: " + from);
                     _emitter.emit("job.scrap.wait", {status: "wait"});
-                }
+
+                }});
+            
             }
         },
 
diff --git a/src/plugins/scrap-common.js b/src/plugins/scrap-common.js
index 076c878..b7061bc 100755
--- a/src/plugins/scrap-common.js
+++ b/src/plugins/scrap-common.js
@@ -690,12 +690,15 @@ module.exports = function () {
                             if (basedirsplit[basedirsplit.length - 1] === "cat") {
                                 basedirsplit.pop();
                                 basedir = basedirsplit.join("/");
-                            } else {
-                                value = basedir + "cat/cat.js"
                             }
 
+                            // set the base directory according to the cat.js path
                             basedir += "/";
 
+                            // override the cat.js file path
+                            value = basedir + "cat/cat.js"
+
+
                             libs.forEach(function (lib) {
                                 if (lib.path.indexOf("cat.src") === -1) {
                                     libsrcs.push([basedir, lib.path].join(""));
