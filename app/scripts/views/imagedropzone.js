var ImageDropZoneView = Backbone.View.extend({
    events: {
        "dragover": "onDragOver",
        "drop": "onDrop"
    },
    initialize: function(options){

        // save empty state view
        if(options.emptyStateView){
            this.emptyStateView = this.$el.children(options.emptyStateView);
        }
        if (options.imageHolder) {
            this.imageHolder = this.$el.children(options.imageHolder);
        }
        this.model = options.model;
        this.model.on("change:imageURI", _.bind(this.refresh,this));
    },

    // Hide emptyState view when there are items in the list
    refresh: function(){
        if(this.emptyStateView){}
        var emptyStateView = this.$el.children(".empty");
        if (this.model.get("imageURI")) {
            this.emptyStateView.hide();
            this.imageHolder.children(".actualImage").attr("src", this.model.get("imageURI"));
            this.imageHolder.show();
        } else {
            this.emptyStateView.show();
            this.imageHolder.show();
        }
    },
    onDrop: function(e){
        console.log('dropping');
        e.originalEvent.stopPropagation();
        e.originalEvent.preventDefault();

        var imageFile = e.originalEvent.dataTransfer.files[0]; // FileList object.
        console.log(imageFile.type);
        if (["image/png","image/gif","image/jpg","image/jpeg","image/bmp"].indexOf(imageFile.type) == -1) return false;
        this.model.setImageFromFile(imageFile);
    },
    onDragOver: function (e) {
        console.log('dragging');
        e.originalEvent.stopPropagation();
        e.originalEvent.preventDefault();
        e.originalEvent.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
    }
});