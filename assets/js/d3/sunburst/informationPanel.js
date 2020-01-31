import * as d3 from 'd3';

const itemApiUrl = 'https://demo.kustodian.org/api/item/';
let d3Element;

/**
 * Format the date
 * @param {date} date The date to format
 * @return {string} The formatted date
 */
function formatDate(date) {
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const day = date.getDate();
  const monthIndex = date.getMonth();
  const year = date.getFullYear();

  return `${day} ${monthNames[monthIndex]} ${year}`;
}

export default function (element, node) {
  d3Element = d3.select(element);

  // Clear the info element
  d3Element.html(null);

  /**
   * Display the removal info
   * @param {data} data The node data
   */
  function displayRemovalInfo(itemData) {
    if (itemData.remove) {
      d3Element.append('p').text('Awaiting Removal');
    }
  }

  /**
   * Display item information
   * @param {json} itemData The item data
   */
  function setItemText(itemData) {
    if (itemData.patient && itemData.patient.length > 0) {
      d3Element.append('p').text(`Patient: ${itemData.patient}`);
    }
    if (itemData.expiryDate && itemData.patient.length > 0) {
      const expiryDate = new Date(itemData.expiryDate);
      d3Element.append('p')
        .attr('style', `color: ${itemData.borderColour}`)
        .text(`Expiry Date: ${formatDate(expiryDate)}`);
    }
    if (itemData.itemType === 'Storage' || itemData.itemType === 'Container') {
      displayRemovalInfo(itemData);
    }
  }

  /**
   * Display the node info
   */
  function setNodeText() {
    let percentageText;
    if (node.data.capacity === 0 || Math.round((node.data.size / node.data.capacity) * 100) === 0) {
      percentageText = 'Empty';
    } else {
      percentageText = `${Math.round((node.data.size / node.data.capacity) * 100)}% Full`;
    }
    const contentsText = `Contains: ${node.data.size} of ${node.data.capacity}`;
    d3Element.append('p').text(`${contentsText} - ${percentageText}`);
    if (node.data.rfid) d3Element.append('p').text(`RFID: ${node.data.rfid}`);

    // Loop display list
    if (node.data.displayList !== null) {
      node.data.displayList.forEach((value) => {
        const infoDiv = d3Element.append('div');
        infoDiv.append('p')
          .style('color', '#d9534f')
          .text(value);
      });
    }
  }

  /**
   * Display the info
   */
  function setInfoPanelText() {
    d3Element.append('h2')
      .text(node.data.text)
      .style('margin-bottom', '18px')
      .append('hr');

    if (node.data.itemId === 0) {
      setNodeText();
      return;
    }
    // Load extra item data
    d3.json(`${itemApiUrl}${node.data.itemId}`).then((itemData) => {
      setItemText(itemData);
      setNodeText();
    });
  }

  setInfoPanelText();
}
