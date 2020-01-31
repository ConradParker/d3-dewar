import baseConfig from '../baseD3Config.js';
import { nodeColour, isEmpty } from './nodeHelper.js';

const config = baseConfig();

// Sunburst dimensions
const width = config.reportWidth;
const height = config.reportHeight;
const radius = Math.min(width, height) / 2;

// Scale
const x = d3.scaleLinear().range([0, 2 * Math.PI]);
const y = d3.scaleLinear().range([0, radius]);
const arc = d3.arc()
  .startAngle(d => Math.max(0, Math.min(2 * Math.PI, x(d.x0))))
  .endAngle(d => Math.max(0, Math.min(2 * Math.PI, x(d.x1))))
  .innerRadius(d => Math.max(0, y(d.y0)))
  .outerRadius(d => Math.max(0, y(d.y1)));

// Track selected node
let selectedNode;

/**
 * The border colour
 * @param {*} d The node
 * @return {integer} The width
 */
function lineFillColour(d) {
  if (d.data.borderColour) {
    return d.data.borderColour;
  } else if (d.data && d.data.colour && d.data.colour.toLowerCase() === config.borderColour) {
    return config.textColour;
  }
  return config.borderColour;
}

/**
 * The border width
 * @param {*} d The node
 * @return {integer} The width
 */
function strokeFillWidth(d) {
  if (d.data.borderColour) {
    return 3;
  }
  return d.data.text === '' && d.depth > 1 ? 0 : 1;
}

/**
 * Returns the FontSize of the text
 * @param {*} d The node for which to calculate the size
 * @return {string} The font size e.g 14px
 */
function fontSize(d) {
  const defaultSize = 14;
  const size = d.depth ?
    Math.min(
      ((d.x1 * 900) * 900) / (((d.depth - selectedNode.depth) + 1) ** 0.1),
      defaultSize / (((d.depth - selectedNode.depth) + 1) ** 0.6),
    ) :
    defaultSize;
  return `${size}px`;
}

/**
 * Returns the angle of rotation for the text
 * @param {*} d The node
 * @return {number} The angle of the text
 */
function calculateAngle(d) {
  const formatDecimal = d3.format('.1f');
  const angle = ((x((d.x0 + d.x1) / 2) - (Math.PI / 2)) / Math.PI) * 180;
  return formatDecimal(angle);
}

/**
 * Returns where to anchor the text
 * @param {*} d The node
 * @return {string} 'start' or 'end'
 */
function textAnchor(d) {
  // If we are on the clicked node always anchor at the start
  if (!(d.depth - selectedNode.depth)) {
    return 'start';
  }
  return calculateAngle(d) > 90 ? 'end' : 'start';
}

/**
 * Returns where to anchor the text
 * @param {*} d The node
 * @return {string} The rotation formula
 */
function textRotation(d) {
  let angle = calculateAngle(d);
  const translate = (y(d.y0) + 5);

  // If we are on the clicked node try to make text horizontal
  if (!(d.depth - selectedNode.depth)) {
    angle -= 90;
  }
  return `rotate(${angle})translate(${translate})rotate(${angle > 90 ? -180 : 0})`;
}

/**
 * When switching data: interpolate the arcs in data space.
 * @param {*} a ?
 * @param {*} i ?
 * @return {*} tween
 */
function arcTweenPath(a, i) {
  // (a.x0s ? a.x0s : 0) -- grab the prev saved x0 or set to 0 (for 1st time through)
  // avoids the stash() and allows the sunburst to grow into being
  const oi = d3.interpolate({
    x0: (a.x0s ? a.x0s : 0),
    x1: (a.x1s ? a.x1s : 0),
    y0: (a.y0s ? a.y0s : 0),
    y1: (a.y1s ? a.y1s : 0),
  }, a);

  /**
   * tween
   * @param {*} t ?
   * @return {*} tween
   */
  function tween(t) {
    const d = oi(t);
    return arc(d);
  }
  if (i === 0 && selectedNode) {
    // If on the first arc, adjust the x domain to match the root node at the current zoom level
    const xd = d3.interpolate(x.domain(), [selectedNode.x0, selectedNode.x1]);
    const yd = d3.interpolate(y.domain(), [selectedNode.y0, 1]);
    const yr = d3.interpolate(y.range(), [selectedNode.y0 ? 40 : 0, radius]);

    return (t) => {
      x.domain(xd(t));
      y.domain(yd(t)).range(yr(t));
      return tween(t);
    };
  }
  return tween;
}

/**
 *  When switching data.
 * @param {*} a ?
 * @param {*} i ?
 * @return {string} The formula
 */
function arcTweenText(a) {
  const oi = d3.interpolate({
    x0: (a.x0s ? a.x0s : 0),
    x1: (a.x1s ? a.x1s : 0),
    y0: (a.y0s ? a.y0s : 0),
    y1: (a.y1s ? a.y1s : 0),
  }, a);

  /**
   *  When switching data.
   * @param {*} t ?
   * @return {string} The formula
   */
  function tween(t) {
    const b = oi(t);
    return textRotation(b);
  }
  return tween;
}

/**
 * Handle the node click event
 * @param {*} d The node clicked
 */
function nodeClick(d) {
  // Prevent transition if same or empty
  if (selectedNode === d || isEmpty(d.data)) {
    return;
  }

  // Track the selected node
  selectedNode = d;

  // Hide the text
  d3.select('.dewar-svg').selectAll('text').attr('opacity', 0);

  /**
   * Transition the text
   * @param {*} e ?
   */
  function textTransition(e) {
    // check if the animated element's data e lies within the visible angle span given in d
    if (e.x0 >= d.x0 && e.x0 < d.x1) {
      const tx = d3.select(this.parentNode).selectAll('text');
      tx.transition()
        .attr('opacity', 1)
        .style('font-size', fontSize)
        .attr('text-anchor', textAnchor)
        .attrTween('transform', (f, i) => arcTweenText(f, i));
    }
  }

  d3.select('.dewar-svg').transition()
    .duration(1000)
    .tween('scale', () => arcTweenPath(d, 0))
    .selectAll('path')
    .attrTween('d', a => () => arc(a))
    .on('end', textTransition);
}

/**
 * Handle the node click event
 * @param {*} d The node clicked
 */
function nodeClickEvent(domElement, node) {
  nodeClick(node);
  const event = new CustomEvent('sunburstNodeClicked', { detail: node });
  domElement.dispatchEvent(event);
}

function createSunburst(sunburstElement, jsonData) {
  // Set up the data with d3 partition
  const partition = d3.partition();
  const root = d3.hierarchy(jsonData);
  root.sum(d => (d.children ? 0 : d.capacity));

  // Keep track of selected node
  selectedNode = root;

  // Clear any previous content
  const d3Element = d3.select(sunburstElement);
  d3Element.html(null);

  // Set the main SVG element
  const svg = d3Element
    .append('svg')
    .attr('class', 'dewar-svg')
    .attr('preserveAspectRatio', 'xMinYMin meet')
    .attr('viewBox', `${(width / 2) * -1} ${(height / 2) * -1} ${width} ${height}`)
    .append('g');

    // Set the slices
  svg.selectAll('path')
    .data(partition(root).descendants())
    .enter().append('g')
    .attr('class', 'gslice');
  svg.selectAll('.gslice')
    .append('path')
    .attr('d', arc)
    .style('fill', nodeColour)
    .style('stroke', lineFillColour)
    .style('stroke-width', strokeFillWidth)
    .style('cursor', node => (node.data.text === '' ? 'default' : 'pointer'))
    .on('click', d => nodeClickEvent(sunburstElement, d))
    .transition()
    .duration(1000)
    .attrTween('d', (d, i) => arcTweenPath(d, i));

  // Set the text
  svg.selectAll('.gslice')
    .append('text')
    .style('font-size', fontSize)
    .style('text-shadow', '0 0 0.2em #333, 0 0 0.2em #333, 0 0 0.2em #333')
    .style('cursor', 'pointer')
    .attr('fill', '#fff')
    .attr('text-anchor', textAnchor)
    .attr('transform', textRotation)
    .attr('opacity', 0)
    .attr('dy', '.35em')
    .attr('display', d => (d.depth ? null : 'none'))
    .text(d => (d.depth ? d.data.text : ''))
    .on('click', d => nodeClickEvent(sunburstElement, d));

  svg.selectAll('text')
    .transition()
    .on('end', () => {
      svg.selectAll('text').attr('text-anchor', textAnchor);
    })
    .duration(1000)
    .attr('opacity', 1)
    .attrTween('transform', (d, i) => arcTweenText(d, i));

  return selectedNode;
}

export { nodeClick };
export { createSunburst };
