importPackage(com.sencha.tools.compressors.yui);
importPackage(com.sencha.tools.compressors.closure);
importPackage(com.sencha.tools.external);
importPackage(com.sencha.tools.compiler.jsb.statements);

var _logger = SenchaLogManager.getLogger("app-build");

function runAppBuild(proj) {
    var basedir = proj.getProperty("framework.config.dir"),
        appPath = proj.getProperty("args.path"),
        envArg = proj.getProperty("args.environment"),
        ignores = proj.getProperty("framework.ignores"),
        options = proj.getProperty("build.options"),
        cssCompression = proj.getProperty("build.compress.css"),
        config = readConfig(resolvePath(appPath, "app.json")),
        environment = (envArg == "native") ? 'package' : envArg,
        destination = 
            (proj.getProperty("args.destination") + '') ||
            (proj.getProperty("build.dir") + '') ||
            (proj.getProperty("app.build.dir") + ''),
        operations = toJS(proj.getProperty("build.operations")),
        v2deps = !!(proj.getProperty("v2deps") == "true"),
        src = appPath,
        sdk = proj.getProperty("framework.dir"),
        archive = 
            (proj.getProperty("args.archive") + '') || 
            (config.archivePath) || 
            "archive",
        nativePackaging = !!(envArg == 'native'),
        indexHtmlPath = config.indexHtmlPath || 'index.html',
        appUrl = config.url || resolvePath(src, indexHtmlPath),
        jsAssets = config.js || [],
        cssAssets = config.css || [],
        appCache = config.appCache,
        ignore = config.ignore,
        remoteAssets = [],
        extras = config.extras || config.resources,
        appJs, sdkJs, sdkIsAll, assets, processIndex;

    destination = joinPath(destination, environment);
    
    if(!PathUtil.isAbsolute(archive)) {
        archive = resolvePath(appPath, archive);
    }
    
    if (operations) {
        operations = operations.split('\n');
    } else {
        operations = [];
    }
    
    if (appUrl.indexOf("file:") != 0 && appUrl.indexOf("http:") != 0) {
        appUrl = 'file:///' + StringUtil.replace(resolvePath(appUrl), '\\', '/');
    }

    // check for build dir being immediate child of application dir
    // native packager can get in to infinite looping when scanning files
    // under this scenario
    var canonicalAppPath = new File(appPath).getCanonicalPath(),
        canonicalDestPath = new File(destination).getCanonicalPath(),
        parent = new File(canonicalDestPath).getParentFile();

    if(parent && parent.getCanonicalPath() == canonicalAppPath) {
        _logger.error("Application : {}", canonicalAppPath);
        _logger.error("Destination : {}", canonicalDestPath);
        _logger.error("Destination path cannot reside one level under the Application directory")
        throw "Destination path cannot reside one level under the Application directory";
    }


    _logger.info("Deploying your application to " + destination);

    PathUtil.ensurePathExists(resolvePath(destination));

    jsAssets = each(
        map(jsAssets, function (asset) {
            if (typeof asset == 'string') {
                asset = { path:asset };
            }
            asset.type = 'js';
            return asset;
        }),
        function (jsAsset) {
            if (jsAsset.bundle) {
                appJs = jsAsset.path;
            }
        });

    if (!appJs) {
        appJs = 'app.js';
    }

    appJs = resolvePath(destination, appJs);

    cssAssets = map(cssAssets, function (asset) {
        if (typeof asset == 'string') {
            asset = { path:asset };
        }
        asset.type = 'css';
        return asset;
    });

    assets = filter(concat(jsAssets, cssAssets), function (asset) {
        return !asset.shared || (environment != 'production');
    });

    _logger.debug("copying all assets");
    each(assets, function (asset) {
        if (asset.remote) {
            asset.bundle = false;
            asset.update = false;
            remoteAssets.push(asset);
        } else {
            file = asset.path;

            // if not in testing mode, and using the new compiler, and this is
            // one of the sencha-touch files, don't copy to output directory
            if( asset.type === 'js' &&
                !v2deps &&
                file.indexOf("sencha-touch") != -1) {
                asset['x-bootstrap'] = true;
                
                // only skip the sdk code in the bundle if the bundle flag
                // on the sdk asset is explicitly set to false
                if(('bundle' in asset) && asset.bundle === false) {
                    sdkJs = asset.path;
                    sdkIsAll = sdkJs.indexOf("-all.js") >= 0;
                    asset.isSdk = true;
                }
            }

            if (asset['x-bootstrap'] && !asset.isSdk) {
                return;
            }

            _logger.debug("copying file {}", resolvePath(src, file));

            var srcPath = resolvePath(src, file),
                dstPath = resolvePath(destination, stripSpecialDirNames(file));

            if(srcPath != dstPath) {
                PathUtil.ensurePathExists(dstPath);
                copy(srcPath, dstPath);
                _logger.info("Copied {} to {}", srcPath, dstPath);
            }
        }
    });

    var ignoreFilter = Filter.getFileNameFilter(
        new RegexFilter(ignore).setInclusive(false));

    _logger.debug("copying all extras");
    each(extras, function (extra) {
        var from = resolvePath(src, extra),
            to = resolvePath(destination, extra);
        _logger.debug("Copying from {} to {}", from, to);
        if (new File(from).exists()) {
            PathUtil.ensurePathExists(to);
            copy(from, to, ignoreFilter);
            _logger.info("Copied {}", from);
        } else {
            _logger.warn("File or folder {} not found", from);
        }
    });

    // build the app

    processIndex = function () {
        _logger.debug("processing page : index.html");
        jsAssets = filter(jsAssets, function(asset){
            return !(asset['x-bootstrap'] && !asset.isSdk);
        });

        var appJson = jsonEncode({
                id:config.id,
                js:jsAssets,
                css:cssAssets
            }),
            indexHtml, content, compressor, remotes, microloader;

        writeFileContent(new File(destination, 'app.json'), appJson);
        _logger.info("Generated app.json");

        indexHtml = readFileContent(new File(src, indexHtmlPath));

        if (environment == 'production' && appCache) {
            indexHtml = StringUtil.replace(
                indexHtml,
                '<html manifest=""',
                '<html manifest="cache.appcache"');
        }

        compressor = new ClosureCompressor();
        microloader = (environment == 'production'
            ? 'production'
            : 'testing') +
            '.js';
        _logger.debug("using microloader : {}", microloader);
        content = readFileContent(joinPath(sdk, "microloader", microloader));
        content = compressor.compress(content);
        remotes = [
            '<script type="text/javascript">' +
                content + ';Ext.blink(' +
                (environment == 'production' ? jsonEncode({
                    id:config.id
                }) : appJson) + ')' +
                '</script>'
        ];

        each(remoteAssets, function (asset) {
            var uri = asset.path;

            if (asset.type === 'js') {
                remotes.push(
                    '<script type="text/javascript" src="' +
                        uri +
                        '"></script>');
            } else if (asset.type === 'css') {
                remotes.push(
                    '<link rel="stylesheet" type="text/css" href="' +
                        uri +
                        '" />');
            }
        });

        indexHtml = ('' + indexHtml).replace(
            /<script id="microloader"([^<]+)<\/script>/,
            remotes.join(''));

        _logger.debug("generating new built index.html");
        writeFileContent(resolvePath(destination, indexHtmlPath), indexHtml);
        _logger.info("Embedded microloader into " + indexHtmlPath);
    };

    _logger.info("Resolving your application dependencies (" + appUrl + ")");

    var preprocessor = new Parser(),
        jsCompressor = new YuiJavascriptCompressor(),
        cssCompressor = new YuiCssCompressor(),
        phantomRunner = new PhantomJsRunner(),
        processedAssetCount = 0,
        assetsCount, dependencies, files, file,
        destinationFile, compressor,
		cleanFile, cleanDestinationFile;

    if(v2deps) {
        // if v2deps, use the sencha command 2 sytle dependency resolution mechanism
        // by running the phantomjs dependencies.js script
        var phantomOut = phantomRunner.run([
                resolvePath(basedir, "dependencies.js"),
                appUrl
            ]),
            exitCode = phantomOut.getExitCode(),
            stdout = phantomOut.getOutput(),
            buffer = new StringBuilder();


        if (exitCode > 0) {
            _logger.error("dependencies.js exited with non-zero code : " + exitCode);
            _logger.error(stdout);
            throw new ExBuild("failed gathering dependencies").raise();
        }
        dependencies = jsonDecode(stdout);

        _logger.info("Found " + dependencies.length + " dependencies. Concatenating all into '" + appJs + "'");

        files = map(dependencies, function (dependency) {
            return resolvePath(src, dependency.path);
        });

        files.push(appJs);

        each(files, function (file) {
            buffer.append(FileUtil.readUnicodeFile(resolvePath(file))).append('\n');
        });

        writeFileContent(appJs, buffer.toString());

        // clear the buffer to free memory
        buffer.setLength(0);
    } else {
        var sdkTag = sdkIsAll ? 'framework' : 'core',
            sdkFile = sdkJs,
            sdkJsArgs = [
                '--options=' + options,
                'union',
                '-tag',
                sdkTag,
                'and',
                'concat',
                '-out=' + resolvePath(destination, sdkFile)
            ],
            appJsArgs = [
                '-options=' + options,
                'restore',
                'app-all',
                'and',
                'exclude',
                '-tag',
                sdkTag,
                'and',
                'concatenate',
                '-out=' + appJs,
                ''],
            compilerId = proj.getProperty("compiler.ref.id"),
            compiler = proj.getReference(compilerId);

        if(sdkJs) {
            _logger.info("Compiling " + sdkFile + " and dependencies");
            _logger.debug("running compiler with options : '{}'", sdkJsArgs.join(' '));
            compiler.dispatchArgs(sdkJsArgs);
            _logger.info("Compiling app.js and dependencies");
            _logger.debug("running compiler with options : '{}'", appJsArgs.join(' '));
            compiler.dispatchArgs(appJsArgs);
            _logger.info("Completed compilation.");
        } else {
            appJsArgs = [
                '-options=' + options,
                'restore',
                'app-all',
                'and',
                'concatenate',
                '-out=' + appJs,
                ''];

            _logger.debug("running compiler with options : '{}'", appJsArgs.join(' '));
            compiler.dispatchArgs(appJsArgs);
            _logger.info("Completed compilation.");        
        }
    }


    for (var name in config.buildOptions) {
        if (config.buildOptions.hasOwnProperty(name)) {
            preprocessor.setParam(name, config.buildOptions[name]);
        }
    }

    assetsCount = assets.length;

    each(assets, function (asset) {
        if(!asset.remote) {
            file = asset.path;
            destinationFile = resolvePath(destination, file),
            cleanFile = stripSpecialDirNames(file),
            cleanDestinationFile = resolvePath(destination, cleanFile);

            // adjust the asset path to use the cleaned filename
            asset.path = cleanFile;
        }


        _logger.debug("Assets => Processed : {} Total : {}",
            processedAssetCount, assetsCount);

        if (asset.type == 'js') {
            if (!asset.remote && !(asset['x-bootstrap'] && !asset.isSdk)) {
                _logger.debug("running preprocessor for file {}", cleanDestinationFile);
                writeFileContent(
                    cleanDestinationFile,
                    preprocessor.parse(readFileContent(cleanDestinationFile)));
                _logger.info('Processed local file ' + asset.path);
            } else {
                _logger.info('Processed remote file ' + asset.path);
            }
        }

        if (environment == 'testing') {
            return;
        }

        if (asset.remote || (asset['x-bootstrap'] && !asset.isSdk)) {
            ++processedAssetCount;
        } else {
            _logger.debug("Minifying " + file);

            if(asset.type == 'js') {
                writeFileContent(
                    cleanDestinationFile,
                    jsCompressor.compress(readFileContent(cleanDestinationFile)));

                _logger.info("Minified " + file);
            } else if (cssCompression == "true") {
                writeFileContent(
                    cleanDestinationFile,
                    cssCompressor.compress(readFileContent(cleanDestinationFile)));

                _logger.info("Minified " + file);
            }

            if (environment == 'production') {
                var content = readFileContent(cleanDestinationFile),
                    version = '' + FileUtil.createChecksum(content);
                asset.version = version;

                _logger.debug("prepending checksum on {}", cleanDestinationFile);
                writeFileContent(
                    cleanDestinationFile,
                    "/*" + version  + "*/" + content);
                content = "";

                _logger.debug("copying destination to archive");

                PathUtil.ensurePathExists(resolvePath(archive, cleanFile, version));
                copy(cleanDestinationFile, resolvePath(archive, cleanFile, version));

                if (asset.update == 'delta') {
                    // generate all the deltas to the other archived versions
                    _logger.debug("generating file deltas");
                    var archivedVersions = new File(joinPath(archive, cleanFile))
                        .listFiles();

                    each(archivedVersions, function (archivedVersion) {
                        if(archivedVersion.isDirectory()) {
                            return;
                        }
                        
                        archivedVersion = archivedVersion.name;

                        if (archivedVersion == version) {
                            return;
                        }

                        var deltaFile = joinPath(
                            destination,
                            'deltas',
                            cleanFile,
                            archivedVersion + '.json');

                        writeFileContent(deltaFile, '');

                        _logger.debug("Generating delta from {} to {}",
                            archivedVersion,
                            version);

                        var runner = new VcDiffRunner(),
                            args = [
                                'encode',
                                '-json',
                                '-dictionary',
                                joinPath(archive, cleanFile, archivedVersion),
                                '-target',
                                cleanDestinationFile,
                                '-delta',
                                resolvePath(deltaFile),
                                '--stats'
                            ],
                            runnerOut = runner.run(args),
                            exitCode = runnerOut.getExitCode(),
                            stdout = runnerOut.getOutput();
                            
                        if (exitCode > 0) {
                            _logger.error("failed generating diff from {} to {}",
                                archivedVersion,
                                version);
                            _logger.error(stdout);
                            throw new ExBuild("failed generating diff from {0} to {1}",
                                archivedVersion,
                                version).raise();
                        }
                        
                        // fixup malformed vcdiff content
                        var deltaFilePath = resolvePath(deltaFile),
                            content = FileUtil.readFile(deltaFilePath);
                        if(content.endsWith(",]")) {
                            _logger.debug("Correcting trailing comma issue in vcdiff output");
                            FileUtil.writeFile(deltaFilePath, content.substring(0, content.length() - 2) + "]");
                        }
                        
                        content = null;
                        
                        _logger.info(
                            "Generated delta for: {} from hash: '{}' to hash: '{}'",
                            [cleanFile, archivedVersion, version]);
                    });

                }
            }

            if (++processedAssetCount == assetsCount) {
                _logger.debug("processed all assets, finalizing build...");
                processIndex();

                if (environment == 'production' && appCache) {
                    _logger.info("Generating appcache");
                    appCache.cache = map(appCache.cache, function (cache) {
                        var checksum = '';

                        if (!/^(\/|(.*):\/\/)/.test(cache)) {
                            _logger.info(
                                "Generating checksum for appCache item: {}",
                                cache);

                            checksum = FileUtil.createChecksum(
                                readFileData(joinPath(destination, cache)));
                        }

                        return {
                            uri:cache,
                            checksum:checksum
                        }
                    });

                    writeAppCache(appCache, joinPath(destination, 'cache.appcache'));
                }

                if (nativePackaging) {
                    _logger.info("Generating native package");
                    var packagerConfig = readConfig(
                            joinPath(src, 'packager.json'));

                    if (packagerConfig.platform.match(/iOS/)) {
                        copy(
                            resolvePath(joinPath(src, 'resources', 'icons')),
                            resolvePath(destination),
                            ignoreFilter);
                        copy(
                            resolvePath(joinPath(src, 'resources', 'loading')),
                            resolvePath(destination),
                            ignoreFilter);
                    }

                    // add '' here to coerce to javascript string instead of java string
                    // for json encoding later...
                    packagerConfig.inputPath = destination + '';
                    
                    var origDestination = proj.getProperty("args.destination"), 
                        nativePackagePath = proj.getProperty("native.build.dir") ||
                            joinPath(origDestination, "native");
                    
                    packagerConfig.outputPath = resolvePath(nativePackagePath) + '';
                    
                    PathUtil.ensurePathExists(packagerConfig.outputPath);

                    writeFileContent(
                        joinPath(src, 'packager.temp.json'),
                        jsonEncode(packagerConfig, true));

                    _logger.info(
                        "Packaging your application as a native app to {} ...",  
                        packagerConfig.outputPath);

                    var stbuildRunner = new StBuildRunner(),
                        args = ['package', resolvePath(src, 'packager.temp.json')],
                        stbuildOut = stbuildRunner.run(args),
                        exitCode = stbuildOut.getExitCode(),
                        stdout = stbuildOut.getOutput();

                    if (exitCode > 0) {
                        _logger.error("failed running native packager");
                        _logger.error(stdout);
                        throw new ExBuild("failed running native packager")
                            .raise();
                    } else {
                        _logger.info("Successfully packaged native application");
                        _logger.info(
                            "Package may be run with 'sencha package run -p {}", 
                            joinPath(src, 'packager.temp.json'))
                    }
                } else {
                    _logger.debug("skipping native packaging");
                }
            }
        }
    });

    if (environment == 'testing') {
        processIndex();
    }
    
    _logger.info("Successfully deployed your application to " + destination);

};

function writeAppCache(appCache, outfile) {
    _logger.debug("generating appcache manifest...");
    // build the appCache file
    var builder = new StringBuilder();

    builder.append("CACHE MANIFEST\n");
    each(appCache.cache, function (cache) {
        builder.append("# " + cache.checksum + "\n");
        builder.append(cache.uri + "\n");
    });

    builder.append("\n\nFALLBACK:\n");

    each(appCache.fallback, function (fallback) {
        builder.append(fallback + '\n');
    });

    builder.append("\n\nNETWORK:\n");

    each(appCache.network, function (network) {
        builder.append(network + '\n');
    });

    writeFileContent(
        outfile,
        builder.toString());

    builder.setLength(0);
};


(function (proj) {
	_logger.info("building application");
	runAppBuild(proj);
})(project);
