// Eine Einführung zur leeren Vorlage finden Sie in der folgenden Dokumentation:
// http://go.microsoft.com/fwlink/?LinkID=329104
(function () {

    var app = WinJS.Application;
    var activation = Windows.ApplicationModel.Activation;

    app.onactivated = function (args) {
        if (args.detail.kind === activation.ActivationKind.launch) {
            if (args.detail.previousExecutionState !== activation.ApplicationExecutionState.terminated) {
                $(document).ready(function () {

                    //Spielinformationen
                    var game = new Array();
                    game["num_games"] = 0;
                    game["num_rounds"] = 0;
                    game["max_rolls"] = 3;
                    game["beermat_assigned"] = false;
                    game["active_player"] = 0;

                    //Reihenfolge der Spieler
                    player_order = new Array();

                    //Spieler
                    players = new Array();

                    /*--------------------------------------------------------------*/

                    //Anzahl der Spieler festlegen
                    $('#set-num-players').click(function () {
                        num_players = $('#num-players').val();

                        if (num_players > 1) {
                            for (i = num_players - 1; i >= 0; i--) {
                                $('#player_names').prepend("<div><input type='text' id='player_name_" + i + "' placeholder='Spieler " + (i + 1) + "'></div>");
                            }

                            $('#game-settings-wrapper').hide(500);
                            $('#set-playername-wrapper').show(500);
                        }
                        else {
                            showMessage("Es müssen mindestens 2 Spieler am Spiel teilnehmen.");
                        }

                    });

                    //Neues Spiel erstellen
                    $('#start-game').click(function () {
                        for (i = 0; i < num_players; i++) {
                            player_name = $('#player_name_' + i).val();

                            if (player_name == "") {
                                player_name = $('#player_name_' + i).attr("placeholder");
                            }

                            if (i % 2 != 0) {
                                color = " style=\"background-color:#eee\"";
                            }
                            else {
                                color = " style=\"background-color:#fff\"";
                            }
                            players[i] = new Array();
                            players[i]["name"] = player_name;
                            players[i]["points"] = 0;
                            players[i]["beers"] = 0;
                            players[i]["drinks"] = 0;
                            players[i]["chicago"] = false;
                            players[i]["rolls"] = 0;

                            $('#playerinfo-wrapper').append("<tr class=\"table-row\" id=\"playerinfo_header_" + i + "\"" + color + "><td class=\"table-cell\" id=\"player_name_" + i + "\">" + players[i]["name"] + "</td><td class=\"table-cell center-text roundinfo\" id=\"player_points_" + i + "\">" + players[i]["points"] + "</td><td class=\"table-cell center-text roundinfo left\" id=\"player_beers_" + i + "\">" + players[i]["beers"] + "</td><td class=\"table-cell center-text\" id=\"player_drinks_" + i + "\">" + players[i]["drinks"] + "</td></tr>");

                        }

                        dp = new Array();
                        dp[0] = 0;
                        setPlayerOrder(dp);

                        $('#active-player-name').text(players[game["active_player"]]["name"]);
                        $('#set-playername-wrapper').hide(500);
                        $('#gameinfo-wrapper, #dice-wrapper, #playerinfo-wrapper-div, #playerinfo-wrapper').show(500);

                    });

                    /**
                    * Legt die Reihenfolge der Spieler für die nächste Runde fest. Der Verlierer der vorherigen Runde startet als erster Spieler der nächsten Runde.
                    */
                    function setPlayerOrder(start_players) {
                        player_order = new Array();
                        //Wenn nicht alle Spieler mitspielen (auswürfeln)
                        if (start_players.length > 1) {
                            $.each(start_players, function (index, value) {
                                player_order.push(value);
                            });
                        }

                        //Wenn alle Spieler mitspielen.
                        else {
                            nummer = 0;
                            i = 1;
                            num_chicago = 0;

                            $.each(players, function (index, value) {
                                if (value["chicago"] === false) {
                                    if (index >= start_players[0]) {
                                        if (start_players[0] == index) {
                                            nummer = i;
                                        }

                                        player_order.push(index);
                                    }
                                }
                                else {
                                    num_chicago++;
                                }

                                i++;
                            });

                            if (player_order.length < (players.length - num_chicago)) {
                                for (j = 0; j < (nummer - 1) ; j++) {
                                    if (players[j]["chicago"] === false) {
                                        player_order.push(j);
                                    }
                                }
                            }

                            if (player_order.length == 1) {
                                prost(player_order[0]);

                                dp = new Array();
                                dp[0] = player_order[0];
                                setPlayerOrder(dp);
                            }

                        }

                        game["active_player"] = player_order[0];
                    }

                    /**
                    * Legt den als nächsten in der Reihenfolge vorhandenen Spieler fest.
                    */
                    function setNextPlayer() {
                        if (player_order.length > 1) {
                            $.each(player_order, function (index, value) {

                                if (value == game["active_player"]) {

                                    if (index + 1 < player_order.length) {
                                        nextplayer = player_order[index + 1];
                                        $('#next-player').show();
                                        $('#new-round').hide();
                                    }
                                    else {
                                        nextplayer = false;
                                        $('#next-player').hide();
                                        $('#new-round').show();
                                    }
                                    if (index + 2 >= player_order.length) {
                                        $('#next-player').hide();
                                        $('#new-round').show();
                                    }
                                }
                            });

                            if (nextplayer !== false) {

                                if (player_order[0] == game["active_player"]) {
                                    game["max_rolls"] = players[game["active_player"]]["rolls"];
                                }
                                game["active_player"] = nextplayer;
                                $('#player-img').text("0");
                                $('#active-player-name').text(players[game["active_player"]]["name"]);
                                $('#remaining-rolls').text(game["max_rolls"]);
                                resetDices();
                            }
                            else {
                                alert("Es haben bereits alle Spieler gewuerfelt");
                            }
                        }
                        else {
                            alert("Es sind keine weiteren Spieler vorhanden");
                        }

                    }

                    $('#next-player').click(function () {
                        if (players[game["active_player"]]["rolls"] > 0) {
                            setNextPlayer();
                        }
                        else {
                            showMessage(players[game["active_player"]]["name"] + ", du musst mindestens 1 mal würfeln, bevor zum nächsten Spieler gewechselt werden kann.");
                        }
                    });

                    //Würfel fixieren

                    $('.dice').click(function () {

                        if (players[game["active_player"]]["rolls"] > 0) {
                            diceid = $(this).attr('id');

                            if ($(this).hasClass("dice-hold") == false) {
                                //if(rolls > 0)
                                //{
                                $(this).addClass("dice-hold");
                                //}
                            }
                            else {
                                $(this).removeClass("dice-hold");
                                $('input[id=dice-id-' + diceid + ']').val(0);
                            }
                        }
                        else {
                            showMessage("Du musst erst würfeln bevor du einen Würfel fixieren kannst.");
                        }
                    });

                    //Würfel Hover
                    $('.dice').hover(function () {
                        if ($(this).hasClass("dice-hold") == false) {
                            $(this).addClass("dice-hover");
                        }
                        else {
                            $(this).addClass("dice-hover-hold");
                        }
                    }, function () {
                        $(this).removeClass("dice-hover");
                        $(this).removeClass("dice-hover-hold");
                    });




                    /**
                    * Würfellogik
                    *
                    * Erzeugt pro nicht markieren Würfel eine neue Zufallszahl zwischen 1 und 6 und schreibt diese in den Würfel.
                    * Legt die maximale Wurfanzahl für die darauffolgenden Spieler fest, wenn der erste Spieler weniger als 3 mal würfelt.
                    *
                    */

                    $('#roll').click(function () {

                        $unlocked_cubes = $('.dice').not('.dice-hold');

                        if (players[game["active_player"]]["rolls"] < game["max_rolls"]) {
                            players[game["active_player"]]["rolls"]++;
                            anz_cubes = $unlocked_cubes.length;

                            //Zufallszahl erzeugen und in den Würfel schreiben
                            $unlocked_cubes.each(function (index, element) {
                                r_zahl = Math.floor(Math.random() * (6 - 1 + 1)) + 1;
                                $(this).text(r_zahl);

                            });

                            //Spielerinformationen aktualisieren
                            $('#remaining-rolls').text(game["max_rolls"] - players[game["active_player"]]["rolls"]);
                            $('#player-img').text(determinePoints());
                            players[game["active_player"]]["points"] = determinePoints();


                            //Überprüfen, ob der Spieler Chicago gewürfelt hat
                            if (players[game["active_player"]]["points"] == 300) {
                                players[game["active_player"]]["chicago"] = true;
                                showMessage("Gratulation " + players[game["active_player"]]["name"] + ", Chicago!");
                            }
                            else {
                                players[game["active_player"]]["chicago"] = false;
                            }

                            $('#player_points_' + game["active_player"]).text(players[game["active_player"]]["points"]);

                            //Nachdem der letzte Spieler seinen letzten Wurf gemacht hat, wird automtisch eine neue Runde gestartet.
                            if (players[game["active_player"]]["rolls"] + 1 > game["max_rolls"]) {
                                $.each(player_order, function (index, player) {
                                    if (game["active_player"] == player) {
                                        if ((index + 1) > (player_order.length - 1)) {
                                            newRound();
                                        }
                                    }

                                });
                            }
                        }
                        else {
                            showMessage("Du kannst nicht öfter als " + game["max_rolls"] + " mal würfeln.");
                        }
                    });

                    /**
                    * Punkte des aktuelle Wurfes ermitteln
                    * 
                    * Wird eine 1 oder 6 gewürfelt, wird das mit dem Faktor 100 bzw. 10 multipliziert. Andere Zahlen werden nicht als Punkte gezählt.
                    * Ist keine 1 oder 6 im Wurf vorhanden, so zählt jedes gewürfelte Auge als Punkt.
                    *
                    */
                    function determinePoints() {
                        $cubes = $('.dice');
                        only_fisch = true;
                        points = 0;

                        $cubes.each(function () {
                            if ($(this).text() == 1 || $(this).text() == 6) {
                                only_fisch = false;
                            }
                        });

                        $cubes.each(function () {
                            if (only_fisch == false) {
                                if ($(this).text() == 1) {
                                    points = points + 100;
                                }
                                if ($(this).text() == 6) {
                                    points = points + 60;
                                }
                            }
                            else {
                                points = points + parseInt($(this).text());
                            }
                        });

                        return points;
                    }

                    function newRound() {
                        assignBeermat();
                        resetDices();
                        game["max_rolls"] = 3;
                        resetRoundStats();
                        resetGameInfo();


                        $('#next-player').show();
                        $('#new-round').hide();

                    }

                    $('#new-round').click(function () {
                        if (players[game["active_player"]]["rolls"] > 0) {
                            newRound();
                        }
                        else {
                            showMessage("Du musst mindestens 1 mal würfeln, bevor zum nächsten Spieler gewechselt werden kann.");
                        }
                    });


                    /**
                    * Bierdeckel zuweisen
                    *
                    * Nachdem alle Spieler gewürfelt haben, wird der Spieler mit der geringsten Punktezahl festegestellt und ihm ein Bierdeckel zugewiesen.
                    * Sollte mehrere Spieler die gleichniedrige Punktezahl haben wird kein Bierdeckel vergeben, sondern eine neue Runde gestartet in den nur diese Spieler mit der niedrigsten Punkteanzahl teilnehmen können
                    * um einen Spieler zu definieren, dem ein Bierdeckel zugewiesen werden kann. (Auswürfeln)
                    * 
                    **/
                    function assignBeermat() {
                        minPlayers = new Array();
                        dp = new Array();
                        add = true;
                        i = 0;

                        $.each(player_order, function (index, player) {
                            if (minPlayers.length == 0) {
                                minPlayers[0] = new Array();
                                minPlayers[0]["player"] = player;
                                minPlayers[0]["points"] = players[player]["points"];

                                console.log("[0] " + players[player]["name"] + " hinzugefügt");
                            }
                            else {
                                delete_array = false;

                                $.each(minPlayers, function (index, minplayer) {

                                    if (minplayer["points"] > players[player]["points"]) {
                                        delete_array = true;
                                        //console.log("["+(index)+"] "+players[minplayer["player"]]["name"]+" entfernen, weil " + players[player]["name"] + " weniger Punkte hat.");
                                    }

                                    if (players[player]["points"] <= minplayer["points"]) {
                                        if (player == minplayer["player"]) {
                                            add = false;
                                            //console.log(players[player]["name"] + " nicht hinz. weil er schon dabei ist.");
                                        }
                                    }

                                    if (players[player]["points"] > minplayer["points"]) {
                                        add = false;
                                        //console.log(players[player]["name"]+ " nicht hinz. weil er mehr Punkte hat als "+ players[minplayer["player"]]["name"]+".");

                                    }

                                });

                                if (delete_array == true) {
                                    //console.log("Array löschen");
                                    minPlayers = [];

                                }

                                if (add === true) {
                                    if (minPlayers.length == 0) {
                                        ai = 0;
                                    }
                                    else {
                                        ai = minPlayers.length;
                                    }

                                    minPlayers[ai] = new Array();
                                    minPlayers[ai]["player"] = player;
                                    minPlayers[ai]["points"] = players[player]["points"];

                                    console.log("[" + ai + "] " + players[player]["name"] + " hinzugefügt");
                                }

                                add = true;
                            }

                            i++;

                        });

                        //Bierdeckel wird vergeben und eine neue wird gestartet, wenn ein Spieler mit der niedrigsten Punktezahl festegestellt werden konnte.        
                        if (minPlayers.length == 1) {
                            players[minPlayers[0]["player"]]["beers"] = players[minPlayers[0]["player"]]["beers"] + 1;

                            showMessage(players[minPlayers[0]["player"]]["name"] + " hat einen Bierdeckel erhalten.");

                            dp[0] = minPlayers[0]["player"];

                            setPlayerOrder(dp);

                            if (players[minPlayers[0]["player"]]["beers"] == 3) {
                                prost(minPlayers[0]["player"]);
                            }
                        }

                            //Es wurde mehrere Spieler ermittelt, die die gleichniedrige Punktezahl haben. Es wird eine neue Runde mit diesen Spielern gestartet.
                        else {
                            message = "";
                            dp = new Array();

                            $.each(minPlayers, function (index, player) {

                                dp.push(player["player"]);
                                message += players[player["player"]]["name"];

                                if (index + 1 < minPlayers.length) {
                                    if (index + 2 == minPlayers.length) {
                                        message += " und ";
                                    }
                                    else {
                                        message += ", ";
                                    }
                                }
                            });

                            message += " haben die gleiche Punkteanzahl. Auswürfeln!";
                            showMessage(message);
                            setPlayerOrder(dp);
                        }
                    }

                    /**
                    * Spielerinformationen der aktuellen Runde werden zurückgesetzt
                    */
                    function resetRoundStats() {
                        $.each(players, function (id, value) {
                            players[id]["points"] = 0;
                            players[id]["rolls"] = 0;
                        });
                    }


                    /**
                    * Ein neues Spiel wird gestartet. Es werden alle relevanten Informationen zurückgesetzt.
                    */
                    function resetGameStats() {
                        $.each(players, function (id, value) {
                            players[id]["points"] = 0;
                            players[id]["beers"] = 0;
                            players[id]["chicago"] = false;
                            players[id]["rolls"] = 0;

                            refreshPlayerInfo(id);
                        });

                        game["num_rounds"] = 0;
                        game["max_rolls"] = 3;
                        game["beermat_assigned"] = false;
                    }

                    /**
                    * Spielinformationen der aktuellen Runde werden zurückgesetzt.
                    */
                    function resetGameInfo() {
                        $('#player-img').text("0");
                        $('#active-player-name').text(players[game["active_player"]]["name"]);
                        $('#remaining-rolls').text(game["max_rolls"]);
                    }

                    /**
                    * Spielerinformationen des aktuellen Spielers aktualisieren
                    */
                    function refreshPlayerInfo(id) {
                        $("#player_points_" + id).text(players[id]["points"]);
                        $("#player_beers_" + id).text(players[id]["beers"]);
                        $("#player_drinks_" + id).text(players[id]["drinks"]);
                    }

                    /**
                    * Würfel aktualisieren
                    *
                    * Hebt die Markierung der Würfel auf und setzt die Augen auf 0 zurück.
                    *
                    */
                    function resetDices() {
                        //$('.dice').text("0");                 //Setzt die Augen auf 0 zurück. Standardmäßig deaktiviert.
                        $('.dice').removeClass('dice-hold');
                    }

                    /**
                    * Erzeugt eine Nachricht auf dem Bilschirm.
                    **/
                    function showMessage(message) {
                        $('#darkscreen').show();
                        $('#window-wrapper').show(100);
                        $('#window-message').text(message);
                        $('.window-button').hide();
                        $('#ok-button').show();
                    }

                    $('.window-button').click(function () {
                        $('#darkscreen').hide();
                        $('#window-wrapper').hide(100);

                        $.each(players, function (index, value) {
                            refreshPlayerInfo(index);
                        });
                    });

                    /**
                    * Beendet das aktuelle Spiel, gibt den Verlierer aus und setzt die Spielinformationen zurück. 
                    **/
                    function prost(id) {
                        showMessage("Prost, " + players[id]["name"] + "!");
                        players[id]["drinks"]++;
                        $('.window-button').hide();
                        $('#prost-button').show();
                        resetGameStats();
                        $('.roundinfo').text("0");

                    }

                });
            } else {
                // TODO: Diese Anwendung war angehalten und wurde reaktiviert.
                // Anwendungszustand hier wiederherstellen.
            }
            args.setPromise(WinJS.UI.processAll());
        }
    };

    app.oncheckpoint = function (args) {
        // TODO: Diese Anwendung wird gleich angehalten. Jeden Zustand,
        // der über Anhaltevorgänge hinweg beibehalten muss, hier speichern. Dazu kann das
        // WinJS.Application.sessionState-Objekt verwendet werden, das automatisch
        // über ein Anhalten hinweg gespeichert und wiederhergestellt wird. Wenn ein asynchroner
        // Vorgang vor dem Anhalten der Anwendung abgeschlossen werden muss,
        // args.setPromise() aufrufen.
    };

    app.start();
})();
