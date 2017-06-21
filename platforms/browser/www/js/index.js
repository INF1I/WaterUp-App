//TODO: SEE IF I CAN GET THE ID TO WORK INSTEAD OF CIRCLE. IT EDITS ALL POTS ATM.
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
		var potid;
		var mqtt_received;
		var waterlevel;
		var enabletracking;
		//remove ui loader element that bugs the app.
		$('.ui-loader').remove();
		//store users device id.
		var deviceid = device.uuid;
		//connect to mqtt.
		var client = mqtt.connect("wss://mqtt.inf1i.ga:8083", {rejectUnauthorized: false,
																	   username: 'inf1i-plantpot',
																	   password: 'password'})
		//subscribe to every topic.(# = wildcard)
		client.subscribe("#");

		//sets waterlevel on pot with plant everytime it receives mqtt messages.
		client.on("message", function (topic, payload) {
			if(enabletracking == 1){
				if(topic != "inf1i-plantpot/subscribe/config/plant-care"){
					mqtt_received = JSON.parse(payload);
					console.log(mqtt_received);
					waterlevel = mqtt_received["waterLevel"];
					console.log(waterlevel);
					$('.circle').circleProgress({ value: waterlevel / 100 });
					$('.circle').circleProgress('redraw');
				}
			}
		})
		
		//NOTE: the pot overview is already in the DOM. The splashscreen is just a layer that peels off.
		setTimeout(function() {
			//splashscreen.
		    $('.loadingScreen').fadeOut('slow', function() {
				$('.loadingScreen').remove();
				$('.main').removeClass('hide');
				$('.main').fadeIn('slow');
			});				
			
			$.getpotten();
						
			//if there are no pots added by a device, show a plus sign.
			if($('#row').children().length == 0){
				$('#row').prepend('<div class="col-xs-6 add"><i class="fa fa-plus fa-5x" aria-hidden="true"></i></div>');
			}
		}, 2000);

		//when person clicked on plus sign, launch qr scanner.
		$(document).on('click', '.add', function (e) {
			console.log("clicked on adddd");
			cordova.plugins.barcodeScanner.scan(
				function (result) {
					if(result.cancelled != true){
						var qr = JSON.parse(result.text);
						//{"mac":"68:5D:43:40:D4:EF"}
						//if qr code is actually a correct mac adres and not a random qr code (like a bag of doritos), send a insertpot request via ajax.
						if(result.text == JSON.stringify(qr)){
							$.ajax({
								 url:"http://www.jaroeneefting.com/school/stenden/sites/waterupapi/insertpot.php?mac="+qr["mac"]+"&uuid="+deviceid,
								 dataType: 'jsonp',
								 success:function(response){
									var data = JSON.parse(JSON.stringify(response));
									 if(data == 'success'){
										//adds pot to DOM if ajax call to api was successful.
										$('#row').append('<div class="col-xs-6 circle" id="'+qr["mac"]+'" data-thickness="3"><span class="imagePot"></span></div>');
										
										$('.circle').circleProgress({
											startAngle: -Math.PI / 2,
											value: 0.00,
											lineCap: 'round',
											fill: {gradient: ['#4CD2FF', '#006CD9']}
										});
						
										//removes old plus sign and generates new one at the end.
										$("#row > .add").remove();
										$('#row').append('<div class="col-xs-6 add"><i class="fa fa-plus fa-5x" aria-hidden="true"></i></div>');
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
					prompt : "Place the QR code thats inside the manual in the scan area.", // Android
					resultDisplayDuration: 500, // Android, display scanned text for X ms. 0 suppresses it entirely, default 1500
					formats : "QR_CODE", // default: all but PDF_417 and RSS_EXPANDED
					disableAnimations : true, // iOS
					disableSuccessBeep: false // iOS
				}
			);
		});
		
		//click pot to edit info or assign a plant.
		$(document).on("click",".circle",function(e){
			e.preventDefault();
			potid = $(this).attr('id');
			$('#modal_title').empty();
			$('#modal_body_alerts').empty();
			$('#modal_body_contents').empty();
			$('.modal-footer').empty();
			$('#modal_title').append('<center>Configuration</center>');
			$('#modal_body_contents').append('<form><div class="form-group"><label for="name">Pot name</label><input type="email" class="form-control" id="name" placeholder="Enter a pot name"></div>');

			$('#modal_body_contents').append('<div class="form-group"><label for="plantselect">Choose a plant</label><select class="form-control" id="plantselect"><option value="0">No plant</option><option value="Primula">Primula</option><option value="Oleander">Oleander</option><option value="Kerstroos/Nieskruid">Kerstroos/Nieskruid</option><option value="Japanse Orchidee">Japanse Orchidee</option></select></div></form>');
			
			$('.modal-footer').append('<button type="button" class="btn btn-primary pull-left saveconfig">Save</button><button type="button" class="btn btn-default" data-dismiss="modal">Close</button>');

			$('#modal_template').modal();
		});
		
		//put all the info in db and handle the response.
		$(document).on('click', '.saveconfig', function (e) {
			e.preventDefault();
			var plant_name = $('.mui--is-not-empty').val();
			var plant_selected = $("#list option:selected").val();
			console.log('clicked on save: '+ potid + ' ' + plant_selected);
			$('#modal_template').modal('hide');
			$.ajax({
				 url:"http://www.jaroeneefting.com/school/stenden/sites/waterupapi/insertplant.php?mac="+potid+"&plantname="+plant_selected,
				 dataType: 'jsonp',
				 success:function(response){
					var data = JSON.parse(JSON.stringify(response));
					//alert(JSON.stringify(response));
					if(data == 'deleted'){
						enabletracking = 0;
						
						$('.circle .imagePot').remove();
						$('.circle .realImagePot').remove();
						$('.circle').append('<span class="imagePot"></span>');	

						$('.circle').circleProgress({
							startAngle: -Math.PI / 2,
							value: 0.00,
							lineCap: 'round',
							fill: {gradient: ['#4CD2FF', '#006CD9']}
						});						
					}else if(data == 'failed'){
						alert("Could not save configuration.1");
					}else{
						//tells the code to listen to mqtt.
						enabletracking = 1;
						
						//puts value of pot at 100 and redraws.
						$('.circle').circleProgress({ value: 1.00 });
						$('.circle').circleProgress('redraw');
						
						//send plant data to mqtt
						client.publish("inf1i-plantpot/subscribe/config/plant-care", JSON.stringify(response)); 
						
						//add picture of plant 
						$('.circle .imagePot').remove();
						$('.circle .realImagePot').remove();
						$('.circle').append('<span class="realImagePot"></span>');
						$('.realImagePot').css('background-image','url(../img/plants/1.png)');
						
						//add pot name under pot
						$('.potname').remove();
						$('.circle').append('<span class="potname">'+plant_name+'</span>');
					}
				 },
				 error:function(){
					 alert("Could not save configuration.2");
				 }      
			});
		});
		
		
		//hold tap to delete pot
		$(document).on("taphold",".circle",function(event){
			//gets mac of the pot that got tabbed on.
			var delete_pot = $(this).attr('id');
			//build up confirmation modal to ask if person really wants to delete pot.
			$('#modal_title').empty();
			$('#modal_body_alerts').empty();
			$('#modal_body_contents').empty();
			$('.modal-footer').empty();
					$('#modal_title').append('<center>Confirm</center>'); 
					$('#modal_body_contents').append('You are about to delete a pot.<br> Are you sure you want to do this?'); 	
			$('.modal-footer').append('<button type="button" class="btn btn-danger pull-left deletepot">Delete</button>');
			$('.modal-footer').append('<button type="button" class="btn btn-default" data-dismiss="modal">Close</button>');
			$('#modal_template').modal();
			
			$(document).on('click', '.deletepot', function (e) {
				//if confirm, fire ajax and remove person/pot association.
				$('#modal_template').modal('hide');
				$.ajax({
					 url:"http://www.jaroeneefting.com/school/stenden/sites/waterupapi/removepot.php?mac="+delete_pot+"&uuid="+deviceid,
					 dataType: 'jsonp',
					 success:function(response){
						var data = JSON.parse(JSON.stringify(response));
						if(data == 'success'){
							//empty current list of potten and retrieve new list.
							$('#row').empty();
							$.getpotten();
							
							//if there are no pots added by a device, show a plus sign.
							if($('#row').children().length == 0){
								$('#row').prepend('<div class="col-xs-6 add"><i class="fa fa-plus fa-5x" aria-hidden="true"></i></div>');
							}
						}else if(data == 'failed'){
							alert("Could not remove the pot.1");
						}
					 },
					 error:function(){
						 alert("Could not remove the pot.2");
					 }      
				});	
			});
		});
		
		
		//FUNCTIONS
		$.getpotten = function(){
			//get any added pots from db via ajax.
			$.ajax({
				 url:"http://www.jaroeneefting.com/school/stenden/sites/waterupapi/getpotten.php?uuid="+deviceid,
				 dataType: 'jsonp',
				 success:function(response){
					var data = JSON.parse(JSON.stringify(response));
					if(response != 'failed'){ 
						alert(JSON.stringify(response) + " " + data["mac"].length);
						//loops through all found pots (made it so it actually has support for more than 1 pot even though we only have 1) and add them to the DOM.
						for (i = 0; i < data["mac"].length; i++) { 
							$('#row').append('<div class="col-xs-6 circle" id="'+data["mac"][i]+'" data-thickness="3"><span class="imagePot"></span></div>');
						}
						
						$('.circle').circleProgress({
							startAngle: -Math.PI / 2,
							value: 0.00,
							lineCap: 'round',
							fill: {gradient: ['#4CD2FF', '#006CD9']}
						});
						
						//removes the old plus sign and adds a new one at the end of all generated pots.
						$("#row > .add").remove();
						$('#row').append('<div class="col-xs-6 add"><i class="fa fa-plus fa-5x" aria-hidden="true"></i></div>');
					}
				 },
				 error:function(){
					 alert("Could not retrieve potten.2");
				 }      
			});				
		}
    },
};

app.initialize();