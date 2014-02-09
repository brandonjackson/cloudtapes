/*global ss14Team45, $*/
var FOLDER_NAME = "test";


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

var TracksCollection = Backbone.Collection.extend({
    model: TrackModel,
    view: TrackView,
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
    toFileList: function(){
        return this.pluck("file");
    },
    addFromFile: function(f){
        ID3.readFile(f)
            .then(_.bind(function(tags){
                console.log("ID3.readFile() success:");
                console.log(tags);
                var track = new TrackModel({
                    title: tags.title,
                    artist: tags.artist,
                    size: this.f.size,
                    file: this.f,
                    id: _.uniqueId(),
                    trackNumber: this.collection.length + 1
                });
                this.collection.add(track);
            },{ collection: this, f:f }))
            .fail(function(err){
                console.log("ID3.readFile() failed:");
                console.log(err);
            });
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
    emptyStateView: ".empty",
    collection: tracksCollection
});
dropZoneView.delegateEvents();

var mixModel = new MixModel({
    title:"Hello World",
    author:"Brandon Jackson",
    tracks: tracksCollection
});

var MixInfoView = Backbone.Epoxy.View.extend({
    el: "#mix-info",
    bindings: "data-bind"
});


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

    var mixInfoView = new MixInfoView({
        model: mixModel
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
