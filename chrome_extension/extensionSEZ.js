
function getCurrentTabUrl(callback) {
  // Query filter to be passed to chrome.tabs.query - see
  // https://developer.chrome.com/extensions/tabs#method-query
  var queryInfo = {
    active: true,
    currentWindow: true
  };

  chrome.tabs.query(queryInfo, (tabs) => {

    var tab = tabs[0];
    var url = tab.url;

    callback(url);
  });

}

function toArrayBuffer(buf) {
    var ab = new ArrayBuffer(buf.length);
    var view = new Uint8Array(ab);
    for (var i = 0; i < buf.length; ++i) {
        view[i] = buf[i];
    }
    return ab;
}

function playWAV(blob) {
  var url = window.URL.createObjectURL(blob);
  //console.log(blob);
  
  var audioNode = new Audio();        // create the audio object
  audioNode.src = url; // assign the audio file to its src
  audioNode.crossOrigin="anonymous";
  
  var audioProm = audioNode.play();

  if (audioProm !== undefined) {
  audioProm.then(function() {
    // Automatic playback started!
  }).catch(function(error) {
    console.log("error: " + error + "\n " + url);
    // Automatic playback failed.
    // Show a UI element to let the user manually start playback.
  });
}
//  chrome.tabs.executeScript({
 //   code: script
 // });
}

function retrieveWAV() {
  alert("here we go")

  var userToken = document.getElementById('blobTokenInput').value;

  var xhr = new XMLHttpRequest();
  xhr.responseType = 'blob';

  xhr.open("GET", 'https://s-cord0.com/recordings/' + userToken, true);
  xhr.onload = function (){
    if(this.status != 200){
      console.log("Error. Response status: " + this.status);
    }
    else{
    playWAV(this.response);
      }
  }
  xhr.send();

}

document.addEventListener("DOMContentLoaded", function(event) {

    var b = document.getElementById('button2');
    b.addEventListener('click', retrieveWAV, false);
});