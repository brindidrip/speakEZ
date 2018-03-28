function fetchBlob(){
var xhr = new XMLHttpRequest();
xhr.onreadystatechange = function(){
  alert("Presse ")
  if (this.readyState == 4 ){
    alert("Ok");
  }
}

xhr.open("GET", "https://s-cord0.com/recordings/09e7c4de9aa7ccf48b2d5ea0657ceb0b", true);
xhr.send();
}

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
  // JS to append audio DOM element that has a playable blobURL as source...
  //var script = 0;

  var bf = toArrayBuffer(blob);
  var storedBlob = new Blob([bf], {type: 'audio/wav'});

  // Create a blobURL
  var url = URL.createObjectURL(storedBlob);

  console.log(url);
//  chrome.tabs.executeScript({
 //   code: script
 // });
}




function retrieveWAV(speakEZtoken, callback) {
   alert("here we go") 
  var xhr = new XMLHttpRequest();
  xhr.open("GET", 'https://s-cord0.com/recordings/' + "09e7c4de9aa7ccf48b2d5ea0657ceb0b", true);
  xhr.onload = function (){
      playWAV(this.response);
      
  }
  xhr.send();

}

document.addEventListener("DOMContentLoaded", function(event) {
    var b = document.getElementById('button2');
    b.addEventListener('click', retrieveWAV, false);
});