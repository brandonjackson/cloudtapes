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
        return this;
    },
    initialize: function() {
        this.$el.html( this.template(this.model.attributes));//this.model.get("title") );
    }
});

var TracksCollection = Backbone.Collection.extend({
    model: TrackModel,
    view: ListItemView,
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

    }
});

var ListView = Backbone.Epoxy.View.extend({
    el: "#bind-collection"
});

var tracksCollection = new TracksCollection();

var view = new ListView({
    collection: tracksCollection
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

    $("#bind-collection ul").sortable({
        update: function(e,ui){
            var sortedIdList = $("#bind-collection ul").sortable( "toArray", { attribute: "rel" } );
            tracksCollection.sortByIdList(sortedIdList);
        }
    });
});
