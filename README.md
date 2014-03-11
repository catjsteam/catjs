CAT Core
==============

<p>CAT CORE is an automation framework for mobile-web applications testing.
<br/>With simple annotations added to your HTML5 code, an automated functional tests will be available as part of your application lifecycle.
</p>

### Code once, deploy it anywhere

Once you added the test code you can run it using [CAT runner](https://www.npmjs.org/package/mobilerunner), on any platform that your application supports.
<br/>CAT runner can deploy your application on multiple devices and desktop browsers.

### A few facts

* The annotations will be coded in comments thus no additional code is required
* Once you wish to test your application, with a simple command, a new deployment will be generated for you to use including the test code
* You get to document your tests and test your code
* When you are ready for production the additional annotations will be removed on the minify process.
* CAT is an NPM and can be used as a command-line and/or as a module (The module will be available in the next releases)

[cat.js.team](http://catjsteam.github.io/) @catjsteam


## Quick start

### Installing CAT CLI
In order to get started, you'll want to install CAT's CLI (command line interface) globally.
<code>catcli</code> command will be set into your system path.

    npm install -g catjs

### Project creation
CAT has a built-in system that automates project creation. Currently it has support for two project types:

* Empty project - <code>catcli -i</code>
    * Creates a basic CAT project including:
        * *catproject.json*   CAT project
        * *package.json*      NPM metadata file
        * *phonegap.apk*      Android application for loading your testing your app
        * *Gruntfile.js*      (optional) For users that want to use Grunt

* Example project - <code>catcli --init example</code>
    * A similar empty project structure creation with additional example application


### Ok, I have a project, now what?
CAT is more than just a tool and offers other functionality not related to the mobile business.
Having said that, let's use the example application. If you didn't already, run the command and fill in the prompts:
<code>catcli --init example</code>

The example project creates two folders:

* *cat-project* folder that contains all the cat project's resources
* *app folder* that contains a basic HTML5 application powered by JQuery

The application has one page that contains a test button.
On each button click a text will be displayed, describing the number of clicks.

##### Testing the example application with CAT

Build and run CAT web server like so:
    catcli -bs

Open the browser and go to the address: http://localhost:8089

* -b stands for *build* that generates a new cloned deployment including the test inside
    * **Clone** the application into the *target* folder (see cat-project/target)
    * **Scans** the application
        * Look for CAT's annotations
        * Generates a *src* folder containing the user and CAT's auto generated code
    * **Inject** CAT's calls for the generated functionality
* -s stands for *server* it run a web server and deploy the cloned application that runs the test.

Additional OOTB tasks:
* **Clean** the deployment <code>catcli -c</code>
* Test your application using **phantomjs** <code>catcli -t</code>
* Test your application and deploy it on your **android** <code>catcli -m</code>

### Annotations (Scraps)
A single test unit is called **scrap**.
It's a single operation that can be a ui action, a JavaScript code, an assertion or all combined together.
  In the example application browse to the JavaScript file: app/app.js and look for the scrap annotation.

A brief annotations description:

* *Scrap* block <code>@[scrap ]@</code>
* *Code* property <code>@@code console.log('test')</code>
* *log* property <code>@@code 'test'</code>
* *assert* property <code>@@assert ok(true, 'a message)</code>
* *jqm* property <code>@@jqm tap(id)</code>
* *sencha* property <code>@@jqm fireTap(extElt)</code>
* *enyo* property <code>@@enyo next(enyoElt)</code>


### How the CLI works
<p>When running <code>catcli</code> command, it looks for a local project file 'catproject.json'. It means that you need to run catcli from where your project exists.</p>
<p>If locally CAT's project file is found, the CLI loads and applies the configuration from your catproject.json. Since CAT has it's own task manager system (Grunt is supported) it executes any tasks you've requested for it to run.
for example, if you wish to build your project you'll be running the following command:</p>
<code>catcli -b</code>


**Note:** Additional information will be published and will be also available in the [CAT site](http://catjsteam.github.io/).


