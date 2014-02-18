/*global define*/

define([
    'underscore',
    'backbone',
    'id3',
    'models/track',
    'views/track'
], function (_, Backbone, ID3, TrackModel, TrackView) {
    'use strict';
    ID3 = require('id3');

    var TrackCollection = Backbone.Collection.extend({
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
        renumberTracks: function () {
            console.log('TracksCollection.renumber()');
            this.each(_.bind(function(track) {
                track.set({
                    trackNumber: this.indexOf(track) + 1
                });
            }, this));
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

    return TrackCollection;
});
