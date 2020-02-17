// TO DO
// 1. fix tooltip location
//const w = window.innerHeight*0.8;

//sizing/scaling

const h = window.innerWidth*0.8;
var   orientation = (screenW>screenH ?"portrait":"landscape");
var screenH = window.screen.height;
var screenW = window.screen.width;;
var legendTransformByScreenSize;


function windowSize(){
  screenH = window.screen.height
  screenW = window.screen.width;
  orientation = (screenW>screenH ?"portrait":"landscape")
  var legendTranslateX = (orientation =="landscape")?550:100;
  var legendTranslateY = (orientation =="landscape")?150:100;
  legendTransformByScreenSize =
    ( orientation == "landscape" ?
    "translate(450,150) scale(0.6)" :
    "translate(400,200) scale(0.6)" )
  console.log("width: ",screenW)
  console.log("width: ",orientation)

}

windowSize();
window.addEventListener("resize",windowSize());

//
//


const EDUCATION_DATA = 'https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/for_user_education.json';
const COUNTY_DATA = 'https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/counties.json';

var tooltipChoro=d3.select(".choro")
  .append("div")
  .attr("id","tooltipChoro")
  .style("opacity",0)
  .style("transition","opacity 200ms ease-out")

// const tooltip = d3.tip()
//   .attr("class","d3-tip")
//   .attr("id","tooltip")
//   .style("transition","opacity 300ms ease-out")
//   .direction('s')
//   .offset([-100,-100])
//   .html((d) =>  d);


var svgBoxChoro = d3.select(".choro")
  .append("svg")
  .attr("preserveAspectRatio", "xMinYMin meet")
   .attr("viewBox", "0 0 "+500+" "+340+"")
   .classed("svg-content", true);



svgBoxChoro.append("text")
  .attr("id","title")
  .text("United States Educational Attainment")
  .attr("color","blue")
  .attr("x",40)
  .attr("y",40)
  .style("font-size","20px");

svgBoxChoro.append("text")
  .attr("id","description")
  .text("Percentage of adults age 25 and older with a bachelor's degree or higher (2010-2014)")
  .attr("x",40)
  .attr("y",70)
  .style("font-size", "10px")

// var tooltip = svgBox.append("div")
//   .attr("class","tooltip")
//   .attr("id","tooltip")
//   .style("opacity",0)

var path = d3.geoPath();

//x-axis (legend scale)




//use queue function to allow async calls to data
//ready function when 'ready'
d3.queue()
  .defer(d3.json, COUNTY_DATA)
  .defer(d3.json, EDUCATION_DATA)
  .await(ready);
//function that runs when all data loaded us,education based on data from json objects deferred in that order
function ready(e,us,education){
  if(e) throw e;

  // discover min/max ranges for % with bach or higher.
  var bachelors = education.map((o)=>{
    return o.bachelorsOrHigher;
  });
  var minBach = d3.min(bachelors);
  var maxBach = d3.max(bachelors);

  var x_scale = d3.scaleLinear()
  .domain([minBach,maxBach])
  .rangeRound([414,736])

  var color_scale = d3.scaleThreshold()
  .domain(d3.range(minBach,maxBach,(maxBach-minBach)/10))
  .range(d3.schemeYlGn[9])

var colorFunc =
      color_scale.range().map((d)=>{
        //invertExtent of color scale range
        d = color_scale.invertExtent(d);
        //set d[0] and d[1] as domain limits of xscale
        if (d[0] == null) d[0] = x_scale.domain()[0];
        if (d[1] == null) d[1] = x_scale.domain()[1];

        return d;
      })

  var fillSelector = (d)=>{
    var exists = education.filter((obj)=>{
      return obj.fips == d.id;
    });
    if(exists[0]){
      return color_scale(exists[0].bachelorsOrHigher);
    }
    else{
      return color_scale[0]
    }
  }

  //var legendTransformByScreenSize = ((orientation=="landscape")?"translate(550,150) scale(1)":"translate(350,200) scale(0.8)")


  svgBoxChoro.append('g')
    .attr("class","legendQuant")
    .attr("id","legend")
    .attr("transform",legendTransformByScreenSize)


      //   //

  var legend = d3.legendColor("#fff")
    .labelFormat(d3.format("0.0f"))
    .labels(d3.legendHelpers.thresholdLabels)
    .scale(color_scale)
    .ascending(true)

    svgBoxChoro.select(".legendQuant")
    .call(legend);




//screen is wide
//
//
let mapTransformByScreenSize =
  ( orientation == "portrait" ?
    "translate(110,50) scale(0.4)" :
    "translate(40,80) scale(0.4)" )
//mapTransformByScreenSize = "translate("+100+","+100+") scale(0.4)"
  //draw map
  svgBoxChoro.append('g')
    .attr("transform",mapTransformByScreenSize)

    .attr('class','counties')
    .selectAll("path")
  //data d is
    .data(topojson.feature(us,us.objects.counties).features)
    .enter().append("path")
    .attr("class","county")
    .attr("data-fips",(d)=>{
    return d.id;
   })
    .attr("data-education",function(d){
    var exists = education.filter((obj)=>{
      return obj.fips == d.id;
    });
    if(exists[0]){
      return exists[0].bachelorsOrHigher;
    }
    else{
    return 0;}})
    .attr("fill",fillSelector)
    .attr('d',path)
    .on("mousemove",(d)=>{
      var exists = education.filter((obj)=>{
        return obj.fips === d.id;
      });



      tooltipChoro
        .attr("data-education",exists[0].bachelorsOrHigher)
        .style("opacity",1)
        .style("left",event.offsetX+20+"px")
        .style("top",event.offsetY-50+"px" )
        .style("border", "10px "+ color_scale(exists[0].bachelorsOrHigher)+ " solid")
        .html(exists[0].area_name+": "+exists[0].bachelorsOrHigher+"%")
      })
     .on("mouseout",()=>{
 tooltipChoro
  .style("opacity",0)});


  //state borders
  svgBoxChoro.append("path")
    .datum(topojson.mesh(us, us.objects.states, function(border1, border2) { return border1 !== border2; }))
    .attr("class", "states")
    .attr("d", path)
    .attr("transform",mapTransformByScreenSize)


}
