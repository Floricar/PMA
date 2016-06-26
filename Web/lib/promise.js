(function() {
  "use strict";

  PAM.Promises = {};

  PAM.Promises.Promise = function() {
    //PAM.log("promise - created");
    this.successCallbacks = [];
    this.errorCallbacks = [];
  };

  PAM.Promises.Promise.prototype = {
    successCallbacks: null,
    errorCallbacks: null,
    status: 'pending',
    error: null,

    then: function(successCallback, errorCallback) {
      var defer = new PAM.Promises.Defer();

      // Add callbacks to the arrays with the defer binded to these callbacks
      this.successCallbacks.push({
        func: successCallback,
        defer: defer
      });

      if(errorCallback) {
        this.errorCallbacks.push({
          func: errorCallback,
          defer: defer
        });
      }

      // Check if the promise is not pending. If not call the callback
      if(this.status === 'resolved') {
        this.executeCallback({
            func: successCallback,
            defer: defer
          },
          this.data);
      }
      else if(this.status === 'rejected') {
        if(errorCallback) {
          this.executeCallback({
              func: errorCallback,
              defer: defer
            },
            this.error);
        }
      }

      return defer.promise;
    },

    whenSuccess: function(successCallback, falseReturnValue, errorCallback) {
      if(!PAM.isFunction(successCallback)) {
        PAM.raiseError("Invalid argument", "Argument successCallback must be a function");
      }
      return this.then(function(result) {
        //
        // result is true if it is:
        //
        //      - not empty or null
        //      - not false
        //      - not result.success === false
        //      - not 'no'
        //
        // because if it is an object and doesn't has a success field set to false
        // it is success
        //
        // so basically result has to be an explicit false to not be SUCCESS
        //
        if(result !== undefined
          && result !== null
          && result !== false
          && result !== 'no'
          && result.success !== false
          && result.isValid !== false) {
          return successCallback();
        }
        else {
          return PAM.isFunction(falseReturnValue) ? falseReturnValue() : falseReturnValue || false;
        }
      }, errorCallback);
    },

    whenSuccessWithResult: function(successCallback, falseReturnValue, errorCallback) {
      return this.then(function(result) {
        if(result.success) {
          try {
            return successCallback(result);
          }
          catch (ex) {
            PAM.manageErrorEx(ex.message, ex, "whenSuccessWithResult", "PAM.Promises", "");
            return false;
          }
        }
        else {
          return PAM.isFunction(falseReturnValue) ? falseReturnValue() : falseReturnValue || false;
        }
      }, errorCallback);
    },

    successful: function() {
      return this.then(function(){ return true; });
    },

    executeCallback: function(callbackData, result) {
      window.setTimeout(function() {
        var res = callbackData.func(result);
        if(res instanceof PAM.Promises.Promise) {
          callbackData.defer.bind(res);
        }
        else {
          callbackData.defer.resolve(res);
        }
      }, 0);
    }
  };

  PAM.Promises.Defer = function() {
    this.promise = new PAM.Promises.Promise();
  };

  PAM.Promises.Defer.prototype = {
    promise: null,
    resolve: function(data) {
      var promise = this.promise;
      promise.data = data;
      promise.status = 'resolved';
      //PAM.log("promise - resolved");
      promise.successCallbacks.forEach(function(callbackData) {
        promise.executeCallback(callbackData, data);
      });
    },

    reject: function(error) {
      var promise = this.promise;
      promise.error = error;
      promise.status = 'rejected';
      //PAM.log("promise - rejected");
      promise.errorCallbacks.forEach(function(callbackData) {
        promise.executeCallback(callbackData, error);
      });
    },

    // Make this promise behave like another promise:
    // When the other promise is resolved/rejected this is also resolved/rejected
    // with the same data
    bind: function(promise) {
      var that = this;
      promise.then(
        function(res) { that.resolve(res); },
        function(err) { that.reject(err); }
      );
    }
  };

  PAM.Promises.resolvedPromise = function(result) {
    var defer = new PAM.Promises.Defer();
    defer.resolve(result);
    return defer.promise;
  };

  PAM.Promises.failedPromise = function() {
    var defer = new PAM.Promises.Defer();
    defer.resolve({ success: false });
    return defer.promise;
  };

  PAM.Promises.fail = function() {
    return { success: false };
  };

  PAM.Promises.getSuccess = function() {
    return { success: true };
  };

  // returns a function which will call the f function
  // passing all arguments to call plus the result
  // argument of the returned function.
  // AGAIN: the returned function is in the third line
  //          {{ return function(result) }}
  //        the f function is in the first line
  //          {{ PAM.Promises.call = function(<< f >>) {
  //        the arguments to call are optionals so call has
  //        only one explicit parameter << f >>
  //        when the function returned by call is invoked
  //        it will be called with one argument named result
  //        this argument is passed at the end of the arguments
  //        to the f function
  //        so the list of arguments is:
  //          << all arguments to call >> plus << result >>
  //
  PAM.Promises.call = function(f) {
    var args = Array.prototype.slice.call(arguments, 1);
    return function(result) {
      args.push(result);
      return f.apply(null, args);
    };
  };

  PAM.Promises.throttleTime = 3000;

  PAM.Promises.throttle = function(result) {
    var defer = new PAM.Promises.Defer();
    setTimeout(function() {
      defer.resolve(result);
    }, PAM.Promises.throttleTime);
    return defer.promise;
  };

}());