/**
 * Test JavaScript file for local git commit testing
 */

function calculateSum(a, b) {
  return a + b;
}

function calculateProduct(a, b) {
  return a * b;
}

function calculateDifference(a, b) {
  return a - b;
}

// Example usage
console.log('Sum:', calculateSum(5, 3));
console.log('Product:', calculateProduct(5, 3));
console.log('Difference:', calculateDifference(5, 3));

// Export functions
module.exports = {
  calculateSum,
  calculateProduct,
  calculateDifference
};