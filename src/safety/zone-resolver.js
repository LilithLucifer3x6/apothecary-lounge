/**
 * Zone-based conflict resolution mapping and utilities.
 */

export const ZONES = {
  'scalp': { adjacentTo: ['hairline-edges'] },
  'hairline-edges': { adjacentTo: ['scalp', 'face-upper', 'full-face'] },
  'orbital-eyelid': { adjacentTo: ['face-upper', 'face-mid', 'full-face'] },
  'face-upper': { adjacentTo: ['hairline-edges', 'orbital-eyelid', 'face-mid', 'full-face'] },
  'face-mid': { adjacentTo: ['face-upper', 'orbital-eyelid', 'face-lower', 'full-face'] },
  'face-lower': { adjacentTo: ['face-mid', 'lips', 'full-face'] },
  'full-face': { adjacentTo: ['hairline-edges', 'scalp', 'lips'] }, 
  'lips': { adjacentTo: ['face-lower', 'oral', 'full-face'] },
  'oral': { adjacentTo: ['lips'] },
  'underarms': { adjacentTo: ['chest-back'] },
  'chest-back': { adjacentTo: ['underarms', 'general-body'] },
  'general-body': { adjacentTo: ['chest-back', 'intimate'] },
  'intimate': { adjacentTo: ['general-body'] }
};

/**
 * Checks if two zone arrays overlap.
 * 
 * @param {string[]} zonesA 
 * @param {string[]} zonesB 
 * @returns {boolean}
 */
export function zonesOverlap(zonesA, zonesB) {
  if (!zonesA || !zonesB || zonesA.length === 0 || zonesB.length === 0) return false;
  
  const faceSubZones = ['face-upper', 'face-mid', 'face-lower', 'orbital-eyelid'];
  
  for (const a of zonesA) {
    if (zonesB.includes(a)) return true;
    
    // Handle full-face logic
    if (a === 'full-face' && zonesB.some(b => faceSubZones.includes(b))) return true;
    if (faceSubZones.includes(a) && zonesB.includes('full-face')) return true;
  }
  
  return false;
}

/**
 * Checks if zones are adjacent based on the ZONES mapping.
 * 
 * @param {string[]} zonesA 
 * @param {string[]} zonesB 
 * @returns {boolean}
 */
export function zonesAdjacent(zonesA, zonesB) {
  if (!zonesA || !zonesB || zonesA.length === 0 || zonesB.length === 0) return false;
  
  for (const a of zonesA) {
    const zoneDef = ZONES[a];
    if (zoneDef && zoneDef.adjacentTo) {
      if (zonesB.some(b => zoneDef.adjacentTo.includes(b))) {
        return true;
      }
    }
  }
  
  return false;
}

