class BarChart {
    constructor() {
        this.margin = {top: 50, right: 30, bottom: 30, left: 70};
    }

    drawXAxis(svg, width, height, scale) {
        let xAxis = d3.axisBottom(scale)
        svg.append('g')
            .attr('transform', 'translate(0,' + height + ')')
            .classed('x axis', true)
            .call(xAxis);
    }

    drawYAxis(svg, height,scale) {
        svg.append("g").call(d3.axisLeft(scale));
    }

    drawSvg(width, heigth, chartId, svg) {
        svg = svg.attr("width", (width + this.margin.left + this.margin.right))
            .attr("height", (heigth + this.margin.top + this.margin.bottom))
            .append('g')
            .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')')
            .attr('id', 'medalCounts')

    }

    drawBarChart(data, width, height, svg, chartId, xScale, yScale, xLambda, yLambda, xLabel, yLabel, info) {
        this.drawSvg(width, height, chartId, svg)
        this.drawXAxis(svg, width , height, xScale)
        this.drawYAxis(svg, height, yScale)

        let rect = svg.selectAll("rect").data(data);
        let newRect = rect.enter().append("rect");

        rect.exit().remove();
        rect = newRect.merge(rect).attr("width", d => 20)
            .attr("height", yScale(yLambda)/ + height)
            .attr("x", xScale(xLambda))
            .attr("y",  yScale(yLambda))
            .attr("id", xLambda + '_medals_count')


        svg.append("text")
            .attr("x", (width / 2))
            .attr("y", 0 - (this.margin.top / 2))
            .attr("text-anchor", "middle")
            .style("font-size", "16px")
            .style("text-decoration", "underline")
            .text("Top performers");

        svg.append("text")
            .attr("transform",
                "translate(" + (width/2) + " ," +
                (height + this.margin.top) + ")")
            .attr('id', 'xLabelLine')
            .style("text-anchor", "middle")
            .text(xLabel);

        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - this.margin.left + 20)
            .attr("x",0 - (height / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text(yLabel);
    }
}