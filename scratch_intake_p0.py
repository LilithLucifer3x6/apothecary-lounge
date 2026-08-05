import re

with open('c:/Users/purpl/apothecary-lounge/src/screens/Intake.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add prescriptionStartDate state
content = content.replace("const [noOral, setNoOral] = useState(false);", "const [noOral, setNoOral] = useState(false);\n  const [prescriptionStartDate, setPrescriptionStartDate] = useState('');")

# Add checking logic in render
insertion = """
              {!noOral && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {oralList.map((med, i) => (
                    <div key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <div style={{ flex: 1 }}>
                        <VoiceInput value={med} onChange={e => updateOral(i, e.target.value)} placeholder="e.g. Spironolactone" />
                      </div>
                      <button className="btn sm" style={{ background: 'transparent', color: 'var(--rose)', padding: '0.5rem' }} onClick={() => removeOral(i)}>Shatter</button>
                    </div>
                  ))}
                  <button className="btn" onClick={addOral} style={{ width: 'fit-content', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Icon name="plus" /> Inscribe Systemic Measure</button>
                  
                  {oralList.some(m => m.toLowerCase().includes('isotretinoin') || m.toLowerCase().includes('accutane')) && (
                    <div className="field mt-4" style={{ padding: '1rem', border: '1px solid var(--crimson)', borderRadius: '8px' }}>
                      <label style={{ color: 'var(--rose)', display: 'block', marginBottom: '0.5rem' }}>When did you begin this systemic regimen?</label>
                      <input type="date" value={prescriptionStartDate} onChange={e => setPrescriptionStartDate(e.target.value)} style={{ padding: '0.5rem', background: 'var(--bg)', color: 'var(--silver)', border: '1px solid var(--border)', borderRadius: '4px' }} />
                    </div>
                  )}
                </div>
              )}
"""
# Use a simple string replacement for the block
target_block = """              {!noOral && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {oralList.map((med, i) => (
                    <div key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <div style={{ flex: 1 }}>
                        <VoiceInput value={med} onChange={e => updateOral(i, e.target.value)} placeholder="e.g. Spironolactone" />
                      </div>
                      <button className="btn sm" style={{ background: 'transparent', color: 'var(--rose)', padding: '0.5rem' }} onClick={() => removeOral(i)}>Shatter</button>
                    </div>
                  ))}
                  <button className="btn" onClick={addOral} style={{ width: 'fit-content', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Icon name="plus" /> Inscribe Systemic Measure</button>
                </div>
              )}"""

content = content.replace(target_block, insertion.strip())

# Add to profileData in fast route
content = content.replace("rxList: filteredRxList, \n        oralList: filteredOralList, \n        algList: filteredAlgList \n      },", "rxList: filteredRxList, \n        oralList: filteredOralList, \n        algList: filteredAlgList, \n        prescription_start_date: prescriptionStartDate \n      },")

# Add to AI route extractedData mapping
content = content.replace("intake_answers: extractedData,", "intake_answers: { ...extractedData, prescription_start_date: prescriptionStartDate },")

with open('c:/Users/purpl/apothecary-lounge/src/screens/Intake.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
