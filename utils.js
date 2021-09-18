// MAIN EXECUTION AT THE BOTTOM OF FILE

// MANAGER IMAGES ---------------------------------------
var imgs = {};
//Image manager
function getImage(url) {
    //check if already loaded
    if (imgs[url])
        return imgs[url];

    //if no loaded, load and store
    var img = imgs[url] = new Image();
    img.src = url;
    return img;
}

// MANAGER AUDIOS ---------------------------------------
var audios = {}
// Audio manager
function getAudio(url){
    if (audios[url]){
        return audios[url];
    }

    var a = audios[url] = new Audio( url );
    return a;
}



// helper -----------------------------------------------
function clamp(val, minVal, maxVal) {
    return Math.min(Math.max(val, minVal), maxVal);
}

// only positive nums
function roundFloat ( floatval ) {
    var intval = Math.trunc( floatval );
    return (floatval - intval >= 0.5 ) ? intval + 1 : intval; 
}

// shuffle array
function shuffle ( array ) { 
	var newArray = JSON.parse(JSON.stringify(array));
	for (var i = newArray.length -1; i > 0; --i){ 
		var rnd = Math.floor( Math.random() * (i+1) ); // math.random [0,1) hence rnd = [ 0, i ] there has to be the possibility of not changing place
		var tmp = newArray[i];
		newArray[i] = newArray[rnd];
		newArray[rnd] = tmp;
	}
	return newArray;
}

//Divide a text in parts (using the char for divide text)
function divText(str, char) {
	var result = [];
	while (str.length > 0) {
	  var newSubstring = (str.substring(0, str.indexOf(char)+1));
	  if(newSubstring == ""){
		  result.push(str);
		  str = "";
	  }
	  else{
		  result.push(newSubstring);
		  str = str.substring(str.indexOf(char)+2);
	  }
	}
	return result;
}

//Clean all " { } ,
function cleanString(text){
	text = text.replace(/"/gi, "");
	text = text.replace(/{/gi, "");
	text = text.replace(/}/gi, "");
	text = text.replace(/,/gi, " ");
	return text;
}

function getObjectKeys(obj){
	var keys = [];
	for(var key in obj){
	   keys.push(key);
	}
	return keys;
 }