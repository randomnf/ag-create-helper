app.register("@@slidename", function() {

    return {
        events: {

        },
        states: [],
        onRender: function(el) {

        },
        onEnter: function(el) {
            enterEventHandler(el);
        },
        onExit: function(el) {
            exitEventHandler(el);
        }
    }

});