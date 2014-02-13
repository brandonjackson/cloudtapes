// EchoNestClient

var EchonestClient = (function(){

  var BASE_URL = "http://developer.echonest.com/api/v4/";
  
  var EchonestClient = function(apiKey){
    this.apiKey = apiKey;
  };

  EchonestClient.prototype._query = function(endpoint, data){
    return $.ajax({
      url: BASE_URL + endpoint,
      data: _.extend({
        "api_key": this.apiKey,
        "format": "json"
      }, data)
    });
  };

  EchonestClient.prototype.findTrack = function(trackData){
    return this._query("song/search", {
      artist: trackData.artist,
      title: trackData.title,
      bucket: "audio_summary",
      results: 1
    });
  };

  return EchonestClient;

}());