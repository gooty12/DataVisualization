class EntryData {

    constructor(sport, year, value, x, y) {
        this.sport = sport
        this.year = year
        this.value = value
        this.x = x
        this.y = y
    }
}

class AggregateViews {
    constructor(yearAggregate, countryAggregate, sportAggregate) {
        this.yearAggregate = yearAggregate;
        this.countryAggregate = countryAggregate;
        this.sportAggregate = sportAggregate;
    }

    drawHeatMap() {
        console.log(Object.entries(this.sportAggregate))
        let allEntries = Object.entries(this.sportAggregate);

        let tempEntries = []
        for (let i = 0; i < 23; i++) {
            tempEntries.push(allEntries[i]);
        }
        allEntries = tempEntries;
        let sports = allEntries.map( obj => obj[0])
        //console.log(sports)
        let years = []
        for (let yr = 1896; yr <= 2012; yr +=4) {
            if (yr !== 1940 && yr !== 1944) {
                years.push(yr);
            }
        }
        //console.log(years)
        console.log(allEntries.length)
        let data = []
        for (let i = 0; i < allEntries.length; i++) {
            let sport = allEntries[i][0]
            let yearWiseData = allEntries[i][1]
          // console.log(value)
           for (let j = 0; j < years.length; j++) {
                let yr = years[j];
                //let value = yearWiseData[yr]["medals"]["total"] ? yearWiseData[yr]["medals"]["total"] : 0
               let value = 0;
               if (yearWiseData[yr]) {
                   value = yearWiseData[yr]["medals"]["total"]
               }
                data.push(new EntryData(sport, yr, value, i, j))
            }
        }

        console.log(data)
        var margin = { top: 50, right: 0, bottom: 100, left: 100 },
            width = 1200 - margin.left - margin.right,
            height = 960 - margin.top - margin.bottom,
            gridSize = Math.floor(width / 30),
            buckets = 9,
            colors =  ["#deebf7", "#c6dbef", "#9ecae1", "#6baed6", "#4292c6" ,"#2171b5", "#08519c", "#08306b"]
                //["#ffffd9","#edf8b1","#c7e9b4","#7fcdbb","#41b6c4","#1d91c0","#225ea8","#253494","#081d58"];// alternatively colorbrewer.YlGnBu[9]


        var svg = d3.select("#heatmapView").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .attr('id', 'heatMapSvg')
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        var sportLabels = svg.selectAll(".sportLabel")
            .data(sports)
            .enter().append("text")
            .text(function (d) { return d; })
            .attr("x", 0)
            .attr("y", function (d, i) { return i * gridSize; })
            .style("text-anchor", "end")
            .attr("transform", "translate(-6," + gridSize / 1.5 + ")")
            .attr("class", function (d, i) { return ((i >= 0 && i <= 4) ? "dayLabel mono axis axis-workweek" : "dayLabel mono axis"); });

        var yearLabels = svg.selectAll(".yearLabel")
            .data(years)
            .enter().append("text")
            .text(function(d) { return d; })
            .attr("x", 7)
            .attr("y", function(d, i) { return i * gridSize; })
            .style("text-anchor", "middle")
            .attr("transform", "translate(" + gridSize / 2 + ", -6) rotate (-90)")
            .attr("class", function(d, i) { return ((i >= 7 && i <= 16) ? "timeLabel mono axis axis-worktime" : "timeLabel mono axis"); });

        var colorScale = d3.scaleLinear()
            .domain([0, 10, 20, 30, 40, 50, 60, d3.max(data, function (d) { return parseFloat(+d.value); })])
            .range(colors);

/*
        let fills = colorbrewer.RdBu[6];
        let colorScale =  d3.scale.linear().domain(d3.range(0, 1, 1.0 / (fills.length - 1))).range(fills);
*/

        var cards = svg.selectAll(".hour")
            .data(data, function(d) {return d.sport+':'+d.year;})
        //.append("title");

       // cards.append("title");

        cards.enter().append("rect")
            .attr("x", function(d) { return (d.y) * gridSize; })
            .attr("y", function(d) { return (d.x) * gridSize; })
            .attr("rx", 4)
            .attr("ry", 4)
            .attr("class", "hour bordered")
            .attr("width", gridSize)
            .attr("height", gridSize)
            .style("fill", function(d) { return colorScale(parseFloat(+d.value)); })
            .append("title")
            .text(function(d) { return parseFloat(+d.value); });

        cards.transition().duration(1000)
            .style("fill", function(d) { return colorScale(parseFloat(+d.value)); });

       // cards.select("title").text(function(d) { return parseFloat(+d.value); });

        cards.exit().remove();


    }
}