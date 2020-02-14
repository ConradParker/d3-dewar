import sunburstConfig from '../baseD3Config.js';
import { nodeColour } from './nodeHelper.js';

const config = sunburstConfig();

// Breadcrumb dimensions: width, height, spacing, width of tip/tail.
const breadcrumbDimensions = {
  width: 145, height: 30, space: 5, tail: 20,
};

function breadcrumbClick(element, node) {
  const event = new CustomEvent('breadcrumbNodeClicked', { detail: node });
  element.dispatchEvent(event);
}
/**
 * Generate a string that describes the points of a breadcrumb polygon.
 * @param {number} d The number
 * @param {number} i The number
 * @return {Array} points
 */
function breadcrumbPoints(d, i) {
  const points = [];
  points.push('0,0');
  points.push(`${breadcrumbDimensions.width},0`);
  points.push(`${breadcrumbDimensions.width + breadcrumbDimensions.tail},${breadcrumbDimensions.height / 2}`);
  points.push(`${breadcrumbDimensions.width},${breadcrumbDimensions.height}`);
  points.push(`0,${breadcrumbDimensions.height}`);
  if (i > 0) { // Leftmost breadcrumb; don't include 6th vertex.
    points.push(`${breadcrumbDimensions.tail},${breadcrumbDimensions.height / 2}`);
  }
  return points.join(' ');
}

/**
 * Update the breadcrumb trail to show the current sequence and percentage.
 * @param {Array} nodeArray The array of nodes to display in the list
 * @param {string} percentageString The string to display at the end of the list
 */
function updateBreadcrumbs(element, nodeArray, percentageString) {
  // Data join; key function combines name and depth (= position in sequence).
  const trail = d3.select('#trail')
    .selectAll('g')
    .data(nodeArray, node => node.data.text + node.depth);

  // Remove exiting nodes.
  trail.exit().remove();

  // Add breadcrumb and label for entering nodes.
  const entering = trail.enter().append('g');

  entering.append('polygon')
    .attr('points', breadcrumbPoints)
    .style('stroke', config.borderColour)
    .style('fill', nodeColour)
    .style('cursor', 'pointer')
    .on('click', node => breadcrumbClick(element, node))
    .style('display', node => (node.data.text.length > 0 ? 'block' : 'none'));

  entering.append('text')
    .attr('x', (breadcrumbDimensions.width + breadcrumbDimensions.tail) / 2)
    .attr('y', breadcrumbDimensions.height / 2)
    .attr('dy', '0.35em')
    .attr('text-anchor', 'middle')
    .style('fill', config.textColour)
    .style('cursor', 'pointer')
    .style('text-shadow', '0 0 0.2em #333, 0 0 0.2em #333, 0 0 0.2em #333')
    .on('click', node => breadcrumbClick(element, node))
    .text(node => node.data.text);

  // Merge enter and update selections; set position for all nodes.
  entering.merge(trail).attr('transform', (node, i) => `translate(${i * (breadcrumbDimensions.width + breadcrumbDimensions.space)}, 0)`);

  // Now move and update the percentage at the end.
  d3.select('#trail').select('#endlabel')
    .attr('x', (nodeArray.length + 0.5) * (breadcrumbDimensions.width + breadcrumbDimensions.space))
    .attr('y', breadcrumbDimensions.height / 2)
    .attr('dy', '0.35em')
    .attr('text-anchor', 'middle')
    .text(percentageString);
}

export default function (element, node) {
  const d3Element = d3.select(element);

  // Clear the info element
  d3Element.html(null);

  // Setup the breadcrumb element
  d3.select(element)
    .append('svg')
    .attr('preserveAspectRatio', 'xMinYMin slice')
    .attr('viewBox', '0 0 720 720')
    .attr('width', '100%')
    .attr('height', breadcrumbDimensions.height)
    .attr('id', 'trail')
    .append('text')
    .attr('id', 'endlabel')
    .style('fill', config.textColour);

  // Update breadcrumbs
  updateBreadcrumbs(element, node.ancestors().reverse(), `${node.data.capacity === 0 ? 0 : Math.round((node.data.size / node.data.capacity) * 100)}% Full`);
}
