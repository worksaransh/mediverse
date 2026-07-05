import { CandidateFact, GeneratedMCQ, MCQOption, PipelineConfig, Difficulty } from "./types";

interface MCQBlueprint {
  question: string;
  options: MCQOption[];
  correctOption: string;
  explanation: string;
  difficulty: Difficulty;
  cognitiveLevel: "recall" | "application" | "clinical_reasoning";
  topic: string;
}

function generateMCQsFromFact(fact: CandidateFact, index: number): MCQBlueprint[] {
  const blueprints: MCQBlueprint[] = [];
  const id = fact.id;

  switch (id) {
    // === GENERAL PHARMACOLOGY ===
    case "pharm-gen-001":
      blueprints.push({
        question: "Which of the following drugs undergoes the MOST extensive first-pass metabolism, making oral administration impractical?",
        options: [
          { key: "A", text: "Propranolol" },
          { key: "B", text: "Lidocaine" },
          { key: "C", text: "Nitroglycerin" },
          { key: "D", text: "All of the above" },
        ],
        correctOption: "D",
        explanation: "Lidocaine, propranolol, and nitroglycerin all undergo extensive first-pass hepatic metabolism. Lidocaine is therefore given IV/IM, nitroglycerin sublingually, and propranolol requires higher oral doses to achieve therapeutic effect. First-pass metabolism occurs in the liver via the portal circulation.",
        difficulty: 2,
        cognitiveLevel: "recall",
        topic: "Pharmacokinetics",
      });
      break;

    case "pharm-gen-002":
      blueprints.push({
        question: "A drug has a volume of distribution (Vd) of 40 L in a 70 kg patient. Which statement BEST describes this drug?",
        options: [
          { key: "A", text: "The drug is largely confined to the plasma compartment" },
          { key: "B", text: "The drug distributes widely into tissues" },
          { key: "C", text: "The drug is highly protein-bound" },
          { key: "D", text: "The drug has poor oral bioavailability" },
        ],
        correctOption: "B",
        explanation: "A Vd of 40 L (approximately 0.57 L/kg) in a 70 kg patient exceeds total body water (~42 L), suggesting the drug distributes extensively into tissues. High Vd (>0.6 L/kg) indicates extensive tissue distribution. Vd relates the total amount of drug in the body to its plasma concentration.",
        difficulty: 3,
        cognitiveLevel: "application",
        topic: "Pharmacokinetics",
      });
      break;

    case "pharm-gen-003":
      blueprints.push({
        question: "Which cytochrome P450 isoform is responsible for the metabolism of approximately 50% of all clinically used drugs?",
        options: [
          { key: "A", text: "CYP2D6" },
          { key: "B", text: "CYP3A4" },
          { key: "C", text: "CYP2C9" },
          { key: "D", text: "CYP2E1" },
        ],
        correctOption: "B",
        explanation: "CYP3A4 is the most abundant CYP450 isoform in the liver and small intestine, metabolizing ~50% of all drugs. CYP2D6 metabolizes ~25% of drugs (antidepressants, antipsychotics). CYP2C9 metabolizes warfarin, phenytoin. CYP2E1 metabolizes ethanol, paracetamol.",
        difficulty: 2,
        cognitiveLevel: "recall",
        topic: "Drug Metabolism",
      });
      break;

    case "pharm-gen-004":
      blueprints.push({
        question: "Therapeutic drug monitoring (TDM) is LEAST likely to be required for which of the following drugs?",
        options: [
          { key: "A", text: "Warfarin" },
          { key: "B", text: "Amoxicillin" },
          { key: "C", text: "Digoxin" },
          { key: "D", text: "Lithium" },
        ],
        correctOption: "B",
        explanation: "Amoxicillin has a wide therapeutic index and does not require TDM. Warfarin (INR), digoxin (0.5-2.0 ng/mL), and lithium (0.6-1.2 mEq/L) all have narrow therapeutic indices and require routine TDM to avoid toxicity while ensuring efficacy.",
        difficulty: 2,
        cognitiveLevel: "application",
        topic: "Therapeutic Drug Monitoring",
      });
      break;

    case "pharm-gen-005":
      blueprints.push({
        question: "A patient on warfarin is started on rifampicin for tuberculosis. What effect on INR is expected?",
        options: [
          { key: "A", text: "INR will increase due to displacement from protein binding" },
          { key: "B", text: "INR will decrease due to enzyme induction increasing warfarin metabolism" },
          { key: "C", text: "INR will remain unchanged" },
          { key: "D", text: "INR will increase due to enzyme inhibition reducing warfarin metabolism" },
        ],
        correctOption: "B",
        explanation: "Rifampicin is a potent CYP450 inducer (particularly CYP2C9 and CYP3A4), which increases the metabolism of warfarin, reducing its anticoagulant effect and decreasing INR. Warfarin dose may need to be increased. This is an important drug interaction mediated by enzyme induction.",
        difficulty: 3,
        cognitiveLevel: "clinical_reasoning",
        topic: "Drug Interactions",
      });
      break;

    case "pharm-gen-006":
      blueprints.push({
        question: "Which of the following drugs follows zero-order elimination kinetics at therapeutic doses?",
        options: [
          { key: "A", text: "Metformin" },
          { key: "B", text: "Phenytoin" },
          { key: "C", text: "Amoxicillin" },
          { key: "D", text: "Atorvastatin" },
        ],
        correctOption: "B",
        explanation: "Phenytoin exhibits zero-order (saturable) elimination kinetics at therapeutic doses because its metabolizing enzymes (CYP2C9/CYP2C19) become saturated. This means a constant amount is eliminated per unit time regardless of plasma concentration, making dose adjustments critical to avoid toxicity.",
        difficulty: 3,
        cognitiveLevel: "recall",
        topic: "Pharmacokinetics",
      });
      break;

    // === ANS ===
    case "pharm-ans-001":
      blueprints.push({
        question: "Which of the following is the mechanism of action of atropine?",
        options: [
          { key: "A", text: "Competitive antagonist at nicotinic receptors" },
          { key: "B", text: "Competitive antagonist at muscarinic receptors" },
          { key: "C", text: "Irreversible inhibitor of acetylcholinesterase" },
          { key: "D", text: "Direct agonist at beta-2 adrenergic receptors" },
        ],
        correctOption: "B",
        explanation: "Atropine is a competitive antagonist of muscarinic acetylcholine receptors. It blocks the effects of acetylcholine at all muscarinic sites, causing mydriasis, increased heart rate, decreased secretions, and smooth muscle relaxation. It is used for bradycardia, organophosphate poisoning, and as a preanesthetic.",
        difficulty: 1,
        cognitiveLevel: "recall",
        topic: "Autonomic Nervous System",
      });
      break;

    case "pharm-ans-002":
      blueprints.push({
        question: "A 65-year-old male with hypertension is started on prazosin. After the first dose, he develops severe orthostatic dizziness. This is BEST explained by which phenomenon?",
        options: [
          { key: "A", text: "Idiosyncratic drug reaction" },
          { key: "B", text: "First-dose phenomenon due to selective alpha-1 blockade" },
          { key: "C", text: "Beta-receptor upregulation" },
          { key: "D", text: "Type I hypersensitivity reaction" },
        ],
        correctOption: "B",
        explanation: "Prazosin, a selective alpha-1 adrenergic antagonist, can cause a marked first-dose orthostatic hypotension (first-dose phenomenon). This occurs because alpha-1 blockade inhibits catecholamine-mediated vasoconstriction. It can be minimized by starting with a low dose at bedtime. Prazosin is also used for BPH.",
        difficulty: 3,
        cognitiveLevel: "clinical_reasoning",
        topic: "ANS - Alpha Blockers",
      });
      break;

    case "pharm-ans-003":
      blueprints.push({
        question: "Propranolol is contraindicated in patients with bronchial asthma because it can cause:",
        options: [
          { key: "A", text: "Alpha-receptor mediated bronchoconstriction" },
          { key: "B", text: "Beta-2 receptor blockade leading to bronchospasm" },
          { key: "C", text: "Direct irritant effect on bronchial mucosa" },
          { key: "D", text: "Histamine release from mast cells" },
        ],
        correctOption: "B",
        explanation: "Propranolol is a non-selective beta-blocker (blocks both beta-1 and beta-2 receptors). Beta-2 blockade in the lungs causes bronchoconstriction, which can precipitate asthma attacks. Cardioselective beta-1 blockers (atenolol, metoprolol) are relatively safer but should still be used with caution.",
        difficulty: 2,
        cognitiveLevel: "application",
        topic: "ANS - Beta Blockers",
      });
      break;

    case "pharm-ans-004":
      blueprints.push({
        question: "Neostigmine is used in the management of myasthenia gravis. Its primary mechanism of action is:",
        options: [
          { key: "A", text: "Direct stimulation of nicotinic receptors at the NMJ" },
          { key: "B", text: "Inhibition of acetylcholinesterase, increasing ACh at the NMJ" },
          { key: "C", text: "Blockade of voltage-gated sodium channels" },
          { key: "D", text: "Increased synthesis of acetylcholine" },
        ],
        correctOption: "B",
        explanation: "Neostigmine is a reversible acetylcholinesterase inhibitor. It prevents the breakdown of acetylcholine (ACh) in the synaptic cleft, increasing ACh concentration at the neuromuscular junction. This improves muscle strength in myasthenia gravis. It is also used to reverse non-depolarizing neuromuscular blockade after surgery.",
        difficulty: 2,
        cognitiveLevel: "recall",
        topic: "Parasympathomimetics",
      });
      break;

    case "pharm-ans-005":
      blueprints.push({
        question: "A patient develops prolonged apnea after receiving succinylcholine during surgery. Which of the following is the MOST likely cause?",
        options: [
          { key: "A", text: "Overdose of the drug" },
          { key: "B", text: "Pseudocholinesterase deficiency" },
          { key: "C", text: "Concurrent use of neostigmine" },
          { key: "D", text: "Allergic reaction to the drug" },
        ],
        correctOption: "B",
        explanation: "Succinylcholine is metabolized by plasma pseudocholinesterase (butyrylcholinesterase). Patients with genetic pseudocholinesterase deficiency or atypical enzyme cannot metabolize succinylcholine efficiently, leading to prolonged neuromuscular blockade and apnea. This can be managed with supportive ventilation until spontaneous recovery.",
        difficulty: 3,
        cognitiveLevel: "clinical_reasoning",
        topic: "Neuromuscular Blockers",
      });
      break;

    case "pharm-ans-006":
      blueprints.push({
        question: "Salbutamol (albuterol) nebulization in an acute asthma attack can cause all of the following adverse effects EXCEPT:",
        options: [
          { key: "A", text: "Sinus tachycardia" },
          { key: "B", text: "Hypokalemia" },
          { key: "C", text: "Hypotension" },
          { key: "D", text: "Fine tremor of skeletal muscles" },
        ],
        correctOption: "C",
        explanation: "Salbutamol is a selective beta-2 agonist that causes bronchodilation. Common adverse effects include tachycardia (from beta-1 cross-stimulation at high doses), hypokalemia (beta-2 mediated shift of potassium into cells), and fine tremor (beta-2 stimulation of skeletal muscle). It does NOT cause hypotension; in fact, beta-2 mediated vasodilation can slightly lower BP but this is not a typical concern.",
        difficulty: 3,
        cognitiveLevel: "application",
        topic: "Beta-2 Agonists",
      });
      break;

    case "pharm-ans-007":
      blueprints.push({
        question: "Pilocarpine is used in the treatment of glaucoma. Its mechanism of action is:",
        options: [
          { key: "A", text: "Alpha-2 agonist reducing aqueous humor production" },
          { key: "B", text: "Muscarinic agonist causing pupillary constriction and increased outflow" },
          { key: "C", text: "Beta-blocker reducing aqueous humor secretion" },
          { key: "D", text: "Prostaglandin analogue increasing uveoscleral outflow" },
        ],
        correctOption: "B",
        explanation: "Pilocarpine is a direct-acting muscarinic agonist. In the eye, it causes miosis (pupillary constriction) by contracting the iris sphincter muscle and increases aqueous humor outflow through the trabecular meshwork by contracting the ciliary muscle. Both effects reduce intraocular pressure in open-angle glaucoma.",
        difficulty: 2,
        cognitiveLevel: "recall",
        topic: "Parasympathomimetics",
      });
      break;

    // === CARDIOVASCULAR ===
    case "pharm-cvs-001":
      blueprints.push({
        question: "A 55-year-old hypertensive patient develops a persistent dry cough after starting an antihypertensive medication. Which drug is MOST likely responsible?",
        options: [
          { key: "A", text: "Amlodipine" },
          { key: "B", text: "Enalapril" },
          { key: "C", text: "Metoprolol" },
          { key: "D", text: "Hydrochlorothiazide" },
        ],
        correctOption: "B",
        explanation: "ACE inhibitors (like enalapril and captopril) cause a dry cough due to accumulation of bradykinin, which is normally broken down by ACE (kininase II). Bradykinin stimulates pulmonary C-fibers causing cough. This class effect occurs in 5-20% of patients. Angioedema is a rarer but more serious adverse effect. ARBs (losartan) are alternatives that do not cause cough.",
        difficulty: 2,
        cognitiveLevel: "clinical_reasoning",
        topic: "Antihypertensives - ACE Inhibitors",
      });
      break;

    case "pharm-cvs-002":
      blueprints.push({
        question: "Which of the following BEST distinguishes amlodipine from verapamil?",
        options: [
          { key: "A", text: "Amlodipine primarily acts on cardiac muscle; verapamil on vascular smooth muscle" },
          { key: "B", text: "Amlodipine primarily acts on vascular smooth muscle; verapamil has significant cardiac effects" },
          { key: "C", text: "Both have identical mechanisms and clinical effects" },
          { key: "D", text: "Amlodipine is contraindicated in hypertension; verapamil is not" },
        ],
        correctOption: "B",
        explanation: "Amlodipine is a dihydropyridine (DHP) CCB that predominantly acts on vascular smooth muscle, causing vasodilation with minimal cardiac depression. Verapamil is a non-DHP CCB that acts on both cardiac muscle (negative chronotrope/inotrope) and SA/AV nodes, making it useful for rate control in SVT and angina.",
        difficulty: 3,
        cognitiveLevel: "application",
        topic: "Calcium Channel Blockers",
      });
      break;

    case "pharm-cvs-003":
      blueprints.push({
        question: "Verapamil is effective in treating supraventricular tachycardia primarily because it:",
        options: [
          { key: "A", text: "Blocks sodium channels in ventricular myocytes" },
          { key: "B", text: "Prolongs the refractory period of the AV node" },
          { key: "C", text: "Increases conduction velocity through the AV node" },
          { key: "D", text: "Blocks potassium channels in atrial tissue" },
        ],
        correctOption: "B",
        explanation: "Verapamil blocks L-type calcium channels in the SA and AV nodes, slowing AV nodal conduction and prolonging the refractory period. This interrupts reentrant circuits involving the AV node, terminating SVT. Verapamil is also effective for rate control in atrial fibrillation by reducing ventricular response rate.",
        difficulty: 3,
        cognitiveLevel: "application",
        topic: "Calcium Channel Blockers",
      });
      break;

    case "pharm-cvs-004":
      blueprints.push({
        question: "Digoxin toxicity is characterized by all of the following EXCEPT:",
        options: [
          { key: "A", text: "Visual disturbances (yellow-green halos)" },
          { key: "B", text: "Ventricular bigeminy" },
          { key: "C", text: "Hyperkalemia" },
          { key: "D", text: "Torsades de pointes" },
        ],
        correctOption: "D",
        explanation: "Digoxin toxicity classically presents with visual disturbances (xanthopsia - yellow-green vision), arrhythmias (ventricular bigeminy, atrial tachycardia with block), and hyperkalemia (due to Na+/K+ ATPase inhibition preventing potassium entry into cells). Torsades de pointes is associated with drugs that prolong QT interval (e.g., amiodarone, sotalol), not digoxin.",
        difficulty: 4,
        cognitiveLevel: "clinical_reasoning",
        topic: "Cardiac Glycosides",
      });
      break;

    case "pharm-cvs-005":
      blueprints.push({
        question: "A 60-year-old male with acute myocardial infarction develops ventricular tachycardia. Which antiarrhythmic is MOST appropriate?",
        options: [
          { key: "A", text: "Verapamil" },
          { key: "B", text: "Lidocaine" },
          { key: "C", text: "Adenosine" },
          { key: "D", text: "Atropine" },
        ],
        correctOption: "B",
        explanation: "Lidocaine (Class IB antiarrhythmic) is indicated for ventricular arrhythmias, especially in the setting of acute MI. It blocks sodium channels with rapid kinetics, preferentially affecting ischemic tissue. It has minimal effect on atrial tissue. Verapamil and adenosine are for SVT, and atropine is for bradycardia.",
        difficulty: 3,
        cognitiveLevel: "clinical_reasoning",
        topic: "Antiarrhythmics",
      });
      break;

    case "pharm-cvs-006":
      blueprints.push({
        question: "A patient on long-term amiodarone therapy presents with dyspnea and dry cough. High-resolution CT shows pulmonary infiltrates. Which adverse effect is this?",
        options: [
          { key: "A", text: "Hypersensitivity pneumonitis" },
          { key: "B", text: "Amiodarone-induced pulmonary fibrosis" },
          { key: "C", text: "Cardiogenic pulmonary edema" },
          { key: "D", text: "Bronchial asthma exacerbation" },
        ],
        correctOption: "B",
        explanation: "Amiodarone can cause pulmonary toxicity, including interstitial pneumonitis and pulmonary fibrosis, due to accumulation of the drug in lung tissue and phospholipidosis. It is dose-related and potentially fatal. Other adverse effects include thyroid dysfunction (both hypo- and hyperthyroidism due to iodine content), hepatotoxicity, corneal microdeposits, and blue-gray skin discoloration. Baseline and periodic pulmonary function tests are recommended.",
        difficulty: 3,
        cognitiveLevel: "clinical_reasoning",
        topic: "Antiarrhythmics",
      });
      break;

    case "pharm-cvs-007":
      blueprints.push({
        question: "Atorvastatin lowers LDL cholesterol by inhibiting which enzyme?",
        options: [
          { key: "A", text: "Acyl-CoA cholesterol acyltransferase (ACAT)" },
          { key: "B", text: "HMG-CoA reductase" },
          { key: "C", text: "Lipoprotein lipase" },
          { key: "D", text: "Cholesterol 7-alpha-hydroxylase" },
        ],
        correctOption: "B",
        explanation: "Atorvastatin (and all statins) competitively inhibits HMG-CoA reductase, the rate-limiting enzyme in the mevalonate pathway of cholesterol synthesis. This reduces intracellular cholesterol, leading to upregulation of LDL receptors on hepatocytes and increased LDL clearance from blood. Statins also have pleiotropic effects (anti-inflammatory, plaque stabilization).",
        difficulty: 1,
        cognitiveLevel: "recall",
        topic: "Lipid-Lowering Drugs",
      });
      break;

    case "pharm-cvs-008":
      blueprints.push({
        question: "A patient in hypertensive emergency is started on IV sodium nitroprusside. Which of the following is the MOST important monitoring concern with prolonged infusion?",
        options: [
          { key: "A", text: "Metabolic alkalosis" },
          { key: "B", text: "Cyanide toxicity" },
          { key: "C", text: "Hyperkalemia" },
          { key: "D", text: "QT prolongation" },
        ],
        correctOption: "B",
        explanation: "Sodium nitroprusside releases nitric oxide (causing vasodilation) and cyanide. Prolonged use or high doses can lead to cyanide toxicity, especially in patients with renal impairment (cyanide is metabolized to thiocyanate and excreted renally). Signs include metabolic acidosis (lactic acidosis), altered mental status, and dyspnea. Infusions should be limited to <72 hours and thiocyanate levels monitored.",
        difficulty: 3,
        cognitiveLevel: "clinical_reasoning",
        topic: "Antihypertensives - Vasodilators",
      });
      break;

    // === CNS ===
    case "pharm-cns-001":
      blueprints.push({
        question: "A patient on phenytoin develops gingival hyperplasia and nystagmus. Which pharmacokinetic property of phenytoin explains the difficulty in dose titration?",
        options: [
          { key: "A", text: "First-order elimination kinetics" },
          { key: "B", text: "Zero-order elimination kinetics at therapeutic doses" },
          { key: "C", text: "Extensive protein binding" },
          { key: "D", text: "Long elimination half-life of 96 hours" },
        ],
        correctOption: "B",
        explanation: "Phenytoin exhibits zero-order (saturable, Michaelis-Menten) elimination kinetics at therapeutic doses. Small dose increases can lead to disproportionate rises in plasma concentration, causing toxicity (nystagmus, ataxia, lethargy, gingival hyperplasia, hirsutism). TDM is essential. The therapeutic range is 10-20 mcg/mL.",
        difficulty: 3,
        cognitiveLevel: "clinical_reasoning",
        topic: "Antiepileptics",
      });
      break;

    case "pharm-cns-002":
      blueprints.push({
        question: "Valproic acid is a broad-spectrum antiepileptic effective against all of the following seizure types EXCEPT:",
        options: [
          { key: "A", text: "Absence seizures" },
          { key: "B", text: "Tonic-clonic seizures" },
          { key: "C", text: "Myoclonic seizures" },
          { key: "D", text: "Infantile spasms (best choice)" },
        ],
        correctOption: "D",
        explanation: "Valproic acid is effective for absence, tonic-clonic, myoclonic, and partial seizures. However, the drug of choice for infantile spasms is ACTH (adrenocorticotropic hormone) or vigabatrin, not valproate. Valproate is teratogenic (neural tube defects) and can cause hepatotoxicity (especially in children <2 years on polytherapy with inborn errors of metabolism).",
        difficulty: 4,
        cognitiveLevel: "application",
        topic: "Antiepileptics",
      });
      break;

    case "pharm-cns-003":
      blueprints.push({
        question: "Fluoxetine has a long half-life (4-6 days) primarily due to:",
        options: [
          { key: "A", text: "Extensive protein binding" },
          { key: "B", text: "Active metabolite norfluoxetine with similar activity and long half-life" },
          { key: "C", text: "Enterohepatic recirculation" },
          { key: "D", text: "Slow absorption from the gut" },
        ],
        correctOption: "B",
        explanation: "Fluoxetine is a prodrug. Its active metabolite, norfluoxetine, has a half-life of 7-15 days and is equipotent as an SSRI. This contributes to fluoxetine's long effective half-life (4-6 days after chronic dosing). This matters for: (1) washout period before starting MAOIs (need 5 weeks), (2) gradual onset/offset, and (3) less severe discontinuation syndrome compared to SSRIs with short half-lives.",
        difficulty: 3,
        cognitiveLevel: "application",
        topic: "Antidepressants - SSRIs",
      });
      break;

    case "pharm-cns-004":
      blueprints.push({
        question: "A patient presents with tachycardia, dilated pupils, urinary retention, and confusion after an overdose. ECG shows prolonged QRS and QT intervals. Which drug overdose is MOST likely?",
        options: [
          { key: "A", text: "Fluoxetine" },
          { key: "B", text: "Amitriptyline" },
          { key: "C", text: "Haloperidol" },
          { key: "D", text: "Diazepam" },
        ],
        correctOption: "B",
        explanation: "TCA overdose (like amitriptyline) produces anticholinergic toxidrome (tachycardia, dilated pupils, urinary retention, dry skin, confusion) plus cardiotoxicity (QRS/QT prolongation, arrhythmias) due to sodium channel blockade. Management includes sodium bicarbonate for QRS widening (>100ms), and monitoring for arrhythmias. Benzodiazepines are relatively safe in overdose.",
        difficulty: 4,
        cognitiveLevel: "clinical_reasoning",
        topic: "Antidepressants - TCAs",
      });
      break;

    case "pharm-cns-005":
      blueprints.push({
        question: "A 22-year-old male with schizophrenia started on haloperidol develops acute dystonia within 48 hours. The MOST appropriate management is:",
        options: [
          { key: "A", text: "Discontinue haloperidol and start clozapine" },
          { key: "B", text: "Administer intravenous diazepam" },
          { key: "C", text: "Admin intramuscular benztropine or promethazine" },
          { key: "D", text: "Add oral propranolol" },
        ],
        correctOption: "C",
        explanation: "Acute dystonia (e.g., oculogyric crisis, torticollis) caused by typical antipsychotics like haloperidol is due to acute D2 blockade. It is treated with anticholinergic drugs (benztropine, trihexyphenidyl) or antihistamines (promethazine, diphenhydramine), which restore the dopamine-acetylcholine balance in the basal ganglia. Propranolol is used for akathisia, not acute dystonia.",
        difficulty: 3,
        cognitiveLevel: "clinical_reasoning",
        topic: "Antipsychotics",
      });
      break;

    case "pharm-cns-006":
      blueprints.push({
        question: "Clozapine is reserved for treatment-resistant schizophrenia primarily because of the risk of:",
        options: [
          { key: "A", text: "Extrapyramidal symptoms" },
          { key: "B", text: "Agranulocytosis" },
          { key: "C", text: "Weight gain" },
          { key: "D", text: "QT prolongation" },
        ],
        correctOption: "B",
        explanation: "Clozapine is the drug of choice for treatment-resistant schizophrenia but carries a 1-2% risk of agranulocytosis (potentially fatal drop in neutrophil count), requiring mandatory regular WBC monitoring (weekly for first 18 weeks, then biweekly, then monthly). Despite this risk, clozapine is uniquely effective for refractory schizophrenia and reduces suicidality. It has minimal EPS risk but causes weight gain, hypersalivation, and sedation.",
        difficulty: 2,
        cognitiveLevel: "recall",
        topic: "Antipsychotics - Atypical",
      });
      break;

    case "pharm-cns-007":
      blueprints.push({
        question: "Flumazenil is the specific antidote for benzodiazepine overdose. Its mechanism of action is:",
        options: [
          { key: "A", text: "Irreversible inhibition of GABA transaminase" },
          { key: "B", text: "Competitive antagonist at the GABA-A receptor benzodiazepine site" },
          { key: "C", text: "Allosteric modulator of GABA-A receptor increasing chloride conductance" },
          { key: "D", text: "Sodium channel blocker" },
        ],
        correctOption: "B",
        explanation: "Benzodiazepines bind to a specific site on GABA-A receptors and allosterically enhance GABA-induced chloride influx. Flumazenil is a competitive antagonist at this same benzodiazepine binding site, thereby reversing the effects of benzodiazepines. It is given IV for overdose or to reverse procedural sedation. It can precipitate withdrawal in chronic benzodiazepine users and seizures in mixed overdoses.",
        difficulty: 2,
        cognitiveLevel: "recall",
        topic: "Benzodiazepines",
      });
      break;

    case "pharm-cns-008":
      blueprints.push({
        question: "Carbidopa is combined with levodopa in Parkinson's disease therapy because it:",
        options: [
          { key: "A", text: "Increases the half-life of levodopa" },
          { key: "B", text: "Inhibits peripheral dopa decarboxylase, reducing side effects and increasing CNS levodopa" },
          { key: "C", text: "Directly stimulates dopamine receptors" },
          { key: "D", text: "Inhibits COMT, prolonging levodopa action" },
        ],
        correctOption: "B",
        explanation: "Carbidopa is a peripheral dopa decarboxylase inhibitor that does not cross the blood-brain barrier. By inhibiting the conversion of levodopa to dopamine peripherally, it: (1) increases the amount of levodopa reaching the brain by 5-10 fold, (2) reduces peripheral side effects (nausea, vomiting, cardiac arrhythmias from circulating dopamine), and (3) allows reduction of levodopa dose.",
        difficulty: 2,
        cognitiveLevel: "application",
        topic: "Antiparkinsonian Drugs",
      });
      break;

    case "pharm-cns-009":
      blueprints.push({
        question: "Naloxone reverses opioid-induced respiratory depression by:",
        options: [
          { key: "A", text: "Activating the respiratory center directly" },
          { key: "B", text: "Competitive antagonism at mu-opioid receptors" },
          { key: "C", text: "Inhibiting opioid metabolism" },
          { key: "D", text: "Increasing dopamine release in the brainstem" },
        ],
        correctOption: "B",
        explanation: "Naloxone is a competitive antagonist at mu-opioid (MOR), kappa, and delta opioid receptors. It rapidly reverses opioid effects including respiratory depression, sedation, and analgesia. It has a short half-life (30-60 min), so repeat doses or infusion may be needed for long-acting opioids. It can precipitate acute withdrawal in opioid-dependent patients.",
        difficulty: 2,
        cognitiveLevel: "recall",
        topic: "Opioid Analgesics",
      });
      break;

    // === ENDOCRINE ===
    case "pharm-end-001":
      blueprints.push({
        question: "Metformin is contraindicated in which of the following clinical scenarios?",
        options: [
          { key: "A", text: "Type 2 diabetes with eGFR 55 mL/min/1.73m²" },
          { key: "B", text: "Type 2 diabetes with eGFR 25 mL/min/1.73m²" },
          { key: "C", text: "Type 2 diabetes with HbA1c 8.5%" },
          { key: "D", text: "Type 2 diabetes with BMI of 32 kg/m²" },
        ],
        correctOption: "B",
        explanation: "Metformin is contraindicated when eGFR <30 mL/min/1.73m² due to risk of lactic acidosis (a rare but serious adverse effect). It should also be temporarily stopped in situations with tissue hypoxia (sepsis, MI, contrast dye exposure). Metformin is first-line therapy for T2DM; it reduces hepatic gluconeogenesis and improves insulin sensitivity without causing hypoglycemia or weight gain.",
        difficulty: 3,
        cognitiveLevel: "clinical_reasoning",
        topic: "Antidiabetics - Biguanides",
      });
      break;

    case "pharm-end-002":
      blueprints.push({
        question: "Insulin glargine is classified as which type of insulin?",
        options: [
          { key: "A", text: "Rapid-acting" },
          { key: "B", text: "Short-acting" },
          { key: "C", text: "Intermediate-acting" },
          { key: "D", text: "Long-acting (peakless basal)" },
        ],
        correctOption: "D",
        explanation: "Insulin glargine is a long-acting recombinant insulin analogue that provides a constant, peakless basal insulin level for ~24 hours. It forms microprecipitates at the injection site that slowly release insulin. It is used once-daily for basal insulin coverage in both type 1 and type 2 diabetes. Rapid-acting analogues include lispro, aspart, and glulisine.",
        difficulty: 1,
        cognitiveLevel: "recall",
        topic: "Insulin Therapy",
      });
      break;

    case "pharm-end-003":
      blueprints.push({
        question: "Propylthiouracil (PTU) differs from methimazole in that PTU has the additional effect of:",
        options: [
          { key: "A", text: "Blocking iodine uptake by the thyroid" },
          { key: "B", text: "Inhibiting peripheral conversion of T4 to T3" },
          { key: "C", text: "Increasing thyroid hormone binding to TBG" },
          { key: "D", text: "Stimulating TSH secretion" },
        ],
        correctOption: "B",
        explanation: "Both PTU and methimazole inhibit thyroid peroxidase (blocking thyroid hormone synthesis), but PTU also inhibits the peripheral 5'-deiodinase enzyme that converts T4 to the more active T3 form. This additional effect makes PTU preferred for thyroid storm. However, PTU is associated with more hepatotoxicity than methimazole and is second-line in non-pregnant patients.",
        difficulty: 3,
        cognitiveLevel: "application",
        topic: "Antithyroid Drugs",
      });
      break;

    case "pharm-end-004":
      blueprints.push({
        question: "Which of the following is a consequence of long-term glucocorticoid therapy?",
        options: [
          { key: "A", text: "Addisonian crisis upon abrupt withdrawal" },
          { key: "B", text: "Increased bone mineral density" },
          { key: "C", text: "Hypoglycemia" },
          { key: "D", text: "Decreased susceptibility to infections" },
        ],
        correctOption: "A",
        explanation: "Chronic glucocorticoid therapy suppresses the HPA axis via negative feedback on ACTH. Abrupt withdrawal can cause acute adrenal insufficiency (Addisonian crisis). Other adverse effects include: osteoporosis (decreased bone density), hyperglycemia/diabetes, immunosuppression/increased infection risk, Cushing's syndrome (moon face, buffalo hump), skin thinning, cataracts, and avascular necrosis of femoral head. Steroids should be tapered gradually.",
        difficulty: 2,
        cognitiveLevel: "application",
        topic: "Corticosteroids",
      });
      break;

    // === ANTIMICROBIALS ===
    case "pharm-chem-001":
      blueprints.push({
        question: "Penicillin G exerts its bactericidal effect by targeting which bacterial structure?",
        options: [
          { key: "A", text: "Bacterial ribosome (50S subunit)" },
          { key: "B", text: "DNA gyrase" },
          { key: "C", text: "Cell wall (peptidoglycan synthesis via PBP binding)" },
          { key: "D", text: "RNA polymerase" },
        ],
        correctOption: "C",
        explanation: "Penicillin G binds to penicillin-binding proteins (PBPs), which are transpeptidases involved in the final cross-linking step of peptidoglycan synthesis in bacterial cell walls. This inhibits cell wall synthesis, leading to osmotic lysis (bactericidal). Resistance occurs primarily via beta-lactamase production (e.g., S. aureus) which cleaves the beta-lactam ring.",
        difficulty: 1,
        cognitiveLevel: "recall",
        topic: "Antibiotics - Penicillins",
      });
      break;

    case "pharm-chem-002":
      blueprints.push({
        question: "Ceftriaxone is contraindicated in neonates with hyperbilirubinemia because it:",
        options: [
          { key: "A", text: "Causes hemolysis in neonates" },
          { key: "B", text: "Displaces bilirubin from albumin, increasing kernicterus risk" },
          { key: "C", text: "Inhibits UDP-glucuronyl transferase" },
          { key: "D", text: "Crosses the blood-brain barrier in neonates" },
        ],
        correctOption: "B",
        explanation: "Ceftriaxone binds to albumin and can displace unconjugated bilirubin, increasing free bilirubin levels and the risk of kernicterus (bilirubin encephalopathy) in neonates. Ceftriaxone is also calcium salt and can precipitate with calcium in neonates. Third-generation cephalosporins have enhanced Gram-negative coverage and good CSF penetration, making them useful for meningitis.",
        difficulty: 4,
        cognitiveLevel: "application",
        topic: "Antibiotics - Cephalosporins",
      });
      break;

    case "pharm-chem-003":
      blueprints.push({
        question: "Azithromycin inhibits bacterial protein synthesis by binding to which ribosomal subunit?",
        options: [
          { key: "A", text: "30S subunit" },
          { key: "B", text: "40S subunit" },
          { key: "C", text: "50S subunit" },
          { key: "D", text: "60S subunit" },
        ],
        correctOption: "C",
        explanation: "Azithromycin (a macrolide) binds to the 50S ribosomal subunit and inhibits the translocation step of protein synthesis. Other 50S inhibitors include: chloramphenicol, clindamycin, linezolid, and streptogramins. 30S inhibitors include: tetracyclines, aminoglycosides, and tigecycline. Azithromycin has a long half-life (~68 hours), good tissue penetration, and is used for atypical pneumonias.",
        difficulty: 1,
        cognitiveLevel: "recall",
        topic: "Antibiotics - Macrolides",
      });
      break;

    case "pharm-chem-004":
      blueprints.push({
        question: "A patient on gentamicin develops vertigo and hearing loss. Which adverse effect is this, and what is its mechanism?",
        options: [
          { key: "A", text: "Ototoxicity due to accumulation in cochlear and vestibular hair cells" },
          { key: "B", text: "Ototoxicity due to eighth nerve demyelination" },
          { key: "C", text: "CNS toxicity due to meningeal irritation" },
          { key: "D", text: "Type II hypersensitivity reaction affecting the inner ear" },
        ],
        correctOption: "A",
        explanation: "Aminoglycosides (gentamicin, tobramycin, amikacin) accumulate in the inner ear hair cells via endocytosis and cause ototoxicity (both vestibular and cochlear). Vestibular toxicity presents with vertigo, nystagmus, and ataxia; cochlear toxicity presents with high-frequency hearing loss. Risk factors include high doses, prolonged therapy, renal impairment, and concurrent loop diuretics. TDM is essential to minimize toxicity.",
        difficulty: 3,
        cognitiveLevel: "clinical_reasoning",
        topic: "Antibiotics - Aminoglycosides",
      });
      break;

    case "pharm-chem-005":
      blueprints.push({
        question: "Ciprofloxacin is generally contraindicated in children under 18 years because of its association with:",
        options: [
          { key: "A", text: "Nephrotoxicity" },
          { key: "B", text: "Cartilage damage (arthropathy) in weight-bearing joints" },
          { key: "C", text: "Hepatotoxicity" },
          { key: "D", text: "Bone marrow suppression" },
        ],
        correctOption: "B",
        explanation: "Fluoroquinolones (ciprofloxacin, levofloxacin) cause arthropathy in weight-bearing joints of juvenile animals, leading to their restriction in children. However, they are used in children when benefit outweighs risk (e.g., pseudomonal infections in cystic fibrosis). Other important side effects include tendonitis/tendon rupture (FDA black box), QT prolongation, CNS effects (dizziness, confusion), and phototoxicity.",
        difficulty: 2,
        cognitiveLevel: "application",
        topic: "Antibiotics - Fluoroquinolones",
      });
      break;

    case "pharm-chem-006":
      blueprints.push({
        question: "A patient on metronidazole for anaerobic infection consumes alcohol and develops severe nausea, vomiting, and flushing. This reaction is due to:",
        options: [
          { key: "A", text: "Type I hypersensitivity" },
          { key: "B", text: "Disulfiram-like reaction from aldehyde dehydrogenase inhibition" },
          { key: "C", text: "Metronidazole-induced alcohol intolerance" },
          { key: "D", text: "Serotonin syndrome" },
        ],
        correctOption: "B",
        explanation: "Metronidazole inhibits aldehyde dehydrogenase, leading to accumulation of acetaldehyde when alcohol is consumed. This causes the 'disulfiram-like reaction' with flushing, nausea, vomiting, headache, and hypotension. Patients should be advised to avoid alcohol during therapy and for 48 hours after completion. Disulfiram itself is used as aversion therapy in alcohol dependence.",
        difficulty: 2,
        cognitiveLevel: "clinical_reasoning",
        topic: "Antibiotics - Metronidazole",
      });
      break;

    case "pharm-chem-007":
      blueprints.push({
        question: "Isoniazid can cause peripheral neuropathy due to:",
        options: [
          { key: "A", text: "Direct toxic effect on peripheral nerves" },
          { key: "B", text: "Pyridoxine (vitamin B6) deficiency" },
          { key: "C", text: "Thiamine deficiency" },
          { key: "D", text: "Accumulation of neurotoxic metabolites" },
        ],
        correctOption: "B",
        explanation: "Isoniazid (INH) interferes with pyridoxine (vitamin B6) metabolism by forming hydrazone complexes with pyridoxal phosphate, and also inhibits pyridoxal kinase. This can lead to pyridoxine deficiency and peripheral neuropathy. Prophylactic pyridoxine (10-50 mg/day) is co-administered to prevent this. Slow acetylators are at higher risk. Other INH adverse effects: hepatotoxicity, drug-induced lupus.",
        difficulty: 2,
        cognitiveLevel: "recall",
        topic: "Antitubercular Drugs",
      });
      break;

    case "pharm-chem-008":
      blueprints.push({
        question: "Rifampicin causes orange-red discoloration of body fluids. Which of the following statements about its drug interactions is TRUE?",
        options: [
          { key: "A", text: "Rifampicin inhibits CYP450 enzymes, increasing levels of other drugs" },
          { key: "B", text: "Rifampicin induces CYP450 enzymes, reducing the effectiveness of oral contraceptives" },
          { key: "C", text: "Rifampicin has no significant drug interactions" },
          { key: "D", text: "Rifampicin increases warfarin effect by displacing it from protein binding" },
        ],
        correctOption: "B",
        explanation: "Rifampicin is a potent inducer of multiple CYP450 enzymes (CYP3A4, CYP2C9, CYP2C19, etc.) and P-glycoprotein. It reduces plasma levels of many co-administered drugs including oral contraceptives (women need alternative contraception), warfarin (INR decreases), antiretrovirals, methadone, and corticosteroids. This is the opposite of isoniazid, which inhibits some CYP enzymes.",
        difficulty: 3,
        cognitiveLevel: "application",
        topic: "Antitubercular Drugs",
      });
      break;

    case "pharm-chem-009":
      blueprints.push({
        question: "Long-term use of chloroquine is associated with which serious adverse effect requiring regular ophthalmologic monitoring?",
        options: [
          { key: "A", text: "Cataract formation" },
          { key: "B", text: "Glaucoma" },
          { key: "C", text: "Irreversible retinopathy (bull's eye maculopathy)" },
          { key: "D", text: "Optic neuritis" },
        ],
        correctOption: "C",
        explanation: "Chloroquine and hydroxychloroquine cause dose-dependent irreversible retinopathy (bull's eye maculopathy) with prolonged use (>5 years or cumulative dose >460g). Retinal toxicity is due to drug accumulation in the retinal pigment epithelium. Baseline and annual ophthalmologic screening is recommended. It also can cause corneal deposits (reversible), and QT prolongation.",
        difficulty: 2,
        cognitiveLevel: "recall",
        topic: "Antimalarials",
      });
      break;

    case "pharm-chem-010":
      blueprints.push({
        question: "Folinic acid (leucovorin) rescue is used in high-dose methotrexate therapy to:",
        options: [
          { key: "A", text: "Enhance methotrexate's antitumor effect" },
          { key: "B", text: "Protect normal cells from methotrexate toxicity by providing reduced folate" },
          { key: "C", text: "Increase methotrexate absorption" },
          { key: "D", text: "Prevent methotrexate metabolism" },
        ],
        correctOption: "B",
        explanation: "Methotrexate inhibits dihydrofolate reductase (DHFR), blocking conversion of dihydrofolate to tetrahydrofolate (reduced folate), which is needed for thymidylate and purine synthesis. Folinic acid (leucovorin) is a reduced folate that bypasses the DHFR block, providing tetrahydrofolate to normal cells. It is given 24-36 hours after high-dose MTX to 'rescue' normal cells while tumor cells (which have reduced folate transport) are selectively affected.",
        difficulty: 3,
        cognitiveLevel: "application",
        topic: "Anticancer - Antimetabolites",
      });
      break;

    case "pharm-chem-011":
      blueprints.push({
        question: "The dose-limiting toxicity of doxorubicin is:",
        options: [
          { key: "A", text: "Nephrotoxicity" },
          { key: "B", text: "Cardiotoxicity (dilated cardiomyopathy)" },
          { key: "C", text: "Pulmonary fibrosis" },
          { key: "D", text: "Hemorrhagic cystitis" },
        ],
        correctOption: "B",
        explanation: "Doxorubicin (an anthracycline antibiotic) causes dose-dependent cardiotoxicity through oxidative stress, free radical formation, and interference with cardiac topoisomerase II-beta. It can present as acute (arrhythmias) or chronic (dilated cardiomyopathy, heart failure) cardiotoxicity. Total cumulative dose should be limited (<450-550 mg/m²). Dexrazoxane (iron chelator that reduces free radical formation) is used for cardioprotection.",
        difficulty: 2,
        cognitiveLevel: "recall",
        topic: "Anticancer - Anthracyclines",
      });
      break;

    // === DIURETICS ===
    case "pharm-renal-001":
      blueprints.push({
        question: "Furosemide produces its diuretic effect by inhibiting which transporter in the nephron?",
        options: [
          { key: "A", text: "Na+/H+ exchanger in the proximal tubule" },
          { key: "B", text: "Na+/K+/2Cl- cotransporter in the thick ascending limb of loop of Henle" },
          { key: "C", text: "Na+/Cl- cotransporter in the distal convoluted tubule" },
          { key: "D", text: "Epithelial sodium channel (ENaC) in the collecting duct" },
        ],
        correctOption: "B",
        explanation: "Furosemide is a loop diuretic that inhibits the Na+/K+/2Cl- (NKCC2) cotransporter in the thick ascending limb of the loop of Henle. This abolishes the hypertonic medullary interstitium, reducing both water reabsorption and the kidney's concentrating ability. It is a high-ceiling diuretic. Adverse effects: hypokalemia, hypomagnesemia, ototoxicity (dose-related), hyperuricemia, and hypocalcemia (loop diuretics decrease calcium reabsorption).",
        difficulty: 2,
        cognitiveLevel: "recall",
        topic: "Diuretics - Loop",
      });
      break;

    case "pharm-renal-002":
      blueprints.push({
        question: "A 60-year-old male with heart failure on spironolactone develops painful gynecomastia. This effect is due to:",
        options: [
          { key: "A", text: "Aldosterone receptor agonism in breast tissue" },
          { key: "B", text: "Anti-androgen effects through testosterone receptor blockade" },
          { key: "C", text: "Increased prolactin secretion" },
          { key: "D", text: "Estrogen-like effect of spironolactone" },
        ],
        correctOption: "B",
        explanation: "Spironolactone is a competitive aldosterone antagonist but also has anti-androgenic properties by blocking testosterone receptors and inhibiting testosterone synthesis. This can cause painful gynecomastia (10-40% of patients), impotence, and menstrual irregularities. Eplerenone is a more selective aldosterone antagonist with less gynecomastia risk. Spironolactone also carries risk of hyperkalemia, especially with renal impairment or concurrent ACE inhibitors.",
        difficulty: 3,
        cognitiveLevel: "clinical_reasoning",
        topic: "Diuretics - K+ Sparing",
      });
      break;

    case "pharm-renal-003":
      blueprints.push({
        question: "Acetazolamide causes metabolic acidosis by inhibiting which enzyme in the proximal tubule?",
        options: [
          { key: "A", text: "Na+/K+ ATPase" },
          { key: "B", text: "Carbonic anhydrase" },
          { key: "C", text: "Aldose reductase" },
          { key: "D", text: "Angiotensin converting enzyme" },
        ],
        correctOption: "B",
        explanation: "Acetazolamide inhibits carbonic anhydrase in the proximal convoluted tubule, reducing bicarbonate reabsorption and causing bicarbonate diuresis. This leads to a hyperchloremic metabolic acidosis. The drug is a sulfonamide derivative and can cause sulfonamide allergies. Clinical uses: glaucoma (reduces aqueous humor production), altitude sickness prevention, urinary alkalinization, and epilepsy (adjunctive).",
        difficulty: 2,
        cognitiveLevel: "recall",
        topic: "Diuretics - CA Inhibitors",
      });
      break;

    // === RESPIRATORY ===
    case "pharm-resp-001":
      blueprints.push({
        question: "Ipratropium bromide is preferred over atropine as an inhaled bronchodilator because:",
        options: [
          { key: "A", text: "It is a more potent bronchodilator" },
          { key: "B", text: "It is a quaternary ammonium compound with minimal systemic absorption" },
          { key: "C", text: "It also has anti-inflammatory effects" },
          { key: "D", text: "It has both alpha and beta blocking effects" },
        ],
        correctOption: "B",
        explanation: "Ipratropium is a quaternary ammonium compound that is poorly absorbed from the respiratory tract (minimal systemic bioavailability). This gives it a wide safety margin with fewer systemic anticholinergic side effects (dry mouth, blurred vision, tachycardia, urinary retention) compared to atropine (a tertiary amine that is well absorbed). It is used for COPD and asthma, with onset ~15 min, duration 4-6 hours.",
        difficulty: 2,
        cognitiveLevel: "application",
        topic: "Respiratory - Anticholinergics",
      });
      break;

    case "pharm-resp-002":
      blueprints.push({
        question: "Theophylline has a narrow therapeutic index of 10-20 mcg/mL. Which of the following is a sign of theophylline toxicity?",
        options: [
          { key: "A", text: "Bradycardia and hypotension" },
          { key: "B", text: "Tachycardia, seizures, and vomiting" },
          { key: "C", text: "Dry mouth and blurred vision" },
          { key: "D", text: "Peripheral neuropathy" },
        ],
        correctOption: "B",
        explanation: "Theophylline toxicity presents with: GI effects (nausea, vomiting), CNS effects (seizures, agitation, insomnia), and cardiovascular effects (tachycardia, atrial fibrillation, hypotension). At toxic levels, theophylline inhibits phosphodiesterase excessively, causing high cAMP and sympathetic activation. It is metabolized by CYP1A2; inhibitors (ciprofloxacin, fluvoxamine) increase levels, while inducers (rifampin, smoking) decrease levels.",
        difficulty: 3,
        cognitiveLevel: "clinical_reasoning",
        topic: "Respiratory - Methylxanthines",
      });
      break;

    case "pharm-resp-003":
      blueprints.push({
        question: "Inhaled corticosteroids are preferred over oral corticosteroids for maintenance therapy in asthma because:",
        options: [
          { key: "A", text: "They have greater systemic effects" },
          { key: "B", text: "They provide direct delivery to airways with fewer systemic adverse effects" },
          { key: "C", text: "They work faster than oral steroids" },
          { key: "D", text: "They can reverse airway remodeling more effectively" },
        ],
        correctOption: "B",
        explanation: "Inhaled corticosteroids (ICS) deliver the drug directly to the airways, maximizing local anti-inflammatory effect while minimizing systemic absorption and adverse effects (osteoporosis, HPA suppression, hyperglycemia). They are the cornerstone of controller therapy in persistent asthma. Local side effects: oropharyngeal candidiasis and dysphonia, which can be reduced by rinsing mouth after use.",
        difficulty: 2,
        cognitiveLevel: "application",
        topic: "Respiratory - Corticosteroids",
      });
      break;

    // === NSAIDs ===
    case "pharm-nsaid-001":
      blueprints.push({
        question: "Low-dose aspirin (75-150 mg daily) provides cardioprotection primarily through:",
        options: [
          { key: "A", text: "Anti-inflammatory effect at the level of vascular endothelium" },
          { key: "B", text: "Irreversible inhibition of platelet COX-1, reducing thromboxane A2 synthesis" },
          { key: "C", text: "Reversible inhibition of COX-2 in macrophages" },
          { key: "D", text: "Inhibition of platelet aggregation factor (PAF)" },
        ],
        correctOption: "B",
        explanation: "Low-dose aspirin irreversibly acetylates COX-1 in platelets (which are anucleate and cannot synthesize new enzyme), inhibiting thromboxane A2 (TXA2) synthesis. TXA2 causes platelet aggregation and vasoconstriction. This antiplatelet effect lasts for the platelet's lifetime (~7-10 days). Higher doses also inhibit COX-2 (anti-inflammatory) but increase GI bleeding risk.",
        difficulty: 2,
        cognitiveLevel: "application",
        topic: "NSAIDs - Aspirin",
      });
      break;

    case "pharm-nsaid-002":
      blueprints.push({
        question: "A 20-year-old female presents with acute liver failure 48 hours after ingesting a large quantity of tablets. N-acetylcysteine is the antidote. Which drug did she most likely overdose on?",
        options: [
          { key: "A", text: "Ibuprofen" },
          { key: "B", text: "Paracetamol (acetaminophen)" },
          { key: "C", text: "Aspirin" },
          { key: "D", text: "Naproxen" },
        ],
        correctOption: "B",
        explanation: "Paracetamol (acetaminophen) overdose is a leading cause of acute liver failure. The toxic metabolite NAPQI (N-acetyl-p-benzoquinone imine) is normally detoxified by glutathione. In overdose, glutathione stores are depleted, and NAPQI accumulates, causing centrilobular hepatic necrosis. N-acetylcysteine (NAC) replenishes glutathione. The Rumack-Matthew nomogram guides treatment. NAC is most effective if given within 8-10 hours of ingestion.",
        difficulty: 2,
        cognitiveLevel: "clinical_reasoning",
        topic: "Paracetamol",
      });
      break;

    case "pharm-nsaid-003":
      blueprints.push({
        question: "Celecoxib is preferred over naproxen for chronic arthritis in a patient with a history of peptic ulcer disease. However, celecoxib carries increased risk of which adverse effect?",
        options: [
          { key: "A", text: "Nephrotoxicity" },
          { key: "B", text: "Cardiovascular events (MI, stroke)" },
          { key: "C", text: "Hepatotoxicity" },
          { key: "D", text: "Bone marrow suppression" },
        ],
        correctOption: "B",
        explanation: "Selective COX-2 inhibitors (celecoxib, rofecoxib) have reduced GI side effects (less COX-1 inhibition means less gastric mucosal damage) but increase cardiovascular risk. The exact mechanism involves imbalance between prostacyclin (PGI2, produced by COX-2, which is vasoprotective) and thromboxane A2 (TXA2, produced by COX-1, which promotes thrombosis). Rofecoxib was withdrawn for this reason. Celecoxib carries a FDA black box warning for CV risk.",
        difficulty: 3,
        cognitiveLevel: "clinical_reasoning",
        topic: "NSAIDs - COX-2 Inhibitors",
      });
      break;

    // === HEMATOLOGY ===
    case "pharm-heme-001":
      blueprints.push({
        question: "Warfarin's anticoagulant effect is monitored by the INR (International Normalized Ratio). A patient on warfarin presents with an INR of 5.8 without bleeding. The MOST appropriate management is:",
        options: [
          { key: "A", text: "Administer FFP immediately" },
          { key: "B", text: "Hold warfarin and administer oral vitamin K" },
          { key: "C", text: "Continue warfarin at the same dose" },
          { key: "D", text: "Administer protamine sulfate" },
        ],
        correctOption: "B",
        explanation: "Warfarin monitoring: therapeutic INR is 2-3 for most indications (AF, DVT, PE). Warfarin inhibits VKORC1, preventing recycling of vitamin K, which is required for gamma-carboxylation of factors II, VII, IX, X and proteins C and S. Supratherapeutic INR without bleeding: hold warfarin and give oral vitamin K. With significant bleeding: give IV vitamin K + FFP/PCC. Protamine is for heparin reversal.",
        difficulty: 3,
        cognitiveLevel: "clinical_reasoning",
        topic: "Anticoagulants - Warfarin",
      });
      break;

    case "pharm-heme-002":
      blueprints.push({
        question: "Heparin-induced thrombocytopenia (HIT) is characterized by all of the following EXCEPT:",
        options: [
          { key: "A", text: "Paradoxical thrombosis despite thrombocytopenia" },
          { key: "B", text: "Immune-mediated destruction of platelets" },
          { key: "C", text: "Onset typically within 5-10 days of heparin initiation" },
          { key: "D", text: "Bleeding is the most common presenting symptom" },
        ],
        correctOption: "D",
        explanation: "HIT is an immune-mediated reaction where IgG antibodies form against platelet factor 4 (PF4)-heparin complexes, activating platelets and causing both thrombocytopenia AND paradoxical thrombosis (not bleeding). Up to 50% develop thrombosis (DVT, PE, arterial thrombosis). Treatment: stop all heparin, start alternative anticoagulant (argatroban, bivalirudin, fondaparinux). DO NOT give platelet transfusions (may worsen thrombosis).",
        difficulty: 4,
        cognitiveLevel: "clinical_reasoning",
        topic: "Anticoagulants - Heparin",
      });
      break;

    case "pharm-heme-003":
      blueprints.push({
        question: "Clopidogrel is a prodrug that requires activation by which CYP450 enzyme? Patients with reduced-function alleles of this enzyme may have diminished antiplatelet effect.",
        options: [
          { key: "A", text: "CYP3A4" },
          { key: "B", text: "CYP2D6" },
          { key: "C", text: "CYP2C19" },
          { key: "D", text: "CYP2E1" },
        ],
        correctOption: "C",
        explanation: "Clopidogrel is a prodrug that requires two-step biotransformation, primarily by CYP2C19, to its active metabolite. Patients with reduced-function CYP2C19 alleles (*2, *3) have reduced clopidogrel activation, leading to higher on-treatment platelet reactivity and increased risk of stent thrombosis. Alternative antiplatelets (prasugrel, ticagrelor) may be preferred in such patients or in high-risk scenarios (ACS).",
        difficulty: 3,
        cognitiveLevel: "application",
        topic: "Antiplatelets",
      });
      break;

    // === GI ===
    case "pharm-gi-001":
      blueprints.push({
        question: "Omeprazole is a prodrug that is activated in which cellular compartment?",
        options: [
          { key: "A", text: "Cytoplasm of gastric parietal cells" },
          { key: "B", text: "Acidic environment of the parietal cell canaliculus" },
          { key: "C", text: "Liver microsomes" },
          { key: "D", text: "Gastric lumen" },
        ],
        correctOption: "B",
        explanation: "Omeprazole is a weak base prodrug that accumulates in the acidic canalicular space of gastric parietal cells (pH ~1). In this acidic environment, it is protonated and converted to its active form (a sulfenamide) which irreversibly binds cysteine residues of H+/K+ ATPase (the proton pump), inhibiting gastric acid secretion. Maximum effect takes 3-4 days; acid secretion returns when new pumps are synthesized (~24-48 hours after stopping).",
        difficulty: 3,
        cognitiveLevel: "application",
        topic: "GI - Proton Pump Inhibitors",
      });
      break;

    case "pharm-gi-002":
      blueprints.push({
        question: "Ondansetron prevents nausea and vomiting by blocking 5-HT3 receptors located in the:",
        options: [
          { key: "A", text: "Vestibular apparatus of the inner ear" },
          { key: "B", text: "Chemoreceptor trigger zone (CTZ) and gastrointestinal tract" },
          { key: "C", text: "Cerebral cortex" },
          { key: "D", text: "Vomiting center in the medulla directly" },
        ],
        correctOption: "B",
        explanation: "Ondansetron, a selective 5-HT3 antagonist, blocks serotonin receptors in two key areas: (1) the CTZ (area postrema) in the medulla, and (2) vagal afferent nerve terminals in the GI tract. This interrupts the emetic signal at both central and peripheral sites. It is effective for chemotherapy-induced (especially high-dose cisplatin), postoperative, and radiation-induced nausea. QT prolongation is a dose-dependent concern.",
        difficulty: 2,
        cognitiveLevel: "recall",
        topic: "GI - Antiemetics",
      });
      break;

    // === IMMUNOSUPPRESSANTS ===
    case "pharm-immu-001":
      blueprints.push({
        question: "Cyclosporine exerts its immunosuppressant effect primarily by:",
        options: [
          { key: "A", text: "Inhibiting purine synthesis in lymphocytes" },
          { key: "B", text: "Blocking IL-2 transcription through calcineurin inhibition" },
          { key: "C", text: "Depleting circulating T lymphocytes" },
          { key: "D", text: "Blocking co-stimulatory signals between T cells and APCs" },
        ],
        correctOption: "B",
        explanation: "Cyclosporine binds cyclophilin, and the complex inhibits calcineurin, a phosphatase that dephosphorylates NFAT (nuclear factor of activated T-cells). This prevents NFAT translocation to the nucleus and transcription of IL-2 and other cytokines, thereby suppressing T-cell activation. Major side effects: nephrotoxicity (dose-limiting), hypertension, neurotoxicity (tremor), gingival hyperplasia, hirsutism, and increased infection risk. TDM is essential (through levels).",
        difficulty: 3,
        cognitiveLevel: "recall",
        topic: "Immunosuppressants",
      });
      break;

    // === LOCAL ANESTHETICS ===
    case "pharm-la-001":
      blueprints.push({
        question: "Ester-type local anesthetics (e.g., procaine) are metabolized by which enzyme?",
        options: [
          { key: "A", text: "CYP3A4 in the liver" },
          { key: "B", text: "Plasma pseudocholinesterase" },
          { key: "C", text: "Monoamine oxidase (MAO)" },
          { key: "D", text: "Alcohol dehydrogenase" },
        ],
        correctOption: "B",
        explanation: "Ester-type local anesthetics (procaine, cocaine, tetracaine, benzocaine) are metabolized by plasma pseudocholinesterase (butyrylcholinesterase) to para-aminobenzoic acid (PABA) derivatives, which can cause allergic reactions. Amide-type (lidocaine, bupivacaine, ropivacaine) are metabolized by hepatic CYP450 enzymes and are generally preferred due to lower allergy risk. The ester vs amide distinction can be remembered: amides have an 'i' before '-caine' (lidocaine, bupivacaine).",
        difficulty: 2,
        cognitiveLevel: "recall",
        topic: "Local Anesthetics",
      });
      break;

    case "pharm-la-002":
      blueprints.push({
        question: "Rescue therapy for bupivacaine-induced cardiotoxicity involves:",
        options: [
          { key: "A", text: "IV lidocaine" },
          { key: "B", text: "IV lipid emulsion (Intralipid)" },
          { key: "C", text: "IV amiodarone" },
          { key: "D", text: "IV sodium bicarbonate" },
        ],
        correctOption: "B",
        explanation: "Bupivacaine is more cardiotoxic than other local anesthetics due to its high lipid solubility and strong binding to cardiac sodium channels. Accidental IV injection can cause refractory ventricular arrhythmias and cardiovascular collapse. IV lipid emulsion (Intralipid) therapy is the recommended rescue: the 'lipid sink' theory suggests it sequesters bupivacaine from cardiac tissue, and it may also improve cardiac metabolism. Avoid vasopressin; epinephrine is preferred if needed.",
        difficulty: 3,
        cognitiveLevel: "clinical_reasoning",
        topic: "Local Anesthetics - Toxicity",
      });
      break;

    default:
      break;
  }

  return blueprints;
}

export class MCQWriterAgent {
  private config: PipelineConfig;

  constructor(config: PipelineConfig) {
    this.config = config;
  }

  async generateMCQs(verifiedFacts: CandidateFact[]): Promise<{
    mcqs: GeneratedMCQ[];
    errors: string[];
  }> {
    const mcqs: GeneratedMCQ[] = [];
    const errors: string[] = [];

    let counter = 0;

    for (const fact of verifiedFacts) {
      const blueprints = generateMCQsFromFact(fact, counter);

      for (const bp of blueprints) {
        // Check difficulty spread constraints
        const diffLabel = bp.difficulty <= 2 ? "easy" : bp.difficulty <= 3 ? "moderate" : "hard";
        const currentDiffCount = mcqs.filter((m) => {
          const mDiff = m.difficulty <= 2 ? "easy" : m.difficulty <= 3 ? "moderate" : "hard";
          return mDiff === diffLabel;
        }).length;

        const maxForDiff =
          diffLabel === "easy"
            ? this.config.difficultySpread.easy
            : diffLabel === "moderate"
            ? this.config.difficultySpread.moderate
            : this.config.difficultySpread.hard;

        if (currentDiffCount >= maxForDiff && maxForDiff !== -1) {
          continue; // Skip if we've hit the limit for this difficulty tier
        }

        // Also cap by total target
        if (mcqs.length >= this.config.targetCount) {
          break;
        }

        const mcq: GeneratedMCQ = {
          id: `mcq-${fact.specialty.toLowerCase()}-${String(counter).padStart(3, "0")}`,
          question: bp.question,
          options: bp.options,
          correctOption: bp.correctOption,
          explanation: bp.explanation,
          difficulty: bp.difficulty,
          subject: fact.specialty,
          topicTags: [fact.specialty, bp.topic, ...fact.sources.map((s) => s.type)],
          careerStage: fact.careerStage,
          sourceFacts: [fact.fact],
          sources: fact.sources,
          verificationStatus: "pending",
          generatedBy: "writer",
          cognitiveLevel: bp.cognitiveLevel,
        };

        mcqs.push(mcq);
        counter++;
      }

      if (mcqs.length >= this.config.targetCount) {
        break;
      }
    }

    console.log(`[WRITER] Generated ${mcqs.length} MCQs from ${verifiedFacts.length} verified facts`);
    return { mcqs, errors };
  }
}
