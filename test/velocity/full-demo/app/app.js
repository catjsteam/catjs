

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
             */
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
     */

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

     */
});
