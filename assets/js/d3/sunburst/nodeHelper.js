import baseConfig from '../baseD3Config.js';

const config = baseConfig();

/**
 * Returns if the node is empty
 * @param {object} node The node to check
 * @return {boolean} True if empty
 */
function isEmpty(node) {
  return node.text === '';
}

/**
 * Returns is a position node with Children
 * @param {*} node The node to check
 * @return {boolean} True if empty
 */
function hasContents(node) {
  return node.data.children ? !node.data.children.every(isEmpty) : false;
}

/**
 * Return the node colour
 * @param {object} d The node
 * @return {string} The colour of the node
 */
function nodeColour(d) {
  if (d.data.colour) {
    return d.data.colour;
  } else if (d.depth === 1) {
    if (hasContents(d)) {
      return config.kustodianColour;
    }
    return config.textColour;
  }
  return config.clearColour;
}

export { nodeColour };
export { isEmpty };
