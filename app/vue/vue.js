'use strict';

var limite = true;

demarrer();

setInterval(function() {
    demarrer();
}, 30000);

function demarrer() {
  viderAchats();
  chargerDonnees();

  //on attend 500 milisecondes pour assurer la maj des éléments
  setTimeout(function() {
      chargerValeursActuelles();
      $(".trPortefeuilleActions").click(function(){
          $(this).addClass('selectedVente').siblings().removeClass('selectedVente');
          document.getElementById("boutonVendre").disabled = false; //sélecteur jquery ne marche pas, étrange mais tant pis
      });
  }, 500);


  //on attend 4 secondes pour assurer la maj des éléments
  setTimeout(function() {
    calculerPlueValue();
    chargerGraphique();
  }, 4000);

}

//Recherche d'une action
$("#boutonRechercher").click(
    function(){
      var recherche = document.getElementById("inputRecherche").value;

      $.get("http://localhost:3000/api/"+recherche, function( data ) {

        if ( (data[5].split(':')[2] !== "null")&&(data[1].split(':')[2] !== "null") ) {
          console.log("Recherche du symbole : " +data[0].split(':')[2].toUpperCase());
          $('#tableEnteteSeparateurResultatRecherche').after("<tr class='trResultatRecherche'>\n" +
              "<td class='tdPremierResultatRecherche'>\n" +
              data[0].split(':')[2].toUpperCase() +
              "</td>" +

              "<td class='tdDeuxiemeResultatRecherche'>\n" +
              data[5].split(':')[2] +
              "</td>" +

              "<td class='tdTroisiemeResultatRecherche'>" +
              data[1].split(':')[2] +
              "</td>" +
              "</tr>");

          //On met à jour la possibilité de sélectionner l'élément
          $(".trResultatRecherche").click(function(){
            $(this).addClass('selected').siblings().removeClass('selected');
            document.getElementById("boutonAcheter").disabled = false; //sélecteur jquery ne marche pas, étrange mais tant pis
          });
        }
        else {
          alert("La recherche du symbole "+ data[0].split(':')[2].toUpperCase() +" ne donne aucun resultat");
        }
      });
});


//Achat d'une action
$('#boutonAcheter').on('click', function(e){

  var achat = $(".selected");
  var symbole = achat.find(".tdPremierResultatRecherche").html().trim();
  var nom = achat.find(".tdDeuxiemeResultatRecherche").html().trim();
  var valeurAchat = achat.find(".tdTroisiemeResultatRecherche").html().trim();

  console.log("Achat d'une action : " +nom);

  acheterAction(symbole,nom,valeurAchat);
  demarrer();

    $(".trPortefeuilleActions").click(function(){
        $(this).addClass('selected').siblings().removeClass('selectedVente');
        document.getElementById("boutonVente").disabled = false; //sélecteur jquery ne marche pas, étrange mais tant pis
    });
});

//Vente d'une action
$('#boutonVendre').on('click', function(e){

    var vente = $(".selectedVente");
    var symbole = vente.find(".tdPremierPortefeuilleActions").html().trim();
    var nom = vente.find(".tdDeuxiemePortefeuilleActions").html().trim();
    var prix = +vente.find(".tdTroisiemePortefeuilleActions").html().trim();

    console.log("Vente d'une action : " +nom);

    vendreAction(symbole);
    var depenses = +(document.getElementById("depenses"));
    depenses = depenses + prix;
    document.getElementById("depenses").replaceWith("<p class='ResultatRecapitulatif' id='depenses'> "+depenses+" </p>");

    setTimeout(function() {
        demarrer();
    }, 500);
});

function acheterAction (symbole, nom, prix) {
  var action = '{"name" : "'+nom+'", "symbole": "'+symbole+'","price": "'+prix+'"}';
  $.ajax({
    url: "http://localhost:3000/stocks",
    type: "POST",
    data: action,
    contentType: "application/json",
    dataType: "json",
    async: true,
    success: function(data){
      //console.log(data);
    }
  });
}

function vendreAction (symbole) {

    $.get("http://localhost:3000/stocks", function( data ) {
        for (var i = 0; i < data.length; i++) {
            if (data[i].symbole === symbole) {
                $.ajax({
                    url: "http://localhost:3000/stocks/"+data[i]._id,
                    type: "DELETE",
                });
                break;
            }
        }
    })

    setTimeout(function() {
        demarrer();
    }, 500);
}

function chargerDonnees() {
  $.get("http://localhost:3000/stocks", function( data ) {
    for (var i = 0; i < data.length ; i++) {

      $('#tableEnteteSeparateurPortefeuilleActions').after("<tr class='trPortefeuilleActions'>\n" +
          "<td class='tdPremierPortefeuilleActions'>\n" +
          data[i].symbole +
          "</td>" +

          "<td class='tdDeuxiemePortefeuilleActions'>\n" +
          data[i].name +
          "</td>" +

          "<td class='tdTroisiemePortefeuilleActions'>" +
          data[i].price +
          "</td>" +

          "<td class='tdQuatriemePortefeuilleActions'>" +
          "Chargement ..." +
          "</td>" +

          "</tr>");
    }
  })
};

function viderAchats() {
  $(".trPortefeuilleActions").remove();
};

function chargerValeursActuelles() {

  $("#tablePortefeuilleActions").find("tbody").find("tr").each(function(){

    var current = $(this).find(".tdPremierPortefeuilleActions");
    var objet = $(this);

    if(current.html()) {
      if (current.html().search("Symbole") === -1) {

        $.get("http://localhost:3000/api/"+current.html().trim(), function( data ) {
          objet.find(".tdQuatriemePortefeuilleActions").replaceWith("<td class='tdQuatriemePortefeuilleActions'>" + data[1].split(':')[2] + "</td>");
        });
      }
    }
  })
}

function calculerPlueValue() {

    //plus value
    var valeurTotaleAchat = 0;
    var valeurTotaleActuelle = 0;
    var valeurFinale = 0;
    $("#tablePortefeuilleActions").find("tbody").find("tr").each(function () {

        var current = $(this).find(".tdPremierPortefeuilleActions");

        if (current.html()) {
            if (current.html().search("Symbole") === -1) {

                var valeurAchat = $(this).find(".tdTroisiemePortefeuilleActions");
                var valeurActuelle = $(this).find(".tdQuatriemePortefeuilleActions");

                valeurTotaleAchat += Number(valeurAchat.html().trim());
                valeurTotaleActuelle += Number(valeurActuelle.html().trim());
            }
        }
    })
    valeurFinale = (Math.round((valeurTotaleActuelle - valeurTotaleAchat) * 100) / 100);

    $("#pRecapitulatif").replaceWith("<p id=pRecapitulatif>" + valeurFinale + "</p>");

    if (!isNaN(valeurFinale)) {
        var action = '{"plusValue" : ' + valeurFinale + ', "timeStamp": ' + (Math.floor(Date.now() / 1000)) + '}';

        $.ajax({
            url: "http://localhost:3000/plusValue",
            type: "POST",
            data: action,
            contentType: "application/json",
            dataType: "json",
            async: true,
            success: function (data) {
                //console.log(data);
            }
        });
    }

    //somme des actions
    $.get("http://localhost:3000/stocks", function (data) {
        var somme = 0;
        for (var i = 0; i < data.length; i++) {
            somme += Number(data[i].price);
        }
        $("#pValeurTotale").replaceWith("<p id=pValeurTotale>" + Math.round(somme*100)/100 + "</p>");
    })
}
//boutons du graphique
$('#boutonNoLimit').on('click', function(e){
    limite = false;
    chargerGraphique();
});
$('#boutonLimit').on('click', function(e){
    limite = true;
    chargerGraphique();
});

//graphique
function chargerGraphique () {

    var plusValues = [0];// = ["plusValue"];
    var timeStamp = [0];// = ["temps"];
    $.get("http://localhost:3000/plusValue", function( data ) {
        for (var i = 0; i < data.length ; i++) {
            plusValues[i] = Number(data[i].plusValue);
            timeStamp[i] = Number(data[i].timeStamp);
        }

        if (limite) {
            plusValues = plusValues.slice(plusValues.length - 30,plusValues.length);
        }

        var chart = c3.generate({
            data: {
                json: {
                    evolutionPlusValue: plusValues
                }
            },
            zoom: {
                enabled: true
            }
        });
    });
}


angular.module('myApp.view1', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/view1', {
    templateUrl: 'view1/vue.html',
    controller: 'View1Ctrl'
  });
}])

.controller('View1Ctrl', [function() {

}]);