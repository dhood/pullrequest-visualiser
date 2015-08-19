markerColor_opened = 'grey'
markerType_opened = 'circle'
markerColor_closedmerged = '#2EB783'
markerType_closedmerged = 'triangle'
markerColor_closedunmerged = 'red'
markerType_closedunmerged = 'cross'
lineColor = 'lightgrey'

function plotData() {
  document.getElementById('eventsShown').innerHTML = openPRdata_toShow.length
      + ' / ' + openPRdata.length

  var chart = new CanvasJS.Chart("chartContainer",
  {
    zoomEnabled: true,
    animationEnabled: true,
    exportEnabled: true,
    title:{
      text: getChartTitle()
    },
    axisX:{
      valueFormatString: "DD MMM 'YY HH:mm"
    },
    axisY:{
      titleFontSize: 15,
      title: "# open PRs at each event",
      interlacedColor: "#F5F5F5",
      includeZero: true
    },
    theme: "theme1",
    toolTip:{
            shared: true
    },
    legend:{
      verticalAlign: "bottom",
      horizontalAlign: "center",
      fontFamily: "Lucida Sans Unicode"

    },
    data: [
      {        
        type: "line",
        click: onClick,
        cursor: "pointer",
        color: lineColor,
        markerColor: markerColor_opened,
        markerType: markerType_opened,
        lineThickness: 3,
        showInLegend: false,           
        name: "Open PRs", 
        legendText: "PR opened",
        xValueFormatString: "DD MMM 'YY HH:mm",
        dataPoints: openPRdata_toShow,
        toolTipContent: "<center>{x}<br/>{name}: {y}<br/>{eventTitle}</center>"
      },
      // just for the legend of different types of markers:
      {
        type: "line",
        color: lineColor,
        markerColor: markerColor_opened,
        markerType: markerType_opened,
        showInLegend: true,
        name: "PR opened",
        dataPoints: []
      },
      {
        type: "line",
        color: lineColor,
        markerColor: markerColor_closedmerged,
        markerType: markerType_closedmerged,
        showInLegend: true,
        name: "PR merged",
        dataPoints: []
      },
      {
        type: "line",
        color: lineColor,
        markerColor: markerColor_closedunmerged,
        markerType: markerType_closedunmerged,
        showInLegend: true,
        name: "PR closed unmerged",
        dataPoints: []
      }
    ]
  });

  chart.render();

  function onClick(e) {
    var win = window.open(getPRurl(e.dataPoint.prNumber), '_blank')
      if ( win != null ) {
        win.focus();    
    }
  }
}

function displayGraphOptions() {
  document.getElementById('chartOptions').style.visibility='visible'
}