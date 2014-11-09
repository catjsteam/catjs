var underscore,_jmrModelUtilsModule,_jmrModelUtilsModuleClass=function(e){function t(t,n){if(!e.utils.validargs(n))return undefined;var r=n.type,i=n.data,s=e.basem[t],o;return s&&(n.$immediate?o=s.call(this,{clazz:{type:n.type},data:i}):o=s.call(this,{type:r,data:i})),o}return{create:function(e){return t("create",e)},generate:function(e){return t("generate",e)}}};if(typeof exports!="undefined")typeof module!="undefined"&&module.exports&&(_jmrModelUtilsModule=new _jmrModelUtilsModuleClass({utils:requirext("jmrUtilsModule"),basem:Base}),module.exports=_jmrModelUtilsModule);else var jmrModelUtilsModule=function(e,t){return _jmrModelUtilsModule=new _jmrModelUtilsModuleClass({utils:e,basem:t}),_jmrModelUtilsModule}(jmrUtilsModule,jmrBaseModule);var _jmrModule,_jmrModuleClass=function(e){function t(t,n){if(!e.utils.validargs(n))return undefined;var r=n.type;if(r)return e.mutils[t]?e.mutils[t](n):(e.log.warn("No such method: ",t),undefined)}return{model:function(){},setReporter:function(e){},create:function(e){return t("create",e)},generate:function(e){return t("generate",e)},validate:function(e){return undefined},write:function(e,t){},report:function(e){},listen:function(t){var n,r=function(){console.log("js.utils is ready (jmrOnReady callback can be overriden [e.g. jmrOnReady=function(obj, arr, tpl){}]")};e.base.loadMapper(function(){typeof t!="undefined"?n=t:n=r,n.call(this,_jmrModule)})}}};if(typeof exports!="undefined"){if(typeof module!="undefined"&&module.exports){var _fs=fs,_utils,_log,_path=path;(function(){var e={jmrModelErrModule:"./src/model/Error.js",jmrModelFailureModule:"./src/model/Failure.js",jmrModelSkippedModule:"./src/model/Skipped.js",jmrModelTCaseModule:"./src/model/TestCase.js",jmrModelTSuiteModule:"./src/model/TestSuite.js",jmrModelTSuitesModule:"./src/model/TestSuites.js",jmrModelSystemModule:"./src/model/System.js",jmrModelUtilsModule:"./src/model/Utils.js",jmrUtilsModule:"./src/utils/Utils.js",jmrUtilsAntModule:"./src/utils/AntUtils.js"};global.jmr={},global.jmrbase=_path.resolve("./"),global.requirext=function(t){var n=e[t];return n||_log.warn("[jmr requirext] module name is not valid according to the key: ",t),require(n)}})(),_utils=requirext("jmrUtilsModule"),_log=_utils.logger(),global.jmr.reporter=src_Configjs.getReporter(),_jmrModule=new _jmrModuleClass({fs:_fs,path:_path,utils:_utils,log:_log,mutils:requirext("jmrModelUtilsModule")}),_jmrModule.setReporter=function(e){global.jmr.reporter=src_Configjs.getReporter(e)},_jmrModule.report=function(e){global.jmr.reporter.report?global.jmr.reporter.report(e):_log.wraning("[TestUnitReporter] 'report' method is not supported for reporter: '"+global.jmr.reporter.get("name")+"'")},_jmrModule.write=function(e,t){e||_log.error("[TestUnitReporter] 'file' argument for method print is required"),_fs.existsSync(e)?_log.warn("[TestUnitReporter] file: ",e," already exists"):_fs.writeFileSync(e,t)},_jmrModule.validate=function(e){var t=!1;return global.jmr.reporter.validate?t=global.jmr.reporter.validate(e):_log.wraning("[TestUnitReporter] 'validate' method is not supported for reporter: '"+global.jmr.reporter.get("name")+"'"),t},module.exports=_jmrModule}}else var jmrModule=function(e,t,n,r){return _jmrModule=new _jmrModuleClass({utils:t,log:t.logger(),mutils:n,base:r}),_jmrModule}(jmrConfigModule,jmrUtilsModule,jmrModelUtilsModule,jmrBaseModule);var jmrweb=this;jmrweb.testModelReporter=jmrweb.jmr={};var tmrweb=function(e,t){jmrweb.testModelReporter=jmrweb.jmr=e,t.loadMapper(function(){})}(jmrModule,jmrBaseModule);