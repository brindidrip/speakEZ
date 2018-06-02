
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


function playWAV(blobBuff) {
  // JS to append audio DOM element that has a playable blobURL as source...
  //var script = 0;
  //console.log(blobBuff.data);
  var bf = toArrayBuffer(blobBuff);
  //console.log(blobBuff);
  var storedBlob = new Blob([bf], {type: 'audio/wav'});

  console.log(storedBlob)
  // Create a blobURL
  var url = URL.createObjectURL(storedBlob);

  var myAudio = new Audio();        // create the audio object
  myAudio.src = url; // assign the audio file to its src
  myAudio.crossOrigin="anonymous";
  var ape = myAudio.play();

  if (ape !== undefined) {
  ape.then(function() {
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




function retrieveWAV(speakEZtoken, callback) {
  alert("here we go") 
  var xhr = new XMLHttpRequest();
  xhr.open("GET", 'http://0.0.0.0:8080/recordings/' + "e3b6685f21a9fde0db449fd874aa7f35", true);
  xhr.onload = function (){
    //alert(this.response)
    playWAV(this.response);
  }
  xhr.send();

}

document.addEventListener("DOMContentLoaded", function(event) {
    var b = document.getElementById('button2');
    b.addEventListener('click', retrieveWAV, false);
});