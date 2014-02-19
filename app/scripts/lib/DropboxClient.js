// DropboxClient

var DropboxClient = (function(){

  var Q, _;

  var DropboxClient = function(key, receiverURL){

    Q = require('q');
    _ = require('underscore');

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


  // Ensures directory path uniqueness by adding suffix on error.
  DropboxClient.prototype.mkdirUnique = function(path){
    return this.mkdir(path).fail(_.bind(function(error){
      if(error.response.error.substr("already exists")!==-1){
        console.log("DropboxClient.mkdirUnique() error: folder already exists");

        // If last character of path is a number, increment it. Else attach a '2'.
        var finalChar = parseInt(path.charAt(path.length - 1));
        if(isNaN(finalChar)){
          path += " 2";
        } else {
          path = path.substr(0,path.length-1) + (finalChar+1);
        }
        return this.mkdirUnique(path);
      }
    },this));
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
    define('DropboxClient', ['q','underscore'], function() {
      return DropboxClient;
    });
  } else {
    window.DropboxClient = DropboxClient;
  }
}