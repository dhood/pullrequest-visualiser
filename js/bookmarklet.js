(function(){
  var url = buildURL();
  if (url != null) {
    var win = window.open(url, '_blank');
    win.focus(); 
  }
})();

function buildURL() {
  baseURL = "http://dhood.github.io/pullrequest-visualiser/plot.html"

  url = null;
  currentLink = window.location.href;
  afterGithub = currentLink.match(/github.com\/(.*)/);
  if ( afterGithub != null && afterGithub.length > 1 ) {
    afterGithub = afterGithub[1];
    pieces = afterGithub.split('/');
    if ( pieces.length > 2 ) {
      repoOwner = pieces[0];
      repoName = pieces[1];
      url = baseURL + '?' + repoOwner + '/' + repoName;
    }
  }
  return url;
}