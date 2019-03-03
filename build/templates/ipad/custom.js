function enterEventHandler(el)
{
    menuHL(el.id);

    var $el = $(el);

    $el.find(".popup-btn").on("tap", popupOpenHanlder);
    $el.find(".popup__close-btn").on("tap", popupCloseHanlder);

    $el.find(".tab-btn").on("tap", tabHanlder);
}

function exitEventHandler(el)
{
    var $el = $(el);

    $el.find(".popup-btn").off("tap", popupOpenHanlder);
    $el.find(".popup__close-btn").off("tap", popupCloseHanlder);

    $el.find(".tab-btn").off("tap", tabHanlder);

    closeAllPopups($el);
    resetTabs($el);
}

/*
    переход между слайдами

    html:
    <div class="js-menu-link ..." data-to="visit"></div>

    js:
    $(".js-menu-link").off("click", navigationHandler);
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
        /* главное меню */
        "visit":            "section1/ipad-02-sl",
        "additional":       "section2/ipad-02-sl",
        "pprs":             "",
        "rrs":              "",
        "comp-pitrs":       "",
    };

    var link = $(this).data("to"),
        target = "";

    if( link && (link in menu) ) {
        target = menu[link];
    }

    if( target !== "" && target !== null) {
        console.log("data-to = '" + link + "'; to slide = '" + target + "';");
        app.goTo(target);
    }
}