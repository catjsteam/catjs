CATJS 0.2.3
==============

*CATJS* is an automation framework for (mobile) web applications testing.
It offers a new technology that makes testing easy, we don't do WebDriver like the other technologies, in our case the applications test themselves.
With simple annotations added to your HTML5 code, an automated functional tests will be available as part of your application lifecycle.

### Code once, deploy it anywhere <br/>

Once you added the test code you can run it using [CAT runner](https://www.npmjs.org/package/mobilerunner) (That is already part of CATJS, no need to do any additional installations), on any platform that your application supports.
CAT runner can deploy your application on multiple devices and desktop browsers.

### A few facts

* The annotations will be coded in comments thus no additional code is required
* Once you wish to test your application, with a simple command, a new deployment will be generated for you to use including the test code
* You get to document your tests and test your code
* When you are ready for production the additional annotations will be removed on the minify process.
* CAT is an [NPM](https://www.npmjs.org/) and can be used as a command-line and/or as a module (The module will be available in the next releases)

[cat.js.team](http://catjsteam.github.io/) @catjsteam
You can visit our [catjs forum](https://groups.google.com/forum/#!forum/catjs). Comments and questions are more than welcome, our team can help and consult about how to test your web application.

## Blogs
[http://catjs.blogspot.co.il](]http://catjs.blogspot.co.il)

* Web Applications that test themselves
* Web automation testing solution

[Technology Through My Eyes](http://mobilewebtesting.wordpress.com/2014/06/22/how-to-test-your-mobile-web-application-using-catjs-part-one)

## catjs - Seed project

We recommend you to try our catjs seed project on [jQuery Moblie app](http://jquerymobile.com/)  
Github project [https://github.com/ransnir/catjs-jqm-seed](https://github.com/ransnir/catjs-jqm-seed)  
Take a look on the [demo](http://ransnir.github.io/cat-project/target/catexample/index.html)


## Quick Start

### First, install CAT command line
In order to get started, you'll want to install CAT's CLI (command line interface) globally. `catcli` command will be set into your system path.

    npm install -g catjs


### Then, create a new project with CatJS tool

    npm install -i

Follow the command inputs:

* Enter the project name: [project name, better with no spaces]
* Enter CAT server's host name:  (localhost)
* Enter CAT server's port:  (8089)
* Enter CAT server's protocol:  (http)
* May catjs anonymously report usage statistics to improve the tool over time?:  (Y) 
* Enter your project's (application) path:  ./../app 
  Relative path from "cat-project" folder to your app. 
  
"cat-project" folder will be created automatically for you after this process is done.  
You can find inside all of the project resources including the catproject.json with the above configuration settings.  
Those settings can be changed later.  
Any future CatJS command should be running from the "cat-project" folder, since CatJS tool is looking for catproject.json configuration file.


### And then, add scraps to your code

Scrap is a single action annotation that can combine one or more operations or assertions.  
You should put the scrap within comments.

* Import catjs library    
CatJS support a standard JavaScript imports and the [requireJS](http://requirejs.org) library style  

    * standard import  
    Put CatJS library where you load your all of the other JavaScript resources  
    You can load other resources with cat annotation just add a new line after cat.js

        <!--
            @[scrap
                @@import[
                    /cat/lib/cat.js
                ]
            ]@
        -->

    * RequireJS style  
    Put CatJS require configuration just below yours
    
        /*
           @[scrap
               @@require[
                  /cat/lib/cat.js
               ]
           ]@
        */


* Add your own scrap

        /*
            @[scrap
                @@name myScrap
                @@log This is my first scrap
            ]@
        */
        

### For test deployment creation, use the command line tool

CatJS command line tool has to be executed from where the catproject.json configuration file exists   
You can find this file below cat-project folder. **Don't forget to change the directory to cat-project first**

* build your project

        catcli -b

* Auto test configuration (optional)
CatJS has a test project for executing all of your scraps, to be able to see the running steps run this command

        catcli -a


* run the server

        catcli -s

* rebuild the project and run the server  
    In case you edit your scraps comments clean first

        catcli -cbas


### Additional scrap types

* *code* JavaScript code snippet

        /*
            @[scrap
                @@code alert("test")
            ]@
        */

* *context* Expose variables from your scope to the test

        /*
            @[scrap
                @@context fooElement
                @@code [
                    fooElement.innerHTML="foo description"
                    fooElement.style.color ="#000"
                ]
            ]@
        */

* *assert* supports [chai.js](http://chaijs.com/) library API

        /*
            @[scrap
                @@context fooElement
                @@assert ok(fooElement, "Missing element named: foo")
            ]@
        */

Currently supported library are: JQM, Sencha Touch, (DOM, Enyo with few APIs, Angular is planned for future releases)
The plugins aimed to give you a syntactic sugar, but you can always use your own code... and of course to code your own custom plugins.

* *jqm* supports [JQM](http://jquerymobile.com/) library API

        /*
            @[scrap
                @@jqm setText("#fooId", "Test...")
            ]@
        */

* *sencha touch* supports [Sencha Touch (extjs)](http://www.sencha.com/products/touch/) library API

        /*
            @[scrap
                @@context field
                @@sencha setText(field, "this is a test");
            ]@
        */

### It about timne to run your tests  
Open your favorite browser and go to: **http://localhost:8089**  
Here is a short description for the events that occurs after loading the test deployment:

* CatJS library is going to load the test project (cat.json)
* CatJS tests will start running as part of your code
* CatJS UI console will appear in the right top corner and mask will cover your application 
    * The UI console displays the assertions and any tests information 
* In case the scraps includes assertions it will be displayed in the: 
    * UI Console 
    * Terminal
  In additional a JUnit XML will be created that can be used to display reports and\or integrate with Jenkins


### Edit your test project 

When cat builds your project, you can find a cat.json file below cat-project/src/config folder.  
You can define your scenarios and control your test execution.  
Inside the file there's a description of all the available settings.

* **tests**  
Attribute for setting what test scenarios will be running 

        "tests": [
            {
                "name": "general"
            }
        ]
 
* **scenarios**  
Attribute for scenarios definition. You can set any scraps you wish to the test scenario.  
In that case scrap name is required for assigning a scrap to a scenario.

In case you wish to run one or more scenarios, you need to put them in the tests section.    
You can use the -a flag in the command line for auto scraps assigning.  

        "scenarios": {
                "general": {
                    "tests": [
                        {
                            "name": "myScrap"
                        },
                    ]
                }
        }

* **run-mode**

        "run-mode": "tests"

Two modes are available for tests executions:
* tests  
Run the test scenarios that you defined in the test project.
There will be a delay between tests execution that you'll be able to follow the actions.


* all
Ignore the test scenarios definition and run all the tests at once. 
In this mode you will not be able to see the ui console or any delay in the script.


### Test Data Usage

On CatJS project creation a test data file is being created: cat-project/src/config.testdata.json  
This is a JSON file format and you can set your data inside and use that data within CatJS annotation. for example:

        /*
            @[scrap
                @@code alert(@d.find(.users.name))
            ]@
        */
        
We have integrated [JsPath](https://github.com/dfilatov/jspath) with CatJS core and you can use its syntax for query your data out from the test data JSON.
Currently we have support for two scrap methods:

* *find*    
Find a specific single entry (In case we get more than one result we'll take the first)

* *random*  
Get a specific entry out of an Array of items, Each call will result a random entry.

## Example Application

* Create an initial CatJS project with a simple example application included

        catcli --init example


### Example application description
Look into the file system where your generated project was created. At the root folder, two sub-folders were created:

* *cat-project* - folder that contains CatJS project's resources
* *app folder*  - that contains a basic HTML5 application powered by JQuery

* A Brief description
    * Files  
        * CatJS Project
            * catproject.json is CatJS's configuration file that contains
                * Environment settings
                * plugins declarations
                * tasks declarations
        * Example Application 
            * Standard JQuery application resources (css, js, html)
            * Annotation tests code included
                * Browse to the JavaScript file: app/app.js and look for the scrap annotation.

* Application description
    * The application has one page that contains a test button
    * On each button click a text will be displayed, describing the number of clicks
    
* Application test
    * Automates the button's click a few times
    * Validating that the number of clicks are not greater than two clicks
        * It will fail the test in that case

## Application Error Assertion
catjs track your application errors and report it to the console/junit. With minimal annotation for catjs library loading you get to track your application errors.
   Combined it with catjs runner you can immediately get report about any errors on different browsers and devices.



## API reference

You can explore our [plugins folder](https://github.com/catjsteam/catjs/tree/master/src/libraries/cat/plugins).

* **JQM**

    * *scrollTop()*
    
    * *swipePageLeft()* 
    
    * *swipePageRight()* 
    
    * *backClick()* 
    
    * *scrollTo(elt)* 
        * *elt* Can be reference or a JQuery id or class (e.g. #foo, #foo .foo)
     
    * *scrollToWithRapper(idName, rapperId)* 
        * *idName* Can be reference or a JQuery query (e.g. #foo, #foo .foo)
        * *rapperId* Can be reference or a JQuery query (e.g. #foo, #foo .foo)

    * *clickRef(idName)* 
        * *idName* Can be reference or a JQuery query (e.g. #foo, #foo .foo)
    
    * *clickButton(idName)* 
        * *idName* Can be reference or a JQuery query (e.g. #foo, #foo .foo)
                
    * *selectTab(idName)* 
        * *idName* Can be reference or a JQuery query (e.g. #foo, #foo .foo)
    
    * *swipeItemLeft(idName)* 
        * *idName* Can be reference or a JQuery query (e.g. #foo, #foo .foo)
    
    * *swipeItemRight(idName)* 
        * *idName* Can be reference or a JQuery query (e.g. #foo, #foo .foo)

    * *click(idName)* 
        * *idName* Can be reference or a JQuery query (e.g. #foo, #foo .foo)
    
    * *setCheck(idName)* 
        * *idName* Can be reference or a JQuery query (e.g. #foo, #foo .foo)
    
    * *collapsible(idName)* 
        * *idName* Can be reference or a JQuery query (e.g. #foo, #foo .foo)
    
    * *slide(idName, value)* 
        * *idName* Can be reference or a JQuery query (e.g. #foo, #foo .foo)
        * *value*
    
    * *setText(idName, value)* 
        * *idName* Can be reference or a JQuery query (e.g. #foo, #foo .foo)
        * *value*
    
    * *checkRadio(className, idName)* 
        * *idName* Can be reference or a JQuery query (e.g. #foo, #foo .foo)
        * *className*
    
    * *searchInListView(listViewId, newValue)* 
        * *listViewId* Can be reference or a JQuery query (e.g. #foo, #foo .foo)
        * *newValue*
    
    * *selectMenu(selectId, value)* 
        * *selectId* Can be reference or a JQuery query (e.g. #foo, #foo .foo)
        * *value*


* **Sencha Touch**
    
    * *fireTap(extElement)* 
    
    * *setText(extElement, value)* 
    
    * *setTextValue(extElement, value)* 
    
    * *tapButton(btn)*
     
    * *setChecked(checkItem)*
    
    * *setUnchecked(checkItem)* 
    
    * *setSliderValue(sliderId, value)* 
    
    * *setSliderValues(sliderId, value1, value2)* 
    
    * *setToggle(toggleId, value)* 
    
    * *changeTab(barId, value)* 
    
    * *scrollBy(itemId, horizontalValue, verticalValue)* 
    
    * *scrollToTop(itemId)* 
    
    * *scrollToEnd(itemId)* 
    
    * *scrollToListIndex(listId, index)* 
    
    * *carouselNext(carouselId)* 
    
    * *carouselPrevious(carouselId)* 
    
    * *nestedlistSelect(nestedlistId, index)* 
    
    * *nestedlistBack(nestedlistId)* 
    
    * *listSelectIndex(listId, index)* 
    
    * *changeView(viewName)* 
    
    * *removePanel(panelId)* 
    
    * *setDate(dateItemId, year, month, day)* 
    
    
* **Enyo** Partly supported
    
    * *waterfall(element, eventName)* 
    * *setSelected(element, name, idx, eventname)* 
    * *next:(element)* 
    
    
* **DOM** Partly supported
    
    * *listen(name, idName, callback) * 
    * *fire(name, idName)* 
    
    
* **Angular** Will be available on next releases...
    
    
**Note:** If you need more API support, just ask :)
