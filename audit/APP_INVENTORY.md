# App Inventory

<!-- GENERATED FILE — do not edit by hand. Run: node tools/generate_inventory.js -->
<!-- structural_sha: ca0a42d8371577ca001517892bfb63db51ab6efeab0335620f69af7ebe31a6e7 -->

- Generated: **2026-08-07**
- Commit at generation (HEAD): `7f3c7b70c8cd953a73f8711e47f9dc2e83c5b4c9`
- Guard bank: `KC_Canonical_QuestionBank_v2_2026-08-07.json`
- Structural hash: `ca0a42d8371577ca001517892bfb63db51ab6efeab0335620f69af7ebe31a6e7` (the drift guard fails the build if this stops matching the repo)

## Modules

| Module | Page URL | JS | Questions | Pass | Options |
|---|---|---|---|---|---|
| mod1 | https://enerbartoli.github.io/mod1-knowledge-check/ | quiz.js | 16 | 13 | authoritative |
| mod2 | https://enerbartoli.github.io/mod1-knowledge-check/mod2.html | mod2.js | 15 | 12 | authoritative |
| mod4 | https://enerbartoli.github.io/mod1-knowledge-check/mod4.html | mod4.js | 10 | 8 | authoritative |
| mod5 | https://enerbartoli.github.io/mod1-knowledge-check/mod5.html | mod5.js | 15 | 12 | authoritative |
| mod7 | https://enerbartoli.github.io/mod1-knowledge-check/mod7.html | mod7.js | 10 | 8 | authoritative |

### mod1

- Page: https://enerbartoli.github.io/mod1-knowledge-check/ · JS: `quiz.js` · HTML: `index.html`
- Questions: 16 · Pass threshold: 13 · Options: authoritative (bank is source of truth)

**Q1** · fingerprint `e306b3929195` · correct **A** · rationale no · slides 2, 4

> Why is Hasbro implementing the new Forecast Enrichment process now?

- **A ✓** To address chronic gaps in forecast traceability, manual workload, and the ability to measure the value of commercial intelligence.
- **B** To replace Logility with Daybreak as the planning system.
- **C** To reduce the number of Demand Planning resources required each cycle.
- **D** To consolidate Sales, Marketing, and Demand Planning under a single team.

**Q2** · fingerprint `330bb3671614` · correct **B** · rationale no · slides 4, 5

> Which statement best describes the role of the Daybreak statistical baseline in the new process?

- **A** Daybreak produces the final forecast used directly by Supply Planning; no further input is needed.
- **B ✓** Daybreak models baseline demand behavior; commercial input must be added through enrichments to capture what the historical data cannot see.
- **C** Sales, Marketing, and Demand Planning each maintain independent baselines that are reconciled at year-end.
- **D** The baseline replaces all commercial input; enrichments are optional refinements.

**Q3** · fingerprint `ecbfa380891e` · correct **C** · rationale no · slides 8, 10

> Which statement is correct about the Daybreak statistical baseline?

- **A** It is built by Sales each cycle based on customer commitments.
- **B** It is set to the prior year's volume adjusted by a fixed growth factor.
- **C ✓** It uses Hasbro's real historical shipment data and item attributes — through machine learning — to predict future demand patterns.
- **D** It is identical to the Financial Forecast and updated on the same cadence.

**Q4** · fingerprint `ab90665dc027` · correct **A** · rationale no · slides 11

> Which statement correctly describes the three-party operating model that produces the baseline?

- **A ✓** Daybreak provides the machine-learning engine; Genpact executes the operational tasks; Hasbro Demand Planning owns governance and sign-off.
- **B** Genpact provides the engine; Daybreak validates the outputs; Hasbro Demand Planning sets the parameters.
- **C** Hasbro Demand Planning generates the baseline; Genpact provides the model design; Daybreak hosts the data.
- **D** All three parties contribute equally to model generation, validation, and sign-off.

**Q5** · fingerprint `821b4b89f4ec` · correct **C** · rationale no · slides 12, 13

> Which SKUs are treated using Daybreak's standard machine-learning forecasting approach?

- **A** All active SKUs in the portfolio, including new product introductions.
- **B** Pure NPI items in their first 12 months of life.
- **C ✓** Carry-Forward items with at least 52 weeks of historical shipment data.
- **D** Fan items, regardless of how much history they have.

**Q6** · fingerprint `52ee0a337ab6` · correct **A** · rationale no · slides 14

> How is an NPI's forecast generated during its cold-start phase (0–8 weeks of history)?

- **A ✓** By shaping the Brand Plan annual volume with attribute-based shape and level models (category, launch timing, price tier).
- **B** By copying the predecessor product's historical pattern.
- **C** By projecting the first month of actuals forward.
- **D** By applying Daybreak's carry-forward model with extrapolated history.

**Q7** · fingerprint `48135d47c4cf` · correct **D** · rationale no · slides 15

> Why are UK Fan items handled without a statistical baseline?

- **A** Daybreak's licensing model prevents its use on Fan products.
- **B** Fan volume is too small to justify the model's processing cost.
- **C** Fan items are forecasted in a separate system maintained by Marketing.
- **D ✓** Fan demand is driven by entertainment events with no recurring pattern; historical data cannot meaningfully predict future demand. Marketing and Commercial build the forecast directly.

**Q8** · fingerprint `eb3d0dbb5382` · correct **C** · rationale no · slides 10, 16

> At which planning level is the Daybreak statistical baseline generated?

- **A** Planning Level 1 — Customer × Planning SKU × Channel.
- **B** Planning Level 2 — Planning SKU × Customer.
- **C ✓** Planning Level 3 — Parent SKU × Business Unit × Channel.
- **D** Planning Level 5 — Brand × Business Unit.

**Q9** · fingerprint `92c19184df0c` · correct **D** · rationale no · slides 16

> What is the purpose of forecast disaggregation in the new process?

- **A** To convert weekly forecasts into monthly buckets for financial reporting.
- **B** To translate the Consensus Forecast into the Financial Forecast for the budget cycle.
- **C** To split the forecast between Domestic and Direct Import channels.
- **D ✓** To break the L3 statistical baseline down to the Customer × Planning SKU × Channel level (L1), so that Sales can review and enrich the forecast at the level where commercial decisions are made.

**Q10** · fingerprint `cc2951a54c4e` · correct **B** · rationale no · slides 17, 19, 20, 21

> How does the disaggregation method differ between a Carry-Forward item and an NPI item?

- **A** Both methods are identical — only the source system differs.
- **B ✓** Carry-Forward uses the SKU's own statistical proportionality based on its history; NPI uses brand-level historical customer mix combined with P2M volume splits, because the NPI has no shipment history of its own.
- **C** Carry-Forward is disaggregated manually; NPI is disaggregated automatically.
- **D** Carry-Forward is disaggregated only at L1; NPI only at L3.

**Q11** · fingerprint `20c4ee1210c1` · correct **B** · rationale no · slides 22

> What is the purpose of the Forecasting Range?

- **A** It controls when Daybreak runs the statistical model for each cycle.
- **B ✓** It defines, per customer × SKU, the period during which the customer should receive baseline disaggregation. Outside that period, the customer is excluded from the disaggregation logic.
- **C** It sets the look-back window used by the Logility Moving Average Model.
- **D** It determines the timing of the Joint Marketing & Demand Planning Reconciliation Session.

**Q12** · fingerprint `86bd56294ba5` · correct **C** · rationale no · slides 25

> Which statement best describes when an enrichment should be applied to the baseline?

- **A** On every SKU in the portfolio, each cycle, to confirm review.
- **B** Only when Marketing or Demand Planning requests an adjustment.
- **C ✓** Only for events the statistical baseline cannot see — known commercial activity, structural changes, supply-related shifts, or committed plans.
- **D** Only when the forecast is below the Financial Forecast target.

**Q13** · fingerprint `c2bb09fdb8d3` · correct **D** · rationale no · slides 32

> What is the purpose of the Joint Marketing & Demand Planning Reconciliation Session?

- **A** To allow Marketing to override Sales' L1 enrichments in cases where Marketing has better visibility.
- **B** To finalize the Daybreak baseline before it is loaded to Logility for the cycle.
- **C** To replace the legacy Brand DMR meetings that exist today in North America.
- **D ✓** To combine the bottom-up commercial view with top-down statistical and brand-strategic views, apply BU-level corrections, and prepare the proposal for Executive Sign-Off.

**Q14** · fingerprint `ee088a518d54` · correct **B** · rationale no · slides 33

> In the UK pilot, which statement correctly describes the scope split between Key Account Managers (KAMs) and Brand Captains?

- **A** Both roles can edit the baseline at any planning level; the most recent edit wins.
- **B ✓** Brand Captains own SKU × BU-level (Level 2.5) Base Trend adjustments. KAMs capture account-specific enrichments and account-level deltas at L1; baseline adjustments by KAMs are exceptions, not the default.
- **C** Only Demand Planning can adjust the baseline; both KAMs and Brand Captains submit requests for review.
- **D** The KAM owns baseline adjustments at all levels; the Brand Captain reviews after the fact.

**Q15** · fingerprint `d71d46b66fe7` · correct **D** · rationale no · slides 33

> In the 2026 UK pilot, how does HERO present the starting forecast to Brand Captains at the beginning of each cycle?

- **A** Empty — Brand Captains build the forecast from scratch each cycle.
- **B** Pre-populated with the prior month's consensus forecast.
- **C** Pre-populated with the Daybreak baseline only; Captains rebuild everything else manually.
- **D ✓** Pre-populated with the deltas between the Daybreak baseline and the current resultant forecast. Captains capture only the changes they intend to move the resultant — no manual matching is required.

**Q16** · fingerprint `7bfe19f29e32` · correct **A** · rationale no · slides 33

> In the 2027 target operating model, how does the Brand Captain's role differ from the 2026 pilot?

- **A ✓** Brand Captains start from the Daybreak baseline directly. Corrections for commercial or supply events affecting the forecast are captured as Base Trend adjustments.
- **B** Brand Captains are removed; cycles run fully automated.
- **C** Brand Captains operate exclusively at Level 1 (customer level), with KAMs handling BU-level decisions.
- **D** Brand Captains review a pre-populated forecast and confirm without modification.

### mod2

- Page: https://enerbartoli.github.io/mod1-knowledge-check/mod2.html · JS: `mod2.js` · HTML: `mod2.html`
- Questions: 15 · Pass threshold: 12 · Options: authoritative (bank is source of truth)

**Q1** · fingerprint `7467435b3505` · correct **A** · rationale yes · slides 4, 5, 6

> A carry-forward item shows two consecutive years of stable seasonal demand, with no confirmed commercial event, no supply issue, and no distribution change in scope. The Daybreak baseline and the Resultant Forecast track the same seasonal shape at L3. What is the correct action?

- **A ✓** Accept the L3 baseline — no enrichment required.
- **B** Apply a positive base trend adjustment to lock the seasonal pattern into next year.
- **C** Override the Daybreak baseline with the Sales Forecast.
- **D** Submit a disaggregation adjustment request to DP/Genpact.

**Q2** · fingerprint `4286d1584150` · correct **B** · rationale yes · slides 4

> You are reviewing a scenario where the total demand at L3 looks correct against history, but the customer-level split at L2 routes most of the volume to inactive partners. Where does the issue live?

- **A** In the L3 baseline — apply a base trend correction.
- **B ✓** In the L2 disaggregation — fix the customer mix without changing L3.
- **C** In the Daybreak engine — escalate to Genpact for a model rerun.
- **D** In both layers — apply offsetting enrichments at L3 and L1.

**Q3** · fingerprint `c7242ed59ef4` · correct **C** · rationale yes · slides 7, 8

> An item shipped near zero for several months in 2025 because of a confirmed stockout. The Daybreak baseline now projects 2026 demand at a fraction of the pre-stockout run-rate, because the model learned the suppression as true decline. What is the correct action?

- **A** Apply a positive promo enrichment to lift demand back to historical levels.
- **B** Override the Daybreak baseline with the Sales Forecast each cycle going forward.
- **C ✓** Cleanse the stockout-affected months in historical data so Daybreak can rebuild an accurate baseline.
- **D** Accept the Daybreak baseline — the model is reading the most recent year correctly.

**Q4** · fingerprint `4a93227f7d2f` · correct **C** · rationale yes · slides 9, 10

> A Warm Start NPI with under 12 months of history has 16 weeks of actuals below the 2026 Resultant plan, and Daybreak has slashed the 2027 baseline by more than half. After reviewing together, you and the Brand Captain agree Daybreak's drop is too aggressive and the SKU can still rebound. What is the correct action?

- **A** Accept the Daybreak 2027 baseline — 16 weeks of actuals is sufficient to confirm the structural decline.
- **B** Apply negative sets in each under-performing month to align the forecast to Daybreak's corrected view.
- **C ✓** Recalculate overall demand and apply an L2.5 Base Trend adjustment via the Brand Captain's reconciliation template.
- **D** Submit a disaggregation request to DP/Genpact to redistribute the volume across a wider customer base.

**Q5** · fingerprint `1ea3ef950650` · correct **D** · rationale yes · slides 11, 12, 13, 14

> A carry-forward item is exclusive to a single retailer — that retailer absorbs ~100% of actuals across the past two years. The Current Resultant disaggregation routes a large share to other customers with no recent history, while the Moving Average method routes ~100% to the exclusive partner. What is the correct action?

- **A** Keep the Current disaggregation; the model will self-correct over time.
- **B** Apply a negative base trend to remove the non-active customers.
- **C** Submit a disaggregation request to DP/Genpact to rebuild the customer hierarchy.
- **D ✓** Switch the L2 disaggregation method from Current to Moving Average.

**Q6** · fingerprint `ba6c9acfed3e` · correct **B** · rationale yes · slides 24

> Which statement correctly describes the difference between a Set and a Base Trend enrichment?

- **A** A Set is positive only; a Base Trend can be positive or negative.
- **B ✓** A set cleanses out of the historical shipments after the period passes; base trend adjustment are never used to clean the history therefore its impact remains.
- **C** A Set is owned by Sales; a Base Trend is owned by Demand Planning.
- **D** A Set applies to NPI items only; a Base Trend applies to carry-forward items only.

**Q7** · fingerprint `82c1654cff87` · correct **B** · rationale yes · slides 32

> A customer pulls confirmed annual demand into a specific order window (ladder), with offsetting reductions in the months from which demand is being moved. The full-year total does not change. Which enrichment approach is correct?

- **A** Positive base trend in the ladder month + negative base trend in the pulled-from months.
- **B ✓** Positive set in the ladder month + negative sets in the pulled-from months.
- **C** Single positive base trend in the ladder month — the negative offset is not needed.
- **D** No enrichment — let the baseline absorb the timing shift over the next cycle.

**Q8** · fingerprint `fe7fde40959e` · correct **C** · rationale yes · slides 29

> A customer is adding new stores to its distribution. The initial pipeline fill ships in one window (F1), and ongoing replenishment continues in those new stores afterwards. Which enrichment approach is correct?

- **A** Single base trend from F1 onward — covers both the fill and ongoing replenishment.
- **B** Single set in F1 — covers the fill; the model will pick up the new run-rate from actuals.
- **C ✓** Set in F1 for the new-store fill + base trend from F2 onward for ongoing replenishment.
- **D** Two sets — one in F1 for the fill, one in F2 onward for replenishment.

**Q9** · fingerprint `dd0ae51a0602` · correct **A** · rationale yes · slides 26

> An established carry-forward item has a future confirmed retail promotion that is not already reflected in baseline behavior. The promo will generate incremental units in a specific ship window. Which enrichment is correct?

- **A ✓** Promo enrichment for the confirmed incremental units in the relevant ship week(s).
- **B** Positive base trend for the promo lift, to persist into future cycles.
- **C** Set enrichment for the entire month containing the promo.
- **D** No enrichment — the baseline will capture the lift once actuals come in.

**Q10** · fingerprint `e4141bf0b48a` · correct **A** · rationale yes · slides 37

> A customer has provided a specific pre-order quantity and timing for a new item with no comparable history. What is the correct way to capture it?

- **A ✓** Pre-order enrichment for the confirmed quantity and timing only.
- **B** Pre-order enrichment for the confirmed quantity, plus an additional run-rate estimate for the rest of the year.
- **C** Set enrichment for the pre-order, then convert to base trend once actuals start coming in.
- **D** No enrichment — the NPI baseline will absorb the pre-order.

**Q11** · fingerprint `bb0ce7e89031` · correct **D** · rationale yes · slides 31

> An NPI's stat baseline already includes the channel-fill volume in its launch shape, but the team needs the fill visible as a discrete set for allocation traceability. What is the correct approach in F1?

- **A** Add a positive set for the channel-fill on top of the existing baseline.
- **B** Apply a positive base trend in F1 to make the channel-fill visible.
- **C** Submit a disaggregation request to split the channel-fill into a separate baseline component.
- **D ✓** To reflect a negative base trend enrichment in correspondent period to offset the channel-fill already inside the baseline, plus a positive set enrichment of equal magnitude in the same month.

**Q12** · fingerprint `eb7cf03b088e` · correct **C** · rationale yes · slides 39

> Last year a deal spike inflated demand for a specific period, and the promotion is not repeating this year. The baseline is now projecting the spike forward as if it were normal seasonality. What is the correct action?

- **A** Apply a positive promo enrichment to confirm the new run-rate.
- **B** Submit a disaggregation adjustment to redistribute the spike across customers.
- **C ✓** Apply a negative base trend to remove the phantom spike from the projection.
- **D** Let the baseline run — actuals will pull it back to normal within two cycles.

**Q13** · fingerprint `6738b295e2a7` · correct **A** · rationale yes · slides 44

> A specific customer has discontinued an item that remains active at other customers. The baseline is still allocating volume to the dropped customer based on past proportions. What is the correct action?

- **A ✓** Apply a negative base trend and update the forecasting range to stop allocating to that customer.
- **B** Wait — the model will reduce the customer's share once actuals show zero.
- **C** Submit a disaggregation request to remove the customer from the L2 split.
- **D** Apply a one-time negative set for the year, then let the baseline rebuild.

**Q14** · fingerprint `7958d48e0d39` · correct **D** · rationale yes · slides 51

> A customer is changing its buying route from Domestic to Direct Import. Total demand is unchanged — only the channel is moving. The volume in scope currently sits in the baseline. What is the correct approach?

- **A** Create a positive enrichment on DI and an offsetting negative enrichment on DOM.
- **B** Submit a disaggregation request to reroute the volume between channels.
- **C** Apply a base trend on DI to grow the channel; let DOM decay through actuals.
- **D ✓** Use the channel-shift functionality on the baseline to move volume from DOM to DI.

**Q15** · fingerprint `abdb8ec969f2` · correct **B** · rationale yes · slides 54

> At the BU/brand level the L3 total is accurate against history, but the L2 customer split allocates too much volume to a customer with declining actuals. What is the correct path?

- **A** Apply a negative enrichment on the over-allocated customer to bring the split back in line.
- **B ✓** Submit a disaggregation adjustment request to DP/Genpact; do not enter an enrichment.
- **C** Apply offsetting enrichments — negative on the over-allocated customer, positive on the under-allocated one.
- **D** Switch the L2 disaggregation method from Moving Average back to Current Resultant.

### mod4

- Page: https://enerbartoli.github.io/mod1-knowledge-check/mod4.html · JS: `mod4.js` · HTML: `mod4.html`
- Questions: 10 · Pass threshold: 8 · Options: authoritative (bank is source of truth)

**Q1** · fingerprint `653dcd2748bc` · correct **B** · rationale yes · slides 5

> Why do DI, FAN, and Amazon need to be discussed as a separate group in MOD 4?

- **A** They are the three customer segments that contribute the highest revenue in the UK market.
- **B ✓** Their historical demand behaves erratically — discontinuous and opportunistic — so a history-based statistical model cannot predict it adequately, and each one needs a tailored handling approach.
- **C** They are the three account groups that are out of scope for the UK pilot.
- **D** They are the only customer groups that have a dedicated KAM assigned in the UK.

**Q2** · fingerprint `69a13a8854f3` · correct **C** · rationale yes · slides 6

> In the UK pilot, who owns the DI forecast number and how is it built?

- **A** Daybreak generates the baseline; the KAM reviews and adjusts using the standard enrichment flow.
- **B** Demand Planning builds the DI number from statistical extrapolation; the KAM validates.
- **C ✓** The KAM owns the number and builds it partner-by-partner from account knowledge — committed programs, signed orders, customer plans.
- **D** The regional category team owns it; the KAM validates timing only.

**Q3** · fingerprint `ac10c9dad916` · correct **A** · rationale yes · slides 7

> For FAN items, which team builds the forecast volume, and what does the KAM do?

- **A ✓** The regional category team allocates volumes per client based on the launch plan; the KAM validates timing and feasibility at their account but does not re-cut the volume.
- **B** The KAM builds the forecast bottom-up partner-by-partner, the same way DI is built.
- **C** Daybreak builds the baseline; the KAM enriches as needed.
- **D** Marketing owns the number; KAMs are not involved.

**Q4** · fingerprint `dbaddd45e509` · correct **D** · rationale yes · slides 6, 7

> Where does the full DI or FAN forecast volume land in the Reconciliation Template?

- **A** Split between the Daybreak baseline at L3 and Enrichment lines at L1.
- **B** As a separate Sales Forecast line outside the template.
- **C** In the same Enrichment lines used for promos and listings.
- **D ✓** As Base Trend enrichment at Level 1, because there is no Daybreak baseline at SKU level underneath.

**Q5** · fingerprint `9737fc48f9ba` · correct **A** · rationale yes · slides 6

> Which statement correctly describes the Evergreen exception for DI?

- **A ✓** Sales Operations designates specific DI products as Evergreen; designated items behave like standard Carry-Forward items, with a Daybreak baseline that the KAM enriches on top.
- **B** Any DI item with 12 months of stable history is automatically designated Evergreen by Demand Planning.
- **C** The KAM nominates Evergreen items at the start of each cycle; DP confirms.
- **D** Evergreen is a UK-only exception that does not apply in NA or EU markets.

**Q6** · fingerprint `94ca080bd677` · correct **B** · rationale yes · slides 7

> Why are FAN items deliberately handled outside the Daybreak baseline?

- **A** FAN items have insufficient shipment history for the statistical engine to process them.
- **B ✓** FAN demand is tied to one-off cultural moments (franchise releases, film tie-ins, time-limited campaigns) with no reliable repeat pattern — keeping them out of the baseline protects the statistical engine for standard CF items.
- **C** FAN volume is too small to justify the model's run-time.
- **D** FAN items are excluded by Daybreak's licensing terms.

**Q7** · fingerprint `759b4c446b02` · correct **A** · rationale yes · slides 8

> How is Amazon treated in the UK pilot?

- **A ✓** As a standard customer — Daybreak generates the brand-level baseline, statistical disaggregation assigns Amazon's share, and the Amazon KAM reviews and adjusts using the standard Enrichment and Base Trend tools.
- **B** Bottom-up by KAM, with no baseline — the same as DI.
- **C** Bottom-up by the regional category team — the same as FAN.
- **D** Outside the pilot scope; Amazon joins after the July cycle.

**Q8** · fingerprint `746820920e1f` · correct **C** · rationale yes · slides 6, 7, 8

> Across DI, FAN, and Amazon, what is Demand Planning's role?

- **A** Demand Planning owns the forecast number for all three patterns end-to-end.
- **B** Demand Planning is not involved; the KAM or the category team owns the volume on its own.
- **C ✓** Demand Planning facilitates and challenges but does not own the volume — the KAM carries the build for DI and Amazon; the regional category team owns the volume for FAN.
- **D** Demand Planning owns DI and FAN; the KAM owns Amazon.

**Q9** · fingerprint `532e155cb721` · correct **B** · rationale yes · slides 6

> A KAM is reviewing a DI account and finds an item that has shipped with a stable, repeating pattern for 18 months. The KAM wants the item to start from a Daybreak baseline rather than be built bottom-up. What should happen?

- **A** The KAM flags it directly in HERO as Evergreen and the Daybreak baseline applies from the next cycle.
- **B ✓** The KAM raises the item with Sales Operations for Evergreen designation; if approved, the item behaves like a standard CF with a Daybreak baseline. Until then, it stays in the DI bottom-up flow.
- **C** Demand Planning re-classifies the item as Carry-Forward and applies the standard CF flow.
- **D** The Brand Captain converts the item to Carry-Forward at Level 2.5 and locks the new treatment.

**Q10** · fingerprint `94699684748b` · correct **D** · rationale yes · slides 7

> A KAM at FP-2 receives a FAN allocation from the regional category team for a franchise release in week 30. The KAM believes the allocation is too high for their account and wants to adjust it down. What is the correct action?

- **A** Re-cut the FAN volume to match the KAM's account view and submit the revised number.
- **B** Drop the FAN volume to zero for the account and capture the rest as Enrichment.
- **C** Push the allocation back to Demand Planning and ask DP to reset the baseline.
- **D ✓** Validate timing and feasibility at the account, raise the magnitude concern back to the regional category team (the volume owner), and do not unilaterally re-cut the FAN number.

### mod5

- Page: https://enerbartoli.github.io/mod1-knowledge-check/mod5.html · JS: `mod5.js` · HTML: `mod5.html`
- Questions: 15 · Pass threshold: 12 · Options: authoritative (bank is source of truth)

**Q1** · fingerprint `c0fd38e8e3ae` · correct **A** · rationale yes · slides 20

> Reconciliation, as defined in MOD 5, is the meeting where the team:

- **A ✓** Tells the story of the number, challenges whether it is believable, decides what moves forward, and creates accountability for the forecast.
- **B** Builds the next month's forecast line by line from scratch.
- **C** Reviews aggregate variance vs the Financial Forecast only.
- **D** Confirms the Daybreak baseline before it is loaded to Logility.

**Q2** · fingerprint `6ff11bdc6b99` · correct **B** · rationale yes · slides 21, 30, 31

> Which description matches the UK reconciliation standard for what happens in the room?

- **A** Typing forecast changes into the template live so the room sees the impact in real time.
- **B ✓** A structured challenge against three named references, focused on material exceptions, ending in decisions with named owners and due dates.
- **C** A line-by-line review of every SKU in the portfolio to confirm the build.
- **D** An open-ended discussion to surface concerns without committing to specific actions.

**Q3** · fingerprint `ec10d898f2b3` · correct **C** · rationale yes · slides 23, 63

> In what order do the four UK reconciliation sessions run, and who owns each?

- **A** Marketing+DP → Brand Captain → KAM → Market Leader.
- **B** DP → Marketing → Brand Captain → Sign-Off.
- **C ✓** Brand Captain (Baseline) → KAM (Commercial) → Marketing + DP → Market Leader (Sign-Off).
- **D** KAM → Brand Captain → Market Leader → Marketing + DP.

**Q4** · fingerprint `cfa397cd904a` · correct **D** · rationale yes · slides 23

> What is the rule about starting one session before the previous one finishes?

- **A** Sessions can run in parallel as long as each owner is in the room.
- **B** Marketing + DP can start before KAM finishes, because Marketing operates top-down.
- **C** Sign-Off can begin once any two earlier sessions have closed.
- **D ✓** If the prior session has not closed, the next session does not start.

**Q5** · fingerprint `9a51432317f4` · correct **A** · rationale yes · slides 18, 24

> Why does the UK pilot use three references rather than formal guardrails?

- **A ✓** The UK has not yet defined formal guardrail thresholds, so the team triangulates using AIM Shipment Revenue, prior-year actuals, and POS Glidepath instead.
- **B** The three references are a UK-only experiment that permanently replaces guardrails.
- **C** The three references and guardrails are the same thing, just renamed.
- **D** Guardrails were removed from the program globally because they were too restrictive.

**Q6** · fingerprint `0567bb16e0dc` · correct **B** · rationale yes · slides 24, 26

> Which reference answers the question "Is the brand at this partner congruent with what we actually ship?"

- **A** AIM Shipment Revenue Forecast at BU / Brand.
- **B ✓** Historical actuals at Brand × Forecasting Partner.
- **C** POS Glidepath at SKU.
- **D** The Financial Forecast.

**Q7** · fingerprint `6cbf13c25e7a` · correct **C** · rationale yes · slides 25

> Which statement correctly describes the AIM Shipment Revenue Forecast?

- **A** AIM is updated weekly and refreshed in real time.
- **B** AIM is a fully enriched forecast that already includes promos, listings, and supply events.
- **C ✓** AIM is a naive statistical baseline with statistical bounds; actuals fall within those bounds roughly 8 out of 10 times when there is no exceptional stimulus.
- **D** AIM replaces the Consensus Forecast once a quarter has closed.

**Q8** · fingerprint `cdc60f8795ea` · correct **D** · rationale yes · slides 27

> On the POS Pace Chart, the projected red dashed line sits below the green target line for an SKU. What should the KAM do?

- **A** Reduce the SKU's Sales Forecast by the gap percentage immediately during the session.
- **B** Escalate to leadership before doing anything else.
- **C** Ignore the gap — the Pace Chart is for Marketing, not for KAMs.
- **D ✓** Read the gap as a miss-risk signal: open the SKU for review, look for a named driver (promo, OOS, channel shift, listing), and decide whether to enrich at L1 or route to R&O.

**Q9** · fingerprint `b494e669633d` · correct **A** · rationale yes · slides 28

> What is the correct drill order when reconciling movements?

- **A ✓** BU / Brand total first (AIM and historical totals); drill to Brand × Forecasting Partner only when the total flags; drill to SKU vs POS Glidepath only when Brand × Partner flags.
- **B** SKU level first, then Brand × Partner, then BU / Brand total.
- **C** Brand × Partner first, then SKU, then BU / Brand total.
- **D** All three levels reviewed in parallel, then converged.

**Q10** · fingerprint `3b61b2ffeec0` · correct **B** · rationale yes · slides 29, 31

> In the 7-part decision narrative, what does the final beat capture?

- **A** The driver and the evidence.
- **B ✓** The decision and a named owner with a due date — never "the team."
- **C** The size of the movement and its timing.
- **D** The next cycle's outlook for the brand.

**Q11** · fingerprint `aed0767fe3b6` · correct **C** · rationale yes · slides 30

> Which of the eight meeting-behavior rules acts as the UK substitute for formal guardrails?

- **A** Come prepared, or don't comment.
- **B** Challenge the number, not the person.
- **C ✓** Cite a reference or move to R&O — do not opine.
- **D** Material exceptions only — don't drift.

**Q12** · fingerprint `6ede9586b39f` · correct **D** · rationale yes · slides 33, 35, 37

> The Brand Captain in Session 1 finds that the current consensus for Brand A is +30 units/week above the Daybreak baseline at Level 2.5, driven by a confirmed listing expansion at FP-1 effective W26. What is the Captain's correct action?

- **A** Wait for Session 2 and ask the KAM at FP-1 to capture it as an Enrichment.
- **B** Override the Daybreak baseline directly by replacing the source data.
- **C** Route the gap to R&O for next cycle.
- **D ✓** Load the +30 units/week as a Base Trend Adjustment at L2.5 in HERO, document the driver and evidence, and lock the L3 baseline so Daybreak + Base Trend = consensus.

**Q13** · fingerprint `a93ea2134bff` · correct **A** · rationale yes · slides 42

> A KAM in Session 2 identifies that a brand at their Forecasting Partner has been gradually widening distribution for two cycles, with no specific account-level event. The shift looks structural. Which bucket does this belong in, and who acts?

- **A ✓** Base Trend at L2.5 — the KAM flags it back to the Brand Captain, who owns it next cycle.
- **B** Enrichment at L1 — the KAM captures it this cycle.
- **C** R&O — log with options and resolve later.
- **D** Both Enrichment and Base Trend — captured at both levels for traceability.

**Q14** · fingerprint `1ce38cbaba94` · correct **B** · rationale yes · slides 52

> Marketing + DP in Session 3 want to apply an adjustment that lifts Brand B by +8,000 units in Q3 based on a confirmed campaign. Where does this adjustment land?

- **A** At Level 1 directly, bypassing the Captain's L2.5 baseline.
- **B ✓** At Level 2.5 via the Enrichment Capture Template (ECT); the backend disaggregates to Level 1 across partners using baseline disaggregation rules.
- **C** At Level 3 only, leaving partners untouched.
- **D** At Level 1 by re-opening the KAM's enrichments from Session 2.

**Q15** · fingerprint `cbb3d5103b78` · correct **C** · rationale yes · slides 54, 59

> At Executive Sign-Off, how many key movements are presented and how long does each get?

- **A** Eight to ten movements, ten minutes each.
- **B** Every movement larger than 1% of BU, no time limit.
- **C ✓** Three to five material movements, told in the 7-part narrative, five minutes each.
- **D** The full Sales Forecast, line by line.

### mod7

- Page: https://enerbartoli.github.io/mod1-knowledge-check/mod7.html · JS: `mod7.js` · HTML: `mod7.html`
- Questions: 10 · Pass threshold: 8 · Options: authoritative (bank is source of truth)

**Q1** · fingerprint `997631355fa7` · correct **C** · rationale yes · slides 4, 5

> Which forecast array does HERO read from Logility?

- **A** UA1, so the template always reflects the latest Sales Forecast in Logility.
- **B** UA1 through UA6, refreshed each time a template is downloaded.
- **C ✓** The Resultant only. Every other array in a template comes from HERO's own database.
- **D** ADS3, because it is the Consensus Forecast that Logility calculates.

**Q2** · fingerprint `aa6c374ead7b` · correct **B** · rationale yes · slides 7

> Which statement describes how HERO treats UA1 across the planning horizon?

- **A** HERO writes UA1 across the full horizon, the same as every other array it manages.
- **B ✓** HERO writes UA1 from month +5 onward and suppresses it inside the rolling months 0 to 4.
- **C** HERO never writes UA1; it is maintained directly in Logility in every period.
- **D** HERO writes UA1 only inside months 0 to 4, where the near-term number matters most.

**Q3** · fingerprint `0b2b63c76a14` · correct **D** · rationale yes · slides 6

> Demand Planning enters a Level 2.5 Base Trend Adjustment in the Reconciliation template. Where does it land in the Field Forecast?

- **A** Nowhere. Demand Planning adjustments reach the Consensus only, never a Field Forecast array.
- **B** In UA2, alongside the commercial promotion enrichments.
- **C** It is held in HERO for attribution and is not exported until a Brand Captain confirms it.
- **D ✓** In UA1, exactly as it would if a Brand Captain or a commercial lead had entered it.

**Q4** · fingerprint `8a2cbcc79ac7` · correct **A** · rationale yes · slides 7

> You delete a Base Trend Adjustment in HERO. What actually becomes zero?

- **A ✓** The delta that the adjustment represented. UA1 and the Consensus lose its effect, but neither becomes zero.
- **B** UA1 for the affected weeks, which is published to Logility as an explicit zero.
- **C** Both UA1 and the Consensus value for the affected weeks.
- **D** Nothing at all. Deletions are recorded for audit and take effect at the next cycle.

**Q5** · fingerprint `9843f1a8c418` · correct **B** · rationale yes · slides 12

> You have confirmed that a Base Trend Adjustment is stale and needs to go. How do you clear it?

- **A** Delete the row from the workbook before uploading.
- **B ✓** Enter a numeric zero in the cell.
- **C** Clear the cell so it is blank, which instructs HERO to remove the adjustment.
- **D** Enter the same value with the opposite sign in the following week.

**Q6** · fingerprint `b5a6eb550c49` · correct **C** · rationale yes · slides 8

> A colleague changed UA1 directly in Logility inside the frozen window. What does HERO now know about that change?

- **A** It is already in HERO. The frozen window exists precisely to keep UA1 aligned across the two systems.
- **B** Nothing yet. It arrives the next time someone downloads a fresh template covering that scope.
- **C ✓** Nothing, and no download or upload will bring it in. HERO does not read UA1 in any window.
- **D** Nothing yet. HERO will overwrite the change on the next Friday export to Logility.

**Q7** · fingerprint `54f8650ecd6d` · correct **D** · rationale yes · slides 10, 13

> A line publishes as zero in Logility. What does that tell you about the HERO inputs behind it?

- **A** The inputs are clean, since Logility would reject anything invalid.
- **B** The enrichments were excluded from the Consensus export.
- **C** The baseline for that line was removed at source.
- **D ✓** Nothing reassuring. Logility floors the published totals, so a negative raw HERO total can publish as zero.

**Q8** · fingerprint `0fabbdd91bfa` · correct **B** · rationale yes · slides 15

> Last cycle: baseline 1,000 with an L1 Base Trend Adjustment of −200, giving 800. This cycle the baseline is 900, the −200 is still there, and the preliminary forecast reads 700. The commercial reason for the −200 still applies. What do you do?

- **A** Change the adjustment to −100 so the total returns to the 800 agreed last cycle.
- **B ✓** Confirm why the baseline moved, keep the −200, and accept 700.
- **C** Clear the adjustment and re-enter it once the baseline movement has been explained.
- **D** Raise it with the squad, because a baseline that moves between cycles is a defect.

**Q9** · fingerprint `41d5eadffe47` · correct **C** · rationale yes · slides 16

> A material shows baseline 0 this cycle with a Level 2.5 Base Trend Adjustment of −24,258 still authored against it, so the preliminary forecast reads −24,258. You have confirmed with the source owner that the baseline was removed on purpose and the adjustment existed only to offset that old baseline. What do you do?

- **A** Leave it. Logility floors the total to zero, so the published number is already correct.
- **B** Enter +24,258 in the same weeks so the two adjustments net to zero.
- **C ✓** Replace the adjustment with a numeric zero in a fresh template.
- **D** Wait for the next cycle, when HERO will clear the adjustment automatically once the baseline stays at zero.

**Q10** · fingerprint `98346dc19031` · correct **A** · rationale yes · slides 14, 18

> You download a fresh template at cycle start and find that baseline and previous-cycle values have moved across many SKUs, several partners and more than one brand, with no business event behind it. What is the correct first action?

- **A ✓** Stop, capture examples, and escalate with the evidence before making corrections.
- **B** Restore the previous cycle's totals with Base Trend Adjustments so the forecast stays stable, then report it.
- **C** Compare against the workbook you saved last cycle to work out which values are wrong.
- **D** Correct the largest movements now and leave the smaller ones for the squad to investigate.

## Backend

- File: `backend/apps-script.gs`
- Sheet name: `MOD 1 Quiz Responses`
- QUIZ_CLOSED: **false**

Routing (`doPost`):

- `mod2` → `handleMod2Post`
- `mod4` → `handleMod4Post`
- `mod5` → `handleMod5Post`
- `mod7` → `handleMod7Post`
- `mod1` → inline flow in `doPost` (no dedicated handler)

Handlers: `handleMod2Post`, `handleMod4Post`, `handleMod5Post`, `handleMod7Post`

Email template functions: `emailShell_mod2`, `emailShell_mod4`, `emailShell_mod5`, `emailShell_mod7`, `sendEmails`, `sendFailEmail_mod2`, `sendFailEmail_mod4`, `sendFailEmail_mod5`, `sendFailEmail_mod7`, `sendNotificationEmail_mod2`, `sendNotificationEmail_mod4`, `sendNotificationEmail_mod5`, `sendNotificationEmail_mod7`, `sendPassEmail_mod2`, `sendPassEmail_mod4`, `sendPassEmail_mod5`, `sendPassEmail_mod7`

Sheet columns (from `writeHeaders`; moduleId + attemptNumber are appended by each handler without headers):

1. Timestamp
2. Full Name
3. Email
4. Role
5. Role (Other)
6. Score
7. Score %
8. Status
9. Q1 Answer
10. Q1 Correct?
11. Q2 Answer
12. Q2 Correct?
13. Q3 Answer
14. Q3 Correct?
15. Q4 Answer
16. Q4 Correct?
17. Q5 Answer
18. Q5 Correct?
19. Q6 Answer
20. Q6 Correct?
21. Q7 Answer
22. Q7 Correct?
23. Q8 Answer
24. Q8 Correct?
25. Q9 Answer
26. Q9 Correct?
27. Q10 Answer
28. Q10 Correct?
29. Q11 Answer
30. Q11 Correct?
31. Q12 Answer
32. Q12 Correct?
33. Q13 Answer
34. Q13 Correct?
35. Q14 Answer
36. Q14 Correct?
37. Q15 Answer
38. Q15 Correct?
39. Q16 Answer
40. Q16 Correct?
41. Failed Questions
42. Email Sent?
43. User-Agent
44. (moduleId — appended, no header)
45. (attemptNumber — appended, no header)

## Submissions per module (snapshot, informational — not part of the structural hash)

_As of 2026-08-07 — total 114._

| Module | Submissions |
|---|---|
| mod1 | 51 |
| mod2 | 21 |
| mod4 | 24 |
| mod5 | 18 |
| mod7 | 0 |
