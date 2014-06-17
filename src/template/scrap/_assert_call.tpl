var assertObj = { code:{{expression}}, fail:{{fail}}, scrap:_cat.core.getVar(pkgName).scrap, args:_args };

_cat.core.clientmanager.delayManager([
   {
       "command" : "_cat.utils.chai.assert(",
       "args" : "context",
       "end" : ");"
   }
], assertObj);
