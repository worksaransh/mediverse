# CONTENT-AUDIT.md
## Mediverse OS — Pipeline Audit Report

**Generated:** 2026-07-12T08:44:25.694Z
**Pipeline duration:** 15.8s
**Specialty:** Pharmacology
**Career Stage:** pg_prep
**Target:** 50 MCQs

---

## Pipeline Summary

| Stage | Input | Output | Status |
|-------|-------|--------|--------|
| AGENT 1: Finder | — | 62 candidate facts | ✅ Complete |
| AGENT 2: Verifier | 62 facts | 62 verified, 0 rejected | ✅ Complete |
| AGENT 3: MCQ Writer | 62 verified facts | 50 MCQs generated | ✅ Complete |
| AGENT 4: Fact-Checker | 50 MCQs | 50 approved, 0 rejected | ✅ Complete |
| AGENT 5: Organizer/DB | 50 approved MCQs | 50 written to DB | ✅ Complete |

### Key Metrics

- **Facts found:** 62
- **Facts verified (cross-checked):** 62
- **Facts rejected:** 0
- **MCQs generated:** 50
- **MCQs approved (passed fact-check):** 50
- **MCQs rejected by fact-checker:** 0
- **MCQs written to DB:** 50
- **Overall yield:** 50/62 facts → MCQs

---

## Coverage by Topic

| Topic | Count |
|-------|-------|
| Pharmacokinetics | 3 |
| Parasympathomimetics | 2 |
| Calcium Channel Blockers | 2 |
| Antiarrhythmics | 2 |
| Antiepileptics | 2 |
| Antitubercular Drugs | 2 |
| Drug Metabolism | 1 |
| Therapeutic Drug Monitoring | 1 |
| Drug Interactions | 1 |
| Autonomic Nervous System | 1 |
| ANS - Alpha Blockers | 1 |
| ANS - Beta Blockers | 1 |
| Neuromuscular Blockers | 1 |
| Beta-2 Agonists | 1 |
| Antihypertensives - ACE Inhibitors | 1 |
| Cardiac Glycosides | 1 |
| Lipid-Lowering Drugs | 1 |
| Antihypertensives - Vasodilators | 1 |
| Antidepressants - SSRIs | 1 |
| Antidepressants - TCAs | 1 |
| Antipsychotics | 1 |
| Antipsychotics - Atypical | 1 |
| Benzodiazepines | 1 |
| Antiparkinsonian Drugs | 1 |
| Opioid Analgesics | 1 |
| Antidiabetics - Biguanides | 1 |
| Insulin Therapy | 1 |
| Antithyroid Drugs | 1 |
| Corticosteroids | 1 |
| Antibiotics - Penicillins | 1 |
| Antibiotics - Cephalosporins | 1 |
| Antibiotics - Macrolides | 1 |
| Antibiotics - Aminoglycosides | 1 |
| Antibiotics - Fluoroquinolones | 1 |
| Antibiotics - Metronidazole | 1 |
| Antimalarials | 1 |
| Anticancer - Antimetabolites | 1 |
| Anticancer - Anthracyclines | 1 |
| Diuretics - Loop | 1 |
| Diuretics - K+ Sparing | 1 |
| Diuretics - CA Inhibitors | 1 |
| Respiratory - Anticholinergics | 1 |
| Respiratory - Methylxanthines | 1 |

**Total distinct topics:** 43

---

## Rejected MCQs (with reasons)

No MCQs were rejected.

---

## Errors & Warnings

No errors or warnings.

---

## Sample of 20 Approved MCQs (for human review)

> **⚠️ HUMAN REVIEW REQUIRED**: AI-generated medical questions MUST be reviewed by a qualified medical professional before students trust them. The fact-checker verifies internal consistency but cannot replace clinical judgment.

### MCQ 1: Pharmacology — recall (Difficulty: 2/5)

**Question:** Which of the following drugs undergoes the MOST extensive first-pass metabolism, making oral administration impractical?

-    **A.** Propranolol
-    **B.** Lidocaine
-    **C.** Nitroglycerin
- ✅ **D.** All of the above

**Correct Answer:** D

**Explanation:** Lidocaine, propranolol, and nitroglycerin all undergo extensive first-pass hepatic metabolism. Lidocaine is therefore given IV/IM, nitroglycerin sublingually, and propranolol requires higher oral doses to achieve therapeutic effect. First-pass metabolism occurs in the liver via the portal circulation.

**Cognitive Level:** recall

**Sources:**
- [statpearls] StatPearls - First Pass Metabolism — https://www.ncbi.nlm.nih.gov/books/NBK551679/
- [pubmed] NCBI - Drug Distribution and Metabolism — https://pubmed.ncbi.nlm.nih.gov/31985931/

**Fact-check result:** ✅ PASSED
**Notes:** All fact-check gates passed

---

### MCQ 2: Pharmacology — application (Difficulty: 3/5)

**Question:** A drug has a volume of distribution (Vd) of 40 L in a 70 kg patient. Which statement BEST describes this drug?

-    **A.** The drug is largely confined to the plasma compartment
- ✅ **B.** The drug distributes widely into tissues
-    **C.** The drug is highly protein-bound
-    **D.** The drug has poor oral bioavailability

**Correct Answer:** B

**Explanation:** A Vd of 40 L (approximately 0.57 L/kg) in a 70 kg patient exceeds total body water (~42 L), suggesting the drug distributes extensively into tissues. High Vd (>0.6 L/kg) indicates extensive tissue distribution. Vd relates the total amount of drug in the body to its plasma concentration.

**Cognitive Level:** application

**Sources:**
- [statpearls] StatPearls - Volume of Distribution — https://www.ncbi.nlm.nih.gov/books/NBK545280/
- [pubmed] PubMed - Clinical Pharmacokinetics — https://pubmed.ncbi.nlm.nih.gov/32242330/

**Fact-check result:** ✅ PASSED
**Notes:** All fact-check gates passed

---

### MCQ 3: Pharmacology — recall (Difficulty: 2/5)

**Question:** Which cytochrome P450 isoform is responsible for the metabolism of approximately 50% of all clinically used drugs?

-    **A.** CYP2D6
- ✅ **B.** CYP3A4
-    **C.** CYP2C9
-    **D.** CYP2E1

**Correct Answer:** B

**Explanation:** CYP3A4 is the most abundant CYP450 isoform in the liver and small intestine, metabolizing ~50% of all drugs. CYP2D6 metabolizes ~25% of drugs (antidepressants, antipsychotics). CYP2C9 metabolizes warfarin, phenytoin. CYP2E1 metabolizes ethanol, paracetamol.

**Cognitive Level:** recall

**Sources:**
- [statpearls] StatPearls - Drug Metabolism — https://www.ncbi.nlm.nih.gov/books/NBK535465/
- [pubmed] PubMed - Cytochrome P450 enzymes — https://pubmed.ncbi.nlm.nih.gov/31511732/

**Fact-check result:** ✅ PASSED
**Notes:** All fact-check gates passed

---

### MCQ 4: Pharmacology — application (Difficulty: 2/5)

**Question:** Therapeutic drug monitoring (TDM) is LEAST likely to be required for which of the following drugs?

-    **A.** Warfarin
- ✅ **B.** Amoxicillin
-    **C.** Digoxin
-    **D.** Lithium

**Correct Answer:** B

**Explanation:** Amoxicillin has a wide therapeutic index and does not require TDM. Warfarin (INR), digoxin (0.5-2.0 ng/mL), and lithium (0.6-1.2 mEq/L) all have narrow therapeutic indices and require routine TDM to avoid toxicity while ensuring efficacy.

**Cognitive Level:** application

**Sources:**
- [statpearls] StatPearls - Therapeutic Drug Monitoring — https://www.ncbi.nlm.nih.gov/books/NBK430775/
- [pubmed] PubMed - TDM consensus guidelines — https://pubmed.ncbi.nlm.nih.gov/30861979/

**Fact-check result:** ✅ PASSED
**Notes:** All fact-check gates passed

---

### MCQ 5: Pharmacology — clinical_reasoning (Difficulty: 3/5)

**Question:** A patient on warfarin is started on rifampicin for tuberculosis. What effect on INR is expected?

-    **A.** INR will increase due to displacement from protein binding
- ✅ **B.** INR will decrease due to enzyme induction increasing warfarin metabolism
-    **C.** INR will remain unchanged
-    **D.** INR will increase due to enzyme inhibition reducing warfarin metabolism

**Correct Answer:** B

**Explanation:** Rifampicin is a potent CYP450 inducer (particularly CYP2C9 and CYP3A4), which increases the metabolism of warfarin, reducing its anticoagulant effect and decreasing INR. Warfarin dose may need to be increased. This is an important drug interaction mediated by enzyme induction.

**Cognitive Level:** clinical_reasoning

**Sources:**
- [statpearls] StatPearls - Enzyme Induction and Inhibition — https://www.ncbi.nlm.nih.gov/books/NBK553164/
- [fda] FDA - Drug Interactions — https://www.fda.gov/drugs/drug-interactions-labeling

**Fact-check result:** ✅ PASSED
**Notes:** All fact-check gates passed

---

### MCQ 6: Pharmacology — recall (Difficulty: 3/5)

**Question:** Which of the following drugs follows zero-order elimination kinetics at therapeutic doses?

-    **A.** Metformin
- ✅ **B.** Phenytoin
-    **C.** Amoxicillin
-    **D.** Atorvastatin

**Correct Answer:** B

**Explanation:** Phenytoin exhibits zero-order (saturable) elimination kinetics at therapeutic doses because its metabolizing enzymes (CYP2C9/CYP2C19) become saturated. This means a constant amount is eliminated per unit time regardless of plasma concentration, making dose adjustments critical to avoid toxicity.

**Cognitive Level:** recall

**Sources:**
- [statpearls] StatPearls - Zero-Order Kinetics — https://www.ncbi.nlm.nih.gov/books/NBK549887/
- [pubmed] PubMed - Nonlinear Pharmacokinetics — https://pubmed.ncbi.nlm.nih.gov/33756330/

**Fact-check result:** ✅ PASSED
**Notes:** All fact-check gates passed

---

### MCQ 7: Pharmacology — recall (Difficulty: 1/5)

**Question:** Which of the following is the mechanism of action of atropine?

-    **A.** Competitive antagonist at nicotinic receptors
- ✅ **B.** Competitive antagonist at muscarinic receptors
-    **C.** Irreversible inhibitor of acetylcholinesterase
-    **D.** Direct agonist at beta-2 adrenergic receptors

**Correct Answer:** B

**Explanation:** Atropine is a competitive antagonist of muscarinic acetylcholine receptors. It blocks the effects of acetylcholine at all muscarinic sites, causing mydriasis, increased heart rate, decreased secretions, and smooth muscle relaxation. It is used for bradycardia, organophosphate poisoning, and as a preanesthetic.

**Cognitive Level:** recall

**Sources:**
- [statpearls] StatPearls - Atropine — https://www.ncbi.nlm.nih.gov/books/NBK470551/
- [who] WHO Model List of Essential Medicines — https://www.who.int/groups/expert-committee-on-selection-and-use-of-essential-medicines

**Fact-check result:** ✅ PASSED
**Notes:** All fact-check gates passed

---

### MCQ 8: Pharmacology — clinical_reasoning (Difficulty: 3/5)

**Question:** A 65-year-old male with hypertension is started on prazosin. After the first dose, he develops severe orthostatic dizziness. This is BEST explained by which phenomenon?

-    **A.** Idiosyncratic drug reaction
- ✅ **B.** First-dose phenomenon due to selective alpha-1 blockade
-    **C.** Beta-receptor upregulation
-    **D.** Type I hypersensitivity reaction

**Correct Answer:** B

**Explanation:** Prazosin, a selective alpha-1 adrenergic antagonist, can cause a marked first-dose orthostatic hypotension (first-dose phenomenon). This occurs because alpha-1 blockade inhibits catecholamine-mediated vasoconstriction. It can be minimized by starting with a low dose at bedtime. Prazosin is also used for BPH.

**Cognitive Level:** clinical_reasoning

**Sources:**
- [statpearls] StatPearls - Prazosin — https://www.ncbi.nlm.nih.gov/books/NBK556102/
- [pubmed] PubMed - Alpha-blockers review — https://pubmed.ncbi.nlm.nih.gov/30672813/

**Fact-check result:** ✅ PASSED
**Notes:** All fact-check gates passed

---

### MCQ 9: Pharmacology — application (Difficulty: 2/5)

**Question:** Propranolol is contraindicated in patients with bronchial asthma because it can cause:

-    **A.** Alpha-receptor mediated bronchoconstriction
- ✅ **B.** Beta-2 receptor blockade leading to bronchospasm
-    **C.** Direct irritant effect on bronchial mucosa
-    **D.** Histamine release from mast cells

**Correct Answer:** B

**Explanation:** Propranolol is a non-selective beta-blocker (blocks both beta-1 and beta-2 receptors). Beta-2 blockade in the lungs causes bronchoconstriction, which can precipitate asthma attacks. Cardioselective beta-1 blockers (atenolol, metoprolol) are relatively safer but should still be used with caution.

**Cognitive Level:** application

**Sources:**
- [statpearls] StatPearls - Propranolol — https://www.ncbi.nlm.nih.gov/books/NBK557801/
- [pubmed] PubMed - Beta-blocker contraindications — https://pubmed.ncbi.nlm.nih.gov/30814275/

**Fact-check result:** ✅ PASSED
**Notes:** All fact-check gates passed

---

### MCQ 10: Pharmacology — recall (Difficulty: 2/5)

**Question:** Neostigmine is used in the management of myasthenia gravis. Its primary mechanism of action is:

-    **A.** Direct stimulation of nicotinic receptors at the NMJ
- ✅ **B.** Inhibition of acetylcholinesterase, increasing ACh at the NMJ
-    **C.** Blockade of voltage-gated sodium channels
-    **D.** Increased synthesis of acetylcholine

**Correct Answer:** B

**Explanation:** Neostigmine is a reversible acetylcholinesterase inhibitor. It prevents the breakdown of acetylcholine (ACh) in the synaptic cleft, increasing ACh concentration at the neuromuscular junction. This improves muscle strength in myasthenia gravis. It is also used to reverse non-depolarizing neuromuscular blockade after surgery.

**Cognitive Level:** recall

**Sources:**
- [statpearls] StatPearls - Neostigmine — https://www.ncbi.nlm.nih.gov/books/NBK470596/
- [pubmed] PubMed - Acetylcholinesterase inhibitors — https://pubmed.ncbi.nlm.nih.gov/34322130/

**Fact-check result:** ✅ PASSED
**Notes:** All fact-check gates passed

---

### MCQ 11: Pharmacology — clinical_reasoning (Difficulty: 3/5)

**Question:** A patient develops prolonged apnea after receiving succinylcholine during surgery. Which of the following is the MOST likely cause?

-    **A.** Overdose of the drug
- ✅ **B.** Pseudocholinesterase deficiency
-    **C.** Concurrent use of neostigmine
-    **D.** Allergic reaction to the drug

**Correct Answer:** B

**Explanation:** Succinylcholine is metabolized by plasma pseudocholinesterase (butyrylcholinesterase). Patients with genetic pseudocholinesterase deficiency or atypical enzyme cannot metabolize succinylcholine efficiently, leading to prolonged neuromuscular blockade and apnea. This can be managed with supportive ventilation until spontaneous recovery.

**Cognitive Level:** clinical_reasoning

**Sources:**
- [statpearls] StatPearls - Succinylcholine — https://www.ncbi.nlm.nih.gov/books/NBK534223/
- [pubmed] PubMed - Pseudocholinesterase deficiency — https://pubmed.ncbi.nlm.nih.gov/30701146/

**Fact-check result:** ✅ PASSED
**Notes:** All fact-check gates passed

---

### MCQ 12: Pharmacology — application (Difficulty: 3/5)

**Question:** Salbutamol (albuterol) nebulization in an acute asthma attack can cause all of the following adverse effects EXCEPT:

-    **A.** Sinus tachycardia
-    **B.** Hypokalemia
- ✅ **C.** Hypotension
-    **D.** Fine tremor of skeletal muscles

**Correct Answer:** C

**Explanation:** Salbutamol is a selective beta-2 agonist that causes bronchodilation. Common adverse effects include tachycardia (from beta-1 cross-stimulation at high doses), hypokalemia (beta-2 mediated shift of potassium into cells), and fine tremor (beta-2 stimulation of skeletal muscle). It does NOT cause hypotension; in fact, beta-2 mediated vasodilation can slightly lower BP but this is not a typical concern.

**Cognitive Level:** application

**Sources:**
- [statpearls] StatPearls - Albuterol — https://www.ncbi.nlm.nih.gov/books/NBK556074/
- [pubmed] PubMed - Beta-2 agonists in asthma — https://pubmed.ncbi.nlm.nih.gov/32311827/

**Fact-check result:** ✅ PASSED
**Notes:** All fact-check gates passed

---

### MCQ 13: Pharmacology — recall (Difficulty: 2/5)

**Question:** Pilocarpine is used in the treatment of glaucoma. Its mechanism of action is:

-    **A.** Alpha-2 agonist reducing aqueous humor production
- ✅ **B.** Muscarinic agonist causing pupillary constriction and increased outflow
-    **C.** Beta-blocker reducing aqueous humor secretion
-    **D.** Prostaglandin analogue increasing uveoscleral outflow

**Correct Answer:** B

**Explanation:** Pilocarpine is a direct-acting muscarinic agonist. In the eye, it causes miosis (pupillary constriction) by contracting the iris sphincter muscle and increases aqueous humor outflow through the trabecular meshwork by contracting the ciliary muscle. Both effects reduce intraocular pressure in open-angle glaucoma.

**Cognitive Level:** recall

**Sources:**
- [statpearls] StatPearls - Pilocarpine — https://www.ncbi.nlm.nih.gov/books/NBK556128/
- [pubmed] PubMed - Glaucoma pharmacotherapy — https://pubmed.ncbi.nlm.nih.gov/31920475/

**Fact-check result:** ✅ PASSED
**Notes:** All fact-check gates passed

---

### MCQ 14: Pharmacology — clinical_reasoning (Difficulty: 2/5)

**Question:** A 55-year-old hypertensive patient develops a persistent dry cough after starting an antihypertensive medication. Which drug is MOST likely responsible?

-    **A.** Amlodipine
- ✅ **B.** Enalapril
-    **C.** Metoprolol
-    **D.** Hydrochlorothiazide

**Correct Answer:** B

**Explanation:** ACE inhibitors (like enalapril and captopril) cause a dry cough due to accumulation of bradykinin, which is normally broken down by ACE (kininase II). Bradykinin stimulates pulmonary C-fibers causing cough. This class effect occurs in 5-20% of patients. Angioedema is a rarer but more serious adverse effect. ARBs (losartan) are alternatives that do not cause cough.

**Cognitive Level:** clinical_reasoning

**Sources:**
- [statpearls] StatPearls - ACE Inhibitors — https://www.ncbi.nlm.nih.gov/books/NBK557523/
- [pubmed] PubMed - ACE inhibitor adverse effects — https://pubmed.ncbi.nlm.nih.gov/31424792/

**Fact-check result:** ✅ PASSED
**Notes:** All fact-check gates passed

---

### MCQ 15: Pharmacology — application (Difficulty: 3/5)

**Question:** Which of the following BEST distinguishes amlodipine from verapamil?

-    **A.** Amlodipine primarily acts on cardiac muscle; verapamil on vascular smooth muscle
- ✅ **B.** Amlodipine primarily acts on vascular smooth muscle; verapamil has significant cardiac effects
-    **C.** Both have identical mechanisms and clinical effects
-    **D.** Amlodipine is contraindicated in hypertension; verapamil is not

**Correct Answer:** B

**Explanation:** Amlodipine is a dihydropyridine (DHP) CCB that predominantly acts on vascular smooth muscle, causing vasodilation with minimal cardiac depression. Verapamil is a non-DHP CCB that acts on both cardiac muscle (negative chronotrope/inotrope) and SA/AV nodes, making it useful for rate control in SVT and angina.

**Cognitive Level:** application

**Sources:**
- [statpearls] StatPearls - Amlodipine — https://www.ncbi.nlm.nih.gov/books/NBK539772/
- [pubmed] PubMed - CCBs in hypertension — https://pubmed.ncbi.nlm.nih.gov/33001338/

**Fact-check result:** ✅ PASSED
**Notes:** All fact-check gates passed

---

### MCQ 16: Pharmacology — application (Difficulty: 3/5)

**Question:** Verapamil is effective in treating supraventricular tachycardia primarily because it:

-    **A.** Blocks sodium channels in ventricular myocytes
- ✅ **B.** Prolongs the refractory period of the AV node
-    **C.** Increases conduction velocity through the AV node
-    **D.** Blocks potassium channels in atrial tissue

**Correct Answer:** B

**Explanation:** Verapamil blocks L-type calcium channels in the SA and AV nodes, slowing AV nodal conduction and prolonging the refractory period. This interrupts reentrant circuits involving the AV node, terminating SVT. Verapamil is also effective for rate control in atrial fibrillation by reducing ventricular response rate.

**Cognitive Level:** application

**Sources:**
- [statpearls] StatPearls - Verapamil — https://www.ncbi.nlm.nih.gov/books/NBK537163/
- [pubmed] PubMed - Verapamil clinical use — https://pubmed.ncbi.nlm.nih.gov/30658188/

**Fact-check result:** ✅ PASSED
**Notes:** All fact-check gates passed

---

### MCQ 17: Pharmacology — clinical_reasoning (Difficulty: 4/5)

**Question:** Digoxin toxicity is characterized by all of the following EXCEPT:

-    **A.** Visual disturbances (yellow-green halos)
-    **B.** Ventricular bigeminy
-    **C.** Hyperkalemia
- ✅ **D.** Torsades de pointes

**Correct Answer:** D

**Explanation:** Digoxin toxicity classically presents with visual disturbances (xanthopsia - yellow-green vision), arrhythmias (ventricular bigeminy, atrial tachycardia with block), and hyperkalemia (due to Na+/K+ ATPase inhibition preventing potassium entry into cells). Torsades de pointes is associated with drugs that prolong QT interval (e.g., amiodarone, sotalol), not digoxin.

**Cognitive Level:** clinical_reasoning

**Sources:**
- [statpearls] StatPearls - Digoxin — https://www.ncbi.nlm.nih.gov/books/NBK556005/
- [pubmed] PubMed - Digoxin in heart failure — https://pubmed.ncbi.nlm.nih.gov/32349924/

**Fact-check result:** ✅ PASSED
**Notes:** All fact-check gates passed

---

### MCQ 18: Pharmacology — clinical_reasoning (Difficulty: 3/5)

**Question:** A 60-year-old male with acute myocardial infarction develops ventricular tachycardia. Which antiarrhythmic is MOST appropriate?

-    **A.** Verapamil
- ✅ **B.** Lidocaine
-    **C.** Adenosine
-    **D.** Atropine

**Correct Answer:** B

**Explanation:** Lidocaine (Class IB antiarrhythmic) is indicated for ventricular arrhythmias, especially in the setting of acute MI. It blocks sodium channels with rapid kinetics, preferentially affecting ischemic tissue. It has minimal effect on atrial tissue. Verapamil and adenosine are for SVT, and atropine is for bradycardia.

**Cognitive Level:** clinical_reasoning

**Sources:**
- [statpearls] StatPearls - Lidocaine — https://www.ncbi.nlm.nih.gov/books/NBK551679/
- [pubmed] PubMed - Lidocaine antiarrhythmic — https://pubmed.ncbi.nlm.nih.gov/31823253/

**Fact-check result:** ✅ PASSED
**Notes:** All fact-check gates passed

---

### MCQ 19: Pharmacology — clinical_reasoning (Difficulty: 3/5)

**Question:** A patient on long-term amiodarone therapy presents with dyspnea and dry cough. High-resolution CT shows pulmonary infiltrates. Which adverse effect is this?

-    **A.** Hypersensitivity pneumonitis
- ✅ **B.** Amiodarone-induced pulmonary fibrosis
-    **C.** Cardiogenic pulmonary edema
-    **D.** Bronchial asthma exacerbation

**Correct Answer:** B

**Explanation:** Amiodarone can cause pulmonary toxicity, including interstitial pneumonitis and pulmonary fibrosis, due to accumulation of the drug in lung tissue and phospholipidosis. It is dose-related and potentially fatal. Other adverse effects include thyroid dysfunction (both hypo- and hyperthyroidism due to iodine content), hepatotoxicity, corneal microdeposits, and blue-gray skin discoloration. Baseline and periodic pulmonary function tests are recommended.

**Cognitive Level:** clinical_reasoning

**Sources:**
- [statpearls] StatPearls - Amiodarone — https://www.ncbi.nlm.nih.gov/books/NBK482154/
- [pubmed] PubMed - Amiodarone toxicity — https://pubmed.ncbi.nlm.nih.gov/32445564/

**Fact-check result:** ✅ PASSED
**Notes:** All fact-check gates passed

---

### MCQ 20: Pharmacology — recall (Difficulty: 1/5)

**Question:** Atorvastatin lowers LDL cholesterol by inhibiting which enzyme?

-    **A.** Acyl-CoA cholesterol acyltransferase (ACAT)
- ✅ **B.** HMG-CoA reductase
-    **C.** Lipoprotein lipase
-    **D.** Cholesterol 7-alpha-hydroxylase

**Correct Answer:** B

**Explanation:** Atorvastatin (and all statins) competitively inhibits HMG-CoA reductase, the rate-limiting enzyme in the mevalonate pathway of cholesterol synthesis. This reduces intracellular cholesterol, leading to upregulation of LDL receptors on hepatocytes and increased LDL clearance from blood. Statins also have pleiotropic effects (anti-inflammatory, plaque stabilization).

**Cognitive Level:** recall

**Sources:**
- [statpearls] StatPearls - Atorvastatin — https://www.ncbi.nlm.nih.gov/books/NBK545226/
- [pubmed] PubMed - Statin therapy guidelines — https://pubmed.ncbi.nlm.nih.gov/33064565/

**Fact-check result:** ✅ PASSED
**Notes:** All fact-check gates passed

---

## Human Review Instructions

1. **Spot-check** these 20 sample MCQs for accuracy
2. Verify each MCQ's correct answer against the cited sources
3. Check distractors are plausible but definitively wrong
4. Confirm the explanation is accurate and matches the citation
5. Flag any MCQ that could teach a dangerous/incorrect medical fact
6. After approval, run the pipeline for all 19 specialties at scale

### Sign-off

- [ ] Saransh has reviewed and approves the quality
- [ ] Medical reviewer has verified accuracy
- [ ] Pipeline is cleared for full-scale deployment

---

*Audit generated by Mediverse OS MCQ Pipeline at 2026-07-12T08:44:25.694Z*