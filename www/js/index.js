setTimeout(function() {   
   $('.loadingScreen').fadeOut('slow', function() {
		$('.potOverview > .text').removeClass('hide');
		$('.potOverview > .text').css('width',$(window).width()); //dynamicly detect device width to always center text
		$('.potOverview').fadeIn('slow');
	});
}, 2000);

$('.potOverview > .text').append('now you can do shit');