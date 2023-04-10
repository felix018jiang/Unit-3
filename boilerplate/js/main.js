//usregion
//begin script when window loads
window.onload = setMap();
//Example 1.3 line 4...set up choropleth map
function setMap() {
    //map frame dimensions
    var promises = [
        d3.csv("data/lab2_data.csv"),
        d3.json("data/north_america.topojson"),
        d3.json("data/State_Boundaries.topojson"),
    ];

    Promise.all(promises).then(callback);

    function callback(data) {
        var csvData = data[0],
            na = data[1],
            us = data[2];

            console.log(na)
            console.log(na)
        var width = 960,
            height = 460;

        var map = d3
        .select("body")
        .append("svg")
        .attr("class", "map")
        .attr("width", width)
        .attr("height", height);

        var projection = d3
        .geoAlbers()
        .center([0, 46.2])
        .rotate([-2, 0, 0])
        .parallels([43, 62])
        .scale(2500)
        .translate([width / 2, height / 2]);
        
        var naCountries = topojson.feature(na, na.objects.State_Boundaries),
        usRegions = topojson.feature(us, us.objects.State_Boundaries);

        var regions = map
            .selectAll(".regions")
            .data(usRegions)
            .enter()
            .append("path")
            .attr("class", function (d) {
                return "regions " + d.properties.adm1_code;
            })
            .attr("d", path);

        //translate na TopoJSON
        
        var countries = map.append("path")
            .datum(usRegions)
            .attr("class", "countries")
            .attr("d", path);


        //add Europe countries to map
        var regions = map
            .selectAll(".regions")
            .data(usRegions)
            .enter()
            .append("path")
            .attr("class", function (d) {
                return "regions " + d.properties.adm1_code;
            })
            .attr("d", path);


    }

    

    //create new svg container for the map
    

    //create Albers equal area conic projection centered on France
    
    // var path = d3.geoPath().projection(projection);

    //use Promise.all to parallelize asynchronous data loading


    



}