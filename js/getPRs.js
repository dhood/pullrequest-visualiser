useTestData = false
count_openPRs = 0
openPRdata = openPRdata_toShow = []
closedDatesToProcess = []
state = 'all' // which PRs to retrieve in API call

var request = new XMLHttpRequest() // Create a new request object
request.onload = processResponse // Set the event handler

main()

function main() {

	hideGraph()
	hideGraphOptions()
	hideRepoInfoOptions()
	hideFooter()
	hideFailText()

	// get requested repository from URL, if present
	queryString = window.location.search.slice(1)

	// slashes are no longer used but should still be supported
	queryInfo = parseLegacyQueryString(queryString)
	repoOwner = queryInfo.repoOwner
	repoName = queryInfo.repoName

	// try new query string format
	if (repoOwner != null && repoName ==  null) {
		queryInfo = parseQueryString(queryString)
		repoOwner = queryInfo.repoOwner
		repoName = queryInfo.repoName
	}

	if ( useTestData ) {
		repoOwner = 'testOwner'
		repoName = 'testRepo'
	}

	if (repoOwner != null && repoName != null ) {
		requestFirstPage()
	}
	else {
		// if no repository properly requested in query string, get from UI
		displayFooter()
		displayRepoInfoOptions()

		if ( (repoOwner != null && repoOwner.length>0) || repoName != null ) {
			displayFailText()
		}
	}

}

function requestFirstPage() {
	hideFooter()

	// start a spinner while graph data is being prepared
	if ( !useTestData ) {
		startSpinner('spins')
	}

	count_openPRs = 0
	openPRdata = openPRdata_toShow = []
	closedDatesToProcess = []

	// Initialize an api request
	page = 1
	apiRequestString = buildRequestString(repoOwner, repoName, state, page)
	request.open('get', apiRequestString)
	request.send() // Send api request
}

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
	if ( this.status == 403 ) {
		alert('Sorry, GitHub API rate limit exceeded. Please try again later.')
		processClosedDates() // might have still managed to get some
		stopSpinner()
		displayFooter()
  		displayGraphOptions()
  		showLastNevents(50)	
	}
	else if ( this.status == 404 ) {
		stopSpinner()
		displayFooter()
		displayFailText()
		displayRepoInfoOptions()
	}
	else {

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
				displayFooter()
	      		displayGraphOptions()
	      		showLastNevents(50)	
			}

		}
		else {
			processPRs(responseObj)
			processClosedDates()
			displayFooter()
			displayGraphOptions()
	      	showLastNevents	(50)	
		}
	}
}

// called after a group of PRs have been received (1 page of api request returned)
function processPRs(data) {
	for (var i = 0; i < data.length; i++) {
		prNumber = data[i].number
		prTitle = data[i].title
		eventTitle = 'Opened: \''+prTitle.slice(0,20)+ (prTitle.length>20 ? '...\'':'\'')
		openDate = new Date(Date.parse(data[i].created_at))

		openPRdata.push({ x: openDate, y: count_openPRs++, 
					prNumber: prNumber, eventTitle: eventTitle })
		if (data[i].closed_at != null) {
			boolMerged = data[i].merged_at != null
			closedDatesToProcess.push(
				{ date: new Date(Date.parse(data[i].closed_at)), 
				merged: boolMerged, prNumber: prNumber, prTitle: prTitle })
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
			j++
		}
		prTitle = closedDatesToProcess[i].prTitle
		var eventTitle = prTitle.slice(0,20)+ (prTitle.length>20 ? '...\'':'\'')
		if ( closedDatesToProcess[i].merged ) {
			markerType = markerType_closedmerged
			markerColor = markerColor_closedmerged
			eventTitle = 'Merged: \'' + eventTitle

		}
		else {
			markerType = markerType_closedunmerged
			markerColor = markerColor_closedunmerged
			eventTitle = 'Closed: \'' + eventTitle
		}
		val = j>0 ? openPRdata[j-1].y-1 : -1 // comes
		openPRdata.splice(j, 0, { x: closedDatesToProcess[i].date, y: val, 
					markerType: markerType, markerColor: markerColor, 
					prNumber: closedDatesToProcess[i].prNumber,
					eventTitle: eventTitle })		
	}
}

var date_sort_asc = function (obj1, obj2) {
	if (obj1.date > obj2.date) return 1;
	if (obj1.date < obj2.date) return -1;
	return 0;
};

function parseLegacyQueryString(queryString) {
	queryParams = queryString.split('/')
	return {
		repoOwner: queryParams[0],
		repoName: queryParams[1]
	}
}

// the query string should still be more sophisticated...
function parseQueryString(queryString) {
	queryParams = queryString.split('&')
	return {
		repoOwner: queryParams[0],
		repoName: queryParams[1]
	}
}

function buildQueryString(queryParams) {
	return queryParams.repoOwner + '&' + queryParams.repoName
}
// there should be a matching buildQueryString function used by the 
// bookmarklet, but because of the Content Security Policy it can't be accessed
// from the bookmarklet anyway


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

function displayGraphOptions() {
  document.getElementById('chartOptions').style.display = 'block'
}

function hideGraphOptions() {
  document.getElementById('chartOptions').style.display = 'none'
}

function displayGraph() {
  document.getElementById('chartContainer').style.display = 'block'
}

function hideGraph() {
  document.getElementById('chartContainer').style.display = 'none'
}

function displayFooter() {
  document.getElementById('footer').style.visibility = 'visible'
}

function hideFooter() {
  document.getElementById('footer').style.visibility = 'hidden'
}

function displayRepoInfoOptions() {
  document.getElementById('repoInfoOptions').style.display='block'
}

function hideRepoInfoOptions() {
  document.getElementById('repoInfoOptions').style.display='none'
}

function displayFailText() {
  document.getElementById('failText').style.display='block'
}

function hideFailText() {
  document.getElementById('failText').style.display='none'
}

function setRepoOptions() {
	repoOwner = document.getElementById('repoOwnerInput').value
	repoName = document.getElementById('repoNameInput').value
	history.replaceState({queryString: ''}, 'Pull Request Visualiser', '')
	queryString = '?' + buildQueryString({repoOwner: repoOwner, repoName: repoName})
	// change the URL to contain the repository being displayed
	history.pushState({queryString: queryString}, getChartTitle(), queryString)
	hideRepoInfoOptions()
	hideFailText()
	requestFirstPage()
}

$(window).bind("popstate", function(e) {
	main()
});

