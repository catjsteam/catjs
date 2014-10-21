var _npmpath = require("path"),
    _fs = require("fs.extra"),
    _log = _catglobal.log();

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
                    this.install = library.install;
                }
            }
            
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
        return (this._.mode);
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

            if (_path && _fs.existsSync(_path)) {
                manifest = _fs.readFileSync(_path, "utf8");

                if (manifest) {
                    manifest = JSON.parse(manifest);
                    _manifest = new _Manifest(manifest);
                }
            }

            return _manifest;
        },

        _: _manifest

    };

}();