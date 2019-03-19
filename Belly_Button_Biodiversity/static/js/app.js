function buildMetadata(sample) {

    d3.json("/metadata/" + sample).then(function(data){
        var metadata = d3.select("#sample-metadata");
        metadata.html("")
        metadata.append("p").text("AGE: " + data["AGE"])
        metadata.append("p").text("BBTYPE: " + data["BBTYPE"])
        metadata.append("p").text("ETHNICITY: " + data["ETHNICITY"])
        metadata.append("p").text("GENDER: " + data["GENDER"])
        metadata.append("p").text("LOCATION: " + data["LOCATION"])
        metadata.append("p").text("SAMPLEID: " + data["sample"])
        metadata.append("p").text("WFREQ: " + data["WFREQ"])
        drawGuage(data["WFREQ"])
    });

}

function buildCharts(sample) {

    d3.json("/samples/" + sample).then(function(data){
        var otuIds = data.otu_ids.slice(0,10);
        var otuLabel = data.otu_labels.slice(0,10);
        var sampleValues = data.sample_values.slice(0,10);
        var trace1 = [{
                        "labels": otuIds,
                        "values": sampleValues,
                        "hovertext": otuLabel,
                        "type": "pie"

        }];
        Plotly.newPlot("pie", trace1);
//**************************************************************************************************************

    var trace2 = {
        x: data.otu_ids,
        y: data.sample_values,
        text: data.otu_labels,
        mode: 'markers',
        marker: {color: data.otu_ids,size: data.sample_values}
    };

     var bubble = [trace2];

     var layout = {
          height: 600,
          width: 1200,
          showlegend: true,
          hovermode: 'closest',
          xaxis: {title: 'otu id'}
      };

     Plotly.newPlot('bubble', bubble, layout);
    });
}

function init() {
  // Grab a reference to the dropdown select element
  var selector = d3.select("#selDataset");

  // Use the list of sample names to populate the select options
  d3.json("/names").then((sampleNames) => {
    sampleNames.forEach((sample) => {
      selector
        .append("option")
        .text("BB_" + sample)
        .property("value", sample);
    });

    // Use the first sample from the list to build the initial plots
    const firstSample = sampleNames[0];
    buildCharts(firstSample);
    buildMetadata(firstSample);
  });
}

function drawGuage(level){
    var level = level * 180 / 12;

    // Trig to calc meter point
    var degrees = 180 - level,
         radius = .5;
    var radians = degrees * Math.PI / 180;
    var x = radius * Math.cos(radians);
    var y = radius * Math.sin(radians);

    // Path: may have to change to create a better triangle
    var mainPath = 'M -.0 -0.025 L .0 0.025 L ',
         pathX = String(x),
         space = ' ',
         pathY = String(y),
         pathEnd = ' Z';
    var path = mainPath.concat(pathX,space,pathY,pathEnd);

    var data = [{ type: 'scatter',
       x: [0], y:[0],
        marker: {size: 28, color:'850000'},
        showlegend: false,
        name: 'speed',
        text: level,
        hoverinfo: 'text'},
      { values: [50/6, 50/6, 50/6, 50/6, 50/6, 50/6, 50],
      rotation: 90,
      text: ['10-12', '8-10', '6-8', '4-6',
                '2-4', '0-2'],
      textinfo: 'text',
      textposition:'inside',
      marker: {colors:['rgba(14, 127, 0, .5)', 'rgba(110, 154, 22, .5)',
                             'rgba(170, 202, 42, .5)', 'rgba(202, 209, 95, .5)',
                             'rgba(210, 206, 145, .5)', 'rgba(232, 226, 202, .5)',
                             'rgba(255, 255, 255, 0)','rgba(255, 255, 255, 0)','rgba(255, 255, 255, 0)']},
      labels: ['10-12', '8-10', '6-8', '4-6',
                '2-4', '0-2'],
      hoverinfo: 'label',
      hole: .5,
      type: 'pie',
      showlegend: false
    }];

    var layout = {
      shapes:[{
          type: 'path',
          path: path,
          fillcolor: '850000',
          line: {
            color: '850000'
          }
        }],
      height: 500,
      width: 500,
      xaxis: {zeroline:false, showticklabels:false,
                 showgrid: false, range: [-1, 1]},
      yaxis: {zeroline:false, showticklabels:false,
                 showgrid: false, range: [-1, 1]}
    };

    Plotly.newPlot('gauge', data, layout, {showSendToCloud:true});
}


function optionChanged(newSample) {
  buildCharts(newSample);
  buildMetadata(newSample);
}

// Initialize the dashboard
init();
