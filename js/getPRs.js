useTestData = true
count_openPRs = count_closedPRs = 0
openPRdata = []
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
state = 'all'
page = 1
since = getSince()

apiRequestString = buildRequestString(repoOwner, repoName, state, page, since)
request.open('get', apiRequestString)

// Send it
request.send()


function buildRequestString(repoOwner, repoName, state, page, since) {
	if ( useTestData ) {
		return 'testdata2.txt'
	}
	else {
		return 'https://api.github.com/repos/' + repoOwner + '/' + repoName
			 + '/pulls?state=' + state + '&page=' + page + '&since=' + since 
			 + '&direction=asc&per_page=100'	
	}
		 
}

function processResponse() {
	// process info
	var responseObj = JSON.parse(this.responseText)

	if ( !useTestData ) {

		if (responseObj.length > 0) {	
			processPRs(responseObj)	
			// request the next page
			page++
			apiRequestString = buildRequestString(repoOwner, repoName, state, page, since)
			request.open('get', apiRequestString)
			// Send it
			request.send()	
		}
		else {
			processClosedDates()
			console.log(count_openPRs + " pull requests!")
			plotData()
		}

	}
	else {
		processPRs(responseObj)
		processClosedDates()
		plotData()
	}
}

function processPRs(data) {
	for (var i = 0; i < data.length; i++) {
		openPRdata.push({ x: new Date(Date.parse(data[i].created_at)), y: ++count_openPRs})
		if (data[i].closed_at != null) {
			closedDatesToProcess.push(new Date(Date.parse(data[i].closed_at)))
		}
	}
}


function processClosedDates() {
	closedDatesToProcess.sort(date_sort_asc)

	// decrement cumulative open PRs if some have been closed
	var i, j = 0;
	for (i = 0; i < closedDatesToProcess.length; i++) {
		while (j < openPRdata.length && openPRdata[j].x <= closedDatesToProcess[i]) {
			openPRdata[j++].y -= i
		}
	}
	// continue for data points after the last close event
	while ( j < openPRdata.length ) {
		openPRdata[j++].y -= i
	}


	// second pass to insert the closed-date data points
	var j = 0;
	for (var i = 0; i < closedDatesToProcess.length; i++) {
		while (j < openPRdata.length && openPRdata[j].x <= closedDatesToProcess[i]) {
			j++;
		}
		openPRdata.splice(j, 0, { x: closedDatesToProcess[i], y: openPRdata[j-1].y-1, markerType: 'cross'})		
	}
}

function getSince() {
    var d = new Date();
    d.setMonth(d.getMonth()-1)
    return d.toISOString().slice(0, -5)+'Z';
}

var date_sort_asc = function (date1, date2) {
  if (date1 > date2) return 1;
  if (date1 < date2) return -1;
  return 0;
};

function uniq(a) {
    var seen = {};
    return a.filter(function(item) {
        return seen.hasOwnProperty(item) ? false : (seen[item] = true);
    });
}

