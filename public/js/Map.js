

class CountryData {

    constructor(id, countryName, countryId, year, gold, silver, bronze, properties, geometry) {

       this.id = id;
       this.countryName = countryName;
       this.year = year;
       this.gold = gold;
       this.silver = silver;
       this.countryId = countryId;
       this.bronze = bronze;
       this.properties = properties;
       this.geometry = geometry;
    }
}


class WorldMap{

    constructor(yearAggregate, reverseMappings) {
        this.projection = d3.geoWinkel3().scale(140).translate([365, 225]);

        this.reverseMappings = reverseMappings;
        this.yearAggregate = yearAggregate;



    }


    drawMap(world, year) {


        let geojson = topojson.feature(world, world.objects.countries);
        // console.log(geojson.features);
        // console.log(this.populationData);
        //console.log(this.nameArray);
        let currentYearData = this.yearAggregate[year];
        //console.log(geojson.features)

        let countryData = geojson.features.map(country => {
            let countryID = this.reverseMappings[country.id.toLowerCase()];

            if(countryID && currentYearData[countryID]) {

                let gold = currentYearData[countryID.toUpperCase()]['medals']['gold']
                let silver = currentYearData[countryID.toUpperCase()]['medals']['silver']
                let bronze = currentYearData[countryID.toUpperCase()]['medals']['bronze']
                return new CountryData(country.id, "", this.reverseMappings[country.id], year, gold, silver, bronze, country.properties, country.geometry)
            }
            else {
                return new CountryData(country.id, "", "NA", year, 0, 0, 0, country.properties, country.geometry)

            }

        });

        //console.log(countryData)
        let path = d3.geoPath().projection(this.projection);
        let graticule = d3.geoGraticule();
        let svg = d3.select("#map-chart").append("svg");

        svg.attr("class", "countries boundary")
            .selectAll("path")
            .data(countryData)
            .enter().append("path")
            .attr("d", path)
            .attr("id", d => d.id)
            .attr("class", d => d.region)

        svg.append("path")
            .datum({type: "Sphere"})
            .attr("id", "sphere")
            .attr("d", path)
            .classed("stroke", true)



        svg.append("path")
            .datum(graticule)
            .classed("graticule", true)
            .attr("d", path);
    }

}