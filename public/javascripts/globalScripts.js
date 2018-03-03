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
