/*global ss14Team45, $*/


window.ss14Team45 = {
    Models: {},
    Collections: {},
    Views: {},
    Routers: {},
    init: function () {
        'use strict';
        console.log('Hello from Backbone!');
    }
};

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
