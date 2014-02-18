/*global define*/

define([
    'jquery',
    'underscore',
    'backbone',
    'backbone.epoxy',
    'templates'
], function ($, _, Backbone, JST) {
    'use strict';

    var MixInfoView = Backbone.Epoxy.View.extend({
        template: JST['app/scripts/templates/mixinfo.ejs'],
        bindings: "data-bind"
    });

    return MixInfoView;
});
