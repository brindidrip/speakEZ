//globalScripts.js

// Pop-over list button functionality
$(document).ready(function(){
  $('.navigation-link').on('click',function(evt){
    evt.preventDefault();
    
    var aID = $(this).attr('href');
    var theID = evt.target.attributes.class.ownerElement.hash;

    if(evt.target.offsetParent.id == "navigation-item-login"){
        window.location.href = "/login";
    }

    if( $('#popover-grid').css('display') == 'block' && theID === '#popover-support' ) {
      $('#popover-grid').toggle( "popover" );
            }

    if( $('#popover-support').css('display') == 'block' && theID === '#popover-grid') {
      $('#popover-support').toggle( "popover" );
            }

    $(theID).toggle( "popover popover-open" );

    evt.stopImmediatePropagation();

    return;
    });
});

// Prevent two popovers from appearing at same time
$(document).click(function(evt){

      if( $('#popover-grid').css('display') == 'block') {
        $('#popover-grid').toggle( "popover" );
            }

      else if( $('#popover-support').css('display') == 'block') {
        $('#popover-support').toggle( "popover" );
            }
            
      return;
});

function toArrayBuffer(buf) {
  var ab = new ArrayBuffer(buf.length);
  var view = new Uint8Array(ab);
  for (var i = 0; i < buf.length; ++i) {
    view[i] = buf[i];
  }
  return ab;
}

// Save a recording and generate a unique blobToken  
$("#saveButton").click(function(e) {
  e.preventDefault();
  navigator.getUserMedia({audio: true}, function(){

  // Append recording title & description to formdata
  var recordingTitle = document.getElementById("recordingTitle").value;
  var recordingDesc = document.getElementById("recordingDesc").value;

  console.log(recordingDesc);

  currentBlob.append('title', recordingTitle);
  currentBlob.append('description', recordingDesc);

  //data.append('description', recordingDesc);
  
  // ajax POST method
  // POSTS blob to route /speakEZ/DB which stores data in mongoDB
  // Returns a uniquely identifiable token to represent the blob
  // or returns an error
          
  // Blob was too large to pass through ajax call, so it was appended to a FormData().
  // Since we are POSTing a file, contentType must be false.
  // processData must be false, otherwise jQuery tries to convert FormData to a string.
  
  $.ajax({
    type: "POST",
    url: "/speakEZ/DB",
    data: currentBlob,
    contentType: false,
    processData: false,
    success: function(result) {
      try {
        alert("um, success");

        // Store buffer from response in a buffer array and then into a Blob
        var bf = toArrayBuffer(result.blob.data);
        var storedBlob = new Blob([bf], {type: 'audio/wav'});

        var unqBlobToken = result.blobToken;
        
        /*Debugging Purposes:
        Use a file reader to read blob. 
                  
        var myReader = new FileReader();
        myReader.onload = function(event){
          console.log(JSON.stringify(myReader.result));
        };
        myReader.readAsText(blob);
        */
      }

      // TODO
      // Set appropriate catch/alert.
      catch(e) {
        alert(e);
      }
                      
      // If successful POST, then use recorder library to append a text      
      // node containing a unique blobToken
      $("#tokenBlobTxt").val("speakEZ://" + unqBlobToken);


      // Create a blobURL
      var url = URL.createObjectURL(storedBlob);
                  
      // Replaces existing token
      var parent = document.getElementById("recordingslist");
      var child = document.getElementById("recording-item-sample")
      parent.disabled = true;

      e.disabled = true;

      // Recording details box
      //var recordDetailTitle = document.getElementById("recordingDetailinput").value;
      var detailBox = document.getElementById("recordDetailBox").style.display = 'none';

      //console.log(recordDetailTitle);

      // Sharebox
      $("#idShareMediaBox").css("display", "");
      $("#idShareMediaLink").val("https://www.s-cord0.com/recordings/a/" + unqBlobToken);

      var saveButton = document.getElementById("saveButton");
      saveButton.disabled = true;

    }, error: function(result) {
      alert('error: ' + result);
    }
  });
}, function(e) {
  alert("No audio input detected.");
  console.log('No live audio input: ' + e);
});
});
  
function startUserMedia(stream) {
  var input = audio_context.createMediaStreamSource(stream);
  console.log('Media stream created.');
  console.log('Stream:' + stream);

  recorder = new Recorder(input);
  console.log('Recorder initialised.');
}

  function startRecording(button) {
      navigator.getUserMedia({audio: true}, function(){
        // Reset text node & share box
        $("#idShareMediaBox").css("display", "none");

        var txtNode = document.getElementById("tokenBlobTxt").value = "";
        
        recorder && recorder.record();
        button.disabled = true;
        button.nextElementSibling.disabled = false;

        console.log('Recording...');


      }, function(e) {
        alert("No audio input detected.");
        console.log('No live audio input: ' + e);
    });

    
  }

function stopRecording(button) {
  recorder && recorder.stop();
  button.disabled = true;
  button.previousElementSibling.disabled = false;
  button.nextElementSibling.disabled = false;
  console.log('Stopped recording.');
    
  // create WAV download link using audio data blob
  generateSample();
  recorder.clear();
}
  
function generateSample() {
  recorder && recorder.exportWAV(function(blob) {
  var url = URL.createObjectURL(blob);
  
  // Store audio blob into FormData
  var data = new FormData();
  data.append('upl', blob);

  currentBlob = data;
  
  // console.log(new Blob([currentBlob.get('upl')], {type: 'audio/wav'}));

  // Add detail to recording
  
  var detailBox = document.getElementById("recordDetailBox").style.display = '';

  // li to hold audio player
  var recordingslist = document.getElementById("recordingslist");

  var li = document.createElement('li');
  li.setAttribute("class", "recording-item-sample");
  li.setAttribute("id", "recording-item-sample");
        
  var au = document.getElementById('music_main');
  au.src = url;

  // audio player appending
  audioDiv_main.appendChild(pButton_main);
  timeline_main.appendChild(playhead_main);
  audioDiv_main.appendChild(timeline_main);

  li.appendChild(au);
  li.appendChild(audioDiv_main);
      
  //recordingslist.appendChild(detailBox)
  recordingslist.appendChild(li);
  });
}