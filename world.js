const e_specialTags = {
	TYPE_CURSE: "M",
	TYPE_COMODIN: "C",
	TYPE_INFORMATIVE: "I",

	RAND: "RAND", 				// only tag 
	RAND_ACCEPT: "RAND_A",
	RAND_DISCARD: "RAND_D",
	
	RAND_BIAS: "RAND_BIAS",		// tag + number for probability for the first "Next Card"
	RAND_BIAS_ACCEPT: "RAND_BIAS_A",
	RAND_BIAS_DISCARD: "RAND_BIAS_D",

	NEXTPOS: "NEXTPOS", // tag + number for position in deck to put cards. Range [0,1]
	NEXTPOS_ACCEPT: "NEXTPOS_A",
	NEXTPOS_DISCARD: "NEXTPOS_D",

};



function Card ( numStats ) {
		this.img = "";

		this.effectsAccept = new Array( (numStats > 0) ? numStats : 0);
		this.effectsAccept.fill(0);
		
		this.effectsDiscard = new Array( (numStats > 0) ? numStats : 0);
		this.effectsDiscard.fill(0);

		this.nextAccept = []; // array of string. It was a single string before
		this.nextDiscard = []; // array of string. It was a single string before	
		
		this.specialTags = []; 
		this.description ="";
		this.firstOfChain =false ;
		

}
Card.prototype.addStat = function(){
	this.effectsAccept.push(0);
	this.effectsDiscard.push(0);
}
Card.prototype.deleteStat = function (index){
	this.effectsAccept.splice(index);
	this.effectsDiscard.splice(index);
}
Card.prototype.changeStat = function( index, value = 0, AorD = 'A' ){ // to Accept array or to Discard array
	if (index < 0 || index >= this.effectsAccept.length){ return; }
	
	if (AorD == 'D'){
		this.effectsDiscard[ index ] = value;
	}
	else{
		this.effectsAccept[ index ] = value;
	}
}
Card.prototype.changeImage = function ( path ){
	this.img = path;
}
Card.prototype.changeDescription = function (description =""){
	this.description = description;
}
Card.prototype.getImage = function (){
	return this.img;
}
Card.prototype.getStatValue = function ( i, AorD ='A' ){
	if ( i < 0 || i >= this.effectsAccept.length){ return undefined; }
	if (AorD == 'D'){
		return this.effectsDiscard[ i ];
	}
	else{
		return this.effectsAccept[ i ];
	}
}	

Card.prototype.getDescription = function(){
	return this.description;
}
Card.prototype.isFirst = function(){
	return this.firstOfChain;
}
Card.prototype.setSpecialTags = function ( tags = [] ){
	this.specialTags = JSON.parse( JSON.stringify( tags ) ); 
}
Card.prototype.setNextCardAccept = function ( cardNames = [] ){
	this.nextAccept = JSON.parse( JSON.stringify( cardNames ) );
}
Card.prototype.setNextCardDiscard = function ( cardNames = [] ){
	this.nextDiscard = JSON.parse( JSON.stringify( cardNames ) );
}
Card.prototype.setNextCards = function ( acceptCardName, discardCardName){
	this.setNextCardAccept ( acceptCardName || [] );
	this.setNextCardDiscard ( discardCardName || [] );
}
Card.prototype.getSpecialTags = function() { return this.specialTags; }
Card.prototype.getAcceptCards = function() { return this.nextAccept;  }
Card.prototype.getDiscardCards = function(){ return this.nextDiscard; }

Card.prototype.setFirstOfChain = function( value = false ){ this.firstOfChain = value; }

Card.prototype.toJSON = function (){
	return {
		img: this.img,
		effectsAccept: this.effectsAccept ,
		effectsDiscard: this.effectsDiscard ,
		nextAccept: this.nextAccept,
		nextDiscard: this.nextDiscard,	
		description: this.description,
		specialTags: this.specialTags,
		firstOfChain: this.firstOfChain,
	};

}
Card.prototype.fromJSON = function ( json ){
	this.img = json.img || "";
	this.effectsAccept = json.effectsAccept || [];
	this.effectsDiscard = json.effectsDiscard || [];
	
	if ( typeof(json.nextAccept) === 'string'){
		this.nextAccept = json.nextAccept.split('-').filter(Boolean); // compatibility stuff
	}else if ( Array.isArray( json.nextAccept ) ){
		this.nextAccept = JSON.parse( JSON.stringify( json.nextAccept ) ).filter(Boolean); // filter to ignore strings like ""
	}else{
		this.nextAccept = [];
	}

	if ( typeof(json.nextDiscard) === 'string'){
		this.nextDiscard = json.nextDiscard.split('-').filter(Boolean); // compatibility stuff
	}else if ( Array.isArray( json.nextDiscard ) ){
		this.nextDiscard = JSON.parse( JSON.stringify( json.nextDiscard ) ).filter(Boolean); // filter to ignore strings like "" 
	}else{
		this.nextDiscard = [];
	}
	this.specialTags = json.specialTags || [];

	this.description = json.description || "";
	this.firstOfChain = (json.firstOfChain) ? json.firstOfChain : false;
}
// WORLD

function World () {
	this.nameStats = [ ];
	this.statValues = [ ];
	this.cards = { };
	this.deck = [ ];
	
	this.splitter = "-"; // separates group from stat in nameStats values
	this.imageFolder = "cardImages";

}
World.prototype.addStat = function( group, stat, value = 0 ){
	this.nameStats.push( group + this.splitter + stat);
	this.statValues.push(value);
	
	for (var [key, card] of Object.entries(this.cards)){
		card.addStat();
	}
}

World.prototype.checkGroup = function( groupName ){
	for (var i = 0; i < this.nameStats.length; ++i){
		var res = this.nameStats[i].split( this.splitter );
		if (res[0] === groupName){ return true; }
	}
	return false;
}
World.prototype.checkStat = function (groupName, statName) {
	for (var i = 0; i < this.nameStats.length; ++i){
		if ( this.nameStats[i] === ( groupName + this.splitter + statName ) ) {
			return true;
		}
	}
	return false;

}
World.prototype.checkCard = function ( name) {
	if ( typeof(this.cards [ name ] ) === 'undefined' ){ return false; }
	return true;
}


// expensive
World.prototype.getGroups = function(){
	var array = [];
	var THAT = this;
	this.nameStats.forEach( function (item) {
		var res = item.split( THAT.splitter );
		if ( ! array.includes( res[0] ) ){
			array.push( res[0] );
		}
	});
	return array;
}

// expensive
World.prototype.getGroupStats = function (groupName){
	var array = [];
	var THAT = this;
	this.nameStats.forEach( function (item) {
		var res = item.split( THAT.splitter );
		if (res[0] !== groupName){ return; }

		if ( ! array.includes( res[1] ) ){
			array.push( res[1] );
		}
	});
	return array;

}
World.prototype.deleteStat = function ( group, stat){
	var str = group + this.splitter + stat;
	var index_toRemove = -1;
	// delete from main arrays
	for(var i= 0; i < this.nameStats.length; ++i){
		if (this.nameStats[i] === str){
			index_toRemove = i;
			this.nameStats.splice(index_toRemove );
			this.statValues.splice(index_toRemove );

			break;
		}
	}
	if (index_toRemove == -1){ return; }

	// delete entries from cards
	for ( var [key, card] of Object.entries(this.cards)){
		card.deleteStat(index_toRemove); 
	}
}

World.prototype.deleteGroup = function ( group ){
	// delete from main arrays
	for(var i= 0; i < this.nameStats.length; ++i){
		if (this.nameStats[i].startsWith( group ) ){
			
			this.nameStats.splice( i );
			this.statValues.splice( i );
			// delete entries from cards
			for ( var [key, card] of Object.entries(this.cards)){
				card.deleteStat(i); 
			}
			i--;

		}
	}


}

// reference 
World.prototype.getStatArray = function () {
	return this.nameStats;
}
World.prototype.getCardsObject = function() {
	return this.cards;
} 
World.prototype.getCard = function(name ="card"){
	return this.cards[name];
}
// returns true if it could be created, false if already existed
World.prototype.createCard = function( name = "card" ){
	if ( typeof(this.cards [ name ] ) !== 'undefined' ){ return false; }

	this.cards[ name ] = new Card( this.nameStats.length );
	return true;
}
World.prototype.deleteCard = function (name = "card"){
	if ( typeof(this.cards [ name ] ) !== 'undefined' ){ 
		delete this.cards [ name ];
		return true; 
	}
	return false;
}

World.prototype.renameCard = function ( oldName, newName ){
	if ( typeof(this.cards [ oldName ] ) === 'undefined' ){ return false; }
	var card = this.cards [ oldName ];
	delete this.cards [ oldName ];
	this.cards[ newName ] = card;


}

World.prototype.getCardPath = function (){
	return this.imageFolder;
}

World.prototype.createDeck = function (  onlyFirst = true ) {
	var deck = [];
    for ( var [name, card] of Object.entries( this.cards ) ){
        // should be included from start
        if ( onlyFirst ){
            if ( card.isFirst() ){ deck.push( name ); }
        }else{
            deck.push( name );
        }
    }

	this.deck = shuffle( deck );
	this.deck = shuffle( this.deck );

}

World.prototype.testCardSet = function () {
	var THAT = this;
	var err_count = 0;
	for ( var [ name, card] of Object.entries(this.cards)){
		var array = card.getAcceptCards();
		array.forEach( function (item) { 
			if ( ! THAT.cards[ item ] ){
				var msg = "ERROR INVALID CARD: From current Card: \"" +  name + "\" ---> access to \"" + item + "\"" ;
				console.log(msg);
				err_count++;
			}
		});
		array = card.getDiscardCards();
		array.forEach( function (item) { 
			if ( ! THAT.cards[ item ] ){
				var msg = "ERROR INVALID CARD: From current Card: \"" +  name + "\" ---> access to \"" + item + "\"" ;
				console.log(msg);
				err_count++;
			}
		});
	}

	if ( err_count == 0){ 
		console.log( "CARDSET OK"); 
		return true;
	}
	return false;
}

World.prototype.toJSON = function (){
	return{
		nameStats : JSON.parse( JSON.stringify( this.nameStats ) ),
		statValues : JSON.parse( JSON.stringify( this.statValues ) ),
		cards : JSON.parse( JSON.stringify( this.cards ) ),
		deck : JSON.parse( JSON.stringify( this.deck ) ),
		imageFolder: JSON.parse( JSON.stringify( this.imageFolder ) ),
		splitter: JSON.parse( JSON.stringify( this.splitter ) )
	};
}
World.prototype.fromJSON = function( json ){

	this.nameStats = json.nameStats;
	this.statValues = json.statValues;
	
	for ( var [key, card] of Object.entries(json.cards)){
		var c = new Card();
		c.fromJSON(card)
		this.cards[ key ] = c; 
	}
	
	this.deck = json.deck;
	this.splitter = json.splitter;
	this.imageFolder = json.imageFolder;
	
}
	
