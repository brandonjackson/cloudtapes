/*global CloudTapes, $*/

window.CloudTapes = {
    Models: {},
    Collections: {},
    Views: {},
    Routers: {},
    init: function () {
        'use strict';
    }
};

var trackCollection = new TrackCollection();

var view = new TracksView({
    collection: trackCollection
});

var dropZoneView = new DropZoneView({
    el: "#tracks",
    emptyStateView: ".empty",
    collection: trackCollection
});
dropZoneView.delegateEvents();



var mixModel = new MixModel({
    title:"",
    author:"",
    tracks: trackCollection
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
    CloudTapes.init();
    var origin = window.location.origin;
    var client = new DropboxClient("7va0t7mtct8s7uo", origin +"/receiver.html");

    function echonestSearch(model){
    // Usage:
    //     var exampleModel = new TrackModel({ artist: "Bloc Party", title: "Banquet"});
    //     echonestSearch(exampleModel);
        var echonest_api = "GWACZPT91IQY4YD0H";
        var url = "http://developer.echonest.com/api/v4/song/search?api_key=";
        url += echonest_api;
        url += "&format=json&results=1&";
        url += "artist="+encodeURIComponent(model.get("artist")) + "&";
        url += "title="+encodeURIComponent(model.get("title")) + "&";
        url += "bucket=audio_summary";
        ///url = encodeURIComponent(url);
        console.log(url);
        var songSearch = $.ajax({
            url: url
        });

        songSearch.then(_.bind(function(data){
            console.log("songSearch data:");
            console.log(data);

            var songData = data.response.songs[0].audio_summary;
            console.log(songData);
            this.model.set(songData);


        }, {model:model}), function(error){
            console.log("ERROR");
        });
    }

    var mixInfoView = new MixInfoView({
        el: "#mix-info",
        model: mixModel
    });

    $("#bind-collection ul").sortable({
        update: function(e,ui){
            console.log('sortable.update()');
            var sortedIdList = $(this).sortable( "toArray", { attribute: "rel" } );
            trackCollection.sortByIdList(sortedIdList);
        }
    });
    
    $("#submit").click(function(){
        console.log("Submit Button Clicked");
        if (mixModel.tracks.length == 0) return false;
        $("#submit").attr("disabled", true);
        $(this).text('Uploading...');
        $("#bind-collection ul").sortable("disable");
        $(".removeTrack").hide();
        $("#mix-title").attr("disabled", true);
        $("#mix-author").attr("disabled", true);
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
                NProgress.configure({
                    trickleRate: 0.02,
                    trickleSpeed: 1000,
                    showSpinner: false
                });
                NProgress.start();
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
                                var writePromise = this.dropboxClient.writeFile(path,this.tracks[i]).then(function(){
                                }); 
                                promises.push(writePromise);
                            }

                            return Q.allSettled(promises);
                        },this)).then(_.bind(function(result){
                            console.log("All Done! Making URL...");
                            return this.dropboxClient.makeUrl(this.mix.get('folderName'),{ long: true });
                        },this)).then(_.bind(function(urlObject){
                            NProgress.done();
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
