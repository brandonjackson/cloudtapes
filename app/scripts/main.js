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
});
