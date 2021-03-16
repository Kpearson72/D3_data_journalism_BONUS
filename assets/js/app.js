// Bonus - D3 data journalism

// remove and replace svg after each pick
// ==============================
var svgArea = d3.select("body").select("svg");

// Clear SVG is Not Empty
// ==============================
if (!svgArea.empty()) {
    svgArea.remove();
}

var svgWidth = 980;
var svgHeight = 600;

var margin = {
    top: 20,
    right: 20,
    bottom: 100,
    left: 110
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart, and shift the latter by left and top margins.
// ==============================
var svg = d3.select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

// set chartGroup with appending group elements and setting margins
// ==============================
var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
// ==============================

var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";

// function used for updating x-scale upon click on axis label        
// ==============================
function xScale(censusData, chosenXAxis) {
    // create scales
    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(censusData, d => d[chosenXAxis])-1,
        d3.max(censusData, d => d[chosenXAxis])+ 2
        ])
        .range([0, width]);
    return xLinearScale;
}

// function used for updating y-scale var upon click on axis label        
// ==============================
function yScale(censusData, chosenYAxis,) {
    var yLinearScale = d3.scaleLinear()
        .domain([d3.min(censusData, d=> d[chosenYAxis]) -.4,
        d3.max(censusData, d=> d[chosenYAxis])+2
        ])
        .range([height,0]);
    return yLinearScale;
}

// function used for updating xAxis var upon click on axis Label
// ==============================
function renderXAxis(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);

    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);

    return xAxis;
}

// function used for updating yAxis var upon click on axis label
// ==============================
function renderYAxes(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);

        yAxis.transition()
            .duration(1000)
            .call(leftAxis);
            
        return yAxis;
}
// function used for updating circles group to new
// ==============================
function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {
    circlesGroup.transition()
        .duration(1000)
        .attr("cx", d => newXScale(d[chosenXAxis]))
        .attr("cy", d => newYScale(d[chosenYAxis]));
    return circlesGroup;
}

// function used for updating text group to new
// ==============================
function renderText(textGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

    textGroup.transition()
        .duration(1000)
        .attr("x", d => newXScale(d[chosenXAxis]))
        .attr("y", d => newYScale(d[chosenYAxis]))
        .attr("text-anchor", "middle");
    return textGroup;
}

// function to update circle group using Tooltip
// ==============================
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, textGroup) {
    //===========================// xLabels - whatever the user choses
    if (chosenXAxis === "poverty") {
        var xLabel = "Poverty (%)";
    }
    else if (chosenXAxis === "age") {
        var xLabel = "Age (Median)";
    }

    //===========================// yLabels - whatever the user choses
    if (chosenYAxis === "healthcare") {
        var yLabel = "Lacks Healthcare (%)";
    }
    else if (chosenYAxis === "smokes") {
        var yLabel = "Smokes (%)";
    }


    // Initialize tool tip
    // ==============================
    var toolTip = d3.tip()
        // .classed("tooltip", true)
        // .classed("d3-tip",true)
        .attr("class", "tooltip d3-tip")
        .offset([80, 80])
        .html(function (d) {
            return (`<strong>${d.state}</strong><br>${xLabel} ${d[chosenXAxis]}<br>${yLabel} ${d[chosenYAxis]}`);
        });
    // Create Circles 
    circlesGroup.call(toolTip);
    // event listeners to display and hide the tooltip
    circlesGroup.on("mouseover", function (data) {
        toolTip.show(data, this);
    })
        // mouseout Event
        .on("mouseout", function (data) {
            toolTip.hide(data);
        });
    
    
    // create text tooltip
    textGroup.call(toolTip);
    // event listeners to display and hide the tooltip
    textGroup.on("mouseover", function (data){
        toolTip.show(data,this);
    })
        //mouseout event
        .on("mouseout",function(data){
            toolTip.hide(data);
        });

    return circlesGroup;


}
// Import Data
// ==============================
d3.csv("assets/data/data.csv")
    .then(function (censusData) {
    
        // Parse Data/Cast as numbers
        // ==============================
        censusData.forEach(function (data) {
            data.poverty = +data.poverty;
            data.healthcare = +data.healthcare;
            data.age = +data.age;
            data.smokes = +data.smokes;

        });
        console.log(censusData);

        // xLinearScale function above csv import
        // ==============================       
        var xLinearScale = xScale(censusData, chosenXAxis);

        var yLinearScale = yScale(censusData, chosenYAxis);
        // Create axis functions
        // ==============================
        var bottomAxis = d3.axisBottom(xLinearScale);
        var leftAxis = d3.axisLeft(yLinearScale);

        // Append Axes to the chart
        // ==============================
        // x-axis
        var xAxis = chartGroup.append("g")
            .classed("x-axis", true)
            .attr("transform", `translate(0, ${height})`)
            .call(bottomAxis);
        // y-axis
        var yAxis = chartGroup.append("g")
            .classed("y-axis",true)
            .call(leftAxis);

        // Create Circles
        // ==============================
        var circlesGroup = chartGroup.selectAll(".stateCircle")
            .data(censusData)
            .enter()
            .append("circle")
            .attr("cx", d => xLinearScale(d[chosenXAxis]))
            .attr("cy", d => yLinearScale(d[chosenYAxis]))
            .attr("opacity", ".9")
            .attr("r", "13")
            .classed("stateCircle", true);
        console.log(circlesGroup);

        // Append text to circles
        // ==============================
        var textGroup = chartGroup.selectAll(".stateText")
            .data(censusData)
            .enter()
            .append("text")
            .attr("x", d => xLinearScale(d[chosenXAxis]))
            .attr("y", d => yLinearScale(d[chosenYAxis]))
            .text(d => (d.abbr))
            .classed("stateText", true)
            .attr("font-size", "12px")
            .attr("text-anchor", "center")
            .attr("fill", "white");   
        console.log(textGroup);
    
        // Create Group of 3 xAxis Labels
        // ==============================
        var xLabelsGroup = chartGroup.append("g")
            .attr("transform", `translate(${width / 2}, ${height + 20})`);

        // Create axes labels for x
        // ==============================
        var povertyLabel = xLabelsGroup.append("text")
            .attr("x", 0)
            .attr("y", 20)
            .attr("value", "poverty") // value to grab for event listener
            .classed("active", true)
            .text("In Poverty (%)");

        var ageLabel = xLabelsGroup.append("text")
            .attr("x", 0)
            .attr("y", 40)
            .attr("value", "age") // value to grab for event listener
            .classed("inactive", true)
            .text("Age (Median)");

        // Create Group of 3 yAxis Labels
        // ==============================
        var labelsYGroup = chartGroup.append("g")
            .attr("transform", `translate(-25, ${height / 2})`);

        // Create axes labels for y
        // ==============================
        var healthLabel = labelsYGroup.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", - 30)
            .attr("x",  0)
            .classed("active", true)
            .classed("axis-text", true)
            .attr("value", "healthcare") // value to grab for event listener
            .attr("dy", "1em")
            .text("Lacks Healthcare (%)");

        var smokesLabel = labelsYGroup.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", -50)
            .attr("x", 0)
            .classed("inactive", true)
            .attr("value", "smokes") // value to grab for event listener
            .classed("axis-text", true)
            .text("Smokes (%)")
            .attr("dy", "1em");

        // updateToolTip function above csv import
        // ==============================
        var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis,circlesGroup,textGroup);

        // event listeners
        // ==============================
        xLabelsGroup.selectAll("text")
            .on("click",function(){
                var value = d3.select(this).attr("value");
                // replace and update values, scale, axis, circles, text and tootltip
                if (value !== chosenXAxis) {
                    chosenXAxis = value;
                    xLinearScale = xScale(censusData, chosenXAxis);
                    xAxis = renderXAxis(xLinearScale, xAxis);
                    circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
                    textGroup = renderText(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis)
                    circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, textGroup);
                if (chosenXAxis === "poverty") {
                    povertyLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    ageLabel
                        .classed("active", false)
                        .classed("inactive", true);

                }
                else if (chosenXAxis === "age"){
                    povertyLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    ageLabel
                        .classed("active", true)
                        .classed("inactive", false);

                }
                else {
                    povertyLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    ageLabel
                        .classed("active", false)
                        .classed("inactive", true);

                }
            }      
        });      
        console.log(xLabelsGroup);
        labelsYGroup.selectAll("text")
            .on("click",function(){
                var value = d3.select(this).attr("value");
                // replace and update values, scale, axis, circles, text and tootltip
                if (value !== chosenYAxis) {
                    chosenYAxis = value;
                    yLinearScale = yScale(censusData, chosenYAxis);
                    yAxis = renderYAxes(yLinearScale, yAxis);
                    circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
                    textGroup = renderText(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis)
                    circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, textGroup);
                if (chosenYAxis === "healthcare") {
                    healthLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    smokeslabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else if (chosenYAxis === "obesity"){
                    healthLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    smokesLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else {
                    healthLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    smokesLabel
                        .classed("active", true)
                        .classed("inactive", false);
                }
            }
            
        });      
});
