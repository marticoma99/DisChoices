// MAIN EXECUTION AT THE BOTTOM OF FILE


const canvas = document.getElementById("framebuffer");
canvas.onselectstart = function () { return false; } // avoid selection when double-clilcking
const canvasParent = canvas.parentNode;


const MAX_CARD_TILT = 60 * Math.PI / 180; // radiants

// how much accept/discard is the card position in ranges from [0,1]
const alphActionTolerance_ct = 0.5;
var alphaAccept = 0;
var alphaDiscard = 0;


var renderCard = new RenderCard();
var isCardSelected = false;
var isCardChanging = false;


canvas.addEventListener("mousemove", updateTargetPos);
canvas.addEventListener("mouseup", unClickCard);
canvas.addEventListener("mousedown", clickCard);

var audio = getAudio('./sounds/card.wav');


// on mouse up
function unClickCard(event) {
	if ( isCardChanging ) 
		return;
	
    isCardSelected = false;
    if (alphaAccept > alphActionTolerance_ct) {
		isCardChanging = true;
        renderCard.executeCard("A");
        audio.play();
        renderCard.setTarget([canvas.width, 0]);
        setTimeout(function(){ 
            renderCard.setTarget([canvas.width, canvas.height * 2]);
        }, 250);
        setTimeout(function(){
            renderCard.setTarget([0, canvas.height * 2]);
        }, 500);
        setTimeout(function(){
            renderCard.takeCard( );
            renderCard.setTarget([0, 0]);
            audio.play();
			isCardChanging = false;
        }, 1000);
        //renderCard.setPos([0, 0]);

    }
    else if (alphaDiscard > alphActionTolerance_ct) {
		isCardChanging = true;
        renderCard.executeCard("D");
        audio.play();
        renderCard.setTarget([-canvas.width, 0]);
        setTimeout(function(){
            renderCard.setTarget([-canvas.width, canvas.height * 2]);
        }, 250);
        setTimeout(function(){
            renderCard.setTarget([0, canvas.height * 2]);
        }, 500);
        setTimeout(function(){
            renderCard.setTarget([0, 0]);
            renderCard.takeCard( );
            audio.play();
			isCardChanging = false;
        }, 1000);
        //renderCard.setPos([0, 0]);

    }
    else renderCard.setTarget([0, 0]);

}

function adjustMouseCoordsToCanvas(x,y, _canvas, center=true){
	var rect = _canvas.getBoundingClientRect();
    //there might be something before canvas which offsets real canvas pos
	var p =[ x - rect.left/2, y - rect.top/2 ]; // // i don't understand why left/2 and height/2 is needed but it works 
	return (center)? [ p[0] - ( rect.width *0.5 ), p[1] - ( rect.height *0.5 )] : p;
}
// on mouse click
function clickCard(event) {
	if ( isCardChanging ) 
		return;
	
	var mouse = adjustMouseCoordsToCanvas( event.clientX, event.clientY, canvas);

    if (renderCard.isPointInside( mouse )) {
        isCardSelected = true;
    }
}

// on mouse move
function updateTargetPos(event) {
    if (!isCardSelected) { return; }
    // event.client is page coordinadtes (despite eventlistener only on canvas)
	var mouse = adjustMouseCoordsToCanvas( event.clientX, event.clientY, canvas);

    renderCard.setTarget(mouse);

}

// update how near/far is the card from being accepted/discarded
function updateStateAlphas() {
    var x = renderCard.getPos()[0];
    alphaAccept = x / (canvas.width * 0.5);
    alphaDiscard = x / (canvas.width * 0.5);

    alphaAccept = clamp(alphaAccept, 0, 1);
    alphaDiscard = Math.abs(clamp(alphaDiscard, -1, 0));
}
//called on LOOP()
function update(dt) {

    // 80% of canvas max
    renderCard.resize(canvas.width * 0.8, canvas.height * 0.8);
    renderCard.update(dt);

    updateStateAlphas();

}




// ----------- RENDER -------------------------------

// centered rectangle ie (x,y) position of center of rect
function drawRotatedRect(ctx, x, y, w, h, radiants = 0) {
    ctx.save();

    // move origin of ctx to center of rectangle 
    ctx.translate(x, y);

    ctx.rotate(radiants);

    ctx.rect(- w / 2, - h / 2, w, h);
    ctx.fill();

    ctx.restore();
}

// centered rectangle ie (x,y) position of center of rect. All world spaces
function drawRotatedImg(ctx, img_str, pos_x, pos_y, w, h, centerRot_x, centerRot_y, radiants = 0, drawStroke = false, pixelated = true) {
    ctx.save();
    ctx.imageSmoothingEnabled = !pixelated;

    // move origin of ctx to center of rotation rectangle 
    ctx.translate(centerRot_x, centerRot_y);

    ctx.rotate(radiants);

    // position is the center of the image
    var x = ( pos_x - centerRot_x) - w / 2;
    var y = ( pos_y - centerRot_y) - h / 2;

    ctx.drawImage(getImage(img_str), x, y, w, h);
    if (drawStroke) {
        ctx.lineWidth = 5;
        ctx.strokeStyle = "#e9e1ff";
        ctx.strokeRect( x, y, w, h);
    }
    ctx.restore();
}

function drawDescriptionCard(ctx, rcard, radiants) {
	ctx.save();
	
    var cardpos = rcard.getPos(); 
    var cardSize = rcard.getSize();
    var w = cardSize[0]; 
    var h = cardSize[1];
    var backgroundPixelSize = rcard.getPixelSize();

	ctx.translate(cardpos[0], cardpos[1]);
    ctx.rotate(radiants);
	
    ctx.globalAlpha = 1.0 - (MAX_CARD_TILT / 2 * Math.abs(radiants));

    // compute font size 
	var basicFont = 25; // on canvas.width = 960 it is suficiently good
	var realFont = canvas.width * basicFont / 960; // readjust to current width
	ctx.font = realFont +'px Lucida Console';
	
	
    ctx.fillStyle = "#e9e1ff";
    //var words = divText(rcard.card.getDescription(), ".");
    var words = rcard.card.getDescription().split(' ');
    var line = "";


    var pos_x = - (w / 2) + ( backgroundPixelSize[0] * 2 ) ; // card is 16 pixels wide. Offset of card = 2 pixels of card
    var pos_y = - (h / 2) + ( backgroundPixelSize[1] * 3.5 ); // card is 24 pixels height. Offset of card = 4.5 pixels of card
    
    var maxLength_x = w - ( 4 * backgroundPixelSize[0] ); // same as before. Border of 2 pixels on left and right

    // separate description in lines
    for(var i = 0; i < words.length; i++){
        var testLine = line + words[i] + ' ';
        var metrics = ctx.measureText(testLine);
        var testWidth = metrics.width;
        if (testWidth > maxLength_x){
            ctx.fillText(line, pos_x, pos_y);
            line = words[i] + ' ';
            pos_y += realFont;
        } else {
            line = testLine;
        }
    }
    ctx.fillText(line, pos_x, pos_y);

    ctx.restore();
}

function drawCardInnerImage ( ctx, rcard, radiants ){
    var rcardPos = rcard.getPos();
    var pixelSize = rcard.getPixelSize();


    // Background pixel coords 
    var innerCardOffset = [ 0, 5 ];
    var innerCardSize = [ 9 , 9 ];

    // adjust pixel coordinadtes to real coords and pos
    var finalPos = [ rcardPos[0] + innerCardOffset[0]*pixelSize[0], rcardPos[1] + innerCardOffset[1]*pixelSize[1] ];
    var finalSize = [ innerCardSize[0] * pixelSize[0], innerCardSize[1]* pixelSize[1] ];
    var str_img = world.getCardPath() + "/" + rcard.getCard().getImage();
    drawRotatedImg( ctx, str_img, finalPos[0], finalPos[1], finalSize[0], finalSize[1], rcardPos[0], rcardPos[1], radiants );
}

function drawCard(ctx, rcard) {
    ctx.save();

    var pos = rcard.getPos();
    var size = rcard.getSize();
    var backgroundPixelSize = rcard.getPixelSize();

    var radiants = MAX_CARD_TILT * pos[0] / (canvas.width * 0.5); // since center of screen is [0,0], card pos € [ - halfWidth, halfWidth ]


    var isStrokeNeeded = false;
    if (alphaAccept > alphActionTolerance_ct || alphaDiscard > alphActionTolerance_ct) {
        // on position to accept/discard action
        isStrokeNeeded = true;
    }

    // draw background of card
    drawRotatedImg(ctx, rcard.getBackgroundImg(), pos[0], pos[1], size[0], size[1],  pos[0], pos[1], radiants, isStrokeNeeded);

    // TO DO ---------------
    drawDescriptionCard(ctx, rcard, radiants);

    // card inner image
    drawCardInnerImage(ctx, rcard, radiants);
    // etc

    ctx.restore();
}


function drawLimits(ctx, rcard) {
    var hw = canvas.width / 2;
    var hh = canvas.height / 2;

	var cardtype = rcard.getCardType();
	var colorLeft;
	var colorRight;
	
	switch (cardtype){
		case e_specialTags.TYPE_COMODIN: 
			colorLeft = "rgb(158,135,8)";
			colorRight = "rgb(158,135,8)";
			break;
		case e_specialTags.TYPE_CURSE:
			colorLeft="rgb(158,8,8)";
			colorRight="rgb(158,8,8)"
			break;
        case e_specialTags.TYPE_INFORMATIVE:
            colorLeft="rgb(100,100,100)";
			colorRight="rgb(100,100,100)"
            break;
		default:
			colorLeft = "red";
			colorRight ="green";
			break;
	}

	
    var my_gradient = ctx.createLinearGradient(-hw, 0, hw, 0);
    my_gradient.addColorStop(0.15, colorLeft);
    my_gradient.addColorStop(0.5, "transparent");
    my_gradient.addColorStop(0.85, colorRight);
    ctx.fillStyle = my_gradient;


    ctx.globalAlpha = alphaAccept;
    ctx.fillRect(0, -hh, hw, canvas.height);

    ctx.globalAlpha = alphaDiscard;
    ctx.fillRect(-hw, -hh, hw, canvas.height);


    ctx.globalAlpha = 1;
}

//called on LOOP()
function drawScene() {
    var ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    var rect = canvas.getBoundingClientRect();
    var center_x = rect.width/2 - rect.left/2; // i don't understand why left/2 and height/2 is needed but it works
    var center_y = rect.height/2 - rect.top/2;
    ctx.translate(center_x, center_y);

    ctx.save();

    drawLimits(ctx, renderCard);
    drawCard(ctx, renderCard);

    ctx.restore();
}

// --------------------- LOOP --------------------------

var Tlast = 0;
var stopLoop = false;
function gameLoop() {


    //Resize canvas
    var rect = canvasParent.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    //to compute seconds since last loop
    var Tnow = performance.now();
    //compute difference and convert to seconds
    var elapsed_time = (Tnow - Tlast) / 1000;
    //store current time into last time
    Tlast = Tnow;

    //now we can execute our update method
    update(elapsed_time);

    drawScene();

    //request to call loop() again before next frame
    if (stopLoop == false) {
        requestAnimationFrame(gameLoop);
    }
}



function loadWorld() {
    var w = new World();
    w.fromJSON(JSON.parse(worldJSONFile));
    w.createDeck ( );
    return w;
}

// MAIN -----------------------------------


var world = new World();

function ResetGame(){
	world = loadWorld();
	renderCard.setWorld( world );

	StartStatistics();
	renderCard.takeCard( );

    renderCard.setPos( [0,0] );
    renderCard.setTarget( [0,0] );

    alphaAccept = 0;
    alphaDiscard = 0;

	stopLoop = false;
	gameLoop();
}

function StopGame(){
	stopLoop = true;
}