# Pull Request Visualiser

A bookmarklet which, when clicked from a GitHub repository, opens a graph of the number of open pull requests at any point in history for the repository. May be useful for those wishing to visualise the contribution activity of a repository over a period of time. 

![Example graph](http://dhood.github.io/pullrequest-visualiser/images/sampleGraph.png)

### Known issues
  - When multiple events occur in the same commit their data points are visually distinct but only one is clickable
  - When the density of data points is too high, no markers are displayed
  - Only 60 pages of pull requests can be requested per IP address per hour (limitation of un-authenticated API requests)

### To do
  - Build graph from current time backwards (requires access to current number of open pull requests (API only exposes for issues))
  - Request multiple pages of pull request info in parallel
  - Invite user to authenticate with GitHub once API call limit has been reached
  - Extend to issues as well as pull requests
  - Put display options in url for copying the graph with options

### Third party
* [CanvasJS](http://canvasjs.com/) - plotting
* [spin.js](http://fgnass.github.io/spin.js/) - loading spinner
* [jQuery](https://jqueryui.com/datepicker/) - date pickers
* [Graph by dw from the Noun Project](https://thenounproject.com/term/graph/38007/) - favicon