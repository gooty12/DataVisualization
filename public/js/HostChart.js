class HostChart {
    constructor(data, hostObj, mappings) {
        this.hostObj = hostObj;
        this.margin = {top: 50, right: 30, bottom: 30, left: 70};
        let divyearChart = d3.select("#year-chart");
        this.divChart = divyearChart;

        this.svgBounds = divyearChart.node().getBoundingClientRect();
        this.svgWidth = this.svgBounds.width - this.margin.left - this.margin.right;
        this.svgHeight = 150;
        this.svg = divyearChart.append("svg")
            .attr("width", this.svgWidth + this.margin.right + this.margin.left)
            .attr("height", this.svgHeight)

        this.yearData = ['1960', '1964', '1968', '1972', '1976', '1980', '1984', '1988', '1992', '1996', '2000', '2004', '2008', '2012'];
        console.log(this.yearData.length)
        this.yearDataVal = this.yearData.slice();
        for(let i = 0; i < this.yearData.length; i++) {
            this.yearData[i] =  this.yearData[i]+ '(' + hostObj[this.yearData[i]] + ')'
        }
        let countriesList = [];
        for(let i = this.yearDataVal.length - 1; i > this.yearDataVal.length - 15; i--) {
            countriesList.push(hostObj[this.yearDataVal[i]])
        }
        this.countriesList = countriesList;
        this.xScale = d3.scaleBand()
            .domain(this.yearData)
            .range([this.margin.left, this.svgWidth])
        this.medalCounts  = data;
        this.hostObj = hostObj;
        this.mappings = mappings;
        this.countryAggregate = data;
        this.colorList = {};

        this.createChart()
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


    createChart() {
        let self = this;
        let dataRequired = [];

        for(let i = 0; i < this.yearData.length; i++) {
            dataRequired.push()
        }
        let max = 170;
        let yrScale = d3.scalePoint()
            .domain(this.yearData)
            .range([self.margin.left, self.svgWidth]);


        self.svg.append("line").attr("x1", 0)
            .attr("y1", self.svgHeight / 2)
            .attr("x2", self.svgWidth)
            .attr("y2", self.svgHeight / 2)
            .attr("class", "lineChart");

        let color = d3.scaleOrdinal().range([
            "#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf", "#484454", '#573957', '#383630'
        ]);

        let yearData = self.svg.selectAll("circle").data(this.yearData);
        let circles = yearData.enter().append("circle").attr("id", d => d);

        yearData.exit().remove();
        yearData = circles.merge(yearData);

        yearData.attr("cx", d => yrScale(d))
            .attr("cy", self.svgHeight / 2)
            .attr("r", self.svgHeight / 10)
            .style('fill', function(d, i) {
                let country = self.hostObj[self.yearDataVal[i]];

                if(self.colorList[country]) {
                    return self.colorList[country]
                }
                self.colorList[country] = color(i)
                return self.colorList[country];


            })
            .attr('id', d => d)
            .on("click", function (d) {
                d3.selectAll('.selected-host').classed('selected-host', false)
                self.updateChart(d)
                d3.select(this).classed('selected-host', true)
            });
        let yearText = self.svg.selectAll("text").data(self.yearData);
        let text = yearText.enter().append("text");

        yearText.exit().remove();
        yearText = text.merge(yearText);

        yearText.attr("x", d => yrScale(d) - 20)
            .attr("y", self.svgHeight / 2 + 30)
            .attr("class", "yearText")
            .text(d => d)
            .attr('color', (d, i) => color(i));

        this.svg = this.divChart.append('svg').attr("width", (this.svgWidth + this.margin.left + this.margin.right))
            .attr("height", (this.svgHeight + this.margin.top + this.margin.bottom))
            .append('g')
            .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')')
            .attr('id', 'hostPerformanceAxis')


        this.drawXAxis(this.svg, this.svgWidth, this.svgHeight, this.yearData)
        this.drawYAxis(this.svg, this.svgWidth, this.svgHeight,  [0, max])

        this.svg.append("text")
            .attr("x", (this.svgWidth / 2) - this.margin.right)
            .attr("y", 0 - (this.margin.top / 2))
            .attr("text-anchor", "middle")
            .style("font-size", "16px")
            .style("text-decoration", "underline")
            .text("Total Medal Count");

        this.svg.append("text")
            .attr("transform",
                "translate(" + (this.svgWidth/2) + " ," +
                (this.svgHeight + this.margin.top) + ")")
            .attr('id', 'xLabelLine')
            .style("text-anchor", "middle")
            .text("Countries");

        this.svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - this.margin.left + 20)
            .attr("x",0 - (this.svgHeight / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("Total medals");

    }


    updateChart(year) {
        let self = this;
        d3.select('#hostPerformance').remove();
        let i = 0;
        let dataArray = [];
        for(let i = 0; i < this.countriesList.length; i++) {
            let dataPoints = [];
            let dataObj = {};
            for(let j = 0; j < this.yearDataVal.length; j++) {
                if(this.countryAggregate[this.countriesList[i]][this.yearDataVal[j]] && this.countryAggregate[this.countriesList[i]][this.yearDataVal[j]]['medals']['total']) {
                    dataPoints.push({
                        year: this.yearData[j],
                        medals: this.countryAggregate[this.countriesList[i]][this.yearDataVal[j]]['medals']['total']
                    })
                }
                else {
                    dataPoints.push({
                        year: this.yearData[j],
                        medals: 0
                    })

                }

                if( this.yearData[j] == year) {
                    break;
                }
            }
            dataArray.push({
                'country': this.countriesList[i],
                'points': dataPoints
            })
        }
        let svg = this.svg.append('g').attr('id', 'hostPerformance')

        let yScale = d3.scaleLinear().range([this.svgHeight, 0]).domain([0, 170]);
        let xScale = d3.scalePoint().range([0, this.svgWidth ]).domain(this.yearData);
        let line = d3.line()
            .x(d => xScale(d.year))
            .y(d => yScale(d.medals));

        let lines = svg.append('g')
            .attr('class', 'lines');

        let color = d3.scaleOrdinal().range([
            "#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf", "#484454", '#573957', '#383630'
        ]);

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
                    .attr("x", self.svgWidth/2)
                    .attr("y", 5);
            })
            .on("mouseout", function(d) {
                svg.select(".title-text").remove();
            })
            .append('path')
            .attr('class', 'line')
            .attr('id', d => d.country + '_host_line')
            .attr('opacity', 0.6)
            .attr('d', d => line(d.points))
            //.attr('class', 'line-click')
            .style('stroke', (d, i) => self.colorList[d.country])
            .style('stroke-width', '4px')
            .on("mouseover", function(d) {
                d3.selectAll('.circle')
                    .style('opacity', 0.8);
                d3.select(this)
                    .classed('selected-line', true)
                    .classed('line', false)
                    .style("cursor", "pointer");
            })
            .on("mouseout", function(d) {
                d3.selectAll('.circle')
                    .style('opacity', 0.2);
                d3.select(this)
                    .style("cursor", "none");
                d3.select(this).classed('selected-line', false)
                d3.select(this).classed('line', true)

            })
        /* .on('click', function () {
            // d3.select(this).classed("myCssClass", d3.select(this).classed("myCssClass") ? false : true);
             d3.select(this).classed('selected-line-click', !d3.select(this).classed("selected-line-click"))
             d3.select(this).classed('line-click', !d3.select(this).classed("line-click"))

         });*/



        lines.selectAll("circle-group")
            .data(dataArray).enter()
            .append("g")
            .style("fill", (d, i) => color(i))
            .selectAll("circle")
            .data(d => d.points).enter()
            .append("g")
            .attr("class", "circle")
            .attr("class", "circle-group")

            .on("mouseover", function(d) {
                d3.select(this)
                    .style("cursor", "pointer")
                    .append("text")
                    .attr("class", "text")
                    .text(`${d['medals']}`)
                    .attr("x", d => xScale(d.year) + 5)
                    .attr("y", d => yScale(d.medals) - 10);
            })
            .on("mouseout", function(d) {
                d3.select(this)
                    .style("cursor", "none")
                    .transition()
                    .duration(10)
                    .selectAll(".text").remove();
            })
            .append("circle")
            .attr("cx", d => xScale(d.year))
            .attr("cy", d => yScale(d.medals))
            .attr("r", 2)
            .style('opacity', 2)
            .on("mouseover", function(d) {
                d3.select(this)
                    .transition()
                    .duration(10)
                    .attr("r", 5);
            })
            .on("mouseout", function(d) {
                d3.select(this)
                    .transition()
                    .duration(10)
                    .attr("r", 2);
            });
    }

    updateStory(index) {
        d3.selectAll('.selected-host').classed('selected-host', false)
        let year = this.yearData[index]
        console.log(year)
        this.updateChart(year)
        document.getElementById(year).classList.add('selected-host')
    }
}