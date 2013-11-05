

module.exports = function () {

    var tap = function (str) {

        if (str) {


            // split the args, parseInt the args that are numbers
            str[1] = str[1].replace(/ /g,"");
            var args = str[1].split(",");
            var functionArg = "";
            for (var i = 0; i < args.length; i++) {
                if (/^\d+$/.test(args[i])) {
                    args[i] = parseInt(args[i]);
                }
                functionArg += args[i] + ",";
            }

            functionArg = functionArg.substring(0, functionArg.length - 1);
            var senchaCode = "_cat.core.plugin('sencha').actions.fireTap(" + functionArg + ");"
            console.log(senchaCode)
        }
    };

    return {
        getSenchaSqript : function (str) {


            var str = (sencha).match(/tap\((.*)\);/);
            if (str) {
                return tap((str).match(/tap\((.*)\);/));
            }

        }
    }
}();
