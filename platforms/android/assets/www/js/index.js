var app = {
    initialize: function() {
        this.bindEvents();
    },
	
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
	
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
    },
	
    // Update DOM on a Received Event
    receivedEvent: function(id) {
		//NOTE: the pot overview is already in the DOM. The splashscreen is just a layer that peels off.
		setTimeout(function() {   
		    $('.loadingScreen').fadeOut('slow', function() {
				$('.loadingScreen').addClass('hide');
				$('.potOverview').removeClass('hide');
				$('.potOverview').fadeIn('slow');
			});
		}, 2000);
		
		var client = mqtt.connect("wss://mqtt.inf1i.ga:8083", {rejectUnauthorized: false,
															   username: 'inf1i-plantpot',
															   password: 'password'})
		client.subscribe("test")
		 
		client.on("message", function (topic, payload) {
			$( ".header" ).append('Topic = '+topic+', Message = '+payload+'.<br>');
		})
		
		
    },
};

app.initialize();
