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
		var deviceid = device.uuid;
		//NOTE: the pot overview is already in the DOM. The splashscreen is just a layer that peels off.
		setTimeout(function() {
			//splashscreen
		    $('.loadingScreen').fadeOut('slow', function() {
				$('.loadingScreen').remove();
				$('.main').removeClass('hide');
				$('.main').fadeIn('slow');
			});				
			
			//get any added pots from db
			$.ajax({
				 url:"http://www.jaroeneefting.com/school/stenden/sites/waterupapi/getpotten.php?uuid="+deviceid,
				 dataType: 'jsonp',
				 success:function(response){
					//var data = JSON.parse(JSON.stringify(response));
					alert(JSON.stringify(response));
					$('#row').append('<div class="col-xs-6 circle" id="68:5D:43:40:D4:EF" data-thickness="3"><span class="imagePot"></span></div>'); //DO NEXT: CHANGE IT SO IT DYNAMICLY GETS THE MAC.
						
					$('.circle').circleProgress({
						startAngle: -Math.PI / 2,
						value: 0.00,
						lineCap: 'round',
						fill: {gradient: ['#4CD2FF', '#006CD9']}
					});
				 },
				 error:function(){
					 alert("Could not retrieve potten.2");
				 }      
			});	
						
			if($('#row').children().length == 0){
				$('#row').prepend('<div class="col-xs-6 add"><i class="fa fa-plus fa-5x" aria-hidden="true"></i></div>');
			}
		}, 2000);
		
		$(document).on('click', '.add', function (e) {
			console.log("clicked on adddd");
			cordova.plugins.barcodeScanner.scan(
				function (result) {
					if(result.cancelled != true){
						var qr = JSON.parse(result.text);
						//{"mac":"68:5D:43:40:D4:EF"}
						if(result.text == JSON.stringify(qr)){
							$.ajax({
								 url:"http://www.jaroeneefting.com/school/stenden/sites/waterupapi/insertpot.php?mac="+qr["mac"]+"&uuid="+deviceid,
								 dataType: 'jsonp',
								 success:function(response){
									var data = JSON.parse(JSON.stringify(response));
									 if(data == 'success'){
										$('#row').append('<div class="col-xs-6 circle" id="'+qr["mac"]+'" data-thickness="3"><span class="imagePot"></span></div>');
						
										$('.circle').circleProgress({
											startAngle: -Math.PI / 2,
											value: 0.00,
											lineCap: 'round',
											fill: {gradient: ['#4CD2FF', '#006CD9']}
										});
										
										$("#row > .add").remove();
										$('#row').append('<div class="col-xs-6 add"><i class="fa fa-plus fa-5x" aria-hidden="true"></i></div>');
										
										// alert("We got a barcode\n" +
										// "Result: " + result.text + "\n" +
										// "Format: " + result.format + "\n" +
										// "Cancelled: " + result.cancelled);
									}else if(data == 'failed'){
										alert("Could not add pot to database.1");
									}
								 },
								 error:function(){
									 alert("Could not add pot to database.2");
								 }      
							});	
						}else{
							alert("Given QR code is invalid.");
						}						
					}
				},
				function (error) {
					alert("Scanning failed: " + error);
				},
				{
					preferFrontCamera : false, // iOS and Android
					showFlipCameraButton : true, // iOS and Android
					showTorchButton : true, // iOS and Android
					torchOn: false, // Android, launch with the torch switched on (if available)
					prompt : "Place a barcode inside the scan area", // Android
					resultDisplayDuration: 500, // Android, display scanned text for X ms. 0 suppresses it entirely, default 1500
					formats : "QR_CODE", // default: all but PDF_417 and RSS_EXPANDED
					disableAnimations : true, // iOS
					disableSuccessBeep: false // iOS
				}
			);
		});
		
		$('.options').children().on('click', function (e) {
			e.preventDefault();		
			if($(this).html() == 'mqtt'){
				console.log("clicked on mqtt");
				$( ".pageView" ).empty();
				var client = mqtt.connect("wss://mqtt.inf1i.ga:8083", {rejectUnauthorized: false,
																	   username: 'inf1i-plantpot',
																	   password: 'password'})
				client.subscribe("#");
				 
				client.on("message", function (topic, payload) {
					$( ".pageView" ).append('Topic = '+topic+', Message = '+payload+'.<br>');
				})
			}
			if($(this).html() == 'id'){
				console.log("clicked on id: "+deviceid);
				$( ".pageView" ).empty();
				$( ".pageView" ).append("dit is id van phone: s"+deviceid);
			}
		});
    },
};

app.initialize();