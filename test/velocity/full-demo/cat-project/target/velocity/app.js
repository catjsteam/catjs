

/**
 * When the document is ready assign a listener to the test button
 */
$( document ).ready(function() {
    var testButton = $("#testbtn"),
        description = $("#description"),
        counter = 0;

    if (testButton) {
        testButton.on("click", function () {
            description = $("#description");
            if (description) {
                counter++;
                description.html("Clicks +" + counter);
            }

            /*
             This is a simple scrap testing the test button click functionality

             @[scrap
                 @@name testButtonListener
                 @@context description
                 @@log "Description: ", description.text().trim()
                 @@assert ok((description.text().trim() !== "Clicks +3"), "More then 2 clicks is too much...")
             ]@
             */_cat.core.action(this, { scrap:{"name":["testButtonListener"],"context":["description"],"log":["\"Description: \", description.text().trim()"],"assert":["ok((description.text().trim() !== \"Clicks +3\"), \"More then 2 clicks is too much...\")"],"file":"C:/Users/snirr/workspace/CATCore/test/velocity/full-demo/cat-project/target/velocity/app.js","scrapinfo":{"start":{"line":22,"col":13},"end":{"line":27,"col":15}},"commentinfo":{"start":{"line":19,"col":12},"end":{"line":28,"col":15}},"single":{"name":true,"context":false,"log":true,"assert":false,"file":true,"scrapinfo":true,"commentinfo":true,"single":true,"singleton":true,"arguments":true,"id":true,"$type":true},"singleton":{"name":-1,"context":1,"log":-1,"assert":-1,"file":-1,"scrapinfo":-1,"commentinfo":-1,"single":-1,"singleton":-1,"arguments":-1,"id":-1,"$type":-1},"arguments":["description"],"id":"scrap_1","$type":"js","pkgName":"C:.Users.snirr.workspace.CATCore.test.velocity.full-demo.cat-project.target.velocity.app.testButtonListener"}},description);
        });
    }

    /*
     This is a simple scrap that test the button's click event functionality

     @[scrap
         @@name testButtonClick
         @@run@ manager
         @@context testButton
         @@assert ok(testButton[0], "No valid test element button")
         @@code testButton.click()
     ]@
     */_cat.core.action(this, { scrap:{"name":["testButtonClick"],"run@":["manager"],"context":["testButton"],"assert":["ok(testButton[0], \"No valid test element button\")"],"code":["testButton.click();"],"file":"C:/Users/snirr/workspace/CATCore/test/velocity/full-demo/cat-project/target/velocity/app.js","scrapinfo":{"start":{"line":35,"col":5},"end":{"line":41,"col":7}},"commentinfo":{"start":{"line":32,"col":4},"end":{"line":42,"col":7}},"single":{"name":true,"run@":true,"context":false,"assert":false,"code":false,"file":true,"scrapinfo":true,"commentinfo":true,"single":true,"singleton":true,"arguments":true,"id":true,"$type":true},"singleton":{"name":-1,"run@":-1,"context":1,"assert":-1,"code":-1,"file":-1,"scrapinfo":-1,"commentinfo":-1,"single":-1,"singleton":-1,"arguments":-1,"id":-1,"$type":-1},"arguments":["testButton"],"id":"scrap_2","$type":"js","pkgName":"C:.Users.snirr.workspace.CATCore.test.velocity.full-demo.cat-project.target.velocity.app.testButtonClick"}},testButton);

    /*
     The Manager annotation is optional and enables a play mode that makes the ui flow understandable to the user
     With the manager enabled CAT ui will be available and the test will be played with delay
     The manager also have a built it actions (delay, repeat) to be applied on the tests

     @[scrap
         @@name manager
         @@perform[
             @@testButtonClick repeat(3)
         ]
         @@catui on
         @@manager true
         @@signal TESTEND
     ]@

     */_cat.core.action(this, { scrap:{"name":["manager"],"perform":["@@testButtonClick repeat(3)"],"catui":["on"],"manager":["true"],"signal":["TESTEND"],"file":"C:/Users/snirr/workspace/CATCore/test/velocity/full-demo/cat-project/target/velocity/app.js","scrapinfo":{"start":{"line":49,"col":5},"end":{"line":57,"col":7}},"commentinfo":{"start":{"line":44,"col":4},"end":{"line":59,"col":7}},"single":{"name":true,"perform":false,"catui":true,"manager":false,"signal":true,"file":true,"scrapinfo":true,"commentinfo":true,"single":true,"singleton":true,"arguments":true,"id":true,"$type":true},"singleton":{"name":-1,"perform":-1,"catui":-1,"manager":1,"signal":-1,"file":-1,"scrapinfo":-1,"commentinfo":-1,"single":-1,"singleton":-1,"arguments":-1,"id":-1,"$type":-1},"arguments":[],"id":"scrap_3","$type":"js","pkgName":"C:.Users.snirr.workspace.CATCore.test.velocity.full-demo.cat-project.target.velocity.app.manager"}});
});
