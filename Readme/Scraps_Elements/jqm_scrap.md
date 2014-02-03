#jqm-scrap#



## intro
This plugin integrate with JQuery Mobile app.

**Please look at [Scrap](../scrap.md) for understanding scraps method.**

**jqm-scrap annotation integrates with [Manager Scrap](../manager.md)**

## setting up jqm plugin in your CAT project

1. Add jqm annotation to your catproject.json filters array

        {
            "type": "file",
            "ext": [".js"],
            "pattern": ["*jqm*"],
            "exclude": true
        }

2. Add scrap-jqm to your scrap plugins files

        {
            "name": "scrap",
            "plugins": ["scrap-common", "scrap-jqm", "custom.plugin", "init.scrap"]
        }

3. Add scrap-jqm to your inject plugins files

        {
            "name": "inject",
            "plugins": ["scrap-common", "scrap-jqm", "custom.plugin", "project.inject", "project.minify"]
        }


Finally your catproject.json should look like that
catproject.json example:

    {
        "name": "jqm-test",
        "source": "src/",
        "target": "target/",
        "host": "localhost",
        "port": "8089",
        "protocol": "http",

        "appserver": {
            "host": "localhost",
            "port": "8089",
            "protocol": "http"
        },

        "plugins": [
            {
                "name": "init.scrap",
                "type": "scrap",
                "dependency": "scan",
                "filters": [
                    {
                        "type": "file",
                        "ext": ["*"],
                        "exclude": true
                    },
                    {
                        "type": "file",
                        "ext": [".js", ".html"],
                        "exclude": false
                    },
                    {
                        "type": "file",
                        "ext": [".js"],
                        "pattern": ["*jqm*"],
                        "exclude": true
                    },
                    {
                        "type": "file",
                        "ext": [".js"],
                        "pattern": ["*mock*"],
                        "exclude": true
                    }
                ]
            },
            {
                "name": "libraries.build",
                "type": "libraries",
                "dependency": "manager",
                "imports": ["chai", "tmr", "cat"],
                "action": "build"
            },
            {
                "name": "init.copy",
                "type": "copy",
                "dependency": "scan",
                "path": "./../cat-test-app",
                "from": {
                    "path": "/"
                },
                "to": {
                    "path": "./target/jqm-test"
                }
            },
            {
                "name": "lib.copy",
                "type": "copy",
                "dependency": "scan",
                "path": "./lib",
                "from": {
                    "path": "/"
                },
                "to": {
                    "path": "./target/jqm-test/"
                }
            },
            {
                "name": "project.minify",
                "type": "minify",
                "path": "./target/jqm-test/",
                "filename": "cat.src.js",
                "src":["./src/**/*.js"]
            }
        ],

        "tasks": [
            {
                "name": "init",
                "plugins": ["init.copy", "libraries.build", "lib.copy"]
            },
            {
                "name": "scrap",
                "plugins": ["scrap-common", "scrap-jqm", "custom.plugin", "init.scrap"]
            },
            {
                "name": "inject",
                "plugins": ["scrap-common", "scrap-jqm", "custom.plugin", "project.inject", "project.minify"]
            }
        ]
    }




API Documentation
===========================

remember to use embed flag form html files

    @@embed true

### scrollTo
ScrollTo API :

    @@jqm scrollTo("html-element-id");

This scrap annotation made for page scrolling. Simulate a scrolling action from the current page position to the scrolling element id
Scrap scrollTo example:

    <!--
        @[scrap
            @@name formWidgetsScroll
            @@embed true
            @@jqm scrollTo("formWidgets");
        ]@
    -->
    <h3 id="formWidgets">Form widgets</h3>

### scrollTop
ScrollToP API :

    @@jqm scrollTop();

Simulate a scrolling action from the current page position to the top of the page
Scrap scrollTop example:

    <!--
        @[scrap
            @@name ScrollTop
            @@embed true
            @@jqm scrollTop();
        ]@
    -->

### clickRef

clickRef API :

    @@jqm clickRef("html-element-id");

Simulate clicking on element that contains href link
Scrap clickRef example:

    <!--
        @[scrap
            @@name homePageRef
            @@embed true
            @@jqm clickRef("homePage");
        ]@
    -->
    <a id="homePage" href=".././">Home</a>

### clickButton

clickButton API :

    @@jqm clickRef("html-element-id");

Simulate clicking on button
Scrap clickButton example:

    <!--
        @[scrap
            @@name buttonClick
            @@embed true
            @@jqm clickButton("buttonId");
        ]@
    -->
    <input id="buttonId" type="button" value="Click Me">

### click

    @@jqm click("html-element-id");

Commit a simple click on element and fire onClick.

    <!--
         @[scrap
            @@name eventsMenuClick
            @@embed true
            @@jqm click("eventsMenu");
        ]@
    -->
    <h3 id="eventsMenu">Events</h3>

### selectTab

    @@jqm selectTab("html-element-id");

Scrap selectTab example for selecting navTab2:

    <!--
        @[scrap
            @@name navTabSelect2
            @@embed trueclickButton
            @@jqm selectTab("navTab2");
        ]@
    -->
    <div data-role="tabs" id="tabs">
        <div data-role="navbar">
            <ul>
                <li><a id="navTab1" href="#one" data-ajax="false">one</a></li>
                <li><a id="navTab2" href="#two" data-ajax="false">two</a></li>
                <li><a id="navTab3" href="#three" data-ajax="false">three</a></li>
            </ul>
    </div>

### selectMenu

    @@jqm selectMenu("html-select-id", ["html-option-id", value]);

Select option from one of the select menu.

Scrap selectMenu example for selecting option with value 3 from "select-native-1" select menu:

    <!--
    @[scrap
        @@name selectMenu
        @@embed true
        @@jqm selectMenu("select-native-1", 3);
    ]@
    -->
    <select name="select-native-1" id="select-native-1">
        <option value="1">The 1st Option</option>
        <option value="2">The 2nd Option</option>
        <option value="3">The 3rd Option</option>
        <option value="4">The 4th Option</option>
    </select>

### swipeItemLeft

    @@jqm swipeItemLeft("html-element-id");

Commit a swipe left event on html element

Swipe on "a" element:

    <!--
        @[scrap
            @@name swipeAvery
            @@embed true
            @@jqm swipeItemLeft("swipeAvery");
        ]@
    -->
    <a id="swipeAvery" href="#demo-mail">
        <h3>Avery Walker</h3>
        <p class="topic"><strong>Re: Dinner Tonight</strong></p>
        <p>Sure, let's plan on meeting at Highland Kitchen at 8:00 tonight. Can't wait! </p>
        <p class="ui-li-aside"><strong>4:48</strong>PM</p>
    </a>

### swipeItemRight

    @@jqm swipeItemRight("html-element-id");

Commit a swipe right event on html element

Swipe on "a" element:

    <!--
        @[scrap
            @@name swipeAvery
            @@embed true
            @@jqm swipeItemRight("swipeAvery");
        ]@
    -->
    <a id="swipeAvery" href="#demo-mail">
        <h3>Avery Walker</h3>
        <p class="topic"><strong>Re: Dinner Tonight</strong></p>
        <p>Sure, let's plan on meeting at Highland Kitchen at 8:00 tonight. Can't wait! </p>
        <p class="ui-li-aside"><strong>4:48</strong>PM</p>
    </a>

### slide

    @@jqm slide("html-slide-id" , newValue);

Set slider value

Slide "slider-1" and change the value to be 25:

    <!--
        @[scrap
            @@name slider25
            @@embed true
            @@jqm slide("slider-1" , 25);
        ]@
    -->
    <input type="range" name="slider-1" id="slider-1" min="0" max="100" value="50">

### setText

    @@jqm setText("html-input-id", String);

Set text in input elements

Example : set the input in "text-basic" text to "hello world"

    <!--
        @[scrap
            @@name setTextForm
            @@jqm setText("text-basic", "hello world");
        ]@
    -->
    <input type="text" name="text-basic" id="text-basic" value="">

### setCheck

    @jqm setCheck("html-checkbox-id");

Set checkbox as check

    <!--
        @[scrap
            @@name setCheckC
            @@embed true
            @@jqm setCheck("checkbox-v-2c");
        ]@
    -->
    <fieldset data-role="controlgroup">
		<input type="checkbox" name="checkbox-v-2a" id="checkbox-v-2a">
		<label for="checkbox-v-2a">One</label>
		<input type="checkbox" name="checkbox-v-2b" id="checkbox-v-2b">
		<label for="checkbox-v-2b">Two</label>
		<input type="checkbox" name="checkbox-v-2c" id="checkbox-v-2c">
		<label for="checkbox-v-2c">Three</label>
    </fieldset>

### checkRadio

    @@jqm checkRadio("radio-type-class" , "radio-type-id" );

Set checkbox radio group to a new value.

Example : Set the checkbox radio to be check to the radio-chice-e :

        <!--
            @[scrap
                @@name hRadio
                @@embed true
                @@jqm checkRadio("hRadio" , "radio-choice-e" );
            ]@
        -->
        <div id="checkbox-radioH" data-demo-html="true">
                <fieldset data-role="controlgroup" data-type="horizontal" data-mini="true">
                    <legend>Radio buttons, mini, horizontal controlgroup:</legend>
                        <input class="hRadio" type="radio" name="radio-choice-b" id="radio-choice-c" value="list">
                        <label for="radio-choice-c">List</label>
                        <input class="hRadio" type="radio" name="radio-choice-b" id="radio-choice-d" value="grid">
                        <label for="radio-choice-d">Grid</label>
                        <input class="hRadio" type="radio" name="radio-choice-b" id="radio-choice-e" value="gallery">
                        <label for="radio-choice-e">Gallery</label>
                </fieldset>
        </div><!-- /demo-html -->


### collapsible

    @@jqm collapsible("html-collapsible-id");

Click on collapsible html element

Example : Open collapsible element

    <!--
        @[scrap
            @@name basicCollapsibleClick
            @@run@ collapsibleManager
            @@embed true
            @@jqm collapsible("basicCollapsible");
        ]@
    -->
    <div id="basicCollapsible" data-role="collapsible">
        <h4 >Heading</h4>
        <p>I'm the collapsible content. By default I'm closed, but you can click the header to open me.</p>
    </div>



