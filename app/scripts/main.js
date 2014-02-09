/*global ss14Team45, $*/


window.ss14Team45 = {
    Models: {},
    Collections: {},
    Views: {},
    Routers: {},
    init: function () {
        'use strict';
        console.log('Hello from Backbone!');
        Backbone.history.start();
        console.log('History started');
    }
};

var Router = Backbone.Router.extend({

  routes: {
    "":                 "index",
    "receiver":        "receiver"
  },

  index: function() {
    console.log('back to index');
  },

  receiver: function() {
    console.log('receiver');
  }

});

var router = new Router();

var ListItemView = Backbone.Epoxy.View.extend({
    tagName: "li",
    bindings: {
        "span.title": "text:title",
        "span.artist": "text:artist"
    },
    template: _.template("<span class='title' rel='<% id %>'><% title %></span>"),
    render: function(data){
        this.$el.html( this.template(this.model.attributes));
        this.$el.attr("rel",this.model.id);
        return this;
    },
    initialize: function() {
        this.$el.html( this.template(this.model.attributes));//this.model.get("title") );
    }
});

var TracksCollection = Backbone.Collection.extend({
    model: TrackModel,
    view: ListItemView,
    initialize: function(options){
        this.on("change:trackNumber",function(){
            this.sort();
        });
    },
    comparator: function(track){
        return track.get("trackNumber");
    },
    uploadFiles: function(folder, client){
        console.log("TracksCollection.uploadFiles()");
        for(var i=0; i<this.length; i++){
            var f = this.at(i).get("file");
            var reader = new FileReader();
            reader.onload = (function(theFile){
                return function(e){
                    console.log("reader.onload fired()");
                    console.log(e.target.result);
                    client.writeFile(FOLDER_NAME+"/"+theFile.name, e.target.result);
                }
            })(f);
            reader.readAsArrayBuffer(f);
        }
    },
    sortByIdList: function(ids){

        console.log('TracksCollection.sortByIdList()');
        for(var i=0; i < ids.length; i++){
            var model = this.get(ids[i]);
            model.set({
                trackNumber: i+1
            });
        }
    },
    }
});

var DropZoneView = Backbone.View.extend({
    events: {
        "dragover": "onDragOver",
        "drop": "onDrop"
    },
    initialize: function(options){
        this.collection = options.collection;
    },
    onDrop: function(e){
        console.log("onDrop()");
        console.log(e);
        e.originalEvent.stopPropagation();
        e.originalEvent.preventDefault();

        var files = e.originalEvent.dataTransfer.files; // FileList object.

        // files is a FileList of File objects. List some properties.
        var output = [];
        for (var i = 0, f; f = files[i]; i++) {
            var track = new TrackModel({
                title: f.name,
                artist: f.size + "",
                file: f
            });
            this.collection.add(track);
        }
    },
    onDragOver: function (e) {
        e.originalEvent.stopPropagation();
        e.originalEvent.preventDefault();
        e.originalEvent.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
    }
});

var ListView = Backbone.Epoxy.View.extend({
    el: "#bind-collection"
});

var tracksCollection = new TracksCollection();

var view = new ListView({
    collection: tracksCollection
});

var dropZoneView = new DropZoneView({
    el: "#tracks",
    collection: tracksCollection
});
dropZoneView.delegateEvents();

$(document).ready(function () {
    'use strict';
    ss14Team45.init();
    var client = new DropboxClient("f6u02e6s8nett1d", "http://localhost:9000/receiver.html");

    client.authenticate()
        .then(function(client){
          return client.mkdir("cirrus");
        })
        .then(function(stat){
          return client.writeFile("cirrus/hello_world.txt", "Hello, world!\n");
        })
        .then(function(stat){
          return client.makeUrl("cirrus",{ long: true });
        })
        .then(function(urlObject){
          console.log(urlObject);
          alert("URL: "+urlObject.url+"?dl=1");
        })
        .fail(function(error){
          console.log(error);
          alert("An Unexpected Error Has Occurred");
        });

    $("#bind-collection ul").sortable({
        update: function(e,ui){
            console.log('sortable.update()');
            var sortedIdList = $(this).sortable( "toArray", { attribute: "rel" } );
            tracksCollection.sortByIdList(sortedIdList);
        }
    });
    
    $("#submit").click(function(){
        console.log("Submit Button Clicked");
        tracksCollection.uploadFiles(FOLDER_NAME,client);
    });
});
