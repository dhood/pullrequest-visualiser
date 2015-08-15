useTestData = false
count_openPRs = count_closedPRs = 0
openPRdata = []
var openPRdata_toShow
closedPRdata = mergedPRdata = []
closedDatesToProcess = mergedDatesToProcess = []


// Create a new request object
var request = new XMLHttpRequest();

// Set the event handler
request.onload = processResponse

// Initialize a request
queryParams = window.location.search.slice(1).split('/')
repoOwner = queryParams[0]
repoName = queryParams[1]
if ( useTestData ) {
	repoOwner = 'KSP-CKAN'
	repoName = 'CKAN'
}
state = 'all'
page = 1

apiRequestString = buildRequestString(repoOwner, repoName, state, page)
request.open('get', apiRequestString)

// Send it
request.send()

if ( !useTestData ) {
	var spinnerEl = document.getElementById('spins')
	var spinner = new Spinner(spinnerOpts())
	spinner.spin(spinnerEl)
}

function buildRequestString(repoOwner, repoName, state, page) {
	if ( useTestData ) {
		return 'testdata_desc.txt'
	}
	else {
		return 'https://api.github.com/repos/' + repoOwner + '/' + repoName
			 + '/pulls?state=' + state + '&page=' + page
			 + '&direction=desc&sort=created&per_page=100'	
	}
		 
}

function processResponse() {
	// process info
	var responseObj = JSON.parse(this.responseText)

	if ( !useTestData ) {
		if (responseObj.length > 0) {	
			// request the next page
			page++
			apiRequestString = buildRequestString(repoOwner, repoName, state, page)
			request.open('get', apiRequestString)
			request.send()		

			processPRs(responseObj)	
		}
		else {
			processClosedDates()
      		spinner.stop(spinnerEl)
      		displayGraphOptions()
      		setShowAll()	
		}

	}
	else {
		processPRs(responseObj)
		processClosedDates()
		displayGraphOptions()
      	setShowAll()
	}
}

function processPRs(data) {
	for (var i = 0; i < data.length; i++) {
		prNumber = data[i].number
		openDate = new Date(Date.parse(data[i].created_at))

		openPRdata.push({ x: openDate, 
						  y: ++count_openPRs, prNumber: prNumber })
		if (data[i].closed_at != null) {
			boolMerged = data[i].merged_at != null
			closedDatesToProcess.push(
				{ date: new Date(Date.parse(data[i].closed_at)), 
				merged: boolMerged, prNumber: prNumber })
		}
	}
}


function processClosedDates() {
	closedDatesToProcess.sort(date_sort_asc)
	openPRdata = openPRdata.reverse()

	// decrement cumulative open PRs if some have been closed
	var i, j = 0;
	for (i = 0; i < closedDatesToProcess.length; i++) {
		while (j < openPRdata.length && openPRdata[j].x <= closedDatesToProcess[i].date) {
			openPRdata[j].y = (openPRdata.length - openPRdata[j++].y) -i
		}
	}
	// continue for data points after the last close event
	while ( j < openPRdata.length ) {
		openPRdata[j++].y = (openPRdata.length - openPRdata[j++].y) -i
	}


	// second pass to insert the closed-date data points
	var j = 0;
	for (var i = 0; i < closedDatesToProcess.length; i++) {
		while (j < openPRdata.length && openPRdata[j].x <= closedDatesToProcess[i].date) {
			j++;
		}
		if ( closedDatesToProcess[i].merged ) {
			markerType = markerType_closedmerged
			markerColor = markerColor_closedmerged
		}
		else {
			markerType = markerType_closedunmerged
			markerColor = markerColor_closedunmerged
		}
		val = j>0 ? openPRdata[j-1].y-1 : -1
		openPRdata.splice(j, 0, { x: closedDatesToProcess[i].date, y: val, 
					markerType: markerType, markerColor: markerColor, prNumber: closedDatesToProcess[i].prNumber })		
	}
}

function filterPRdates() {
	var i, j
	for ( i=0; i<openPRdata.length && openPRdata[i].x < sinceDate; i++ );
	for ( j=i; j<openPRdata.length && openPRdata[j].x < uptoDate; j++ );

	openPRdata_toShow = openPRdata.slice(i,j)
}

function setDateRange() {
	sinceDate = new Date(Date.parse(document.getElementById('sincedatepicker').value))
	uptoDate = new Date(Date.parse(document.getElementById('uptodatepicker').value))
	// include uptoDate in search range
	uptoDate = new Date(uptoDate.getFullYear(), uptoDate.getMonth(), uptoDate.getDate()+1)
    filterPRdates()
    plotData()
}

function setShowAll() {
	openPRdata_toShow = openPRdata
	plotData()
}


function displayGraphOptions() {
	document.getElementById('chartOptions').style.visibility='visible'
}

var date_sort_asc = function (obj1, obj2) {
	if (obj1.date > obj2.date) return 1;
	if (obj1.date < obj2.date) return -1;
	return 0;
};

function getPRurl(prNumber) {
	return 'https://github.com/' + repoOwner + '/' + repoName
			 + '/pull/' + prNumber
}

function getChartTitle() {
	return "Pull Requests for " + repoOwner + "'s '" + repoName + "'"
			+ ' (zoomable and clickable)'
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

