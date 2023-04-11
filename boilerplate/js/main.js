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
        console.log(us)
        var width = 960,
            height = 460;

        var map = d3
            .select("body")
            .append("svg")
            .attr("class", "map")
            .attr("width", width)
            .attr("height", height);

        // var projection = d3
        //     .geoAlbers()
        //     .center([0, 33.6])
        //     .rotate([81, 0, 0])
        //     .parallels([29.5, 45.5])
        //     .scale(1000)
        //     .translate([width / 2, height / 2]);
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
                return "regions " + d.properties.STATEFP;
            })
            .attr("d", path);


    }





}