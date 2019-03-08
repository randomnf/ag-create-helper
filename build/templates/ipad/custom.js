$(function() {
    // some presentation-specific fns here
});

function enterEventHandler(el)
{
    menuHighlightHandler(el.id);

    var $el = $(el),
        $popupBtns = $el.find(".popup-btn"),
        $popupCloseBtns = $el.find(".popup__close-btn");

    $popupBtns.on("tap", popupOpenHandler);
    $popupCloseBtns.on("tap", popupCloseHandler);

    var $pdfLinks = $el.find(".pdf-link");

    $pdfLinks.on("tap", pdfOpenHandler);
}

function exitEventHandler(el)
{
    var $el = $(el),
        $popupBtns = $el.find(".popup-btn"),
        $popupCloseBtns = $el.find(".popup__close-btn");

    $popupBtns.off("tap", popupOpenHandler);
    $popupCloseBtns.off("tap", popupCloseHandler);

    var $pdfLinks = $el.find(".pdf-link");

    $pdfLinks.off("tap", pdfOpenHandler);

    closeAllPopups($el);
}

function popupOpenHandler(e)
{
    if(e)
    {
        e.preventDefault();
        e.stopPropagation();
    }

    var data_popup = $(this).data('target');
    $('.popup.' + data_popup).removeClass('popup_hidden');
}

function popupCloseHandler(e)
{
    if(e)
    {
        e.preventDefault();
        e.stopPropagation();
    }

    var $popup = $(this).parent();
    $popup.addClass('popup_hidden');
}

function closeAllPopups($el)
{
    $el.find(".popup").addClass("popup_hidden");
}

/*
    переход между слайдами

    html:
    <a class="js-menu-link ..." data-to="visit"></a>

    js:
    $(".js-menu-link").on("click", navigationHandler);
*/
function navigationHandler(e)
{
    if(e)
    {
        e.preventDefault();
        e.stopPropagation();
    }

    var menu = {
        "home":             "home/slide-010--product",
        "visit":            "visit/slide-020--product",
        "additional":       "additional/slide-040--product",
    };

    var link = $(this).data("to"),
        target = "";

    if( link && (link in menu) ) 
    {
        target = menu[link];
    }

    if( target !== "" && target !== null)
    {
        // console.log("data-to = '" + link + "'; to slide = '" + target + "';");

        app.goTo(target);
    }
}

/**
 * Highlights menu link respective to current Slide ID
 * 
 * @param {String} slideID Slide ID in "section/slide" format returned by app.getPath()
 */
function menuHighlightHandler(slideID)
{
    // console.log("menuHighlightHandler fn; slideID = '" + slideID + "'");

    var btnToHLClass = "";
    switch(slideID)
    {
        case "slide-010--product":
        btnToHLClass = ".menu-custom__btn_t_home";
        break;
        case "slide-020--product":
        case "slide-030--product":
            btnToHLClass = ".menu-custom__btn_t_visit";
            break;
        case "slide-040--product":
        case "slide-050--product":
        case "slide-060--product":
        case "slide-070--product":
            btnToHLClass = ".menu-custom__btn_t_additional";
            break;
        default:
            break;
    }

    $(".menu-custom__btn").removeClass("menu-custom__btn_active");
    if(btnToHLClass !== "")
    {
        $(btnToHLClass).addClass("menu-custom__btn_active");
    }
}

function pdfOpenHandler(e)
{
    if(e)
    {
        e.preventDefault();
        e.stopPropagation();
    }

    var pdf = $(this).attr("data-pdf");

    if(pdf)
    {
        ag.openPDF(pdf);
    }
}