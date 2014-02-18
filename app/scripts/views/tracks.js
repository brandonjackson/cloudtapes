/*global define*/

define([
    'jquery',
    'underscore',
    'backbone',
    'backbone.epoxy',
    'templates'
], function ($, _, Backbone, JST) {
    'use strict';

    var TracksView = Backbone.Epoxy.View.extend({
	    el: "#bind-collection",
	    template: JST['app/scripts/templates/tracks.ejs']
	});

    return TracksView;
});
