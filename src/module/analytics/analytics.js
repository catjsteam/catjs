var contribute = require("contribute"),
    config = {
        "googleId" : 'UA-48103058-1',
        "googleSite" : 'catjsteam.github.io'
    };


contribute.init(config);

exports.updateAnalytics = function(catCommand) {
    var label,
        action,
        page;

    label = catCommand.task ? catCommand.task.join(", ") : "undefined_task";
    action = (catCommand.argv && catCommand.argv.original) ? catCommand.argv.original.join("/") : "undefined_args";
    page = label + "/" + action;

    contribute.trackPage('catjs', page);
};