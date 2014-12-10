var _Scrap = catrequire("cat.common.scrap"),
    _scrapEnum = _Scrap.getScrapEnum(),
    _utils = catrequire("cat.utils"),
    _tplutils = catrequire("cat.tpl.utils");

/**
 * Process a single line according to a given info by line.
 */
module.exports = function(config) {

    var content,
        scrapCtxArguments,
        scraplcl = config.scraplcl,
        injectinfo = config.injectinfo,
        lineNumber = config.lineNumber,
        line = config.line.line,
        info = config.info,
        replaceinfo = config.replaceinfo,
        prevCommentInfo,
        param1,
        engine = scraplcl.$getEngine();

    function removeOldCall() {
        var startpos, endpos;

        if (injectinfo && injectinfo.start) {
            startpos = [injectinfo.start.line, injectinfo.start.col];
            endpos = [injectinfo.end.line, injectinfo.end.col];

            if (lineNumber === startpos[0]) {
                config.line.line = [line.substring(0, startpos[1]), line.substring(endpos[1])].join("");
            }
        }
    }
    
    function setActualMeArg(param1) {
        // me === this
        if (param1 && param1[1]) {
            if (param1[1].split) {
                param1[1] = param1[1].split("thi$").join("this");
            } else if (param1[1] === "thi$") {
                param1[1] = "this";
            }
        }
    }

    scrapCtxArguments = scraplcl.generateCtxArguments();
    param1 = [JSON.stringify({ "pkgName": scraplcl.getPkgName()})];

    // add context arguments if exists
    if (scrapCtxArguments && scrapCtxArguments.length > 0) {
        param1 = param1.concat(scrapCtxArguments);
        setActualMeArg(param1);
    }
    // we need to reevaluate the injected calls
    if (injectinfo) {
        removeOldCall();
    }

    if (replaceinfo) {
        return undefined;
    }

    if (engine === _scrapEnum.engines.JS) {
        // JS file type call
        content = _tplutils.template({
                name: "scrap/_cat_call",
                data: {param1: param1.join(",")}
            }
        );
        content = (_utils.prepareCode(content) || "");

    } else if (engine === _scrapEnum.engines.HTML_EMBED_JS) {
        // Embed Javascript block for HTML file
        content = _tplutils.template({
                name: "scrap/_cat_embed_js",
                data: {param1: param1.join(",")}
            }
        );

    } else if (engine === _scrapEnum.engines.HTML_IMPORT_JS) {

        content = scraplcl.generate();
        //content = (_utils.prepareCode(content) || "");

    } else if (engine === _scrapEnum.engines.JS_EMBED_INSERT) {
        content = scraplcl.generate();
        content = (_utils.prepareCode(content) || "");

    } else if (engine === _scrapEnum.engines.HTML_EMBED_INSERT) {

        // Inject the scrap line to the file untouched
        content = scraplcl.generate();
        content = (_utils.prepareCode(content) || "");

    }

    if (prevCommentInfo) {
        config.line.line = [line.substring(0, prevCommentInfo.end.col), content , line.substring(prevCommentInfo.end.col, line.length)].join("");
    } else {
        config.line.line = [line.substring(0, info.col), content , line.substring(info.col, line.length)].join("");
    }

    /*
     *  In case we already injected content related to that comment.
     *  We can get more than one scrap per comment.
     *  Get the last injected call info.
     */
    if (prevCommentInfo) {
        prevCommentInfo = {start: {line: lineNumber, col: prevCommentInfo.end.col}, end: {line: lineNumber, col: (prevCommentInfo.end.col + content.length)}};
    } else {
        prevCommentInfo = {start: {line: lineNumber, col: info.col}, end: {line: lineNumber, col: (info.col + (content ? content.length: 0))}};
    }
    scraplcl.set("injectinfo", prevCommentInfo);
};