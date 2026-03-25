import { useState, useEffect, useCallback, useMemo } from "react";

// ─── USERS ───────────────────────────────────────────────────
const USERS = [
  { id: "mgr1", name: "Admin Manager", email: "admin", password: "admin", role: "manager" },
  { id: "rep1", name: "Jake Morrison", email: "jake", password: "1234", role: "rep" },
  { id: "rep2", name: "Sarah Chen", email: "sarah", password: "1234", role: "rep" },
  { id: "rep3", name: "Mike Davis", email: "mike", password: "1234", role: "rep" },
];

// ─── SEED DATA ───────────────────────────────────────────────
const TASK_TYPES = ["Quote Order", "Email Information", "Send Samples", "Schedule Meeting", "Follow Up Call", "Send Catalog", "Site Visit", "Other"];
const EXPENSE_CATS = ["Client Meal", "Hotel", "Travel", "Supplies", "Entertainment", "Other"];
const MAINT_TYPES = ["Oil Change", "Tire Rotation", "Tires", "Brakes", "Repair", "Inspection", "Wash/Detail", "Other"];
const PRODUCT_LINES = ["Vents", "Wraps/Boots/Pipes", "Scuppers & Drains", "Edge Metal", "Corners & T-Joints", "Sealant Pockets", "Cylindrical Split Pipe", "Coping Metal", "Roof Drains", "EZ PV Mounts", "Accessories", "Custom/Other"];

const seedContacts = [
  // ── SAN DIEGO COUNTY — Roofing Contractors ──
  { id: "ct1", repId: "rep1", company: "Roofing Specialists of San Diego", name: "", title: "Owner", phone: "(858) 268-2888", email: "", address: "San Diego, CA", notes: "Residential & commercial. Comp shingles, flat roofing, tile. Good candidate for TPO wraps, boots, and scuppers", created: "2026-01-05" },
  { id: "ct2", repId: "rep1", company: "RSI Roofing", name: "", title: "", phone: "(858) 271-2880", email: "", address: "Kearny Mesa, San Diego, CA", notes: "In business since 1993. Re-roofing, roof maintenance, 24/7 leak service. Centrally located in Kearny Mesa", created: "2026-01-10" },
  { id: "ct3", repId: "rep1", company: "TWM Roofing Inc.", name: "", title: "", phone: "(858) 277-3867", email: "", address: "San Diego, CA", notes: "40+ years. #1 in CA for GACO silicone coatings. TPO, torch, fluid applied. 3M+ sqft commercial installed. Also serves LA County", created: "2026-01-15" },
  { id: "ct4", repId: "rep1", company: "RC Roofing Inc.", name: "Rick", title: "Owner", phone: "(619) 276-1700", email: "", address: "San Diego, CA", notes: "In business since 1992. High quality resi & commercial. Serves Chula Vista, La Jolla, and all SD County", created: "2026-01-18" },
  { id: "ct5", repId: "rep1", company: "TAG Roofing & Solar", name: "", title: "", phone: "(619) 562-1700", email: "", address: "San Diego, CA", notes: "Since 1988. GAF Master Elite contractor. Dual-licensed. Resi, commercial, HOA. Also serves SW Riverside County", created: "2026-01-20" },
  { id: "ct6", repId: "rep1", company: "Peak Builders & Roofers", name: "", title: "", phone: "(619) 428-0202", email: "", address: "San Diego, CA", notes: "Residential & commercial. GAF & Owens Corning shingles. Full replacements & repairs. Also does remodeling", created: "2026-01-22" },
  { id: "ct7", repId: "rep1", company: "Christian Roofing Inc.", name: "", title: "", phone: "(619) 354-2984", email: "", address: "San Diego County, CA", notes: "25+ years. Metal roofing, tile, shingles. Tesla-certified solar. English & Spanish crews. 10-yr workmanship warranty", created: "2026-01-25" },
  { id: "ct8", repId: "rep1", company: "Ascent Roofing", name: "Josue Macias", title: "Owner", phone: "(760) 412-6595", email: "", address: "San Diego County, CA", notes: "Family owned. Resi & commercial. Shingles, tile, flat/modified bitumen. Serve homeowners, HOAs, commercial", created: "2026-02-01" },
  { id: "ct9", repId: "rep1", company: "California First Roofing", name: "", title: "", phone: "(858) 505-2955", email: "", address: "San Diego, CA", notes: "345+ 5-star reviews. Resi & commercial. Serves La Jolla, Chula Vista, Carlsbad, Oceanside. 24/7 emergency", created: "2026-02-05" },
  { id: "ct10", repId: "rep1", company: "Alma Roofing", name: "", title: "", phone: "", email: "", address: "San Diego, CA", notes: "Fully licensed & insured. High-end materials, long-term durability focus", created: "2026-02-10" },

  // ── LOS ANGELES COUNTY — Roofing Contractors ──
  { id: "ct11", repId: "rep2", company: "Stone Roofing Company", name: "", title: "", phone: "(800) 317-8663", email: "", address: "Azusa, CA (Los Angeles County)", notes: "90+ years in business. Full-service commercial. TPO, PVC, Title 24 cool roofing. Serves LA, OC, SD, Riverside, San Bernardino", created: "2026-01-08" },
  { id: "ct12", repId: "rep2", company: "AAA Roofing", name: "", title: "", phone: "(323) 570-3021", email: "", address: "Los Angeles, CA", notes: "35+ years commercial. 150M+ sqft installed. TPO, PVC, mod bit, built-up, single-ply, EPDM, coatings, metal. 24/7 emergency", created: "2026-01-12" },
  { id: "ct13", repId: "rep2", company: "Central Roofing", name: "", title: "", phone: "(310) 527-6770", email: "", address: "Los Angeles / Orange County, CA", notes: "30+ years commercial. Serves LA & OC. Leak detection, silicone coatings, repairs, restorations. Family values", created: "2026-01-14" },
  { id: "ct14", repId: "rep2", company: "J and J Roofing", name: "", title: "", phone: "(800) 400-7663", email: "", address: "Los Angeles, CA", notes: "25+ years. 300+ years combined crew experience. Shingles, tile, TPO, PVC, torchdown, silicone & acrylic systems", created: "2026-01-20" },
  { id: "ct15", repId: "rep2", company: "Bilt-Well Roofing", name: "", title: "", phone: "(323) 254-2301", email: "", address: "Los Angeles, CA", notes: "Family owned since 1936. 90+ years. Serves LA, Ventura, Orange counties. Resi, commercial, solar. Also does decking", created: "2026-01-25" },
  { id: "ct16", repId: "rep2", company: "Kayhan's Roofing", name: "Omid", title: "Owner", phone: "(805) 558-3556", email: "", address: "Los Angeles / Thousand Oaks, CA", notes: "LA & Ventura County. Shingle replacement, flat roof sealing, tile. Serves Sherman Oaks, Beverly Hills, Calabasas", created: "2026-02-01" },

  // ── ORANGE COUNTY — Roofing Contractors ──
  { id: "ct17", repId: "rep2", company: "Guardian Roofs", name: "", title: "", phone: "(714) 633-3619", email: "", address: "Orange, CA (Orange County)", notes: "Since 1984. 300+ 5-star reviews. Owens Corning Platinum Preferred, GAF Master Elite. Resi & commercial. 36+ years", created: "2026-01-15" },
  { id: "ct18", repId: "rep2", company: "Pacific Roofing Systems", name: "", title: "", phone: "(949) 612-3788", email: "", address: "Orange County, CA", notes: "Resi & commercial. CertainTeed, Owens Corning, GAF. Shingles, tile, metal, coatings, solar-ready. Free contractor guide", created: "2026-02-05" },
  { id: "ct19", repId: "rep2", company: "CalCom Roofing Inc.", name: "", title: "", phone: "(714) 515-6085", email: "", address: "Orange County, CA", notes: "3rd generation. 80+ year heritage. Commercial specialist. High-rise, multi-family. Serves OC, Riverside, LA. $5M liability insurance", created: "2026-02-10" },
  { id: "ct20", repId: "rep3", company: "Above It All Roofing", name: "", title: "", phone: "(949) 395-1300", email: "", address: "Orange County, CA", notes: "Veteran-owned. 27+ years. Resi roofing & repairs. Tailored solutions per home/budget. Clean jobsites", created: "2026-02-12" },
  { id: "ct21", repId: "rep3", company: "Prestige Roofing & Solar", name: "John Arellano", title: "Owner", phone: "(714) 867-5070", email: "", address: "Orange County, CA", notes: "Serves OC, LA, Riverside. Resi & commercial. All major roof systems. Also does solar. Lic #1059050", created: "2026-02-15" },
  { id: "ct22", repId: "rep3", company: "Meyers Roofing Co.", name: "", title: "", phone: "(562) 247-5241", email: "", address: "Southern California", notes: "Serves LA, OC, Long Beach, Santa Ana, Anaheim. Resi & commercial. Asphalt, tile, TPO. Storm damage restoration", created: "2026-02-18" },

  // ── RIVERSIDE COUNTY — Roofing Contractors ──
  { id: "ct23", repId: "rep3", company: "Rocket Roofing", name: "", title: "", phone: "(951) 710-7324", email: "", address: "27555 Ynez Rd Suite 110, Temecula, CA 92591", notes: "Serves Riverside, OC, San Bernardino, LA, SD. Resi & commercial. Inspections, repairs, maintenance", created: "2026-01-10" },
  { id: "ct24", repId: "rep3", company: "619 Roofing", name: "", title: "", phone: "(619) 304-4868", email: "", address: "Riverside / Orange / San Bernardino County, CA", notes: "#1 choice of HOAs, realtors, commercial & resi owners. Tile with 2-layer UDL, 30-yr warranty. 24/7 emergency", created: "2026-02-20" },
  { id: "ct25", repId: "rep3", company: "Infinity Roofers Inc.", name: "", title: "", phone: "(805) 855-8733", email: "", address: "Ventura / LA / OC / Riverside / San Bernardino", notes: "Resi & commercial. Asphalt shingle, flat, tile & metal roofs. Inspections. Diamond Certified", created: "2026-02-22" },

  // ── DISTRIBUTORS — All Counties ──
  { id: "ct26", repId: "rep1", company: "ABC Supply Co. — San Diego", name: "", title: "Branch Manager", phone: "(858) 278-8666", email: "", address: "San Diego, CA", notes: "DISTRIBUTOR — Largest wholesale roofing distributor in US. ~800 branches. Shingles, metal, single-ply, insulation, accessories", created: "2026-01-05" },
  { id: "ct27", repId: "rep2", company: "ABC Supply Co. — San Juan Capistrano", name: "", title: "Branch Manager", phone: "", email: "", address: "San Juan Capistrano, CA (Orange County)", notes: "DISTRIBUTOR — New location. Full line roofing, siding, windows, gutters. Serves south OC contractors", created: "2026-03-01" },
  { id: "ct28", repId: "rep1", company: "QXO / Beacon — San Diego (Kearny Villa)", name: "", title: "Branch Manager", phone: "(858) 279-5444", email: "", address: "5660 Kearny Villa Rd, San Diego, CA 92123", notes: "DISTRIBUTOR — Formerly Beacon Roofing Supply. Full line resi & commercial. Owens Corning, GAF, CertainTeed, Carlisle", created: "2026-01-08" },
  { id: "ct29", repId: "rep1", company: "QXO / Beacon — El Cajon", name: "", title: "Branch Manager", phone: "(619) 258-0022", email: "", address: "396 Raleigh Ave, El Cajon, CA 92020", notes: "DISTRIBUTOR — Serves east SD County: El Cajon, Santee, Lakeside, La Mesa, Spring Valley, Lemon Grove", created: "2026-01-10" },
  { id: "ct30", repId: "rep2", company: "QXO / Beacon — Orange", name: "", title: "Branch Manager", phone: "(714) 289-0044", email: "", address: "675 N Batavia St, Orange, CA 92868", notes: "DISTRIBUTOR — Serves OC: Orange, Santa Ana, Anaheim, Tustin, Huntington Beach, Newport, Costa Mesa, Irvine, Mission Viejo", created: "2026-01-12" },
  { id: "ct31", repId: "rep3", company: "QXO / Beacon — Norco (Riverside)", name: "", title: "Branch Manager", phone: "(951) 340-0607", email: "", address: "1606 Hamner Ave, Norco, CA 92860", notes: "DISTRIBUTOR — Serves Riverside County & Inland Empire contractors", created: "2026-01-15" },
  { id: "ct32", repId: "rep1", company: "RWC Building Products — Spring Valley", name: "", title: "Branch Manager", phone: "(619) 460-5200", email: "", address: "Spring Valley, CA (San Diego County)", notes: "DISTRIBUTOR — Leading SD County roofing supplier. Resi & commercial materials. Near CA-125. Roofing products only", created: "2026-01-18" },
  { id: "ct33", repId: "rep1", company: "SRS Building Products — San Diego", name: "", title: "Branch Manager", phone: "(858) 549-6959", email: "", address: "San Diego, CA", notes: "DISTRIBUTOR — Part of SRS Distribution (430+ branches nationwide). Asphalt, tile, metal, commercial. Major manufacturers", created: "2026-01-20" },
  { id: "ct34", repId: "rep2", company: "SRS Distribution — Los Angeles", name: "", title: "Branch Manager", phone: "", email: "", address: "Los Angeles, CA", notes: "DISTRIBUTOR — Fastest growing building products distributor in US. Full line roofing from all major manufacturers", created: "2026-01-22" },
  { id: "ct35", repId: "rep1", company: "RoofLine Supply & Delivery — San Diego", name: "", title: "Branch Manager", phone: "(619) 284-8611", email: "", address: "San Diego, CA", notes: "DISTRIBUTOR — Local roofing supply. Good selection, competitive pricing. Delivery available", created: "2026-02-01" },
];

const seedCalls = [
  { id: "cl1", repId: "rep1", contactId: "ct1", date: "2026-03-20", time: "10:00", who: "Eric", what: "Discussed pipe boots and scuppers for a new warehouse project they're bidding. Need TPO wraps for 30+ pipe penetrations and 4 scuppers.", where: "Their office - San Diego", productsDiscussed: "Wraps/Boots/Pipes,Scuppers & Drains", outcome: "Sending quote today", followUp: "Call back Thursday to review pricing" },
  { id: "cl2", repId: "rep1", contactId: "ct7", date: "2026-03-22", time: "14:00", who: "", what: "Interested in our prefab vent flashings and sealant pockets for residential re-roofs. They do a lot of TPO work and want to speed up installs.", where: "Phone call", productsDiscussed: "Vents,Sealant Pockets,Accessories", outcome: "Very interested - wants product catalog and pricing", followUp: "Ship sample kit and full catalog" },
  { id: "cl3", repId: "rep2", contactId: "ct11", date: "2026-03-19", time: "09:00", who: "", what: "Reviewed specs for large mixed-use project. Need custom edge metal, corner pieces, and T-joints. They do massive commercial jobs - potential ongoing account.", where: "Zoom call", productsDiscussed: "Edge Metal,Corners & T-Joints,Custom/Other", outcome: "Sending revised quote with custom specs", followUp: "Follow up Monday on approval" },
  { id: "cl4", repId: "rep3", contactId: "ct23", date: "2026-03-21", time: "11:30", who: "", what: "They service Riverside, OC, and SD counties. Looking for prefab roof drains and cylindrical split pipe for commercial flat roofs.", where: "Lunch meeting - Temecula", productsDiscussed: "Roof Drains,Cylindrical Split Pipe,Accessories", outcome: "Putting together a contractor package quote", followUp: "Email volume pricing sheet by Friday" },
  { id: "cl5", repId: "rep1", contactId: "ct28", date: "2026-03-18", time: "08:30", who: "", what: "Visited their Kearny Villa branch. Discussed getting Flash-Tech products stocked. They carry GAF, CertainTeed, Carlisle - our prefab accessories would complement their line.", where: "Their branch - 5660 Kearny Villa Rd", productsDiscussed: "Vents,Wraps/Boots/Pipes,Scuppers & Drains,Edge Metal", outcome: "They want product spec sheets and pricing matrix", followUp: "Send full product catalog and distributor pricing proposal" },
  { id: "cl6", repId: "rep2", contactId: "ct19", date: "2026-03-17", time: "10:00", who: "", what: "3rd-gen commercial specialist. Interested in our EZ PV Mounts for solar retrofit projects and coping metal for high-rise work.", where: "Phone call", productsDiscussed: "EZ PV Mounts,Coping Metal,Edge Metal", outcome: "Wants to tour our manufacturing facility in El Cajon", followUp: "Schedule plant tour for next week" },
];

const seedTasks = [
  { id: "t1", repId: "rep1", contactId: "ct1", type: "Quote Order", title: "Quote TPO wraps for 30+ pipes + 4 scuppers - warehouse project", due: "2026-03-20", priority: "high", status: "overdue", notes: "Include freight to San Diego jobsite" },
  { id: "t2", repId: "rep1", contactId: "ct7", type: "Send Samples", title: "Ship vent flashing sample kit + catalog to Christian Roofing", due: "2026-03-25", priority: "medium", status: "pending", notes: "Include sealant pockets and product spec sheets" },
  { id: "t3", repId: "rep2", contactId: "ct11", type: "Quote Order", title: "Revised quote - custom edge metal & T-joints for Stone Roofing", due: "2026-03-21", priority: "high", status: "overdue", notes: "Mixed-use project, custom corners, confirm 2-3 day ship time" },
  { id: "t4", repId: "rep2", contactId: "ct19", type: "Schedule Meeting", title: "Set up plant tour for CalCom Roofing - El Cajon facility", due: "2026-03-28", priority: "medium", status: "pending", notes: "Show CNC cutting, prefab line, and EZ PV Mount assembly" },
  { id: "t5", repId: "rep3", contactId: "ct23", type: "Email Information", title: "Email contractor volume pricing to Rocket Roofing", due: "2026-03-24", priority: "high", status: "pending", notes: "Roof drains, cylindrical split pipe, accessories" },
  { id: "t6", repId: "rep1", contactId: "ct28", type: "Send Catalog", title: "Send full product catalog + distributor pricing to QXO/Beacon SD", due: "2026-03-26", priority: "high", status: "pending", notes: "Key distributor - could stock Flash-Tech in their SD branches" },
  { id: "t7", repId: "rep1", contactId: "ct32", type: "Follow Up Call", title: "Follow up with RWC Building Products on stocking agreement", due: "2026-03-27", priority: "medium", status: "pending", notes: "Leading SD County roofing supplier - big distribution opportunity" },
  { id: "t8", repId: "rep2", contactId: "ct12", type: "Quote Order", title: "Quote EZ PV Mounts + coping metal for AAA Roofing", due: "2026-03-29", priority: "medium", status: "pending", notes: "Solar retrofit on commercial building. 150M+ sqft installed - volume account potential" },
];

const seedEvents = [
  { id: "ev1", repId: "rep1", date: "2026-03-26", time: "09:00", endTime: "10:00", title: "Follow-up call - Roofing Specialists of SD", type: "call", contactId: "ct1", notes: "Review warehouse quote" },
  { id: "ev2", repId: "rep1", date: "2026-03-28", time: "12:00", endTime: "13:30", title: "Lunch meeting - Christian Roofing", type: "meeting", contactId: "ct7", notes: "Bring metal shingle samples" },
  { id: "ev3", repId: "rep2", date: "2026-03-25", time: "10:00", endTime: "11:00", title: "Zoom - Stone Roofing custom specs review", type: "call", contactId: "ct11", notes: "Review revised quote" },
  { id: "ev4", repId: "rep2", date: "2026-03-28", time: "14:00", endTime: "16:00", title: "Plant tour - CalCom Roofing @ El Cajon", type: "meeting", contactId: "ct19", notes: "Show CNC cutting, prefab line, EZ PV Mount assembly" },
  { id: "ev5", repId: "rep3", date: "2026-03-27", time: "08:00", endTime: "09:00", title: "Site visit - Rocket Roofing jobsite", type: "site_visit", contactId: "ct23", notes: "TPO drain install demo - Temecula area" },
  { id: "ev6", repId: "rep1", date: "2026-04-02", time: "09:00", endTime: "17:00", title: "Western Roofing Expo - San Diego", type: "trade_show", contactId: "", notes: "Booth 412 - bring full product line samples" },
  { id: "ev7", repId: "rep1", date: "2026-03-31", time: "10:00", endTime: "11:30", title: "QXO/Beacon branch visit - Kearny Villa", type: "meeting", contactId: "ct28", notes: "Present distributor partnership proposal" },
  { id: "ev8", repId: "rep2", date: "2026-04-01", time: "09:00", endTime: "10:00", title: "Call - Guardian Roofs product intro", type: "call", contactId: "ct17", notes: "Introduce Flash Tech metal line to their purchasing team" },
];

const seedFuel = [
  { id: "f1", repId: "rep1", date: "2026-03-18", gallons: 12.5, pricePerGal: 3.89, total: 48.63, mileage: 45230, station: "Shell - Main St" },
  { id: "f2", repId: "rep1", date: "2026-03-22", gallons: 14.2, pricePerGal: 3.95, total: 56.09, mileage: 45612, station: "Chevron - Hwy 101" },
  { id: "f3", repId: "rep2", date: "2026-03-20", gallons: 11.8, pricePerGal: 3.79, total: 44.72, mileage: 32100, station: "BP - Oak Ave" },
];

const seedMaint = [
  { id: "m1", repId: "rep1", date: "2026-03-15", type: "Oil Change", cost: 65.00, mileage: 45100, vendor: "Jiffy Lube", notes: "Full synthetic" },
  { id: "m2", repId: "rep2", date: "2026-03-10", type: "Tire Rotation", cost: 40.00, mileage: 31800, vendor: "Discount Tire", notes: "" },
];

const seedExpenses = [
  { id: "e1", repId: "rep1", date: "2026-03-19", amount: 85.50, category: "Client Meal", who: "Roofing Specialists of SD", what: "Business lunch - discussed warehouse project standing seam quote", where: "The Capital Grille, San Diego", receipt: true },
  { id: "e2", repId: "rep1", date: "2026-03-21", amount: 249.00, category: "Hotel", who: "Self", what: "Overnight for north county client meetings - Christian Roofing & TAG Roofing", where: "Marriott Oceanside", receipt: true },
  { id: "e3", repId: "rep2", date: "2026-03-20", amount: 42.00, category: "Client Meal", who: "Stone Roofing Company", what: "Coffee meeting to review custom fab specs", where: "Starbucks Reserve, Azusa", receipt: true },
  { id: "e4", repId: "rep3", date: "2026-03-22", amount: 150.00, category: "Supplies", who: "Self", what: "Sample boards and presentation materials for Rocket Roofing meeting", where: "FedEx Office, Temecula", receipt: true },
  { id: "e5", repId: "rep2", date: "2026-03-18", amount: 67.00, category: "Client Meal", who: "CalCom Roofing", what: "Lunch meeting - intro to Flash Tech product line", where: "El Torito, Anaheim", receipt: true },
];

// ─── UTILITY ─────────────────────────────────────────────────
const uid = () => Math.random().toString(36).slice(2, 10);
const fmt = (n) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
const fmtDate = (d) => { if (!d) return ""; const dt = new Date(d + "T00:00:00"); return dt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }); };
const fmtShort = (d) => { if (!d) return ""; const dt = new Date(d + "T00:00:00"); return dt.toLocaleDateString("en-US", { month: "short", day: "numeric" }); };
const today = () => new Date().toISOString().split("T")[0];
const isOverdue = (due) => due < today();
const dayName = (d) => new Date(d + "T00:00:00").toLocaleDateString("en-US", { weekday: "short" });

// ─── SVG ICONS ───────────────────────────────────────────────
const I = ({ d, s = 18, c = "currentColor" }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>
);
const IC = {
  phone: "M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.79 19.79 0 012.12 4.18 2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z",
  task: "M9 11l3 3L22 4M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11",
  car: "M5 17h14M5 17a2 2 0 01-2-2V9l2.5-5h13L21 9v6a2 2 0 01-2 2M5 17a2 2 0 002 2h1a2 2 0 002-2M14 17a2 2 0 002 2h1a2 2 0 002-2",
  dollar: "M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6",
  report: "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8",
  users: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75",
  contacts: "M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z",
  alert: "M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01",
  plus: "M12 5v14M5 12h14",
  check: "M20 6L9 17l-5-5",
  x: "M18 6L6 18M6 6l12 12",
  edit: "M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z",
  logout: "M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9",
  print: "M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2M6 14h12v8H6z",
  calendar: "M19 4H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2zM16 2v4M8 2v4M3 10h18",
  home: "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z",
  trash: "M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2",
  bell: "M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0",
  clock: "M12 6v6l4 2M12 22a10 10 0 100-20 10 10 0 000 20z",
  map: "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0zM12 13a3 3 0 100-6 3 3 0 000 6z",
  chevL: "M15 18l-6-6 6-6",
  chevR: "M9 18l6-6-6-6",
  bldg: "M3 21h18M9 21V6l-6 3v12M9 6l6-3v18M9 8h.01M9 11h.01M9 14h.01M15 8h.01M15 11h.01M15 14h.01",
};

// ─── CSS ─────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap');
:root {
  --bg:#0A0C0F; --bg2:#111418; --bg3:#191D23; --bg4:#22272F;
  --border:#2A3038; --text:#E8EAED; --text2:#9BA3B0; --text3:#636B78;
  --accent:#39B54A; --accent2:#2E9A3E; --accent-s:rgba(57,181,74,.14);
  --green:#39B54A; --green-s:rgba(57,181,74,.14);
  --red:#EF4444; --red-s:rgba(239,68,68,.12);
  --yellow:#EAB308; --yellow-s:rgba(234,179,8,.12);
  --purple:#A855F7; --purple-s:rgba(168,85,247,.12);
  --orange:#F97316; --orange-s:rgba(249,115,22,.12);
  --cyan:#06B6D4; --cyan-s:rgba(6,182,212,.12);
  --silver:#C0C4CC;
  --r:8px; --sh:0 4px 20px rgba(0,0,0,.4);
}
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Inter',sans-serif;background:var(--bg);color:var(--text)}
.app{display:flex;height:100vh;overflow:hidden}

/* SIDEBAR */
.sb{width:250px;background:var(--bg2);border-right:1px solid var(--border);display:flex;flex-direction:column;flex-shrink:0}
.sb-brand{padding:20px;border-bottom:1px solid var(--border);background:linear-gradient(180deg,rgba(57,181,74,.06) 0%,transparent 100%)}
.sb-brand h1{font-family:'JetBrains Mono',monospace;font-size:15px;color:var(--accent);letter-spacing:-.5px}
.sb-brand h1 .ft-t{color:var(--accent);font-weight:800}
.sb-brand .sub{font-size:9px;color:var(--text3);margin-top:3px;text-transform:uppercase;letter-spacing:2px;font-weight:600}
.sb-user{padding:14px 20px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px}
.sb-user .av{width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,var(--accent),#1B7A28);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;color:#fff;flex-shrink:0}
.sb-user .nm{font-size:13px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sb-user .rl{font-size:10px;color:var(--text3);text-transform:uppercase;letter-spacing:.5px}
.sb-nav{flex:1;padding:10px 8px;overflow-y:auto}
.sb-nav .sec{font-size:9px;color:var(--text3);text-transform:uppercase;letter-spacing:1.5px;padding:16px 12px 6px;font-weight:700}
.ni{display:flex;align-items:center;gap:10px;padding:9px 12px;border-radius:7px;cursor:pointer;font-size:13px;font-weight:500;color:var(--text2);transition:all .15s;position:relative}
.ni:hover{background:var(--bg3);color:var(--text)}
.ni.act{background:var(--accent-s);color:var(--accent)}
.ni .bdg{position:absolute;right:8px;background:var(--red);color:#fff;font-size:10px;font-weight:700;padding:1px 6px;border-radius:10px}
.sb-ft{padding:10px 8px;border-top:1px solid var(--border)}

/* MAIN */
.mn{flex:1;display:flex;flex-direction:column;overflow:hidden}
.tb{padding:14px 28px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;background:var(--bg2);flex-shrink:0}
.tb h2{font-size:16px;font-weight:700;color:var(--silver)}
.tb-act{display:flex;gap:8px;align-items:center}
.ct{flex:1;overflow-y:auto;padding:24px 28px}

/* BUTTONS */
.btn{display:inline-flex;align-items:center;gap:6px;padding:7px 14px;border-radius:7px;font-size:12px;font-weight:600;border:none;cursor:pointer;transition:all .15s;font-family:inherit}
.btn-p{background:var(--accent);color:#fff}.btn-p:hover{background:var(--accent2)}
.btn-g{background:transparent;color:var(--text2);border:1px solid var(--border)}.btn-g:hover{background:var(--bg3);color:var(--text)}
.btn-d{background:var(--red-s);color:var(--red)}.btn-d:hover{background:var(--red);color:#fff}
.btn-sm{padding:5px 10px;font-size:11px}
.btn-ic{padding:6px;width:30px;height:30px;display:flex;align-items:center;justify-content:center}

/* CARDS */
.card{background:var(--bg2);border:1px solid var(--border);border-radius:var(--r);padding:20px}
.card-h{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px}
.card-h h3{font-size:13px;font-weight:700;color:var(--silver)}

/* STATS */
.stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:14px;margin-bottom:22px}
.st{background:var(--bg2);border:1px solid var(--border);border-radius:var(--r);padding:14px 18px}
.st .lb{font-size:9px;color:var(--text3);text-transform:uppercase;letter-spacing:.8px;margin-bottom:3px;font-weight:700}
.st .vl{font-family:'JetBrains Mono',monospace;font-size:20px;font-weight:700}
.st .su{font-size:10px;color:var(--text3);margin-top:2px}

/* TABLE */
.tw{overflow-x:auto}
table{width:100%;border-collapse:collapse}
th{text-align:left;font-size:10px;text-transform:uppercase;letter-spacing:.5px;color:var(--text3);padding:9px 10px;border-bottom:1px solid var(--border);font-weight:700}
td{padding:10px;border-bottom:1px solid var(--border);font-size:12px}
tr:hover td{background:var(--bg3)}

/* FORMS */
.fg{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.fg3{grid-template-columns:1fr 1fr 1fr}
.fi{display:flex;flex-direction:column;gap:3px}
.fi.full{grid-column:1/-1}
.fi label{font-size:9px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.8px}
input,select,textarea{background:var(--bg3);border:1px solid var(--border);border-radius:6px;padding:8px 10px;color:var(--text);font-size:12px;font-family:inherit;outline:none;transition:border .15s}
input:focus,select:focus,textarea:focus{border-color:var(--accent)}
textarea{resize:vertical;min-height:55px}
select{cursor:pointer}

/* BADGES */
.bg{display:inline-flex;padding:2px 8px;border-radius:5px;font-size:10px;font-weight:700}
.bg-gr{background:var(--green-s);color:var(--green)}
.bg-rd{background:var(--red-s);color:var(--red)}
.bg-yl{background:var(--yellow-s);color:var(--yellow)}
.bg-bl{background:var(--accent-s);color:var(--accent)}
.bg-pp{background:var(--purple-s);color:var(--purple)}
.bg-or{background:var(--orange-s);color:var(--orange)}
.bg-cy{background:var(--cyan-s);color:var(--cyan)}
.bg-gy{background:var(--bg4);color:var(--text3)}

/* TABS */
.tabs{display:flex;gap:3px;background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:3px}
.tab{padding:7px 14px;border-radius:5px;font-size:12px;font-weight:500;cursor:pointer;color:var(--text3);transition:all .15s}
.tab.act{background:var(--accent-s);color:var(--accent)}

/* MODAL */
.mo{position:fixed;inset:0;background:rgba(0,0,0,.65);display:flex;align-items:center;justify-content:center;z-index:100;padding:20px}
.mod{background:var(--bg2);border:1px solid var(--border);border-radius:10px;width:100%;max-width:540px;max-height:90vh;overflow-y:auto;box-shadow:var(--sh)}
.mod-h{padding:18px 22px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between}
.mod-h h3{font-size:15px;font-weight:700;color:var(--silver)}
.mod-b{padding:22px}
.mod-f{padding:14px 22px;border-top:1px solid var(--border);display:flex;justify-content:flex-end;gap:8px}

/* CALENDAR */
.cal-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:1px;background:var(--border);border:1px solid var(--border);border-radius:var(--r);overflow:hidden}
.cal-head{background:var(--bg3);padding:8px;text-align:center;font-size:10px;font-weight:700;color:var(--text3);text-transform:uppercase}
.cal-day{background:var(--bg2);min-height:100px;padding:6px;cursor:pointer;transition:background .1s}
.cal-day:hover{background:var(--bg3)}
.cal-day.today{background:rgba(57,181,74,.08);border-left:2px solid var(--accent)}
.cal-day.other{opacity:.3}
.cal-day .dn{font-size:11px;font-weight:600;margin-bottom:4px;color:var(--text2)}
.cal-day.today .dn{color:var(--accent);font-weight:700}
.cal-ev{font-size:9px;padding:2px 4px;border-radius:3px;margin-bottom:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;cursor:pointer;font-weight:600}
.cal-ev.call{background:var(--accent-s);color:var(--accent)}
.cal-ev.meeting{background:var(--cyan-s);color:var(--cyan)}
.cal-ev.site_visit{background:var(--orange-s);color:var(--orange)}
.cal-ev.trade_show{background:var(--purple-s);color:var(--purple)}
.cal-ev.task{background:var(--yellow-s);color:var(--yellow)}

/* NOTIF */
.np{position:absolute;top:46px;right:0;width:340px;background:var(--bg2);border:1px solid var(--border);border-radius:10px;box-shadow:var(--sh);z-index:50;max-height:380px;overflow-y:auto}
.npi{padding:10px 14px;border-bottom:1px solid var(--border);font-size:11px;display:flex;gap:8px}
.npi:last-child{border-bottom:none}
.nd{width:7px;height:7px;border-radius:50%;background:var(--red);flex-shrink:0;margin-top:4px}

/* PRINT */
.pa{background:#fff;color:#1a1a1a;padding:36px;border-radius:10px;font-size:12px}
.pa h2{font-size:17px;margin-bottom:3px;color:#111}
.pa h3{font-size:13px;margin:14px 0 6px;color:#1B7A28;border-bottom:2px solid #39B54A;padding-bottom:3px}
.pa table{border:1px solid #ddd}
.pa th{background:#f0faf0;color:#1B7A28;border-bottom:1px solid #ddd}
.pa td{border-bottom:1px solid #eee;color:#444}
.pa .rm{font-size:10px;color:#888}

/* LOGIN */
.lp{min-height:100vh;display:flex;align-items:center;justify-content:center;background:var(--bg);padding:20px}
.lb-box{width:100%;max-width:380px}
.lb-box h1{font-family:'JetBrains Mono',monospace;font-size:20px;color:var(--accent);margin-bottom:2px}
.lb-box .sub{font-size:9px;color:var(--text3);margin-bottom:6px;text-transform:uppercase;letter-spacing:2px;font-weight:600}
.lb-box p{font-size:12px;color:var(--text3);margin-bottom:24px}
.lb-box .fi{margin-bottom:12px}
.lb-box .btn{width:100%;justify-content:center;padding:10px;font-size:13px;margin-top:6px}
.le{color:var(--red);font-size:11px;margin-top:6px}

@media(max-width:768px){
  .sb{width:56px}
  .sb-brand .sub,.sb-user .nm,.sb-user .rl,.ni span,.sb-ft span,.sb-nav .sec{display:none}
  .sb-brand{padding:14px 10px}.sb-brand h1{font-size:13px}
  .sb-user{padding:10px;justify-content:center}
  .ni{justify-content:center;padding:9px}
  .ni .bdg{right:2px;top:2px}
  .ct{padding:14px}
  .tb{padding:10px 14px}
  .fg,.fg3{grid-template-columns:1fr}
  .stats{grid-template-columns:1fr 1fr}
  .cal-day{min-height:60px}
}

@media print{
  .sb,.tb,.btn,.mo,.ni,.tabs{display:none!important}
  .mn{width:100%!important}
  .ct{padding:0!important}
  .pa{box-shadow:none;border:none}
}

::-webkit-scrollbar{width:5px;height:5px}
::-webkit-scrollbar-track{background:transparent}
::-webkit-scrollbar-thumb{background:var(--bg4);border-radius:3px}
`;

// ─── MODAL SHELL ─────────────────────────────────────────────
const Modal = ({ title, onClose, children, footer }) => (
  <div className="mo" onClick={onClose}>
    <div className="mod" onClick={e => e.stopPropagation()}>
      <div className="mod-h"><h3>{title}</h3><button className="btn btn-ic btn-g" onClick={onClose}><I d={IC.x} /></button></div>
      <div className="mod-b">{children}</div>
      {footer && <div className="mod-f">{footer}</div>}
    </div>
  </div>
);

// ═════════════════════════════════════════════════════════════
// MAIN APP
// ═════════════════════════════════════════════════════════════
export default function App() {
  const [user, setUser] = useState(null);
  const [contacts, setContacts] = useState(seedContacts);
  const [calls, setCalls] = useState(seedCalls);
  const [tasks, setTasks] = useState(seedTasks);
  const [events, setEvents] = useState(seedEvents);
  const [fuel, setFuel] = useState(seedFuel);
  const [maint, setMaint] = useState(seedMaint);
  const [expenses, setExpenses] = useState(seedExpenses);
  const [page, setPage] = useState("dashboard");
  const [modal, setModal] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [mgrView, setMgrView] = useState("all");
  const [showNotifs, setShowNotifs] = useState(false);
  const [reportRange, setReportRange] = useState("weekly");

  const my = useCallback((arr) => {
    if (!user) return [];
    if (user.role === "manager") return mgrView === "all" ? arr : arr.filter(i => i.repId === mgrView);
    return arr.filter(i => i.repId === user.id);
  }, [user, mgrView]);

  const overdueTasks = useMemo(() => tasks.filter(t => t.status !== "done" && isOverdue(t.due)), [tasks]);
  const myOverdue = useMemo(() => {
    if (!user) return [];
    return user.role === "manager" ? overdueTasks : overdueTasks.filter(t => t.repId === user.id);
  }, [user, overdueTasks]);

  if (!user) return <LoginScreen onLogin={setUser} />;

  const getContact = (id) => contacts.find(c => c.id === id);
  const getContactName = (id) => { const c = getContact(id); return c ? c.company : "—"; };
  const getRep = (id) => USERS.find(u => u.id === id)?.name || "—";
  const isRep = user.role === "rep";
  const isMgr = user.role === "manager";

  const open = (m, item = null) => { setEditItem(item); setModal(m); };
  const close = () => { setModal(null); setEditItem(null); };

  const save = (type, data) => {
    const setters = { contact: setContacts, call: setCalls, task: setTasks, event: setEvents, fuel: setFuel, maint: setMaint, expense: setExpenses };
    const setter = setters[type];
    if (data.id) setter(p => p.map(i => i.id === data.id ? data : i));
    else setter(p => [...p, { ...data, id: uid(), repId: user.id, ...(type === "contact" ? { created: today() } : {}) }]);
    close();
  };
  const del = (type, id) => {
    const setters = { contact: setContacts, call: setCalls, task: setTasks, event: setEvents, fuel: setFuel, maint: setMaint, expense: setExpenses };
    setters[type](p => p.filter(i => i.id !== id));
  };
  const toggleTask = (id) => setTasks(p => p.map(t => t.id === id ? { ...t, status: t.status === "done" ? "pending" : "done" } : t));

  const navItems = [
    { s: "MAIN" },
    { id: "dashboard", icon: IC.home, label: "Dashboard" },
    { id: "contacts", icon: IC.contacts, label: "Contacts" },
    { id: "calls", icon: IC.phone, label: "Sales Calls" },
    { id: "tasks", icon: IC.task, label: "Tasks", badge: myOverdue.length || null },
    { id: "calendar", icon: IC.calendar, label: "Calendar" },
    { s: "TRACKING" },
    { id: "vehicle", icon: IC.car, label: "Vehicle & Gas" },
    { id: "expenses", icon: IC.dollar, label: "Expenses" },
    { s: "ADMIN" },
    ...(isMgr ? [{ id: "team", icon: IC.users, label: "Team Overview" }] : []),
    { id: "reports", icon: IC.report, label: "Reports" },
  ];

  const pg = () => {
    switch (page) {
      case "dashboard": return <Dashboard user={user} contacts={my(contacts)} calls={my(calls)} tasks={my(tasks)} events={my(events)} fuel={my(fuel)} maint={my(maint)} expenses={my(expenses)} overdue={myOverdue} setPage={setPage} getContactName={getContactName} getRep={getRep} />;
      case "contacts": return <Contacts contacts={my(contacts)} isRep={isRep} isMgr={isMgr} getRep={getRep} onAdd={() => open("contact")} onEdit={c => open("contact", c)} onDel={id => del("contact", id)} />;
      case "calls": return <Calls calls={my(calls)} contacts={my(contacts)} isRep={isRep} isMgr={isMgr} getContactName={getContactName} getRep={getRep} onAdd={() => open("call")} onEdit={c => open("call", c)} />;
      case "tasks": return <Tasks tasks={my(tasks)} isRep={isRep} isMgr={isMgr} getContactName={getContactName} getRep={getRep} onAdd={() => open("task")} onEdit={t => open("task", t)} onToggle={toggleTask} />;
      case "calendar": return <Calendar events={my(events)} tasks={my(tasks)} isRep={isRep} getContactName={getContactName} onAdd={() => open("event")} onEdit={e => open("event", e)} />;
      case "vehicle": return <Vehicle fuel={my(fuel)} maint={my(maint)} isRep={isRep} isMgr={isMgr} getRep={getRep} onAddF={() => open("fuel")} onAddM={() => open("maint")} onEditF={f => open("fuel", f)} onEditM={m => open("maint", m)} />;
      case "expenses": return <Expenses expenses={my(expenses)} isRep={isRep} isMgr={isMgr} getRep={getRep} onAdd={() => open("expense")} onEdit={e => open("expense", e)} />;
      case "team": return isMgr ? <Team users={USERS} tasks={tasks} contacts={contacts} calls={calls} expenses={expenses} fuel={fuel} maint={maint} mgrView={mgrView} setMgrView={setMgrView} setPage={setPage} /> : null;
      case "reports": return <Reports user={user} contacts={my(contacts)} calls={my(calls)} tasks={my(tasks)} events={my(events)} fuel={my(fuel)} maint={my(maint)} expenses={my(expenses)} getContactName={getContactName} getRep={getRep} range={reportRange} setRange={setReportRange} />;
      default: return null;
    }
  };

  return (
    <>
      <style>{CSS}</style>
      <div className="app">
        <div className="sb">
          <div className="sb-brand"><h1>Flash<span className="ft-t">T</span>ech</h1><div className="sub">Sales Assistant</div></div>
          <div className="sb-user">
            <div className="av">{user.name[0]}</div>
            <div><div className="nm">{user.name}</div><div className="rl">{isMgr ? "Manager" : "Sales Rep"}</div></div>
          </div>
          <div className="sb-nav">
            {isMgr && <div style={{ padding: "4px 12px 8px" }}><select value={mgrView} onChange={e => setMgrView(e.target.value)} style={{ width: "100%", fontSize: 10, padding: "5px 6px" }}><option value="all">All Reps</option>{USERS.filter(u => u.role === "rep").map(u => <option key={u.id} value={u.id}>{u.name}</option>)}</select></div>}
            {navItems.map((n, i) => n.s ? <div key={i} className="sec">{n.s}</div> : (
              <div key={n.id} className={`ni ${page === n.id ? "act" : ""}`} onClick={() => setPage(n.id)}>
                <I d={n.icon} s={15} /><span>{n.label}</span>{n.badge && <span className="bdg">{n.badge}</span>}
              </div>
            ))}
          </div>
          <div className="sb-ft"><div className="ni" onClick={() => setUser(null)}><I d={IC.logout} s={15} /><span>Logout</span></div></div>
        </div>
        <div className="mn">
          <div className="tb">
            <h2>{navItems.find(n => n.id === page)?.label || "Dashboard"}</h2>
            <div className="tb-act" style={{ position: "relative" }}>
              <button className="btn btn-g btn-ic" style={{ position: "relative" }} onClick={() => setShowNotifs(!showNotifs)}>
                <I d={IC.bell} s={15} />
                {myOverdue.length > 0 && <span style={{ position: "absolute", top: 2, right: 2, width: 7, height: 7, background: "var(--red)", borderRadius: "50%" }} />}
              </button>
              {showNotifs && (
                <div className="np">
                  <div style={{ padding: "10px 14px", fontWeight: 700, fontSize: 12, borderBottom: "1px solid var(--border)" }}>Notifications ({myOverdue.length})</div>
                  {myOverdue.length === 0 && <div style={{ padding: 14, fontSize: 11, color: "var(--text3)" }}>All caught up!</div>}
                  {myOverdue.map(t => (
                    <div className="npi" key={t.id}><span className="nd" /><div><div style={{ fontWeight: 600 }}>Overdue: {t.title}</div><div style={{ color: "var(--text3)", marginTop: 1 }}>{getRep(t.repId)} · Due {fmtDate(t.due)}</div></div></div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="ct" onClick={() => showNotifs && setShowNotifs(false)}>{pg()}</div>
        </div>
      </div>

      {modal === "contact" && <ContactForm item={editItem} onSave={d => save("contact", d)} onClose={close} />}
      {modal === "call" && <CallForm item={editItem} contacts={my(contacts)} onSave={d => save("call", d)} onClose={close} />}
      {modal === "task" && <TaskForm item={editItem} contacts={my(contacts)} onSave={d => save("task", d)} onClose={close} />}
      {modal === "event" && <EventForm item={editItem} contacts={my(contacts)} onSave={d => save("event", d)} onClose={close} />}
      {modal === "fuel" && <FuelForm item={editItem} onSave={d => save("fuel", d)} onClose={close} />}
      {modal === "maint" && <MaintForm item={editItem} onSave={d => save("maint", d)} onClose={close} />}
      {modal === "expense" && <ExpenseForm item={editItem} onSave={d => save("expense", d)} onClose={close} />}
    </>
  );
}

// ═════════════════════════════════════════════════════════════
// LOGIN
// ═════════════════════════════════════════════════════════════
function LoginScreen({ onLogin }) {
  const [e, setE] = useState(""); const [p, setP] = useState(""); const [err, setErr] = useState("");
  const go = () => { const u = USERS.find(u => u.email === e && u.password === p); if (u) onLogin(u); else setErr("Invalid credentials"); };
  return (
    <><style>{CSS}</style>
      <div className="lp"><div className="lb-box">
        <h1>Flash<span style={{fontWeight:800}}>T</span>ech</h1>
        <div className="sub">Sales Assistant</div>
        <p>Sign in to continue</p>
        <div className="fi"><label>Username</label><input value={e} onChange={v => setE(v.target.value)} placeholder="admin, jake, sarah, or mike" onKeyDown={v => v.key === "Enter" && go()} /></div>
        <div className="fi" style={{ marginTop: 10 }}><label>Password</label><input type="password" value={p} onChange={v => setP(v.target.value)} placeholder="admin or 1234" onKeyDown={v => v.key === "Enter" && go()} /></div>
        <button className="btn btn-p" onClick={go}>Sign In</button>
        {err && <div className="le">{err}</div>}
        <div style={{ marginTop: 20, fontSize: 10, color: "var(--text3)", lineHeight: 1.6 }}>
          <span style={{ fontWeight: 700 }}>Demo Accounts:</span><br />Manager: admin / admin<br />Reps: jake / 1234 · sarah / 1234 · mike / 1234
        </div>
      </div></div>
    </>
  );
}

// ═════════════════════════════════════════════════════════════
// DASHBOARD
// ═════════════════════════════════════════════════════════════
function Dashboard({ user, contacts, calls, tasks, events, fuel, maint, expenses, overdue, setPage, getContactName, getRep }) {
  const totalExp = expenses.reduce((s, e) => s + e.amount, 0) + fuel.reduce((s, f) => s + f.total, 0) + maint.reduce((s, m) => s + m.cost, 0);
  const pending = tasks.filter(t => t.status !== "done").length;
  const upcoming = events.filter(e => e.date >= today()).sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));

  return (
    <div>
      <div className="stats">
        <div className="st"><div className="lb">Total Contacts</div><div className="vl" style={{ color: "var(--accent)" }}>{contacts.length}</div><div className="su">Active accounts</div></div>
        <div className="st"><div className="lb">Calls This Month</div><div className="vl" style={{ color: "var(--green)" }}>{calls.filter(c => c.date >= today().slice(0, 7)).length}</div><div className="su">{calls.length} total logged</div></div>
        <div className="st"><div className="lb">Open Tasks</div><div className="vl" style={{ color: overdue.length ? "var(--red)" : "var(--text)" }}>{pending}</div><div className="su">{overdue.length} overdue</div></div>
        <div className="st"><div className="lb">Total Expenses</div><div className="vl" style={{ color: "var(--orange)" }}>{fmt(totalExp)}</div><div className="su">Expenses + vehicle</div></div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <div className="card">
          <div className="card-h"><h3>Recent Sales Calls</h3><button className="btn btn-g btn-sm" onClick={() => setPage("calls")}>View All</button></div>
          {calls.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 4).map(c => (
            <div key={c.id} style={{ padding: "8px 0", borderBottom: "1px solid var(--border)", fontSize: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontWeight: 600 }}>{c.who}</span>
                <span style={{ color: "var(--text3)", fontSize: 10 }}>{fmtShort(c.date)}</span>
              </div>
              <div style={{ color: "var(--text3)", fontSize: 10 }}>{getContactName(c.contactId)} · {c.where}</div>
              <div style={{ color: "var(--text2)", marginTop: 2 }}>{c.what.slice(0, 100)}{c.what.length > 100 ? "..." : ""}</div>
            </div>
          ))}
          {calls.length === 0 && <div style={{ fontSize: 11, color: "var(--text3)", padding: "10px 0" }}>No calls logged yet.</div>}
        </div>
        <div className="card">
          <div className="card-h"><h3>Upcoming Events & Meetings</h3><button className="btn btn-g btn-sm" onClick={() => setPage("calendar")}>Calendar</button></div>
          {upcoming.slice(0, 5).map(ev => (
            <div key={ev.id} style={{ padding: "8px 0", borderBottom: "1px solid var(--border)", fontSize: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontWeight: 600 }}>{ev.title}</div>
                <div style={{ color: "var(--text3)", fontSize: 10 }}>{fmtShort(ev.date)} · {ev.time}{ev.endTime ? `–${ev.endTime}` : ""}</div>
              </div>
              <span className={`bg bg-${ev.type === "call" ? "bl" : ev.type === "meeting" ? "gr" : ev.type === "site_visit" ? "or" : "pp"}`}>{ev.type.replace("_", " ")}</span>
            </div>
          ))}
          {upcoming.length === 0 && <div style={{ fontSize: 11, color: "var(--text3)", padding: "10px 0" }}>No upcoming events.</div>}
        </div>
      </div>
      {overdue.length > 0 && (
        <div className="card" style={{ marginTop: 14, borderColor: "var(--red)", borderWidth: 1 }}>
          <div className="card-h"><h3 style={{ color: "var(--red)" }}><I d={IC.alert} s={14} c="var(--red)" /> Overdue Tasks</h3></div>
          {overdue.map(t => (
            <div key={t.id} style={{ padding: "6px 0", fontSize: 12, display: "flex", justifyContent: "space-between" }}>
              <span><strong>{t.title}</strong> — {getContactName(t.contactId)}</span>
              <span style={{ color: "var(--red)", fontSize: 10 }}>Due {fmtDate(t.due)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
// CONTACTS
// ═════════════════════════════════════════════════════════════
function Contacts({ contacts, isRep, isMgr, getRep, onAdd, onEdit, onDel }) {
  const [search, setSearch] = useState("");
  const filtered = contacts.filter(c => `${c.company} ${c.name} ${c.email}`.toLowerCase().includes(search.toLowerCase()));
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14, gap: 8, flexWrap: "wrap" }}>
        <input placeholder="Search contacts..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: 260 }} />
        {isRep && <button className="btn btn-p" onClick={onAdd}><I d={IC.plus} s={13} /> Add Contact</button>}
      </div>
      <div className="tw">
        <table>
          <thead><tr><th>Company</th><th>Contact</th><th>Phone / Email</th><th>Location</th>{isMgr && <th>Rep</th>}<th>Notes</th><th></th></tr></thead>
          <tbody>
            {filtered.map(c => (
              <tr key={c.id}>
                <td style={{ fontWeight: 700 }}><I d={IC.bldg} s={12} c="var(--accent)" /> {c.company}</td>
                <td>{c.name}<br /><span style={{ fontSize: 10, color: "var(--text3)" }}>{c.title}</span></td>
                <td><div>{c.phone}</div><div style={{ fontSize: 10, color: "var(--text3)" }}>{c.email}</div></td>
                <td style={{ fontSize: 11, maxWidth: 160 }}>{c.address}</td>
                {isMgr && <td>{getRep(c.repId)}</td>}
                <td style={{ fontSize: 11, maxWidth: 180, color: "var(--text2)" }}>{c.notes}</td>
                <td>
                  <button className="btn btn-g btn-sm btn-ic" onClick={() => onEdit(c)}><I d={IC.edit} s={12} /></button>
                  {isRep && <button className="btn btn-d btn-sm btn-ic" style={{ marginLeft: 4 }} onClick={() => onDel(c.id)}><I d={IC.trash} s={12} /></button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
// SALES CALLS
// ═════════════════════════════════════════════════════════════
function Calls({ calls, contacts, isRep, isMgr, getContactName, getRep, onAdd, onEdit }) {
  return (
    <div>
      {isRep && <div style={{ marginBottom: 14 }}><button className="btn btn-p" onClick={onAdd}><I d={IC.plus} s={13} /> Log Sales Call</button></div>}
      <div className="tw">
        <table>
          <thead><tr><th>Date</th><th>Time</th>{isMgr && <th>Rep</th>}<th>Company</th><th>Spoke With</th><th>Where</th><th>Products</th><th>Discussion</th><th>Outcome</th><th>Follow Up</th><th></th></tr></thead>
          <tbody>
            {calls.sort((a, b) => b.date.localeCompare(a.date)).map(c => (
              <tr key={c.id}>
                <td style={{ whiteSpace: "nowrap" }}>{fmtShort(c.date)}</td>
                <td>{c.time}</td>
                {isMgr && <td>{getRep(c.repId)}</td>}
                <td style={{ fontWeight: 600 }}>{getContactName(c.contactId)}</td>
                <td>{c.who}</td>
                <td style={{ fontSize: 11 }}>{c.where}</td>
                <td>{(c.productsDiscussed || "").split(",").filter(Boolean).map(p => <span key={p} className="bg bg-cy" style={{ marginRight: 3, marginBottom: 2, display: "inline-block" }}>{p.trim()}</span>)}</td>
                <td style={{ maxWidth: 200, fontSize: 11 }}>{c.what}</td>
                <td style={{ fontSize: 11, color: "var(--green)" }}>{c.outcome}</td>
                <td style={{ fontSize: 11, color: "var(--yellow)" }}>{c.followUp}</td>
                <td><button className="btn btn-g btn-sm btn-ic" onClick={() => onEdit(c)}><I d={IC.edit} s={12} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
// TASKS
// ═════════════════════════════════════════════════════════════
function Tasks({ tasks, isRep, isMgr, getContactName, getRep, onAdd, onEdit, onToggle }) {
  const [filter, setFilter] = useState("all");
  const filtered = tasks.filter(t => {
    if (filter === "overdue") return t.status !== "done" && isOverdue(t.due);
    if (filter === "pending") return t.status !== "done";
    if (filter === "done") return t.status === "done";
    return true;
  }).sort((a, b) => a.due.localeCompare(b.due));
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
        <div className="tabs">
          {["all", "pending", "overdue", "done"].map(f => <div key={f} className={`tab ${filter === f ? "act" : ""}`} onClick={() => setFilter(f)}>{f.charAt(0).toUpperCase() + f.slice(1)}</div>)}
        </div>
        {isRep && <button className="btn btn-p" onClick={onAdd}><I d={IC.plus} s={13} /> New Task</button>}
      </div>
      <div className="tw">
        <table>
          <thead><tr><th style={{ width: 36 }}></th><th>Type</th><th>Task</th><th>Company</th>{isMgr && <th>Rep</th>}<th>Due</th><th>Priority</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {filtered.map(t => (
              <tr key={t.id} style={{ opacity: t.status === "done" ? .45 : 1 }}>
                <td><input type="checkbox" checked={t.status === "done"} onChange={() => onToggle(t.id)} style={{ width: 15, height: 15, cursor: "pointer" }} /></td>
                <td><span className="bg bg-cy">{t.type}</span></td>
                <td style={{ fontWeight: 600, textDecoration: t.status === "done" ? "line-through" : "none" }}>{t.title}{t.notes && <div style={{ fontSize: 10, color: "var(--text3)", fontWeight: 400 }}>{t.notes}</div>}</td>
                <td>{getContactName(t.contactId)}</td>
                {isMgr && <td>{getRep(t.repId)}</td>}
                <td style={{ whiteSpace: "nowrap" }}>{fmtShort(t.due)}</td>
                <td><span className={`bg ${t.priority === "high" ? "bg-rd" : t.priority === "medium" ? "bg-yl" : "bg-gy"}`}>{t.priority}</span></td>
                <td><span className={`bg ${t.status === "done" ? "bg-gr" : isOverdue(t.due) ? "bg-rd" : "bg-bl"}`}>{t.status === "done" ? "Done" : isOverdue(t.due) ? "Overdue" : "Pending"}</span></td>
                <td><button className="btn btn-g btn-sm btn-ic" onClick={() => onEdit(t)}><I d={IC.edit} s={12} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
// CALENDAR
// ═════════════════════════════════════════════════════════════
function Calendar({ events, tasks, isRep, getContactName, onAdd, onEdit }) {
  const [current, setCurrent] = useState(new Date());
  const year = current.getFullYear();
  const month = current.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevDays = new Date(year, month, 0).getDate();
  const days = [];

  for (let i = firstDay - 1; i >= 0; i--) days.push({ d: prevDays - i, m: month - 1, other: true });
  for (let i = 1; i <= daysInMonth; i++) days.push({ d: i, m: month, other: false });
  const remaining = 42 - days.length;
  for (let i = 1; i <= remaining; i++) days.push({ d: i, m: month + 1, other: true });

  const todayStr = today();
  const pendingTasks = tasks.filter(t => t.status !== "done");

  const getDateStr = (day) => {
    const m = day.m < 0 ? 11 : day.m > 11 ? 0 : day.m;
    const y = day.m < 0 ? year - 1 : day.m > 11 ? year + 1 : year;
    return `${y}-${String(m + 1).padStart(2, "0")}-${String(day.d).padStart(2, "0")}`;
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button className="btn btn-g btn-ic" onClick={() => setCurrent(new Date(year, month - 1))}><I d={IC.chevL} s={14} /></button>
          <h3 style={{ fontSize: 15, fontWeight: 700, minWidth: 160, textAlign: "center" }}>{current.toLocaleDateString("en-US", { month: "long", year: "numeric" })}</h3>
          <button className="btn btn-g btn-ic" onClick={() => setCurrent(new Date(year, month + 1))}><I d={IC.chevR} s={14} /></button>
          <button className="btn btn-g btn-sm" onClick={() => setCurrent(new Date())}>Today</button>
        </div>
        {isRep && <button className="btn btn-p" onClick={onAdd}><I d={IC.plus} s={13} /> Add Event</button>}
      </div>
      <div style={{ display: "flex", gap: 12, marginBottom: 12, fontSize: 10, color: "var(--text3)" }}>
        <span><span style={{ display: "inline-block", width: 8, height: 8, borderRadius: 2, background: "var(--accent)", marginRight: 4 }} />Call</span>
        <span><span style={{ display: "inline-block", width: 8, height: 8, borderRadius: 2, background: "var(--green)", marginRight: 4 }} />Meeting</span>
        <span><span style={{ display: "inline-block", width: 8, height: 8, borderRadius: 2, background: "var(--orange)", marginRight: 4 }} />Site Visit</span>
        <span><span style={{ display: "inline-block", width: 8, height: 8, borderRadius: 2, background: "var(--purple)", marginRight: 4 }} />Trade Show</span>
        <span><span style={{ display: "inline-block", width: 8, height: 8, borderRadius: 2, background: "var(--yellow)", marginRight: 4 }} />Task Due</span>
      </div>
      <div className="cal-grid">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => <div key={d} className="cal-head">{d}</div>)}
        {days.map((day, i) => {
          const ds = getDateStr(day);
          const dayEvents = events.filter(e => e.date === ds);
          const dayTasks = pendingTasks.filter(t => t.due === ds);
          return (
            <div key={i} className={`cal-day ${day.other ? "other" : ""} ${ds === todayStr ? "today" : ""}`}>
              <div className="dn">{day.d}</div>
              {dayEvents.map(ev => <div key={ev.id} className={`cal-ev ${ev.type}`} onClick={() => onEdit(ev)} title={ev.title}>{ev.time} {ev.title}</div>)}
              {dayTasks.map(t => <div key={t.id} className="cal-ev task" title={t.title}>📋 {t.title}</div>)}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
// VEHICLE & GAS
// ═════════════════════════════════════════════════════════════
function Vehicle({ fuel, maint, isRep, isMgr, getRep, onAddF, onAddM, onEditF, onEditM }) {
  const [tab, setTab] = useState("fuel");
  const totalF = fuel.reduce((s, f) => s + f.total, 0);
  const totalM = maint.reduce((s, m) => s + m.cost, 0);
  const avgPPG = fuel.length ? (fuel.reduce((s, f) => s + f.pricePerGal, 0) / fuel.length).toFixed(2) : "0.00";
  const latest = fuel.length ? Math.max(...fuel.map(f => f.mileage)) : 0;

  return (
    <div>
      <div className="stats">
        <div className="st"><div className="lb">Total Fuel</div><div className="vl" style={{ color: "var(--orange)" }}>{fmt(totalF)}</div></div>
        <div className="st"><div className="lb">Avg $/Gal</div><div className="vl">${avgPPG}</div></div>
        <div className="st"><div className="lb">Maintenance</div><div className="vl" style={{ color: "var(--purple)" }}>{fmt(totalM)}</div></div>
        <div className="st"><div className="lb">Current Mileage</div><div className="vl">{latest.toLocaleString()}</div></div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
        <div className="tabs">
          <div className={`tab ${tab === "fuel" ? "act" : ""}`} onClick={() => setTab("fuel")}>Fuel Log</div>
          <div className={`tab ${tab === "maint" ? "act" : ""}`} onClick={() => setTab("maint")}>Maintenance & Other</div>
        </div>
        {isRep && (tab === "fuel" ? <button className="btn btn-p" onClick={onAddF}><I d={IC.plus} s={13} /> Add Fuel</button> : <button className="btn btn-p" onClick={onAddM}><I d={IC.plus} s={13} /> Add Expense</button>)}
      </div>
      {tab === "fuel" ? (
        <div className="tw"><table>
          <thead><tr><th>Date</th>{isMgr && <th>Rep</th>}<th>Station</th><th>Gallons</th><th>$/Gal</th><th>Total</th><th>Mileage</th><th></th></tr></thead>
          <tbody>{fuel.sort((a, b) => b.date.localeCompare(a.date)).map(f => (
            <tr key={f.id}><td>{fmtShort(f.date)}</td>{isMgr && <td>{getRep(f.repId)}</td>}<td>{f.station}</td><td>{f.gallons}</td><td>${Number(f.pricePerGal).toFixed(2)}</td><td style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 600 }}>{fmt(f.total)}</td><td>{Number(f.mileage).toLocaleString()}</td><td><button className="btn btn-g btn-sm btn-ic" onClick={() => onEditF(f)}><I d={IC.edit} s={12} /></button></td></tr>
          ))}</tbody>
        </table></div>
      ) : (
        <div className="tw"><table>
          <thead><tr><th>Date</th>{isMgr && <th>Rep</th>}<th>Type</th><th>Vendor</th><th>Cost</th><th>Mileage</th><th>Notes</th><th></th></tr></thead>
          <tbody>{maint.sort((a, b) => b.date.localeCompare(a.date)).map(m => (
            <tr key={m.id}><td>{fmtShort(m.date)}</td>{isMgr && <td>{getRep(m.repId)}</td>}<td style={{ fontWeight: 600 }}>{m.type}</td><td>{m.vendor}</td><td style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 600 }}>{fmt(m.cost)}</td><td>{Number(m.mileage).toLocaleString()}</td><td style={{ fontSize: 11 }}>{m.notes}</td><td><button className="btn btn-g btn-sm btn-ic" onClick={() => onEditM(m)}><I d={IC.edit} s={12} /></button></td></tr>
          ))}</tbody>
        </table></div>
      )}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
// EXPENSES
// ═════════════════════════════════════════════════════════════
function Expenses({ expenses, isRep, isMgr, getRep, onAdd, onEdit }) {
  const total = expenses.reduce((s, e) => s + e.amount, 0);
  const cats = [...new Set(expenses.map(e => e.category))];
  return (
    <div>
      <div className="stats">
        <div className="st"><div className="lb">Total Expenses</div><div className="vl" style={{ color: "var(--orange)" }}>{fmt(total)}</div><div className="su">{expenses.length} entries</div></div>
        {cats.map(cat => <div className="st" key={cat}><div className="lb">{cat}</div><div className="vl">{fmt(expenses.filter(e => e.category === cat).reduce((s, e) => s + e.amount, 0))}</div></div>)}
      </div>
      {isRep && <div style={{ marginBottom: 14 }}><button className="btn btn-p" onClick={onAdd}><I d={IC.plus} s={13} /> Add Expense</button></div>}
      <div className="tw"><table>
        <thead><tr><th>Date</th>{isMgr && <th>Rep</th>}<th>Category</th><th>Amount</th><th>Who</th><th>What</th><th>Where</th><th>Receipt</th><th></th></tr></thead>
        <tbody>{expenses.sort((a, b) => b.date.localeCompare(a.date)).map(e => (
          <tr key={e.id}><td>{fmtShort(e.date)}</td>{isMgr && <td>{getRep(e.repId)}</td>}<td><span className="bg bg-pp">{e.category}</span></td><td style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 600 }}>{fmt(e.amount)}</td><td>{e.who}</td><td>{e.what}</td><td>{e.where}</td><td>{e.receipt ? <span className="bg bg-gr">Yes</span> : <span className="bg bg-rd">No</span>}</td><td><button className="btn btn-g btn-sm btn-ic" onClick={() => onEdit(e)}><I d={IC.edit} s={12} /></button></td></tr>
        ))}</tbody>
      </table></div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
// TEAM OVERVIEW (Manager)
// ═════════════════════════════════════════════════════════════
function Team({ users, tasks, contacts, calls, expenses, fuel, maint, mgrView, setMgrView, setPage }) {
  const reps = users.filter(u => u.role === "rep");
  return (
    <div>
      <div className="stats">
        {reps.map(rep => {
          const rc = contacts.filter(c => c.repId === rep.id).length;
          const rl = calls.filter(c => c.repId === rep.id).length;
          const od = tasks.filter(t => t.repId === rep.id && t.status !== "done" && isOverdue(t.due));
          const re = expenses.filter(e => e.repId === rep.id).reduce((s, e) => s + e.amount, 0);
          const rf = fuel.filter(f => f.repId === rep.id).reduce((s, f) => s + f.total, 0);
          const rm = maint.filter(m => m.repId === rep.id).reduce((s, m) => s + m.cost, 0);
          return (
            <div className="card" key={rep.id} style={{ cursor: "pointer" }} onClick={() => { setMgrView(rep.id); setPage("dashboard"); }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg,var(--accent),var(--purple))", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, color: "#fff" }}>{rep.name[0]}</div>
                <div><div style={{ fontWeight: 700, fontSize: 13 }}>{rep.name}</div><div style={{ fontSize: 10, color: "var(--text3)" }}>Sales Representative</div></div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, fontSize: 11 }}>
                <div><span style={{ color: "var(--text3)" }}>Contacts:</span> <strong>{rc}</strong></div>
                <div><span style={{ color: "var(--text3)" }}>Calls:</span> <strong>{rl}</strong></div>
                <div><span style={{ color: "var(--text3)" }}>Expenses:</span> <strong>{fmt(re + rf + rm)}</strong></div>
                <div><span style={{ color: "var(--text3)" }}>Overdue:</span> <strong style={{ color: od.length ? "var(--red)" : "var(--green)" }}>{od.length}</strong></div>
              </div>
              {od.length > 0 && <div style={{ marginTop: 8, padding: 6, background: "var(--red-s)", borderRadius: 5, fontSize: 10, color: "var(--red)", fontWeight: 600 }}><I d={IC.alert} s={11} c="var(--red)" /> {od.length} overdue task(s)</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
// REPORTS
// ═════════════════════════════════════════════════════════════
function Reports({ user, contacts, calls, tasks, events, fuel, maint, expenses, getContactName, getRep, range, setRange }) {
  const [type, setType] = useState("calls");
  const fr = (arr, df = "date") => {
    const now = new Date(); const s = new Date();
    if (range === "daily") s.setDate(now.getDate());
    else if (range === "weekly") s.setDate(now.getDate() - 7);
    else if (range === "monthly") s.setMonth(now.getMonth() - 1);
    else s.setFullYear(now.getFullYear() - 1);
    const ss = s.toISOString().split("T")[0];
    return arr.filter(i => (i[df] || i.created || "") >= ss);
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <div className="tabs">
            {["calls", "tasks", "contacts", "vehicle", "expenses"].map(t => <div key={t} className={`tab ${type === t ? "act" : ""}`} onClick={() => setType(t)}>{t.charAt(0).toUpperCase() + t.slice(1)}</div>)}
          </div>
          <div className="tabs">
            {["daily", "weekly", "monthly", "yearly"].map(r => <div key={r} className={`tab ${range === r ? "act" : ""}`} onClick={() => setRange(r)}>{r.charAt(0).toUpperCase() + r.slice(1)}</div>)}
          </div>
        </div>
        <button className="btn btn-p" onClick={() => window.print()}><I d={IC.print} s={13} /> Print Report</button>
      </div>
      <div className="pa">
        <div><h2>FlashTech Sales Assistant — {type.charAt(0).toUpperCase() + type.slice(1)} Report</h2><div className="rm">Generated: {new Date().toLocaleDateString()} · Range: {range} · {user.role === "manager" ? "All Reps" : user.name} · Flash-Tech Mfg, Inc. · 215 Denny Way Ste D, El Cajon, CA 92020</div></div>
        {type === "calls" && (<><h3>Sales Call Log</h3><table><thead><tr><th>Date</th><th>Company</th><th>Spoke With</th><th>Where</th><th>Products</th><th>Discussion</th><th>Outcome</th><th>Follow Up</th></tr></thead><tbody>{fr(calls).map(c => <tr key={c.id}><td>{fmtDate(c.date)}</td><td>{getContactName(c.contactId)}</td><td>{c.who}</td><td>{c.where}</td><td>{c.productsDiscussed}</td><td>{c.what}</td><td>{c.outcome}</td><td>{c.followUp}</td></tr>)}</tbody></table><div style={{ marginTop: 8, fontWeight: 600 }}>Total Calls: {fr(calls).length}</div></>)}
        {type === "tasks" && (<><h3>Task Report</h3><table><thead><tr><th>Type</th><th>Task</th><th>Company</th><th>Due</th><th>Priority</th><th>Status</th></tr></thead><tbody>{fr(tasks, "due").map(t => <tr key={t.id}><td>{t.type}</td><td>{t.title}</td><td>{getContactName(t.contactId)}</td><td>{fmtDate(t.due)}</td><td>{t.priority}</td><td>{t.status === "done" ? "Done" : isOverdue(t.due) ? "OVERDUE" : "Pending"}</td></tr>)}</tbody></table></>)}
        {type === "contacts" && (<><h3>Contact List</h3><table><thead><tr><th>Company</th><th>Contact</th><th>Title</th><th>Phone</th><th>Email</th><th>Location</th></tr></thead><tbody>{contacts.map(c => <tr key={c.id}><td>{c.company}</td><td>{c.name}</td><td>{c.title}</td><td>{c.phone}</td><td>{c.email}</td><td>{c.address}</td></tr>)}</tbody></table><div style={{ marginTop: 8, fontWeight: 600 }}>Total Contacts: {contacts.length}</div></>)}
        {type === "vehicle" && (<><h3>Fuel Log</h3><table><thead><tr><th>Date</th><th>Station</th><th>Gallons</th><th>$/Gal</th><th>Total</th><th>Mileage</th></tr></thead><tbody>{fr(fuel).map(f => <tr key={f.id}><td>{fmtDate(f.date)}</td><td>{f.station}</td><td>{f.gallons}</td><td>${Number(f.pricePerGal).toFixed(2)}</td><td>{fmt(f.total)}</td><td>{Number(f.mileage).toLocaleString()}</td></tr>)}</tbody></table><div style={{ marginTop: 8, fontWeight: 600 }}>Fuel Total: {fmt(fr(fuel).reduce((s, f) => s + f.total, 0))}</div><h3>Maintenance</h3><table><thead><tr><th>Date</th><th>Type</th><th>Vendor</th><th>Cost</th><th>Mileage</th><th>Notes</th></tr></thead><tbody>{fr(maint).map(m => <tr key={m.id}><td>{fmtDate(m.date)}</td><td>{m.type}</td><td>{m.vendor}</td><td>{fmt(m.cost)}</td><td>{Number(m.mileage).toLocaleString()}</td><td>{m.notes}</td></tr>)}</tbody></table><div style={{ marginTop: 8, fontWeight: 600 }}>Maintenance Total: {fmt(fr(maint).reduce((s, m) => s + m.cost, 0))}</div></>)}
        {type === "expenses" && (<><h3>Expense Report</h3><table><thead><tr><th>Date</th><th>Category</th><th>Amount</th><th>Who</th><th>What</th><th>Where</th><th>Receipt</th></tr></thead><tbody>{fr(expenses).map(e => <tr key={e.id}><td>{fmtDate(e.date)}</td><td>{e.category}</td><td>{fmt(e.amount)}</td><td>{e.who}</td><td>{e.what}</td><td>{e.where}</td><td>{e.receipt ? "Yes" : "No"}</td></tr>)}</tbody></table><div style={{ marginTop: 8, fontWeight: 600 }}>Total: {fmt(fr(expenses).reduce((s, e) => s + e.amount, 0))}</div></>)}
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
// FORM MODALS
// ═════════════════════════════════════════════════════════════
function ContactForm({ item, onSave, onClose }) {
  const [f, setF] = useState(item || { company: "", name: "", title: "", phone: "", email: "", address: "", notes: "" });
  const u = (k, v) => setF(p => ({ ...p, [k]: v }));
  return (
    <Modal title={item ? "Edit Contact" : "Add Contact"} onClose={onClose} footer={<><button className="btn btn-g" onClick={onClose}>Cancel</button><button className="btn btn-p" onClick={() => onSave(f)}>Save</button></>}>
      <div className="fg">
        <div className="fi"><label>Company Name</label><input value={f.company} onChange={e => u("company", e.target.value)} /></div>
        <div className="fi"><label>Contact Person</label><input value={f.name} onChange={e => u("name", e.target.value)} /></div>
        <div className="fi"><label>Title</label><input value={f.title} onChange={e => u("title", e.target.value)} placeholder="Purchasing Mgr, Owner..." /></div>
        <div className="fi"><label>Phone</label><input value={f.phone} onChange={e => u("phone", e.target.value)} /></div>
        <div className="fi"><label>Email</label><input value={f.email} onChange={e => u("email", e.target.value)} /></div>
        <div className="fi"><label>Address</label><input value={f.address} onChange={e => u("address", e.target.value)} /></div>
        <div className="fi full"><label>Notes</label><textarea value={f.notes} onChange={e => u("notes", e.target.value)} placeholder="Customer preferences, history, etc." /></div>
      </div>
    </Modal>
  );
}

function CallForm({ item, contacts, onSave, onClose }) {
  const [f, setF] = useState(item || { contactId: contacts[0]?.id || "", date: today(), time: "", who: "", what: "", where: "", productsDiscussed: "", outcome: "", followUp: "" });
  const u = (k, v) => setF(p => ({ ...p, [k]: v }));
  const selContact = contacts.find(c => c.id === f.contactId);
  return (
    <Modal title={item ? "Edit Sales Call" : "Log Sales Call"} onClose={onClose} footer={<><button className="btn btn-g" onClick={onClose}>Cancel</button><button className="btn btn-p" onClick={() => onSave(f)}>Save</button></>}>
      <div className="fg">
        <div className="fi"><label>Company</label><select value={f.contactId} onChange={e => { u("contactId", e.target.value); const c = contacts.find(x => x.id === e.target.value); if (c) u("who", c.name); }}>{contacts.map(c => <option key={c.id} value={c.id}>{c.company}</option>)}</select></div>
        <div className="fi"><label>Spoke With</label><input value={f.who} onChange={e => u("who", e.target.value)} placeholder="Contact name" /></div>
        <div className="fi"><label>Date</label><input type="date" value={f.date} onChange={e => u("date", e.target.value)} /></div>
        <div className="fi"><label>Time</label><input type="time" value={f.time} onChange={e => u("time", e.target.value)} /></div>
        <div className="fi full"><label>Where (Location / Phone / Zoom)</label><input value={f.where} onChange={e => u("where", e.target.value)} placeholder="Phone, Zoom, their office, jobsite..." /></div>
        <div className="fi full"><label>Products Discussed</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
            {PRODUCT_LINES.map(pl => {
              const sel = (f.productsDiscussed || "").split(",").map(s => s.trim()).filter(Boolean);
              const isOn = sel.includes(pl);
              return <span key={pl} onClick={() => { const next = isOn ? sel.filter(s => s !== pl) : [...sel, pl]; u("productsDiscussed", next.join(",")); }} style={{ padding: "3px 8px", borderRadius: 5, fontSize: 10, fontWeight: 600, cursor: "pointer", background: isOn ? "var(--cyan-s)" : "var(--bg4)", color: isOn ? "var(--cyan)" : "var(--text3)", border: `1px solid ${isOn ? "var(--cyan)" : "var(--border)"}` }}>{pl}</span>;
            })}
          </div>
        </div>
        <div className="fi full"><label>What Was Discussed</label><textarea value={f.what} onChange={e => u("what", e.target.value)} rows={3} placeholder="Details of the conversation..." /></div>
        <div className="fi full"><label>Outcome</label><input value={f.outcome} onChange={e => u("outcome", e.target.value)} placeholder="Result of the call..." /></div>
        <div className="fi full"><label>Follow Up Needed</label><textarea value={f.followUp} onChange={e => u("followUp", e.target.value)} placeholder="Next steps..." /></div>
      </div>
    </Modal>
  );
}

function TaskForm({ item, contacts, onSave, onClose }) {
  const [f, setF] = useState(item || { contactId: contacts[0]?.id || "", type: "Quote Order", title: "", due: today(), priority: "medium", notes: "" });
  const u = (k, v) => setF(p => ({ ...p, [k]: v }));
  return (
    <Modal title={item ? "Edit Task" : "New Task"} onClose={onClose} footer={<><button className="btn btn-g" onClick={onClose}>Cancel</button><button className="btn btn-p" onClick={() => onSave(f)}>Save</button></>}>
      <div className="fg">
        <div className="fi"><label>Type</label><select value={f.type} onChange={e => u("type", e.target.value)}>{TASK_TYPES.map(t => <option key={t}>{t}</option>)}</select></div>
        <div className="fi"><label>Company</label><select value={f.contactId} onChange={e => u("contactId", e.target.value)}>{contacts.map(c => <option key={c.id} value={c.id}>{c.company}</option>)}</select></div>
        <div className="fi full"><label>Task Description</label><input value={f.title} onChange={e => u("title", e.target.value)} placeholder="What needs to be done..." /></div>
        <div className="fi"><label>Due Date</label><input type="date" value={f.due} onChange={e => u("due", e.target.value)} /></div>
        <div className="fi"><label>Priority</label><select value={f.priority} onChange={e => u("priority", e.target.value)}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></div>
        <div className="fi full"><label>Notes</label><textarea value={f.notes} onChange={e => u("notes", e.target.value)} /></div>
      </div>
    </Modal>
  );
}

function EventForm({ item, contacts, onSave, onClose }) {
  const [f, setF] = useState(item || { date: today(), time: "09:00", endTime: "10:00", title: "", type: "call", contactId: "", notes: "" });
  const u = (k, v) => setF(p => ({ ...p, [k]: v }));
  return (
    <Modal title={item ? "Edit Event" : "Add Event"} onClose={onClose} footer={<><button className="btn btn-g" onClick={onClose}>Cancel</button><button className="btn btn-p" onClick={() => onSave(f)}>Save</button></>}>
      <div className="fg">
        <div className="fi full"><label>Event Title</label><input value={f.title} onChange={e => u("title", e.target.value)} placeholder="Meeting with..." /></div>
        <div className="fi"><label>Type</label><select value={f.type} onChange={e => u("type", e.target.value)}><option value="call">Call</option><option value="meeting">Meeting</option><option value="site_visit">Site Visit</option><option value="trade_show">Trade Show</option></select></div>
        <div className="fi"><label>Company (optional)</label><select value={f.contactId} onChange={e => u("contactId", e.target.value)}><option value="">— None —</option>{contacts.map(c => <option key={c.id} value={c.id}>{c.company}</option>)}</select></div>
        <div className="fi"><label>Date</label><input type="date" value={f.date} onChange={e => u("date", e.target.value)} /></div>
        <div className="fi"><label>Start Time</label><input type="time" value={f.time} onChange={e => u("time", e.target.value)} /></div>
        <div className="fi"><label>End Time</label><input type="time" value={f.endTime} onChange={e => u("endTime", e.target.value)} /></div>
        <div className="fi full"><label>Notes</label><textarea value={f.notes} onChange={e => u("notes", e.target.value)} /></div>
      </div>
    </Modal>
  );
}

function FuelForm({ item, onSave, onClose }) {
  const [f, setF] = useState(item || { date: today(), gallons: "", pricePerGal: "", total: "", mileage: "", station: "" });
  const u = (k, v) => { const n = { ...f, [k]: v }; if ((k === "gallons" || k === "pricePerGal") && n.gallons && n.pricePerGal) n.total = (parseFloat(n.gallons) * parseFloat(n.pricePerGal)).toFixed(2); setF(n); };
  return (
    <Modal title={item ? "Edit Fuel Entry" : "Add Fuel Entry"} onClose={onClose} footer={<><button className="btn btn-g" onClick={onClose}>Cancel</button><button className="btn btn-p" onClick={() => onSave({ ...f, gallons: +f.gallons, pricePerGal: +f.pricePerGal, total: +f.total, mileage: +f.mileage })}>Save</button></>}>
      <div className="fg">
        <div className="fi"><label>Date</label><input type="date" value={f.date} onChange={e => u("date", e.target.value)} /></div>
        <div className="fi"><label>Station</label><input value={f.station} onChange={e => u("station", e.target.value)} /></div>
        <div className="fi"><label>Gallons</label><input type="number" step="0.01" value={f.gallons} onChange={e => u("gallons", e.target.value)} /></div>
        <div className="fi"><label>Price Per Gallon ($)</label><input type="number" step="0.01" value={f.pricePerGal} onChange={e => u("pricePerGal", e.target.value)} /></div>
        <div className="fi"><label>Total ($)</label><input type="number" step="0.01" value={f.total} readOnly style={{ opacity: .7 }} /></div>
        <div className="fi"><label>Current Mileage</label><input type="number" value={f.mileage} onChange={e => u("mileage", e.target.value)} /></div>
      </div>
    </Modal>
  );
}

function MaintForm({ item, onSave, onClose }) {
  const [f, setF] = useState(item || { date: today(), type: "Oil Change", cost: "", mileage: "", vendor: "", notes: "" });
  const u = (k, v) => setF(p => ({ ...p, [k]: v }));
  return (
    <Modal title={item ? "Edit Vehicle Expense" : "Add Vehicle Expense"} onClose={onClose} footer={<><button className="btn btn-g" onClick={onClose}>Cancel</button><button className="btn btn-p" onClick={() => onSave({ ...f, cost: +f.cost, mileage: +f.mileage })}>Save</button></>}>
      <div className="fg">
        <div className="fi"><label>Date</label><input type="date" value={f.date} onChange={e => u("date", e.target.value)} /></div>
        <div className="fi"><label>Type</label><select value={f.type} onChange={e => u("type", e.target.value)}>{MAINT_TYPES.map(t => <option key={t}>{t}</option>)}</select></div>
        <div className="fi"><label>Cost ($)</label><input type="number" step="0.01" value={f.cost} onChange={e => u("cost", e.target.value)} /></div>
        <div className="fi"><label>Mileage</label><input type="number" value={f.mileage} onChange={e => u("mileage", e.target.value)} /></div>
        <div className="fi"><label>Vendor</label><input value={f.vendor} onChange={e => u("vendor", e.target.value)} /></div>
        <div className="fi full"><label>Notes</label><textarea value={f.notes} onChange={e => u("notes", e.target.value)} /></div>
      </div>
    </Modal>
  );
}

function ExpenseForm({ item, onSave, onClose }) {
  const [f, setF] = useState(item || { date: today(), amount: "", category: "Client Meal", who: "", what: "", where: "", receipt: true });
  const u = (k, v) => setF(p => ({ ...p, [k]: v }));
  return (
    <Modal title={item ? "Edit Expense" : "Add Expense"} onClose={onClose} footer={<><button className="btn btn-g" onClick={onClose}>Cancel</button><button className="btn btn-p" onClick={() => onSave({ ...f, amount: +f.amount })}>Save</button></>}>
      <div className="fg">
        <div className="fi"><label>Date</label><input type="date" value={f.date} onChange={e => u("date", e.target.value)} /></div>
        <div className="fi"><label>Amount ($)</label><input type="number" step="0.01" value={f.amount} onChange={e => u("amount", e.target.value)} /></div>
        <div className="fi"><label>Category</label><select value={f.category} onChange={e => u("category", e.target.value)}>{EXPENSE_CATS.map(c => <option key={c}>{c}</option>)}</select></div>
        <div className="fi"><label>Has Receipt?</label><select value={f.receipt} onChange={e => u("receipt", e.target.value === "true")}><option value="true">Yes</option><option value="false">No</option></select></div>
        <div className="fi full"><label>Who (Contact/Client)</label><input value={f.who} onChange={e => u("who", e.target.value)} placeholder="Client name or Self" /></div>
        <div className="fi full"><label>What (Description)</label><textarea value={f.what} onChange={e => u("what", e.target.value)} /></div>
        <div className="fi full"><label>Where (Location)</label><input value={f.where} onChange={e => u("where", e.target.value)} /></div>
      </div>
    </Modal>
  );
}
