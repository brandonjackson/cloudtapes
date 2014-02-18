/*
Copyright (c) 2013, Maximilian Bachl
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:
    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL MAXIMILIAN BACHL BE LIABLE FOR ANY
DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

(function(){

  var Q = require('q');
  var ID3Reader = require('id3reader');

  // Implicitly assumes UTF-8 as the encoding of your website
  var ID3Writer = {

    /*
    input is an array of objects following this pattern:
        {frameType: <frame-type>, data: <mp3Data>, <optional> isBinary: <bool>, <optional> coverMime: <mimeType>}
     
    You can find a list of all frameTypes at 
    http://en.wikipedia.org/wiki/ID3#ID3v2_Frame_Specification_.28Version_2.3.29
    
    isBinary indicates, that the frame's contents do not represent text and thus no encoding info is needed.
    coverMime is only used for the APIC frame with the cover. The cover is treated as a special frame.
    */
    create: function(input, data) {
      var finishedFrames = new Array();

      for (var i=0; i<input.length; i++) {
        if (input[i].frameType === 'APIC') {
          finishedFrames.push(this.buildCoverFrame(input[i].frameType, 
                              input[i].data, 
                              input[i].coverMime || "image/jpeg"));
        } else {
          finishedFrames.push(this.buildFrame(input[i].frameType, 
                              input[i].data, 
                              input[i].isBinary || false));
        }
      }

      var finishedFramesBlob = new Blob(finishedFrames);
      var totalSize = finishedFramesBlob.size;
      var header = this.calculateHeader(totalSize);
      var array = [header];
      array.push(finishedFramesBlob);
      array.push(data);
      return new Blob(array, {type: 'audio/mp3'});
    },

    // Builds a generic frame, that can either contain text or binary data, indicated by isBinary
    buildFrame: function(frameType, data, isBinary) {
      var dataBlob = new Blob([data]);
      var length = dataBlob.size;
      if (!isBinary)
        length += 1;

      var sizeBuffer = new ArrayBuffer(4);
      var dataView = new DataView(sizeBuffer);
      dataView.setInt32(0, length, false);

      var frameTypeBuffer = new ArrayBuffer(4);
      var Uint8View = new Uint8Array(frameTypeBuffer);
      for (var i=0; i<4; i++) {
        Uint8View[i] = frameType.charCodeAt(i);
      }
   
      if (isBinary) {
        //               frameType, size,     flags,  data 
        return new Blob([Uint8View, dataView, "\0\0", dataBlob]);
      } else {
        //               frameType, size,     flags,  UTF-8,  data 
        return new Blob([Uint8View, dataView, "\0\0", "\x03", dataBlob]);
      }
    },

    // Special case for the APIC frame, which contains the cover 
    buildCoverFrame: function(frameType, data, coverMime) {
      var dataBlob = new Blob([data]);
      var coverMimeBlob = new Blob([coverMime]);
      var length = dataBlob.size + 4 + coverMimeBlob.size;

      var sizeBuffer = new ArrayBuffer(4);
      var dataView = new DataView(sizeBuffer);
      dataView.setInt32(0, length, false);

      var frameTypeBuffer = new ArrayBuffer(4);
      var Uint8View = new Uint8Array(frameTypeBuffer);
      for (var i=0; i<4; i++) {
        Uint8View[i] = frameType.charCodeAt(i);
      }
   
      //               frameType, size,     flags,  UTF-8,  mimeType,      used for cover, data
      return new Blob([Uint8View, dataView, "\0\0", "\x03", coverMimeBlob, "\0\x03\0", dataBlob]);
    },

    syncSafeSize: function(size) {
      var buffer = new ArrayBuffer(4);
      var ret = new Uint8Array(buffer);
      for (var i=3; i>=0; i--) {
        ret[3-i] = (size & (0x7F << i*7)) >> (i*7);
      }
      return ret;
    },

    calculateHeader: function(size) {
      return new Blob(["\x49\x44\x33", // "ID3", yes Strings are cumbersome in JS
                      "\x03\x00", // version
                      "\0", // flags
                      this.syncSafeSize(size)]) //size
    }

  };

  var ID3 = {

    writeFile: function (file, info) {
      var i = {
        title: '',
        artist: '',
        genre: '',
        trackNumber: '',
        totalTracks: '',
        year: '',
        album: '',
        cover: null,
        coverMime: '',
        description: '',
        albumArtist: ''
      };
      for(var k in info) {
        i[k] = info[k];
      }
      i.trck = i.trackNumber + '/' + i.totalTracks;
      var start = (info.v2) ? info.tagLength : 0;
      var end = (info.v1) ? -128 : file.size;
      var blob = file.slice(start, end);
      var opts = [
        {frameType: 'TIT2', data: i.title},
        {frameType: 'TALB', data: i.album},
        {frameType: 'TPE1', data: i.artist},
        {frameType: 'TYER', data: i.year},
        {frameType: 'TRCK', data: i.trck},
        {frameType: 'TCMP', data: '1'},
        {frameType: 'TPE2', data: i.albumArtist}
      ];
      if (i.cover) opts.push({frameType: 'APIC', data: i.cover, coverMime: i.coverMime});
      var mp3 = ID3Writer.create(opts, blob);
      return mp3;
    },

    // INPUT: List of File Descriptors, {

    /*
    * @param File[] files     array of File objects
    * @param json[] info      array of objects (json-encoded)  
    * @param function cb      function(error, tracks)
    * @return none
    */
    makePlaylist: function (files, mix, cb) {
      var tracks = mix.tracks;
      if (files.length !== tracks.length) {
        cb('Mismatched input.');
      }
      var length = files.length;
      var tagged = [];
      for (var i = 0; i < length; i++) {
        var track = tracks[i];
        track.totalTracks = length;
        track.year = mix.year;
        track.album = mix.title;
        track.cover = mix.imageFile || null;
        track.coverMime = mix.imageFile===undefined ? null : mix.imageFile.type;
        track.description = mix.description;
        track.albumArtist = mix.author;
        var mp3 = ID3.writeFile(files[i], track);
        tagged.push(mp3);
      }
      if (tagged.length !== length) {
        cb('Playlist error.');
      } else {
        cb(null, tagged);
      }

    },

    // @param File file
    // @return Promise, with properties: {
    //    title: title,
    //    artist: artist,
    //    tagLength: total tag size (including header) in bytes,
    //    v1: found id3 v1 tags?
    //    v2: found id3 v2 tags?
    // }
    readFile: function (file) {

      var deferred = Q.defer();
      ID3Reader(file, function(err, tags) {
        if (err){
          deferred.reject(err);
        } else {
          var v1 = !!tags.v1.title;
          var v2 = !!tags.v2.title;
          deferred.resolve({
            title: tags.title || null,
            artist: tags.artist || null,
            tagLength: tags.v2.tagLength || 0,
            v1: v1,
            v2: v2
          });
        }
      });
      return deferred.promise;
    }

  };
  
  if(typeof module !== 'undefined' && module.exports) {
      module.exports = ID3;
  } else {
    if(typeof define === 'function' && define.amd) {
      define('id3', ['id3reader', 'q'], function() {
        return ID3;
      });
    } else {
      window.ID3 = ID3;
    }
  }
  
})();

