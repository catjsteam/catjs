/**
 * Demonstrates how use an Ext.Carousel in vertical and horizontal configurations
 */
Ext.define('Kitchensink.view.Carousel', {
    extend: 'Ext.Container',

    requires: [
        'Ext.carousel.Carousel'
    ],

    config: {
        cls: 'cards',
        layout: {
            type: 'vbox',
            align: 'stretch'
        },
        defaults: {
            flex: 1
        },
        items: [{
            xtype: 'carousel',
            itemId : 'carouselHorizontal',
            listeners  : {

                painted : function ( ele, value, oldValue, eOpts ) {
                    /*
                     @[scrap
                     @@name carouselHorNext1
                     @@run@ carouselManager
                     @@sencha carouselNext("carouselHorizontal");
                     ]@
                     */

                    /*
                     @[scrap
                     @@name carouselHorNext2
                     @@run@ carouselManager
                     @@sencha carouselNext("carouselHorizontal");
                     ]@
                     */

                    /*
                     @[scrap
                     @@name carouselHorPrevious
                     @@run@ carouselManager
                     @@sencha carouselPrevious("carouselHorizontal");
                     ]@
                     */

                    /*
                     @[scrap
                     @@name GoToLists
                     @@run@ carouselManager
                     @@sencha nestedlistSelect("mainNestedList", 3);
                     ]@
                     */

                    /*
                     @[scrap
                     @@name GoToBasicList
                     @@run@ carouselManager
                     @@sencha nestedlistSelect("mainNestedList", 0);
                     ]@
                     */


                    /*
                     @[scrap
                     @@name carouselManager
                     @@perform[
                     @@carouselHorNext1 repeat(1)
                     @@carouselHorNext2 repeat(1)
                     @@carouselHorPrevious repeat(1)
                     @@carouselVerNext1 repeat(1)
                     @@carouselVerNext2 repeat(1)
                     @@carouselVerPrevious1 repeat(1)
                     @@carouselVerPrevious2 repeat(1)
                     @@GoToLists repeat(1)
                     @@GoToBasicList repeat(1)
                     ]
                     @@catui on
                     @@manager true
                     @@signal TESTEND
                     ]@
                     */
                }

            },
            items: [{
                html: '<p>Swipe left to show the next card&hellip;</p>',
                cls: 'card'
            },
                {
                    html: '<p>You can also tap on either side of the indicators.</p>',
                    cls: 'card'
                },
                {
                    html: 'Card #3',
                    cls: 'card'
                }]

        }, {
            xtype: 'carousel',
            ui: 'light',
            direction: 'vertical',
            itemId : 'carouselVertical',
            listeners  : {

                painted : function ( ele, value, oldValue, eOpts ) {
                    /*
                     @[scrap
                     @@name carouselVerNext1
                     @@run@ carouselManager
                     @@sencha carouselNext("carouselVertical");
                     ]@
                     */

                    /*
                     @[scrap
                     @@name carouselVerNext2
                     @@run@ carouselManager
                     @@sencha carouselNext("carouselVertical");
                     ]@
                     */

                    /*
                     @[scrap
                     @@name carouselVerPrevious1
                     @@run@ carouselManager
                     @@sencha carouselPrevious("carouselVertical");
                     ]@
                     */

                    /*
                     @[scrap
                     @@name carouselVerPrevious2
                     @@run@ carouselManager
                     @@sencha carouselPrevious("carouselVertical");
                     ]@
                     */

                }

            },

            items: [{
                html: '<p>Carousels can also be vertical <em>(swipe up)&hellip;</p>',
                cls: 'card dark'
            },
                {
                    html: 'And can also use <code>ui:light</code>.',
                    cls: 'card dark'
                },
                {
                    html: 'Card #3',
                    cls: 'card dark'
                }]
        }]
    }
});
