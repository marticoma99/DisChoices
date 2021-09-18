var buttonClickAudio = getAudio('./sounds/button.wav');
var backgroundAudio = getAudio('./sounds/background.mp3');
backgroundAudio.loop = true;
// ------------ basically a screen changer -----------------------


// from intro to game
var intro7Next = document.querySelector("#nextButton7");
var introStartGame = document.querySelector("#startButton");
intro7Next.addEventListener("click", goToGame);
introStartGame.addEventListener("click", goToGame);


// from game to intro
document.addEventListener("keyup", function (e) {
	if (e.code === "KeyQ") { goToMenu(); }
});


// ending
document.querySelector("#endToMenuButton").addEventListener("click", goToMenu);
document.querySelector("#endTNewGameButton").addEventListener("click", goToGame);


//start on menu
goToMenu();


function goToMenu() {
	StopGame();
	returnToMenu();
	StopWriterEnd();

	document.getElementById("introHTML").style.display = "";
	document.getElementById("gameHTML").style.display = "none";
	document.getElementById("endingHTML").style.display = "none";

	buttonClickAudio.play();
}

function goToGame() {
	ResetGame();
	StopWriterEnd();

	actualScreen = 0;

	document.getElementById("introHTML").style.display = "none";
	document.getElementById("gameHTML").style.display = "";
	document.getElementById("endingHTML").style.display = "none";

	buttonClickAudio.play();
	backgroundAudio.play();
}

function goToEnding(numEnd = 1) {

	if (!backgroundAudio.paused) {
		backgroundAudio.pause();
		backgroundAudio.currentTime = 0;
	}

	StopGame();
	ResetWriterEnd(numEnd);

	document.getElementById("introHTML").style.display = "none";
	document.getElementById("gameHTML").style.display = "none";
	document.getElementById("endingHTML").style.display = "";

	buttonClickAudio.play();
}
