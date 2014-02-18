/*global require*/
'use strict';

require.config({
    shim: {
        'jquery-ui': {
            deps: ['jquery'],
            exports: '$'
        },
        underscore: {
            exports: '_'
        },
        backbone: {
            deps: [
                'underscore',
                'jquery'
            ],
            exports: 'Backbone'
        },
        'backbone.epoxy': {
            deps: ['backbone'],
            exports: 'Backbone'
        },
        bootstrap: {
            deps: ['jquery'],
            exports: 'jquery'
        },
        q: {
            deps: [],
            exports: 'Q'
        },
        nprogress: {
            deps: [],
            exports: 'NProgress'
        },
        'id3reader': {
            deps: [],
            exports: 'ID3Reader'
        },
        'id3':{
            deps: [
                'id3reader',
                'q'
            ],
            exports: 'ID3'
        }
    },
    paths: {
        jquery: '../bower_components/jquery/jquery',
        'jquery-ui': '../bower_components/jquery-ui/ui/jquery-ui',
        backbone: '../bower_components/backbone/backbone',
        'backbone.epoxy': '../bower_components/backbone.epoxy/backbone.epoxy',
        underscore: '../bower_components/underscore/underscore',
        bootstrap: '../bower_components/sass-bootstrap/dist/js/bootstrap',
        q: '../bower_components/q/q',
        nprogress: '../bower_components/nprogress/nprogress',
        'id3reader': 'lib/id3reader',
        'id3': 'lib/id3',
        'DropboxClient': 'lib/DropboxClient',
        'EchonestClient': 'lib/EchonestClient'
    }
});

require([
    'jquery',
    'jquery-ui',
    'underscore',
    'backbone',
    'backbone.epoxy',
    'q',
    'nprogress',
    'DropboxClient',
    'EchonestClient',
    'id3reader',
    'id3',
    'collections/track',
    'models/mix',
    'models/track',
    'views/dropzone',
    'views/imagedropzone',
    'views/mixinfo',
    'views/track',
    'views/tracks',
], function (){

    var 
        Q = require('q'),
        DropboxClient = require('DropboxClient'),
        EchonestClient = require('EchonestClient'),
        ID3Reader = require('id3reader'),
        ID3 = require('id3'),
        Backbone = require('backbone'),
        NProgress = require('nprogress'),
        TrackCollection = require('collections/track'),
        MixModel = require('models/mix'),
        TrackModel = require('models/track'),
        DropZoneView = require('views/dropzone'),
        ImageDropZoneView = require('views/imagedropzone'),
        MixInfoView = require('views/mixinfo'),
        TrackView = require('views/track'),
        TracksView = require('views/tracks');

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
        //CloudTapes.init();
        var origin = window.location.origin;
        var client = new DropboxClient("7va0t7mtct8s7uo", origin +"/receiver.html");

        // var ECHONEST_API_KEY = "GWACZPT91IQY4YD0H";
        // var echonestClient = new EchonestClient(ECHONEST_API_KEY);
        
        // // EchoNest Demo:
        // var songSearch = echonestClient.findTrack({ 
        //     artist: "Bloc Party", 
        //     title: "Banquet" 
        // }).then(function(data){
        //     var songData = data.response.songs[0].audio_summary;
        //     console.log(songData);
        // }, function(error){
        //     console.log("ERROR");
        // });

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

});
