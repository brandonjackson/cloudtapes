var TrackView = Backbone.Epoxy.View.extend({
    tagName: "li",
    bindings: {
        "span.title": "text:title",
        "span.artist": "text:artist",
        "span.trackNumber": "text:trackNumber"
    },
    template: _.template(
        "<span class='trackNumber'><% trackNumber %></span> " +
        "<span class='title'><% title %></span> " +
        "<span class='artist'><% artist %></span>"
    ),
    render: function(){
        this.$el.html( this.template(this.model.attributes));
        this.$el.attr("rel",this.model.id);
        return this;
    },
    initialize: function() {
        this.render();
    }
});