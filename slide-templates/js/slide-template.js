app.register("@@slidename", function() {

    return {
        events: {

        },
        states: [],
        onRender: function(el) {

        },
        onEnter: function(el) {
            enterEventHanlder(el);
        },
        onExit: function(el) {
            exitEventHanlder(el);
        }
    }

});