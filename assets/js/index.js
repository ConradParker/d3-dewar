import { createSunburst, nodeClick } from './d3/sunburst/sunburst.js';
import dewarInfoPanel from './d3/sunburst/informationPanel.js';
import breadcrumbs from './d3/sunburst/breadcrumbs.js';

const apiUrl = `https://demo.kustodian.org/api/report/sunburst/2`;

// Set up elements
let sunburstElement;
let breadcrumbsElement;
let infoElement;

/**
 * Fetch the data
 * @param {integer} dewarId The Id of the dewar
 */
async function getSunburstDataAsync() 
{
  let response = await fetch(apiUrl);
  let data = await response.json()
  return data;
}

/**
 * Initialise the page
 * @param {*} event The event
 */
async function initialisePageAsync(sunburstEle, breadcrumbsEle, infoEle) {
  
  // Set up elements
  sunburstElement = sunburstEle;
  breadcrumbsElement = breadcrumbsEle;
  infoElement = infoEle;

  // Subscribe to the node click events from the Sunburst and Breadcrumbs
  sunburstElement.addEventListener('sunburstNodeClicked', sunburstClickEventHandler);
  breadcrumbsElement.addEventListener('breadcrumbNodeClicked', breadcrumbClickEventHandler);

  loadData();
}

/**
 * Load the data into the elements
 */
async function loadData() {
  const data = await getSunburstDataAsync();
  const dewarNode = createSunburst(sunburstElement, data);
  breadcrumbs(breadcrumbsElement, dewarNode);
  dewarInfoPanel(infoElement, dewarNode);
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

export { initialisePageAsync };
export { loadData };
