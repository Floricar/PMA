(function() {
  "use strict";

  var log = function(message) {
    if(console) {
      console.log(message);
    }
  };

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //
  // browser support validations
  //
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  // Check for the various File API support.
  //
  var checkApis = function() {
    if (window.File && window.FileReader && window.FileList && window.Blob) {
      log('The File APIs is present.');
    } else {
      window.document.write('The File APIs are not fully supported in this browser.');
      return false;
    }
    if (window.XMLHttpRequest) {
      log('XMLHttpRequest is present.');
    } else {
      window.document.write('XMLHttpRequest not supported in this browser.');
      return false;
    }
    if ('Promise' in window) {
      log('Promise is present.');
    } else {
      window.document.write('Promise not supported in this browser.');
      return false;
    }

    return true;
  };

  /*
  var handleFileSelect = function (evt) {
    evt.stopPropagation();
    evt.preventDefault();

    showSpinner();
  };
  */

  var showSpinner = function() {
    showTag(document.getElementById('spinner'));
  };

  var hideSpinner = function() {
    hideTag(document.getElementById('spinner'));
  };

  var hideTag = function(tag) {
    tag.style.display = 'none';
  };

  var showTag = function(tag) {
    tag.style.display = 'block';
  };

  /*
  var handleDrop = function handleDrop(e) {
    e.stopPropagation();
    e.preventDefault();
    var files = e.dataTransfer.files;
    var t = 0;
    var i,f;
    for (i = 0, f = files[i]; i != files.length; ++i) {
      var reader = new FileReader();
      var name = f.name;
      reader.onload = (function(theFile) {
        return function(e) {
          var data = e.target.result;

          / * if binary string, read with type 'binary' * /
          var workbook = XLSX.read(data, {type: 'binary'});

          t += 1;
          console.log(t);

          hideSpinner();

          / * DO SOMETHING WITH workbook HERE * /
        };
      }(f));
      reader.readAsBinaryString(f);
    }
  };
  */

  var handleFile = function handleFile(e) {
    showSpinner();
    var files = e.target.files;
    var i,f;
    for (i = 0, f = files[i]; i != files.length; ++i) {
      var reader = new FileReader();
      var name = f.name;
      reader.onload = function(e) {
        var data = e.target.result;

        var workbook = XLSX.read(data, {type: 'binary'});

        alert();

        hideSpinner();

        /* DO SOMETHING WITH workbook HERE */
      };
      reader.readAsBinaryString(f);
    }
  };

  if(checkApis()) {
    window.document.addEventListener("DOMContentLoaded", function(event) {

      // setup the dnd listeners
      //
      /*
      var dropZone = window.document.getElementById('drop_zone');
      dropZone.addEventListener('dragover', handleDrop, false);
      dropZone.addEventListener('drop', handleFileSelect, false);
      */

      var input_dom_element = window.document.getElementById('idrop_zone');
      input_dom_element.addEventListener('change', handleFile, false);
    });
  }

}());
