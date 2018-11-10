class WorldMap {
    /**
     * Constructor for the Map
     */
    constructor(data, mappings) {
        this.countryData = data;
        this.mappings = mappings;
        this.projection = d3.geoEquirectangular().scale(125).translate([420, 190]);

    };


    /**
     * Renders the map
     * @param JSON data representing all countries
     */
    drawMap(world) {
        let _this = this;

        let features = topojson.feature(world, world.objects.countries)
            .features;
        let map = d3.select("#map");
        let path = d3.geoPath()
            .projection(this.projection);
        let graticule = d3.geoGraticule();

        map.selectAll("path")
            .data(features)
            .enter()
            .append("path")
            .attr("id", function(d) {
                return d.id;
            })
            .attr("d", path)
            .classed("countries", true);
        d3.select("#graticules")
            .append("path")
            .datum(graticule)
            .attr("d", path);

       // _this.drawLegend();
    }




}