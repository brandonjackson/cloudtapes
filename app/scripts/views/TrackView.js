var TrackView = Backbone.Epoxy.View.extend({
    tagName: "li",
    events: {
        'click.removeTrack': 'removeTrack'
    },
    bindings: {
        "span.title": "text:title",
        "span.artist": "text:artist",
        "span.trackNumber": "text:trackNumber"
    },
    template: _.template(
        "<span class='trackNumber'><% trackNumber %></span> " +
        "<span class='title'><% title %></span> " +
        "<span class='artist'><% artist %></span>" +
        "<a class='removeTrack' href='#'><span class='close'>x</span></a>"
    ),
    render: function(){
        this.$el.html( this.template(this.model.attributes));
        this.$el.attr("rel",this.model.id);
        return this;
    },
    initialize: function() {
        this.render();
    },
    removeTrack: function(e) {
        e.preventDefault();
        this.model.trigger('destroy', this.model, this.model.collection);
    }
});