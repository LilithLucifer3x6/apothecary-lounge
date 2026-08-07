const fs = require('fs');
const path = 'src/screens/Rootwork.jsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Add states
if (!content.includes('const [isSearchingOBF')) {
  content = content.replace(/const \[banishState, setBanishState\] = useState\(null\);/, 
    "const [banishState, setBanishState] = useState(null);\n  const [isSearchingOBF, setIsSearchingOBF] = useState(false);\n  const [obfResults, setObfResults] = useState([]);");
}

// 2. Add handler
if (!content.includes('const handleSearchOBF')) {
  content = content.replace(/const fetchItems = async \(\) => \{/, 
    `const handleSearchOBF = async () => {
    if (!addForm.name) return;
    setIsSearchingOBF(true);
    setObfResults([]);
    try {
      const { searchOpenBeautyFacts } = await import('../lib/ai-engine.js');
      const results = await searchOpenBeautyFacts(addForm.name);
      setObfResults(results);
      if (results.length === 0) {
        await alert("No relics found by that name in the global index.");
      }
    } catch (err) {
      console.error(err);
    }
    setIsSearchingOBF(false);
  };

  const fetchItems = async () => {`);
}

// 3. Replace the UI block
const oldUI = `<div className="field">
                    <label style={{color: 'var(--plum)'}}>Name of the Relic</label>
                    <VoiceInput value={addForm.name} onChange={e => setAddForm({...addForm, name: e.target.value})} />
                  </div>`;
const newUI = `<div className="field">
                    <label style={{color: 'var(--plum)'}}>Name of the Relic</label>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
                        <VoiceInput value={addForm.name} onChange={e => setAddForm({...addForm, name: e.target.value})} />
                      </div>
                      <button className="btn outline" onClick={handleSearchOBF} disabled={isSearchingOBF || !addForm.name} style={{ padding: '0.5rem 1rem' }}>
                        {isSearchingOBF ? '...' : 'Search'}
                      </button>
                    </div>
                    {obfResults.length > 0 && (
                      <div style={{ marginTop: '0.5rem', maxHeight: '150px', overflowY: 'auto', border: '1px solid var(--border)', borderRadius: '4px', background: 'rgba(0,0,0,0.2)' }}>
                        {obfResults.map(res => (
                          <div key={res.id} style={{ padding: '0.5rem', borderBottom: '1px solid var(--border)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={() => {
                            setAddForm(prev => ({
                              ...prev,
                              brand: res.brand || prev.brand,
                              name: res.name || prev.name,
                              ingredients: res.ingredients || prev.ingredients,
                              category: res.category || prev.category
                            }));
                            setObfResults([]);
                          }}>
                            {res.image && <img src={res.image} style={{ width: '30px', height: '30px', objectFit: 'cover', borderRadius: '4px' }} />}
                            <div>
                              <div style={{ color: 'var(--plum)', fontWeight: 'bold', fontSize: '0.9rem' }}>{res.name}</div>
                              <div style={{ color: 'var(--dim)', fontSize: '0.8rem' }}>{res.brand}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>`;
content = content.replace(oldUI, newUI);

fs.writeFileSync(path, content);
console.log('Rootwork.jsx OBF integration completed.');
