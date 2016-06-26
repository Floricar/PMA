(function() {
  "use strict";

  var readProductQuestions = function(data, itemId) {
    return {total: data.total, itemId: itemId};
  };

  PAM.getProductQuestions = function(itemId) {
    var defer = new PAM.Promises.Defer();
    $.ajax(
      {
        url: "https://api.mercadolibre.com/questions/search?item_id=" + itemId,
        success: function(data) {
          defer.resolve(readProductQuestions(data, itemId));
        },
        error: function(request, status, error) {
          console.log(error);
        }
      }
    )
    return defer.promise;
  };

  var readProductDetail = function(data) {
    return data;
  };

  PAM.getProductDetail = function(itemIds) {
    var attributes = 'id,title,category_id,official_store_id,sold_quantity,seller_address.city.name,seller_address.state.name'
    var defer = new PAM.Promises.Defer();
    $.ajax(
      {
        url: "https://api.mercadolibre.com/items?ids=" + itemIds + "&attributes=" + attributes,
        success: function(data) {
          defer.resolve(readProductDetail(data));
        },
        error: function(request, status, error) {
          console.log(error);
        }
      }
    )
    return defer.promise;
  };

  var getItemIds = function(listing) {
    var itemIds = [];
    for(var i = 0, count = listing.length; i < count; i++) {
      itemIds.push(listing[i].id);
    }
    return itemIds.join(",");
  };

  var getProductDetailUpdateCall = function(i, products) {
    return function(details) {
      //products[i].details = details;
      for(var k = 0, count = products[i].listing.length; k < count; k++) {
        for(var j = 0, countj = details.length; j < countj; j++) {
          if(products[i].listing[k].id === details[j].id) {
            products[i].listing[k].detail = details[j];
            break;
          }
        }
      }
    };
  };

  var getProductDetailCall = function(i, products) {
    return function() {
      return PAM.getProductDetail(getItemIds(products[i].listing));
    };
  };

  PAM.getAllProductsDetail = function(products) {
    var p = PAM.Promises.resolvedPromise();
    for(var i = 0, count = products.length; i < count; i++) {
      p = p.then(getProductDetailCall(i, products))
        .then(getProductDetailUpdateCall(i, products));
    }
    return p;
  };

  var getProductQuestionUpdateCall = function(i, j, products) {
    return function(questions) {
      products[i].listing[j].questions = questions;
      console.log(questions);
    };
  };

  var getProductQuestionCall = function(i, j, products) {
    return function() {
      return PAM.getProductQuestions(products[i].listing[j].id);
    };
  };

  PAM.getAllProductsQuestions = function(products) {
    var p = PAM.Promises.resolvedPromise();
    for(var i = 0, count = products.length; i < count; i++) {
      for(var j = 0, countj = products[i].listing.length; j < countj; j++) {
        p = p.then(getProductQuestionCall(i, j, products))
          .then(getProductQuestionUpdateCall(i, j, products));
      }
    }
    return p;
  };

})();