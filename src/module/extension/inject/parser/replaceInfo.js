var _Scrap = catrequire("cat.common.scrap"),
    _scrapEnum = _Scrap.getScrapEnum();

/**
 * Process replace info
 */
module.exports =  function(config) {
        
    var markDefault = {
        prefix: "/*",
        suffix: "*/"
    }, mark,
        lines = config.lines,
        line = config.line,
        scraplcl = config.scraplcl,      
        lineNumber = config.lineNumber,
        replaceinfo = config.replaceinfo,
        engine = scraplcl.$getEngine();

    if (scraplcl.$getBehavior()) {

        if (engine === _scrapEnum.engines.JS) {
            // JS file type call
            mark = markDefault;

        } else if (engine === _scrapEnum.engines.JS_EMBED_INSERT) {
            // Embed Javascript block for JS file
            mark = markDefault;

        } else if (engine === _scrapEnum.engines.HTML_EMBED_JS) {
            // Embed Javascript block for HTML file
            mark = markDefault;

        }

        return replaceinfo.apply({lines: lines, line: line, row: lineNumber, mark: mark});
    }

    return undefined;
};    