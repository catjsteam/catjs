var NA = require("nodealytics");
NA.initialize('UA-48103058-1', 'catjsteam.github.io', function () {
});



exports.updateAnalytics = function(catCommand) {

    var exec = require('child_process').exec,
        command    = exec('npm config get proxy');

    command.stdout.on('data', function (data) {
        if (data.indexOf("null") == 0){
            var label = catCommand.task ? catCommand.task.join(", ") : "undefined_task";
            var action = (catCommand.argv && catCommand.argv.original) ? catCommand.argv.original.join(", ") : "undefined_args";


            NA.trackEvent('CAT', action, label, function (err, resp) {

                if (!err && resp && resp.statusCode === 200) {
                    console.log('Thank you for contribute to CAT analytics');
                }
            });
        } 
    });


};