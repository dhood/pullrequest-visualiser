useTestData = false
count_openPRs = 0
openPRdata = []
var openPRdata_toShow
closedPRdata = mergedPRdata = []
closedDatesToProcess = mergedDatesToProcess = []
state = 'all' // which PRs to retrieve in API call

var request = new XMLHttpRequest() // Create a new request object
request.onload = processResponse // Set the event handler


// get requested repository
queryParams = window.location.search.slice(1).split('/')
repoOwner = queryParams[0]
repoName = queryParams[1]
if ( useTestData ) {
	repoOwner = 'testOwner'
	repoName = 'testRepo'
}

// start a spinner while graph data is being prepared
if ( !useTestData ) {
	startSpinner('spins')
}


// Initialize an api request
page = 1
apiRequestString = buildRequestString(repoOwner, repoName, state, page)
request.open('get', apiRequestString)
request.send() // Send api request

// builds url api request from search parameters
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

// callback for when api response is received
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
			stopSpinner()
      		displayGraphOptions()
      		showLastNevents(50)	
		}

	}
	else {
		processPRs(responseObj)
		processClosedDates()
		displayGraphOptions()
      	showLastNevents	(50)	
	}
}

// called after a group of PRs have been received (1 page of api request returned)
function processPRs(data) {
	for (var i = 0; i < data.length; i++) {
		prNumber = data[i].number
		openDate = new Date(Date.parse(data[i].created_at))

		openPRdata.push({ x: openDate, 
						  y: count_openPRs++, prNumber: prNumber })
		if (data[i].closed_at != null) {
			boolMerged = data[i].merged_at != null
			closedDatesToProcess.push(
				{ date: new Date(Date.parse(data[i].closed_at)), 
				merged: boolMerged, prNumber: prNumber })
		}
	}
}

// called after all of the PRs have been received 
// (only cummulative PR info is stored before then, want the #open at each date)
function processClosedDates() {
	closedDatesToProcess.sort(date_sort_asc)
	openPRdata = openPRdata.reverse()

	// decrement cumulative open PRs if some have been closed
	var i, j = 0;
	for (i = 0; i < closedDatesToProcess.length; i++) {
		while (j < openPRdata.length 
			&& openPRdata[j].x <= closedDatesToProcess[i].date) {
			openPRdata[j].y = (openPRdata.length - openPRdata[j++].y) - i
		}
	}
	// continue for data points after the last close event
	while ( j < openPRdata.length ) {
		openPRdata[j].y = (openPRdata.length - openPRdata[j++].y) - i
	}


	// second pass to insert the closed-date data points
	var j = 0;
	for (var i = 0; i < closedDatesToProcess.length; i++) {
		while (j < openPRdata.length 
			&& openPRdata[j].x <= closedDatesToProcess[i].date) {
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
		val = j>0 ? openPRdata[j-1].y-1 : -1 // comes
		openPRdata.splice(j, 0, { x: closedDatesToProcess[i].date, y: val, 
					markerType: markerType, markerColor: markerColor, 
					prNumber: closedDatesToProcess[i].prNumber })		
	}
}

var date_sort_asc = function (obj1, obj2) {
	if (obj1.date > obj2.date) return 1;
	if (obj1.date < obj2.date) return -1;
	return 0;
};

// -------------------------- functions for responding to graph/GUI events

function filterPRdates(sinceDate, uptoDate) {
	var i, j

	if ( !isNaN(sinceDate) ) {  // optional argument
		for ( i=0; i<openPRdata.length && openPRdata[i].x < sinceDate; i++ );
	}
	if ( !isNaN(uptoDate) ) {	// optional argument
		for ( j = isNaN(sinceDate) ? 0 : i; 
			   j<openPRdata.length && openPRdata[j].x < uptoDate; j++ );
	}
	openPRdata_toShow = openPRdata.slice(i,j)
}

function setDateRange() {
	sinceDate = new Date(Date.parse(document.getElementById('sincedatepicker').value))
	uptoDate = new Date(Date.parse(document.getElementById('uptodatepicker').value))
	// include uptoDate in search range
	uptoDate = new Date(uptoDate.getFullYear(), 
		uptoDate.getMonth(), uptoDate.getDate()+1)
    filterPRdates(sinceDate, uptoDate)
    plotData()
}

function showLastNevents(N) {
	if ( null == N ) {
		N = parseInt(document.getElementById('nEvents').value)
	}
	if ( !isNaN(N) ) {
		openPRdata_toShow = openPRdata.slice(Math.max(0, openPRdata.length - N))
		plotData()
	}
}

function setShowAll() {
	openPRdata_toShow = openPRdata
	plotData()
}

function getPRurl(prNumber) {
	return 'https://github.com/' + repoOwner + '/' + repoName
			 + '/pull/' + prNumber
}

function getChartTitle() {
	return "Pull Requests for " + repoOwner + "'s '" + repoName + "'"
}


