const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

// Load removeChips from app.js without executing the entire script
const appPath = path.resolve(__dirname, '../assets/js/app.js');
const fileContent = fs.readFileSync(appPath, 'utf8');
const removeChipsMatch = fileContent.match(/function removeChips\(\)\{[\s\S]*?\}/);
let removeChips;
if (removeChipsMatch) {
  // eslint-disable-next-line no-new-func
  removeChips = new Function(`${removeChipsMatch[0]}; return removeChips;`)();
} else {
  throw new Error('removeChips function not found');
}

describe('removeChips', () => {
  test('removes all elements with class "chip" from the DOM', () => {
    const dom = new JSDOM('<!doctype html><html><body></body></html>');
    const { document } = dom.window;
    global.document = document;

    for (let i = 0; i < 3; i++) {
      const chip = document.createElement('div');
      chip.className = 'chip';
      document.body.appendChild(chip);
    }

    expect(document.getElementsByClassName('chip').length).toBe(3);
    removeChips();
    expect(document.getElementsByClassName('chip').length).toBe(0);
  });
});
