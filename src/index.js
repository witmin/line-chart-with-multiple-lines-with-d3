import {
    select,
    csv,
    scaleLinear,
    scaleTime,
    extent,
    axisLeft,
    axisBottom,
    line,
    curveBasis,
    nest,
    scaleOrdinal,
    schemeCategory10,
    descending
} from 'd3';

import {colorLegend} from "./colorLegend";

const svg = select('svg');

const width = +svg.attr('width');
const height = +svg.attr('height');

const render = data => {
    const titleText = 'A Week of Temperature Around the World';
    const xValue = d => d.timestamp;
    const xAxisLabel = 'Time';
    const yValue = d => d.temperature;
    const yAxisLabel = 'Temperature';

    const colorValue = d => d.city;

    const margin = {top: 80, right: 0, bottom: 70, left: 105};
    const innerWidth = width - margin.left - margin.right - 152;
    const innerHeight = height - margin.top - margin.bottom;

    const xScale = scaleTime()
        .domain(extent(data, xValue))
        .range([0, innerWidth])
        .nice();

    const yScale = scaleLinear()
        .domain(extent(data, yValue))
        .range([innerHeight, 0])
        .nice();

    const colorScale = scaleOrdinal(schemeCategory10);

    const g = svg.append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    const xAxis = axisBottom(xScale)
        .tickSize(-innerHeight)
        .tickPadding(15);

    const yAxis = axisLeft(yScale)
        .tickSize(-innerWidth)
        .tickPadding(10);

    const yAxisG = g.append('g').call(yAxis);
    yAxisG.selectAll('.domain').remove();

    yAxisG.append('text')
        .attr('class', 'axis-label')
        .attr('x', -innerHeight / 2)
        .attr('y', -65)
        .attr('fill', 'black')
        .attr('text-anchor', 'middle')
        .attr('transform', `rotate(-90)`)
        .text(yAxisLabel);


    const xAxisG = g.append('g').call(xAxis)
        .attr('transform', `translate(0, ${innerHeight})`);

    xAxisG.select('.domain').remove();

    xAxisG.append('text')
        .attr('class', 'axis-label')
        .attr('y', 60)
        .attr('x', innerWidth / 2)
        .attr('fill', 'black')
        .text(xAxisLabel);

    const lineGenerator = line()
        .x(d => xScale(xValue(d)))
        .y(d => yScale(yValue(d)))
        .curve(curveBasis);

    const lastYValue = d => yValue(d.values[d.values.length - 1]);

    const nested = nest()
        .key(colorValue)
        .entries(data)
        .sort((a, b) => descending(lastYValue(a), lastYValue(b)));

    colorScale.domain(nested.map(d => d.key));
    console.log(nested);

    g.selectAll('line-path').data(nested)
        .enter().append('path')
        .attr('class', 'line-path')
        .attr('d', d => lineGenerator(d.values))
        .attr('stroke', d => colorScale(d.key));

    g.append('text')
        .attr('class', 'title')
        .attr('y', -10)
        .text(titleText);

    svg.append('g')
        .attr('transform', `translate(800, 140)`)
        .call(colorLegend, {
            colorScale,
            spacing: 32,
            textOffset: 22,
            circleRadius: 10
        });
};

csv('data-canvas-sense-your-city-one-week.csv').then(data => {
    data.forEach(d => {
        d.timestamp = new Date(d.timestamp);
        d.temperature = +d.temperature;
    });
    render(data);
});