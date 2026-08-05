import re

with open('c:/Users/purpl/apothecary-lounge/src/screens/Intake.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

insertion = """
  useEffect(() => {
    supabase.from('user_profile').select('intake_answers').maybeSingle().then(({ data }) => {
      if (data && data.intake_answers) {
        const ans = data.intake_answers;
        if (ans.concerns) setSelectedConcerns(ans.concerns);
        if (ans.conditions) setSelectedConditions(ans.conditions);
        if (ans.traditions) setSelectedTraditions(ans.traditions);
        if (ans.rxList) setRxList(ans.rxList);
        if (ans.oralList) setOralList(ans.oralList);
        if (ans.algList) setAlgList(ans.algList);
        if (ans.noRx) setNoRx(ans.noRx);
        if (ans.noOral) setNoOral(ans.noOral);
        if (ans.noAlg) setNoAlg(ans.noAlg);
        if (ans.prescription_start_date) setPrescriptionStartDate(ans.prescription_start_date);
        
        // If they already completed it but are just missing the date, jump to step 4
        if (ans.oralList && ans.oralList.some(m => m.toLowerCase().includes('isotretinoin') || m.toLowerCase().includes('accutane')) && !ans.prescription_start_date) {
            setPath('fast');
            setCurrentStep(4);
        }
      }
    });
  }, []);
"""

content = content.replace("useEffect(() => {\n    AI.generateConcerns()", insertion.strip() + "\n\n  useEffect(() => {\n    AI.generateConcerns()")

with open('c:/Users/purpl/apothecary-lounge/src/screens/Intake.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
