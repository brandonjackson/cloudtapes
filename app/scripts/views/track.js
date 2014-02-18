/*global define*/

define([
    'jquery',
    'underscore',
    'backbone',
    'backbone.epoxy',
    'templates'
], function ($, _, Backbone, JST) {
    'use strict';

	var TrackView = Backbone.Epoxy.View.extend({
	    tagName: "li",
	    template: _.template(
	        "<span class='trackNumber'><% trackNumber %></span> " +
	        "<span class='title'><% title %></span> " +
	        "<span class='artist'><% artist %></span>" +
	        "<a class='removeTrack' href='#'><span class='close'>x</span></a>"
	    ),//JST['app/scripts/templates/track.ejs'],
	    events: {
	        'click .removeTrack': 'removeTrack'
	    },
	    bindings: {
	        "span.title": "text:title",
	        "span.artist": "text:artist",
	        "span.trackNumber": "text:trackNumber"
	    },
	    render: function(){
	        this.$el.html( this.template(this.model.attributes));
	        this.$el.attr("rel",this.model.id);
	        return this;
	    },
	    initialize: function() {
	    	console.log('initial render...');
	    	console.log(this);
	        this.render();
	    },
	    removeTrack: function(e) {
	        e.preventDefault();
	        console.log('removing');
	        var tracks = this.model.collection;
	        this.model.trigger('destroy', this.model, this.model.collection);
	        tracks.renumberTracks();
	    }
	});

    return TrackView;
});
