const timer = document.querySelector('.timer'); //make timer for class tag timer
const testArea = document.querySelector("#test-area"); //for start timer after type letter

const textOrigin = document.querySelector("#origin-text p").innerHTML;//for check compare text


const testWrapper = document.querySelector("div.test-wrapper textarea");//for show color to user



var theTimer = [0,0,0,0];



var timerRunning = false;//for control speed control when user remove first letter


var interval;



// for print 00 
function zeroLead(time){

    if( time <= 9){
        time = "0" + time;
    }
    return time;

}


// for run timer 
function runTimer(){
    let currentTime = zeroLead(theTimer[0])+ ":" + zeroLead(theTimer[1]) + ":" + zeroLead(theTimer[2]);

    timer.innerHTML=currentTime;

    theTimer[3]++;
    
    theTimer[0] = Math.floor((theTimer[3]/100)/60); //minutes
    theTimer[1] = Math.floor(theTimer[3]/100)-(theTimer[0]*60); //second
    theTimer[2] = Math.floor(theTimer[3] - (theTimer[1]*100) - (theTimer[0]*6000));


}



// for checking text
function spellCheck(){
    let textEntered = testArea.value;//for users's text
    let textMatch = textOrigin.substring(0,textEntered.length);//compare length text

    if (textEntered == textOrigin){

        // testWrapper.style.borderColor="green";
        testWrapper.style.borderColor = "green";
        clearInterval(interval);
    }else{
        if(textEntered == textMatch){

            testWrapper.style.borderColor = "gold";

        }else{
            testWrapper.style.borderColor = "red";
        }
    }
}


// for speed control timer
function Start(){

    let textStartLength= testArea.value.length;
    //for control speed timer when user typing
    if (textStartLength == 0 && !timerRunning){

        timerRunning = true;
      interval = setInterval(runTimer,10);
    }   
}


testArea.addEventListener("keypress", Start); //for type 

testArea.addEventListener("keyup", spellCheck);//for check text