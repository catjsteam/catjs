var _Row = require("./Row.js"),
     _utils = catrequire("cat.utils"),
    _codeutils = catrequire("cat.code.utils"),
    _tmr = require("test-model-reporter"),
    _project = catrequire("cat.project"),
    _path = require("path"),
    _fs = require("fs"),
    _underscore = require("underscore");

function Jasmine(config) {

    this._rows = [];

    if (!config) {
        throw new Error('[catjs Jasmine class] config argument is not valid ');
    }
    _utils.prepareProps({
        global: {obj: config},
        props: [
            {key: "printer", require: true}
        ]
    });

    this._printer = config.printer;
}

/**
 *
 * @param row {Object}
 *          scrapname {String} The scrap name
 *          name {String} The scrap type
 *          data {Object} The scrap data rows
 *
 */
Jasmine.prototype.add = function (row) {
    var data = row.data,
        me = this;
    if (data) {

        if (!_underscore.isArray(data)) {
            data = [data];
        }

        data.forEach(function(item){
            if (item) {
                me._rows.push(new _Row({
                    data:item,
                    name: row.name,
                    scrapname: row.scrapname
                }));
            }
        });
    }

};

Jasmine.prototype.apply = function(scraps) {
    
    if (scraps) {
        // generate jasmine data
        scraps.forEach(function(scrap) {
            if (scrap) {
                scrap.jasmineprinter.generate();
            }
        });
    }
}

/**
 * Process tnd flush the data
 *
 */
Jasmine.prototype.flush = function () {

    var obj = {},
        key, items, tmroot, tmlastdescribe, out, valid, filename;   
    
    function _getFilename(model) {
        var title = model.get("title");
        if (title) {
            return [title.trim().toLowerCase().split(" ").join("_"), ".js"].join("");
        }
    }

    function _getFilePath() {
        var filename = _getFilename(tmroot),
            sourcepath = _project.getInfo("source"),
            path;

        if (filename && sourcepath) {
            return _path.join(sourcepath, "specs", filename);
        }
    }

    _tmr.setReporter("jasmine");

    this._rows.forEach(function (row) {
        if (row) {

            if (!obj[row.scrapname]) {
                obj[row.scrapname] = [];
            }

            obj[row.scrapname].push(row);
        }
    });

    for (key in obj) {
        if (obj.hasOwnProperty(key)) {
            items = obj[key];
            if (items) {
                items.forEach(function (item) {
                    var title, tmpcreate;

                    if (item) {
                        if (item.name === "describe") {
                            title = item.data;
                            title = _codeutils.cleanDoubleQuotes(title);
                            tmpcreate = _tmr.create({
                                type: "model.jas.describe",
                                data: {
                                    title: title
                                }
                            });

                            if (!tmroot) {
                                tmroot = tmpcreate;
                                tmlastdescribe = tmroot; 
                            } else {
                                tmlastdescribe.add(tmpcreate);
                                tmlastdescribe = tmpcreate;                                
                            }
                        } else if (item.name === "it") {
                            title = item.data;
                            title = _codeutils.cleanDoubleQuotes(title);
                            tmlastdescribe.add(_tmr.create({
                                type: "model.jas.it",
                                data: {
                                    title: title
                                }
                            }));
                        }
                    }
                });
            }
        }
    }

    if (tmroot) {

        valid = _tmr.validate(tmroot);
        if (valid) {
            out = tmroot.compile();
            filename = _getFilePath();

            if (!_fs.existsSync(filename)) {
                _tmr.write(filename, out);
            }
        }
    } else {
        // console.log("flush: NA");
    }
};


module.exports = Jasmine; 

