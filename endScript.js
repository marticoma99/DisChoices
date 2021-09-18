// ------- End of game -----------------

// menu and restart buttons are on main.js


const e_Endings = {
    ECONOMIA: 1,
    INFECTATS: 2,
    METGE: 3,
    MUSIC: 4,
    PROFESSOR: 5,
    AGRICULTOR: 6
}


var endText = document.querySelector("#endText1");
var typingAudio = getAudio('./sounds/typing.wav');
var loseAudio = getAudio('./sounds/lose.wav');

var possibleEnds = [];

possibleEnds[e_Endings.ECONOMIA] = "El govern s'ha quedat sense diners, tota la gent del país s'està morint degut a la impossibilitat del govern de pendre cap acció per frenar la pandèmia per la precarietat económica."
possibleEnds[e_Endings.INFECTATS] = "L'estat de la pandèmia ha empitjorat molt al país. Els pocs ciutadans que queden s'estan morint. Deixes de ser president perquè no pots governar un país on no hi ha ningú per ser governat."
possibleEnds[e_Endings.METGE] = "Totes les persones del sector sanitari s'estan morint per les males decissions que has pres. Ja no poden fer front a la panèmia ni a cap altre malaltia. La resta de la població ha començat a morir de simples refredats."
possibleEnds[e_Endings.MUSIC] = "Per culpa de la ineptitud del govern les persones del sector cultural s'estan morint. La gent no sap amb que entretenir-se així que han començat a sortir al carrer a passar l'estona i tota la població s'ha infectat del virus."
possibleEnds[e_Endings.PROFESSOR] = "El país es troba sense alumnes ni professors ja que han mort degut a les males pràctiques del govern.  Sense joves ni educació no hi ha futur, així que a poc a poc el país ha anat entrant en declivi intel·lectual. Segons les últimes estimacions, tenim el coeficient d'un neandertal. El país se'n va a la ruïna."
possibleEnds[e_Endings.AGRICULTOR] = "Les males decisions preses pel govern han provocat que el sector agricola es mori. Com que no hi ha exportacions d'aliments d'altres paísos la gent no té què menjar i es comença a morir de gana."

var i = 0;
var stopTypeWriterEnd = false;

function StopWriterEnd () {
    stopTypeWriterEnd = true;
}
function ResetWriterEnd ( numEnd ){
    stopTypeWriterEnd = false;
    i = 0;
    document.getElementById("endText1").innerHTML = ""; 
    document.getElementById("endTextMonth1").innerHTML = "";

    typeWriterEnd( numEnd );

    loseAudio.play();
}

function typeWriterEnd(numEnd) {
    txt = possibleEnds[numEnd];
	var month = "MES  " + GameStatistics.month.toString();
    if (i < txt.length && ! stopTypeWriterEnd ) {
		if ( i < month.length ){				
			document.getElementById("endTextMonth1").innerHTML += month.charAt(i);
		}
        document.getElementById("endText1").innerHTML += txt.charAt(i);
        i++;
        setTimeout(typeWriterEnd, 20, numEnd);
        if (typingAudio.paused) typingAudio.play();
    } else {
        if (!typingAudio.paused) {
            typingAudio.pause();
            typingAudio.currentTime = 0;
        }
        i=0;
    }
}