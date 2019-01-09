var music_main = document.getElementById('music_main'); // id for audio element
var duration_main = 0;

if (music_main != null){
    var duration_main = music_main.duration;
    // Duration of audio clip, calculated here for embedding purposes
}

// Added CB feature to support non preloaded recordings
var setDurationCB_main = function(data) {
duration_main = document.getElementById('music_main').duration;
  
  // timeline width adjusted for playhead
timelineWidth_main = timeline_main.offsetWidth - playhead_main.offsetWidth;

timeline_main.addEventListener("click", function(event) {
    moveplayhead_main(event);
    music_main.currentTime = duration_main * clickPercent_main(event);
}, false);

console.log(music_main);
// timeupdate event listener
music_main.addEventListener("timeupdate", timeUpdate_main, false);
};

var durationCB_main = function(cb) {
  cb('passing this as a parameter to setDurationCB');
};


// create a custom audio player 
var audioDiv_main = document.createElement('div');
audioDiv_main.setAttribute("id", "audioplayer_main");
        
var pButton_main = document.createElement('button');
pButton_main.setAttribute("class", "play");
pButton_main.setAttribute("id", "pButton_main");
//pButton.setAttribute('onclick','play();'); // for FF
//pButton.onclick = function() {play();}; // for IE
        
var timeline_main = document.createElement('div');
timeline_main.setAttribute("id", "timeline_main");
        
var playhead_main = document.createElement('div');
playhead_main.setAttribute("id", "playhead_main");

// timeline width adjusted for playhead
var timelineWidth_main = timeline_main.offsetWidth - playhead_main.offsetWidth;

// play button event listenter
pButton_main.addEventListener("click", play_main);

// returns click as decimal (.77) of the total timelineWidth
function clickPercent_main(event) {
    console.log(timelineWidth_main);
    return (event.clientX - getPosition_main(timeline_main)) / timelineWidth_main;
}

// makes playhead draggable
playhead_main.addEventListener('mousedown', mouseDown_main, false);
window.addEventListener('mouseup', mouseUp_main, false);

// Boolean value so that audio position is updated only when the playhead is released
var onplayhead_main = false;

// mouseDown EventListener
function mouseDown_main() {
    onplayhead_main = true;
    window.addEventListener('mousemove', moveplayhead_main, true);
    music_main.removeEventListener('timeupdate', timeUpdate_main, false);
}

// mouseUp EventListener
// getting input from all mouse clicks
function mouseUp_main(event) {
    if (onplayhead_main == true) {
        moveplayhead_main(event);
        window.removeEventListener('mousemove', moveplayhead_main, true);
        // change current time
        music_main.currentTime = duration_main * clickPercent_main(event);
        music_main.addEventListener('timeupdate', timeUpdate_main, false);
    }
    onplayhead_main = false;
}
// mousemove EventListener
// Moves playhead as user drags
function moveplayhead_main(event) {
    var newMargLeft = event.clientX - getPosition_main(timeline_main);

    if (newMargLeft >= 0 && newMargLeft <= timelineWidth_main) {
        playhead_main.style.marginLeft = newMargLeft + "px";
    }
    if (newMargLeft < 0) {
        playhead_main.style.marginLeft = "0px";
    }
    if (newMargLeft > timelineWidth_main) {
        playhead_main.style.marginLeft = timelineWidth_main + "px";
    }
}

// timeUpdate
// Synchronizes playhead position with current point in audio
function timeUpdate_main() {
    var playPercent = timelineWidth_main * (music_main.currentTime / duration_main);
    playhead_main.style.marginLeft = playPercent + "px";
    if (music_main.currentTime == duration_main) {
        pButton_main.className = "";
        pButton_main.className = "play";
    }
}

//Play and Pause
function play_main() {
    
    music_main = document.getElementById('music_main');

    //CB when we know recording is available
    durationCB_main(setDurationCB_main);

    // start music
    if (music_main.paused) {
        music_main.play();
        // remove play, add pause
        pButton_main.className = "";
        pButton_main.className = "pause";
    } else { // pause music
        music_main.pause();
        // remove pause, add play
        pButton_main.className = "";
        pButton_main.className = "play";
    }
}


// getPosition
// Returns elements left position relative to top-left of viewport
function getPosition_main(el) {
    return el.getBoundingClientRect().left;
}