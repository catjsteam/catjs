Manager
==============

## intro

The manager control the flow, order and repetitiveness of the user scraps.
The manager is very helpful for controlling the order of scraps execute.
Moreover, while regular scraps execute without any delay between one to anther, with the manager each scrap have
execute delay which is better for presentations.


## attributes

Manager name :

    @@name myName

Manager control scraps :

    @@perform[
        @@scrapName1 repeat(1)
        @@scrapName2 repeat(2)
        @@scrapName3 repeat(1)
        ....
    ]

Set as html manager (optional) :

    @@embed true

Set as main manager and not as regular scrap :

    @@manager true

Add catui (optional) :

    @@catui on

Signal when scraps are finished :

    @@signal TESTEND

###**remember to set all scraps that contains in the manager with the attribute**

    @@run@ managerName



## examples

Example - html code,  :

    <!--
        @[scrap
            @@name formDateScroll
            @@run@ scrapFormManager
            @@embed true
            @@jqm scrollTo("dateDiv");
        ]@
    -->

    <!--
        @[scrap
            @@name setDate
            @@run@ scrapFormManager
            @@embed true
            @@jqm setText("date", "2013-02-27");
        ]@
    -->

    <!--
        @[scrap
            @@name setDateAug
            @@run@ scrapFormManager
            @@embed true
            @@jqm setText("date", "2014-08-14");
        ]@
    -->
    <div id="dateDiv" data-demo-html="true">
        <label for="date">Date:</label>
        <input type="date" name="date" id="date" value="">
    </div>

    <!--
        @[scrap
            @@name scrapFormManager
            @@perform[
                @@formDateScroll repeat(1)
                @@setDate repeat(1)
                @@setDateAug repeat(1)
            ]
            @@embed true
            @@catui on
            @@manager true
            @@signal TESTEND
        ]@
    -->

