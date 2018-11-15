class CountryData {

    constructor(type, mapId, countryId, countryName, region, properties, geometry) {
        this.type = type;
        this.mapId = mapId;
        this.countryId = countryId;
        this.countryName = countryName;
        this.region = region;
        this.properties = properties;
        this.geometry = geometry;
    }
}

class WorldMap {
    /**
     * Constructor for the Map
     */
    constructor(data, mappings, defaultYear) {
        this.countryData = data;
        this.mappings = mappings;
        this.projection = d3.geoEquirectangular().scale(125).translate([420, 190]);
        this.year = defaultYear;

    };


    /**
     * Renders the map
     * @param JSON data representing all countries
     */
    drawMap(world) {
        let _this = this;

        let geojson = topojson.feature(world, world.objects.countries).features;
         console.log(geojson)


        let countryData = geojson.map(country => {
            let countryId = this.mappings['reverseCountryIdMap'][country.id];
            let countryName = null;
            let region = null;
            if(countryId) {
                countryName = this.mappings['countryIdToName'][countryId];
                region = this.mappings['regionMap'][countryId];
                return new CountryData(country.type,country.id, countryId, countryName, region, country.properties, country.geometry)

            }
            else {
                return new CountryData(country.id, null, null, null, country.properties, country.geometry)

            }
        });

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

        d3.select('#map-chart')
            .append('div').attr('id', 'activeYear-bar');



        svg.append("path")
            .datum(graticule)
            .classed("graticule", true)
            .attr("d", path);
        this.drawYearBar()

        // _this.drawLegend();
    }



    drawYearBar() {


        let that = this;

        let yearScale = d3.scaleLinear().domain([1800, 2020]).range([30, 730]);

        let yearSlider = d3.select('#activeYear-bar')
            .append('div').classed('slider-wrap', true)
            .append('input').classed('slider', true)
            .attr('type', 'range')
            .attr('min', 1800)
            .attr('max', 2020)
            .attr('value', this.activeYear);

        let sliderLabel = d3.select('.slider-wrap')
            .append('div').classed('slider-label', true)
            .append('svg');

        let sliderText = sliderLabel.append('text').text(this.year);

        sliderText.attr('x', yearScale(this.year));
        sliderText.attr('y', 25);
        let self = this;
        yearSlider.on('input', function() {
            self.activeYear = this.value;
            that.updatePlot(this.value, d3.select("#dropdown_x_val").node().value, d3.select("#dropdown_y_val").node().value,d3.select("#dropdown_c_val").node().value);
            sliderText.attr('x', yearScale(this.value));
            sliderText.text(this.value)
            that.updateYear(this.value);
        })
        yearSlider.on('click', function() {
            d3.event.stopPropagation();
        });
    }




}