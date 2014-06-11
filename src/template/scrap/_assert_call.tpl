var assertObj = { code:{{expression}}, fail:{{fail}}, scrap:{{scrap}}, args:{{param1}} };
assertObj.scrap = JSON.stringify(assertObj.scrap);
assertObj.scrap = JSON.parse(assertObj.scrap);

var tempCommand = {
    "command" : "_cat.utils.chai.assert(",
    "args" : "context",
    "end" : ");"
};
_cat.core.clientmanager.delayManager([
   tempCommand
], assertObj);
