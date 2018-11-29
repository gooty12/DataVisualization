class YearChart {

    constructor (mapObject) {

        //Creating Map Object instance

        // Initializes the svg elements required for this chart

        this.margin = {top: 10, right: 20, bottom: 30, left: 20};
        let divmap = d3.select("#yearwise").classed("content", true);

        //fetch the svg bounds
        this.svgBounds = divmap.node().getBoundingClientRect();
        this.svgWidth = this.svgBounds.width - this.margin.left - this.margin.right;
        this.svgHeight = 100;

        //add the svg to the div
        this.svg = divmap.append("svg")
            .attr("width",this.svgWidth)
            .attr("height",this.svgHeight)
            .attr("transform", "translate(0 ,0)")




        //   let yearcircles = d3.select("#yearwise")

        //this.svgWidth = 700
        // this.svgHeight = 100

        //add the svg to the div
        //  this.svg = yearcircles.append("svg")
        //      .attr("width", this.svgWidth)
        //     .attr("height", this.svgHeight)
        //   .attr("transform", "translate(0 ,0)")
    };


    update (year)
    {

        let this_ = this;
        let yearData = [1960, 1964, 1968, 1972, 1976, 1980, 1984, 1988, 1992, 1996, 2000, 2004, 2008, 2012, 'All'];
        let xScale = d3.scaleBand()
            .domain([1960, 1964, 1968, 1972, 1976, 1980, 1984, 1988, 1992, 1996, 2000, 2004, 2008, 2012, 'All'])
            .range([this.margin.left, this.svgWidth])

        let dashlineSelect = this.svg.selectAll('line').data([1])

        let dashline = dashlineSelect.enter()
            .append('line')
            .attr('x1', xScale(1))
            .attr('y1', (this_.svgHeight/2)- this_.margin.bottom)
            .attr('x2', xScale('All'))
            .attr('y2', (this_.svgHeight/2) - this_.margin.bottom)
            .attr('stroke-dasharray',"10,1")
            .attr('stroke-width',2)
            .style('stroke', 'black');
        dashlineSelect.merge(dashline);
        dashlineSelect.exit().remove();
        let container1 = this.svg.selectAll('g').data([0]);
        let newContainer =container1.enter().append('g').merge(container1);
        newContainer.exit().remove()


        let yrChartSelection = this.svg
            .selectAll('circle')
            .data(yearData);

        let yrChart = yrChartSelection.enter().append('circle')
            .attr('cx',function(d){
                return xScale(d);
            })
            .attr('cy', (this_.svgHeight/2) - this_.margin.bottom )
            .attr('r',15 )
            .attr('id',function(d){
                return 'x'+d.toString();
            })
            .on('click', function(d){
                d3.selectAll('.highlighted')
                    .classed('highlighted', false)
                d3.select(this)
                    .classed('highlighted',true)
            })
            .style("fill", 'green')
            .on("mouseover",function(d,i)
            {
                d3.select(this).classed("selected",true)
            })
            .on("mouseout",function(d,i)
            {
                d3.select(this).classed("selected",false)
            })

        yrChartSelection.merge(yrChart);
        yrChartSelection.exit().remove();

        let yrTextselect = this.svg.select('g').selectAll('text')
            .data(yearData);

        let yrText = yrTextselect.enter()
            .append('text')
            .attr('x', function(d){
                return xScale(d);
            })
            .attr('y', (this_.svgHeight/2)+this_.margin.top)
            .text(function(d){
                return d;
            })
            .classed('yeartext', true);

        yrTextselect.merge(yrText);
        yrTextselect.exit().remove();

        d3.selectAll('.highlighted')
            .classed('highlighted', false);

        let id = "#x"+year;

        d3.select(id)
            .classed('highlighted',true);

    }

}