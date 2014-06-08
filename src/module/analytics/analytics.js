var contribute = require("contribute"),
    config = {
        "googleId" : 'UA-51686739-1',
        "googleSite" : 'https://github.com/catjsteam/catjs'
    };


contribute.init(config);

exports.updateAnalytics = function(catCommand, projectName) {
    var label,
        action,
        page;

    label = catCommand.task ? catCommand.task.join(", ") : "undefined_task";
    action = (catCommand.argv && catCommand.argv.original) ? catCommand.argv.original.join("/") : "undefined_args";
    page = projectName + "/" + label + "/" + action;

    contribute.trackPage('catjs', page);
};