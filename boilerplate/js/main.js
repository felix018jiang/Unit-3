//begin script when window loads
window.onload = setMap();
//pseudo-global variables
var attrArray = ["MedianHomePrice", "MedianRentPrice", "HomeValue", "AverageHomeValue"]; //list of attributes
var expressed = attrArray[0]; //initial attribute
// var yScale = d3.scaleLinear().range([463, 0]).domain([0, 110]);
//Example 1.3 line 4...set up choropleth map
var yScale = d3.scaleLinear().range([463, 0]).domain([0, 843800]);
var chartWidth = window.innerWidth * 0.425,
    chartHeight = 473,
    leftPadding = 25,
    rightPadding = 2,
    topBottomPadding = 5,
    chartInnerWidth = chartWidth - leftPadding - rightPadding,
    chartInnerHeight = chartHeight - topBottomPadding * 2,
    translate = "translate(" + leftPadding + "," + topBottomPadding + ")";
function makeColorScale(data) {
    var colorClasses = [
        "#D4B9DA",
        "#C994C7",
        "#DF65B0",
        "#DD1C77",
        "#980043"
    ];

    //create color scale generator
    var colorScale = d3.scaleQuantile()
        .range(colorClasses);

    //build array of all values of the expressed attribute
    var domainArray = [];
    for (var i = 0; i < data.length; i++) {
        var val = parseFloat(data[i][expressed]);
        domainArray.push(val);
    };

    //assign array of expressed values as scale domain
    colorScale.domain(domainArray);

    return colorScale;
}
function setMap() {
    //map frame dimensions
    var promises = [
        d3.csv("data/lab2_data_changed.csv"),
        d3.json("data/north_america.topojson"),
        d3.json("data/State_Boundaries.topojson"),
    ];

    Promise.all(promises).then(callback);

    function callback(data) {
        var csvData = data[0],
            na = data[1],
            us = data[2];

        console.log(na)
        console.log(us)
        var width = 960,
            height = 460;

        var map = d3
            .select("body")
            .append("svg")
            .attr("class", "map")
            .attr("width", width)
            .attr("height", height);

        // set up projection of the map
        var projection = d3
            .geoAlbers()
            .center([0.00, 29.96])

            .rotate([99.18, -9.09, 0])

            .parallels([30.86, 45.5])

            .scale(755.56)

            .translate([width / 2, height / 2]);
        var path = d3.geoPath()
            .projection(projection);

        var naCountries = topojson.feature(na, na.objects.State_Boundaries),
            usRegions = topojson.feature(us, us.objects.State_Boundaries).features;

        //console.log(usRegions)
        //translate na TopoJSON
        //add Europe countries to map
        var graticule = d3.geoGraticule()
            .step([5, 5]); //place graticule lines every 5 degrees of longitude and latitude

        //create graticule background
        var gratBackground = map.append("path")
            .datum(graticule.outline()) //bind graticule background
            .attr("class", "gratBackground") //assign class for styling
            .attr("d", path) //project graticule

        //Example 2.6 line 5...create graticule lines
        var gratLines = map.selectAll(".gratLines") //select graticule elements that will be created
            .data(graticule.lines()) //bind graticule lines to each element to be created
            .enter() //create an element for each datum
            .append("path") //append each element to the svg as a path element
            .attr("class", "gratLines") //assign class for styling
            .attr("d", path); //project graticule lines

        map.append("path")
            .datum(naCountries)
            .attr("class", "countries")
            .attr("d", path);
        //join csv data to GeoJSON enumeration units
        usRegions = joinData(usRegions, csvData);

        var colorScale = makeColorScale(csvData);

        console.log(usRegions)
        //add enumeration units to the map
        setEnumerationUnits(usRegions, map, path, colorScale);

        function joinData(franceRegions, csvData) {
            //loop through csv to assign each set of csv attribute values to geojson region
            for (var i = 0; i < csvData.length; i++) {
                var csvRegion = csvData[i]; //the current region
                var csvKey = csvRegion.State_Name; //the CSV primary key

                //loop through geojson regions to find correct region
                for (var a = 0; a < franceRegions.length; a++) {

                    var geojsonProps = franceRegions[a].properties; //the current region geojson properties
                    var geojsonKey = geojsonProps.NAME; //the geojson primary key

                    //where primary keys match, transfer csv data to geojson properties object
                    if (geojsonKey == csvKey) {

                        //assign all attributes and values
                        attrArray.forEach(function (attr) {
                            var val = parseFloat(csvRegion[attr]); //get csv attribute value
                            geojsonProps[attr] = val; //assign attribute and value to geojson properties
                        });
                    };
                };
            };
            return franceRegions;
        }


        function setEnumerationUnits(usRegions, map, path, colorScale) {
            //add France regions to map
            var regions = map.selectAll(".regions")
                .data(usRegions)
                .enter()
                .append("path")
                .attr("class", function (d) {
                    return "regions " + d.properties.State;
                })
                .attr("d", path)
                .style("fill", function (d) {
                    var value = d.properties[expressed];
                    if (value) {
                        return colorScale(d.properties[expressed]);
                    } else {
                        return "#ccc";
                    }
                })
                .on("mouseover", function (event, d) {
                    highlight(d.properties);
                })
                .on("mouseout", function (event, d) {
                    dehighlight(d.properties);
                })
                .on("mousemove", moveLabel);
            var desc = regions.append("desc").text('{"stroke": "#000", "stroke-width": "0.5px"}');

        }
        setChart(csvData, colorScale);
        createDropdown(csvData);
    }

}
//function to highlight enumeration units and bars
function highlight(props) {
    //change stroke
    var selected = d3.selectAll("." + props.State)
        .style("stroke", "blue")
        .style("stroke-width", "2");
    setLabel(props)
};

//function to create coordinated bar chart
function setChart(csvData, colorScale) {
    //chart frame dimensions
    var chartWidth = window.innerWidth * 0.435,
        chartHeight = 460;
    leftPadding = 25,
        rightPadding = 2,
        topBottomPadding = 5,
        chartInnerWidth = chartWidth - leftPadding - rightPadding,
        chartInnerHeight = chartHeight - topBottomPadding * 2,
        translate = "translate(" + leftPadding + "," + topBottomPadding + ")";

    //create a second svg element to hold the bar chart
    var chart = d3.select("body")
        .append("svg")
        .attr("width", chartWidth)
        .attr("height", chartHeight)
        .attr("class", "chart");

    //create a scale to size bars proportionally to frame
    var yScale = d3.scaleLinear()
        .range([0, chartHeight])
        .domain([0, 900000]);


    //Example 2.4 line 8...set bars for each province
    var bars = chart.selectAll(".bars")
        .data(csvData)
        .enter()
        .append("rect")
        .sort(function (a, b) {
            return b[expressed] - a[expressed]
        })
        .attr("class", function (d) {
            return "bars " + d.State;
        })
        .attr("width", chartWidth / csvData.length - 1)
        .on("mouseover", function (event, d) {
            highlight(d);
        })
        .on("mouseout", function (event, d) {
            dehighlight(d);
        })
        .attr("x", function (d, i) {
            return i * (chartWidth / csvData.length);
        })
        .attr("height", function (d) {
            return yScale(parseFloat(d[expressed]));
        })
        .attr("y", function (d) {
            return chartHeight - yScale(parseFloat(d[expressed]));
        }).style("fill", function (d) {
            return colorScale(d[expressed]);
        })
        .on("mousemove", moveLabel);


    //create a text element for the chart title
    var chartTitle = chart
        .append("text")
        .attr("x", 40)
        .attr("y", 40)
        .attr("class", "chartTitle");

    updateChart(bars, csvData.length, colorScale);
};

//function to create a dropdown menu for attribute selection
function createDropdown(csvData) {
    //add select element
    var dropdown = d3.select("body")
        .append("select")
        .attr("class", "dropdown")
        .on("change", function () {
            console.log(this.value)
            changeAttribute(this.value, csvData)
        });


    //add initial option
    var titleOption = dropdown
        .append("option")
        .attr("class", "titleOption")
        .attr("disabled", "true")
        .text("Select Attribute");

    //add attribute name options
    var attrOptions = dropdown
        .selectAll("attrOptions")
        .data(attrArray)
        .enter()
        .append("option")
        .attr("value", function (d) {
            return d;
        })
        .text(function (d) {
            return d;
        });
};

//Example 2.8 line 1...function to move info label with mouse
function moveLabel() {
    //get width of label
    var labelWidth = d3.select(".infolabel")
        .node()
        .getBoundingClientRect()
        .width;

    //use coordinates of mousemove event to set label coordinates
    var x1 = event.clientX + 10,
        y1 = event.clientY - 75,
        x2 = event.clientX - labelWidth - 10,
        y2 = event.clientY + 25;

    //horizontal label coordinate, testing for overflow
    var x = event.clientX > window.innerWidth - labelWidth - 20 ? x2 : x1;
    //vertical label coordinate, testing for overflow
    var y = event.clientY < 75 ? y2 : y1;

    d3.select(".infolabel")
        .style("left", x + "px")
        .style("top", y + "px");
};

//Example 1.4 line 14...dropdown change event handler
//Example 1.4 line 14...dropdown change event handler
function changeAttribute(attribute, csvData) {
    //change the expressed attribute
    expressed = attribute;

    //recreate the color scale
    var colorScale = makeColorScale(csvData);

    //recolor enumeration units
    var regions = d3.selectAll(".regions")
        .transition()
        .duration(1000)
        .style("fill", function (d) {
            var value = d.properties[expressed];
            if (value) {
                return colorScale(value);
            } else {
                return "#ccc";
            }
        });

    var domainArray = [];
    for (var i = 0; i < csvData.length; i++) {
        var val = parseFloat(csvData[i][expressed]);
        domainArray.push(val);
    };
    var max = d3.max(domainArray);

    yScale = d3.scaleLinear().range([463, 0]).domain([0, max]);
    //Sort, resize, and recolor bars
    var bars = d3.selectAll(".bars")

        //Sort bars
        .sort(function (a, b) {
            return b[expressed] - a[expressed];
        })
        .transition() //add animation
        .delay(function (d, i) {
            return i * 20
        })
        .duration(500)
        .attr("x", function (d, i) {
            return i * (chartInnerWidth / csvData.length) + leftPadding;
        })
        //resize bars
        .attr("height", function (d, i) {
            return 463 - yScale(parseFloat(d[expressed]));
        })
        .attr("y", function (d, i) {
            return yScale(parseFloat(d[expressed])) + topBottomPadding;
        })

        //recolor bars
        .style("fill", function (d) {
            var value = d[expressed];
            if (value) {
                return colorScale(value);
            } else {
                return "#ccc";
            }

        });
};

//function to reset the element style on mouseout
function dehighlight(props) {
    var selected = d3
        .selectAll("." + props.State)
        .style("stroke", function () {
            return getStyle(this, "stroke");
        })
        .style("stroke-width", function () {
            return getStyle(this, "stroke-width");
        });

    function getStyle(element, styleName) {
        var styleText = d3.select(element).select("desc").text();

        var styleObject = JSON.parse(styleText);

        return styleObject[styleName];
    }
    //remove info label
    d3.select(".infolabel").remove();
}

function updateChart(bars, n, colorScale) {

    //position bars
    bars.attr("x", function (d, i) {
        return i * (chartInnerWidth / n) + leftPadding;
    })
        //size/resize bars
        .transition()
        .duration(1000)
        .attr("height", function (d, i) {
            return 463 - yScale(parseFloat(d[expressed]));
        })
        .attr("y", function (d, i) {
            return yScale(parseFloat(d[expressed])) + topBottomPadding;
        })
        //color/recolor bars
        .style("fill", function (d) {
            var value = d[expressed];
            if (value) {
                return colorScale(value);
            } else {
                return "#ccc";
            }

        });
    //at the bottom of updateChart()...add text to chart title
    var chartTitle = d3.select(".chartTitle")
        .select(".chartTitle")
        .text("Number of Variable " + expressed[3] + " in each region");

};

function setLabel(props) {
    //label content
    var labelAttribute = "<h1>" + props[expressed] +
        "</h1><b>" + expressed + "</b>";

    //create info label div
    var infolabel = d3.select("body")
        .append("div")
        .attr("class", "infolabel")
        .attr("id", props.adm1_code + "_label")
        .html(labelAttribute);

    var regionName = infolabel.append("div")
        .attr("class", "labelname")
        .html(props.name);
};