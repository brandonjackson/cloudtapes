/*global ss14Team45, Backbone*/

var TrackModel= Backbone.Model.extend({

    url: '',

    initialize: function() {
        this.on("change add", this.setFileName);
    },

    defaults: {
    },

    validate: function(attrs, options) {
    },

    parse: function(response, options)  {
        return response;
    },

    setFileName: function(){
        console.log("setFileName()");
        this.set({
            fileName: this.get("trackNumber") + " - " + 
                      this.get("artist") + " - " +
                      this.get("title") +
                      ".mp3"
        });
    }
});
