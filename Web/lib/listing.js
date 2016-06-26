(function() {
  "use strict";

  var readProductData = function(data) {
    var listing = [];
    var results = data.results;
    for(var i = 0, count = results.length; i < count; i++) {
      listing.push({
        id: results[i].id,
        listing_type_id: results[i].listing_type_id,
        price: results[i].price,
        seller: {id: results[i].seller.id, power_seller_status: results[i].seller.power_seller_status},
        free_shipping: results[i].shipping.free_shipping
      });
    }
    return listing;
  };

  PAM.getProductListing = function(product) {
    var defer = new PAM.Promises.Defer();
    $.ajax(
      {
        url: "https://api.mercadolibre.com/sites/MLA/search?q=" + product,
        success: function(data) {
          defer.resolve(readProductData(data));
        },
        error: function(request, status, error) {
          console.log(error);
        }
      }
    )
    return defer.promise;
  };



})();