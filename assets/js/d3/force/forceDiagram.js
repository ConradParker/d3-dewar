import EventBus from '@/shared/helpers/eventBus';
import * as d3 from 'd3';
// import forceDiagramConfig from '../baseD3Config';
import liquidFillGauge from '../liquidFill/liquidFillGaugeG';

// const config = forceDiagramConfig();

function createForceDiagram(element, data) {
  const d3Element = d3.select(element);
  d3Element.html(null);

  if (data.length === 0) return;

  const width = window.innerWidth; // config.reportWidth;
  const height = window.innerHeight; // config.reportHeight;

  const svg = d3Element.append('svg')
    .attr('viewBox', `0 0 ${width} ${height}`)
    .attr('preserveAspectRatio', 'xMidYMid meet');

  function draw(forceData) {
    const simulation = d3.forceSimulation()
      // .force('link', d3.forceLink().id(d => d.index))
      .force('charge', d3.forceManyBody().strength(500))
      // .force('charge', d3.forceCollide().radius(d => d.size))
      .force('collision', d3.forceCollide().radius(d => (d.size * 3) / 2))
      .force('center', d3.forceCenter(width / 2, height / 2));

    /* Allow re-assigning parameters as this is how Drag works */
    /* eslint no-param-reassign: 0 */
    function dragStart(d) {
      if (!d3.event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }
    function dragDragged(d) {
      d.fx = d3.event.x;
      d.fy = d3.event.y;
    }
    function dragEnd(d) {
      if (!d3.event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }
    /* eslint no-param-reassign: 1 */

    const node = svg.append('g')
      .attr('class', 'nodes')
      .selectAll('g')
      .data(forceData)
      .enter()
      .append(d => liquidFillGauge(`dewar-${d.id}`, d.size * 2, d.percentageFull))
      .on('click', d => EventBus.$emit('nodeClicked', d.id))
      .call(d3.drag()
        .on('start', dragStart)
        .on('drag', dragDragged)
        .on('end', dragEnd));

    node.append('text')
      .attr('font-size', 20)
      .attr('dx', 12)
      .attr('dy', '.35em')
      .text(d => d.name);

    const ticked = () => {
      // link
      //   .attr('x1', d => d.source.x)
      //   .attr('y1', d => d.source.y)
      //   .attr('x2', d => d.target.x)
      //   .attr('y2', d => d.target.y);

      node
        .attr('transform', d =>
          `translate(
            ${Math.max(d.size, Math.min(width - d.size, d.x))},
            ${Math.max(d.size, Math.min(height - d.size, d.y))})`);
    };

    simulation
      .nodes(forceData)
      .on('tick', ticked);

    // simulation.force('link')
    //   .links(forceData.links);
  }

  draw(data);
}

export default createForceDiagram;
