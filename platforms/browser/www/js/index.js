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
				// $('#modal_title').empty();
				// $('#modal_body_alerts').empty();
				// $('#modal_body_contents').empty();
				// $('.modal-footer').empty();
				// $('#modal_title').append('<center>Add pot</center>'); 
				// $('#modal_body_contents').append('lorum ipsum lorum ipsum lorum ipsum lorum ipsum'); 	
				// $('#modal_template').modal();
				
				cordova.plugins.barcodeScanner.scan(
				  function (result) {
					  alert("We got a barcode\n" +
							"Result: " + result.text + "\n" +
							"Format: " + result.format + "\n" +
							"Cancelled: " + result.cancelled);
				  },
				  function (error) {
					  alert("Scanning failed: " + error);
				  },
				  {
					  preferFrontCamera : true, // iOS and Android
					  showFlipCameraButton : true, // iOS and Android
					  showTorchButton : true, // iOS and Android
					  torchOn: true, // Android, launch with the torch switched on (if available)
					  prompt : "Place a barcode inside the scan area", // Android
					  resultDisplayDuration: 500, // Android, display scanned text for X ms. 0 suppresses it entirely, default 1500
					  formats : "QR_CODE,PDF_417", // default: all but PDF_417 and RSS_EXPANDED
					  orientation : "landscape", // Android only (portrait|landscape), default unset so it rotates with the device
					  disableAnimations : true, // iOS
					  disableSuccessBeep: false // iOS
				  }
			   );
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