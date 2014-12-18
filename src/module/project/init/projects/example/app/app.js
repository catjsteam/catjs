

/**
 * When the document is ready assign a listener to the test button
 */
$( document ).ready(function() {
    var testButton = $("#testbtn"),
        description = $("#description"),
        counter = 0;

    /*
     This is a simple scrap that test the button's click event functionality
     You can repeat the scrap on cat-project/src/config/cat.json
     @[scrap
         @@name testButtonClick
         @@context testButton
         @@assert ok(testButton[0], "No valid test element button")
         @@code testButton.click()
         @@code testButton.click()
         @@code testButton.click()
     ]@
     */

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
                 @@standalone true
                 @@context[
                     counter
                     description
                 ]
                 @@log "Description: ", description.text().trim()
                 @@assert ok((counter < 3), "More then 2 clicks is too much...")
             ]@
             */
        });
    }

});
