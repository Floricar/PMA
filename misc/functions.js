<head>
<script src="jquery-1.12.2.min.js"></script>
</head>

$(document).ready(function(){


function getCategories(){
            $.ajax({
                type: 'GET',
                url:  "https://api.mercadolibre.com/sites/MLB/category_predictor/predict?title=' + $var1,
                success: function(data){
                    $.each(data, function(index, object){
                        console.log(object.name);
                    });
                }
            });
        }
getCategories();

function getJSON(){
            $.ajax({
                type: 'GET',
                url: 'https://api.mercadolibre.com/sites/MLA/search?q=' + $var1,
                success: function(data){
                    $.each(data, function(index, object){
                        console.log(object.name);
                    });
                }
            });
        }
getJSON();
