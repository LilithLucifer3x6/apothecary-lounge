export function generateRite(items, timeOfDay, date) {
  if (!items || items.length === 0) return [];

  // Filter by domain/time
  let activeItems = items.filter(item => {
    const times = item.timeOfDay || item.time_of_day || [];
    if (typeof times === 'string') {
      return times === 'any' || times === timeOfDay || times === 'both';
    }
    if (Array.isArray(times)) {
      return times.includes('any') || times.includes(timeOfDay) || times.includes('both');
    }
    return true; 
  });

  // Sort by layering_weight (thinnest first)
  // layering_weight lives in behavior_flags per the schema (001_core_schema.sql),
  // not at the item root — reading a.layering_weight directly always returned
  // undefined for every item, silently ignoring real per-item weights and
  // treating everything as the same default.
  activeItems.sort((a, b) => {
    const weightA = a.behavior_flags?.layering_weight !== undefined ? a.behavior_flags.layering_weight : 5;
    const weightB = b.behavior_flags?.layering_weight !== undefined ? b.behavior_flags.layering_weight : 5;
    return weightA - weightB;
  });

  let steps = [];
  
  for (const item of activeItems) {
    steps.push({
      item: item,
      stepName: item.name || 'Unnamed Step',
      meta: item.meta || '',
      isOptional: !!(item.isOptional || item.is_optional),
      isRx: !!(item.isRx || item.is_rx),
      isPartnerAssisted: !!(item.isPartnerAssisted || item.is_partner_assisted),
      glyph: item.glyph || 'sparkle',
      timer: item.timer || null
    });

    if (item.requires_rinse) {
      steps.push({
        item: null, // Virtual step
        stepName: 'Rinse & Pat Dry',
        meta: 'Warm water',
        isOptional: false,
        isRx: false,
        isPartnerAssisted: false,
        glyph: 'water-glass',
        timer: null
      });
    }
  }

  // Apply fixed sequences logic (Grin and Evening wind-down)
  const grinOrder = ['floss', 'waterpick', 'mouthwash', 'brush'];
  const windDownOrder = ['shower', 'dry', 'extractions', 'eye mask', 'lotion', 'oil'];

  steps.sort((a, b) => {
    const nameA = (a.stepName || '').toLowerCase();
    const nameB = (b.stepName || '').toLowerCase();

    const getGrinIndex = (name) => grinOrder.findIndex(g => name.includes(g));
    const idxA = getGrinIndex(nameA);
    const idxB = getGrinIndex(nameB);

    if (idxA !== -1 && idxB !== -1) {
      return idxA - idxB;
    }

    if (timeOfDay === 'evening') {
      const getWindIndex = (name) => windDownOrder.findIndex(g => name.includes(g));
      const wIdxA = getWindIndex(nameA);
      const wIdxB = getWindIndex(nameB);

      if (wIdxA !== -1 && wIdxB !== -1) {
        return wIdxA - wIdxB;
      }
    }

    return 0; // Maintain layering_weight base order if no fixed sequence applies
  });

  return steps;
}

export function generateWeeklySchedule(items, appointments = []) {
  if (!items) items = [];
  const schedule = [];
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < 7; i++) {
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + i);
    const dayOfWeek = targetDate.getDay(); // 0 (Sun) to 6 (Sat)

    const dayItems = items.filter(item => {
      if (item.days && Array.isArray(item.days)) {
        return item.days.includes(dayOfWeek);
      }
      return true; // if no specific days, assume daily
    });

    const dayAppointments = appointments.filter(app => {
      const appDate = new Date(app.date);
      return appDate.toDateString() === targetDate.toDateString();
    });

    schedule.push({
      date: targetDate,
      dayOfWeek: dayOfWeek,
      items: dayItems,
      appointments: dayAppointments
    });
  }

  return schedule;
}
