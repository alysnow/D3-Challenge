// @TODO: YOUR CODE HERE!

// svg containers
var svgHeight = 600;
var svgWidth = 800;

// margins
var margin = {
  top: 50,
  right: 50,
  bottom: 100,
  left: 100,
};

// Define dimensions of the chart area
var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// create svg container
var svg = d3.select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

// shift everything over by the margins
var chartGroup = svg.append("g")
.attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "age";

// function used for updating x-scale var upon click on axis label
function xScale(censusdata, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(censusdata, d => d[chosenXAxis]) * 0.8,
      d3.max(censusdata, d => d[chosenXAxis]) * 1.2
    ])
    .range([0, width]);

  return xLinearScale;

}

// function used for updating xAxis var upon click on axis label
function renderAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, textGroup, newXScale, chosenXAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]));

  textGroup.transition()
    .duration(1000)
    .attr("dx", d => newXScale(d[chosenXAxis]));

  return circlesGroup;
}

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, circlesGroup, textGroup) {

  var label;

  if (chosenXAxis === "poverty") {
    label = "Poverty:";
  }
  else if (chosenXAxis === "age") {
    label = "Age:";
  }
  else {
    label = "Household Income:";
  }

  var toolTip = d3.tip()
    .attr("class", "tooltip")
    .offset([80, -60])
    .html(function(d) {
      return (`${d.state}<br>Smoking: ${d.smokes}<br>${label} ${d[chosenXAxis]}`);
    });

  circlesGroup.call(toolTip);

  circlesGroup.on("mouseover", function(data) {
    toolTip.show(data);
  })
    // onmouseout event
    .on("mouseout", function(data, index) {
      toolTip.hide(data);
    });

  return circlesGroup;
}

// Load data from hours-of-tv-watched.csv
d3.csv("data/data.csv").then(function(census) {
  
// Print the tvData
console.log(census);

// Cast the data from the csv as numbers
census.forEach(function(data) {
    data.smokes = +data.smokes;
    data.poverty = +data.poverty;
    data.age = +data.age;
    data.income = +data.income;
    
  });

// xLinearScale function above csv import
var xLinearScale = xScale(census, chosenXAxis);

// Create y scale function
var yLinearScale = d3.scaleLinear()
  .domain([0, d3.max(census, d => d.smokes)])
  .range([height, 0]);

// Create initial axis functions
var bottomAxis = d3.axisBottom(xLinearScale);
var leftAxis = d3.axisLeft(yLinearScale);

// append x axis
var xAxis = chartGroup.append("g")
  .classed("x-axis", true)
  .attr("transform", `translate(0, ${height})`)
  .call(bottomAxis);

// append y axis
chartGroup.append("g")
  .call(leftAxis);

// append initial circles
var circlesGroup = chartGroup.selectAll("circle.stateCircle")
  .data(census)
  .enter()
  .append("circle")
  .attr("class", "stateCircle")
  .attr("cx", d => xLinearScale(d[chosenXAxis]))
  .attr("cy", d => yLinearScale(d.smokes))
  .attr("r", 10)
  .attr("opacity", "1");

// append initial circles
var textGroup = chartGroup.selectAll("text.stateText")
  .data(census)
  .enter()
  .append("text")
  .attr("class","stateText")
  .text(d => d.abbr)
  .attr("dx", d => xLinearScale(d[chosenXAxis]))
  .attr("dy", d => yLinearScale(d.smokes))
  .style("font-size", "8px")

// Create group for two x-axis labels
var xlabelsGroup = chartGroup.append("g")
  .attr("transform", `translate(${width / 2}, ${height + 20})`);

var povertyLabel = xlabelsGroup.append("text")
  .attr("x", 0)
  .attr("y", 60)
  .attr("value", "poverty") // value to grab for event listener
  .classed("inactive", true)
  .text("In Poverty (%)"); 

var ageLengthLabel = xlabelsGroup.append("text")
  .attr("x", 0)
  .attr("y", 20)
  .attr("value", "age") // value to grab for event listener
  .classed("active", true)
  .text("Age (Median)");

var incomeLabel = xlabelsGroup.append("text")
  .attr("x", 0)
  .attr("y", 40)
  .attr("value", "income") // value to grab for event listener
  .classed("inactive", true)
  .text("Household Income (Median)");

// append y axis
chartGroup.append("text")
  .attr("transform", "rotate(-90)")
  .attr("y", 0 - margin.left)
  .attr("x", 0 - (height / 2))
  .attr("dy", "1em")
  .classed("axis-text", true)
  .text("Smokers (%)");

// updateToolTip function above csv import
var circlesGroup = updateToolTip(chosenXAxis, circlesGroup, textGroup);

// x axis labels event listener
xlabelsGroup.selectAll("text")
  .on("click", function() {
    // get value of selection
    var value = d3.select(this).attr("value");
    if (value !== chosenXAxis) {

      // replaces chosenXAxis with value
      chosenXAxis = value;

      console.log(chosenXAxis);

      // functions here found above csv import
      // updates x scale for new data
      xLinearScale = xScale(census, chosenXAxis);

      // updates x axis with transition
      xAxis = renderAxes(xLinearScale, xAxis);

      // updates circles with new x values
      circlesGroup = renderCircles(circlesGroup,textGroup, xLinearScale, chosenXAxis);

      // updates tooltips with new info
      circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

      // changes classes to change bold text
      console.log(chosenXAxis);
      if (chosenXAxis === "age") {
        ageLengthLabel
          .classed("active", true)
          .classed("inactive", false);
          incomeLabel
          .classed("active", false)
          .classed("inactive", true);
          povertyLabel
          .classed("active", false)
          .classed("inactive", true);
      }
      else if (chosenXAxis === "poverty") {
        povertyLabel
          .classed("active", true)
          .classed("inactive", false);
          incomeLabel
          .classed("active", false)
          .classed("inactive", true);
          ageLengthLabel
          .classed("active", false)
          .classed("inactive", true);
      }
      else {
        ageLengthLabel
          .classed("active", false)
          .classed("inactive", true);
          incomeLabel
          .classed("active", true)
          .classed("inactive", false);
          povertyLabel
          .classed("active", false)
          .classed("inactive", true);
      }
    }
  })
})
.catch(function(error) {
    console.log(error);
  });