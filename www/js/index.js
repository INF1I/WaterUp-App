setTimeout(function() {   
   $('.loadingScreen').fadeOut('slow', function() {
		$('.potOverview > .text').removeClass('hide');
		$('.potOverview').fadeIn('slow');
	});
}, 5000);