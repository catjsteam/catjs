require('package-script').install([
    {
        name: "grunt-cli"
    },
    {
        name: "bower"
    }
], {
    init: {
        global:true,
        log:false

    },
    callback: function () {

        console.log("[CAT post install] done.")
    }
});