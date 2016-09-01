// window.reveal = ScrollReveal();

// reveal.reveal('.wrap');
// reveal.reveal('.bar');

$(document).ready(function($) {

	$(".scroll").click(function() {
	    $('body').animate({
	        scrollTop: $("#about").offset().top
	    }, 2000);

	    return false;
	});
	
	// init controller
	var controller = new ScrollMagic.Controller({
		globalSceneOptions: {
			triggerHook: 0.5
		}
	});

	// build scenes
	new ScrollMagic.Scene({triggerElement: "#about"})
		.setClassToggle("#about", "reveal") // add class toggle
		.on("progress", function (event) {
			if(event.progress) this.removeClassToggle(false);
		})
		.addTo(controller);
	new ScrollMagic.Scene({triggerElement: "#process"})
		.setClassToggle("#process", "reveal") // add class toggle
		.on("progress", function (event) {
			if(event.progress) this.removeClassToggle(false);
		})
		.addTo(controller);
	new ScrollMagic.Scene({triggerElement: "#clients"})
		.setClassToggle("#clients", "reveal") // add class toggle
		.on("progress", function (event) {
			if(event.progress) this.removeClassToggle(false);
		})
		.addTo(controller);
	new ScrollMagic.Scene({triggerElement: "#contact"})
		.setClassToggle("#contact", "reveal") // add class toggle
		.on("progress", function (event) {
			if(event.progress) this.removeClassToggle(false);
		})
		.addTo(controller);
});

if($(window).width() > 560) {
	// do parallax for top title
	$(window).scroll(function() {
		easyPeasyParallax();
	});
}

$(window).scroll(function() {
	$("body").addClass("scrolling");
});

$(window).load(function() {
	$("body").removeClass("preload");
	$("body").addClass("loaded");
});



function easyPeasyParallax () {
	var position = $(this).scrollTop();

	if (position > 600) return;

	position = position / 30;

	// $('#header .blur').css({		
	// 	"opacity": position
	// });

	$('#header .image').css({
		"-webkit-filter": "blur(" + position + "px)",
		"filter": "blur(" + position + "px)" 
	});
}