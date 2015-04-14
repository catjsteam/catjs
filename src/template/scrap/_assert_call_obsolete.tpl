var assertObj = { code:{{expression}}, fail:{{fail}}, scrap:_cat.core.getVar(pkgName).scrap, args:_args };

_cat.core.manager.controller.invoke({ commands: [
   {
       "command" : "_cat.utils.chai.assert(",
       "args" : "context",
       "end" : ");"
   }
], context: assertObj});
