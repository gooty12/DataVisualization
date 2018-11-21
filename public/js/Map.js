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
    constructor(yearAggregate, countryAggregate, mappings, defaultYear) {
        this.margin = {top: 30, right: 20, bottom: 30, left: 50};
        this.yearAggregate = yearAggregate;
        this.countryAggregate = countryAggregate;
        this.mappings = mappings;
        this.projection = d3.geoWinkel3().scale(140).translate([365, 225]);
        this.year = defaultYear;
        this.svg = d3.select("#map-chart").append("svg");
        this.mapSvg = this.svg.append("g");
        let olympicAnalysisDiv = d3.select("#olympic-analysis").classed("content", true);

        this.svgBounds = olympicAnalysisDiv.node().getBoundingClientRect();
        this.svgWidth = this.svgBounds.width - this.margin.right;


        //add the svg to the div
        this.medalCountSvg = olympicAnalysisDiv.append("svg")
            .attr("width",this.svgWidth)
            .attr("height", 150)
            .attr("transform", "translate(0 ,50)")

        this.yoyImprovementSvg = olympicAnalysisDiv.append("svg")
            .attr("width",this.svgWidth)
            .attr("height", 150)
            .attr("transform", "translate(0 ,50)")

        this.yoyDecrementSvg = olympicAnalysisDiv.append("svg")
            .attr("width",this.svgWidth)
            .attr("height", 150)
            .attr("transform", "translate(0 ,50)")


    };

    drawMap(world) {
        let _this = this;
        let geojson = topojson.feature(world, world.objects.countries).features;
        let totalMedals = 0;
        let countryData = geojson.map(country => {
            let countryId = this.mappings['reverseCountryIdMap'][country.id];
            let countryName = null;
            let region = null;
            if(countryId) {
                countryName = this.mappings['countryIdToName'][countryId];
                let currentYearData = this.yearAggregate[this.year][countryId];
                let gold = currentYearData ? currentYearData['medals']['gold'] : 0;
                let silver = currentYearData ? currentYearData['medals']['silver'] : 0;
                let bronze = currentYearData ? currentYearData['medals']['bronze'] : 0;
                let total = gold + silver + bronze;
                totalMedals += total;
                region = this.mappings['regionMap'][countryId];
                return new CountryData(country.type, country.id, countryId, countryName, region, country.properties, country.geometry, gold, silver, bronze, total)

            }
            else {
                return new CountryData(country.type,country.id, country.id, null, null, country.properties, country.geometry, 0, 0, 0, 0)
            }
        });
        countryData['totalMedals'] = totalMedals;

        let path = d3.geoPath().projection(this.projection);
        let graticule = d3.geoGraticule();

        this.mapSvg.attr("class", "countries boundary")
            .selectAll("path")
            .data(countryData)
            .enter().append("path")
            .attr("d", path)
            .attr("id", d => d.countryId)
            .attr("class", d => d.region)
            .attr('class', 'country')

        this.mapSvg.append("path")
            .datum({type: "Sphere"})
            .attr("id", "sphere")
            .attr("d", path)
            .classed("stroke", true)
        d3.select('#map-chart')
            .append('div').attr('id', 'activeYear-bar');
        this.mapSvg.append("path")
            .datum(graticule)
            .classed("graticule", true)
            .attr("d", path);
        this.drawYearBar()
        this.updateMap();

       // _this.drawLegend();
        this.drawSunburst(2008)
    }

    drawSunburst(year) {
        console.log("SUNBURST")
        let self = this
        let allMedals = this.yearAggregate[year]
        //console.log(this.yearAggregate)
        //console.log(Object.entries(allMedals))
        let allMedalsArr = Object.entries(allMedals)
        allMedalsArr.sort((a, b) => {
            let medals1 = a[1]["medals"]
            let medals2 = b[1]["medals"]
            let m1 = medals1["gold"]+medals1["silver"]+medals1["bronze"]
            let m2 = medals2["gold"]+medals2["silver"]+medals2["bronze"]
            let res = m2 - m1
            res = res == 0 ? medals2["gold"] - medals1["gold"] : res
            res = res == 0 ? medals2["silver"] - medals1["silver"] : res
            return m2 - m1;
        }
        )
        console.log(allMedalsArr)
        let root = {name: "Top 10", children: []}

        for (let i = 0; i < allMedalsArr.length && i < 10; i++) {
            let elem = allMedalsArr[i]
            let obj = {
                name: elem[0],
                children: [
                    {name: "gold", size: elem[1]["medals"]["gold"]},
                    {name: "silver", size: elem[1]["medals"]["silver"]},
                    {name: "bronze", size: elem[1]["medals"]["bronze"]}
                ]
            };
            root.children.push(obj)
        }

        console.log(root)

        // generate sunburst

        var width = 960,
            height = 700,
            radius = (Math.min(width, height) / 2) - 10;

        var formatNumber = d3.format(",d");

        var x = d3.scaleLinear()
            .range([0, 2 * Math.PI]);

        var y = d3.scaleSqrt()
            .range([0, radius]);

        var color = d3.scaleOrdinal().range([
            "#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf"
        ]);


        var partition = d3.partition();

        var arc = d3.arc()
            .startAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x0))); })
            .endAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x1))); })
            .innerRadius(function(d) { return Math.max(0, y(d.y0)); })
            .outerRadius(function(d) { return Math.max(0, y(d.y1)); });


        var svg = d3.select("#sunburstView").append("svg")
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("transform", "translate(" + width / 2 + "," + (height / 2) + ")");


        let click = function(d) {
            svg.transition()
                .duration(750)
                .tween("scale", function() {
                    var xd = d3.interpolate(x.domain(), [d.x0, d.x1]),
                        yd = d3.interpolate(y.domain(), [d.y0, 1]),
                        yr = d3.interpolate(y.range(), [d.y0 ? 20 : 0, radius]);
                    return function(t) { x.domain(xd(t)); y.domain(yd(t)).range(yr(t)); };
                })
                .selectAll("path")
                .attrTween("d", function(d) { return function() { return arc(d); }; });
        }


            root = d3.hierarchy(root);
            root.sum(function(d) { return d.size; });
            svg.selectAll("path")
                .data(partition(root).descendants())
                .enter().append("path")
                .attr("d", arc)
                .style("fill", function(d) {
                    while(d.depth > 1) d = d.parent;
                    if(d.depth == 0) return "lightgray";
                    return color(d.value);
                })
                .on("click", click)
                .append("title")
                .text(function(d) { return d.data.name + "\n" + formatNumber(d.value); });



        d3.select(self.frameElement).style("height", height + "px");
        // _this.drawLegend();
    }



    drawYearBar() {
        let that = this;
        let yearScale = d3.scaleLinear().domain([1896, 2012]).range([30, 610]);
        let yearSlider = d3.select('#activeYear-bar')
            .append('div').classed('slider-wrap', true)
            .append('input').classed('slider', true)
            .attr('id', 'yearSlider')
            .attr('type', 'range')
            .attr('min', 1896)
            .attr('max', 2012)
            .attr('value', this.year)
            .attr('step', 4);

        let sliderLabel = d3.select('.slider-wrap')
            .append('div').classed('slider-label', true)
            .append('svg');

        let sliderText = sliderLabel.append('text').text(this.year);

        sliderText.attr('x', yearScale(this.year));
        sliderText.attr('y', 25);
        let self = this;
        yearSlider.on("input", function() {
            self.year = this.value;
            sliderText.attr('x', yearScale(this.value));
            sliderText.text(this.value)
            self.updateMap()
        })
    }

    updateMap() {
        d3.selectAll('.country').attr('fill', '#d9d9d9');
        let self = this;

        let max = 0;
        if(!this.yearAggregate[this.year]) {
            return;
        }
        let countries = Object.keys(this.yearAggregate[this.year])
        let medalsObj = {}
        countries.sort(function (x, y) {
            let totalX = self.yearAggregate[self.year][x]['medals']['gold'] + self.yearAggregate[self.year][x]['medals']['bronze'] + self.yearAggregate[self.year][x]['medals']['silver'];
            let totalY = self.yearAggregate[self.year][y]['medals']['gold'] + self.yearAggregate[self.year][y]['medals']['bronze'] + self.yearAggregate[self.year][y]['medals']['silver'];
            medalsObj[x] = {};
            medalsObj[y] = {};

            medalsObj[x]['totalMedals'] = totalX;
            medalsObj[y]['totalMedals'] = totalY;
            return totalY - totalX;
        })

        for (let i = 0; i < countries.length; i++) {
            let total = this.yearAggregate[this.year][countries[i]]['medals']['gold'] + this.yearAggregate[this.year][countries[i]]['medals']['bronze'] + this.yearAggregate[this.year][countries[i]]['medals']['silver'];
            if (total > max) {
                max = total;
            }
        }
        let medalsData = [];
        for(let i = 0; i < 5; i++) {
            let countryMedalCount = {
                country: countries[i],
                medals: medalsObj[countries[i]]
            }
            medalsData.push(countryMedalCount)
        }
        console.log(medalsData)

        let xScale = d3.scaleLinear().domain([0, max]).range([this.margin.left, this.svgWidth - this.margin.right - 200]);
        let rect = this.medalCountSvg.selectAll("rect").data(medalsData);

        let newRect = rect.enter().append("rect");



        rect.exit().remove();
        rect = newRect.merge(rect).attr("width", d => xScale(d.medals.totalMedals))
            .attr("height", 20)
            .attr("x", 0)
            .attr("y", (d, i) => 25*i);
        rect.attr("id", d=>d.country + '_medals_count');

        let year = parseInt(this.year) - 4;
        while(year >= 1896 && !this.yearAggregate[year]) {
            year -= 4;
        }
        if(year >= 1896) {
            let prevData = this.yearAggregate[year + ''];
            let prevCountries = Object.keys(prevData);
            let yoyObj = {}
            let yoyImprovement = [];
            let yoyDegradation = [];
            countries.sort(function (x, y) {
                let yearString = year + '';
                let prevX = 0;
                let prevY = 0;
                let currX = self.yearAggregate[self.year][x]['medals']['gold'] + self.yearAggregate[self.year][x]['medals']['bronze'] + self.yearAggregate[self.year][x]['medals']['silver'];
                let currY = self.yearAggregate[self.year][y]['medals']['gold'] + self.yearAggregate[self.year][y]['medals']['bronze'] + self.yearAggregate[self.year][y]['medals']['silver'];
                if(prevData[x]) {
                    prevX = prevData[x]['medals']['gold'] + prevData[x]['medals']['bronze'] + prevData[x]['medals']['silver'];
                }
                if(prevData[y]) {
                    prevY = prevData[y]['medals']['gold'] + prevData[y]['medals']['bronze'] + prevData[y]['medals']['silver'];
                }
                yoyObj[x] = {}
                yoyObj[y] = {}
                let xval = 0;
                let yval = 0;
                xval = yoyObj[x]['yoyImprovement'] = prevX == 0 ? -1000000: currX/prevX - 1;
                yval = yoyObj[y]['yoyImprovement'] =  prevY == 0 ? -1000000: currY/prevY - 1;
                return yval - xval;
            });
            let count = 0;

            for(let i = 0; i < 5; i++) {
                let obj = {
                    'country': countries[i],
                    'improvement': yoyObj[countries[i]]['yoyImprovement']
                }
                yoyImprovement.push(obj)
            }
            let maxYoYInc = d3.max(yoyImprovement, d => d.improvement)*100


            for(let i = countries.length - 1; i >= 0; i--) {
                if(yoyObj[countries[i]]['yoyImprovement'] > -10000) {
                    let obj = {
                        'country': countries[i],
                        'degradation': -1*yoyObj[countries[i]]['yoyImprovement']
                    }
                    if(obj['degradation'] > 0) {
                        yoyDegradation.push(obj)
                        count++;

                    }
                    if(count == 5) {
                        break;
                    }

                }
            }

            let maxYoYDec = d3.max(yoyDegradation, d => d.degradation)*100


            let percentScaleInc = d3.scaleLinear().domain([0, maxYoYInc]).range([this.margin.left, this.svgWidth - this.margin.right - 200]);
            let percentScaleDec = d3.scaleLinear().domain([0, maxYoYDec]).range([this.margin.left, this.svgWidth - this.margin.right - 200]);

            let yoyImprovementRect = this.yoyImprovementSvg.selectAll("rect").data(yoyImprovement);
            let yoyDegradationRect = this.yoyDecrementSvg.selectAll("rect").data(yoyDegradation);

            let newRectYoyImprovement = yoyImprovementRect.enter().append("rect");
            let newRectYoyDegradation = yoyDegradationRect.enter().append("rect");


            yoyImprovementRect.exit().remove();
            yoyDegradationRect.exit().remove();

            yoyImprovementRect = newRectYoyImprovement.merge(yoyImprovementRect).attr("width", d => percentScaleInc(d.improvement*100))
                .attr("height", 20)
                .attr("x", 0)
                .attr("y", (d, i) => 25*i)
                .attr("id", d=>d.country + '_yoy_improvement');

            yoyDegradationRect = newRectYoyDegradation.merge(yoyDegradationRect).attr("width", d => percentScaleDec(d.degradation*100))
                .attr("height", 20)
                .attr("x", 0)
                .attr("y", (d, i) => 25*i)
                .attr("id", d=>d.country + '_yoy_degradation');
        }

        let color_scale = d3.scaleLinear().domain([0, max]).range(['green', 'red']);
        for (let i = 0; i < countries.length; i++) {
            let total = this.yearAggregate[this.year][countries[i]]['medals']['gold'] + this.yearAggregate[this.year][countries[i]]['medals']['bronze'] + this.yearAggregate[this.year][countries[i]]['medals']['silver'];
            d3.select('#' + countries[i]).attr('fill', color_scale(total));
            d3.select('#' + countries[i] + '_medals_count').attr('fill', color_scale(total));
            d3.select('#' + countries[i] + '_yoy_improvement').attr('fill', color_scale(total));
            d3.select('#' + countries[i] + '_yoy_degradation').attr('fill', color_scale(total));


        }


    }

    tooltipRender(data) {
        let text = "<h1>" + data['country'] + "</h1>";
        text += "<h2> Region: " + data['region'] + "</h2>";
        text += "<h2> Gold Medals: " + data['gold'] + "</h2>";
        text += "<h2> Silver Medals: " + data['silver'] + "</h2>";
        text += "<h2> Bronze Medals: " + data['bronze'] + "</h2>";
        return text;
    }








}