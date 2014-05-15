

enyo.kind({
    name: 'CarouselItem1',
    classes: 'demo-carousel-item demo-carousel-item-1',
    components: [
        {
            classes: 'demo-wrapper-gradient',
            components: [
                {classes: 'demo-wrapper', components:[
                    {tag: 'h2', classes: 'demo-title-caption', content: 'First Page'},
                    {tag: 'h1', classes: 'demo-title', content: 'This is the first carousel demo page'},
                    {classes: 'wellcome-screen-wrapper', components: [
                        {classes: 'welcome-screen', components: [
                            {classes: 'demo-screenshot'}
                        ]}
                    ]}
                ]}
            ]
        }
    ]
});


enyo.kind({
    name: 'CarouselItem2',
    classes: 'demo-carousel-item demo-carousel-item-2',
    components: [
        {
            classes: 'demo-wrapper-gradient',
            components: [
                {classes: 'demo-wrapper', components:[
                    {tag: 'h2', classes: 'demo-title-caption', content: 'Second Page'},
                    {tag: 'h1', classes: 'demo-title', content: 'This is the second page demo'},
                    {classes: 'wellcome-screen-wrapper', components: [
                        {classes: 'welcome-screen', components: [
                            {classes: 'demo-screenshot two'}
                        ]}
                    ]}
                ]}
            ]
        }
    ]
});


enyo.kind({
    name: 'CarouselItem3',
    classes: 'demo-carousel-item demo-carousel-item-3',
    components: [
        {
            classes: 'demo-wrapper-gradient',
            components: [
                {classes: 'demo-wrapper', components:[
                    {tag: 'h2', classes: 'demo-title-caption', content: 'Third Page'},
                    {tag: 'h1', classes: 'demo-title', content: 'This is the third demo Page'},
                    {classes: 'wellcome-screen-wrapper', components: [
                        {classes: 'welcome-screen', components: [
                            {classes: 'demo-screenshot'}
                        ]},
                        {classes: "go-button", content: "Let's go!", ontap: "showApp", popup: "basicPopup"},
                        {name: "basicPopup", kind: "onyx.Popup", centered: true, floating: true, classes:"onyx-sample-popup", modal:true, style: "opacity:.7;padding: 50 120 50 120;", content: "Popup..."}
                    ]}
                ]}
            ]
        }
    ],

    showApp: function(inSender) {

        var p = this.$[inSender.popup];
        if (p) {
            p.show();
        }
    }
});

enyo.kind({
    name: "Carousel",
    kind: "FittableRows",
    fit: true,
    classes: "demo demo-carousel",
    components: [{
        classes: "demo-carousel-wrapper",
        kind: "FittableRows",
        fit: true,
        components: [
            {classes: 'fake', style: 'display: none;'},
            {kind: "Panels", name: "pagesList", arrangerKind: "LeftRightArranger", margin: 0, index: 0, fit:true, narrowFit: false,
                classes: "panels-sample-panels enyo-border-box rooms-list-panels", onTransitionFinish: "slideHandler", components: [
                    {kind: 'CarouselItem1', name: 'CarouselItem1'},
                    {kind: 'CarouselItem2', name: 'CarouselItem2', style: 'opacity: 0'},
                    {kind: 'CarouselItem3', name: 'CarouselItem3', style: 'opacity: 0'}
            ]},
            {name: 'carouselIndicator', classes: 'carousel-indicator', components: [{ classes: 'carousel-indicator-wrapper', components: [{classes: 'circle a'}, {classes: 'circle b'}, {classes: 'circle c'}]}] }
        ]
    }],
    rendered: function () {
        this.inherited(arguments);
        this.$.CarouselItem2.applyStyle('opacity', '1');
        this.$.CarouselItem3.applyStyle('opacity', '1');

        var _me = this,
            pagesList = _me.$.pagesList,
            btn = _me.$.CarouselItem3;

        /*
             @[scrap
                 @@name enyoNext
                 @@context pagesList
                 @@enyo next(pagesList)
                 @@assert ok(true, "Fake test")
             ]@
         */

        /*
           @[scrap
                @@name letsGo
                @@context btn
                @@enyo waterfall(btn, "ontap")
                @@assert ok(true, "Fake test")
           ]@

         */

    },
    slideHandler: function (inSender, inEvent) {
        var i, len = 3;
        for (i = 0; i < len; i += 1 ) {
            this.$.carouselIndicator.removeClass('s' + i);
        }

        this.$.carouselIndicator.addClass('s' + inEvent.toIndex);
        /*
            @@scrap@SingleLine@@inject console.log("Single Scrap example");
        */

    }
});