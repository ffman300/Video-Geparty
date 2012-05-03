//host.js
// create namespace objects
if (typeof board == 'undefined') { board = {}; }
if (typeof player == 'undefined') { player = {}; }
if (typeof host == 'undefined') { host = {}; }
if (typeof printer == 'undefined') { printer = {}; }
if (typeof game == 'undefined') { game = {}; }
if (typeof cnst == 'undefined') { cnst = {}; }
if (typeof effects == 'undefined') { effects = {}; }
if (typeof explode == 'undefined') { explode = {}; }
/*
The host object stores pertinent functions to be accessed by the host.  
These functions should only be accessed by a player verified by the 
game.isHost() function.
*/

/*attributes to be implemented
	-id
	-name
end attributes */

host.growMustache = function() {
	var imageResource = gapi.hangout.av.effects.createImageResource("https://bvdtechcom.ipage.com/jeopardy/Jeff/trebek_transparent.png");
	var overlay = imageResource.createFaceTrackingOverlay({
		trackingFeature: gapi.hangout.av.effects.FaceTrackingFeature.NOSE_TIP,
		scaleWithFace: true,
		rotateWithFace: true,
		offset: {x: .04, y: .34},
		scale: .42,
		rotation: .08
	});
	overlay.setVisible(true);
	console.log("mustache grown");
};

host.pullID = function(){
	return (gapi.hangout.getParticipantId());
};

host.pullName = function(){
	return (gapi.hangout.getParticipantById( gapi.hangout.getParticipantId() ).person.displayName);
};

host.adjustScore = function(playerId, amount){
	var scoreString = gapi.hangout.data.getValue("Player" + playerId + "Score");
	var score;
	if( scoreString == null )
		score = 0;
	else
		score = parseInt(scoreString);
	score += amount;
	gapi.hangout.data.setValue("Player" + playerId + "Score", ""+score);
};

host.questionCorrect = function(){
	console.log( "running qcorr mode is " + gapi.hangout.data.getValue("Mode") );
	if( game.getState == cnst.DAILY ){
		gapi.hangout.data.setValue("soundEffect","Applause");
		var player = gapi.hangout.data.getValue("boardController");
		var val = parseInt(gapi.hangout.getValue("dailyBet"));
		host.adjustScore(player, val);
	}
	else if( gapi.hangout.data.getValue("Mode") == cnst.SINGLE )
	{
		var q = parseInt(gapi.hangout.data.getValue("currentQ"));		//find out how much question is worth
		console.log( "current question is:" + q );
		var amount = 0;
		var singleJ = 200;
		if (q < 1) {
			amount = singleJ;
			console.log(amount);
		}
		else {
			amount = (q+1)* (singleJ);
			console.log(amount);
		}
   
		//find out who is selected
		var buzzed = gapi.hangout.data.getValue("BuzzedIn");
		if ( buzzed != null && parseInt(buzzed) >= 0 && parseInt(buzzed) <= 3 ) {
			//play Applause sound effect when returning to game loop
			gapi.hangout.data.setValue("boardController",buzzed);					
			gapi.hangout.data.setValue("soundEffect", "Applause");
			host.adjustScore( buzzed, amount );
		}
		else {
			console.log("Not one of the players");
		}
	}
	else if (gapi.hangout.data.getValue("Mode") == cnst.DOUBLE )
	{
		var q = parseInt(gapi.hangout.data.getValue("currentQ"));  //find out how much question is worth
		var amount = 0;
		var doubleJ = 400;
		if (q < 1) {
			amount= doubleJ;
			console.log(amount);
		}
		else {
			amount = (q+1)* doubleJ;
			console.log(amount);
		}
	
		//find out who is selected
		var buzzed = gapi.hangout.data.getValue("BuzzedIn");
		if ( buzzed != null && parseInt(buzzed) >= 0 && parseInt(buzzed) <= 3 ) {
			gapi.hangout.data.setValue("boardController",buzzed);		
			host.adjustScore( buzzed, amount );
		}
		else {
			console.log("Not one of the players");
		}
	}
	else //final geparty question
	{
		//for next release
	} 

};

host.questionIncorrect = function(){
	console.log("Firing question incorrect...");
	console.log(gapi.hangout.data.getValue("Mode"));
	
	if( game.getState == cnst.DAILY ){
		gapi.hangout.data.setValue("soundEffect","Applause");
		var player = gapi.hangout.data.getValue("boardController");
		var val = 0 - parseInt(gapi.hangout.getValue("dailyBet"));
		host.adjustScore(player, val);
	}	
	else if(gapi.hangout.data.getValue("Mode") == cnst.SINGLE )
	{
		var q = parseInt(gapi.hangout.data.getValue("currentQ"));		//find out how much question is worth
		console.log( "current question is:" + q);
		var amount = 0;
		if (q < 1) {
			amount = (-200);
			console.log(amount);
		}
		else {
			amount = (q+1) * (-200);
			console.log(amount);
		}
		
		//find out who is selected
		var buzzed = gapi.hangout.data.getValue("BuzzedIn");
		if ( buzzed != null && parseInt(buzzed) >= 0 && parseInt(buzzed) <= 3 ) {
			host.adjustScore( buzzed, amount );
		}
		else {
			console.log("Not one of the players");
		}
	}
	else if(gapi.hangout.data.getValue("Mode") == cnst.DOUBLE )
	{
		var q = parseInt(gapi.hangout.data.getValue("currentQ"));  //find out how much question is worth
		var amount = 0;
		if (q < 1) {
			amount = (-400);
			console.log(amount);
		}
		else{
			amount = (q+1)* (-400);
			console.log(amount);
		}
	
		//find out who is selected
		var buzzed = gapi.hangout.data.getValue("BuzzedIn");
		if ( buzzed != null && parseInt(buzzed) >= 0 && parseInt(buzzed) <= 3 ) {
			host.adjustScore( buzzed, amount );
		}
		else {
			console.log("Not one of the players");
		}
	}
	else //final geparty question
	{
		//for next release
	} 
};

host.questionUnanswered = function(){

};

host.releaseBuzzers = function(){
	if(game.isHost() && gapi.hangout.data.getValue("AlreadyReleased") == "false" && game.getState() == cnst.ANSWER){
		console.log("Release buzzer");
		gapi.hangout.data.setValue("Buzzer", "true");
		console.log("Starting timer - Lockout in 5 sec");
		gapi.hangout.data.setValue("AlreadyReleased", "true");
		var t = setTimeout("buzzerLockout()",5000); // Lockout after 5 secs
	}
	else{
		console.log("Bad Release - Ignoring");
	}
};

function buzzerLockout(){
	if(gapi.hangout.data.getValue("Buzzer") == "true"){ // If no one has buzzed in
		console.log("Locking out buzzer");
		gapi.hangout.data.setValue("Buzzer", "false");
		gapi.hangout.data.setValue("BuzzedIn","");
		host.showQuestion();
	}
}

host.removePlayer = function(playerId){
	//Use playerId to remove them from the player array. Bump them from room?
};
 
host.selectAnswer = function( cat, q ){
	gapi.hangout.data.setValue("currentCat",""+cat);
	gapi.hangout.data.setValue("currentQ", ""+q);	
	board.removeFromGrid(cat,q);
};

host.showQuestion = function(){
	gapi.hangout.data.setValue("displayQuestion", "1");
	printer.displayQuestion();
	gapi.hangout.data.setValue("BuzzedIn","");
};

host.checkBet = function(){
	var bet = parseInt(gapi.hangout.data.getValue("dailyBet"));
	if(player.isValidBet(bet)){
		gapi.hangout.data.setValue("betSubmitted","1");
		game.setState(cnst.DAILY);
	}
};
 
/* functions to be implemented
	-constructor
	-pullId() -- gets google id from api
	-pullName() -- gets google name from api
	-adjustScore( playerId, amount) --adjusts player score by an int value
	-questionCorrect() --credits a player for a correct answer
	-questionIncorrect() --debits a player for incorrect answer
	-questionUnanswered() --fires if no one answers correctly in allotted time ( NOTE: might belong in game object, since it is fired automatically by game )
	-releaseBuzzers()
	-removePlayer(playerId)
	-selectAnswer( answerId )
	-showQuestion( answerId )
end functions */
