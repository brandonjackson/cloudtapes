/*global ss14Team45, Backbone*/

var MixModel= Backbone.Model.extend({

    url: '',

    initialize: function(options) {
        if(options.tracks){
            this.tracks = options.tracks;
        }
    },

    defaults: {
    },

    validate: function(attrs, options) {
    },

    parse: function(response, options)  {
        return response;
    },
    setFolderName: function(){
        var timestamp = new Date().getTime().toString();
        if(this.get("author") || this.get("")){
            var baseName = this.get("author") + "_" + this.get("title") + "_" + timestamp;
        } else {
            baseName = timestamp;
        }
        this.set({
            folderName: folderName = baseName.replace(/[^a-z0-9]/gi, '_').toLowerCase()
        });

    }
});
