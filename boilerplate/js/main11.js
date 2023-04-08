//begin script when window loads
window.onload = setMap();

//Example 1.3 line 4...set up choropleth map
function setMap() {
    //use Promise.all to parallelize asynchronous data loading

    //map frame dimensions
    var width = 960,
        height = 460;

    //create new svg container for the map
    var map = d3.select("body")
        .append("svg")
        .attr("class", "map")
        .attr("width", width)
        .attr("height", height);

    //create Albers equal area conic projection centered on France
    var projection = d3.geoAlbers()
        .center([8, 48.2])
        .rotate([-2, 0, 0])
        .parallels([43, 62])
        .scale(900)
        .translate([width / 2, height / 2]);

    var path = d3.geoPath()
        .projection(projection);

    //use Promise.all to parallelize asynchronous data loading
    var promises = [];    
    promises.push(d3.csv("data/europe_data.csv")); //load attributes from csv    
    promises.push(d3.json("data/EuropeCountries.topojson")); //load background spatial data    
    Promise.all(promises).then(callback);

    function callback(data) {

        var graticule = d3.geoGraticule()
            .step([5, 5]); //place graticule lines every 5 degrees of longitude and latitude

        //create graticule background
        // var gratBackground = map.append("path")
        //     .datum(graticule.outline()) //bind graticule background
        //     .attr("class", "gratBackground") //assign class for styling
        //     .attr("d", path) //project graticule

        // //Example 2.6 line 5...create graticule lines
        // var gratLines = map.selectAll(".gratLines") //select graticule elements that will be created
        //     .data(graticule.lines()) //bind graticule lines to each element to be created
        //     .enter() //create an element for each datum
        //     .append("path") //append each element to the svg as a path element
        //     .attr("class", "gratLines") //assign class for styling
        //     .attr("d", path); //project graticule lines

        var csvData = data[0],
            europe = data[1];
        console.log(csvData);
        console.log(europe);

        //translate europe TopoJSON
        var europeCountries = topojson.feature(europe, europe.objects.EuropeCountries);
        var europe = topojson.feature(europe, europe.objects.EuropeCountries).features;

        //examine the results
        //console.log(europeCountries);

        // add Europe countries to map
        var countries = map.append("path")
            .datum(europeCountries)
            .attr("class", "countries")
            .attr("d", path);
        var regions = map.selectAll(".regions")
            .data(europe)
            .enter()
            .append("path")
            .attr("class", function(d){
                return "regions " + d.properties.admin;
            })
            .attr("d", path);
        
        
    }
    
}