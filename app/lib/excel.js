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

  var processExcelFile = function(img, onComplete) {

    // create sliced image
    //

    var imageSlicer = createImageSlicer(TILE_WIDTH, TILE_HEIGHT);
    var slicedImage = imageSlicer.sliceImage(img);
    var rowWidth = slicedImage.cols * (TILE_WIDTH + 1) + 'px';
    var rowHeight = (TILE_HEIGHT + 1) + 'px';

    var preloadImage = function(path, image) {
      return new Promise(function (resolve, reject) {

        // bind an event listener on the load to call the `resolve` function
        //
        image.onload = resolve;

        // if the image fails to be downloaded, we don't want the whole system
        // to collapse so we `resolve` instead of `reject`, even on error
        //
        image.onerror = resolve;

        // apply the path as `src` to the image so that the browser fetches it
        //
        image.src = path;
      })
    };

    var loadRow = function(rowIndex) {
      var row = document.createElement('div');
      row.style.width = rowWidth;
      row.style.height = rowHeight;

      var rowPromises = [];

      var imageIndex = rowIndex * slicedImage.cols;

      for (var j = 0; j < slicedImage.cols; j++, imageIndex++) {

        var imageColor = document.createElement('img');
        var path = "/color/" + slicedImage.colors[imageIndex];

        rowPromises.push(preloadImage(path, imageColor));

        row.appendChild(imageColor);
      }

      return {
        rowIndex: rowIndex,
        rowPromises: rowPromises,
        row: row
      }
    };

    var preloadNextRow = function(loadedRow) {
      return function() {
        addRowAndPreloadNextRow(loadedRow)
      };
    };

    var addRowAndPreloadNextRow = function(loadedRow) {
      // on first call we don't have a row
      //
      if(loadedRow.row) {
        document.getElementById('split-image').appendChild(loadedRow.row);
      }
      else {
        document.getElementById('split-image').appendChild(document.createElement('hr'));
      }

      var nextRowIndex = loadedRow.rowIndex + 1;
      if(nextRowIndex < slicedImage.rows) {
        var preloadedRow = loadRow(nextRowIndex);
        Promise.all(preloadedRow.rowPromises)
          .then(preloadNextRow(preloadedRow))
          .catch(console.log.bind(console));
      }
      else {
        if(onComplete) onComplete();
      }
    };

    addRowAndPreloadNextRow({rowIndex: -1});
  };

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //
  // loading file handlers
  //
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  var addFileNameToSpan = function(span, imgSrc, title, images) {
    return new Promise(function (resolve, reject) {

      span.innerHTML = ['<span>', title, '</span>'].join('');

      var arraybuffer = imgSrc;

      /* convert data to binary string */
      var data = new Uint8Array(arraybuffer);
      var arr = new Array();
      for(var i = 0; i != data.length; ++i) arr[i] = String.fromCharCode(data[i]);
      var bstr = arr.join("");

      /* Call XLSX */
      var workbook = XLSX.read(bstr, {type:"binary"});

      var image = span.children[0];

      // bind an event listener on the load to call the `resolve` function
      //
      image.onload = resolve;

      // if the image fails to be downloaded, we don't want the whole system
      // to collapse so we `resolve` instead of `reject`, even on error
      //
      image.onerror = resolve;

      images.push(image);
    });
  };

  var handleFileSelect = function (evt) {
    evt.stopPropagation();
    evt.preventDefault();

    showSpinner();

    var files = evt.dataTransfer.files; // FileList object.

    // we need to wait for all files and all images nodes to be loaded
    //
    var fileQueue = [];
    var excelQueue = [];

    // list of images we are going to apply photomosaic
    //
    var images = [];

    // loop through the FileList and render image files as thumbnails.
    //
    for (var i = 0, file; file = files[i]; i++) {

      // only process image files.
      //
      if (!file.type.match('application/vnd.ms-excel')) {
        continue;
      }

      var reader = new FileReader();

      fileQueue.push(new Promise(function(resolve, reject) {
        // closure to capture the file information.
        //
        reader.onload = (function(theFile) {
          return function(e) {
            // render thumbnail.
            //
            var span = document.createElement('span');

            document.getElementById('list').insertBefore(span, null);

            excelQueue.push(addFileNameToSpan(span, e.target.result, escape(theFile.name), images))

            resolve();

          }
        }(file));

      }));

      // read in the image file as a data URL.
      //
      reader.readAsDataURL(file);
    }

    var p = new Promise(function(resolve, reject) { resolve(); });

    Promise.all(fileQueue).then(function() {
      Promise.all(excelQueue).then(function() {
        for (var i = 0, img; img = images[i]; i++) {
          // we use promises to serialize the photomosaic of every image
          //
          p = p.then(function(img) { /* closure to capture img */
            return function() {
              return new Promise(function(resolve, reject) {
                processExcelFile(img, resolve);
              });
            }
          }(img));
        }
        p.then(hideSpinner);
      });
    });

  };

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
  }

  var handleDragOver = function(evt) {
    evt.stopPropagation();
    evt.preventDefault();
    evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
  }

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //
  // registering listeners
  //
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  var handleDrop = function handleDrop(e) {
    e.stopPropagation();
    e.preventDefault();
    var files = e.dataTransfer.files;
    var i,f;
    for (i = 0, f = files[i]; i != files.length; ++i) {
      var reader = new FileReader();
      var name = f.name;
      reader.onload = function(e) {
        var data = e.target.result;

        /* if binary string, read with type 'binary' */
        var workbook = XLSX.read(data, {type: 'binary'});

        /* DO SOMETHING WITH workbook HERE */
      };
      reader.readAsBinaryString(f);
    }
  }

  if(checkApis()) {
    window.document.addEventListener("DOMContentLoaded", function(event) {

      // setup the dnd listeners
      //
      var dropZone = window.document.getElementById('drop_zone');
      dropZone.addEventListener('dragover', handleDrop, false);
      dropZone.addEventListener('drop', handleFileSelect, false);
    });
  }

}());
