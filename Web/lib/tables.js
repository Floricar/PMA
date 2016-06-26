(function() {
  "use strict";

  var products = JSON.parse(localStorage.products);

  var productsTable = $("#products-body");

  var addTd = function(tr, text, clazz, isHtml) {
    var td = $("<td></td>");
    if(isHtml) td.html(text);
    else td.text(text);
    if(clazz) td.addClass(clazz);
    tr.append(td);
  };

  for(var i = 0, count = products.length; i < count; i++) {
    var tr = $("<tr class='warning'></tr>");
    addTd(tr, products[i].product);
    addTd(tr, PAM.accounting.formatNumber(products[i].price,2), 'text-right');
    tr.append($("<td colspan='6'></td>"))
    productsTable.append(tr);

    for(var j = 0, countj = products[i].listing.length; j < countj; j++) {
      var tr = $("<tr></tr>");
      addTd(tr, products[i].listing[j].detail.title);
      addTd(tr, PAM.accounting.formatNumber(products[i].listing[j].price, 2), 'text-right');
      addTd(tr, products[i].listing[j].listing_type_id);
      addTd(tr, products[i].listing[j].free_shipping ? "<i class='glyphicon glyphicon-ok'></i>" : "", 'text-center', true);
      addTd(tr, products[i].listing[j].detail.sold_quantity, 'text-right');
      addTd(tr, products[i].listing[j].questions.total, 'text-right');
      addTd(tr, products[i].listing[j].detail.official_store_id ? "<i class='glyphicon glyphicon-ok'></i>" : "", 'text-center', true);
      addTd(tr, products[i].listing[j].seller.power_seller_status);

      productsTable.append(tr);

      /*
      *
      * <th>Destaque</th>
       <th>Envio gratuito</th>
       <th>Vendidos</th>
       <th>Preguntas</th>
       <th>Tienda Oficial</th>
       <th>Calificaciones</th>
       <th>Status</th>
       </tr>
      * */
    }
  }

})();