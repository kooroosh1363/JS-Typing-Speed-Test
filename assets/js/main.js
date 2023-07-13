const timer = document.querySelector('.timer'); //make timer for class tag timer
const testArea = document.querySelector("#test-area"); //for start timer after type letter

var theTimer = [0,0,0,0];



var timerRunning = false;//for control speed control when user remove first letter


// for print 00 
function zeroLead(time){

    if( time <= 9){
        time = "0" + time;
    }
    return time;

}


// for timer 
function runTimer(){
    let currentTime = zeroLead(theTimer[0])+ ":" + zeroLead(theTimer[1]) + ":" + zeroLead(theTimer[2]);

    timer.innerHTML=currentTime;

    theTimer[3]++;
    
    theTimer[0] = Math.floor((theTimer[3]/100)/60); //minutes
    theTimer[1] = Math.floor(theTimer[3]/100)-(theTimer[0]*60); //second
    theTimer[2] = Math.floor(theTimer[3] - (theTimer[1]*100) - (theTimer[0]*6000));


}





function Start(){

    let textStartLength= testArea.value.length;
    //for control speed timer when user typing
    if (textStartLength == 0 && !timerRunning){

        timerRunning = true;
        setInterval(runTimer,10);
    }   
}


testArea.addEventListener("keypress", Start); //for type 