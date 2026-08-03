import React from 'react';
import { ic } from '../lib/icons.js';

export default function Icon({ name }) {
  if (!name) return null;
  return <span style={{ display: 'inline-flex', alignItems: 'center' }} dangerouslySetInnerHTML={{ __html: ic(name) }} />;
}
