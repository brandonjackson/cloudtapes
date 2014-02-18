/*global define*/

define([
    'jquery',
    'underscore',
    'backbone',
    'templates'
], function ($, _, Backbone, JST) {
    'use strict';

    var DropZoneView = Backbone.View.extend({
        template: JST['app/scripts/templates/dropzone.ejs'],
	    events: {
	        "dragover": "onDragOver",
	        "drop": "onDrop"
	    },
	    initialize: function(options){

	        // save empty state view
	        if(options.emptyStateView){
	            this.emptyStateView = this.$el.children(options.emptyStateView);
	        }
	        this.collection = options.collection;
	        this.collection.on("add remove", _.bind(this.refresh,this));
	    },

	    // Hide emptyState view when there are items in the list
	    refresh: function(){
	        if(this.emptyStateView){}
	        var emptyStateView = this.$el.children(".empty");
	        (this.collection.length > 0) ? this.emptyStateView.hide() : this.emptyStateView.show();
	    },
	    onDrop: function(e){
	        e.originalEvent.stopPropagation();
	        e.originalEvent.preventDefault();

	        var files = e.originalEvent.dataTransfer.files; // FileList object.

	        // files is a FileList of File objects. List some properties.
	        var output = [];
	        for (var i = 0, f; f = files[i]; i++) {
	            if (["audio/mpeg3","audio/mp3","audio/mpeg", "audio/x-mpeg-3"].indexOf(f.type) == -1) return false;
	            this.collection.addFromFile(f);
	        }
	    },
	    onDragOver: function (e) {
	        e.originalEvent.stopPropagation();
	        e.originalEvent.preventDefault();
	        e.originalEvent.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
	    }
    });

    return DropZoneView;
});
