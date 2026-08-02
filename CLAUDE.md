Title: Live Content

Description: Fetched live

Source: https://raw.githubusercontent.com/LilithLucifer3x6/apothecary-lounge/87b701f9d6a03da8342a478e5e068260742e0837/CLAUDE.md

---

# The Apothecary Lounge — Project Specification

> **How to use this file.** This is the standing spec. Point your assistant at it at the start of
> every session. If it is not read automatically, paste the RULES block below into the first message.

---

## RULES — read before writing any code

1. **Stack is fixed.** Vite + React. Supabase (Postgres). Vercel for web. Capacitor for Android.
   **Not Next.js with SSR** — Capacitor cannot wrap a server-rendered app. If Next.js is already in
   use, it must be set to static export.
2. **Never hardcode a list.** Product categories, sub-classes, routine order, intake options,
   reaction checkboxes, and moods are all derived at runtime by AI. Every list in this document is an
   example, never a permitted set.
3. **Routines read all on-hand inventory.** Stocked, Ebbing, and Enshrined all appear. Only Banished
   and Hollow are excluded. Enshrined is a verdict earned at the end of a product's life, not a gate.
4. **Conflicts reschedule, they do not forbid.** Move a product to a slot where it works. Only a
   Codex match or a real hazard removes something.
5. **Conflicts are checked by application zone.** Two products only clash if their zones overlap or
   sit adjacent. Underarm astringent does not conflict with a facial retinoid.
6. **The safety layer is deterministic code.** AI maintains the reference data. AI never makes the
   pass/fail call.
7. **Seed nothing.** The app starts empty except prescriptions confirmed at intake.
8. **Every text input takes voice.** Every transcription is reviewable before commit.
9. **Every visible string is in voice.** Amend not Edit. Strike from the record not Delete. Product
   categories stay plain because they must stay scannable.
10. **Never show spec vocabulary.** load-bearing, requires-rinse, layering weight, partner-assisted
    are internal terms. Translate before display.
11. **Icons are drawn, never emoji.** Phosphor for functional marks, game-icons for ritual marks, and
    AI draws an inline SVG when neither is exact. Resemblance to the real object is the standard.
12. **Health Connect is read-only and the only broker.** Never call a manufacturer SDK directly.
13. **Everything degrades cleanly.** No wearable connected means those features simply do not appear.
14. **Prescriptions are always named with strength.** Never a generic label.
15. **No streaks, no guilt, no notifications** except the two restock nudges.

## BUILD ORDER — finish each phase before starting the next

1. Scaffold, Supabase schema, persistence. Nothing visual.
2. Rootwork: item model, lifecycle states, manual entry. Usable with typed input alone.
3. Routine engine and deterministic safety layer. Still no AI.
4. Screens, voice, icons, ornament.
5. AI layer: intake conversation, photo intake, the Scrying Pool.
6. Wearables, calendar, polish.

## VERIFY BEFORE CALLING ANYTHING DONE

- Render the DOM and assert: no duplicate icon values, no icon name resolving to neither library nor
  the custom set, no invalid font names, no raw icon name appearing as text.
- Grep rendered output for generic UI words (Save, Delete, Edit, Submit, Options, Filter, Sort).
  Any hit is unfinished copy.
- Confirm no product name, category list, or routine order appears as a literal in engine code.

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
+

## 8. Icons

Every icon is unique across the entire application . No two categories, sub-classes, tools, tasks, routines, or rituals share one. Uniqueness is enforced against a live registry at assignment time; when the obvious choice is taken, AI selects the next most functionally apt symbol rather than reusing.
- Glyphs must be legible at small size and must map to function, not to a word in the name. A tool called a cap does not receive a baseball cap. A lotion warmer does not receive a plant. Extractions receive tweezers, not a sewing needle.
- Glyphs are a custom icon set, not Unicode emoji. Emoji is a closed vocabulary of roughly three thousand seven hundred characters containing no tweezers, no skipping rope, no contact lens, no bonnet, and no dropper, so a system requiring a unique apt mark for every category cannot be built on it. Emoji also renders differently on every platform and reads bright and cartoonish, working against the intended aesthetic.
- Two sets are combined. Phosphor or Tabler supplies interface chrome — settings, confirmation, navigation, arrows — at several thousand icons under permissive licence. A fantasy set such as game-icons.net supplies the ritual and product marks: cauldrons, vessels, mortar and pestle, herbs, scrolls, tweezers, droppers, and the silver coin the Silver Toll wants and Unicode does not have. Icons are inline SVG, so every mark is recoloured to the palette, follows the chosen line weight, and scales with the user's text size. This is what makes them more legible than emoji rather than merely more numerous: a drawn mark can be made to mean one thing clearly, at the size and colour the rest of the interface uses.
- Any emoji appearing in a mockup is a stand-in for a drawn icon, never the specification.
- Confirmed libraries. Phosphor Icons supplies 1,512 icons in six weights under MIT licence, delivered as a web font or inline SVG, and covers the functional vocabulary: eyedropper, flask, test tube, syringe, jar, spray bottle, hand soap, towel, tooth, bathtub, shower, hair dryer, shield, crown, hourglass, coins, scroll, cooking pot. Verified names only — an unrecognised name renders as nothing, so every icon is checked against the package before use. Phosphor lacks razor, mirror, candle, tweezers, herb, potion, and contact lens. A fantasy set — game-icons.net under CC BY, or Shikashi's pack — supplies those along with cauldrons, mortar and pestle, tied and open scrolls, and bronze, silver, and gold coin stacks, the last of which resolves the Silver Toll where neither Unicode nor Phosphor can. Where a concept exists in neither, it is commissioned rather than approximated.
- Verified integration details. The package is @phosphor-icons/web, version 2.1.2. Stylesheets live at src/duotone/style.css and src/regular/style.css within the package. The class convention is two classes together — the weight class and the icon class, as in ph-duotone ph-flask. In a bundled build this is an npm install rather than a CDN link.
- All icon rendering passes through a single helper that takes a name and returns markup. Nothing constructs icon markup inline, and nothing interpolates a bare icon name into output. This is not a style preference: it is the only way to guarantee a name cannot escape unrendered.
- Two distinct failure modes, both silent, both caught by rendering rather than by reading code. An unknown icon name renders as an empty space. A name that reaches output without being wrapped in markup renders as its own text, so the interface displays the literal words hand-soap or eyedropper where a mark belongs. The second is more common when names are passed through variables, arrays, or object properties rather than written directly. 
- Verification is by rendering, not inspection: assemble the interface, extract every icon class from the output, check each against the installed package, and check that no raw icon name appears as text. A build that passes a name check but has never been rendered has verified nothing. Uniqueness is checked against rendered output, not against the registry alone. An icon written inline at a call site never enters the registry and so passes a registry-only check while still colliding on screen. Every icon must come from the registry, and the verification pass must confirm that no icon appears in output that the registry does not contain. Concepts Phosphor lacks entirely, requiring the fantasy set or commissioned artwork: toothbrush, tweezers, razor, mirror, candle, contact lens, herb, potion, clay or mud vessel, and a silver coin. Approximation is not acceptable where the concept has a recognisable form. Any mark that requires explanation is drawn instead: a small inline SVG on the icon set's grid and stroke weight, taking its colour from the surrounding text so it inherits the palette and the user's chosen size like every other mark. Roughly half the set is drawn on this basis — cleanser tube, toner bottle, cream jar, prescription tube, ointment tube, roll-on, contact lens, tweezers, heated eye mask, dropper bottle, satin bonnet, spot patch, skipping rope, locs, lacquered nail, depilatory tube, razor, hand mirror, mortar and pestle, urn, steamer, altar, scrying bowl, grimoire, water glass, face, toothbrush, and mask jar. Drawn marks sit in the same registry under the same uniqueness rule, and the general set is used wherever it genuinely fits. 
- Icon assignment for a new product is AI-assisted selection, not AI generation. The model chooses the best mark from the existing set and, where nothing fits, says so and proposes what a new mark should depict rather than inventing one. Generated vector art is unreliable at icon scale and produces shapes that do not read; selection from a curated set is both accurate and effectively free. A proposed new mark is drawn once and added to the set, so the vocabulary grows deliberately. Icon generation is an AI responsibility at the moment a product is added, not a design task performed once. When an item enters Rootwork, the system first seeks an exact match in the installed libraries. Where no apt mark exists — and for most cosmetic objects none does — AI generates a simple line drawing as inline SVG on the same twenty-four unit grid and stroke weight as the rest, using currentColor so it inherits palette and text size. The generated mark is stored with the item, entered in the registry, and checked for uniqueness like any other. The standard is resemblance to the object itself. A cleanser is a pump bottle, an ointment is a squeezed tube, a nail lacquer is a lacquer bottle with its brush. An unrelated object that shares a word or a vague shape is not acceptable — a paint brush is not a toothbrush and a paint bucket is not a mask. Where an existing library icon is genuinely exact, it is used unchanged.

## 9. Composite items

Some items are blends the user compounds. Two exist today: a bath soak of whole milk powder, orange peel powder, rose petals powder, and epsom salts, ground together and dispensed by the scoop; and a scalp oil of olive, black castor, rosemary, and rose oils.
- Entry is through a dedicated action beside photograph and search, labelled in the application's voice rather than as DIY.
- The flow collects: a name; two ingredient fields with an option to add more; the batch creation date; and the form of the blend — oil, liquid, powder, balm, or other.
- Ingredients and form together determine shelf life. Dry goods degrade too, and food-grade components such as milk powder carry real limits. AI estimates viable life from composition and form; the estimate is shown with its reasoning and is editable.
- A composite stores its component items and proportions. A Compound action deducts from components and creates or refills the composite.
- Components and composite deplete on separate clocks: components empty when a batch is made, the composite empties as it is used.
- The ingredient list is the union of components. All safety checks run against that union, and the composite inherits any component's flags.
- A composite carries its own application zone and can be added to any Altar.
- Composites are evaluated by the Scrying Pool at both levels: the blend as a ritual, and components individually.

## 10. Lifecycle states

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
  - Records the opened date and starts the period-after-open

