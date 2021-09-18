
function RenderCard () {
    this.pos = [0,0];
    this.targetPos = [0,0];
    this.speed = 9;
    
    this.size = [0,0];

    //png carta 16 x 24 px   24/16 = 1.5     16/24 = 0.66667
    this.aspectRatio = 0.6667;  //      16 / 24 = width / height
    this.backgroundPixelSize_x = 1 / 16;
    this.backgroundPixelSize_y = 1 / 24;

    this.backgroundImg = "normalCard.png";

    this.cardName ="";
    this.card = {}; // of type Card from World.js
    this.world = new World(); // from world.js
}

RenderCard.prototype.update  = function ( dt ){
    var p = dt * this.speed;
    p = (p > 1) ? 1 : p;
    this.pos[0] = this.pos[0] * (1 - p) + this.targetPos[0] * p;  
    this.pos[1] = this.pos[1] * (1 - p) + this.targetPos[1] * p;  

}


RenderCard.prototype.isPointInside = function ( point = [0,0]){
    var p = [ point[0] - this.pos[0], point[1] - this.pos[1]];
   return  ( p[0] > - this.size[0] /2 ) && ( p[0] < this.size[0] /2 ) && ( p[1] > - this.size[1] /2 ) && ( p[1] < this.size[1] /2 );
}

RenderCard.prototype.resize = function ( w, h ){
     // resize card proportional to the shortest axis
     var minSize = ( w > h ) ? h : w;
     this.size = [minSize * this.aspectRatio,  minSize ];  // height will always be the largest axis
}
RenderCard.prototype.setWorld = function ( world ){
    this.world = world;
}
RenderCard.prototype.setPos = function ( _pos = [0,0]){
    this.pos = _pos;
}
RenderCard.prototype.setTarget = function ( _targ = [0,0]){
    this.targetPos = _targ;
}

RenderCard.prototype.setCard = function ( _card ){
    this.card = _card;
}

RenderCard.prototype.getPos = function () { return this.pos; }
RenderCard.prototype.getSize = function () { return this.size; }
RenderCard.prototype.getPixelSize = function () {
    // scale pixel size proportional to world size   
    return [this.backgroundPixelSize_x * this.size[0], this.backgroundPixelSize_y * this.size[1] ];
}
RenderCard.prototype.getCard = function () { return this.card; }
RenderCard.prototype.getBackgroundImg = function( fullpath = true ) { return (fullpath) ? (this.world.getCardPath() + "/" + this.backgroundImg) : this.backgroundImg; }
RenderCard.prototype.getCardType = function () {
	if ( ! this.card ) return "ERROR";
	
    var tags = this.card.getSpecialTags();
    if ( tags.indexOf( e_specialTags.TYPE_CURSE ) > -1 ){
        return e_specialTags.TYPE_CURSE;
    }else if ( tags.indexOf( e_specialTags.TYPE_COMODIN ) > -1 ){
        return e_specialTags.TYPE_COMODIN;
    }else if ( tags.indexOf(e_specialTags.TYPE_INFORMATIVE) > -1 ) {
        return e_specialTags.TYPE_INFORMATIVE;
    }    
    else {
        return "";
    }
	
}
RenderCard.prototype.executeCard = function( direction= "A"){ // 'A' to accept, 'D' (else) to discard
    var cardEffects = [];
    var nextCards = []; 
    var specialTags = this.card.getSpecialTags();

    var tagSpecialRand; // rand-accept or rand-discard
    var tagSpecialRandBias; // rand-accept or rand-discard
    var tagSpecialNextPos; 
    if ( direction === "A"){
        cardEffects = this.card.effectsAccept;
        nextCards = this.card.getAcceptCards();

        tagSpecialRand = e_specialTags.RAND_ACCEPT;
        tagSpecialRandBias = e_specialTags.RAND_BIAS_ACCEPT;
        tagSpecialNextPos = e_specialTags.NEXTPOS_ACCEPT;
    }else{
        cardEffects = this.card.effectsDiscard;
        nextCards = this.card.getDiscardCards();

        tagSpecialRand = e_specialTags.RAND_DISCARD;
        tagSpecialRandBias = e_specialTags.RAND_BIAS_DISCARD;
        tagSpecialNextPos = e_specialTags.NEXTPOS_DISCARD;
    }


    // normal rand
    var isRand =  ( specialTags.indexOf( e_specialTags.RAND ) > -1 || specialTags.indexOf( tagSpecialRand ) > -1 ) ;
    if ( isRand && nextCards.length > 0) {
        var cardIndex = roundFloat( Math.random() * ( nextCards.length - 1 ) ); 
        nextCards = [ nextCards[cardIndex] ]; // instead of whole array, just one random card
    }
    
    // bias rand
    var randbias_i = specialTags.indexOf( e_specialTags.RAND_BIAS );
    var randbiasSpecial_i = specialTags.indexOf( tagSpecialRandBias );
    if ( ( randbias_i > -1 || randbiasSpecial_i > -1 ) && nextCards.length > 1 ){
        var bias = 0.5;
        if ( randbiasSpecial_i > -1 ){
            bias = parseFloat( specialTags[ randbiasSpecial_i + 1 ] );
        }else{ 
            bias = parseFloat( specialTags[ randbias_i + 1 ] );
        }

        var rnd = Math.random();
        nextCards = ( rnd <= bias ) ? nextCards[0] : nextCards[1] ;
        nextCards = [ nextCards ]; 

    }
    
    // update deck, inserting cards in specific place or at the end
    var posOnDeck = 1; // range [0-1], normalized. Default appends at the end
    
    var tag_index = specialTags.indexOf(e_specialTags.NEXTPOS);
    if ( tag_index > -1 ){        posOnDeck = parseFloat( specialTags[ tag_index + 1] );    }
    tag_index = specialTags.indexOf( tagSpecialNextPos );
    if ( tag_index > -1 ){        posOnDeck = parseFloat( specialTags[ tag_index + 1] );    }

    var finalPos = roundFloat ( posOnDeck * this.world.deck.length ); // to append in splice it is needed final index of array + 1 = length
    
    // put array of next cards in deck
    var finalDeck = this.world.deck.slice(0, finalPos);
    finalDeck = finalDeck.concat( nextCards );
    finalDeck = finalDeck.concat( this.world.deck.slice(finalPos, this.world.deck.length ) );
    this.world.deck = finalDeck;
    
    // update statistics
    updateStatistics(cardEffects);

}
RenderCard.prototype.takeCard = function( ){ // of type World
    if ( ! this.world.deck.length ){
        this.world.createDeck();
    }
    
    var cardName = this.world.deck.shift(); // pop from front of array 
    var nextCard = this.world.cards[ cardName ];
    
    if ( ! nextCard ){ 
        var msg = "ERROR INVALID CARD: From current Card: \"" +  this.cardName + "\" ---> access to \"" + cardName + "\"" ;
        throw Error(msg );
    }

    this.cardName = cardName;
    this.card = nextCard;
    
    // change background image
    var tags = this.card.getSpecialTags();
    if ( tags.indexOf( e_specialTags.TYPE_CURSE ) > -1 ){
        this.backgroundImg = "curseCard.png";
    }else if ( tags.indexOf( e_specialTags.TYPE_COMODIN ) > -1 ){
        this.backgroundImg = "comodinCard.png";
    }else {
        this.backgroundImg = "normalCard.png";
    }
}