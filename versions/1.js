var util = require('util');
var S = require('string');
var memjs = require('memjs');
var request = require('request');
var mc = memjs.Client.create();
var expire = 2592000; // 30 days
var url = 'https://internet.claro.com.ni/includes/getNumber/data.php';

module.exports.is = function( req, res ){

  var number = req.params.number;

  if( S( number ).isNumeric() ){

    if( number.length === 8 ){

      var stringKey = util.format('claro_is_%d', number);

      mc.get(stringKey, function(err, value, key) {

        if( value === null ){

          var form = {
            task: 'he',
            new_number: number,
            inside: 'off'
          };

          request.post(url, {form:form},function (error, response, body) {

            if(response.statusCode == 200){

              var json = JSON.parse( body );

              if( json.message !== undefined ){

                response = {"status":false};

              }
              else{

                response = {"status":true};

              }

              mc.set(stringKey, JSON.stringify(response), function(err, success) {

                response.source = "request";

                res.json( response );

              },expire);

            }

          });

        }
        else{

          var memcachedResponse = JSON.parse( value );
          memcachedResponse.source = "memcached";

          res.json( memcachedResponse );

        }

      });

    }
    else{
      res.json({error:{message:"Número de celular inválido. Require 8 dígitos numéricos."}});
    }
  }
  else{
    res.json({error:{message:"Número de celular inválido. El formato correcto es 00000000."}});
  }

};
