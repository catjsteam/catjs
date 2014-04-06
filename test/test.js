var child_process = require('child_process'),
    testdata = [
        {
            name: "sencha",
            testname: "sencha-test",
            port: "8088",
            cwd: "./test/sencha/"
        },
        {
            name: "enyo",
            testname: "enyo-test",
            port: "8089",
            cwd: "./test/enyo/"
        }
    ],
    tests=[],
    counter= 0,
    size = testdata.length;


function task(counter) {

    var data= testdata[counter];
    tests[counter] = child_process.fork("./build.js", [], {
        cwd: data.cwd
    });
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

task(counter);
