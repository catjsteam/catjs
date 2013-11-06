
function main() {
    var imagesSecondary = ['schedule_room_img.png?v=2'],
        imagesPath = 'images/',
        widget;



    function loadImageSilent (src) {
        var image = new Image();
        image.src = imagesPath + src;
    }


    widget = new Carousel();

    widget.renderInto(document.body);
    document.body.style.opacity = '1';
    imagesSecondary.forEach(loadImageSilent);
}

window.onload = function() {
    main();
}