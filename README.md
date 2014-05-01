CATJS 0.1.5
==============

*CATJS* is an automation framework for (mobile) web applications testing.
With simple annotations added to your HTML5 code, an automated functional tests will be available as part of your application lifecycle.

[Application Error Assertion][]

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

## Blog
[http://catjs.blogspot.co.il](]http://catjs.blogspot.co.il)
* Web Applications that test themselves
* Web automation testing solution

## Quick start
You can visit our [catjs forum](https://groups.google.com/forum/#!forum/catjs). Comments and questions are more than welcome, our team can help and consult about how to test your web application.

### First, install CAT command line
In order to get started, you'll want to install CAT's CLI (command line interface) globally. `catcli` command will be set into your system path.

    npm install -g catjs

### Then, for an easy start create a sample CAT project

1. Create an initial CAT project with a simple example application included

        catcli --init example

1. Test the application with CAT - build the test application, run CAT server and with CAT runner open the browsers and any hooked Android devices

        cd cat-project && catcli -bsr

    * -b stands for build
    * -s stands for running the web-server with the test application deployed
    * -r stands for cat runner (default configured to run chrome, firefox browsers and any USB hooked Android devices)

1. Open your favorite browser and go to: http://localhost:8089

    * CAT's tests will start running
    * CAT's console will appear in the right top corner
        * Assertions and test information display
    * Application description
        * The application has one page that contains a test button
        * On each button click a text will be displayed, describing the number of clicks
    * Application test
        * Automates the button's click a few times
        * Validating that the number of clicks are not greater than two clicks
            * It will fail the test in that case

### Example application description
Look into the file system where your generated project was created. At the root folder, two sub-folders were created:

* *cat-project* - folder that contains CAT project's resources
* *app folder*  - that contains a basic HTML5 application powered by JQuery

1. A Brief description
    1. Files  
        * CAT Project
            * catproject.json is CAT's configuration file that contains
                * Environment settings
                * plugins declarations
                * tasks declarations                               
        * Example Application 
            * Standard JQuery application resources (css, js, html)
            * Annotation tests code included
                * Browse to the JavaScript file: app/app.js and look for the scrap annotation.
                
    1. CAT build process (catcli -b)
        * CAT is looking for its configuration project (catproject.json file)
        * CAT then scan the source application (./app folder)
        * While scanning, CAT looks for its annotations, interpreter it, generates the test code and create the folders
            * *src* - CAT generated sources according to the annotations functionality
            * *target* - Cloned application with the additional CAT's test deployment resources

    1. CAT server (catcli -s)
        * Built in NodeJS's Express module
        * Point to CAT generated test deployment (./cat-project/target)


### Try it, it's cool - Add your own scrap
CAT's annotation term for a single test unit is "Scrap".

1. Try adding your own scrap in your JavaScript file:

        /*
            @[scrap
                @@name simpleSetText
                @@log This is my first scrap
            ]@
        */


1. In case it's in an HTML code add 'embed' property:

        <!--
            @[scrap
                @@name simpleSetText
                @@embed true
                @@log This is my first scrap
            ]@
        -->

1. Rebuild your project (kill the former server if it's still running)

        catcli -bs

### Application Error Assertion
catjs track your application errors and report it to the console/junit. With minimal annotation for catjs library loading you get to track your application errors.
   Combined it with catjs runner you can immediately get report about any errors on different browsers and devices.

### Next step  
Below you can find a more in depth content that will be continuously updated.   
Also you can find information in our [site](http://catjsteam.github.io/) @catjsteam    
    
    
 
Documentation (WIP)
=====================


## How the CLI works
When running `catcli` command, it looks for a local project file 'catproject.json'. It means that you need to run `catcli` from where your project exists.
If locally CAT's project file is found, the CLI loads and applies the configuration from your catproject.json. Since CAT has it's own task manager system (Grunt is supported) it executes any tasks you've requested for it to run.
    for example, if you wish to build your project you'll be running the following command: `catcli -b`



## Project creation
CAT has a built-in system that automates project creation. Currently it has support for two project types:

##### Empty project
Creates a basic CAT project

    catcli -i

* *catproject.json*   CAT project
* *package.json*      NPM metadata file
* *phonegap.apk*      Android application for loading your testing your app
* *Gruntfile.js*      (optional) For users that want to use Grunt

##### Example project
Create a basic CAT project with example application included

    catcli --init example




## Commands
CAT CLI available commands

* -b stands for *build*
    * **Create** a new cloned deployment including the test inside
    * **Clone** the application into *target* folder (see cat-project/target)
    * **Scans** the application
        * Search for CAT's annotations
    * Generates *src* folder containing the user and CAT's auto generated code
    * **Inject** CAT's calls for the generated functionality

* -s stands for *server*
    * Runs a web server and deploy the cloned application that runs the test
* -c stands for *clean*
    * Cleans the cloned deployment
* -t stands for *test*
    * Runs the application using PhantomJS (Phantom script is available within the project see phantom-script.js)
* -m stands for *mobile*
    * Currently for android (IOS is not published, yet)
    * Install and run CAT's application that runs your application deployment

TBD: There are more OOTB tasks that's need to be documented




## The catproject.json
This file contains the metadata about the project. The following configuration is a basic CAT's project skeleton.

    {
        /* The Project's name */
        "name": "example-test",

        /* Web Application's source folder */
        "apppath": "./../app",

        /* The source and target folders locations */
        "source": "src/",
        "target": "target/",

        /* CAT's server details */
        "host": "localhost",
        "port": "8089",
        "protocol": "http",

        /* The application path (can be set relative to cat-project) */
        "apppath": "./../app",

        /* Application server details (CAT's server as defaults)*/
        "appserver": {
            "host": "localhost",
            "port": "8089",
            "protocol": "http"
        },

        /* Custom CAT's plugins */
        "plugins": [],

        /* Custom CAT's tasks */
        "tasks": []
    }
Note: The comments within the configuration above are not valid for a JSON file and only for documentation purposes.



## Annotations (Scraps)  
**Scrap** is a single operation that can be a ui action, a JavaScript code, an assertion or all combined together.

A brief annotations description:

* *Scrap* block

        @[scrap ]@

* *Scrap* Properties

    * *Code* (Any JavaScript code)

        @@code console.log('test')

    * *log*

        @@code 'test'

    * *assert* (Currently [Chai](http://chaijs.com/) supported only)

        @@assert ok(true, 'a message)

    * *jqm*

        @@jqm tap(id)

    * *sencha*

        @@sencha fireTap(extElt)

    * *enyo*

        @@enyo next(enyoElt)

* TBD plugin API description (jqm, sencha, enyo)

## OOTB Plugins
### TBD

## Custom Annotation
### TBD

## Custom Plugin
### TBD


