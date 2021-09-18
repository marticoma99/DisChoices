// ---------- intro page of game -----------------
// new game button and final next button of introduction are in main.js

var introButton = document.querySelector("#introButton");
var initButton = document.querySelector("#initButton");
var intro1Next = document.querySelector("#nextButton1");
var intro2Next = document.querySelector("#nextButton2");
var intro2Previous = document.querySelector("#previousButton2");
var intro3Next = document.querySelector("#nextButton3");
var intro3Previous = document.querySelector("#previousButton3");
var intro4Next = document.querySelector("#nextButton4");
var intro4Previous = document.querySelector("#previousButton4");
var intro5Next = document.querySelector("#nextButton5");
var intro5Previous = document.querySelector("#previousButton5");
var intro6Next = document.querySelector("#nextButton6");
var intro6Previous = document.querySelector("#previousButton6");
var intro7Previous = document.querySelector("#previousButton7");


var isFullScreen = false;
var i = 0;
var actualScreen = 1;
var typingAudio = getAudio('./sounds/typing.wav');
var cardAudio = getAudio('./sounds/card.wav');

introButton.addEventListener("click", intro);
intro1Next.addEventListener("click", function () { introNext(1) });
intro2Next.addEventListener("click", function () { introNext(2) });
intro2Previous.addEventListener("click", function () { introPrevious(2) });
intro3Next.addEventListener("click", function () { introNext(3) });
intro3Previous.addEventListener("click", function () { introPrevious(3) });
intro4Next.addEventListener("click", function () { introNext(4) });
intro4Previous.addEventListener("click", function () { introPrevious(4) });
intro5Next.addEventListener("click", function () { introNext(5) });
intro5Previous.addEventListener("click", function () { introPrevious(5) });
intro6Next.addEventListener("click", function () { introNext(6) });
intro6Previous.addEventListener("click", function () { introPrevious(6) });
intro7Previous.addEventListener("click", function () { introPrevious(7) });
initButton.addEventListener("click", returnToMenu);

var txtTutorial = [];

txtTutorial[0] = "Bon dia President, ens acaben d'informar de l'existència d'una nova pandèmia mundial a la qual hem de fer front. A partir d'ara hauràs de començar a prendre decisions sobre la gestió de la pandèmia.";
txtTutorial[1] = "Com a president, el més important és que mantinguis l'equilibri entre les necessitats del govern i les dels ciutadans. Per això, en tot moment podràs veure com es troben alguns sectors de la societat.";
txtTutorial[2] = "La imatge mostrada respresenta el sector dels sanitaris. No cal explicar perquè aquest sector és important durant una pandèmia, però més et val que no els hi passi res o tot el sistema sanitari colapsarà.";
txtTutorial[3] = "La imatge mostrada respresenta el sector dels productors agraris. La població necessita menjar i en una pandèmia on les relacions amb l'exterior poden no existir és molt important refoçar els productors locals.";
txtTutorial[4] = "La imatge mostrada respresenta el sector cultural. Podria semblar que aquest sector no és de primera necessitat durant la pandemia, però per la salut mental de la població és molt important que tinguin algun entreteniment.";
txtTutorial[5] = "La imatge mostrada respresenta el sector educatiu. Encara que estiguem en pandèmia no ens hem d'oblidar que el futur del país depén de com de ben preparats estiguin els joves, i per tant de la seva educació.";
txtTutorial[6] = "Recorda en tot moment que si l'estat d'algun sector de la població és dolent, el govern es queda sense diners o la pandèmia empitjora molt, el país col·lapsarà i hauràs fracassat com a president. Bona sort!";

function intro() {
    document.querySelector(".containerMenu").style.display = "none";
    document.querySelector(".containerIntro").style.display = "block";
    document.getElementById("introText1").innerHTML = "";
    i = 0;
    actualScreen = 1;
    if (!typingAudio.paused) {
        typingAudio.pause();
        typingAudio.currentTime = 0;
    }
    setTimeout(typeWriter, 1000, 1);
    setTimeout(function () { cardAudio.play() }, 350);

    buttonClickAudio.play();
}

function returnToMenu() {
    i = 0;
    actualScreen = 0;
    if (!typingAudio.paused) {
        typingAudio.pause();
        typingAudio.currentTime = 0;
    }
    document.querySelector("#intro1").style.display = "none";
    document.querySelector("#intro2").style.display = "none";
    document.querySelector("#intro3").style.display = "none";
    document.querySelector("#intro4").style.display = "none";
    document.querySelector("#intro5").style.display = "none";
    document.querySelector("#intro6").style.display = "none";
    document.querySelector("#intro7").style.display = "none";
    document.querySelector(".containerMenu").style.display = "block";

    buttonClickAudio.play();
}

function introNext(screen) {
    document.querySelector("#intro" + screen).style.display = "none";
    document.querySelector("#intro" + (screen + 1)).style.display = "block";
    document.getElementById("introText" + (screen + 1)).innerHTML = "";
    i = 0;
    actualScreen = (screen + 1);
    setTimeout(typeWriter, 1000, (screen + 1));
    if (!typingAudio.paused) {
        typingAudio.pause();
        typingAudio.currentTime = 0;
    }
    setTimeout(function () { cardAudio.play() }, 350);

    buttonClickAudio.play();
}

function introPrevious(screen) {
    document.querySelector("#intro" + screen).style.display = "none";
    document.querySelector("#intro" + (screen - 1)).style.display = "block";
    document.getElementById("introText" + (screen - 1)).innerHTML = "";
    i = 0;
    actualScreen = (screen - 1);
    setTimeout(typeWriter, 1000, (screen - 1));
    if (!typingAudio.paused) {
        typingAudio.pause();
        typingAudio.currentTime = 0;
    }
    setTimeout(function () { cardAudio.play() }, 350);

    buttonClickAudio.play();
}

function getFullscreen(element) {

    buttonClickAudio.play();

    if (!isFullScreen) {
        if (element.requestFullscreen) {
            element.requestFullscreen();
        } else if (element.mozRequestFullScreen) {
            element.mozRequestFullScreen();
        } else if (element.webkitRequestFullscreen) {
            element.webkitRequestFullscreen();
        } else if (element.msRequestFullscreen) {
            element.msRequestFullscreen();
        }
    }
    else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        }
    }

    if (isFullScreen) isFullScreen = false;
    else isFullScreen = true;
}

document.querySelector("#fullScreenButton").addEventListener("click", function (e) {
    getFullscreen(document.documentElement);
}, false);

function typeWriter(numScreen) {
    txt = txtTutorial[(numScreen - 1)];

    if (i < txt.length && actualScreen == numScreen) {
        document.getElementById("introText" + numScreen).innerHTML += txt.charAt(i);
        i++;
        setTimeout(typeWriter, 20, numScreen);
        if (typingAudio.paused) typingAudio.play();
    } else {
        if (!typingAudio.paused) {
            typingAudio.pause();
            typingAudio.currentTime = 0;
        }
    }
}
