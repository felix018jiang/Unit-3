window.onload = setMap();


//begin script when window loads
window.onload = setMap();

//Example 1.3 line 4...set up choropleth map
function setMap() {
    //use Promise.all to parallelize asynchronous data loading

    var promises = [
        d3.csv("data/lab2_data.csv"),
        d3.json("data/north_america.topojson"),
        d3.json("data/State_Boundaries.topojson"),
    ];

    Promise.all(promises).then(callback);

    function callback(data) {
        var csvData = data[0];
            na = data[1];
            us = data[2];
        var naCountries = topojson.feature(na, na.objects.naCountries),
            usRegions = topojson.feature(us, us.objects.usRegions);
    }
} 