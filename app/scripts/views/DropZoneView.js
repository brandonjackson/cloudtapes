// Drag and drop target zone
// usage: 
//   var dropZoneView = new DropZoneView({
//      collection: tracksCollection,
//      emptyStateView: ".empty"
//   });
var DropZoneView = Backbone.View.extend({
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
            this.collection.addFromFile(f);
        }
    },
    onDragOver: function (e) {
        e.originalEvent.stopPropagation();
        e.originalEvent.preventDefault();
        e.originalEvent.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
    }
});