//global var
const e_GroupNames = {
	GOVERN: "Govern",
	METGE: "Metge", 
	MUSIC: "Music", 
	PROFESSOR: "Professor", 
	AGRICULTOR: "Productor_agrari"
}

var maxStatistic = 100;
var minStatistic = 0;
var startLoseHealth = 10; // Quant comences a perdre la vida (1 parametre comença a baixar)
var startWinHealth = 60; // Quant comences a guanyar vida (han de estar els 2 parametres estiguin per sobre d'aquest valor)
var amountHealth = 10; // Quanta vida perds o guanyes despres de cada carta
var Statistics = {};
var Keys;
var Players = [ e_GroupNames.METGE, e_GroupNames.MUSIC, e_GroupNames.PROFESSOR, e_GroupNames.AGRICULTOR ];

var GameStatistics = {
	month : 0, // El mes del joc
	nextMonth : 0, // Cuantes cartes falten per pasar al seguent mes
	staticNextMonth : 4, // Quantes cartes han de pasar per canviar de mes
	taxPlayers : -2, // Quant paguen els players com a impostos
	taxGovernment: 8, // Quant reb el govern dels impostos dels players
	nextTax: 0, // Quant falta per cobrar els impostos
	staticNextTax : 4 // Quantes cartes han de pasar per pagar impostos 
};

var characterImageNodes = document.querySelectorAll(".character-normalImage");

//Statistics
function checkIfNewGroup(group){
	var checkGroup = group.substr(0, group.indexOf('-')); 
	if(!Statistics.hasOwnProperty(checkGroup)){
		Statistics[checkGroup] = {};
	}
}

function takeStats(info){
	var group = info.substr(0, info.indexOf(world.splitter)); 
	var stat = info.substr(info.indexOf(world.splitter)+1, info.lenght);
	if(group.length > 0 && stat.length > 0){
		Statistics[group][stat] = (maxStatistic - minStatistic) /2;// + "%";
	}
}


function putStat(str_nameClass, nameGroup, isChild){
	var nameClass = document.getElementsByClassName(str_nameClass);
	var text = JSON.stringify(Statistics[nameGroup]);
	text = cleanString(text);

	var index = isChild || 0;

	nameClass[index].innerHTML = text;
}

function putStats(str_nameClass){
	var nameClass = document.getElementsByClassName(str_nameClass);
	for(group in nameClass){
		var index = parseInt(group);
		if(Number.isInteger(index)){
			putStat(str_nameClass, Players[index], index);
		}
	}
}

function updateStatisticsInterfice(){
	putStat("globalStatistics", e_GroupNames.GOVERN );
	putStats("statistics")

	// update images to make characters look ill/healthy
	var half_range = ( maxStatistic - minStatistic) / 2; // start losing when below half of max health
	for ( index in Players ){
		var opacityHealthy = ( Statistics[ Players[ index ] ]['Salut'] - minStatistic ) / half_range; // will go from 0 to 2, opacity ignores > 1 
		characterImageNodes[index].style.opacity = opacityHealthy;
	}
}

function StartStatistics(){
	for(stat in world.nameStats){
		checkIfNewGroup(world.nameStats[stat]);
		takeStats(world.nameStats[stat]);
	}
	Keys = getObjectKeys(Statistics);
	StartGameStatistics();
	updateStatisticsInterfice();
	updateGameStatisticsInterface();
	
}

function updateStatistics(cardStats){
	var index = 0;
	for(key in Keys){
		var group = Statistics[Keys[key]];
		for(property in group){
			var newValue = parseInt(group[property]) + parseInt(cardStats[index]);
			newValue = clamp(newValue, minStatistic, maxStatistic);
			group[property] = newValue;
			index = index + 1;
		}
	}
	//Update Date and Tax Parameters
	updateGameStatistics();

	//Update Health of every player
	updateHealth(e_GroupNames.METGE);
	updateHealth(e_GroupNames.MUSIC);
	updateHealth(e_GroupNames.PROFESSOR);
	updateHealth(e_GroupNames.AGRICULTOR);

	//Update interface
	updateStatisticsInterfice();
	updateGameStatisticsInterface();

	checkStatsGameEnding();
}

function checkStatsGameEnding () {
	for (var [ group, stats] of Object.entries(Statistics) ){
		if ( group == e_GroupNames.GOVERN ){
			if ( stats['Economia'] <= minStatistic  ){	goToEnding( e_Endings.ECONOMIA ); return;	}
			if ( stats['Infectats'] >= maxStatistic ){	goToEnding( e_Endings.INFECTATS ); return;	}
		}else{
			if ( stats['Salut'] <= minStatistic ){ 
				var ending_index = 1 
				switch(group) {
					case e_GroupNames.METGE: ending_index = e_Endings.METGE; break;
					case e_GroupNames.MUSIC: ending_index = e_Endings.MUSIC; break;
					case e_GroupNames.PROFESSOR: ending_index = e_Endings.PROFESSOR; break;
					case e_GroupNames.AGRICULTOR: ending_index = e_Endings.AGRICULTOR; break;
					default: ending_index = e_Endings.METGE; break;
				}
				goToEnding( ending_index );
				return;
			}
		}
	}
}

function updateHealth(player){
	var myStats = Statistics[player];
	if(myStats.Diners <= startLoseHealth || myStats.Felicitat <= startLoseHealth){
		myStats.Salut -= amountHealth;
	}
	else if(myStats.Diners >= startWinHealth && myStats.Felicitat >= startWinHealth && myStats.Salut < maxStatistic){
		myStats.Salut += amountHealth;
	}
	myStats.Salut = clamp(myStats.Salut, minStatistic, maxStatistic);
}

//General Parameters
function StartGameStatistics(){
	GameStatistics.month = 0;
	GameStatistics.nextMonth = GameStatistics.staticNextMonth;
	GameStatistics.nextTax = GameStatistics.staticNextTax;
}

function updateGameStatistics(){
	//Check Data
	GameStatistics.nextMonth -= 1;
	if(GameStatistics.nextMonth <= 0){
		GameStatistics.month += 1;
		GameStatistics.nextMonth = GameStatistics.staticNextMonth
	}

	//Check Tax
	GameStatistics.nextTax -= 1;
	if(GameStatistics.nextTax <= 0){
		GameStatistics.nextTax = GameStatistics.staticNextTax;
		Statistics[e_GroupNames.GOVERN].Economia = clamp(Statistics[e_GroupNames.GOVERN].Economia + GameStatistics.taxGovernment, minStatistic, maxStatistic);
		Statistics[e_GroupNames.METGE].Diners = clamp(Statistics[e_GroupNames.METGE].Diners + GameStatistics.taxPlayers, minStatistic, maxStatistic);
		Statistics[e_GroupNames.MUSIC].Diners = clamp(Statistics[e_GroupNames.MUSIC].Diners + GameStatistics.taxPlayers, minStatistic, maxStatistic);
		Statistics[e_GroupNames.PROFESSOR].Diners = clamp(Statistics[e_GroupNames.PROFESSOR].Diners + GameStatistics.taxPlayers, minStatistic, maxStatistic);
		Statistics[e_GroupNames.AGRICULTOR].Diners = clamp(Statistics[e_GroupNames.AGRICULTOR].Diners + GameStatistics.taxPlayers, minStatistic, maxStatistic);
	}
}

function updateGameStatisticsInterface(){
	var nameClass = document.getElementsByClassName("date");
	var text = "Mes: " + GameStatistics.month.toString();
	text = cleanString(text);
	nameClass[0].innerHTML = text;
}
