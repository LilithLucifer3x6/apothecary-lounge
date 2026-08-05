import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ic } from './src/lib/icons.jsx';

const testCases = ['altar', 'unknown-name', 'drop'];
testCases.forEach(name => {
  try {
    const html = renderToStaticMarkup(ic(name));
    console.log('Icon:', name, '->', html);
  } catch (err) {
    console.error('Error on', name, err.message);
  }
});
