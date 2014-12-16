var _Scrap = catrequire("cat.common.scrap"),
    _scrapEnum = _Scrap.getScrapEnum(),
    _tplutils = catrequire("cat.tpl.utils"),
    _extutils = catrequire("cat.ext.utils"),
    _project = catrequire("cat.project");


module.exports = function (scraps, sourcefile, targetfile) {

    var cacheOutput = [], cacheIncludeOutput = [],
        projectTarget = _project.getInfo("target"),
        catinfo;

    scraps.forEach(function (scrap) {

        var printer,
            runat,
            managerout,
            pkgname,
            engine = scrap.$getEngine(),
            args = scrap.get("arguments"),
            scrapvar,
            catsourceinfo;

        if (engine === _scrapEnum.engines.JS ||
            engine === _scrapEnum.engines.HTML_EMBED_JS) {

            runat = scrap.get("run@");
            catsourceinfo = _extutils.getCATInfo({scrap: scrap, file: sourcefile, basepath: projectTarget});
            pkgname = catsourceinfo.pkgName;
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
                cacheIncludeOutput.push(managerout);
            }

            cacheIncludeOutput.push(_tplutils.template({
                    name: "scrap/_func_declare",
                    data: {
                        name: pkgname,
                        scrap: scrapvar,
                        type: "scrap"
                    }
                }
            ));

            printer = scrap.printer;
            cacheOutput.push(_tplutils.template({
                    name: "scrap/_func",
                    data: {
                        name: pkgname,
                        arguments: (args ? ( args.join ? args.join(",") : args) : undefined),
                        output: printer.generate()}
                }
            ));


        }
    });

    catinfo = _extutils.getCATInfo({file: targetfile});


    return {
        include: {
            output: cacheIncludeOutput.join(""),
            file: catinfo.includeFile
        },
        cache: {
            output: cacheOutput.join(""),
            file: catinfo.file
        }
    };

};