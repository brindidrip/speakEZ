
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

function playWAV(blob) {
  // JS to append audio DOM element that has a playable blobURL as source...
  //var script = 0;

  chrome.tabs.executeScript({
    code: script
  });
}


function retrieveWAV(speakEZtoken, callback) {
    
  var xhr = new XMLHttpRequest();
  xhr.open("POST", 'www.s-cord0.com/recordings/' + speakEZtoken, true);
  xhr.onload = function (){
      playWAV(this)
      
  }
  xhr.send();

}
