const timer = document.querySelector('.timer');


var theTimer = [0,0,0,0];


function runTimer(){
    let currentTime = theTimer[0] + ":" + theTimer[1] + ":" + theTimer[2];

    timer.innerHTML=currentTime;

    theTimer[3]++;
    
    theTimer[0] = Math.floor((theTimer[3]/100)/60); //minutes
    theTimer[1] = Math.floor(theTimer[3]/100)-(theTimer[0]*60); //second
    theTimer[2] = Math.floor(theTimer[3] - (theTimer[1]*100) - (theTimer[0]*6000));

    
}



setInterval(runTimer,10);