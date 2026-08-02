# The Apothecary Lounge — Project Specification

Standing specification. Read in full before making changes.

Build target: one codebase, Capacitor, serving a web app and a sideloaded Android build. Supabase (Postgres)
for persistence. Single user, no multi-tenancy.

---

## 1. Overview

The Apothecary Lounge is a personal skin, hair, and body care companion for a single user. Two goals carry equal weight: healing and relaxation. Healing covers the skin barrier, active acne, acne scarring, body scarring, scalp sebopsoriasis, and hair moisture. Relaxation means the routine should feel like ritual rather than obligation. The user has ADHD and memory-recall difficulty, so every design decision favors low friction and zero guilt. Everything the app does is cosmetic. It never diagnoses and never replaces a provider. Platform: one codebase serving a web app and an Android build. Single user, no multi-tenancy, no public release.

## 2. Principles

These constrain every decision below. One. Nothing is hardcoded. Every routine is generated from current inventory. No product names appear in engine code. Two. One connected system. Where two parts need to share data, they share it. Three. Zero pressure. No streaks, no guilt, no forced completion. Notifications are limited to the two restock cases in section 7. Four. Cosmetic only. The app observes, suggests, and organizes. It does not diagnose. Five. Melanated skin is the default assumption. Hyperpigmentation risk and photosensitivity are checked on every product. Six. Prescriptions are named explicitly everywhere. Never a generic label. Seven. Every domain is equal. Hair, eyes, mouth, face, and body receive identical depth of tracking and evaluation.

## 3. Accessibility and assistance

The user has fibromyalgia, spondyloarthritis, rheumatoid arthritis, and osteoarthritis alongside ADHD, works forty hours a week, and is starting a master's program. Some days involve genuine physical incapacity, not only low executive function. This shapes three requirements. Voice-to-text is mandatory on every text input in the application without exception. Not primary, not preferred — required. Every field, quiz response, search, journal entry, note, and log accepts voice input. A text input without voice capability is a defect, because typing is painful during flares. The reduced routine is presented as a legitimate routine, not a fallback. Choosing it must not read as failure. It is triggered by pain and mobility as often as by executive function. Steps carry a partner-assisted flag. Steps routinely performed by the user's partner: drying off after showering, body acne extractions, lotion application, oil application, operating the RevAir, and dressing assistance including pajamas and socks. Flagged steps display an assist indicator and are understood by the system as requiring another person's availability, not merely the user's energy.
- Text-to-speech is available throughout, not only on documents. Any block of readable content carries a small, unobtrusive speaker control at its right edge: routine steps, weekly wheel entries, calendar days, appointments, altar contents, inventory rows, and Scrying Pool output. Navigation labels and tab titles do not.
- Text-to-speech is toggleable in settings and off does not degrade anything else.
- Font size and typeface are user-adjustable in settings. Every screen reflows to accommodate the chosen size; text may wrap but layout must not break, overlap, or clip at any supported size.

## 4. The avatar and the room

A one-time builder runs before The First Inscription. Its title is phrased as a question. All wording within it uses the application's own vocabulary — the hair controls belong to The Crown and are named accordingly, never as generic loc colour or loc style.
- The figure renders with visible microlocs at every setting. Locs are the default and only texture; no European textures are offered.
- Hairstyles are visually distinct from one another at a glance. No two options may render alike. Twin buns is a confirmed keeper.
- Every builder choice persists into the room and everywhere else the figure appears. A selection that reverts to default on the following screen is a defect.
- The avatar and familiar are editable later from Settings without repeating intake.

The room is the landing screen: a static illustrated interior, generously sized, richly dressed rather than sparse.
- It contains a hearth with cauldron, an alchemy station with vessels and apparatus, an apothecary bench, a sleeping area, a ritual space, and a working circle marked on the floor.
- Candles are plentiful and lit throughout.
- The figure holds a grimoire, marking her as the one who does the work.
- The familiar shares the room.
- Garment colour and the room's textiles harmonise.
- Hoodoo and rootwork imagery is drawn on respectfully and never as caricature.
- Nothing animates in version one. The scene is built as the foundation the version two companion will inhabit, not as a placeholder to discard.

## 5. Architecture

Rootwork is the single source of truth. It holds all inventory. Rootwork feeds the routine engine. The engine generates every routine surface: Mortal Rites, The Altars, and The Grimoire. These surfaces hold no product data of their own. User activity flows back. Completed steps write to history. Reactions write to The Scrying Pool. The Scrying Pool evaluates that activity and writes conclusions back to Rootwork as state changes and suggestions. The next day's routines read the updated Rootwork. Shadow Tome is deliberately isolated from this loop. It is a private journal and feeds nothing.

## 6. Item data model

Fields on every item. Name: the product's real identity with marketing and accessory language removed. Waterpik, not Waterpik brand wireless water flosser with attachments. Never truncated to a single word. Domain: Crown, Gaze, Grin, Visage, or Vessel. Primary category, derived by AI rather than chosen from a fixed list. Cleanser, toner, serum, moisturizer, sunscreen, mask, oil, exfoliant, and spot treatment are illustrations only. Sub-class, likewise derived. Gel, foaming, sheet, clay, sleep, wash-off, astringent, and gentle are illustrations only. Application zone, required: scalp, hairline and edges, orbital and eyelid, face-upper, face-mid, face-lower, full-face, underarms, chest and back, general body, intimate, oral, lips. Ingredients: structured, manually correctable. Behavior flags: requires-rinse, timer duration in minutes, layering weight one to ten where one is thinnest. Risk flags: melanin caution, photosensitizer, comedogenic, buildup risk, fragrance, retinoid, acid, vitamin C, benzoyl peroxide, exfoliant. Lifecycle state. Opened date, editable and backdatable. Period after opening in months. Storage location: mini fridge, bathroom, vanity, basket, cabinet. Displayed on routine steps so the user knows where to retrieve an item. Price, optional. Scheduling mode: scheduled or anytime. Partner-assisted flag. Glyph. Two independent expiry clocks are held per item. Period after opening runs from Break the Seal. Unopened shelf life runs from manufacture or purchase and applies whether or not the seal is ever broken; a product left unopened for years is not safe by virtue of being sealed. Whichever expires first governs. Both surface through the Scrying Pool's expiry watch. Every field on every item is editable after creation, reachable from the item itself rather than only at entry. Voice-captured input is shown as editable text for correction before it is committed; nothing dictated is written without the chance to amend it. Arsenal items do not carry period-after-opening or opened dates, which are meaningless for durable tools; they carry maintenance and cleaning cadence instead, and may optionally carry an expected service life where a manufacturer states one. Durable tools in The Arsenal carry neither period-after-opening nor an opened date; those fields apply to consumables only. Tools instead track cleaning and maintenance cadence, and where manufacturer data supports it, expected service life by use count. Storage location is user-set and editable on every item, chosen from a list the user extends, never a fixed set.

## 7. Classification rules

Categories and sub-classes are not a fixed enumeration. The system derives them from what a product actually is.
- No category list is hardcoded. AI determines both primary category and sub-class from the label, ingredients, and form, and may create a category or sub-class that has not been seen before.
- Any category named anywhere in this specification is an illustration, not a permitted value.
- The user confirms or corrects the derived classification; the correction becomes the record.
- Bar soaps default to the Vessel domain, with a face-or-body toggle shown at entry. A shampoo bar routes to Crown. Bars marketed for facial acne are frequently used on the body, so marketing copy is not a classification signal.
- Glyphs follow what a product functionally is, never words in its name. Primary category sets the default; a sub-class overrides it when physical nature genuinely differs. Manual override with alternatives is always available. People glyphs use dark-skinned variants.
- Glyphs are globally unique. No two categories, sub-classes, tasks, appointments, altars, or arsenal entries share a glyph. A registry enforces this: on collision AI selects the next best semantic fit rather than duplicating.
- A glyph must depict what the thing is or does, never a word in its name. A thermal cap is not a baseball cap. A lotion warmer is not a plant. Extractions are not a sewing needle. Where no adequate symbol exists, an abstract mark from the application's own ornament set is preferred over a poor literal match.
- Every glyph depicting a person uses a dark-skinned variant. Where a whole-body figure is meant, a single whole-body figure is used rather than a composite of parts.
- Every glyph is unique across the entire application. No two categories, sub-classes, tools, tasks, routines, or rituals share one. Uniqueness is enforced against a live registry at assignment time; when the obvious choice is taken, AI selects the next most functionally apt symbol rather than reusing.
- Glyphs must be legible at small size and must map to function, not to a word in the name. A tool called a cap does not receive a baseball cap. A lotion warmer does not receive a plant. Extractions receive tweezers, not a sewing needle.
- Glyphs are a custom icon set, not Unicode emoji. Emoji is a closed vocabulary of roughly three thousand seven hundred characters containing no tweezers, no skipping rope, no contact lens, no bonnet, and no dropper, so a system requiring a unique apt mark for every category cannot be built on it. Emoji also renders differently on every platform and reads bright and cartoonish, working against the intended aesthetic.
- Two sets are combined. Phosphor or Tabler supplies interface chrome — settings, confirmation, navigation, arrows — at several thousand icons under permissive licence. A fantasy set such as game-icons.net supplies the ritual and product marks: cauldrons, vessels, mortar and pestle, herbs, scrolls, tweezers, droppers, and the silver coin the Silver Toll wants and Unicode does not have. Icons are inline SVG, so every mark is recoloured to the palette, follows the chosen line weight, and scales with the user's text size. This is what makes them more legible than emoji rather than merely more numerous: a drawn mark can be made to mean one thing clearly, at the size and colour the rest of the interface uses.
- Any emoji appearing in a mockup is a stand-in for a drawn icon, never the specification.
- Confirmed libraries. Phosphor Icons supplies 1,512 icons in six weights under MIT licence, delivered as a web font or inline SVG, and covers the functional vocabulary: eyedropper, flask, test tube, syringe, jar, spray bottle, hand soap, towel, tooth, bathtub, shower, hair dryer, shield, crown, hourglass, coins, scroll, cooking pot. Verified names only — an unrecognised name renders as nothing, so every icon is checked against the package before use. Phosphor lacks razor, mirror, candle, tweezers, herb, potion, and contact lens. A fantasy set — game-icons.net under CC BY, or Shikashi's pack — supplies those along with cauldrons, mortar and pestle, tied and open scrolls, and bronze, silver, and gold coin stacks, the last of which resolves the Silver Toll where neither Unicode nor Phosphor can. Where a concept exists in neither, it is commissioned rather than approximated.
- Verified integration details. The package is @phosphor-icons/web, version 2.1.2. Stylesheets live at src/duotone/style.css and src/regular/style.css within the package. The class convention is two classes together — the weight class and the icon class, as in ph-duotone ph-flask. In a bundled build this is an npm install rather than a CDN link.
- All icon rendering passes through a single helper that takes a name and returns markup. Nothing constructs icon markup inline, and nothing interpolates a bare icon name into output. This is not a style preference: it is the only way to guarantee a name cannot escape unrendered.
- Two distinct failure modes, both silent, both caught by rendering rather than by reading code. An unknown icon name renders as an empty space. A name that reaches output without being wrapped in markup renders as its own text, so the interface displays the literal words hand-soap or eyedropper where a mark belongs. The second is more common when names are passed through variables, arrays, or object properties rather than written directly. 
- Verification is by rendering, not inspection: assemble the interface, extract every icon class from the output, check each against the installed package, and check that no raw icon name appears as text. A build that passes a name check but has never been rendered has verified nothing. Uniqueness is checked against rendered output, not against the registry alone. An icon written inline at a call site never enters the registry and so passes a registry-only check while still colliding on screen. Every icon must come from the registry, and the verification pass must confirm that no icon appears in output that the registry does not contain. Concepts Phosphor lacks entirely, requiring the fantasy set or commissioned artwork: toothbrush, tweezers, razor, mirror, candle, contact lens, herb, potion, clay or mud vessel, and a silver coin. Approximation is not acceptable where the concept has a recognisable form. Any mark that requires explanation is drawn instead: a small inline SVG on the icon set's grid and stroke weight, taking its colour from the surrounding text so it inherits the palette and the user's chosen size like every other mark. Roughly half the set is drawn on this basis — cleanser tube, toner bottle, cream jar, prescription tube, ointment tube, roll-on, contact lens, tweezers, heated eye mask, dropper bottle, satin bonnet, spot patch, skipping rope, locs, lacquered nail, depilatory tube, razor, hand mirror, mortar and pestle, urn, steamer, altar, scrying bowl, grimoire, water glass, face, toothbrush, and mask jar. Drawn marks sit in the same registry under the same uniqueness rule, and the general set is used wherever it genuinely fits. 
- Icon assignment for a new product is AI-assisted selection, not AI generation. The model chooses the best mark from the existing set and, where nothing fits, says so and proposes what a new mark should depict rather than inventing one. Generated vector art is unreliable at icon scale and produces shapes that do not read; selection from a curated set is both accurate and effectively free. A proposed new mark is drawn once and added to the set, so the vocabulary grows deliberately.

## 8. Composite items

Some items are blends the user compounds. Two exist today: a bath soak of whole milk powder, orange peel powder, rose petals powder, and epsom salts, ground together and dispensed by the scoop; and a scalp oil of olive, black castor, rosemary, and rose oils.
- Entry is through a dedicated action beside photograph and search, labelled in the application's voice rather than as DIY.
- The flow collects: a name; two ingredient fields with an option to add more; the batch creation date; and the form of the blend — oil, liquid, powder, balm, or other.
- Ingredients and form together determine shelf life. Dry goods degrade too, and food-grade components such as milk powder carry real limits. AI estimates viable life from composition and form; the estimate is shown with its reasoning and is editable.
- A composite stores its component items and proportions. A Compound action deducts from components and creates or refills the composite.
- Components and composite deplete on separate clocks: components empty when a batch is made, the composite empties as it is used.
- The ingredient list is the union of components. All safety checks run against that union, and the composite inherits any component's flags.
- A composite carries its own application zone and can be added to any Altar.
- Composites are evaluated by the Scrying Pool at both levels: the blend as a ritual, and components individually.

## 9. Lifecycle states

Every item holds one state. States describe availability and verdict, never quality of the routine.
- Stocked
  - Default for anything on hand, including new items in trial.
  - Included in routines.
- Ebbing
  - Nearing empty. Set manually at first.
  - After roughly two usage cycles the system learns the item's consumption rate and sets this itself. It never prompts the user to set it manually.
  - Included in routines.
- Hollow
  - Ran out. Dropped from routines automatically, retained in inventory.
  - Restocking returns it to Stocked. It re-enters at the position current layering logic dictates, not its former slot.
- Enshrined
  - A verdict, set only after a full container has been used and the product judged worth repurchasing.
  - Not an entry requirement. A product added today is as eligible for the routine as a proven staple.
  - Included in routines.
- Banished
  - Permanent removal for any reason a product leaves for good: adverse reaction, ineffectiveness, changed preference, cost, unavailability, or discontinuation by a provider.
  - Reason is captured through an AI-led conversation rather than a form.
  - Provider-directed discontinuation is its own reason, distinguishing a clinical decision from a product failure.
  - Excluded from routines immediately.
  - Available on every item at any time, presented as a plain three-dot menu once an item is Enshrined.
- Break the Seal
  - Separate from state. A distinct, visible toggle on any unopened item, not a hidden action.
  - Records the opened date and starts the period-after-opening countdown.
  - The opened date is editable and backdatable, which is required: much of the existing inventory was opened before the app existed.
  - Where a purchase date is known, it bounds the earliest possible open date and is offered as an estimate.

## 10. Restock behavior

The Summoning Scroll is the restock list and lives on Rootwork. Essential items surface immediately when Ebbing. Non-essential items batch silently until five accumulate, then surface together. Two notifications exist in the entire application, both restock-related: the batch-of-five prompt, and a per-item prompt once that item has enough usage history to predict depletion. The system sets Ebbing itself once predictive; it never prompts the user to set it manually. Item actions surface directly on the item rather than hiding behind a menu. Enshrine, Banish, Ebbing, Hollow, Break the Seal, Replenish, and Edit are all reachable without opening an overflow. Only destructive or rare actions belong in the overflow. Action labels carry no scaffolding words such as Mark. Every item is editable after creation, and every entry the user makes can be deleted.

## 11. Routine engine

Every routine surface calls this engine. It decides order dynamically. Nothing about placement is hardcoded.
- Input: all Rootwork items whose state is Stocked, Ebbing, or Enshrined, filtered by domain and time of day. Excluded: Banished always, Hollow while out of stock.
- Ordering is derived, never fixed. The engine weighs: function; formulation weight and texture, thinnest to thickest; ingredient behaviour, including pH dependence, occlusivity, penetration, and what must reach skin unimpeded; documented layering convention for the domain; and interactions among everything else scheduled that day.
- Prescriptions are ordered by the same logic as anything else. A topical medication is still a formulation with a weight, a pH, and an ingredient profile. It holds no fixed position.
- Masks hold no fixed position. Placement is derived per day from what else is scheduled.
- Optional items, including masks and anytime items, are placed in their correct position in the sequence and presented with a toggle. They are shown where they belong and never required.
- Rinse-off items are weighted toward days with more time available rather than pinned to fixed days.
- A rinse-and-dry step follows any requires-rinse item. A timer attaches to any item carrying a duration.
- Empty steps do not render. The engine is identical across all five Altars.
- Layering knowledge is sourced from the reference data described in the safety section and applied by the AI layer, not from rules written into application code. As inventory changes, prescriptions change, or products are discontinued, order is recomputed rather than migrated.

## 12. Safety layer

Deterministic checks run on reference data. No AI participates in a pass or fail decision, though AI maintains and expands the reference data it checks against.
- The Codex: a block list of ingredients. Any match prevents a product entering a routine. Lavender is a permanent, non-removable entry. Others are added at intake or when a product is banished for an ingredient reason.
- Conflict checking is exhaustive, not a fixed shortlist. Every ingredient of every item is checked against a reference set of known interactions, which is queried and expanded through the AI layer rather than enumerated in code. Any conflicts named in this document are examples, not the complete set.
- Checks run continuously across the whole inventory, not only at the moment a product is added.
- Risk flags are domain-specific and equally exhaustive for each.
  - Melanated skin: post-inflammatory hyperpigmentation triggers, photosensitizers, and anything documented to worsen pigmentation. Presence-based rather than concentration-based, since brands do not reliably disclose concentrations. Matches require active acknowledgment and prompt their mitigation.
  - 4C hair in microlocs: buildup from heavy waxes, thick creams, and non-water-soluble silicones; ingredients documented to dry or embrittle 4C hair; ingredients that leave locs gummy or breakage-prone; protein and moisture imbalance.
  - Sensitive skin: depilatory and high-pH formulations, documented irritants, and anything associated with chemical burn or contact rash. Depilatories are flagged specifically, having caused burns and rash for this user.
  - Intimate care: ingredients documented as disruptive to vaginal microbiome or pH. The user is non-binary and female at birth; gendered language is excluded everywhere, and physiology is accounted for accurately.
- Hair removal entries automatically attach pre-care and post-care steps. Post-care for depilatories includes a low-pH cleanse to neutralise residual alkalinity, since thioglycolate formulations leave skin strongly alkaline and a soap wash compounds it.
- Sun protection is treated as load-bearing rather than routine, and includes reapplication guidance where daytime exposure is known. Window glass transmits UVA, which drives pigmentation, so indoor exposure to direct sunlight counts.

## 13. Conflict resolution by zone

Conflicts are evaluated by application zone, not by co-presence in the routine. Two products conflict only when their zones overlap or are directly adjacent. Alcohol-based witch hazel on the underarms does not conflict with a facial retinoid. Salicylic acid bars on chest and back do not conflict with facial actives. A retinal eye serum in the orbital zone and tretinoin applied nose-down do not directly layer; that pairing produces an advisory about total retinoid load rather than a block. Adjacent zones produce a migration advisory. A conflict reschedules rather than forbids. The engine moves one product to a slot where it works. Vitamin C conflicting with a nightly retinoid moves to the Morning Rite, its conventional placement. Exfoliating acids move to nights the retinoid is skipped. Buffering is supported, applying moisturizer before a prescription to reduce irritation. Only a Codex match or a genuine hazard removes a product outright. Where nothing can be safely scheduled, the app says so and explains why. Warnings are overridable. The user may proceed after acknowledgment, since a provider may have approved a combination the engine flags. Hardcoded zone rule: Drysol is never scheduled on the same day as the bath ritual or as underarm witch hazel, because aluminum chloride on freshly exfoliated or astringent-treated skin causes burning.

## 14. Master Invocations

Prescriptions. Cannot be Banished by ordinary means; provider-directed discontinuation is the exception and is recorded as such. May be marked Hollow. Zones are editable. Named explicitly wherever they appear.
- Tretinoin 0.05% cream. Zone: chin per the label, editable. Under active titration, see below.
- Tacrolimus 0.1% ointment. Zone: orbital and eyelid. Eyelid eczema.
- Drysol, aluminium chloride. Zone: underarms. Hyperhidrosis. Bedtime, dry skin only, never on freshly shaved or irritated skin.
- Zoryve 0.3% foam. Insurance denied refill. Runs out with the current bottle, then Banished as unobtainable.

Tretinoin titration. The pharmacist directed one to two nights weekly, increasing as tolerated toward nightly. The app supports that progression and never drives it alone.
- Scheduling begins at one to two nights weekly.
- Every two weeks the app opens an AI-led conversation about tolerance: peeling, redness, blistering, bumps, stinging, and pigment change.
- Responses feed the Scrying Pool, which evaluates tolerance across time rather than from a single answer.
- Where tolerance is established, the Pool proposes a single-step increase in weekly frequency. The user confirms. The app never increases frequency on its own.
- Where reactions persist or worsen, the Pool proposes holding or stepping back.
- Nightly is the ceiling, matching the pharmacist's direction.
- Blistering or severe reaction is surfaced as a reason to contact the prescriber, not something the app titrates around.

## 15. The Scrying Pool

The evaluation engine. It reads from everywhere in the system and assesses how well the routine serves the user's stated goals. Inputs: every Rootwork item and state; every Enshrine and Banish with reasons; every logged reaction with zone and severity; completion history including which steps are skipped; intake answers; every Reading check-in. Reaction logging is always available and never gated behind banishing. The Pool lists every product in inventory. Beside each, it renders checkboxes for reactions associated with that product's category and ingredient classes. Retinoid: peeling, redness, purging, dryness, photosensitivity. Acid: stinging, burning, peeling. Fragrance: itching, redness, rash. Hyperpigmentation appears wherever the ingredient class warrants it. Checkboxes derive from ingredient class, not per-product authoring. Each reaction records zone and severity one to five. Outputs: ingredient patterns across banished products; whether the routine is moving toward current goals; replacement suggestions drawn first from owned items, then from the external product database; recommendations to remove a step where the routine does not need it; suggestions for unowned products that would work synergistically; and observed correlations such as which steps are skipped and whether reactions cluster around ingredients or application frequency. Banish reasons are weighted. Availability and cost banishes carry no signal about formulation and are excluded from ingredient pattern analysis. Composites are evaluated at two levels: the blend as a ritual, and its components individually. When two blends share a component and reactions follow the component rather than the blend, that is a strong attribution signal. All five domains receive identical evaluation depth. The Pool contains the Crypt of Ashes, the archive of banished products. All output is cosmetic and observational. Three additional queries. The Waning:  items whose period-after-opening countdown is nearing its end are surfaced proactively, before a product degrades. The Echo: before a purchase, the Pool reports whether the user already owns multiple active items built around the same primary active, guarding against redundant spending. The Silver Toll: total monthly cost of the current routine, derived from per-item price and usage frequency, surfaced alongside the Summoning Scroll so restock decisions carry visible cost context.

## 16. The Echo and adaptive suggestions

The Echo accepts prospective items. A photograph or screenshot of something under consideration — in a shop, on a listing, anywhere — is submitted without adding it to inventory. The Pool reports whether its primary actives duplicate what is already owned, whether it conflicts with anything in rotation, whether it trips any domain risk flag, and how it would fit the current routine. Prospective items are held separately from inventory and can be promoted to Rootwork or discarded. Sleep and activity data, where a wearable is connected, informs optional suggestions: poor sleep may surface a de-puffing step for the eye area, and heavy sweat may surface a gentle body cleanse. Suggestions appear only when a suitable product is in inventory, and are always optional.

## 17. Settings

Reached by a gear control in the header, present on every screen.
- Typography: font size and typeface selection, applied globally with full reflow.
- Text-to-speech: on or off, voice selection, and rate.
- Integrations: Health Connect authorisation and per-source selection, covering the ring, the watch, and any other connected wellness source. Only data the application actually uses is requested — sleep, readiness, activity, and heavy-sweat signals. Google Calendar authorisation lives here too.
- Resets, at three levels: an individual entry may be deleted anywhere it was entered; a single tab or the routine alone may be reset without touching anything else; and a full reset returns the application to first launch. Destructive resets confirm before acting and name exactly what will be lost.
- Avatar and familiar may be edited here at any time without repeating intake.

## 18. Wearables and health data

Data arrives through Android Health Connect, which acts as the single broker. The application never talks to a manufacturer's service directly.
- Sources the user connects: the RingConn companion application for the Gen 3 ring; Samsung Health for the Galaxy watch; and the Renpho application for its devices. Each is toggled independently and states plainly what it contributes.
- Setup is guided rather than a permission wall. The app names each source, explains in one line what it will draw and why, and lets the user decline any single stream while keeping the rest.
- Data drawn, and what each is for:
  - Sleep duration and stages — a poor night raises a de-puffing suggestion for the eye area, and offers the Lesser Rite before the full one.
  - Heart rate variability and resting heart rate — a readiness signal. Low readiness softens the routine and surfaces the breathing space rather than adding steps.
  - Skin temperature — a rising baseline is recorded alongside logged reactions, since inflammation and flare often precede what the user notices.
  - Exercise sessions and active energy — heavy sweat surfaces a gentle body cleanse, guarding against body breakouts, and never schedules an astringent onto freshly worked skin.
  - Steps and general activity — context for how demanding a day was, informing which routine is offered first.
  - Hydration, where logged — context for dryness and barrier concerns.
  - Cycle and hormonal-adjacent data, where the user chooses to share it — feeds the correlation already described in the Scrying Pool. Framed neutrally, with no assumption of a bleeding cycle.
- Weight and body composition are not drawn. They serve no cosmetic purpose here and are outside scope.
- Every incoming stream is read-only. The application writes nothing back to Health Connect.
- All wearable-derived suggestions are optional and appear only when a suitable product is already in inventory. Nothing arrives as an instruction.
- The system degrades cleanly. With no wearable connected, every feature above simply does not appear, and no routine depends on data that may be absent.

## 19. Screens

Six tabs across the top, horizontally scrollable on narrow screens. A landing screen precedes them. First launch routes to intake before anything else. Mortal Rites. Morning Rite and Evening Rite, both present. Generic category labels for ordinary products, real names for prescriptions. Each step is an independent checkbox logging on check. No button requires all steps to be complete. Optional steps use a toggle rather than a checkbox and gate nothing. The Grimoire. Weekly Wheel at top, showing everything scheduled for each day rather than a token entry or two. The month view is sized so day numbers and marks are legible without strain. Below it a real calendar month with the correct day count for the current month and year. Below that, completion history. Salon appointments live here with a Mark Done action that recalculates the next date from actual completion: nails roughly two weeks, retie roughly eight. Veet and shaving are tracked as two separate independently-learned cadences, both permanently optional. The Altars. Five sub-views, always ordered head to toe and never alphabetically or by any other arrangement: The Crown for hair and scalp, with distinct daily-maintenance and wash-day layers; The Gaze for eye care; The Grin for oral care; The Visage for face; The Vessel for body, personal hygiene, and the bath ritual. The Gaze and The Grin do not appear on the calendar; their steps appear in the Rites. Rootwork. The Summoning Scroll at top. Below it The Apothecary for consumables and The Arsenal for durable tools, each grouped by category then sub-category. Add by photo; search is the fallback. The Scrying Pool. Per section 12. The Shadow Tome. A private journal, isolated from all routine logic. Mood is chosen from named feelings, never a numeric scale, and more than one may be true at once. The vocabulary of feeling is AI-generated and broad rather than a fixed handful. A guided breathing and meditation space lives here, drawing on readiness data where a wearable is connected. Voice-to-text throughout, with a visible microphone. Each Altar shows its complete routine in executable order, not an unordered list of the products it draws on. Where an Altar holds more than one rhythm, such as The Crown's daily maintenance and wash day, each is shown whole and in order. Steps name the action, not the product category alone: a toothbrush step reads as brushing teeth so the system and the user share the same meaning.

## 20. Fixed sequences

Two routines do not vary by product and are sequenced rather than generated. The Grin: floss picks, water pick, mouthwash, brush. The evening wind-down: shower, dry off, extractions with the heated eye mask running concurrently, lotion, oil. Extractions precede all oils. Stainless steel tools are submerged in 70 percent isopropyl alcohol for five to ten minutes before and after use. The bath ritual sits in The Vessel at roughly a two-week cadence, adjustable and invitational. The soak is a composite per section 5. Its milk powder contributes lactic acid, so it carries the exfoliant flag, which triggers the Drysol separation in section 10 and prevents same-day stacking with salicylic acid body bars.
- Where a step carries a required interval before the next, completing it starts a visible countdown automatically. Retaine MGD drops begin the fifteen to twenty minute wait before lens insertion without the user starting anything.
- Devices that time themselves are not given app timers, and their durations are not restated in the step.

## 21. Equipment rules

Tools in The Arsenal carry usage rules that are not ingredient-based and cannot be derived from a label. These are stored per tool and surfaced on the step that uses them. Hooded steamer: no plastic cap underneath. Direct steam is the purpose, and a cap blocks it. Thermal or silver-lined heat cap: plastic cap goes underneath. This is the inverse of the steamer rule, and the two are easily confused. Extraction tools: hands washed with antibacterial soap before starting; tools submerged in seventy percent isopropyl alcohol for five to ten minutes before and after use. RevAir: flagged partner-assisted, being heavy and difficult to maneuver. Hand washing is an ordinary routine step following any prescription application. It gates nothing and blocks nothing; it appears in sequence like any other step.

## 22. Onboarding and check-ins

Both intake and check-in are AI-led conversations rather than forms. The user speaks; AI asks, follows up, and structures the answers. Form and checkbox paths remain available as the fast route.
- The First Inscription runs once, before any other screen. It gathers known allergies and sensitivities, seeding the Codex; active prescriptions, becoming Master Invocations; conditions to protect; current concerns, setting routine priority; oral medications as cosmetic-evaluation context; and product philosophy preference across traditions, which shapes what the Scrying Pool suggests, limited to what ships to the US.
- The Reading runs every thirty days. It asks what currently weighs on the user and what the goals are, then re-sorts the entire routine across all domains. It re-asks medications, pre-filled with the previous answer.
- The tretinoin tolerance check runs every two weeks as its own short conversation.
- Banishing a product opens a conversation that captures the reason.
- Any data entry that can be conducted as a conversation is conducted as one. Manual entry is a fallback, never the primary path.
- The conditions question, the current-concerns question, and the opening skin question are required. The opening question offers a relaxation-only answer for when nothing is actively wrong.
- Every option list in intake is AI-generated and open-ended, never a fixed menu. Conditions, concerns, and product traditions are drawn from reference data and expand as the field does; the user may add anything absent. Any list shown in this document is illustrative.
- Product traditions extend to every market whose products can be shipped to the US, not a short list of five.
- Intake copy never explains the system to itself. Cadence, re-prompting, and internal mechanics are not narrated to the user.
- Nothing is pre-populated into inventory at intake except prescriptions the user confirms. Products discussed during design are not seeded.
- Option pools are broad by default, not minimal. Every question presents a wide, recognisable set — dozens of conditions, concerns, and traditions — because the user cannot name an affliction they have not heard of. Recognition, not recall.
- An add-your-own control is a supplement to a rich pool, never a substitute for one. A short list with an other button is a failure of the requirement.
- AI widens each pool at presentation time, drawing adjacent and related conditions the user has not named, and refines what it offers as it learns what is relevant.

## 23. Oral medications

Oral medications are recorded at intake as cosmetic-evaluation context. The app flags three classes with direct cosmetic relevance. Photosensitizers, including tetracycline-class antibiotics commonly prescribed for acne, compound topical retinoid sun sensitivity and raise hyperpigmentation risk on melanated skin. The app reinforces sun protection prompts accordingly. Systemically drying medications increase the barrier support the routine should provide. Immunosuppressants, standard treatment for rheumatoid arthritis and spondyloarthritis, raise infection risk during skin-breaking procedures. Where one is recorded, the app surfaces a caution on the extraction step and on its sanitization protocol rather than scheduling extractions without comment. The app performs no drug interaction checking. That is a pharmacist function with purpose-built tools, and anything beyond the three cosmetic classes above is routed to the user's pharmacist. Recorded medications: methotrexate and etanercept, both for inflammatory arthritis. Both are immunosuppressant, activating the extraction caution described above against a routine that currently schedules extractions every shower. Methotrexate is additionally photosensitizing, which compounds topical retinoid sun sensitivity and raises hyperpigmentation risk on melanated skin; sun protection prompts are weighted accordingly and are treated as load-bearing rather than routine.

## 24. AI scope

AI never touches the safety layer. The Codex, Melanin Ward, Synergy Engine, zone rules, and Master Invocation handling are deterministic code, because a safety rule that occasionally hallucinates is not a safety rule. Everywhere else, AI carries the manual burden. The design goal is that the user photographs, speaks, or taps, and never types structured data. Natural language capture. Speech-to-text transcription runs on-device through the browser speech API at no cost; AI parses the resulting transcript into structured records. Adding a product, logging a reaction, marking something Hollow, or noting a purchase can all be done by speaking a sentence. Checkbox and form paths remain as the fast route; voice is the low-effort route. The Reading is conducted conversationally rather than as a form. AI asks, the user talks, AI structures the answers. Evaluation. Replacement suggestions on banish, drawn from owned items and the external database and screened through the full safety layer before display. The judgment that a step should be removed rather than replaced. Failure summarization. Ingredient patterns across the banished set. The Echo redundancy check. The whole-routine assessment. Proactive suggestions for unowned products, weighted toward hyperpigmentation and photosensitivity risk on melanated skin. Composite blend analysis across component ingredients. Price estimation where no receipt exists, stored and displayed as an estimate. All AI-generated text displayed in the interface is written in the application's voice per section 22. Suggestions, summaries, assessments, and empty states read as ritual language, not as generic assistant prose. This is a hard constraint on every prompt, not a stylistic preference: the input may be casual speech, but nothing rendered on screen breaks the voice. All AI output is cosmetic and advisory. It suggests products; it does not name conditions.

## 25. Data capture and import

Product intake. Multiple photos per product are captured in one session and submitted together: front for name and brand, back for the ingredient list and period-after-opening symbol, and a separate close shot of any embossed or stamped code, which typically sits on the crimp or base and needs its own angle. From that set AI returns name, brand, category, sub-class, full ingredient list, period-after-opening, container size, and inferred application zone, layering weight, texture, risk flags, and glyph. The user confirms or corrects rather than authoring. Embossed codes are frequently batch codes rather than dates, and decoding conventions vary by manufacturer, so any uncertain read is surfaced as unconfirmed rather than written silently into a countdown the user then relies on. Where a product is absent from the external ingredient database, AI supplies the ingredient list from its own knowledge, marked unverified. Bulk import is source-agnostic. Any uploaded image may contribute any field, and no source is restricted to a fixed set of data. Ingredients are not reliably printed on the container: they frequently appear only on outer packaging that gets discarded, or only on a retailer listing. Valid sources include the product front and back, the outer carton, an embossed code close-up, a retailer product page screenshot, and an order-history screenshot. AI extracts whatever each image actually contains rather than what its category is expected to contain. Images for many products are uploaded in a single operation. AI groups them by product, matching front, back, carton, and listing shots of the same item, and proposes the grouping for review. Nothing commits until the user confirms the grouped sets, because an incorrectly merged pair of products is more costly to untangle afterward than to correct before writing. Where multiple sources describe the same field, they merge by precedence rather than by arrival order. The physical container ranks highest, since it is authoritative for the item actually owned. Outer packaging ranks next. Retailer listings rank below both, because listings go stale when a product is reformulated. The external ingredient database ranks next, and AI knowledge last. Disagreements between sources are surfaced to the user with both values shown rather than silently resolved, since an ingredient list is the input to every safety check. Fields present in only one source are taken from it and flagged as single-sourced.

## 26. Product identification

Products are added by photo. Optical character recognition extracts label text, matched against an external database — Open Beauty Facts and the INCI ingredient dictionary — returning a structured ingredient list that feeds the Melanin Ward and Synergy Engine. A search bar is the fallback when a photo cannot be identified, searching that same external database. It does not search the user's own inventory. Manual correction of any scanned result is always available, since every safety check depends on ingredient accuracy.

## 27. Visual and voice

Palette: obsidian ground, crimson and purple accents, silver and platinum metals. Green is excluded. Gold is permitted sparingly.
- Typography leans calligraphic. Display and headers use flowing fountain-pen and copperplate forms — the hand of an old grimoire or a summoning scroll, not plain block lettering. Readability governs: functional text, step labels, and anything read repeatedly stays legible, using a calligraphic face only where it does not cost clarity.
- Texture references aged parchment and ink, not wood, leather, or clay.
- Theme is Virgin Islander and Hoodoo heritage blended with cottagecore goth, handled with respect and never as caricature.
- Display names are consistent. Every tab and section heading carries the definite article: The Mortal Rites, The Grimoire, The Altars, The Rootwork, The Scrying Pool, The Shadow Tome. Running prose follows ordinary grammar.
- Voice applies to all interface copy, including anything AI generates for display. Seal the Morning Rite, not Mark Complete. Replenish, not Mark as Restocked. Invoke and Banish for accepting or dismissing. Empty states speak in the same voice. Backend vocabulary never surfaces.
- The landing screen is a static illustrated interior: a witch's cottage holding a hearth and cauldron, an apothecary bench, a sleeping area, and a ritual space drawing on Hoodoo and rootwork imagery respectfully. The avatar and a single familiar stand within it. Nothing animates.
- An avatar builder runs before The First Inscription, on first launch only. Defaults: melanated skin, red cat eyes, shoulder-length microlocs. Options lean goth and cat-girl. Every hairstyle offered is 4C-textured and loc-compatible; no European hair textures are offered.
- A familiar is chosen alongside the avatar and appears in the same scene.
- The avatar and familiar are editable later without repeating intake.
- Navigation is by tabs across the top.
- Every recurring ritual, section heading, and button carries a name in the application's voice, with the definite article where its siblings have one. Product brand names such as Veet appear only as inventory items, never as the name of a ritual. Depilation and shaving are separate rituals with separate names and separate glyphs — a foam or cream mark for one, a blade for the other.
- Interface copy that instructs or prompts is written in voice throughout. Labels such as show me the thing, name it instead, what the pool sees, or what the rite costs each month are placeholders, not finished copy.
- Every tab carries a glyph, including Rootwork.
- A single figure glyph represents a whole person where one is needed; composed or clustered figures are not used. All figure glyphs use dark skin tones.
- Prescription strength is displayed wherever a prescription is named.

## 28. Interface and ornament

The interface carries the theme visually, not only in wording. Flat panels of black and grey are a failure state.
- Ornament: swirl and flourish borders, calligraphic rules and dividers, moons, stars, and alchemical marks framing sections. Cards carry decorated corners and edges rather than plain strokes.
- Palette extends beyond obsidian and crimson into a full cottagecore-goth range: aged parchment, tarnished silver, deep plum, dried rose, moss shadow, candle gold, ink black. Green as a dominant remains excluded; muted shadow tones are permitted within the palette.
- Tabs are centred, sized for touch, and distinguished by colour rather than grey alone. The application title outranks tab labels in size.
- The reduced-effort routine is offered in the application's voice and given prominence — a clearly sized, clearly worded entry, not a small aside. The current date is legible at a glance.
- Routine steps name the action plainly and briefly. Composite sequences appear as one named step rather than their component parts spelled out. Durations belonging to a device are not restated in the step.

## 29. Stack, build, and cost

Capacitor wrapping one codebase to web and Android. Supabase, which is Postgres, for database and persistence. Division of labor. The partner drives Claude Code, which performs the bulk of construction: schema and migrations, the routine engine, all deterministic safety rules, every screen and component, the AI integration layer and its prompts, state management, and tests. The partner handles what cannot be automated: creating the Supabase project and holding credentials, the Capacitor Android build and signing, device installation and testing, OAuth setup, and visual judgment calls. This specification belongs in the project root as CLAUDE.md, which Claude Code reads as standing context. Estimate, given existing Postgres experience and a prior successful Android build: a working core in one to two weeks of evenings, full scope in a further three to five weeks. Cost. Everything except AI is free at this scale: Supabase free tier, free web hosting, and a sideloaded Android build. AI is pay-per-use with no subscription. At Haiku 4.5 rates of one dollar per million input tokens and five per million output, with AI carrying the full manual burden described in section 16, steady state is roughly eighteen cents per month, or about two dollars and twenty cents per year. The dominant ongoing cost is voice parsing at roughly six cents monthly; everything else is under three cents each. The one-time bulk import of around eighty products, at three photos each, costs sixty-eight cents at standard rates, or thirty-four cents submitted through the Batch API, which is appropriate since import is not time-sensitive. First month totals roughly fifty cents. Three controls hold this envelope as usage grows. Haiku serves all extraction, classification, and parsing, which is the overwhelming majority of calls. The Batch API halves cost on anything not time-sensitive, principally bulk import and the monthly assessment. Prompt caching cuts repeated input by about ninety percent, and the ingredient rules and system prompt are identical across every intake call, so caching applies to nearly all of them.

## 30. Out of scope for version one

Version one carries everything in this document, including Google Calendar synchronisation, wearable integration through Health Connect, and the contact lens steps.
- Contact lens steps ship in version one. Menicon Z rigid gas-permeable lenses, removed nightly, requiring a fifteen to twenty minute gap after Retaine MGD drops before insertion. Like any step, they render only when the products they need are in stock.
- Deferred to version two: gamification. A Tamagotchi-style companion occupying the landing scene, animating the avatar and familiar already established there and responding to completed routine steps. The version one scene is built as its foundation, not as a placeholder to be discarded. Design proceeds during version one use; construction follows at an unhurried pace.
- Deferred: multi-user support and public release.

## 31. Open decisions

State names, domain names, and tretinoin cadence are settled. Ebbing and Hollow are confirmed. The Gaze and The Grin are confirmed. Titration follows the pharmacist's direction as described in the Master Invocations section. The landing screen is the illustrated cottage interior holding the avatar and familiar, preceded on first launch by the avatar builder. No open decisions remain.

---

## Working notes for Claude Code

- This spec is the source of truth. If a request conflicts with it, flag the conflict rather than picking a side.
- Nothing in Classification rules or Routine engine may be enumerated as a fixed list in code. Category,
  sub-class, routine placement, intake options, reaction checklists, and mood vocabulary are derived at runtime
  through the AI layer. Any list in this document is illustrative only.
- Intake option pools must be broad. A short list plus an 'other' button does not satisfy the requirement.

### Icons
- Roughly half the set is hand-drawn inline SVG on a 24 grid, 1.6 stroke, using currentColor. The rest comes
  from @phosphor-icons/web 2.1.2. Never emoji. Never approximate a concept with an unrelated object.
- Route ALL icon rendering through one helper that checks the custom set first, then the icon font.
- Assignment for new products is AI SELECTION from the existing set, never AI generation. Generated vector art
  fails at icon scale. If nothing fits, the model says so and proposes what a new mark should depict.
- Three silent failure modes, all real:
  1. An unknown font-icon name renders as blank space.
  2. A name reaching output unwrapped renders as its own text — the UI shows 'hand-soap' where an icon belongs.
     Happens when names travel via variables, arrays, or object properties.
  3. An icon written inline at a call site never enters the registry, so it passes a registry-only uniqueness
     check while still colliding on screen.
- Verify by rendering: build the DOM, extract every icon reference, confirm each resolves to either the custom
  set or the installed package, assert no raw name appears as text, assert SVG tags balance.

### Everything else
- The safety layer stays fully deterministic. AI maintains reference data; AI never makes the pass/fail call.
- Health Connect is read-only and the sole broker. Never integrate a manufacturer SDK directly.
- Every wearable-derived feature must degrade cleanly to absent when no device is connected.
- Seed no inventory. The app starts empty except prescriptions confirmed during intake.
- Every text input requires voice capture; every transcription is reviewable before commit.
- Every readable element requires a read-aloud control when the global setting is on.
- Interface copy is written in the app's voice everywhere. Any plain-English label is unfinished work.
- Builder and intake selections must persist across screens. Reverting to a default is a defect.