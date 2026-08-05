import re

with open('c:/Users/purpl/apothecary-lounge/src/screens/Grimoire.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Refactor the medication pills in the calendar block
# From:
# {hasIso && (
#   <span className="pill" style={{ color: 'var(--silver)' }}>Isotretinoin 40/80mg</span>
# )}
# {isFriday && (
#   <>
#     {allMeds.some(m => m.includes('methotrexate')) && <span className="pill" style={{ color: 'var(--silver)', borderColor: 'var(--silver)' }}>Methotrexate</span>}
#     {allMeds.some(m => m.includes('wegovy')) && <span className="pill" style={{ color: 'var(--silver)', borderColor: 'var(--silver)' }}>Wegovy</span>}
#     {allMeds.some(m => m.includes('enbrel') || m.includes('etanercept')) && <span className="pill" style={{ color: 'var(--silver)', borderColor: 'var(--silver)' }}>Enbrel</span>}
#   </>
# )}

# To something more dynamic:
new_cal_block = """                        {allMeds.map((med, idx) => {
                          const l = med.toLowerCase();
                          const isIso = l.includes('isotretinoin') || l.includes('accutane');
                          const isFridayShot = l.includes('methotrexate') || l.includes('wegovy') || l.includes('enbrel') || l.includes('etanercept');
                          
                          if (isIso) {
                            return <span key={idx} className="pill" style={{ color: 'var(--silver)' }}>{med} {isIsotretinoin80 ? '80mg' : '40mg'}</span>;
                          }
                          
                          if (isFriday && isFridayShot) {
                            return <span key={idx} className="pill" style={{ color: 'var(--silver)', borderColor: 'var(--silver)' }}>{med}</span>;
                          }
                          
                          return null;
                        })}
                        {hasDrysol && ("""

# Replace the specific block
# Be careful with regex here
target = """                        {hasIso && (
                          <span className="pill" style={{ color: 'var(--silver)' }}>Isotretinoin 40/80mg</span>
                        )}
                        {isFriday && (
                          <>
                            {allMeds.some(m => m.includes('methotrexate')) && <span className="pill" style={{ color: 'var(--silver)', borderColor: 'var(--silver)' }}>Methotrexate</span>}
                            {allMeds.some(m => m.includes('wegovy')) && <span className="pill" style={{ color: 'var(--silver)', borderColor: 'var(--silver)' }}>Wegovy</span>}
                            {allMeds.some(m => m.includes('enbrel') || m.includes('etanercept')) && <span className="pill" style={{ color: 'var(--silver)', borderColor: 'var(--silver)' }}>Enbrel</span>}
                          </>
                        )}
                        {hasDrysol && ("""

if target in content:
    content = content.replace(target, new_cal_block)
else:
    print("Could not find the target block in calendar rendering!")

# Refactor the header summary block for meds
# From:
#            {hasIsotretinoin && (
#              <div className="pill" style={{ color: 'var(--silver)', borderColor: 'var(--border)' }}>
#                Isotretinoin {isIsotretinoin80 ? '80mg' : '40mg'}
#              </div>
#            )}
#            {hasFridayInjections && (
#              <div className="pill" style={{ color: 'var(--silver)', borderColor: 'var(--border)' }}>
#                Weekly Injection
#              </div>
#            )}

new_header_block = """            {allMeds.map((med, idx) => {
              const l = med.toLowerCase();
              const isIso = l.includes('isotretinoin') || l.includes('accutane');
              const isFridayShot = l.includes('methotrexate') || l.includes('wegovy') || l.includes('enbrel') || l.includes('etanercept');
              
              if (isIso) {
                return (
                  <div key={idx} className="pill" style={{ color: 'var(--silver)', borderColor: 'var(--border)' }}>
                    {med} {isIsotretinoin80 ? '80mg' : '40mg'}
                  </div>
                );
              }
              
              if (dayOfWeek === 5 && isFridayShot) {
                return (
                  <div key={idx} className="pill" style={{ color: 'var(--silver)', borderColor: 'var(--border)' }}>
                    {med}
                  </div>
                );
              }
              return null;
            })}
"""

header_target = """            {hasIsotretinoin && (
              <div className="pill" style={{ color: 'var(--silver)', borderColor: 'var(--border)' }}>
                Isotretinoin {isIsotretinoin80 ? '80mg' : '40mg'}
              </div>
            )}
            {hasFridayInjections && (
              <div className="pill" style={{ color: 'var(--silver)', borderColor: 'var(--border)' }}>
                Weekly Injection
              </div>
            )}"""

if header_target in content:
    content = content.replace(header_target, new_header_block)
else:
    print("Could not find header target")

with open('c:/Users/purpl/apothecary-lounge/src/screens/Grimoire.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
