var _utils = catrequire("cat.utils");

module.exports = function () {

    var _baseEnum = {
        "_info": {
            start: {
                line: -1,
                    col: -1
            },
            end: {
                line: -1,
                    col: -1
            }
        }
    }, _enum = {

        open: "@[",
            close: "]@",
            single: "@@",
            name: "scrap",

            "injectinfo": _baseEnum["_info"],
            "scrapinfo": _baseEnum["_info"],

            // single type scrap item, cannot accept more than one value
            singleTypes: ["name"],

            // supported file types
            fileTypes: ["js", "html", "*"],

            /*
             *  js      - javascript
             *  htmlijs - html import javascript
             *  htmlejs - html embed javascript
             */
            engines: {
                JS: "js",
                HTML_IMPORT_JS: "htmlijs",
                HTML_EMBED_JS: "htmlejs",
                HTML_EMBED_INSERT: "stringinsert"
            },

            // default file type
            defaultFileType: "js"
    };


    return {

        getScrapEnum: function (key, obj) {

            _utils.copyObjProps(_enum[key], obj);

            return obj;
        },

        scrapEnum: _enum



    };

}();