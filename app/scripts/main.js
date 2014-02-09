/*global ss14Team45, $*/
var FOLDER_NAME = "test";


window.ss14Team45 = {
    Models: {},
    Collections: {},
    Views: {},
    Routers: {},
    init: function () {
        'use strict';
    }
};

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
    title:"",
    author:"",
    tracks: tracksCollection
});

var MixInfoView = Backbone.Epoxy.View.extend({
    el: "#mix-info",
    bindings: "data-bind"
});

var imageDropZoneView = new ImageDropZoneView({
    el: "#image",
    emptyStateView: ".empty",
    imageHolder: ".imageHolder",
    model: mixModel
});
imageDropZoneView.delegateEvents();

// Submit To Dropbox

$(document).ready(function () {
    'use strict';
    ss14Team45.init();
    var origin = window.location.origin;
    var client = new DropboxClient("f6u02e6s8nett1d", origin +"/receiver.html");

    // client.authenticate()
    //     .then(function(client){
    //       return client.mkdir("cirrus");
    //     })
    //     .then(function(stat){
    //       return client.writeFile("cirrus/hello_world.txt", "Hello, world!\n");
    //     })
    //     .then(function(stat){
    //       return client.makeUrl("cirrus",{ long: true });
    //     })
    //     .then(function(urlObject){
    //       console.log(urlObject);
    //       alert("URL: "+urlObject.url+"?dl=1");
    //     })
    //     .fail(function(error){
    //       console.log(error);
    //       alert("An Unexpected Error Has Occurred");
    //     });

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
        $(this).removeClass('btn-success');
        $(this).addClass('btn-disabled');
        $(this).text('Uploading...');
        upload(mixModel,client);
    });

    function upload(mix, dropboxClient){

    // 1) rewrite files
    //     - prep files, info arrays
    //     - handle cb(error,tracks,playlist)
    // 2) get trackCollections.folderName
    // 3) writeFiles to dropbox, checking progress
        var files = mix.tracks.toFileList();
        var info = mix.toJSON();
        info.tracks = mix.tracks.toJSON();
        console.log("info passed to id3.makeplaylist");
        console.log(info);
        dropboxClient.authenticate()
            .then(_.bind(function(client){
                 ID3.makePlaylist(this.files, this.info, _.bind(function(error, tracks){

                    this.error = error;
                    this.tracks = tracks;

                    console.log(this.error);
                    console.log(this.tracks);

                    this.mix.setFolderName();

                    if(this.error){
                        // error handling code here
                    }

                    // grab folderName
                    this.dropboxClient.mkdir(this.mix.get("folderName"))
                        .then(_.bind(function(stat){
                            console.log('mkdir success, creating files');

                            var promises = [];

                            // create folder
                            for(var i=0; i < this.tracks.length; i++){
                                var path = this.mix.get("folderName") + "/"+ this.mix.tracks.at(i).get("fileName");
                                console.log("Uploading File to "+path);
                                var writePromise = this.dropboxClient.writeFile(path,this.tracks[i]);
                                promises.push(writePromise);
                            }

                            return Q.allSettled(promises);
                        },this)).then(_.bind(function(result){
                            console.log("All Done! Making URL...");
                            return this.dropboxClient.makeUrl(this.mix.get('folderName'),{ long: true });
                        },this)).then(_.bind(function(urlObject){
                            console.log("Download Link:");
                            console.log(urlObject.url);
                            console.log($);
                            console.log($("#submit"));
                            $("#submit").hide();
                            $("#download").show();
                            $("#download #zip").attr("href",urlObject.url+"?dl=1");
                            $("#download #download-url").attr("value",urlObject.url);
                        },this)).fail(function(error){
                            // handle errors
                        });
                },this));
            }, { files: files, info: info, mix: mix, dropboxClient: dropboxClient}))
            .fail(function(error){
                console.log("ERROR! outerpmost promise was rejected");
                console.log(error);
            });
       
    }
});
