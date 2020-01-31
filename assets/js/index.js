
import { createSunburst, nodeClick } from './d3/sunburst/sunburst.js';

const apiUrl = `https://demo.kustodian.org/api/report/sunburst`;

getSunburstDataAsync(2)
  .then(data => { 
    console.log(data);
    createSunburst(document.getElementById('sunburst'), data);
  });

async function getSunburstDataAsync(dewarId) 
{
  let response = await fetch(`${apiUrl}/${dewarId}`);
  let data = await response.json()
  return data;
}