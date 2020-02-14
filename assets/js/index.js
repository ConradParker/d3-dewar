import { createSunburst, nodeClick } from './d3/sunburst/sunburst.js';
import dewarInfoPanel from './d3/sunburst/informationPanel.js';
import breadcrumbs from './d3/sunburst/breadcrumbs.js';

const apiUrl = `https://demo.kustodian.org/api/report/sunburst`;

// Set up elements
const sunburstElement = document.getElementById('sunburst');
const breadcrumbsElement = document.getElementById('breadcrumbs');
const infoElement = document.getElementById('info-panel');

// Subscribe to the node click events from the Sunburst and Breadcrumbs
sunburstElement.addEventListener('sunburstNodeClicked', sunburstClickEventHandler);
breadcrumbsElement.addEventListener('breadcrumbNodeClicked', breadcrumbClickEventHandler);

// Setup the page
getSunburstDataAsync(2)
  .then(data => { 
    console.log(data);
    const dewarNode = createSunburst(sunburstElement, data);
    breadcrumbs(breadcrumbsElement, dewarNode);
    dewarInfoPanel(infoElement, dewarNode);
  });

/**
 * Fetch the data
 * @param {integer} dewarId The Id of the dewar
 */
async function getSunburstDataAsync(dewarId) 
{
  let response = await fetch(`${apiUrl}/${dewarId}`);
  let data = await response.json()
  return data;
}

/**
 * Handle a sunburst node click event
 * @param {*} event The event
 */
function sunburstClickEventHandler(event) {
  breadcrumbs(breadcrumbsElement, event.detail);
  dewarInfoPanel(infoElement, event.detail);
}

/**
 * Handle a breadcrumb node click event
 * @param {*} event The event
 */
function breadcrumbClickEventHandler(event) {
  nodeClick(event.detail);
  breadcrumbs(breadcrumbsElement, event.detail);
  dewarInfoPanel(infoElement, event.detail);
}