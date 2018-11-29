class Line {
    constructor() {
        this.margin = {top: 50, right: 30, bottom: 30, left: 70};
    }

    drawLineChart(svg, width, height, xlambda, ylambda, xScale, yScale) {
        this.drawXAxis(svg, width, height)
    }

    drawXAxis(svg, width, height, scale) {
        let xAxis = d3.axisBottom(scale)
        svg.append('g')
            .attr('transform', 'translate(0,' + height + ')')
            .classed('x axis', true)
            .call(xAxis);
    }

    drawYAxis(svg, width, height,scale) {
        svg.append("g")
            .call(d3.axisLeft(scale));
    }
}