// DropboxClient

var DropboxClient = (function(){

  var Q;

  var DropboxClient = function(key, receiverURL){

    Q = require('q');

    this.client = new Dropbox.Client({
      key: key
    });

    this.client.authDriver(
      new Dropbox.AuthDriver.Popup({
        receiverUrl: receiverURL
      })
    );
  };

  DropboxClient.prototype.authenticate = function(){
    var deferred = Q.defer();
    this.client.authenticate(function(error, client){
      if(error){
        console.log("DropboxClient.authenticate() error");
        deferred.reject(error);
      } else {
        console.log("DropboxClient.authenticate() success");
        deferred.resolve(client);
      }
    });
    return deferred.promise;
  };

  DropboxClient.prototype.mkdir = function(path){
    var deferred = Q.defer();
    this.client.mkdir(path, function(error, stat){
      if(error){
        console.log("DropboxClient.mkdir() error");
        deferred.reject(error);
      } else {
        console.log("DropboxClient.mkdir() success");
        deferred.resolve(stat);
      }
    });
    return deferred.promise;
  }


  DropboxClient.prototype.writeFile = function(path, data){
    var deferred = Q.defer();
    this.client.writeFile(path, data, function(error, stat){
      if(error){
        console.log("DropboxClient.writeFile()) error");
        deferred.reject(error);
      } else {
        console.log("DropboxClient.writeFile()) success");
        deferred.resolve(stat);
      }
    });
    return deferred.promise;
  }

  DropboxClient.prototype.makeUrl = function(path, params){
    var deferred = Q.defer();
    this.client.makeUrl(path, params, function(error, urlObject){
      if(error){
        console.log("DropboxClient.makeUrl() error");
        deferred.reject(error);
      } else {
        console.log("DropboxClient.makeUrl() success");
        deferred.resolve(urlObject);
      }
    });
    return deferred.promise;
  }

  return DropboxClient;

}());

if(typeof module !== 'undefined' && module.exports) {
    module.exports = DropboxClient;
} else {
  if(typeof define === 'function' && define.amd) {
    define('DropboxClient', ['q'], function() {
      return DropboxClient;
    });
  } else {
    window.DropboxClient = DropboxClient;
  }
}