(function() {
  "use strict";

  window.PAM = {};

  PAM.raiseError = function(title, message) {
    throw new Error(title + " - " + message);
  };

  PAM.manageErrorEx = function(errorResponse, exception, functionName, className, infoAdd) {
    console.log("An error has occurred when calling this function: " + className + "." + functionName + "<br>" + infoAdd);
  };

  PAM.showProgress =function() {
    if(!Modernizr.meter){
      alert('Lo sentimos, su navegador no soporta la barra de progreso HTML5');
    } else {
      var progressbar = $('#progressbar'),
        max = progressbar.attr('max'),
        time = ((10000*.4)/max)*5,
        value = progressbar.val();

      var loading = function() {
        value += 1;
        var addValue = progressbar.val(value);

        $('.progress-value').html(value + '%');

        if (value == max) {
          clearInterval(animate);
        }
      };

      var animate = setInterval(function() {
        loading();
      }, time);
    };
  };

})();