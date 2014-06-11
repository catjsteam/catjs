var assertObj = { code:{{expression}}, fail:{{fail}}, scrap:{{scrap}}, args:{{param1}} };
assertObj = JSON.stringify(assertObj) + ");";

var tempCommand = {
    "command" : "_cat.utils.chai.assert(",
    "onObject" : assertObj
};
_cat.core.clientmanager.delayManager([
   (tempCommand)
]);
