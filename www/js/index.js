var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },

    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },

    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
    },
	
    // Update DOM on a Received Event
    receivedEvent: function(id) {
       console.log('Received Event: ' + id);
		
		setTimeout(function() {   
		   $('.loadingScreen').fadeOut('slow', function() {
				$('.potOverview > .text').removeClass('hide');
				$('.potOverview > .text').css('width',$(window).width()); //dynamicly detect device width to always center text
				$('.potOverview').fadeIn('slow');
			});
		}, 2000);
 
		$('.potOverview > .text').append('now you can do shit');
    }
};