var _date = require("date-format-lite"),
    _global = catrequire("cat.global"),
    _log = _global.log(),
    _path = require("path"),
    _utils = catrequire("cat.utils"),
    _sysutils = catrequire("cat.sys.utils"),
    _fs = require("fs"),
    _wrench = require("wrench"),
    _devicentity = require("./entity/Device.js"),
    _screenshotentity = require("./entity/Screenshot.js"),
    _deviceinfoentity = require("./entity/Deviceinfo.js"),
    _Generic = require("./entity/Generic.js"),
    _geneic = new _Generic();

module.exports = function () {

    function _getTimeFolder() {
        return (new Date()).format("DD-MM-YYYY");
    }

    function _getEntityRecord(entity) {
        var map = {
            device: _devicentity,
            screenshot : _screenshotentity,
            deviceinfo : _deviceinfoentity,
            junit: _geneic,           
            runner: function () {
                console.log("[catjs runner info] Not implemented yet");
            }

        };

        return (entity ? map[entity] : undefined);
    }
    
    function _updateFS(config) {

        var name, path, filename,
            entity, data;

        if (!config) {
            return undefined;
        }

        _utils.prepareProps({
            global: {obj: config},
            props: [
                {key: "name"},
                {key: "path"},
                {key: "entity"},
                {key: "data"}
            ]
        });

        name = config.name;
        path = config.path;
        entity = config.entity;
        data = config.data;

        if (!_fs.existsSync(path)) {
            _wrench.mkdirSyncRecursive(path, 0777);
        }
        _sysutils.chmodSyncOffset(path, 0777, 3);


        entity = _getEntityRecord(entity);
        if (entity) {
            filename = _path.join(path, name);
            entity.update(filename, data);

        } else {
            _utils.error("[catjs info] 'entity' is not valid");
        }
    }

    function _getFileSystemInfo(config) {

        var id, type, device, entity, model, name, fileType, filename,
            time, basepath, path;

        if (!config) {
            return undefined;
        }

        id = _utils.getProp({key: "id", obj: config});
        type = _utils.getProp({key: "type", obj: config});
        device = _utils.getProp({key: "device", obj: config});
        entity = _utils.getProp({key: "entity", obj: config});
        model = _utils.getProp({key: "model", obj: config});
        filename = _utils.getProp({key: "filename", obj: config});


        if (type && device && entity) {
            name = [entity, device, type];
            if (model) {
                name.push(model);
            }

            if (entity === "screenshot") {
                fileType = ".png";
            } else if  (entity === "junit") {
                fileType = ".xml";
            } else {
                    fileType = ".json"
                    };

            name = (filename ? filename : name.join("_")) + fileType;
            name = name.toLowerCase();
        } else {
            _utils.error("[catjs info] Failed to generate the file system path for the test report, some of the arguments are missing or not exists");
            return undefined;
        }

        time = _getTimeFolder();
        basepath = _sysutils.getCatProjectPath();

        if (id) {
            path = _path.join(basepath, "reports", time, id);

        } else {
            _utils.error("[catjs info] Failed to generate the file system path for the test report, 'id' argument is nod valid or not exists ");
            return undefined;
        }

        return {name: name, path: path};
    }

    return {

        /**
         * Creates Report folder with: device | runner info
         * e.g. 1-1-2014/_ID_/info_device_android.json
         *
         * @param config
         *          id {String} the test id
         *          device {String} device type: browser | device
         *          type {String} available types: android | ios
         *          entity {String} available entities: info | test
         *          data {Object} the data that should be set to the file
         *
         * @returns {undefined}
         */
        updateFS: function (config) {


            if (!config) {
                return undefined;
            }

            var fsinfo = _getFileSystemInfo(config),
                entity = _utils.getProp({key: "entity", obj: config}),
                data = _utils.getProp({key: "data", obj: config});

            if (fsinfo) {

                fsinfo.entity = entity;
                fsinfo.data  = data;
                _updateFS(
                    fsinfo
                );
            }

        }

    };

};