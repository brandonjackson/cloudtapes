/*global define*/

define([
    'underscore',
    'backbone'
], function (_, Backbone) {
    'use strict';

    var MixModel = Backbone.Model.extend({
        defaults: {
        },

        url: '',

	    initialize: function(options) {
	        if(options.tracks){
	            this.tracks = options.tracks;
	        }
	    },

	    // Generates Folder Name for use on Dropbox. These folder names
	    // are not guaranteed to be unique, and should be verified.
	    // 
	    // If Mix has details:
	    //   Author Name - Album Title (mm-dd-yyyy)
	    // Else:
	    //   CloudTapes Mixtape (mm-dd-yyyy)
	    setFolderName: function(){
	        var timestamp = new Date().getTime();
	        if(this.get("author") || this.get("title")){
	            var baseName = this.get("author") + " - " + this.get("title");
	        } else {
	            baseName = "CloudTapes Mixtape";
	        }
	        var folderName = baseName.replace(/[^a-z0-9\s\(\)\-\&]/gi, '') + " (" + timestamp + ")";
	        this.set({
	            folderName: folderName
	        });
	    },
	    setImageFromFile: function(imageFile, type) {
	        console.log("Setting image");
	        var type = imageFile.type;
	        var reader = new FileReader();
	        var reader2 = new FileReader();
	        reader.onload = _.bind(function(evt) {
	            var dataView = new DataView(evt.target.result);
	            this.set("imageFile", new Blob([dataView], {type: type}));
	            console.log(this.get("imageFile"));
	        }, this);
	        reader.readAsArrayBuffer(imageFile);
	        reader2.onload = _.bind(function(evt) {
	            this.set("imageURI", evt.target.result);
	        }, this);
	        reader2.readAsDataURL(imageFile);
	    }
    });

    return MixModel;
});
