const fs = require('fs');
const path = require('path');

const appPath = path.resolve(__dirname, '../assets/js/app.js');
const fileContent = fs.readFileSync(appPath, 'utf8');
const match = fileContent.match(/function getHotNumbers\(count\)\{[\s\S]*?\}/);
let getHotNumbers;
if (match) {
  // eslint-disable-next-line no-new-func
  getHotNumbers = new Function(`${match[0]}; return getHotNumbers;`)();
} else {
  throw new Error('getHotNumbers function not found');
}

describe('getHotNumbers', () => {
  test('returns numbers with highest frequency', () => {
    global.previousNumbers = [1, 2, 3, 2, 2, 1];
    expect(getHotNumbers(2)).toEqual([2, 1]);
  });
});
