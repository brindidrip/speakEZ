var music = document.getElementById('music'); // id for audio element
var duration = music.duration; // Duration of audio clip, calculated here for embedding purposes

// Added CB feature to support non preloaded recordings
var setDurationCB = function(data) {
duration = document.getElementById('music').duration;
  
  // timeline width adjusted for playhead
timelineWidth = timeline.offsetWidth - playhead.offsetWidth;

timeline.addEventListener("click", function(event) {
    moveplayhead(event);
    music.currentTime = duration * clickPercent(event);
}, false);

// timeupdate event listener
music.addEventListener("timeupdate", timeUpdate, false);
};

var durationCB = function(cb) {
  cb('passing this as a parameter to setDurationCB');
};


// create a custom audio player 
        var audioDiv = document.createElement('div');
        audioDiv.setAttribute("id", "audioplayer");
        
        var pButton = document.createElement('button');
        pButton.setAttribute("class", "play");
        pButton.setAttribute("id", "pButton");
        //pButton.setAttribute('onclick','play();'); // for FF
      //pButton.onclick = function() {play();}; // for IE
        
        var timeline = document.createElement('div');
        timeline.setAttribute("id", "timeline");
        
        var playhead = document.createElement('div');
        playhead.setAttribute("id", "playhead");
        

// timeline width adjusted for playhead
var timelineWidth = timeline.offsetWidth - playhead.offsetWidth;

// play button event listenter
pButton.addEventListener("click", play);

// returns click as decimal (.77) of the total timelineWidth
function clickPercent(event) {
    console.log(timelineWidth);
    return (event.clientX - getPosition(timeline)) / timelineWidth;
}

// makes playhead draggable
playhead.addEventListener('mousedown', mouseDown, false);
window.addEventListener('mouseup', mouseUp, false);

// Boolean value so that audio position is updated only when the playhead is released
var onplayhead = false;

// mouseDown EventListener
function mouseDown() {
    onplayhead = true;
    window.addEventListener('mousemove', moveplayhead, true);
    music.removeEventListener('timeupdate', timeUpdate, false);
}

// mouseUp EventListener
// getting input from all mouse clicks
function mouseUp(event) {
    if (onplayhead == true) {
        moveplayhead(event);
        window.removeEventListener('mousemove', moveplayhead, true);
        // change current time
        music.currentTime = duration * clickPercent(event);
        music.addEventListener('timeupdate', timeUpdate, false);
    }
    onplayhead = false;
}
// mousemove EventListener
// Moves playhead as user drags
function moveplayhead(event) {
    var newMargLeft = event.clientX - getPosition(timeline);

    if (newMargLeft >= 0 && newMargLeft <= timelineWidth) {
        playhead.style.marginLeft = newMargLeft + "px";
    }
    if (newMargLeft < 0) {
        playhead.style.marginLeft = "0px";
    }
    if (newMargLeft > timelineWidth) {
        playhead.style.marginLeft = timelineWidth + "px";
    }
}

// timeUpdate
// Synchronizes playhead position with current point in audio
function timeUpdate() {
    var playPercent = timelineWidth * (music.currentTime / duration);
    playhead.style.marginLeft = playPercent + "px";
    if (music.currentTime == duration) {
        pButton.className = "";
        pButton.className = "play";
    }
}

//Play and Pause
function play() {
    
    //CB when we know recording is available
   durationCB(setDurationCB);

    // start music
    if (music.paused) {
        music.play();
        // remove play, add pause
        pButton.className = "";
        pButton.className = "pause";
    } else { // pause music
        music.pause();
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