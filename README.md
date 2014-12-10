CatJS 0.4.40
==============

<img align="right" width="201" height="94" src="https://raw.githubusercontent.com/catjsteam/catjs/master/resources/images/Logo48x48-01.png">

*CatJS* is an automation framework for (mobile) web applications testing.
It offers a new technology that makes testing easy, we don't do WebDriver like the other technologies, in our case the applications test themselves.
With simple annotations added to your HTML5 code, an automated functional tests will be available as part of your application lifecycle.

### Code once, deploy it anywhere <br/>

Once you added the test code you can run it using [CatJS runner](https://www.npmjs.org/package/mobilerunner) (That is already part of CatJS, no need to do any additional installations), on any platform that your application supports.
CatJS runner can deploy your application on multiple devices and desktop browsers.

### A few facts

* The annotations will be coded in comments thus no additional code is required
* Once you wish to test your application, with a simple command, a new deployment will be generated for you to use including the test code
* You get to document your tests and test your code
* When you are ready for production the additional annotations will be removed on the minify process.
* CatJS is an [NPM](https://www.npmjs.org/) and can be used as a command-line and/or as a module (The module will be available in the next releases)

[cat.js.team](http://catjsteam.github.io/) @catjsteam
You can visit our [catjs forum](https://groups.google.com/forum/#!forum/catjs). Comments and questions are more than welcome, our team can help and consult about how to test your web application.
  

## Blogs
[http://catjs.blogspot.co.il](]http://catjs.blogspot.co.il)

* Web Applications that test themselves
* Web automation testing solution

[Technology Through My Eyes](http://mobilewebtesting.wordpress.com/2014/06/22/how-to-test-your-mobile-web-application-using-catjs-part-one)

## Magazine

* [Method & tools article](http://www.methodsandtools.com/tools/catjs.php)

## CatJS - Seed project

We recommend you to try our catjs seed project on [jQuery Moblie app](http://jquerymobile.com/)  
Github project [https://github.com/ransnir/catjs-jqm-seed](https://github.com/ransnir/catjs-jqm-seed)  
Take a look on the [demo](http://ransnir.github.io/cat-project/target/catexample/index.html)

## Videos

### Getting started
[![ScreenShot](https://raw.githubusercontent.com/catjsteam/catjs/master/resources/images/catjsyoutube-s.png)](https://t.co/vBgLx9tEFF)  

### GTAC & Ignite Velocity events
[![ScreenShot](https://raw.githubusercontent.com/catjsteam/catjs/master/resources/images/gtac.jpg)](https://www.youtube.com/watch?v=gGdDc5SlBq4) [![ScreenShot](https://raw.githubusercontent.com/catjsteam/catjs/master/resources/images/velocity.jpg)](https://www.youtube.com/watch?v=nRcKAFS-Gyg)

## Release Notes

* **Note! Reports location moved to be aggregated below "reports" folder** 
* ** New Scrap Annotation - @@screenshot screenshot()**

Code example :

    <!--
      @[scrap
        @@name takeScreenshot
        @@embed true
        @@screenshot screenshot()
      ]@
    -->
  
The screenshot will be saved in the reports folder<br />
Support in iOS and android


## Documentation

* [Features](http://catjsteam.github.io/docs/core/catjs_features.html)
* [How It Works](http://catjsteam.github.io/docs/core/how_it_works.html)
* [Getting started](http://catjsteam.github.io/docs/core/getting_started.html)
* [Command Line Tool](http://catjsteam.github.io/docs/core/cli.html)
* [CatJS Project (Tool)](http://catjsteam.github.io/docs/core/catjs_tool.html)
* [Dependencies](http://catjsteam.github.io/docs/core/dependencies.html)
* [Test Project](http://catjsteam.github.io/docs/core/test_project.html)
* [Test Data](http://catjsteam.github.io/docs/core/test_data.html)
* [Annotations](http://catjsteam.github.io/docs/core/annotations.html)
* [Plugins](http://catjsteam.github.io/docs/core/plugins.html)
* [Reports](http://catjsteam.github.io/docs/core/reports.html)
* [Runner](http://catjsteam.github.io/docs/core/runner.html)
* [UI Console](http://catjsteam.github.io/docs/core/ui_console.html)
* [API](http://catjsteam.github.io/docs/core/api.html)
* [Troubleshooting & support](http://catjsteam.github.io/docs/core/troubleshooting.html)


<br/>
<div style="position: fixed; padding: 10px; top: 0; right:0; width:100%; text-align:right; cursor:pointer;" onclick="window.location.href='http://catjsteam.github.io/docs/user_guide.html'" > <span style="position: relative; right: 10px; top: 10px; padding-top:10px; font-size:10px; color:#444444">Applications That Test Themselves</span> <img align="right" width="50" height="24" src="https://raw.githubusercontent.com/catjsteam/catjs/master/resources/images/Logo48x48-01.png"></div><script> (function(){ for(var els = document.getElementsByTagName ('a'), i = els.length; i--;) { var elt = els[i]; elt.setAttribute("target","_blank"); if (elt.href.lastIndexOf(".md") !== -1) {elt.href = elt.href.split(".md").join(".html") } } })(); </script> 
