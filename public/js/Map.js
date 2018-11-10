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

    updateMap(vizData, year) {
        let _this = this;
        let markers, newCircle;

        let mapData = [];
        mapData.meteors = vizData.meteors.filter(function(d) {
            let datetime = d.year.split(" ");
            let date = datetime[0].split("/");
            let dYear = date[2];
            if (dYear === year) return d;
        });
        mapData.fireballs = vizData.fireballs.filter(function(d) {
            let datetime = d["Peak Brightness Date/Time (UT)"].split(" ");
            let date = datetime[0].split("-");
            let dYear = date[0];
            if (dYear === year) return d;
        });
        mapData.futureEvents = vizData.futureEvents;

        if(mapData.meteors){

            markers = _this.meteors.selectAll(".meteors").data(mapData.meteors);
            newCircle = markers.enter().append("circle");

            markers.exit().remove();
            markers = newCircle.merge(markers);

            markers.attr("cx", function (d) {
                return _this.projection([d.reclong, d.reclat])[0];
            })
                .attr("cy", function (d) {
                    return _this.projection([d.reclong, d.reclat])[1];
                })
                .attr("r", 1)
                .attr("class", "meteors")
                .attr("id", function(d){let id = d.name.replace(/ /g, ""); return id;});
        }
        if(mapData.fireballs){
            let min_small = d3.min(mapData.fireballs, function(d){return parseFloat(d["Calculated Total Impact Energy (kt)"]);}) * 1000;
            let max_small = d3.max(mapData.fireballs, function(d){
                let val =  parseFloat(d["Calculated Total Impact Energy (kt)"]);
                if(val <= 1)
                    return val;
                return 0;
            }) * 1000;

            let min_big = d3.min(mapData.fireballs, function(d){
                let val =  parseFloat(d["Calculated Total Impact Energy (kt)"]);
                if(val > 1)
                    return val;
                return 0;
            }) * 1000;
            let max_big = d3.max(mapData.fireballs, function(d){
                let val =  parseFloat(d["Calculated Total Impact Energy (kt)"]);
                if(val > 1)
                    return val;
                return 0;
            }) * 1000;

            let bigScale = d3.scaleLinear()
                .domain([min_big, max_big])
                .range([6, 12]);

            let smallScale = d3.scaleLinear()
                .domain([min_small, max_small])
                .range([2,5]);


            markers = _this.fireballs.selectAll(".fireballs").data(mapData.fireballs);
            newCircle = markers.enter().append("circle");

            markers.exit().remove();
            markers = newCircle.merge(markers);

            markers.attr("cx", function (d) {
                return  _this.projection([d["lng"], d["lat"]])[0];
            })
                .attr("cy", function (d) {
                    return _this.projection([d["lng"], d["lat"]])[1];
                })
                .attr("r", function(d){
                    let val = parseFloat(d["Calculated Total Impact Energy (kt)"]);
                    if(val <= 1)
                        return smallScale(val * 1000);
                    return bigScale(val * 1000);
                })
                .attr("id", (d,i)=>d.id)
                .attr("class", "fireballs");
        }
    }

    drawLegend(){
        let _this = this;

        let xPos = 320;
        let yPos = 410;

        let minMeteoriteRadius = 2;
        let minFireballRadius = 2;
        let maxFireballRadius = 12;

        //Category labels
        _this.legend.append("text")
            .text("Meteorites")
            .attr("x", xPos);
        _this.legend.append("text")
            .text("Fireballs")
            .attr("x", xPos + 150);
        _this.legend.selectAll("text")
            .attr("y", yPos)
            .attr("class", "categoryLabel");

        //Meteorite point
        _this.legend.append("circle")
            .attr("class", "meteors")
            .attr("r", minMeteoriteRadius)
            .attr("cx", xPos + 90)
            .attr("cy", yPos - 5)
            .attr("fill", "red");

        //Fireball points
        _this.legend.append("circle")
            .classed("fireballs", true)
            .classed("legendFireball", true)
            .attr("r", minFireballRadius)
            .attr("cy", yPos - 5);
        _this.legend.append("circle")
            .classed("fireballs", true)
            .classed("legendFireball", true)
            .attr("r", maxFireballRadius)
            .attr("cy", yPos + maxFireballRadius + 5);
        _this.legend.selectAll(".legendFireball")
            .attr("cx", xPos + 230)
            .attr("fill", "orange");

        //Fireball descriptions
        _this.legend.append("text")
            .text("Total Impact Energy: 0.073 kilotons of TNT")
            .attr("class", "descriptionLabel")
            .attr("y", yPos);
        _this.legend.append("text")
            .text("Total Impact Energy: 440 kilotons of TNT")
            .attr("class", "descriptionLabel")
            .attr("y", yPos + maxFireballRadius + 10);
        _this.legend.selectAll(".descriptionLabel")
            .attr("x", xPos + 230 + maxFireballRadius + 5);
    }

    highlightMap(classH, status)
    {
        let _this = this;
        if(status == "removeHighlight")
        {
            d3.selectAll(".meteors").classed("selected", false).classed("background", false).classed("meteors", true);
            d3.selectAll(".fireballs").classed("selected", false).classed("background", false).classed("fireballs", true);
        }
        else if(classH == "Meteorites")
        {
            d3.selectAll(".meteors").classed("selected", true);
            d3.selectAll(".fireballs").classed("background", true);
        }
        else if(classH == "Fireballs")
        {
            d3.selectAll(".meteors").classed("background", true);
            d3.selectAll(".fireballs").classed("selected", true);
        }
    }

    highlightObject(id, category, status)
    {
        let _this = this;
        if(status == "removeHighlight")
        {
            d3.selectAll(".meteors").classed("selected", false).classed("background", false).classed("meteors", true);
            d3.selectAll(".fireballs").classed("selected", false).classed("background", false).classed("fireballs", true);
            if(category == "Meteorites")
                d3.selectAll("#"+id).attr("r", 1);
        }
        else
        {
            d3.selectAll(".meteors").classed("background", true);
            d3.selectAll(".fireballs").classed("background", true);

            let object = d3.select("#mapView").selectAll("#"+id);
            if(category == "Meteorites")
                object.attr("r", 5);

            object.classed("background", false).classed("selected", true);
        }
    }
}