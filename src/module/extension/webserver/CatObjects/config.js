var _global = catrequire("cat.global"),
    _log = _global.log(),
    _fs = require("fs"),
    _catcli = (catrequire ? catrequire("cat.cli") : null);

function _read() {

    // read configuration
    var path = require("path"),
        configPath,
        data,
        project, sourceFolder;

    if (_catcli) {
        project = _catcli.getProject();
        if (project) {
            try {
                sourceFolder = project.getInfo("source");
                configPath = path.join(sourceFolder, "/config/cat.json");

            } catch (e) {
                _log.error("[catjs server (assert module)] Failed to load cat.json test project, No CAT test project is available.", e);
            }
        } else {
            _log.error("[catjs server (assert module)] Failed to load cat.json test project, No CAT project is available.");
        }
    }

    data = _fs.readFileSync(configPath, 'utf8');
    return JSON.parse(data);

}

module.exports = function () {

    return {
        get: function () {
            return _read();
        }
    };

}();