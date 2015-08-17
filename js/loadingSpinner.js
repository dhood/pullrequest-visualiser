var spinnerEl, spinner

function startSpinner(elementId) {
	spinnerEl = document.getElementById(elementId)
	spinner = new Spinner(spinnerOpts())
	spinner.spin(spinnerEl)
}

function stopSpinner(){
	spinner.stop(spinnerEl)
}


function spinnerOpts() {
	return {
		  lines: 7 // The number of lines to draw
		, length: 35 // The length of each line
		, width: 18 // The line thickness
		, radius: 48 // The radius of the inner circle
		, scale: 0.5 // Scales overall size of the spinner
		, corners: 0.5 // Corner roundness (0..1)
		, color: '#000' // #rgb or #rrggbb or array of colors
		, opacity: 0.25 // Opacity of the lines
		, rotate: 0 // The rotation offset
		, direction: -1 // 1: clockwise, -1: counterclockwise
		, speed: 0.5 // Rounds per second
		, trail: 89 // Afterglow percentage
		, fps: 20 // Frames per second when using setTimeout() as a fallback for CSS
		, zIndex: 2e9 // The z-index (defaults to 2000000000)
		, className: 'spinner' // The CSS class to assign to the spinner
		, top: '50%' // Top position relative to parent
		, left: '50%' // Left position relative to parent
		, shadow: false // Whether to render a shadow
		, hwaccel: false // Whether to use hardware acceleration
		, position: 'absolute' // Element positioning
		}
}