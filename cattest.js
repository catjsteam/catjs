require('package-script').spawn([
    {
        command: "grunt",
        args: ["default"],
        spawnopt: {cwd: "test"},
        admin: false
    }

], {
    init: {
        log: true

    },
    callback: function () {

        console.log("[CAT test process done.")
    }
});
