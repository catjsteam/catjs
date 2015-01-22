var _npmpath = require("path"),
    _fs = require("fs.extra"),
    _global = catrequire("cat.global"),
    _log = _global.log(),
    _ = require("underscore");

module.exports = function () {

    var _manifest,
        _name = "manifest.json",
        _path,

        _Manifest = function (manifest) {

            var me = this;

            function _Library(config) {

                var library;
                if (config && config.item) {
                    library = config.item;

                    this.data = library;
                    this.base = library.base;
                    this.name = library.name;
                    this.prod = library.prod;
                    this.dev = library.dev;
                    this.exports = ("exports" in library ? library.exports : undefined);
                    this.deps = ("deps" in library ? library.deps : undefined);
                    this.globals = ("globals" in library ? library.globals : undefined);
                    this.install = library.install;
                }
            }

            _Library.prototype.isStatic = function() {
                if (this.install === "static") {
                    return true;
                }  
                return false;
            };
            
            /**
             * Note: currently support only for static (probably the only type that will be supported)
             * TODO In case more types will be added to the manifest.json add the proper functionality...
             */
             _Library.prototype.getFileNames = function() {
                 var result;
                 
                 function _getNames(entity, files) {
                     var names = [];
                     
                     if (files) {
                         files.forEach(function(item) {
                             var startpos;
                             if (item && _.isString(item)) {

                                 startpos = item.lastIndexOf("/");
                                 startpos +=1;
                                 item = item.substring(startpos, item.length);
                                 
                                 if (item) {
                                     names.push(_npmpath.join(entity.name, item));
                                 }
                             }
                         });
                     }
                     
                     return names;
                 }
                 
                 if (this.isStatic) {
                     if (me.getMode() === "dev") {
                         result = _getNames(this, this.dev);
                     } else {
                         result = _getNames(this, this.prod);
                     }
                 }
                 
                 return result;
            };
            
            function __init() {

                var libs;               

                me._ = manifest;
                me._libs = [];
                me._libsmap = {};
                libs = me._.libraries;

                if (libs) {
                    libs.forEach(function (item) {
                        var lib;
                        if (item) {
                            lib = new _Library({
                                item: item
                            });
                            
                            if (lib.name) {
                                me._libs.push(lib);
                                me._libsmap[lib.name] = lib;
                            } else {
                                _log.error("[cat manifest] Library name is not valid ");
                            }
                        }
                    });
                }

            }

            if (manifest) {
                __init();
            }
        };

    _Manifest.prototype.getLibraries = function () {
        return (this._libs || []);
    };

    _Manifest.prototype.getLibrary = function (name) {
        return (name && this._libsmap ? this._libsmap[name] : undefined);
    };

    _Manifest.prototype.getMode = function () {
        return (this._.mode || "dev");
    };

    _Manifest.prototype.getDetails = function () {
        return (this._.out);
    };

    _Manifest.prototype.getFileName = function () {
        return (_name);
    };

    _Manifest.prototype.getFilePath = function () {
        return (_path);
    };

    _Manifest.prototype.size = function () {
        return this._libs.length;
    };

    return {

        init: function () {

            var manifestFileName = "manifest.json", manifest,
                _path = _npmpath.join(global.catlibs, manifestFileName);

            if (!_manifest) {
                
                if (_path && _fs.existsSync(_path)) {
                    manifest = _fs.readFileSync(_path, "utf8");
    
                    if (manifest) {
                        manifest = JSON.parse(manifest);
                        _manifest = new _Manifest(manifest);
                    }
                }
            }
            
            return _manifest;
        },

        _: _manifest

    };

}();