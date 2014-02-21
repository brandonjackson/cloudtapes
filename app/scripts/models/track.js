/*global define*/

define([
    'underscore',
    'backbone',
    'EchonestClient'
], function (_, Backbone, EchonestClient) {
    'use strict';

    var TrackModel = Backbone.Model.extend({
	    url: '',

	    initialize: function() {
	        this.on("change:trackNumber change:artist add", this.setFileName);
	        this.on("add", this.fetchEchonestData);
	    },

	    defaults: {
	    },

	    validate: function(attrs, options) {
	    },

	    parse: function(response, options)  {
	        return response;
	    },

	    setFileName: function(){
	        this.set({
	            fileName: this.get("trackNumber") + " - " + 
	                      this.get("artist") + " - " +
	                      this.get("title") +
	                      ".mp3"
	        });
	    },

	    fetchEchonestData: function(){
	        var ECHONEST_API_KEY = "GWACZPT91IQY4YD0H";
	        var echonestClient = new EchonestClient(ECHONEST_API_KEY);
	        echonestClient.findTrack(this.toJSON())
	        	.then(_.bind(function(data){
	        		var audioData = data.response.songs[0].audio_summary;
	        		this.set(audioData);
	        		console.log("Track Model:");
	        		console.log(this.toJSON());
	        	}, this), function(error){
	        		console.log("error loading echonest data");
	        	});
	    }
    });

    return TrackModel;
});
