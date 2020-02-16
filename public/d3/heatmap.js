//DATA
var url =  "https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/global-temperature.json";

//D3 FUNCTION
d3.json(url, function(error, data) {
  //HANDLE ERRORS
  if (error) throw error;
  //INIT VARIABLES

  const months = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  var year;
  const firstYear = data.monthlyVariance[0].year;
  const lastYear = data.monthlyVariance[data.monthlyVariance.length - 1].year;

  var width = 500
  var height = 340
  var len = (width>height?width:height)
  var margin = {
    top: 50,
    bottom: 50,
    left: 60,
    right: 55
  };
  var fontSize = "1em";

  //COLOR PALLETES
  const col = [
    "#67001f",
    "#b2182b",
    "#d6604d",
    "#f4a582",
    "#fddbc7",
    "#f7f7f7",
    "#d1e5f0",
    "#92c5de",
    "#4393c3",
    "#2166ac",
    "#053061"
  ].reverse();


  const blue = [
    "#deebf7",
    "#c6dbef",
    "#9ecae1",
    "#6baed6",
    "#4292c6",
    "#2171b5",
    "#08519c",
    "#08306b"
  ].reverse();
  const red = [
    "#fee0d2",
    "#fcbba1",
    "#fc9272",
    "#fb6a4a",
    "#ef3b2c",
    "#cb181d",
    "#a50f15",
    "#67000d"
  ];
  const col2 = blue.concat(red);
  const variance = data.monthlyVariance.map(d => d.variance);

  //TOOLTIP using d3-tip
  var tooltipHeatmap = d3.tip()
    .attr("id", "tooltipHeatmap")
    .style("opacity",0)
    .style("transition", "opacity 300ms ease-out")
    .html(d => d)
    .direction("n")
    .offset([-12, 1]);

  //
  ////SVGs
  //

  //DRAW MAIN GRAPH AREA
  const svgBoxHeatMap = d3
    .select(".heatMap")
    .append("svg")
     // .attr("width",500)
     // .attr("height",340)
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", "0 0 "+500+" "+340+"")
  //  .attr("transform","translate(50,0)")
    .classed("svg-content", true)
    .call(tooltipHeatmap);


  //Y-AXIS SCALE
  const y_scale = d3.scaleBand()
    .domain(months)
    .range([0, height], 0, 0);
  //Y-AXIS TICKS
  const y_axis = d3.axisLeft(y_scale)
    //value of band equal to months
    .tickValues(y_scale.domain())
    // ticks named as months through applying month value to its utc formatted pair
    .tickFormat(month => {
      let d = new Date(0);
      d.setUTCMonth(month);
      return d3.utcFormat("%B")(d);
    })
    .tickSize(10, 1);

    //X-AXIS SCALE
  var x_scale = d3.scaleBand()
    .domain(
      data.monthlyVariance.map(d => {
        return d.year;
      })
    )
    .range([0, width], 0, 0);

  // X-AXIS TICKS
  var x_axis = d3.axisBottom(x_scale)
    .tickValues(
      x_scale.domain().filter(yr => {
        return yr % 10 === 0;
      })
    )
    .tickFormat(yr => {
      let d = new Date(0);
      d.setUTCFullYear(yr);
      return d3.utcFormat("%Y")(d);
    })

    .tickSize(12, 1);


  //DRAW Y-AXIS
  //
  svgBoxHeatMap
    .append("g")
    .attr("class", "y-axis")
    .attr("id", "y-axis")
    .attr(
      "transform",
      "translate(" + (margin.left-1) + ", " + (margin.top ) + ") scale(0.7)"
    )
    .call(y_axis);


  //DRAW X-AXIS
  svgBoxHeatMap
    .append("g")
    .attr("class", "x-axis")
    .attr("id", "x-axis")
    .attr(
      "transform",
      "translate(" +(margin.left-1) + "," + (height - margin.bottom -2) + ") scale(0.7)"
    )
    .call(x_axis)
  .selectAll("text")
  .attr("dy","1em")
  .attr("x",-15)
  .attr("y",2)
    .attr("transform","rotate(300)")
  .style("text-anchor","end");

  const baseTemp = data.baseTemperature;
  const minTemp = baseTemp + Math.min.apply(Math, variance);
  const maxTemp = baseTemp + Math.max.apply(Math, variance);
  const quantColors = d3.scaleQuantize()
    .domain([minTemp - baseTemp, maxTemp - baseTemp])
    .range(col2);

  //DRAW GRAPH
  svgBoxHeatMap
    .append("g")
    .selectAll("rect")
    .data(data.monthlyVariance)
    .enter()
    .append("rect")
    .attr("class", "cell")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ") scale(0.7)")
    .attr("data-month", d => d.month - 1)
    .attr("data-year", d => d.year)
    .attr("data-temp", d => data.baseTemperature + d.variance)
    .attr("fill", d => {
      return quantColors(d.variance);
    })
    .attr("x", (d, i) => x_scale(d.year))
    .attr("y", (d, i) => y_scale(d.month - 1))
    .attr("width", (d, i) => 2||x_scale.range(d.year))
    .attr("height", (d, i) =>28|| y_scale.range(d.month - 1))
    .on("mouseover", d => {
      // create date object so Month can be displayed as word instead of index
      var date = new Date(d.year, d.month - 1);

      //TOOLTIP TEXTTITLE
      var htmlString =
        "<span>" +
        d3.timeFormat("%B")(date) +
        " - " +
        d.year +
        "</span>" +
        "<br> <span>" +
        d3.format("+.1f")(baseTemp + d.variance) +
        "&#8451" +
        "</span>" +
        "<br> <span>" +
        d3.format("+.1f")(d.variance) +
        "&#8451" +
        "</span>";

      tooltipHeatmap
        .attr("data-year", d.year)
        .style("border", "5px " + quantColors(d.variance) + " solid")
        .show(htmlString);
    })
    .on("mouseout", tooltipHeatmap.hide);

  //TITLE
  svgBoxHeatMap
    .append("text")
    .attr("id", "title")
    .attr("x", 50)
    .attr("y", 22)
    .style("font-size", "1rem")
    .text("Monthly Global Land-Surface Temperature");

  //DESCRIPTION
  svgBoxHeatMap
    .append("text")
    .attr("id", "description")
    .attr("x", 50)
    .attr("y", 35)
    .style("font-size", "0.5rem")
    .html(
      firstYear +
        " - " +
        lastYear +
        ", " +
        " Base Temperature: " +
        d3.format("+.2f")(baseTemp) +
        "&#8451"
    );

  //LEGEND
  //Follow example from https://bl.ocks.org/mbostock/4573883

  var legendDomain = [];
  var tempRange = maxTemp - minTemp;
  var legendLength = col2.length;

  //loop to establish cutoffs for array
  for (let i = 1; i < legendLength; i++) {
    legendDomain.push(minTemp + i * (tempRange / legendLength));
  }


  //SCALE LEGEND
  var legendScale = d3.scaleLinear()
    .domain([minTemp, maxTemp])
    .range([0, 640]);

  //LEGEND AXIS ATTRIBUTES
  var legendAxis = d3.axisBottom(legendScale)
    .tickSize(10)
    .tickValues(legendDomain)
    .tickFormat(d3.format(".1f"));
  //PLACE LEGEND
  var legend = svgBoxHeatMap
    .append("g")
    .classed("legend", true)
    .attr("id", "legend")
    .attr("transform", "translate(340,220) rotate(270)");

  //DRAW LEGEND
  legend
    .append("g")
    .selectAll("rect")
    .data(
      quantColors.range().map(function(color) {

        //use invertExtent to find min and max for each color range.
        var d = quantColors.invertExtent(color);
        //if color at min range, will eual null, set domain min as this number.
        if (d[0] == null) d[0] = legendScale.domain()[0];
        /// if color at max range, will equal null for max, set domain max as this max.
        if (d[1] == null) d[1] = legendScale.domain()[1];

        return d;
      })
    )
    .enter()
    .append("rect")
    .style("fill", function(d, i) {

      return quantColors(d[0]);
    })
    .style("opacity", "0.9")
    .attr("x", function(d, i) {  return i * 10;  })
    .attr("y", 100)
    .attr("width", 10)
    .attr("height", 10);

  //DRAW LEGEND AXIS
  legend.enter()
    .append("g")
    .attr("transform", "translate(0,0) " )
    .call(legendAxis);

});
