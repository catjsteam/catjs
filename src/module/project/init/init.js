var _catglobal=catrequire("cat.global"),_log=_catglobal.log(),_utils=catrequire("cat.utils"),_path=require("path"),_fs=require("fs.extra"),_jsutils=require("js.utils");module.exports=function(){var t=_catglobal.get("home").working.path,a=_path.resolve(_path.join(cathome,"src/module/project/init/projects"));return{create:function(e){function o(){return s?!0:(console.log(i),s="cat",!1)}function r(o,r,p){var c,s,i,l;o&&r&&(p=p||{},i=_path.resolve(_path.join(r,"catproject.json")),c=_fs.readFileSync(i,"utf8"),c=_jsutils.Template.template({content:c,data:p}),s=_path.join(t,"cat-project"),_fs.existsSync(s)||_fs.mkdirpSync(s),_fs.writeFileSync(_path.join(s,"catproject.json"),c),_fs.copyRecursive(_path.resolve(_path.join(a,"base")),s,function(a){a&&_utils.log("[CAT init project] probably the files already exists, skipping... "),l=_fs.existsSync(_path.join(r,"app")),l?_fs.copyRecursive(_path.resolve(_path.join(r,"app")),_path.resolve(_path.join(t,"app")),function(t){t&&_utils.log("[CAT init project] probably the files already exists, skipping... "),e&&e.callback&&e.callback.call()}):e&&e.callback&&e.callback.call()}))}var p,c,s="name"in e&&e.projectname?e.projectname:void 0,i="[CAT init project] No valid project name was found, generating a base project";o(),p=_path.resolve(_path.join(a,s)),_fs.existsSync(p)||o()||(p=_path.resolve(_path.join(a,s))),c={name:e.name,source:e.source,target:e.target,cattarget:"./",host:e.host,port:e.port,protocol:e.protocol,analytics:e.analytics,appserver:{host:e.host,port:e.port,protocol:e.protocol},appath:e.appath},r(s,p,c)}}}();