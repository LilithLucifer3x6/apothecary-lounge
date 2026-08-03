import React from 'react';
import { ic } from '../lib/icons.js';

export default function Icon({ name }) {
  if (!name) return null;
  
  // Fix missing ph-gear
  let finalName = name === 'ph-gear' || name === 'gear' ? 'gear' : name;
  return <span style={{ display: 'inline-flex', alignItems: 'center' }} dangerouslySetInnerHTML={{ __html: ic(finalName) }} />;
}
