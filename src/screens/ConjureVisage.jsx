import React, { useState } from 'react';

// ── PHYSICAL BASE (hardcoded per user spec) ──────────────────────────────────
const BASE_DESCRIPTION =
  'A full-figured Black femme, 5\'8", approximately 250 lbs, with a warm medium espresso skin tone, an ample full-figured frame with a beautiful bust, and long pointy stiletto nails painted to match her robe color. No gold jewelry or accessories. Silver, black, or dark metals only.';

// ── HAIRSTYLE / LOC STYLES ───────────────────────────────────────────────────
const HAIRSTYLES = [
  { id: 'microlocs_loose',      label: 'Microlocs — Loose & Free',        img: 'hair_microlocs.jpg',  desc: 'Long microlocs worn completely free, cascading past the shoulders' },
  { id: 'microlocs_halfup',     label: 'Microlocs — Half-Up Crown',        img: 'hair_crownbraid.jpg', desc: 'Top half swept up in a crown, rest cascading freely' },
  { id: 'microlocs_highbun',    label: 'Microlocs — Dramatic High Bun',    img: null,                  desc: 'All locs swept into a large dramatic high bun with silver pins' },
  { id: 'microlocs_ponytail',   label: 'Microlocs — High Ponytail',        img: null,                  desc: 'Locs gathered into a sleek high ponytail' },
  { id: 'microlocs_sideover',   label: 'Microlocs — Side Swept',           img: null,                  desc: 'All locs swept dramatically over one shoulder' },
  { id: 'microlocs_ceremonial', label: 'Microlocs — Ceremonial Updo',      img: null,                  desc: 'Elaborate updo with locs pinned in an artistic ceremonial arrangement' },
  { id: 'microlocs_waist',      label: 'Microlocs — Waist Length',         img: null,                  desc: 'Extra-long waist-length microlocs worn completely free and abundant' },
  { id: 'microlocs_charms',     label: 'Microlocs — Adorned with Charms',  img: null,                  desc: 'Microlocs decorated throughout with silver moon charms and crystal beads' },
  { id: 'microlocs_wrapped',    label: 'Microlocs — Wrapped Sections',     img: null,                  desc: 'Select locs wrapped with dark thread and silver wire at intervals' },
  { id: 'sisterlocs_free',      label: 'Sister Locs — Free Flowing',       img: 'hair_freeform.jpg',   desc: 'Fine sister locs worn naturally free, abundant and full' },
  { id: 'sisterlocs_pinned',    label: 'Sister Locs — Pinned Back',        img: null,                  desc: 'Sister locs elegantly pinned back at the sides' },
  { id: 'loc_crown',            label: 'Loc Crown Braid',                  img: null,                  desc: 'Locs braided into a regal crown halo around the head' },
  { id: 'twinbuns',             label: 'Microlocs — Twin Space Buns',      img: 'hair_twinbuns.jpg',   desc: 'Locs divided into two full high buns' },
  { id: 'loc_upbraid',          label: 'Locs — Braided Back Sections',     img: null,                  desc: 'Front sections braided back, remaining locs hanging freely' },
];

// ── ROBE DESIGNS ─────────────────────────────────────────────────────────────
const ROBE_DESIGNS = [
  { id: 'flowing_ceremonial', label: 'Flowing Ceremonial Robe',    desc: 'Full-length flowing robe with wide sleeves and embroidered magical trim' },
  { id: 'structured_coat',    label: 'Sorceress Coat',             desc: 'Structured long coat with a cinched waist belt and high dramatic collar' },
  { id: 'kimono_wrap',        label: 'Kimono-Style Wrap Robe',     desc: 'Elegant wrap robe with a wide obi-style sash belt' },
  { id: 'asymmetric',         label: 'Asymmetric Ritual Robe',     desc: 'Dramatic asymmetric hem with layered fabric and one exposed shoulder' },
  { id: 'layered_scholar',    label: "Scholar's Layered Robes",    desc: 'Multiple layered robes with intricate detail and overlapping panels' },
  { id: 'cape_gown',          label: 'Cape & Gown Ensemble',       desc: 'Elegant fitted gown with a sweeping dramatic floor-length cape' },
  { id: 'embroidered_gown',   label: 'Embroidered Ritual Gown',    desc: 'Form-flattering gown covered in glowing magical embroidery patterns' },
  { id: 'velvet_robe',        label: 'Velvet Wrap Robe',           desc: 'Luxurious velvet robe with plush dark fur trim and deep side pockets' },
  { id: 'off_shoulder',       label: 'Off-Shoulder Sorceress Gown',desc: 'Dramatic off-shoulder gown with puffed sleeves and layered skirt' },
  { id: 'hooded_cloak',       label: 'Hooded Ritual Cloak',        desc: 'Long hooded cloak with a fitted inner robe visible at the hem' },
];

// ── ROBE COLORS (no pink, no blue) ───────────────────────────────────────────
const ROBE_COLORS = [
  { id: 'obsidian',   label: 'Obsidian',       hex: '#0d0d0d' },
  { id: 'crimson',    label: 'Deep Crimson',    hex: '#6b0000' },
  { id: 'emerald',    label: 'Forest Emerald',  hex: '#0a2e1a' },
  { id: 'violet',     label: 'Midnight Violet', hex: '#1e0a2e' },
  { id: 'plum',       label: 'Dark Plum',       hex: '#2d0a2e' },
  { id: 'burgundy',   label: 'Burgundy',        hex: '#3d0015' },
  { id: 'rust',       label: 'Rust / Sienna',   hex: '#8b3a00' },
  { id: 'sage',       label: 'Sage / Moss',     hex: '#2d3d1e' },
  { id: 'charcoal',   label: 'Charcoal',        hex: '#1a1a1f' },
  { id: 'gold',       label: 'Gold',            hex: '#B8860B' },
  { id: 'copper',     label: 'Dark Copper',     hex: '#5c2200' },
  { id: 'storm',      label: 'Storm Gray',      hex: '#2c2c3a' },
];

// ── HAIR ACCESSORIES (no gold, no pink, no blue) ─────────────────────────────
const HAIR_ACCESSORIES = [
  { id: 'silver_cuffs',   label: 'Silver Loc Cuffs',        desc: 'Delicate silver cuffs placed at intervals along the locs' },
  { id: 'black_iron',     label: 'Black Iron Wraps',         desc: 'Dark iron spiral wraps threaded through the locs' },
  { id: 'amethyst_cuffs', label: 'Amethyst Crystal Cuffs',  desc: 'Silver cuffs set with deep purple amethyst stones' },
  { id: 'obsidian_beads', label: 'Obsidian Beads',           desc: 'Polished obsidian beads woven throughout the locs' },
  { id: 'silver_moons',   label: 'Silver Moon Charms',       desc: 'Crescent moon and star charms dangling from the locs' },
  { id: 'bone_wood',      label: 'Bone & Wood Wraps',        desc: 'Organic carved bone and wood wraps for an earthy look' },
  { id: 'copper_spiral',  label: 'Copper Spiral Cuffs',      desc: 'Warm copper (not gold) spiral wraps coiled along the locs' },
  { id: 'garnet_pins',    label: 'Garnet-Set Silver Pins',   desc: 'Silver pins topped with deep red garnet stones pinned throughout' },
  { id: 'wire_wrapped',   label: 'Silver Wire Wrapped Tips', desc: 'Loc tips wrapped in delicate silver wire with crystal beads' },
  { id: 'none',           label: 'No Accessories',           desc: 'Natural locs without any additional adornment' },
];

// ── JEWELRY STYLE (no gold) ───────────────────────────────────────────────────
const JEWELRY = [
  { id: 'silver_amethyst', label: 'Silver & Amethyst',       desc: 'Silver chains, amethyst pendant and stacking rings' },
  { id: 'silver_onyx',     label: 'Silver & Black Onyx',     desc: 'Bold silver settings with black onyx stones, multiple rings' },
  { id: 'silver_emerald',  label: 'Silver & Emerald',        desc: 'Delicate silver with deep green emerald accent stones' },
  { id: 'silver_garnet',   label: 'Silver & Garnet',         desc: 'Rich silver bezels with deep red garnet stones' },
  { id: 'moonstone',       label: 'Dark Iron & Moonstone',   desc: 'Dark iron settings with glowing moonstone pendants' },
  { id: 'bronze_obsidian', label: 'Antique Bronze & Obsidian',desc: 'Antique bronze settings with obsidian, layered pieces' },
  { id: 'layered_silver',  label: 'Layered Silver Chains',   desc: 'Multiple layered silver chains of varying lengths and weights' },
  { id: 'crystal_mix',     label: 'Mixed Crystal Collection',desc: 'An eclectic collection of various crystal and silver pieces' },
  { id: 'silver_ruby',     label: 'Silver & Ruby',           desc: 'Silver with deep red ruby stones, dramatic statement pieces' },
  { id: 'minimal_silver',  label: 'Minimal Silver',          desc: 'Simple, elegant minimal silver pieces — a few rings and a delicate chain' },
];

// ── FAMILIARS ─────────────────────────────────────────────────────────────────
const FAMILIARS = [
  { id: 'cat',   label: 'Midnight Cat',    img: 'fam_cat_ghibli.jpg'   },
  { id: 'raven', label: 'Shadow Raven',    img: 'fam_raven_ghibli.jpg' },
  { id: 'bat',   label: 'Cave Bat',        img: 'fam_bat_ghibli.jpg'   },
  { id: 'owl',   label: 'Barn Owl',        img: 'fam_owl_ghibli.jpg'   },
  { id: 'snake', label: 'Emerald Serpent', img: 'fam_snake_ghibli.jpg' },
];

// ── ROOM DEFINITIONS for background generation ────────────────────────────────
export const ROOM_PROMPTS = {
  rites:  (cfg) => `2D illustrated painterly art of a beautiful plus-sized Black femme apothecary keeper with espresso skin and ${cfg.locStyle} microlocs adorned with ${cfg.hairAccessory} in a cozy witchy cottage interior with a fireplace and cauldron, brewing a skincare potion. She wears a ${cfg.robeDesign} in ${cfg.robeColor} with stiletto nails painted ${cfg.robeColor}, adorned with ${cfg.jewelry} jewelry. Her ${cfg.familiar} familiar watches nearby. Warm candlelit magical atmosphere, cottagecore goth art style.`,
  grim:   (cfg) => `2D illustrated painterly art of a beautiful plus-sized Black femme with espresso skin and ${cfg.locStyle} microlocs adorned with ${cfg.hairAccessory} standing before towering shelves of glowing potion bottles in a dark magical library. She wears a ${cfg.robeDesign} in ${cfg.robeColor} examining a product label. Her ${cfg.familiar} familiar perches nearby. Rich dark magical library atmosphere, cottagecore goth art style.`,
  altars: (cfg) => `2D illustrated painterly art of a beautiful plus-sized Black femme with espresso skin and ${cfg.locStyle} microlocs adorned with ${cfg.hairAccessory} at a beautifully arranged altar with crystals, candles, and offerings. She wears a ${cfg.robeDesign} in ${cfg.robeColor} with hands raised in ritual gesture. Her ${cfg.familiar} familiar rests on the altar. Mystical sacred space, cottagecore goth art style.`,
  root:   (cfg) => `2D illustrated painterly art of a beautiful plus-sized Black femme with espresso skin and ${cfg.locStyle} microlocs adorned with ${cfg.hairAccessory} casting spells over a large bubbling cauldron, magical glowing symbols forming in the air. She wears a ${cfg.robeDesign} in ${cfg.robeColor}. Her ${cfg.familiar} familiar watches from a wooden beam above. Dark magical workshop, cottagecore goth art style.`,
  pool:   (cfg) => `2D illustrated painterly art of a beautiful plus-sized Black femme with espresso skin and ${cfg.locStyle} microlocs adorned with ${cfg.hairAccessory} gazing into a glowing scrying pool with swirling visions of wisdom in the water. She wears a ${cfg.robeDesign} in ${cfg.robeColor}. Her ${cfg.familiar} familiar is reflected in the water. Mystical moonlit chamber, cottagecore goth art style.`,
  tome:   (cfg) => `2D illustrated painterly art of a beautiful plus-sized Black femme with espresso skin and ${cfg.locStyle} microlocs adorned with ${cfg.hairAccessory} writing in a large leather-bound shadow tome by candlelight, surrounded by drying herbs and honey jars. She wears a ${cfg.robeDesign} in ${cfg.robeColor} with a warm cup of herbal tea. Her ${cfg.familiar} familiar curls up beside the tome. Cozy witchy study, cottagecore goth art style.`,
};

// ── SECTION COMPONENT ────────────────────────────────────────────────────────
function Section({ title, children }) {
  return (
    <div style={{ marginBottom: '2.5rem' }}>
      <h3 style={{ color: 'var(--plum)', borderBottom: '1px solid rgba(176,132,148,0.2)', paddingBottom: '0.5rem', marginBottom: '1.2rem' }}>
        {title}
      </h3>
      {children}
    </div>
  );
}

// ── IMAGE CARD ───────────────────────────────────────────────────────────────
function ImgCard({ item, selected, onSelect }) {
  const isSelected = selected === item.id;
  return (
    <div
      onClick={() => onSelect(item.id)}
      style={{
        border: isSelected ? '2px solid var(--plum)' : '1px solid rgba(176,132,148,0.2)',
        background: isSelected ? 'rgba(176,132,148,0.12)' : 'rgba(5,3,10,0.6)',
        borderRadius: '8px',
        cursor: 'pointer',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: isSelected ? '0 0 18px rgba(176,132,148,0.4)' : 'none',
        transition: 'all 0.2s ease',
      }}
    >
      {item.img ? (
        <div style={{ width: '100%', aspectRatio: '1/1', background: '#000', overflow: 'hidden' }}>
          <img
            src={`/assets/${item.img}`}
            alt={item.label}
            style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: isSelected ? 1 : 0.65, transition: 'opacity 0.2s' }}
          />
        </div>
      ) : (
        <div style={{
          width: '100%', aspectRatio: '1/1',
          background: 'rgba(176,132,148,0.05)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '2rem', color: isSelected ? 'var(--plum)' : 'rgba(176,132,148,0.3)'
        }}>✦</div>
      )}
      <div style={{ padding: '0.6rem 0.8rem' }}>
        <div style={{ fontSize: '0.8rem', fontWeight: isSelected ? 'bold' : 'normal', color: isSelected ? 'var(--plum)' : 'var(--silver)' }}>
          {item.label}
        </div>
        {item.desc && (
          <div style={{ fontSize: '0.7rem', color: 'var(--dim)', marginTop: '0.3rem', lineHeight: 1.3 }}>
            {item.desc}
          </div>
        )}
      </div>
    </div>
  );
}

// ── TEXT CARD (for designs, accessories, jewelry) ────────────────────────────
function TextCard({ item, selected, onSelect }) {
  const isSelected = selected === item.id;
  return (
    <div
      onClick={() => onSelect(item.id)}
      style={{
        border: isSelected ? '2px solid var(--plum)' : '1px solid rgba(176,132,148,0.2)',
        background: isSelected ? 'rgba(176,132,148,0.12)' : 'rgba(5,3,10,0.6)',
        borderRadius: '8px',
        cursor: 'pointer',
        padding: '0.9rem 1rem',
        boxShadow: isSelected ? '0 0 14px rgba(176,132,148,0.35)' : 'none',
        transition: 'all 0.2s ease',
      }}
    >
      <div style={{ fontSize: '0.85rem', fontWeight: isSelected ? 'bold' : 'normal', color: isSelected ? 'var(--plum)' : 'var(--silver)', marginBottom: '0.3rem' }}>
        {item.label}
      </div>
      <div style={{ fontSize: '0.72rem', color: 'var(--dim)', lineHeight: 1.4 }}>
        {item.desc}
      </div>
    </div>
  );
}

// ── COLOR SWATCH ─────────────────────────────────────────────────────────────
function ColorSwatch({ color, selected, onSelect }) {
  const isSelected = selected === color.id;
  return (
    <div onClick={() => onSelect(color.id)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
      <div style={{
        width: '52px', height: '52px',
        borderRadius: '50%',
        background: color.hex,
        border: isSelected ? '3px solid var(--plum)' : '2px solid rgba(176,132,148,0.25)',
        boxShadow: isSelected ? `0 0 16px ${color.hex}, 0 0 4px rgba(176,132,148,0.4)` : 'none',
        transition: 'all 0.2s ease',
      }} />
      <div style={{ fontSize: '0.72rem', color: isSelected ? 'var(--plum)' : 'var(--dim)', textAlign: 'center', maxWidth: '60px', lineHeight: 1.2 }}>
        {color.label}
      </div>
    </div>
  );
}

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────
export default function ConjureVisage({ onFinish }) {
  const [name, setName] = useState('');
  const [locStyle,       setLocStyle]       = useState('');
  const [robeDesign,     setRobeDesign]     = useState('');
  const [robeColor,      setRobeColor]      = useState('');
  const [hairAccessory,  setHairAccessory]  = useState('');
  const [jewelry,        setJewelry]        = useState('');
  const [familiar,       setFamiliar]       = useState('');

  const [generating, setGenerating] = useState(false);
  const [genPhase,   setGenPhase]   = useState('');
  const [genStep,    setGenStep]    = useState(0);

  const isComplete = name && locStyle && robeDesign && robeColor && hairAccessory && jewelry && familiar;

  const buildKeeperDescription = () => {
    const hair    = HAIRSTYLES.find(h => h.id === locStyle);
    const design  = ROBE_DESIGNS.find(d => d.id === robeDesign);
    const color   = ROBE_COLORS.find(c => c.id === robeColor);
    const acc     = HAIR_ACCESSORIES.find(a => a.id === hairAccessory);
    const jewels  = JEWELRY.find(j => j.id === jewelry);
    const fam     = FAMILIARS.find(f => f.id === familiar);
    return {
      name,
      locStyle:     hair?.desc    || locStyle,
      robeDesign:   design?.desc  || robeDesign,
      robeColor:    color?.label  || robeColor,
      hairAccessory: acc?.desc    || hairAccessory,
      jewelry:      jewels?.desc  || jewelry,
      familiar:     fam?.label    || familiar,
      familiarId:   familiar,
      robeColorHex: color?.hex    || '#1e0a2e',
      base:         BASE_DESCRIPTION,
    };
  };

  const handleFinish = async () => {
    if (!isComplete) return;

    const config = buildKeeperDescription();
    setGenerating(true);

    const phases = [
      'Binding your essence to the Sanctuary...',
      'Weaving your Keeper into the Grimoire...',
      'Painting your Keeper at the Altars...',
      'Summoning your Keeper to the Rootwork...',
      'Conjuring your Keeper at the Scrying Pool...',
      'Inscribing your Keeper in the Shadow Tome...',
      'The Sanctuary awakens...',
    ];

    for (let i = 0; i < phases.length; i++) {
      setGenPhase(phases[i]);
      setGenStep(i);
      await new Promise(r => setTimeout(r, 800));
    }

    localStorage.setItem('avatar_config', JSON.stringify(config));
    if (onFinish) onFinish(config);
  };

  // ── Generating splash ────────────────────────────────────────────────────
  if (generating) {
    const progress = Math.round(((genStep + 1) / 7) * 100);
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        minHeight: '100vh', color: 'var(--rose)',
      }}>
        <div style={{
          background: 'rgba(5,3,10,0.88)', backdropFilter: 'blur(16px)',
          padding: '2.5rem 3rem', borderRadius: '12px',
          border: '1px solid rgba(176,132,148,0.35)', textAlign: 'center', maxWidth: '420px',
        }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>✦</div>
          <h2 style={{ marginBottom: '0.5rem', color: 'var(--plum)', fontSize: '1.3rem' }}>{genPhase}</h2>
          <div style={{ background: 'rgba(0,0,0,0.4)', borderRadius: '99px', height: '6px', marginTop: '1.5rem', overflow: 'hidden' }}>
            <div style={{
              width: `${progress}%`, height: '100%',
              background: 'linear-gradient(90deg, var(--plum), var(--rose))',
              transition: 'width 0.6s ease', borderRadius: '99px'
            }} />
          </div>
          <p style={{ color: 'var(--dim)', fontSize: '0.8rem', marginTop: '1rem' }}>
            Your Keeper is being painted into every room of the Sanctuary...
          </p>
        </div>
      </div>
    );
  }

  // ── Builder UI ───────────────────────────────────────────────────────────
  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      minHeight: '100vh', color: 'var(--rose)',
      overflowY: 'auto', paddingBottom: '6rem',
      background: 'transparent',
    }}>
      <div style={{
        maxWidth: '900px', margin: '2rem auto', width: '94%',
        background: 'rgba(5,3,10,0.86)', backdropFilter: 'blur(14px)',
        border: '1px solid rgba(176,132,148,0.25)',
        borderRadius: '12px', padding: '2rem',
      }}>
        <h1 style={{ textAlign: 'center', marginBottom: '0.5rem', fontSize: '2.2rem', color: 'var(--plum)' }}>
          Conjure Your Visage
        </h1>
        <p style={{ textAlign: 'center', color: 'var(--dim)', marginBottom: '2.5rem', fontSize: '0.9rem' }}>
          Shape your Keeper. Once bound, she will be painted into every room of the Sanctuary — doing what that room commands.
        </p>

        {/* NAME */}
        <Section title="The Keeper's Name">
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="What shall I call you?"
            style={{
              width: '100%', padding: '0.9rem', borderRadius: '6px',
              background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(176,132,148,0.25)',
              color: 'var(--plum)', fontSize: '1rem',
            }}
          />
        </Section>

        {/* HAIRSTYLE */}
        <Section title="Hairstyle & Locs">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.8rem' }}>
            {HAIRSTYLES.map(h => <ImgCard key={h.id} item={h} selected={locStyle} onSelect={setLocStyle} />)}
          </div>
        </Section>

        {/* ROBE DESIGN */}
        <Section title="Robe Design">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.8rem' }}>
            {ROBE_DESIGNS.map(d => <TextCard key={d.id} item={d} selected={robeDesign} onSelect={setRobeDesign} />)}
          </div>
        </Section>

        {/* ROBE COLOR */}
        <Section title="Robe Color">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.2rem', paddingTop: '0.5rem' }}>
            {ROBE_COLORS.map(c => <ColorSwatch key={c.id} color={c} selected={robeColor} onSelect={setRobeColor} />)}
          </div>
        </Section>

        {/* HAIR ACCESSORIES */}
        <Section title="Hair Accessories">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: '0.8rem' }}>
            {HAIR_ACCESSORIES.map(a => <TextCard key={a.id} item={a} selected={hairAccessory} onSelect={setHairAccessory} />)}
          </div>
        </Section>

        {/* JEWELRY */}
        <Section title="Jewels & Adornments">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: '0.8rem' }}>
            {JEWELRY.map(j => <TextCard key={j.id} item={j} selected={jewelry} onSelect={setJewelry} />)}
          </div>
        </Section>

        {/* FAMILIAR */}
        <Section title="Your Familiar">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.8rem' }}>
            {FAMILIARS.map(f => <ImgCard key={f.id} item={f} selected={familiar} onSelect={setFamiliar} />)}
          </div>
        </Section>

        {/* SUMMARY PREVIEW */}
        {isComplete && (
          <div style={{
            background: 'rgba(176,132,148,0.08)',
            border: '1px solid rgba(176,132,148,0.25)',
            borderRadius: '8px', padding: '1.2rem', marginBottom: '2rem'
          }}>
            <div style={{ color: 'var(--plum)', fontWeight: 'bold', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
              ✦ Your Keeper — {name}
            </div>
            <div style={{ color: 'var(--dim)', fontSize: '0.78rem', lineHeight: 1.7 }}>
              <strong style={{ color: 'var(--silver)' }}>Locs:</strong> {HAIRSTYLES.find(h => h.id === locStyle)?.label} &nbsp;·&nbsp;
              <strong style={{ color: 'var(--silver)' }}>Robe:</strong> {ROBE_DESIGNS.find(d => d.id === robeDesign)?.label} in {ROBE_COLORS.find(c => c.id === robeColor)?.label} &nbsp;·&nbsp;
              <strong style={{ color: 'var(--silver)' }}>Accessories:</strong> {HAIR_ACCESSORIES.find(a => a.id === hairAccessory)?.label} &nbsp;·&nbsp;
              <strong style={{ color: 'var(--silver)' }}>Jewels:</strong> {JEWELRY.find(j => j.id === jewelry)?.label} &nbsp;·&nbsp;
              <strong style={{ color: 'var(--silver)' }}>Familiar:</strong> {FAMILIARS.find(f => f.id === familiar)?.label}
            </div>
          </div>
        )}

        {/* GENERATE BUTTON */}
        <button
          onClick={handleFinish}
          disabled={!isComplete}
          style={{
            width: '100%', padding: '1.1rem',
            fontSize: '1.1rem', fontWeight: 'bold',
            background: isComplete ? 'rgba(176,132,148,0.2)' : 'rgba(0,0,0,0.3)',
            border: isComplete ? '1px solid var(--plum)' : '1px solid rgba(176,132,148,0.15)',
            color: isComplete ? 'var(--plum)' : 'var(--dim)',
            borderRadius: '8px', cursor: isComplete ? 'pointer' : 'not-allowed',
            boxShadow: isComplete ? '0 0 20px rgba(176,132,148,0.2)' : 'none',
            transition: 'all 0.2s ease',
          }}
        >
          {isComplete ? '✦ Bind Keeper to the Sanctuary ✦' : 'Complete all selections above to continue'}
        </button>
      </div>
    </div>
  );
}
