const width = 860;
const height = 500;

// const tooltip = d3.select("#barGraph").append("div")
//   .attr("id","tooltip")
//   .style(opacity,0);

const tooltipScatter = d3
  .select(".scatterPlot")
  .append("div")
  .attr("id", "tooltipScatter")
  .style("opacity", 0)
  .style("transition", "opacity 400ms ease");

const svgBoxScatter = d3
  .select(".scatterPlot")
  .append("svg")
  // .attr("width", width + 200)
  // .attr("height", height + 250)
  .attr("preserveAspectRatio", "xMinYMin meet")
  .attr("viewBox", "0 0 "+500+" "+340+"")
//  .attr("transform","translate(50,0)")
  .classed("svg-content", true)
  // .append("g")
  // .attr("transform", "translate(80,60)");
//
// const tooltipScatter = d3
//   .select(".scatterPlot")
//   .append("div")
//   .attr("id", "tooltipScatter")
//   .style("opacity", 0)
//   .style("transition", "opacity 400ms ease");
//
//Create Scales
const x_scale = d3.scaleLinear().range([0, 500]);
const y_scale = d3.scaleTime().range([0, 340]);
//console.log("x_scale:         ",x_scale)
const x_axis = d3
  .axisBottom()
  .scale(x_scale)
  .tickFormat(d3.format("d"))

const y_format = d3.timeFormat("%M:%S");
const y_axis = d3
  .axisLeft()
  .scale(y_scale)
  .tickFormat(y_format);

//      var xAxisGroup = svgBoxScatter.append('g')
//      .call(x_axis)
//      .attr('id', 'x-axis')
//      .attr('transform', 'translate(80, 430)');

//      var yAxisGroup = svgBoxScatter.append('g')
//      .call(y_axis)
//      .attr('id', 'y-axis')
//      .attr('transform', 'translate(80, 30)');
//Append rects to SVG

var color = d3.scaleOrdinal(d3.schemeCategory10);

d3.json(
  "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json",
  function(error, data) {
    if (error) throw error;
    data.forEach(d => {
      //parse time
      var parsedTime = d.Time.split(":");
      d.Time = new Date(Date.UTC(1970, 0, 1, 0, parsedTime[0], parsedTime[1]));
    });
    //set x_axis domain based on Years +- 1 for margin scaled to width range
    x_scale.domain([
      d3.min(data, d => d.Year - 1),
      d3.max(data, d => d.Year + 1)
    ]);
    //set y_axis domain based on range of Time in d scaled to height range
    y_scale.domain(d3.extent(data, d => d.Time));

    //append groups to svgBoxScatter element

    //x-axis-group
    svgBoxScatter
      .append("g")
      .attr("class", "x-axis")
      .attr("id", "x-axis")
      .attr("transform", "translate( 50,306) scale(0.8)")
      .call(x_axis)
      .append("text")
      .attr("class", "x-axis-title")
      .attr("x", width)
      .attr("y", -6)
      .style("text-anchor", "end")
      .text("Year");

    //y-axis-group
    svgBoxScatter
      .append("g")
      .attr("class", "y-axis")
      .attr("id", "y-axis")
      .attr("transform", "translate(50,34) scale(0.8)")
      .call(y_axis)
      .append("text")
      .attr("class", "y-axis-title")
      .attr("y", 6)
      .attr("dy", "0.5em")
      .style("text-anchor", "end");

    //y-axis-label
    svgBoxScatter
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -20)
      .attr("y", -10)
      .style("font-size", 18)
      .text("Time in Minutes");

    //main-title
    svgBoxScatter
      .append("text")
      .attr("id", "title")
      .attr("x", 216)
      .attr("y", 30)
      .style("font-size", "0.8em")
      .text("Doping in Professional Bicycle Racing");

    svgBoxScatter
      .append("text")
      .attr("id", "title")
      .attr("x", 250)
      .attr("y", 55)
      .style("font-size", "0.57em")
      .text("35 Fastest times up Alpe d'Huez");

    svgBoxScatter
      .selectAll(".dot")
      .data(data)
      .enter()
      .append("circle")
      .attr("class", "dot")
      .attr("cx", d => x_scale(d.Year)+65)
      .attr("cy", d => y_scale(d.Time)+40)
      .attr("r", 7)
      .attr("data-xvalue", d => d.Year)
      .attr("data-yvalue", d => d.Time.toISOString())
      .attr("transform","scale(0.8)")
      .style("fill", d => {
        return color(d.Doping != "");
      })
      .on("mouseover", d => {
        // svgBoxScatter.select(d.event).style("fill", (d)=>{
        //   return "red";

// var dTimeparse = d3.utcParse("%M:%S");
// var timeFormat = d3.timeFormat("%M:%S")
// var dTime = timeFormat(d.Time)
        tooltipScatter
          .style("opacity", 0.9)
              .style("z-index", 2000)
          .attr("data-year", d.Year)
          .html(
          "  "+d.Name +  ", " +  d.Nationality +" " +
              "<br/>" + d.Year + ", " +

              (d.Doping ? "<br/><br/>" + d.Doping : "")
          )
          .style("border", "5px " + color(d.Doping != "") + " solid")
          .style("left", event.offsetX-60 + "px" )
          .style("top", event.offsetY -120+"px");
      })
      .on("mouseout", d => {
        tooltipScatter.style("opacity", 0);
        tooltipScatter.style("z-index", -1);
      });

    const legend = svgBoxScatter
      .selectAll("legend")
      .data(color.domain())
      .enter()
      .append("g")
      .attr("id", "legend")
      .attr("class", "legend")
      .attr("transform", (d, i) => {
        return "translate(50," + i * 28 + "), scale(0.8)";
      });

    legend
      .append("rect")
      .attr("x", 515)
      .attr("y", 100)
      .attr("width", 18)
      .attr("height", 18)
      .style("fill", color);

    legend
      .append("text")
      .attr("x",495)
      .attr("y", 110)
      .attr("dy", "0.35em")
      .style("font-size", "12")
      .style("text-anchor", "end")
      .text(d => {
        if (d) {
          return "With Doping Allegations";
        } else {
          return "No Doping Allegations";
        }
      });
  }
);
