var music = [];
var duration = [];
var timelineWidth = [];
var playhead = [];
var initMusicArr = [];
var timeline = [];
var audioDiv = [];
var pButton = null;
var currIndex = null;

var initMusic = function(index){
    currIndex = index;
    initMusicArr[index] = true;

    music[index] = document.getElementById("music" + index);

    document.getElementById("music"+ index).onloadedmetadata = function(evt)
        {

        if (music[index] != null){
            duration[index] = music[index].duration;

            }

        // timeupdate event listener
        music[index].addEventListener("timeupdate", timeUpdate, false);
        music[index].param = index;

        //console.log("audio dur = " + this.duration);


    }
    // create a custom audio player 
    audioDiv[index] = document.createElement('div');
    audioDiv[index].setAttribute("id", "audioplayer" + index);
        
    pButton = document.createElement('button');
    pButton.setAttribute("class", "play");
    pButton.setAttribute("id", "pButton");
    //pButton.setAttribute('onclick','play();'); // for FF
    //pButton.onclick = function() {play();}; // for IE

    timeline[index] = document.createElement('div');
    timeline[index].setAttribute("id", "timeline" + index);

    playhead[index] = document.getElementById('playhead' + index);

    // timeline width adjusted for playhead
    timelineWidth[index] = 200 - playhead[index].offsetWidth;


    // play button event listenter
    pButton.addEventListener("click", playEL);
    pButton.param = index;

    
    // makes playhead draggable
    playhead[index].addEventListener('mousedown', mouseDown, false);
    playhead[index].param = index;
    window.addEventListener('mouseup', mouseUp, false);
        

    timeline[index].addEventListener("click", function(event) {
        moveplayhead(event,index);
        music[index].currentTime = duration[index] * clickPercent(event);
            }, false);

};


// returns click as decimal (.77) of the total timelineWidth
function clickPercent(event) {
    return (event.clientX - getPosition(timeline[currIndex])) / timelineWidth[currIndex];
}


// Boolean value so that audio position is updated only when the playhead is released
var onplayhead = false;

// mouseDown EventListener
function mouseDown(evt) {
    onplayhead = true;
    var index = evt.target.param;
    window.addEventListener('mousemove', moveplayhead, true);

    if(music[index] != null){
    music[index].removeEventListener('timeupdate', timeUpdate, false);
            }
}

// mouseUp EventListener
// getting input from all mouse clicks
function mouseUp(event) {
    var index = event.target.param;

    if (onplayhead == true) {
        moveplayhead(event,index);
        window.removeEventListener('mousemove', moveplayhead, true);
        // change current time

        if(music[currIndex] != null){
        music[currIndex].currentTime = duration[currIndex] * clickPercent(event);
        music[currIndex].addEventListener('timeupdate', timeUpdate, false);
            }
    }
    onplayhead = false;
}

// mousemove EventListener
// Moves playhead as user drags
function moveplayhead(event,index) {

    //console.log(getPosition(timeline[currIndex]));

    var newMargLeft = event.clientX - getPosition(timeline[currIndex]);

    if (newMargLeft >= 0 && newMargLeft <= timelineWidth[index]) {
        playhead[index].style.marginLeft = newMargLeft + "px";
    }
    if (newMargLeft < 0) {
        playhead[index].style.marginLeft = "0px";
    }
    if (newMargLeft > timelineWidth[index]) {
        playhead[index].style.marginLeft = timelineWidth + "px";
    }
}

// timeUpdate
// Synchronizes playhead position with current point in audio
function timeUpdate(evt) {
    //console.log("timeupdate evt triggered");
    var index = evt.target.param;

    //console.log(timelineWidth[index]);
    
    var playPercent = timelineWidth[index] * (music[index].currentTime / duration[index]);
    playhead[index].style.marginLeft = playPercent + "px";
    if (music[index].currentTime == duration[index]) {
        pButton.className = "";
        pButton.className = "play";
    }
}

//Play and Pause
function play(index) {
    //console.log(initMusicArr[index]);

    if (initMusicArr[index] != true){ 
        //console.log("initing " + index);
        initMusic(index);
    }
    //console.log("Is music paused?: " + pButton.className);
  

    // start music
    if (pButton.className == "play" && music[index] != null) {        
        music[index].play();
        // remove play, add pause
        pButton.className = "";
        pButton.className = "pause";
    } else { // pause music
        music[index].pause();
        // remove pause, add play
        pButton.className = "";
        pButton.className = "play";
    }
}

function playEL(evt){
    //console.log("playEL event");
    var index = evt.target.param;

    // start music
    if (pButton.className == "play" && music[index] != null) {        
        music[index].play();
        // remove play, add pause
        pButton.className = "";
        pButton.className = "pause";
    } else { // pause music
        music[index].pause();
        // remove pause, add play
        pButton.className = "";
        pButton.className = "play";
    }
}


// getPosition
// Returns elements left position relative to top-left of viewport
function getPosition(el) {
    return el.getBoundingClientRect().left;
}