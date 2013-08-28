var os = require('os'),
    fs = require("fs"),
    spawn,
    options = {
        cachePassword: true,
        prompt: 'Additional global npm(s) about to be installed, set your root password:? ',
        spawnOptions: { /* other options for spawn */ }
    },
    process,
    commands = [
        {
            command: "npm",
            args: ["install", "-g", "grunt-cli"]
        },
        {
            command: "npm",
            args: ["install", "-g", "bower"]
        }
    ], next= 0, size = commands.length;

function isLinux() {
    return (os.platform() == "linux");
}

function init() {
    var log = "CAT installer Initialized ....";
    console.log(log);
    log2file(log);

    if (isLinux()) {
        spawn = require('sudo');
    } else {
        spawn =  require('child_process').spawn;
    }

}

function log2file(data, option) {
    try {
        fs.appendFileSync("catinstaller.log", (data + "\n"), "utf8");
    } catch (e) {
        log2file("Cat Installer, ERROR:", e);
    }
}


function install(items) {

    var item = items[next],
        command = item.command,
        args = item.args,
        print;

    if (isLinux()) {
        args.unshift(command);
        print = args.join(" ");
        console.log("Running Installer command: " + print);
        process = spawn(args, options);

    } else {
        args.unshift(command);
        args.unshift("/c");
        command = "cmd";
        print = [command, args.join(" ")].join(" ");
        console.log("Running Installer command: " + print);
        process = spawn(command, args);

    }


    process.stdout.on('data', function (data) {
        var log = 'CAT Installer: ' + data;
        console.log(log);
        log2file(log);
    });

    process.stderr.on('data', function (data) {
        log2file('CAT Installer : ' + data);
    });

    process.on('close', function (code) {
        log2file('CAT Installer Complete ' + code);
        next++;
        if (next < size) {
            install(items);
        }
    });
}


init();
install(commands);
