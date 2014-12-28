var _fs = require("fs.extra"),
    _path = require("path");
    
/**
 * CatJS System Utilities
 *
 * @type {module.exports}
 */
module.exports = function () {

    var _module = {

        getFoldersCount: function(path) {

            var counter= 0,
                folders = ( (path && path.split) ? path.split(_path.sep) : undefined);
            
            if (folders) {
                folders.forEach(function(item) {
                    if (item) {
                        counter++;
                    }
                })
                
            }                        
            
            return counter;
        },

        /**
         * Grant permission to a path with folder offset
         * e.g. /home/myhome/test offet:2 will apply chmod only for myhome/test folders
         *
         * @param path {String} The path
         * @param mode {Number} The mode e.g. 0777
         * @param offset {Number} The offset of the folders to grant permission. From the end of the path
         */
        chmodSyncOffset: function (path, mode, offset) {
            var folders = ((path && path.split) ? path.split(_path.sep) : undefined), patharr,
                i = 0, size = offset + 1;

            if (folders) {
                for (; i < size; i++) {
                    patharr = folders.slice(0, (folders.length - i));
                    path = patharr.join(_path.sep);
    
                    try {
                        _fs.chmodSync(path, mode);
                    } catch(e) {
                        console.warn("[catjs utils chmodSyncOffset] failed to grant permissions: ", e);
                    }
                }
            } else {
                console.warn("[catjs utils chmodSyncOffset] failed to grant permissions: path is not valid '", path, "'");
            }
        },
        
        getCatProjectPath: function() {
            var global = catrequire("cat.global"),
                workpath = global.get("home").working.path;
                 console.log(" working path ", _path.resolve(workpath));      
            return workpath;
        },
        
        /**
         * Create the basic skeleton system folders (e.g. logs, cache .. etc)
         *
         * @param folder
         * @param verify {Boolean} Make sure that the path includes "cat-project"
         * @returns {*}
         */
        createSystemFolder: function (folder, verify) {


            var catprojectpath = _module.getCatProjectPath(),
                targetfolder = _path.join(catprojectpath, folder),
                pathitems;

            if (verify === undefined) {
                verify = false;
            }
            if (verify) {
                pathitems = catprojectpath.split(_path.sep);
                if ( !(catprojectpath && pathitems && pathitems[pathitems.length-1] === "cat-project") ) {
                   return undefined;
                }
            }

            // create log folder
            if (!_fs.existsSync(targetfolder)) {
                _fs.mkdirSync(targetfolder, 0777);
                _fs.chmodSync(targetfolder, 0777);
            }

            return targetfolder;
        }
    };
    
    return _module;

}();