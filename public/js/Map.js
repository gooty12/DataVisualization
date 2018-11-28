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
        this.margin = {top: 50, right: 30, bottom: 30, left: 70};
        this.yearAggregate = yearAggregate;
        this.countryAggregate = countryAggregate;
        this.mappings = mappings;
        this.projection = d3.geoWinkel3().scale(140).translate([365, 225]);
        this.year = defaultYear;
        this.svg = d3.select("#map-chart").append("svg");
        this.mapSvg = this.svg.append("g");
        let olympicAnalysisDiv = d3.select("#olympic-analysis").classed("content", true);

        this.svgBounds = olympicAnalysisDiv.node().getBoundingClientRect();
        this.svgWidth = this.svgBounds.width/3 - this.margin.left - this.margin.right;
        this.svgHeight = this.svgBounds.height/3 - this.margin.top - this.margin.bottom;
        this.activeCountry = "";
        this.lineChartWidth = 2*this.svgBounds.width - this.margin.left - this.margin.right - 200;

        this.infoBoxSvg = olympicAnalysisDiv.append('div').attr('id', 'infobox')
        //this.barChart = new BarChart();
    };

    drawMap(world) {
        let self = this;
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
            .on('click', function (d) {
                self.activeCountry = d.countryId;
                self.updateLineChart('total')
            })
            .append('title').html((d => self.tooltipRender(d.countryId)))


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

        let info_box = d3.select('#country-detail');
        //info_box = info_box.append('div').classed("label", true).attr('id', 'infoBoxContainer');
        let info_box_title = info_box.append('div');
        /*info_box_title.append('text').text(infoObjects['population'].country).classed("i."+infoObjects['population'].region,false);
        for(let obj in infoObjects){
            let r = info_box.append('div').text(infoObjects[obj].indicator_name + ": ").classed("stat-text",true);
            r.append('span').text(infoObjects[obj].value).classed("stat-value",true);
        }*/
        this.drawYearBar()
        this.updateMap();

       // _this.drawLegend();
        this.drawSunburst(2012)
    }

    drawSunburst(year) {
        d3.select('#sunburstView').selectAll('*').remove();
        let self = this
        let allMedals = this.yearAggregate[year]
        //console.log(allMedals)
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
        })
        //console.log(allMedalsArr)
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

        var click = function(d) {
            // fade out all text elements
            svg.selectAll("text").transition().attr("opacity", 0);
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

        //console.log(partition(root).descendants());
            root = d3.hierarchy(root);
            root.sum(function(d) { return d.size; });
            svg.selectAll("path")
                .data(partition(root).descendants())
                .enter().append("path")
                .attr("d", arc)
                .style("fill", function(d) {
                    //while(d.depth > 1) d = d.parent;
                    if(d.depth == 0) return "lightgray";
                    if (d.depth == 1) return color(d.value);
                    if (d.depth == 2) {
                        if (d.data.name == "gold") return "gold";
                        if (d.data.name == "bronze") return "#CD7F32";
                        if (d.data.name == "silver") return "rgb(192,192,192)";
                    }

                })
                .on("click", click)
                .append("title")
                .text(function(d) { return d.data.name + "\n" + formatNumber(d.value); });

        var text = svg.selectAll("text")
            .data(root.descendants())
            .enter()
            .append("text")
            .attr("fill", "black")
            .attr("transform", function(d) { if (d.depth != 0)return "translate(" + arc.centroid(d) + ")"; })
            .attr("dy", "5px")
            .attr("font", "10px")
            .attr("text-anchor", "middle")
            .text(function(d) {
                let name = d.data.name
                name = name == "gold" ? "G" : name
                name = name == "silver" ? "S" : name
                name = name == "bronze" ? "B" : name
                return name; });




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
            self.drawSunburst(this.value)

        })
    }

    drawXAxis(svg, width, height, scale) {
        let x = d3.scalePoint().range([0, width]).domain(scale);
        let xAxis = d3.axisBottom(x)
        svg.append('g')
            .attr('transform', 'translate(0,' + height + ')')
            .classed('x axis', true)
            .call(xAxis);
    }

    drawYAxis(svg, width, height,scale) {
        let y = d3.scaleLinear().range([height, 0]).domain(scale);
        svg.append("g")
            .call(d3.axisLeft(y));
    }

    updateMap() {
        this.clearHighlight();
        let self = this;
        let max = 0;
        if(!this.yearAggregate[this.year]) {
            return;
        }
        let countries = Object.keys(this.yearAggregate[this.year])
        for (let i = 0; i < countries.length; i++) {
            let total = this.yearAggregate[this.year][countries[i]]['medals']['total'];
            if (total > max) {
                max = total;
            }
        }
        this.drawMedalsCountBarChart()
        this.drawYoYBarCharts();
        //
         this.drawRegionsBarChart();
        this.drawSexRatioBarCharts();

        let color_scale = d3.scaleLinear().domain([0, max]).range(['#e5f5f9', '#2ca25f']);
        for (let i = 0; i < countries.length; i++) {
            let total = this.yearAggregate[this.year][countries[i]]['medals']['total'];
            d3.select('#' + countries[i]).attr('fill', color_scale(total));
            d3.select('#' + countries[i] + '_medals_count').attr('fill', color_scale(total));
            d3.select('#' + countries[i] + '_yoy_improvement').attr('fill', color_scale(total));
            d3.select('#' + countries[i] + '_yoy_degradation').attr('fill', color_scale(total));
            d3.select('#' + countries[i] + '_females_count').attr('fill', color_scale(total));
            d3.select('#' + countries[i] + '_males_count').attr('fill', color_scale(total));
        }
    }

    clearHighlight() {
        d3.selectAll('.country').attr('fill', '#d9d9d9');
        d3.select('#olympic-analysis').selectAll('*').remove()

    }

    drawMedalsCountBarChart() {
        let self = this;
        let countries = Object.keys(this.yearAggregate[this.year])
        let medalsObj = {}
        let max = 0;

        for (let i = 0; i < countries.length; i++) {
            let total = this.yearAggregate[this.year][countries[i]]['medals']['total'];
            if (total > max) {
                max = total;
            }
        }


        countries.sort(function (x, y) {
            let totalX = self.yearAggregate[self.year][x]['medals']['total'];
            let totalY = self.yearAggregate[self.year][y]['medals']['total'];
            medalsObj[x] = {};
            medalsObj[y] = {};
            medalsObj[x]['totalMedals'] = totalX;
            medalsObj[y]['totalMedals'] = totalY;
            return totalY - totalX;
        })
        let countriesScale = [];


        let medalsData = [];
        for(let i = 0; i < 5; i++) {
            let countryMedalCount = {
                country: countries[i],
                medals: medalsObj[countries[i]]
            }
            medalsData.push(countryMedalCount)
            countriesScale.push(countries[i]);
        }
        let svg = d3.select('#olympic-analysis').append('div').attr('id', 'medalCountsSection').attr('class', 'analysis-bars').append('svg')
        //let yScale = d3.scaleLinear().range([this.svgHeight, 0]).domain([0, max]);
       // let xScale = d3.scalePoint().range([0, this.svgWidth]).domain(countriesScale);
        //this.barChart.drawBarChart(medalsData, this.svgWidth, this.svgHeight, svg, 'medalCount', xScale, yScale, d => d.country, d => d.medals.totalMedals, 'Countries', 'Medals', 'medals_count')
        //BarChart cba = new BarChart();
        svg = svg.attr("width", (this.svgWidth + this.margin.left + this.margin.right))
            .attr("height", (this.svgHeight + this.margin.top + this.margin.bottom))
            .append('g')
            .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')')
            .attr('id', 'medalCounts')
        let yScale = d3.scaleLinear().range([this.svgHeight, 0]).domain([0, max]);
        let xScale = d3.scalePoint().range([0, this.svgWidth]).domain(countriesScale);


        this.drawXAxis(svg, this.svgWidth, this.svgHeight, countriesScale)
        this.drawYAxis(svg, this.sgWidth, this.svgHeight,  [0, max])
        let rect = svg.selectAll("rect").data(medalsData);

        let newRect = rect.enter().append("rect");
        rect.exit().remove();
        rect = newRect.merge(rect).attr("width", d => 20)
            .attr("height", d=> (this.svgHeight - yScale(d.medals.totalMedals)))
            .attr("x", d => xScale(d.country))
            .attr("y", (d, i) => yScale(d.medals.totalMedals))
            .attr("id", d=>d.country + '_medals_count')
            .on('click', function (d) {
                self.activeCountry = d.country;
                self.updateLineChart('total')
            })
            .append('title').html((d => self.tooltipRender(d.country)));

        svg.append("text")
            .attr("x", (this.svgWidth / 2))
            .attr("y", 0 - (this.margin.top / 2))
            .attr("text-anchor", "middle")
            .style("font-size", "16px")
            .style("text-decoration", "underline")
            .text("Top performers");

        svg.append("text")
            .attr("transform",
                "translate(" + (this.svgWidth/2) + " ," +
                (this.svgHeight + this.margin.top) + ")")
            .attr('id', 'xLabelLine')
            .style("text-anchor", "middle")
            .text("Countries");

        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - this.margin.left + 20)
            .attr("x",0 - (this.svgHeight / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("Total medals");

    }

    drawSexRatioBarCharts() {
        let self = this;
        let countriesArr = [];
        let yearData = this.yearAggregate[this.year]
        for(let property in yearData) {
            let ratio = yearData[property]['Males'] == 0 || yearData[property]['Females'] == 0? 10000 : yearData[property]['Females']/ yearData[property]['Males'];
            countriesArr.push({
                'country': property,
                'males': yearData[property]['Males'],
                'females': yearData[property]['Females'],
                'ratio': ratio
            })
        }

       countriesArr =  countriesArr.filter(x => x['males'] && x['females']);
        countriesArr.sort(function (x, y) {
            return y['ratio']  - x['ratio'];
        })
        let max = d3.max(countriesArr, d => d.ratio)
        let countriesScale = [];
        let femaleRatio = [];
        for(let i = 0; i < 5; i++) {
            if(!countriesArr[i]) {
                break;
            }
            countriesScale.push(countriesArr[i].country)
            femaleRatio.push(countriesArr[i])
        }



        let svg = d3.select('#olympic-analysis').append('div').attr('id', 'sexRatioMinContainer').attr('class', 'analysis-bars').append('svg')
        svg = svg.attr("width", (this.svgWidth + this.margin.left + this.margin.right))
            .attr("height", (this.svgHeight + this.margin.top + this.margin.bottom))
            .append('g')
            .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')')
            .attr('id', 'femalesCount')
        let yScale = d3.scaleLinear().range([this.svgHeight, 0]).domain([0, max]);
        let xScale = d3.scalePoint().range([0, this.svgWidth]).domain(countriesScale);


        this.drawXAxis(svg, this.svgWidth, this.svgHeight, countriesScale)
        this.drawYAxis(svg, this.sgWidth, this.svgHeight,  [0, max])
        let rect = svg.selectAll("rect").data(femaleRatio);

        let newRect = rect.enter().append("rect");
        rect.exit().remove();
        rect = newRect.merge(rect).attr("width", d => 20)
            .attr("height", d=> (this.svgHeight - yScale(d.ratio)))
            .attr("x", d => xScale(d.country))
            .attr("y", (d, i) => yScale(d.ratio))
            .attr("id", d=>d.country + '_females_count')

            //.append('title').html((d => self.tooltipRender(d.country)));

        svg.append("text")
            .attr("x", (this.svgWidth / 2))
            .attr("y", 0 - (this.margin.top / 2))
            .attr("text-anchor", "middle")
            .style("font-size", "16px")
            .style("text-decoration", "underline")
            .text("Top female participation");

        svg.append("text")
            .attr("transform",
                "translate(" + (this.svgWidth/2) + " ," +
                (this.svgHeight + this.margin.top) + ")")
            .attr('id', 'xLabelLine')
            .style("text-anchor", "middle")
            .text("Countries");

        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - this.margin.left + 20)
            .attr("x",0 - (this.svgHeight / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("Female/Male Ratio");

        let countriesArrClone = countriesArr.slice();

        countriesArrClone.sort(function (x, y) {
            return 1/y['ratio'] - 1/x['ratio'];
        })
        let malesRatio = [];
        countriesScale = [];
        max = 1/d3.min(countriesArrClone,d => d.ratio)
        for(let i = 0; i < 5; i++) {
            if(!countriesArrClone[i]) {
                break;
            }
            malesRatio.push(countriesArrClone[i])
            countriesScale.push(countriesArrClone[i].country)
        }

        svg = d3.select('#olympic-analysis').append('div').attr('id', 'sexRatioMaxContainer').attr('class', 'analysis-bars').append('svg')
        svg = svg.attr("width", (this.svgWidth + this.margin.left + this.margin.right))
            .attr("height", (this.svgHeight + this.margin.top + this.margin.bottom))
            .append('g')
            .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')')
            .attr('id', 'femalesCount')
        yScale = d3.scaleLinear().range([this.svgHeight, 0]).domain([0, max]);
        xScale = d3.scalePoint().range([0, this.svgWidth]).domain(countriesScale);


        this.drawXAxis(svg, this.svgWidth, this.svgHeight, countriesScale)
        this.drawYAxis(svg, this.sgWidth, this.svgHeight,  [0, max])
        rect = svg.selectAll("rect").data(malesRatio);

        newRect = rect.enter().append("rect");
        rect.exit().remove();
        rect = newRect.merge(rect).attr("width", d => 20)
            .attr("height", d=> (this.svgHeight - yScale(1/d.ratio)))
            .attr("x", d => xScale(d.country))
            .attr("y", (d, i) => yScale(1/d.ratio))
            .attr("id", d=>d.country + '_males_count')

        //.append('title').html((d => self.tooltipRender(d.country)));

        svg.append("text")
            .attr("x", (this.svgWidth / 2))
            .attr("y", 0 - (this.margin.top / 2))
            .attr("text-anchor", "middle")
            .style("font-size", "16px")
            .style("text-decoration", "underline")
            .text("Worst female participation");

        svg.append("text")
            .attr("transform",
                "translate(" + (this.svgWidth/2) + " ," +
                (this.svgHeight + this.margin.top) + ")")
            .attr('id', 'xLabelLine')
            .style("text-anchor", "middle")
            .text("Countries");

        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - this.margin.left + 20)
            .attr("x",0 - (this.svgHeight / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("Male/Female Ratio");





    }

    drawRegionsBarChart() {
       let self = this;

        let medalsRegions = []
        let medalsRegionsObj = {}
        let max = 0;

        for (let key in this.yearAggregate[this.year]) {
            let count = 0;
            if(!this.mappings['regionMap'][key]) {
               continue;
            }
            if(!medalsRegionsObj[this.mappings['regionMap'][key]]) {
                count += this.yearAggregate[this.year][key]['medals']['total'];
            }
            else {
                count = medalsRegionsObj[this.mappings['regionMap'][key]];
                count += this.yearAggregate[this.year][key]['medals']['total'];
            }
            medalsRegionsObj[this.mappings['regionMap'][key]]  = count;
            if (count > max) {
                max = count;
            }
        }
        let regionsScale = [];
        for(let key in medalsRegionsObj) {
            medalsRegions.push({
                region: key,
                count: medalsRegionsObj[key]
            })
            regionsScale.push(key)
        }
        medalsRegions.sort(function (x, y) {
            return y.count - x.count;
        })
        let svg = d3.select('#olympic-analysis').append('div').attr('id', 'medalCountsRegionSection').attr('class', 'analysis-bars').append('svg')
        svg = svg.attr("width", (this.svgWidth + this.margin.left + this.margin.right))
            .attr("height", (this.svgHeight + this.margin.top + this.margin.bottom))
            .append('g')
            .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')')
            .attr('id', 'medalCounts')
        let yScale = d3.scaleLinear().range([this.svgHeight, 0]).domain([0, max]);
        let xScale = d3.scalePoint().range([0, this.svgWidth]).domain(regionsScale);
        let color_scale = d3.scaleLinear().domain([0, max]).range(['#e5f5f9', '#2ca25f']);



        this.drawXAxis(svg, this.svgWidth, this.svgHeight, regionsScale)
        this.drawYAxis(svg, this.sgWidth, this.svgHeight,  [0, max])
        let rect = svg.selectAll("rect").data(medalsRegions);

        let newRect = rect.enter().append("rect");
        rect.exit().remove();
        rect = newRect.merge(rect).attr("width", d => 20)
            .attr("height", d=> (this.svgHeight - yScale(d.count)))
            .attr("x", d => xScale(d.region))
            .attr("y", (d, i) => yScale(d.count))
            .attr("id", d=>d.region + '_medals_count')
            .attr('fill',d => color_scale(d.count))
        svg.append("text")
            .attr("x", (this.svgWidth / 2))
            .attr("y", 0 - (this.margin.top / 2))
            .attr("text-anchor", "middle")
            .style("font-size", "16px")
            .style("text-decoration", "underline")
            .text("Top performers(Regions)");

        svg.append("text")
            .attr("transform",
                "translate(" + (this.svgWidth/2) + " ," +
                (this.svgHeight + this.margin.top) + ")")
            .attr('id', 'xLabelLine')
            .style("text-anchor", "middle")
            .text("Regions");

        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - this.margin.left + 20)
            .attr("x",0 - (this.svgHeight / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("Total medals");
    }

    drawYoYBarCharts() {
        let self = this;
        let countries = Object.keys(this.yearAggregate[this.year])

        let year = parseInt(this.year) - 4;
        while(year >= 1896 && !this.yearAggregate[year]) {
            if(year == 1948) {
                year -= 8;
            }
            else if(year == 1944) {

            }
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
                let currX = self.yearAggregate[self.year][x]['medals']['total']
                let currY = self.yearAggregate[self.year][y]['medals']['total']
                if(prevData[x]) {
                    prevX = prevData[x]['medals']['total'];
                }
                if(prevData[y]) {
                    prevY = prevData[y]['medals']['total'];
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
            let countriesScaleInc = [];

            for(let i = 0; i < 5; i++) {
                let obj = {
                    'country': countries[i],
                    'improvement': yoyObj[countries[i]]['yoyImprovement']*100
                }
                yoyImprovement.push(obj)
                countriesScaleInc.push(countries[i])
            }
            let maxYoYInc = d3.max(yoyImprovement, d => d.improvement)

            let countriesScaleDec = [];

            for(let i = countries.length - 1; i >= 0; i--) {
                if(yoyObj[countries[i]]['yoyImprovement'] > -10000) {
                    let obj = {
                        'country': countries[i],
                        'degradation': -1*yoyObj[countries[i]]['yoyImprovement']*100
                    }
                    if(obj['degradation'] > 0) {
                        yoyDegradation.push(obj)
                        count++;
                        countriesScaleDec.push(countries[i])

                    }
                    if(count == 5) {
                        break;
                    }

                }
            }

            let svg = d3.select('#olympic-analysis').append('div').attr('id', 'yoyImprovementSection').attr('class', 'analysis-bars').append('svg')
            svg = svg.attr("width", (this.svgWidth + this.margin.left + this.margin.right))
                .attr("height", (this.svgHeight + this.margin.top + this.margin.bottom))
                .append('g')
                .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')')
                .attr('id', 'yoyImprovement');

            let yScale = d3.scaleLinear().range([this.svgHeight, 0]).domain([0, maxYoYInc]);
            let xScale = d3.scalePoint().range([0, this.svgWidth]).domain(countriesScaleInc);


            this.drawXAxis(svg, this.svgWidth, this.svgHeight, countriesScaleInc)
            this.drawYAxis(svg, this.svgWidth, this.svgHeight,  [0, maxYoYInc])
            let rect = svg.selectAll("rect").data(yoyImprovement);

            let newRect = rect.enter().append("rect");
            rect.exit().remove();
            rect = newRect.merge(rect).attr("width", d => 20)
                .attr("height", d=> (this.svgHeight - yScale(d.improvement)))
                .attr("x", d => xScale(d.country))
                .attr("y", (d, i) => yScale(d.improvement))
                .attr("id", d=>d.country + '_yoy_improvement')
                .on('click', function (d) {
                    self.activeCountry = d.country;
                    self.updateLineChart('total')
                });

            svg.append("text")
                .attr("x", (this.svgWidth / 2))
                .attr("y", 0 - (this.margin.top / 2))
                .attr("text-anchor", "middle")
                .style("font-size", "16px")
                .style("text-decoration", "underline")
                .text("Top Gainers");

            svg.append("text")
                .attr("transform",
                    "translate(" + (this.svgWidth/2) + " ," +
                    (this.svgHeight + this.margin.top) + ")")
                .attr('id', 'xLabelLine')
                .style("text-anchor", "middle")
                .text("Countries");

            svg.append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", 0 - this.margin.left + 20)
                .attr("x",0 - (this.svgHeight / 2))
                .attr("dy", "1em")
                .style("text-anchor", "middle")
                .text("YoY Improvement (%)");


            let maxYoYDec = d3.max(yoyDegradation, d => d.degradation)

            svg = d3.select('#olympic-analysis').append('div').attr('id', 'yoyDegradationSection').attr('class', 'analysis-bars')
        .append('svg')
            svg = svg.attr("width", (this.svgWidth + this.margin.left + this.margin.right))
                .attr("height", (this.svgHeight + this.margin.top + this.margin.bottom))
                .append('g')
                .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')')
                .attr('id', 'yoyDecrement')

            yScale = d3.scaleLinear().range([this.svgHeight, 0]).domain([0, maxYoYDec]);
            xScale = d3.scalePoint().range([0, this.svgWidth]).domain(countriesScaleDec);


            this.drawXAxis(svg, this.svgWidth, this.svgHeight, countriesScaleDec)
            this.drawYAxis(svg, this.svgWidth, this.svgHeight,  [0, maxYoYDec])
            rect = svg.selectAll("rect").data(yoyDegradation);

            newRect = rect.enter().append("rect");
            rect.exit().remove();
            rect = newRect.merge(rect).attr("width", d => 20)
                .attr("height", d=> (this.svgHeight - yScale(d.degradation)))
                .attr("x", d => xScale(d.country))
                .attr("y", (d, i) => yScale(d.degradation))
                .attr("id", d=>d.country + '_yoy_degradation')
                .on('click', function (d) {
                    self.activeCountry = d.country;
                    self.updateLineChart('total')
                });

            svg.append("text")
                .attr("x", (this.svgWidth / 2))
                .attr("y", 0 - (this.margin.top / 2))
                .attr("text-anchor", "middle")
                .style("font-size", "16px")
                .style("text-decoration", "underline")
                .text("Top Losers");

            svg.append("text")
                .attr("transform",
                    "translate(" + (this.svgWidth/2) + " ," +
                    (this.svgHeight + this.margin.top) + ")")
                .attr('id', 'xLabelLine')
                .style("text-anchor", "middle")
                .text("Countries");

            svg.append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", 0 - this.margin.left + 20)
                .attr("x",0 - (this.svgHeight / 2))
                .attr("dy", "1em")
                .style("text-anchor", "middle")
                .text("YoY degradation (%)");

        }

    }

    updateLineChart(param) {
        let self = this;
        d3.select('#country-detail').select('#countryDetails').remove();
        let dataArray = [];
        let yearScale = [];
        let max = -1;

        var width = 500;
        var height = 300;
        var margin = 50;
        var duration = 250;

        var lineOpacity = "0.25";
        var lineOpacityHover = "0.85";
        var otherLinesOpacityHover = "0.1";
        var lineStroke = "1.5px";
        var lineStrokeHover = "2.5px";

        var circleOpacity = '0.85';
        var circleOpacityOnLineHover = "0.25"
        var circleRadius = 3;
        var circleRadiusHover = 6;
        var color = d3.scaleOrdinal(d3.schemeCategory10);



        let countries = Object.keys(this.countryAggregate)
        for(let i = 0; i < countries.length; i++) {
            let dataPoints = [];
            for(let j = 1896; j < 2016; j+= 4) {
                if(j == 1916 || j == 1940 || j== 1944) {
                    continue;
                }
                yearScale.push(j + '')
                if(this.countryAggregate[countries[i]][j]) {
                    let medals = this.countryAggregate[countries[i]][j]['medals'][param];
                    dataPoints.push({
                        'year': j + '',
                        'medals': medals
                    })
                    if(medals > max) {
                        max = medals;
                    }
                }
                else {
                    dataPoints.push({
                        'year': j + '',
                        'medals': 0
                    })
                }
            }
            dataArray.push({
                'country': countries[i],
                'points': dataPoints
            })
        }




        let svg = d3.select('#country-detail').append('div').attr('id', 'countryDetails').append('svg')
        svg = svg.attr("width", this.lineChartWidth + this.margin.left + this.margin.right)
            .attr("height", (this.svgHeight + this.margin.top + this.margin.bottom))
            .append('g')
            .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')')
            .attr('id', 'countryChart');

        let yScale = d3.scaleLinear().range([this.svgHeight, 0]).domain([0, max]);
        let xScale = d3.scalePoint().range([0, this.lineChartWidth]).domain(yearScale);
        let line = d3.line()
            .x(d => xScale(d.year))
            .y(d => yScale(d.medals));

        let lines = svg.append('g')
            .attr('class', 'lines');

        lines.selectAll('.line-group')
            .data(dataArray).enter()
            .append('g')
            .attr('class', 'line-group')
            .on("mouseover", function(d, i) {
                svg.append("text")
                    .attr("class", "title-text")
                    .style("fill", color(i))
                    .text(d.country)
                    .attr("text-anchor", "middle")
                    .attr("x", (this.svgWidth)/2)
                    .attr("y", 5);
            })
            .on("mouseout", function(d) {
                svg.select(".title-text").remove();
            })
            .append('path')
            .attr('class', 'line')
            .attr('id', d => d.country + '_line')

            .attr('d', d => line(d.points))
            .style('stroke', (d, i) => color(i))
            .style('opacity', lineOpacity)
            .on("mouseover", function(d) {
                d3.selectAll('.line')
                    .style('opacity', otherLinesOpacityHover);
                d3.selectAll('.circle')
                    .style('opacity', circleOpacityOnLineHover);
                d3.select(this)
                    .style('opacity', lineOpacityHover)
                    .style("stroke-width", lineStrokeHover)
                    .style("cursor", "pointer");
            })
            .on("mouseout", function(d) {
                d3.selectAll(".line")
                    .style('opacity', lineOpacity);
                d3.selectAll('.circle')
                    .style('opacity', circleOpacity);
                d3.select(this)
                    .style("stroke-width", lineStroke)
                    .style("cursor", "none");
            });

        lines.selectAll("circle-group")
            .data(dataArray).enter()
            .append("g")
            .style("fill", (d, i) => color(i))
            .selectAll("circle")
            .data(d => d.points).enter()
            .append("g")
            .attr("class", "circle")
            .on("mouseover", function(d) {
                d3.select(this)
                    .style("cursor", "pointer")
                    .append("text")
                    .attr("class", "text")
                    .text(`${d['medals'][param]}`)
                    .attr("x", d => xScale(d.year) + 5)
                    .attr("y", d => yScale(d.medals) - 10);
            })
            .on("mouseout", function(d) {
                d3.select(this)
                    .style("cursor", "none")
                    .transition()
                    .duration(duration)
                    .selectAll(".text").remove();
            })
            .append("circle")
            .attr("cx", d => xScale(d.year))
            .attr("cy", d => yScale(d.medals))
            .attr("r", circleRadius)
            .style('opacity', circleOpacity)
            .on("mouseover", function(d) {
                d3.select(this)
                    .transition()
                    .duration(duration)
                    .attr("r", circleRadiusHover);
            })
            .on("mouseout", function(d) {
                d3.select(this)
                    .transition()
                    .duration(duration)
                    .attr("r", circleRadius);
            });

        let dropDownData = ["total", "gold", "silver", "bronze"];
        let select = d3.select('#countryChart').append('select')
            .attr('class','select')
            .attr('id', 'medalOptions')
            .on('change', function () {
                self.updateLineChart(this.value)
            })

        svg.append("text")
            .attr("x", (this.lineChartWidth/2))
            .attr("y", 0 - (this.margin.top / 2))
            .attr("text-anchor", "middle")
            .style("font-size", "16px")
            .style("text-decoration", "underline")
            .text(this.getText());

        svg.append("text")
            .attr("transform",
                "translate(" + (this.lineChartWidth/2) + " ," +
                (this.svgHeight + this.margin.top) + ")")
            .attr('id', 'xLabelLine')
            .style("text-anchor", "middle")
            .text("Years");

        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - this.margin.left + 20)
            .attr("x",0 - (this.svgHeight / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("Medals");

        let options = select
            .selectAll('option')
            .data(dropDownData).enter()
            .append('option')
            .text(function (d) { return d; });

       /* svg.selectAll(".dot")
            .data(dataArray)
            .enter().append("circle") // Uses the enter().append() method
            .attr("class", "dot") // Assign a class for styling
            .attr("cx", function(d, i) { return xScale(d.year) })
            .attr("cy", function(d) { return yScale(d.count) })
            .attr("r", 5);*/
    }

    getText() {
        return this.mappings['countryIdToName'][this.activeCountry] ? this.mappings['countryIdToName'][this.activeCountry] + ' performance chart' : 'performance chart';

    }

    drawInfoBox() {
        let info_box = d3.select('#country-detail');
        info_box = info_box.append('div').classed("label", true).attr('id', 'infoBoxContainer');
        let info_box_title = info_box.append('div');
        //info_box_title.append('i').attr('class',infoObjects['population'].region).classed('fas fa-globe-asia',true);
        //info_box_title.append('text').text(infoObjects['population'].country).classed("i."+infoObjects['population'].region,false);
        /*for(let obj in infoObjects){
            let r = info_box.append('div').text(infoObjects[obj].indicator_name + ": ").classed("stat-text",true);
            r.append('span').text(infoObjects[obj].value).classed("stat-value",true);
        }*/
    }

    tooltipRender(country) {
        if(!this.yearAggregate[this.year][country] || !this.yearAggregate[this.year][country]['medals']) {
            return;
        }
        let data = this.yearAggregate[this.year][country]['medals'];


        let text = "<h2>Gold Medals: " + data['gold'] + "</h2><br>";
        text += "<h2>Silver Medals: " + data['silver'] + "</h2><br>";
        text += "<h2>Bronze Medals: " + data['bronze'] + "</h2>";
        return text;
    }
}