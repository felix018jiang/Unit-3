//usregion
//begin script when window loads
window.onload = setMap();
//pseudo-global variables
var attrArray = ["MedianHomePrice", "MedianRentPrice", "HomeValue", "AverageHomeValue"]; //list of attributes
var expressed = attrArray[0]; //initial attribute
//Example 1.3 line 4...set up choropleth map
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
        
        function joinData(franceRegions,csvData){
            //loop through csv to assign each set of csv attribute values to geojson region
                for (var i=0; i<csvData.length; i++){
                    var csvRegion = csvData[i]; //the current region
                    var csvKey = csvRegion.State; //the CSV primary key
    
                    //loop through geojson regions to find correct region
                    for (var a=0; a<franceRegions.length; a++){
    
                        var geojsonProps = franceRegions[a].properties; //the current region geojson properties
                        var geojsonKey = geojsonProps.NAME; //the geojson primary key
    
                        //where primary keys match, transfer csv data to geojson properties object
                        if (geojsonKey == csvKey){
    
                            //assign all attributes and values
                            attrArray.forEach(function(attr){
                                var val = parseFloat(csvRegion[attr]); //get csv attribute value
                                geojsonProps[attr] = val; //assign attribute and value to geojson properties
                            });
                        };
                    };
                };
                return franceRegions;
        }
        function makeColorScale(data){
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
            for (var i=0; i<data.length; i++){
                var val = parseFloat(data[i][expressed]);
                domainArray.push(val);
            };
    
            //assign array of expressed values as scale domain
            colorScale.domain(domainArray);
    
            return colorScale;
        }
    
        function setEnumerationUnits(usRegions,map,path,colorScale){
                //add France regions to map
                var regions = map.selectAll(".regions")
                    .data(usRegions)
                    .enter()
                    .append("path")
                    .attr("class", function(d){
                        //console.log(d)
                        return "regions " + d.properties.State;
                    })
                    .attr("d", path)
                    .style("fill", function(d){
                        console.log(d.properties)
                        return colorScale(d.properties[expressed]);
                    });
        }
    }
    
}
function makeColorScale(data){
    var colorClasses = [
        "#D4B9DA",
        "#C994C7",
        "#DF65B0",
        "#DD1C77",
        "#980043"
    ];

    //create color scale generator
    var colorScale = d3.scaleThreshold()
        .range(colorClasses);

    //build array of all values of the expressed attribute
    var domainArray = [];
    for (var i=0; i<data.length; i++){
        var val = parseFloat(data[i][expressed]);
        domainArray.push(val);
    };

    //cluster data using ckmeans clustering algorithm to create natural breaks
    var clusters = ss.ckmeans(domainArray, 5);
    //reset domain array to cluster minimums
    domainArray = clusters.map(function(d){
        return d3.min(d);
    });
    //remove first value from domain array to create class breakpoints
    domainArray.shift();

    //assign array of last 4 cluster minimums as domain
    colorScale.domain(domainArray);

    return colorScale;
    
};
//Example 1.3 line 38


//translate europe and France TopoJSONs
// var naCountries = topojson.feature(naCountries, naCountries.objects.naCountries).features,
//     usRegions = topojson.feature(us, us.objects.FranceRegions).features;

//variables for data join

    //loop through csv to assign each set of csv attribute values to geojson region
