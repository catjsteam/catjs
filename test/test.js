var args = process.argv.slice(2),
    child_process = require('child_process'),
    testdata = [
        {
            name: "sencha",
            testname: "sencha-test",
            port: "8088",
            cwd: "./test/sencha/",
            tasks: ["t@init", "t@scrap", "t@inject", "t@autotest", "t@server.start", "t@runner.start"]
        },
        {
            name: "enyo",
            testname: "enyo-test",
            port: "8089",
            cwd: "./test/enyo/",
            tasks: ["t@init", "t@scrap", "t@inject", "t@server.start", "t@runner.start"]
        },
        {
            name: "catjs_example",
            testname: "catjs_example-test",
            port: "8089",
            cwd: "./test/catjs_example/",
            tasks: ["t@init", "t@scrap", "t@inject", "t@autotest", "t@server.start", "t@runner.start"]
        }
    ],
    tests=[],
    counter= 0,
    size = testdata.length;


function task(counter) {

    var data= testdata[counter];
    tests[counter] = child_process.fork("./build.js", ["all"], {
        cwd: data.cwd
    });

    if (args && args[0] && args[0] === "clean") {
        data.init = false;
    } else {
        data.init = true;
    }
    tests[counter].send(data);
    tests[counter].on ("message", function (obj){
       if (obj.status === "done") {

           tests[counter].kill();

           counter++;
           if (counter < size) {
                task(counter);
           }
       }

    });
}


if (require.main === module) {
    // command line call
    task(counter);

} else {
    module.exports = {

       run: function(entity) {
           
           var map = {
               sencha: testdata[0],
               enyo: testdata[1],
               "catjs_example": testdata[2] 
                   
           },data= map[entity],
               handle;

           handle = child_process.fork("./build.js", ["all"], {
               cwd: data.cwd
           });
           handle.send(data);
           handle.on ("message", function (obj){
               if (obj.status === "done") {

                   handle.kill();

               }

           });
       }

    };
}
