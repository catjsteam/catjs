var _Scrap = catrequire("cat.common.scrap"),
    _scrapEnum = _Scrap.getScrapEnum(),
    _tplutils = catrequire("cat.tpl.utils"),
    _extutils = catrequire("cat.ext.utils"),
    _project = catrequire("cat.project");

module.exports = function (scraps, sourcefile, targetfile) {

    /* @Obsolete - user code is being refactored [WIP] 
    

    var outputjs = [],
        projectTarget = _project.getInfo("target");

    scraps.forEach(function (scrap) {
        var out,
            engine = scrap.$getEngine(),
            pkgName;

        if (engine === _scrapEnum.engines.JS ||
            engine === _scrapEnum.engines.HTML_EMBED_JS) {

            pkgName = _extutils.getUserInfo({scrap: scrap, file: sourcefile, basepath: projectTarget}).pkgName;
            scrap.set("pkgName", pkgName);

            out = _tplutils.template({
                    name: "scrap/_func_user",
                    data: {name: _extutils.getUserInfo({scrap: scrap, file: sourcefile, basepath: projectTarget}).pkgName,
                        func: "" }
                }
            );

            outputjs.push(out);

        }
    });

    return {
        output: outputjs.join(""),
        file: _extutils.getUserInfo({file: targetfile}).file
    };

    */
};
