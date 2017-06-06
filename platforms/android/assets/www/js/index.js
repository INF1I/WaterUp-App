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
				$('.loadingScreen').remove();
				$('.main').removeClass('hide');
				$('.main').fadeIn('slow');
			});
		}, 2000);
		
		$('.options').children().on('click', function (e) {
			e.preventDefault();
			if($(this).html() == 'add'){
				console.log("clicked on add");
				$('#modal_title').empty();
				$('#modal_body_alerts').empty();
				$('#modal_body_contents').empty();
				$('.modal-footer').empty();
				$('#modal_title').append('<center>Add pot</center>'); 
				$('#modal_body_contents').append('lorum ipsum lorum ipsum lorum ipsum lorum ipsum'); 	
				$('#modal_template').modal();
			}
			
			if($(this).html() == 'mqtt'){
				console.log("clicked on mqtt");
				$( ".pageView" ).empty();
				var client = mqtt.connect("wss://mqtt.inf1i.ga:8083", {rejectUnauthorized: false,
																	   username: 'inf1i-plantpot',
																	   password: 'password'})
				client.subscribe("test")
				 
				client.on("message", function (topic, payload) {
					$( ".pageView" ).append('Topic = '+topic+', Message = '+payload+'.<br>');
				})
			}
		});
    },
};

app.initialize();