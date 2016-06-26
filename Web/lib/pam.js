(function() {
  "use strict";

  window.PAM = {};

  PAM.raiseError = function(title, message) {
    throw new Error(title + " - " + message);
  };

  PAM.manageErrorEx = function(errorResponse, exception, functionName, className, infoAdd) {
    console.log("An error has occurred when calling this function: " + className + "." + functionName + "<br>" + infoAdd);
  };

})();