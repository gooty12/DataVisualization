class LineChart{
    constructor() {

        this.margin = {top: 10, right: 20, bottom: 30, left: 60 };
        let lineDiv = d3.select("#lineChart").classed("content", true);

        //fetch the svg bounds
        this.svgBounds = lineDiv.node().getBoundingClientRect();
        this.svgWidth = this.svgBounds.width - this.margin.left - this.margin.right;
        this.svgHeight = 535;

        //add the svg to the div
        this.svg = lineDiv.append("svg")
            .attr("width",this.svgWidth)
            .attr("height",this.svgHeight)
            .attr("transform", "translate(0,0)")


        //this.svgWidth = 650;
        // this.svgHeight = 535;
        //let lineDiv = d3.select("#lineChart")

        //this.margin = {top: 10, right: 20, bottom: 30, left: 50 };
        // this.svg = lineDiv.append("svg")
        //                  .attr("width",this.svgWidth)
        //                .attr("height",this.svgHeight)
        //              .attr("transform", "translate(0,0)")

        this.svg.append("text")
            .attr("x", (this.svgWidth / 2))
            .attr("y",(15))
            .attr("text-anchor", "middle")
            .style("font-size", "16px")
            .style("text-decoration", "underline")
            .text("Host nation Performance");
        this.linesvg = this.svg.append('g')
            .attr('id', "line1");
        //UNITED STATES
        this.USAsvg = this.svg.append('g')
            .attr('id', "USA");

        //RUSSIA
        this.RUSsvg = this.svg.append('g')
            .attr('id', "RUS");
        //GERMANY
        this.GERsvg = this.svg.append('g')
            .attr('id', "GER");
        //UNITED KINGDOM
        this.GBRsvg = this.svg.append('g')
            .attr('id', "GBR");
        //ITALY
        this.ITAsvg = this.svg.append('g')
            .attr('id', "ITA");
        //CHINA
        this.CHNsvg = this.svg.append('g')
            .attr('id', "CHN");
        //AUSTRALIA
        this.AUSsvg = this.svg.append('g')
            .attr('id', "AUS");
        //JAPAN
        this.JPNsvg = this.svg.append('g')
            .attr('id', "JPN");
        //CANADA
        this.CANsvg = this.svg.append('g')
            .attr('id', "CAN");

        this.xAxis = this.svg.append('g')
            .attr('id', 'xAxis');

        this.yAxis = this.svg.append('g')
            .attr('id', 'yAxis');

        this.yearDataSet={}

        // draw legend
        let typeArr = ["USA","RUS", 'GER', "GBR", "ITA", "CHN", "AUS", "JPN", "CAN"]

        let color = ["#000000", "#56ef89", "#c10b0b","#840ac1","#ffab44", "#8B008B", "#8B0000", "#2F4F4F", "#B22222"]
        let legend = this.svg.selectAll(".legend")
            .data(typeArr)
            .enter().append("g")
            .attr("class", "legend")
            .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

        // draw legend colored rectangles
        legend.append("rect")
            .attr("x", this.svgWidth - 18)
            .attr("width", 18)
            .attr("height", 18)
            .style("fill", function(d, i) { return color[i]; });


        // draw legend text
        legend.append("text")
            .attr("x", this.svgWidth - 24)
            .attr("y", 9)
            .attr("dy", ".35em")
            .style("text-anchor", "end")
            .text(function(d) { return d;})





    }

    updateLine(yearCaseCounts,year){

        // Implement Dictionary to keep track of all the years data
        let THIS  = this;
        let usaCount = 0;
        let rusCount = 0;
        let gerCount = 0;
        let gbrCount = 0;
        let itaCount = 0;
        let chnCount = 0;
        let ausCount = 0;
        let jpnCount = 0;
        let canCount = 0;

        let certefiedExpiredCount = 0;
        console.log(yearCaseCounts,yearCaseCounts[0].value);
        for (let i=0; i<yearCaseCounts.length; i++){
            appCount += parseInt(yearCaseCounts[i].value);
        }
        // console.log(appCount)\\
        let dataObj = {
            "Year": year,
            "Appcount": appCount,
            "USA": yearCaseCounts[0].value,
            "RUS": yearCaseCounts[1].value,
            "GER": yearCaseCounts[2].value,
            "GBR": yearCaseCounts[3].value,
            "ITA": yearCaseCounts[4].value,
            "CHN": yearCaseCounts[5].value,
            "AUS": yearCaseCounts[6].value,
            "JPN": yearCaseCounts[7].value,
            "CAN": yearCaseCounts[8].value,
        };
        this.yearDataSet[year]=dataObj;
        // console.log(this.yearDataSet)
        let yearData = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        let xScale = d3.scaleBand()
            .domain([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
            .range([this.margin.left, this.svgWidth-this.margin.right]);
        let yScale = d3.scaleLinear()
            .domain([0, 300])
            .range([this.svgHeight-this.margin.bottom,this.margin.bottom]);

        // 7. d3's line generator
        let line = d3.line()
            .x(function(d) { return xScale(d.Year)+45; }) // set the x values for the line generator
            .y(function(d) { return yScale(d.Appcount); }) // set the y values for the line generator
            .curve(d3.curveMonotoneX) // apply smoothing to the line


        //X axis
        let xAxis = d3.axisBottom().scale(xScale);
        //
        let yAxis = d3.axisLeft().scale(yScale);

        d3.select('#xAxis')
            .attr("transform", "translate(0,"+(THIS.svgHeight- this.margin.bottom)+")")
            .call(xAxis);

        d3.select("#yAxis")
            .attr("transform", "translate("+this.margin.left+","+0+")")
            .call(yAxis);

        // let dots = this.svg.selectAll('circle').data([appCount]);
        //
        // let dots_update = dots.enter()
        //                       .append('circle')
        //                       .merge(dots)
        //                       .attr('cx', function(d,i){
        //                         return xScale(year)+50  // Hard Coded for now
        //                       })
        //                       .attr('cy', function(d){
        //                         return yScale(d);
        //                       })
        //                       .attr('r',5)
        //                       .style('fill', '');
        // dots.exit().remove()
        let dataset = [];
        for (let i =0; i<= yearData.indexOf(year); i++){
            dataset.push(this.yearDataSet[yearData[i]])
        }
        console.log(dataset);


        let lines = d3.select('#line1').selectAll('line').data(dataset.slice(0,dataset.length -1));
        lines.enter().append('line')
            .merge(lines)
            .attr('x1', function(d,i){
                return xScale(d.Year)+45
            })
            .attr('y1', function(d){
                return yScale(d.Appcount)
            })
            .attr('x2',function(d,i){
                if (i< dataset.length -1){
                    return xScale(dataset[i+1].Year)+45
                }
            })
            .attr('y2', function(d,i){
                if (i< dataset.length -1){
                    return yScale(dataset[i+1].Appcount)
                }
            })
            .attr('class', 'line');

        lines.exit().remove();


        // 12. Appends a circle for each datapoint
        let dots = d3.select('#line1').selectAll(".dot")
            .data(dataset);
        dots.enter().append("circle")
            .merge(dots)
            .attr("class", "dot") // Assign a class for styling
            .attr("cx", function(d, i) { return xScale(d.Year)+45 })
            .attr("cy", function(d) { return yScale(d.Appcount) })
            .attr("r", 5);
        dots.exit().remove();

        // USA
        let linesUSA = d3.select('#USA').selectAll('line').data(dataset.slice(0,dataset.length -1));
        linesUSA.enter().append('line')
            .merge(linesUSA)
            .attr('x1', function(d,i){
                return xScale(d.Year)+45
            })
            .attr('y1', function(d){
                return yScale(d.USA)
            })
            .attr('x2',function(d,i){
                if (i< dataset.length -1){
                    return xScale(dataset[i+1].Year)+45
                }
            })
            .attr('y2', function(d,i){
                if (i< dataset.length -1){
                    return yScale(dataset[i+1].USA)
                }
            })
            .attr('class', 'lineUSA');

        linesUSA.exit().remove();


        // 12. Appends a circle for each datapoint
        let dotsUSA = d3.select('#USA').selectAll(".dot")
            .data(dataset);
        dotsUSA.enter().append("circle")
            .merge(dotsUSA)
            .attr("class", "dot") // Assign a class for styling
            .attr("cx", function(d, i) { return xScale(d.Year)+45 })
            .attr("cy", function(d) { return yScale(d.USA) })
            .attr("r", 2);
        dotSUSA.exit().remove();

        // RUS
        let linesRUS = d3.select('#RUS').selectAll('line').data(dataset.slice(0,dataset.length -1));
        linesRUS.enter().append('line')
            .merge(linesRUS)
            .attr('x1', function(d,i){
                return xScale(d.Year)+45
            })
            .attr('y1', function(d){
                return yScale(d.RUS)
            })
            .attr('x2',function(d,i){
                if (i< dataset.length -1){
                    return xScale(dataset[i+1].Year)+45
                }
            })
            .attr('y2', function(d,i){
                if (i< dataset.length -1){
                    return yScale(dataset[i+1].RUS)
                }
            })
            .attr('class', 'lineRUS');

        linesRUS.exit().remove();


        // 12. Appends a circle for each datapoint
        let dotsRUS = d3.select('#RUS').selectAll(".dot")
            .data(dataset);
        dotsRUS.enter().append("circle")
            .merge(dotsRUS)
            .attr("class", "dot") // Assign a class for styling
            .attr("cx", function(d, i) { return xScale(d.Year)+45 })
            .attr("cy", function(d) { return yScale(d.RUS) })
            .attr("r", 2);
        dotSRUS.exit().remove();

        // GER
        let linesGER = d3.select('#GER').selectAll('line').data(dataset.slice(0,dataset.length -1));
        linesGER.enter().append('line')
            .merge(linesGER)
            .attr('x1', function(d,i){
                return xScale(d.Year)+45
            })
            .attr('y1', function(d){
                return yScale(d.GER)
            })
            .attr('x2',function(d,i){
                if (i< dataset.length -1){
                    return xScale(dataset[i+1].Year)+45
                }
            })
            .attr('y2', function(d,i){
                if (i< dataset.length -1){
                    return yScale(dataset[i+1].GER)
                }
            })
            .attr('class', 'lineGER');

        linesGER.exit().remove();


        // 12. Appends a circle for each datapoint
        let dotsGER = d3.select('#GER').selectAll(".dot")
            .data(dataset);
        dotsGER.enter().append("circle")
            .merge(dotsGER)
            .attr("class", "dot") // Assign a class for styling
            .attr("cx", function(d, i) { return xScale(d.Year)+45 })
            .attr("cy", function(d) { return yScale(d.GER) })
            .attr("r", 2);
        dotSGER.exit().remove();

        // GBR
        let linesGBR= d3.select('#GBR').selectAll('line').data(dataset.slice(0,dataset.length -1));
        linesGBR.enter().append('line')
            .merge(linesGBR)
            .attr('x1', function(d,i){
                return xScale(d.Year)+45
            })
            .attr('y1', function(d){
                return yScale(d.GBR)
            })
            .attr('x2',function(d,i){
                if (i< dataset.length -1){
                    return xScale(dataset[i+1].Year)+45
                }
            })
            .attr('y2', function(d,i){
                if (i< dataset.length -1){
                    return yScale(dataset[i+1].GBR)
                }
            })
            .attr('class', 'lineGBR');

        linesGBR.exit().remove();


        // 12. Appends a circle for each datapoint
        let dotsGBR= d3.select('#GBR').selectAll(".dot")
            .data(dataset);
        dotsGBR.enter().append("circle")
            .merge(dotsGBR)
            .attr("class", "dot") // Assign a class for styling
            .attr("cx", function(d, i) { return xScale(d.Year)+45 })
            .attr("cy", function(d) { return yScale(d.GBR) })
            .attr("r", 2);
        dotSGBR.exit().remove();

        // ITA
        let linesITA= d3.select('#ITA').selectAll('line').data(dataset.slice(0,dataset.length -1));
        linesITA.enter().append('line')
            .merge(linesITA)
            .attr('x1', function(d,i){
                return xScale(d.Year)+45
            })
            .attr('y1', function(d){
                return yScale(d.ITA)
            })
            .attr('x2',function(d,i){
                if (i< dataset.length -1){
                    return xScale(dataset[i+1].Year)+45
                }
            })
            .attr('y2', function(d,i){
                if (i< dataset.length -1){
                    return yScale(dataset[i+1].ITA)
                }
            })
            .attr('class', 'lineITA');

        linesITA.exit().remove();


        // 12. Appends a circle for each datapoint
        let dotsITA= d3.select('#ITA').selectAll(".dot")
            .data(dataset);
        dotsITA.enter().append("circle")
            .merge(dotsITA)
            .attr("class", "dot") // Assign a class for styling
            .attr("cx", function(d, i) { return xScale(d.Year)+45 })
            .attr("cy", function(d) { return yScale(d.ITA) })
            .attr("r", 2);
        dotSITA.exit().remove();

        // CHN
        let linesCHN= d3.select('#CHN').selectAll('line').data(dataset.slice(0,dataset.length -1));
        linesCHN.enter().append('line')
            .merge(linesCHN)
            .attr('x1', function(d,i){
                return xScale(d.Year)+45
            })
            .attr('y1', function(d){
                return yScale(d.CHN)
            })
            .attr('x2',function(d,i){
                if (i< dataset.length -1){
                    return xScale(dataset[i+1].Year)+45
                }
            })
            .attr('y2', function(d,i){
                if (i< dataset.length -1){
                    return yScale(dataset[i+1].CHN)
                }
            })
            .attr('class', 'lineCHN');

        linesCHN.exit().remove();


        // 12. Appends a circle for each datapoint
        let dotsCHN= d3.select('#CHN').selectAll(".dot")
            .data(dataset);
        dotsCHN.enter().append("circle")
            .merge(dotsCHN)
            .attr("class", "dot") // Assign a class for styling
            .attr("cx", function(d, i) { return xScale(d.Year)+45 })
            .attr("cy", function(d) { return yScale(d.CHN) })
            .attr("r", 2);
        dotSCHN.exit().remove();

        // AUS
        let linesAUS= d3.select('#AUS').selectAll('line').data(dataset.slice(0,dataset.length -1));
        linesAUS.enter().append('line')
            .merge(linesAUS)
            .attr('x1', function(d,i){
                return xScale(d.Year)+45
            })
            .attr('y1', function(d){
                return yScale(d.AUS)
            })
            .attr('x2',function(d,i){
                if (i< dataset.length -1){
                    return xScale(dataset[i+1].Year)+45
                }
            })
            .attr('y2', function(d,i){
                if (i< dataset.length -1){
                    return yScale(dataset[i+1].AUS)
                }
            })
            .attr('class', 'lineAUS');

        linesAUS.exit().remove();


        // 12. Appends a circle for each datapoint
        let dotsAUS= d3.select('#AUS').selectAll(".dot")
            .data(dataset);
        dotsAUS.enter().append("circle")
            .merge(dotsAUS)
            .attr("class", "dot") // Assign a class for styling
            .attr("cx", function(d, i) { return xScale(d.Year)+45 })
            .attr("cy", function(d) { return yScale(d.AUS) })
            .attr("r", 2);
        dotSAUS.exit().remove();

        // JPN
        let linesJPN= d3.select('#JPN').selectAll('line').data(dataset.slice(0,dataset.length -1));
        linesJPN.enter().append('line')
            .merge(linesJPN)
            .attr('x1', function(d,i){
                return xScale(d.Year)+45
            })
            .attr('y1', function(d){
                return yScale(d.JPN)
            })
            .attr('x2',function(d,i){
                if (i< dataset.length -1){
                    return xScale(dataset[i+1].Year)+45
                }
            })
            .attr('y2', function(d,i){
                if (i< dataset.length -1){
                    return yScale(dataset[i+1].JPN)
                }
            })
            .attr('class', 'lineJPN');

        linesJPN.exit().remove();


        // 12. Appends a circle for each datapoint
        let dotsJPN= d3.select('#JPN').selectAll(".dot")
            .data(dataset);
        dotsJPN.enter().append("circle")
            .merge(dotsJPN)
            .attr("class", "dot") // Assign a class for styling
            .attr("cx", function(d, i) { return xScale(d.Year)+45 })
            .attr("cy", function(d) { return yScale(d.JPN) })
            .attr("r", 2);
        dotSJPN.exit().remove();

        // CAN
        let linesCAN= d3.select('#CAN').selectAll('line').data(dataset.slice(0,dataset.length -1));
        linesCAN.enter().append('line')
            .merge(linesCAN)
            .attr('x1', function(d,i){
                return xScale(d.Year)+45
            })
            .attr('y1', function(d){
                return yScale(d.CAN)
            })
            .attr('x2',function(d,i){
                if (i< dataset.length -1){
                    return xScale(dataset[i+1].Year)+45
                }
            })
            .attr('y2', function(d,i){
                if (i< dataset.length -1){
                    return yScale(dataset[i+1].CAN)
                }
            })
            .attr('class', 'lineCAN');

        linesCAN.exit().remove();


        // 12. Appends a circle for each datapoint
        let dotsCAN= d3.select('#CAN').selectAll(".dot")
            .data(dataset);
        dotsCAN.enter().append("circle")
            .merge(dotsCAN)
            .attr("class", "dot") // Assign a class for styling
            .attr("cx", function(d, i) { return xScale(d.Year)+45 })
            .attr("cy", function(d) { return yScale(d.CAN) })
            .attr("r", 2);
        dotSCAN.exit().remove();

    }


    // clearLine()


};