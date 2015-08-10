count_openPRs = count_closedPRs = 0
openPRdata = []
closedPRdata = mergedPRdata = []
closedDatesToProcess = mergedDatesToProcess = []


// Create a new request object
var request = new XMLHttpRequest();

// Set the event handler
request.onload = processResponse

// Initialize a request
repoOwner = 'KSP-CKAN'
repoName = 'CKAN'
state = 'all'
page = 1
since = getSince()

apiRequestString = buildRequestString(repoOwner, repoName, state, page, since)
request.open('get', apiRequestString)

// Send it
request.send()


function buildRequestString(repoOwner, repoName, state, page, since) {
	return 'https://api.github.com/repos/' + repoOwner + '/' + repoName
		 + '/pulls?state=' + state + '&page=' + page + '&since=' + since 
		 + '&direction=asc&per_page=100'
}

function processResponse() {
	// process info
	var responseObj = JSON.parse(this.responseText)

	if (responseObj.length > 0) {	
		processPRs(responseObj)	

		
		page++
		apiRequestString = buildRequestString(repoOwner, repoName, state, page, since)
		request.open('get', apiRequestString)
		// Send it
		request.send()
	}
	else {
		
		processClosedDates()
		//processClosedDates()
		console.log(count_openPRs + " pull requests!")
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
	closedDatesToProcess.sort().reverse()

	// decrement cumulative open PRs if some have been closed (this is inefficient for now - will come back to it)
	for (var i = 0; i < closedDatesToProcess.length; i++) {
		for (var j = 0; j < openPRdata.length; j++){
			if (openPRdata[j].x > closedDatesToProcess[i]){
				openPRdata[j].y -= 1
			}
		}
	}
	// second pass to insert the closed-date data points (this is buggy for now - will come back to it)
	for (var i = 0; i < closedDatesToProcess.length; i++) {
		var j = 0;
		while (j < openPRdata.length && openPRdata[j].x < closedDatesToProcess[i]) {
			j++;
		}
		openPRdata.push({ x: closedDatesToProcess[i], y: openPRdata[j-1].y-1, markerType: 'cross'})		
	}
}

function getSince() {
    var d = new Date();
    d.setMonth(d.getMonth()-1)
    return d.toISOString().slice(0, -5)+'Z';
}

