var _Scrap = catrequire("cat.common.scrap"),
    _scrapEnum = _Scrap.getScrapEnum(),
    _tplutils = catrequire("cat.tpl.utils"),
    _extutils = catrequire("cat.ext.utils");


module.exports = function _generateCATFileInfo(scraps, sourcefile, targetfile) {

    var outputjs = [],
        projectTarget = this._project.getInfo("target");

    scraps.forEach(function (scrap) {

        var printer,
            runat,
            managerout,
            pkgname,
            engine = scrap.$getEngine(),
            args = scrap.get("arguments"),
            scrapvar;

        if (engine === _scrapEnum.engines.JS ||
            engine === _scrapEnum.engines.HTML_EMBED_JS) {

            runat = scrap.get("run@");
            pkgname = _extutils.getCATInfo({scrap: scrap, file: sourcefile, basepath: projectTarget}).pkgName;
            scrap.set("pkgName", pkgname);

            pkgname = [pkgname, "cat"].join("$$");
            scrapvar = ["{ scrap:", JSON.stringify(scrap.serialize()), "}"].join("");

            if (runat) {
                managerout = _tplutils.template({
                        name: "scrap/_func_manager",
                        data: {
                            name: pkgname,
                            runat: runat
                        }
                    }
                );
            }

            if (managerout) {
                outputjs.push(managerout);
            }

            outputjs.push(_tplutils.template({
                    name: "scrap/_func_declare",
                    data: {
                        name: pkgname,
                        scrap: scrapvar,
                        type: "scrap"
                    }
                }
            ));

            printer = scrap.printer;
            outputjs.push(_tplutils.template({
                    name: "scrap/_func",
                    data: {
                        name: pkgname,
                        arguments: (args ? ( args.join ? args.join(",") : args) : undefined),
                        output: printer.generate()}
                }
            ));


        }
    });

    return {
        output: outputjs.join(""),
        file: _extutils.getCATInfo({file: targetfile}).file
    };

};