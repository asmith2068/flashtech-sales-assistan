import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "./supabaseClient";

// ─── SUPABASE DATA MAPPING ──────────────────────────────────
const mapContact = (r) => ({ id: r.id, repId: r.rep_id, company: r.company, name: r.name || "", title: r.title || "", phone: r.phone || "", email: r.email || "", address: r.address || "", notes: r.notes || "", created: r.created_at?.split("T")[0] || "" });
const mapCall = (r) => ({ id: r.id, repId: r.rep_id, contactId: r.contact_id, date: r.call_date, time: r.call_time || "", who: r.who || "", what: r.what || "", where: r.call_where || "", productsDiscussed: r.products_discussed || "", outcome: r.outcome || "", followUp: r.follow_up || "" });
const mapTask = (r) => ({ id: r.id, repId: r.rep_id, contactId: r.contact_id, type: r.task_type, title: r.title, due: r.due_date, priority: r.priority, status: r.status, notes: r.notes || "" });
const mapEvent = (r) => ({ id: r.id, repId: r.rep_id, contactId: r.contact_id || "", date: r.event_date, time: r.start_time || "", endTime: r.end_time || "", title: r.title, type: r.event_type, notes: r.notes || "" });
const mapFuel = (r) => ({ id: r.id, repId: r.rep_id, date: r.log_date, gallons: r.gallons, pricePerGal: r.price_per_gal, total: r.total, mileage: r.mileage, station: r.station || "", vehicleId: r.vehicle_id || "" });
const mapMaint = (r) => ({ id: r.id, repId: r.rep_id, date: r.log_date, type: r.maint_type, cost: r.cost, mileage: r.mileage, vendor: r.vendor || "", notes: r.notes || "", vehicleId: r.vehicle_id || "" });
const mapExpense = (r) => ({ id: r.id, repId: r.rep_id, date: r.expense_date, amount: r.amount, category: r.category, who: r.who || "", what: r.what || "", where: r.expense_where || "", receipt: r.has_receipt });
const mapUser = (r) => ({ id: r.id, name: r.name, email: r.email, password: r.password_hash, role: r.role, workEmail: r.work_email || "" });

const toDbContact = (d) => ({ rep_id: d.repId, company: d.company, name: d.name, title: d.title, phone: d.phone, email: d.email, address: d.address, notes: d.notes });
const toDbCall = (d) => ({ rep_id: d.repId, contact_id: d.contactId, call_date: d.date, call_time: d.time, who: d.who, what: d.what, call_where: d.where, products_discussed: d.productsDiscussed, outcome: d.outcome, follow_up: d.followUp });
const toDbTask = (d) => ({ rep_id: d.repId, contact_id: d.contactId, task_type: d.type, title: d.title, due_date: d.due, priority: d.priority, status: d.status || "pending", notes: d.notes });
const toDbEvent = (d) => ({ rep_id: d.repId, contact_id: d.contactId || null, event_date: d.date, start_time: d.time, end_time: d.endTime, title: d.title, event_type: d.type, notes: d.notes });
const toDbFuel = (d) => ({ rep_id: d.repId, log_date: d.date, gallons: d.gallons, price_per_gal: d.pricePerGal, total: d.total, mileage: d.mileage, station: d.station, vehicle_id: d.vehicleId });
const toDbMaint = (d) => ({ rep_id: d.repId, log_date: d.date, maint_type: d.type, cost: d.cost, mileage: d.mileage, vendor: d.vendor, notes: d.notes, vehicle_id: d.vehicleId });
const toDbExpense = (d) => ({ rep_id: d.repId, expense_date: d.date, amount: d.amount, category: d.category, who: d.who, what: d.what, expense_where: d.where, has_receipt: d.receipt });
const toDbUser = (d) => ({ name: d.name, email: d.email, password_hash: d.password, role: d.role, work_email: d.workEmail || null });

const DB_CONFIG = {
  contact: { table: "contacts", map: mapContact, toDb: toDbContact },
  call:    { table: "calls",    map: mapCall,    toDb: toDbCall },
  task:    { table: "tasks",    map: mapTask,    toDb: toDbTask },
  event:   { table: "events",   map: mapEvent,   toDb: toDbEvent },
  fuel:    { table: "fuel_log", map: mapFuel,    toDb: toDbFuel },
  maint:   { table: "maintenance", map: mapMaint, toDb: toDbMaint },
  expense: { table: "expenses", map: mapExpense, toDb: toDbExpense },
};

// ─── USERS ───────────────────────────────────────────────────
const INITIAL_USERS = [
  { id: "mgr1", name: "Andrew Smith", email: "andrew", password: "7663", role: "manager" },
  { id: "mgr2", name: "Lee Hornsby", email: "lee", password: "7663", role: "manager" },
  { id: "rep1", name: "Byron Cook", email: "byron", password: "Sales1", role: "rep" },
  { id: "rep2", name: "Marcia", email: "marcia", password: "sales2", role: "rep" },
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
  { id: "ct20", repId: "rep2", company: "Above It All Roofing", name: "", title: "", phone: "(949) 395-1300", email: "", address: "Orange County, CA", notes: "Veteran-owned. 27+ years. Resi roofing & repairs. Tailored solutions per home/budget. Clean jobsites", created: "2026-02-12" },
  { id: "ct21", repId: "rep2", company: "Prestige Roofing & Solar", name: "John Arellano", title: "Owner", phone: "(714) 867-5070", email: "", address: "Orange County, CA", notes: "Serves OC, LA, Riverside. Resi & commercial. All major roof systems. Also does solar. Lic #1059050", created: "2026-02-15" },
  { id: "ct22", repId: "rep2", company: "Meyers Roofing Co.", name: "", title: "", phone: "(562) 247-5241", email: "", address: "Southern California", notes: "Serves LA, OC, Long Beach, Santa Ana, Anaheim. Resi & commercial. Asphalt, tile, TPO. Storm damage restoration", created: "2026-02-18" },

  // ── RIVERSIDE COUNTY — Roofing Contractors ──
  { id: "ct23", repId: "rep2", company: "Rocket Roofing", name: "", title: "", phone: "(951) 710-7324", email: "", address: "27555 Ynez Rd Suite 110, Temecula, CA 92591", notes: "Serves Riverside, OC, San Bernardino, LA, SD. Resi & commercial. Inspections, repairs, maintenance", created: "2026-01-10" },
  { id: "ct24", repId: "rep2", company: "619 Roofing", name: "", title: "", phone: "(619) 304-4868", email: "", address: "Riverside / Orange / San Bernardino County, CA", notes: "#1 choice of HOAs, realtors, commercial & resi owners. Tile with 2-layer UDL, 30-yr warranty. 24/7 emergency", created: "2026-02-20" },
  { id: "ct25", repId: "rep2", company: "Infinity Roofers Inc.", name: "", title: "", phone: "(805) 855-8733", email: "", address: "Ventura / LA / OC / Riverside / San Bernardino", notes: "Resi & commercial. Asphalt shingle, flat, tile & metal roofs. Inspections. Diamond Certified", created: "2026-02-22" },

  // ── DISTRIBUTORS — All Counties ──
  { id: "ct26", repId: "rep1", company: "ABC Supply Co. — San Diego", name: "", title: "Branch Manager", phone: "(858) 278-8666", email: "", address: "San Diego, CA", notes: "DISTRIBUTOR — Largest wholesale roofing distributor in US. ~800 branches. Shingles, metal, single-ply, insulation, accessories", created: "2026-01-05" },
  { id: "ct27", repId: "rep2", company: "ABC Supply Co. — San Juan Capistrano", name: "", title: "Branch Manager", phone: "", email: "", address: "San Juan Capistrano, CA (Orange County)", notes: "DISTRIBUTOR — New location. Full line roofing, siding, windows, gutters. Serves south OC contractors", created: "2026-03-01" },
  { id: "ct28", repId: "rep1", company: "QXO / Beacon — San Diego (Kearny Villa)", name: "", title: "Branch Manager", phone: "(858) 279-5444", email: "", address: "5660 Kearny Villa Rd, San Diego, CA 92123", notes: "DISTRIBUTOR — Formerly Beacon Roofing Supply. Full line resi & commercial. Owens Corning, GAF, CertainTeed, Carlisle", created: "2026-01-08" },
  { id: "ct29", repId: "rep1", company: "QXO / Beacon — El Cajon", name: "", title: "Branch Manager", phone: "(619) 258-0022", email: "", address: "396 Raleigh Ave, El Cajon, CA 92020", notes: "DISTRIBUTOR — Serves east SD County: El Cajon, Santee, Lakeside, La Mesa, Spring Valley, Lemon Grove", created: "2026-01-10" },
  { id: "ct30", repId: "rep2", company: "QXO / Beacon — Orange", name: "", title: "Branch Manager", phone: "(714) 289-0044", email: "", address: "675 N Batavia St, Orange, CA 92868", notes: "DISTRIBUTOR — Serves OC: Orange, Santa Ana, Anaheim, Tustin, Huntington Beach, Newport, Costa Mesa, Irvine, Mission Viejo", created: "2026-01-12" },
  { id: "ct31", repId: "rep2", company: "QXO / Beacon — Norco (Riverside)", name: "", title: "Branch Manager", phone: "(951) 340-0607", email: "", address: "1606 Hamner Ave, Norco, CA 92860", notes: "DISTRIBUTOR — Serves Riverside County & Inland Empire contractors", created: "2026-01-15" },
  { id: "ct32", repId: "rep1", company: "RWC Building Products — Spring Valley", name: "", title: "Branch Manager", phone: "(619) 460-5200", email: "", address: "Spring Valley, CA (San Diego County)", notes: "DISTRIBUTOR — Leading SD County roofing supplier. Resi & commercial materials. Near CA-125. Roofing products only", created: "2026-01-18" },
  { id: "ct33", repId: "rep1", company: "SRS Building Products — San Diego", name: "", title: "Branch Manager", phone: "(858) 549-6959", email: "", address: "San Diego, CA", notes: "DISTRIBUTOR — Part of SRS Distribution (430+ branches nationwide). Asphalt, tile, metal, commercial. Major manufacturers", created: "2026-01-20" },
  { id: "ct34", repId: "rep2", company: "SRS Distribution — Los Angeles", name: "", title: "Branch Manager", phone: "", email: "", address: "Los Angeles, CA", notes: "DISTRIBUTOR — Fastest growing building products distributor in US. Full line roofing from all major manufacturers", created: "2026-01-22" },
  { id: "ct35", repId: "rep1", company: "RoofLine Supply & Delivery — San Diego", name: "", title: "Branch Manager", phone: "(619) 284-8611", email: "", address: "San Diego, CA", notes: "DISTRIBUTOR — Local roofing supply. Good selection, competitive pricing. Delivery available", created: "2026-02-01" },
];

const seedCalls = [];

const seedTasks = [];

const seedEvents = [];

const seedFuel = [];

const seedMaint = [];

const seedExpenses = [];

// ─── PRODUCT CATALOG DATA ────────────────────────────────────
const PRODUCTS = [
  { cat: "Closed Boots", desc: '1-6" Conical Boot', tpoPart: "WS-1001TPO", pvcPart: "WS-1001PVC", tR: 24.80, tW: 20.00, pR: 25.80, pW: 21.50 },
  { cat: "Closed Boots", desc: 'Compact Conical Boot', tpoPart: "WS-1005TPO", pvcPart: "WS-1005PVC", tR: 23.56, tW: null, pR: 24.56, pW: null },
  { cat: "Closed Boots", desc: '6-8" Conical Boot', tpoPart: "WS-1006TPO", pvcPart: "WS-1006PVC", tR: 32.00, tW: 27.00, pR: 33.00, pW: 28.00 },
  { cat: "Closed Boots", desc: '8-10" Conical Boot', tpoPart: "WS-1008TPO", pvcPart: "WS-1008PVC", tR: 36.00, tW: 29.00, pR: 37.00, pW: 31.00 },
  { cat: "Closed Boots", desc: '2" Pipe Flashing', tpoPart: "WS-1011TPO", pvcPart: "WS-1011PVC", tR: 27.90, tW: 19.00, pR: 28.90, pW: 20.00 },
  { cat: "Closed Boots", desc: '3" Pipe Flashing', tpoPart: "WS-1013TPO", pvcPart: "WS-1013PVC", tR: 30.90, tW: 21.00, pR: 31.90, pW: 22.00 },
  { cat: "Closed Boots", desc: '4" Vent Pipe Flashing', tpoPart: "WS-1015TPO", pvcPart: "WS-1015PVC", tR: 35.10, tW: 22.90, pR: 36.10, pW: 23.75 },
  { cat: "Closed Boots", desc: '6" Vent Pipe Flashing', tpoPart: "WS-1017TPO", pvcPart: "WS-1017PVC", tR: 41.50, tW: 27.50, pR: 42.50, pW: 28.50 },
  { cat: "Closed Boots", desc: '4" Square Wrap', tpoPart: "WS-1020TPO", pvcPart: "WS-1020PVC", tR: 37.50, tW: 25.50, pR: 38.50, pW: 26.50 },
  { cat: "Closed Boots", desc: '6" Square Wrap', tpoPart: "WS-1022TPO", pvcPart: "WS-1022PVC", tR: 40.00, tW: 26.25, pR: 41.00, pW: 28.25 },
  { cat: "Split Boots", desc: '1-6" Split Conical Boot', tpoPart: "WS-1002TPO", pvcPart: "WS-1002PVC", tR: 24.80, tW: 22.25, pR: 25.80, pW: 24.00 },
  { cat: "Split Boots", desc: 'Compact Split Conical Pipe Boot', tpoPart: "WS-1005TPO", pvcPart: "WS-1005PVC", tR: 23.56, tW: 19.00, pR: 23.56, pW: 20.50 },
  { cat: "Split Boots", desc: '6-8" Split Conical Boot', tpoPart: "WS-1007TPO", pvcPart: "WS-1007PVC", tR: 32.00, tW: 29.00, pR: 33.00, pW: 30.00 },
  { cat: "Split Boots", desc: '8-10" Split Conical Boot', tpoPart: "WS-1009TPO", pvcPart: "WS-1009PVC", tR: 36.00, tW: 30.00, pR: 37.00, pW: 31.00 },
  { cat: "Split Boots", desc: '1.5" Split Pipe Flashing', tpoPart: "WS-1010TPO", pvcPart: "WS-1010PVC", tR: 26.00, tW: 19.00, pR: 27.00, pW: 20.00 },
  { cat: "Split Boots", desc: '2" Split Pipe Flashing', tpoPart: "WS-1012TPO", pvcPart: "WS-1012PVC", tR: 28.90, tW: 19.50, pR: 29.90, pW: 20.50 },
  { cat: "Split Boots", desc: '3" Split Pipe Flashing', tpoPart: "WS-1014TPO", pvcPart: "WS-1014PVC", tR: 31.90, tW: 21.50, pR: 32.90, pW: 22.25 },
  { cat: "Split Boots", desc: '4" Split Pipe Flashing', tpoPart: "WS-1016TPO", pvcPart: "WS-1016PVC", tR: 36.10, tW: 23.25, pR: 37.10, pW: 24.00 },
  { cat: "Split Boots", desc: '6" Split Pipe Flashing', tpoPart: "WS-1018TPO", pvcPart: "WS-1018PVC", tR: 42.50, tW: 28.25, pR: 43.50, pW: null },
  { cat: "Split Boots", desc: '4" Split Square Wrap', tpoPart: "WS-1021TPO", pvcPart: "WS-1021PVC", tR: 38.50, tW: 27.75, pR: 39.50, pW: 28.75 },
  { cat: "Split Boots", desc: '6" Split Square Wrap', tpoPart: "WS-1023TPO", pvcPart: "WS-1023PVC", tR: 41.00, tW: 28.50, pR: 41.00, pW: 29.50 },
  { cat: "Scuppers", desc: '<10" Scupper Drain (4 sides)', tpoPart: "WSD-1001TPO", pvcPart: "WSD-1001PVC", tR: 107.50, tW: 59.75, pR: 110.00, pW: 59.75 },
  { cat: "Scuppers", desc: '<16" Scupper Drain (4 sides)', tpoPart: "WSD-1002TPO", pvcPart: "WSD-1002PVC", tR: 112.00, tW: 66.00, pR: 115.00, pW: 68.00 },
  { cat: "Scuppers", desc: '<24" Scupper Drain (4 sides)', tpoPart: "WSD-1003TPO", pvcPart: "WSD-1003PVC", tR: 135.00, tW: 70.25, pR: 136.00, pW: 71.75 },
  { cat: "Scuppers", desc: '<27" Scupper Drain (4 sides)', tpoPart: "WSD-1004TPO", pvcPart: "WSD-1004PVC", tR: 157.30, tW: 71.75, pR: 158.50, pW: 73.00 },
  { cat: "Scuppers", desc: '<34" Scupper Drain (4 sides)', tpoPart: "WSD-1005TPO", pvcPart: "WSD-1005PVC", tR: 181.50, tW: 73.50, pR: 183.00, pW: 75.50 },
  { cat: "Drains", desc: '2" Deck Drain Stainless Steel', tpoPart: "WS-2001SS", pvcPart: "WS-2001SS", tR: 55.00, tW: 42.00, pR: 56.00, pW: 42.00 },
  { cat: "Drains", desc: '3" Deck Drain Stainless Steel', tpoPart: "WS-2002SS", pvcPart: "WS-2002SS", tR: 57.00, tW: 45.00, pR: 58.00, pW: 45.00 },
  { cat: "Drains", desc: '2" Drain Insert (SS) Retro Fit', tpoPart: "WSD-1010TPO", pvcPart: "WSD-1010PVC", tR: 154.00, tW: 141.75, pR: 155.00, pW: 143.00 },
  { cat: "Drains", desc: '3" Drain Insert (SS) Retro Fit', tpoPart: "WSD-1012TPO", pvcPart: "WSD-1012PVC", tR: 168.00, tW: 162.75, pR: 168.00, pW: 156.00 },
  { cat: "Drains", desc: '2" Bowl Drain', tpoPart: "WSD-1020TPO", pvcPart: "WSD-1020PVC", tR: 162.00, tW: 135.25, pR: 163.00, pW: 138.50 },
  { cat: "Drains", desc: '2" Bowl Drain Side Outlet', tpoPart: "WSD-1021TPO", pvcPart: "WSD-1021PVC", tR: 214.50, tW: 165.75, pR: 215.50, pW: 168.00 },
  { cat: "Drains", desc: '2" Bowl Drain w/ Overflow', tpoPart: "WSD-1022TPO", pvcPart: "WSD-1022PVC", tR: 210.00, tW: 168.00, pR: 212.00, pW: 170.00 },
  { cat: "Drains", desc: '3" Bowl Drain', tpoPart: "WSD-1023TPO", pvcPart: "WSD-1023PVC", tR: 185.00, tW: 147.00, pR: 187.00, pW: 149.00 },
  { cat: "Drains", desc: '3" Bowl Drain Side Outlet', tpoPart: "WSD-1024TPO", pvcPart: "WSD-1024PVC", tR: 225.00, tW: 181.00, pR: 227.00, pW: 186.75 },
  { cat: "Drains", desc: '3" Bowl Drain w/ Overflow', tpoPart: "WSD-1025TPO", pvcPart: "WSD-1025PVC", tR: 230.00, tW: 189.00, pR: 235.00, pW: 191.00 },
  { cat: "Drains", desc: '4" Bowl Drain', tpoPart: "WSD-1026TPO", pvcPart: "WSD-1026PVC", tR: 245.00, tW: 205.00, pR: 247.00, pW: 215.00 },
  { cat: "Drains", desc: '4" Bowl Drain Side Outlet', tpoPart: "WSD-1027TPO", pvcPart: "WSD-1027PVC", tR: 289.00, tW: 250.00, pR: 290.00, pW: 260.00 },
  { cat: "Drains", desc: '4" Bowl Drain w/ Overflow', tpoPart: "WSD-1028TPO", pvcPart: "WSD-1028PVC", tR: 300.00, tW: 260.00, pR: 305.00, pW: 275.00 },
  { cat: "Gravity Vents", desc: '12" Gravity Vent', tpoPart: "WSG-1001TPO", pvcPart: "WSG-1001PVC", tR: 212.50, tW: 166.00, pR: 214.00, pW: 170.00 },
  { cat: "Gravity Vents", desc: '14" Gravity Vent', tpoPart: "WSG-1002TPO", pvcPart: "WSG-1002PVC", tR: 218.00, tW: 176.00, pR: 220.00, pW: 180.00 },
  { cat: "Gravity Vents", desc: '16" Gravity Vent', tpoPart: "WSG-1003TPO", pvcPart: "WSG-1003PVC", tR: 234.50, tW: 188.86, pR: 236.00, pW: 187.00 },
  { cat: "Gravity Vents", desc: '18" Gravity Vent', tpoPart: "WSG-1004TPO", pvcPart: "WSG-1004PVC", tR: 265.00, tW: 191.00, pR: 267.00, pW: 191.50 },
  { cat: "Gravity Vents", desc: '20" Gravity Vent', tpoPart: "WSG-1005TPO", pvcPart: "WSG-1005PVC", tR: 270.00, tW: 214.00, pR: 272.00, pW: 217.25 },
  { cat: "Gravity Vents", desc: '24" Gravity Vent', tpoPart: "WSG-1006TPO", pvcPart: "WSG-1006PVC", tR: 284.00, tW: 217.75, pR: 285.00, pW: 223.25 },
  { cat: "T-Top Vents", desc: '4" T-Top Vent', tpoPart: "WST-1001TPO", pvcPart: "WST-1001PVC", tR: 48.00, tW: 43.00, pR: 49.00, pW: 44.00 },
  { cat: "T-Top Vents", desc: '6" T-Top Vent', tpoPart: "WST-1002TPO", pvcPart: "WST-1002PVC", tR: 55.00, tW: 49.25, pR: 56.00, pW: 50.25 },
  { cat: "T-Top Vents", desc: '8" T-Top Vent', tpoPart: "WST-1003TPO", pvcPart: "WST-1003PVC", tR: 68.00, tW: 59.75, pR: 68.00, pW: 60.75 },
  { cat: "T-Top Vents", desc: '4" x 12" Rectangular T-Top Vent', tpoPart: "WST-1004TPO", pvcPart: "WST-1004PVC", tR: 130.00, tW: 105.00, pR: 132.00, pW: 110.25 },
  { cat: "Gable Vents", desc: '14" x 12" Gable Vent', tpoPart: "WSV-1001TPO", pvcPart: "WSV-1001PVC", tR: 125.00, tW: 102.75, pR: 127.00, pW: 102.75 },
  { cat: "Gable Vents", desc: '14" x 18" Gable Vent', tpoPart: "WSV-1002TPO", pvcPart: "WSV-1002PVC", tR: 135.00, tW: 110.25, pR: 135.00, pW: 110.25 },
  { cat: "Breather Vents", desc: '4" Breather Vent (One Way)', tpoPart: "WSV-1004TPO", pvcPart: "WSV-1004PVC", tR: 43.00, tW: 31.00, pR: 43.00, pW: 33.25 },
  { cat: "Breather Vents", desc: '4" Breather Vent (Two Way)', tpoPart: "WSV-1013TPO", pvcPart: "WSV-1013PVC", tR: 40.00, tW: 28.00, pR: 41.00, pW: 29.00 },
  { cat: "Turbine Vents", desc: '12" Turbine Roof Vent', tpoPart: "WSV-1005TPO", pvcPart: "WSV-1005PVC", tR: 125.00, tW: 114.25, pR: 126.00, pW: 116.50 },
  { cat: "Turbine Vents", desc: '14" Turbine Roof Vent', tpoPart: "WSV-1009TPO", pvcPart: "WSV-1009PVC", tR: 140.00, tW: 125.75, pR: 142.00, pW: 127.00 },
  { cat: "Wall Vents", desc: '4" Wall Mount Flapper / Dryer Vent', tpoPart: "WSV-1006TPO", pvcPart: "WSV-1006PVC", tR: 115.00, tW: 79.75, pR: 117.00, pW: 81.75 },
  { cat: "Sealant Pockets", desc: '4" Sealant Pocket', tpoPart: "WSP1005TPO", pvcPart: "WSP-1005PVC", tR: 37.00, tW: 29.75, pR: 38.00, pW: 32.00 },
  { cat: "Sealant Pockets", desc: '6" Sealant Pocket', tpoPart: "WSP-1006TPO", pvcPart: "WSP-1006PVC", tR: 42.00, tW: 37.25, pR: 43.00, pW: 39.25 },
  { cat: "Sealant Pockets", desc: '8" Sealant Pocket', tpoPart: "WSP-1007TPO", pvcPart: "WSP-1007PVC", tR: 51.00, tW: 45.50, pR: 52.00, pW: 46.00 },
  { cat: "Oval Flashings", desc: '4" Oval Flashing Sub Base', tpoPart: "WSV-1007TPO", pvcPart: "WSV-1007PVC", tR: 68.00, tW: 53.50, pR: 69.00, pW: 54.60 },
  { cat: "Oval Flashings", desc: '7" Oval Flashing Sub Base', tpoPart: "WSV-1008TPO", pvcPart: "WSV-1008PVC", tR: 75.00, tW: 63.00, pR: 76.00, pW: 66.00 },
  { cat: "Accessories", desc: 'Solar Anchor Boot', tpoPart: "WSA-1018", pvcPart: "WSA-1019", tR: 19.00, tW: 19.00, pR: 19.00, pW: 19.00 },
  { cat: "Accessories", desc: '3.5" Injection Molded Outside Corner', tpoPart: "WSA-1001TPO", pvcPart: "WSA-1001PVC", tR: 4.50, tW: 3.65, pR: 4.50, pW: 4.20 },
  { cat: "Accessories", desc: '6" Non-Reinforced Outside Corner', tpoPart: "WSA-1002TPO", pvcPart: "WSA-1002PVC", tR: 10.00, tW: 7.60, pR: 10.00, pW: 8.40 },
  { cat: "Accessories", desc: '6" Non-Reinforced Inside Corner', tpoPart: "WSA-1003TPO", pvcPart: "WSA-1003PVC", tR: 10.00, tW: 7.60, pR: 10.00, pW: 8.40 },
  { cat: "Accessories", desc: '4.5" T-Joint Cover (100 pc)', tpoPart: "WSA-1004TPO", pvcPart: "WSA-1004PVC", tR: 120.00, tW: 72.00, pR: 125.00, pW: 73.00 },
  { cat: "Accessories", desc: 'Rubber Coupler 2"', tpoPart: "WSA-1010", pvcPart: "WSA-1010", tR: 10.00, tW: 6.50, pR: 10.00, pW: 6.50 },
  { cat: "Accessories", desc: 'Rubber Coupler 3"', tpoPart: "WSA-1011", pvcPart: "WSA-1011", tR: 12.00, tW: 7.00, pR: 12.00, pW: 7.00 },
  { cat: "Accessories", desc: 'Clamp (1-6")', tpoPart: "WSA-1008", pvcPart: "WSA-1008", tR: 2.50, tW: 2.25, pR: 2.50, pW: 2.25 },
  { cat: "Accessories", desc: 'Hose Clamps 1.5" - 2.5"', tpoPart: "WSA-1014", pvcPart: "WSA-1014", tR: 2.25, tW: 2.00, pR: 2.25, pW: 2.00 },
  { cat: "Accessories", desc: 'Clamp (1/2" - 1.5")', tpoPart: "WSA-1013", pvcPart: "WSA-1013", tR: 2.00, tW: 1.95, pR: 2.00, pW: 1.95 },
  { cat: "Accessories", desc: 'Flat Roof Attachment', tpoPart: "WSA-1017", pvcPart: "WSA-1017", tR: 31.00, tW: 28.00, pR: 31.00, pW: 28.00 },
];
const PROD_CATS = [...new Set(PRODUCTS.map(p => p.cat))];

// ─── UTILITY ─────────────────────────────────────────────────
const uid = () => Math.random().toString(36).slice(2, 10);
const fmt = (n) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
const fmtDate = (d) => { if (!d) return ""; const dt = new Date(d + "T00:00:00"); return dt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }); };
const fmtShort = (d) => { if (!d) return ""; const dt = new Date(d + "T00:00:00"); return dt.toLocaleDateString("en-US", { month: "short", day: "numeric" }); };
const today = () => new Date().toISOString().split("T")[0];
const isOverdue = (due) => due < today();
const dayName = (d) => new Date(d + "T00:00:00").toLocaleDateString("en-US", { weekday: "short" });

// ─── EMAIL HELPERS ───────────────────────────────────────────
const openEmail = (to, subject, body) => {
  const s = encodeURIComponent(subject || "");
  const b = encodeURIComponent(body || "");
  window.open(`mailto:${to || ""}?subject=${s}&body=${b}`, "_self");
};
const buildFollowUpEmail = (call, contactCompany, contactEmail) => {
  const subject = `Follow Up — ${contactCompany} — Flash-Tech Mfg`;
  const body = `Hi,\n\nThank you for taking the time to speak with me on ${fmtDate(call.date)}.\n\nAs discussed:\n${call.what || ""}\n\nOutcome: ${call.outcome || ""}\n\nNext Steps: ${call.followUp || ""}\n\nPlease let me know if you have any questions.\n\nBest regards,\nFlash-Tech Mfg, Inc.\n(619) 334-9491\nsales@flash-techinc.com`;
  openEmail(contactEmail, subject, body);
};

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
  mail: "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zM22 6l-10 7L2 6",
  tag: "M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82zM7 7h.01",
  settings: "M12.22 2h-.44a2 2 0 00-2 2v.18a2 2 0 01-1 1.73l-.43.25a2 2 0 01-2 0l-.15-.08a2 2 0 00-2.73.73l-.22.38a2 2 0 00.73 2.73l.15.1a2 2 0 011 1.72v.51a2 2 0 01-1 1.74l-.15.09a2 2 0 00-.73 2.73l.22.38a2 2 0 002.73.73l.15-.08a2 2 0 012 0l.43.25a2 2 0 011 1.73V20a2 2 0 002 2h.44a2 2 0 002-2v-.18a2 2 0 011-1.73l.43-.25a2 2 0 012 0l.15.08a2 2 0 002.73-.73l.22-.39a2 2 0 00-.73-2.73l-.15-.08a2 2 0 01-1-1.74v-.5a2 2 0 011-1.74l.15-.09a2 2 0 00.73-2.73l-.22-.38a2 2 0 00-2.73-.73l-.15.08a2 2 0 01-2 0l-.43-.25a2 2 0 01-1-1.73V4a2 2 0 00-2-2zM12 15a3 3 0 100-6 3 3 0 000 6z",
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
  const [users, setUsers] = useState(INITIAL_USERS);
  const [contacts, setContacts] = useState(seedContacts);
  const [calls, setCalls] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [events, setEvents] = useState([]);
  const [fuel, setFuel] = useState([]);
  const [maint, setMaint] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [page, setPage] = useState("dashboard");
  const [modal, setModal] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [mgrView, setMgrView] = useState("all");
  const [showNotifs, setShowNotifs] = useState(false);
  const [reportRange, setReportRange] = useState("weekly");
  const [loading, setLoading] = useState(false);

  // ── LOAD ALL DATA FROM SUPABASE ──
  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), 8000));
      const dataPromise = Promise.all([
        supabase.from("contacts").select("*"),
        supabase.from("calls").select("*"),
        supabase.from("tasks").select("*"),
        supabase.from("events").select("*"),
        supabase.from("fuel_log").select("*"),
        supabase.from("maintenance").select("*"),
        supabase.from("expenses").select("*"),
        supabase.from("users").select("*"),
        supabase.from("vehicles").select("*"),
      ]);
      const [cRes, clRes, tRes, eRes, fRes, mRes, exRes, uRes, vRes] = await Promise.race([dataPromise, timeoutPromise]);
      if (cRes.data) setContacts(cRes.data.map(mapContact));
      if (clRes.data) setCalls(clRes.data.map(mapCall));
      if (tRes.data) setTasks(tRes.data.map(mapTask));
      if (eRes.data) setEvents(eRes.data.map(mapEvent));
      if (fRes.data) setFuel(fRes.data.map(mapFuel));
      if (mRes.data) setMaint(mRes.data.map(mapMaint));
      if (exRes.data) setExpenses(exRes.data.map(mapExpense));
      if (uRes.data) setUsers(uRes.data.map(mapUser));
      if (vRes.data) setVehicles(vRes.data.map(v => v.name));
    } catch (err) { console.warn("Database sync unavailable:", err.message || err); }
    setLoading(false);
  }, []);

  // Refresh data every 30 seconds so changes from other devices appear
  useEffect(() => {
    if (!user) return;
    loadAll();
    const interval = setInterval(loadAll, 30000);
    return () => clearInterval(interval);
  }, [user, loadAll]);

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

  if (!user) return <LoginScreen onLogin={(u) => { setUser(u); }} users={users} loadUsers={async () => {
    try {
      const { data } = await supabase.from("users").select("*");
      if (data && data.length > 0) { const mapped = data.map(mapUser); setUsers(mapped); return mapped; }
    } catch (err) { console.warn("Could not load users from database:", err); }
    return INITIAL_USERS;
  }} />;

  const getContact = (id) => contacts.find(c => c.id === id);
  const getContactName = (id) => { const c = getContact(id); return c ? c.company : "—"; };
  const getRep = (id) => users.find(u => u.id === id)?.name || "—";
  const reps = users.filter(u => u.role === "rep");
  const isRep = user.role === "rep";
  const isMgr = user.role === "manager";

  const open = (m, item = null) => { setEditItem(item); setModal(m); };
  const close = () => { setModal(null); setEditItem(null); };

  // ── SUPABASE CRUD ──
  const save = async (type, data) => {
    const cfg = DB_CONFIG[type];
    const setters = { contact: setContacts, call: setCalls, task: setTasks, event: setEvents, fuel: setFuel, maint: setMaint, expense: setExpenses };
    const repId = data._assignTo || user.id;
    const clean = { ...data, repId };
    delete clean._assignTo;
    delete clean.id;

    if (data.id) {
      // UPDATE
      const dbData = cfg.toDb(clean);
      await supabase.from(cfg.table).update(dbData).eq("id", data.id);
      setters[type](p => p.map(i => i.id === data.id ? { ...clean, id: data.id } : i));
    } else {
      // INSERT
      const dbData = cfg.toDb({ ...clean, repId });
      const { data: inserted } = await supabase.from(cfg.table).insert(dbData).select();
      if (inserted && inserted[0]) {
        setters[type](p => [...p, cfg.map(inserted[0])]);
      }
    }
    close();
  };

  const saveTask = async (data) => {
    const repId = data._assignTo || user.id;
    const clean = { ...data, repId, status: data.status || "pending" };
    delete clean._assignTo;
    delete clean.id;
    // Always add to local state immediately
    const localId = uid();
    const localTask = { ...clean, id: localId };
    setTasks(p => [...p, localTask]);
    // Then try to save to database
    try {
      const dbData = toDbTask(clean);
      const { data: inserted } = await supabase.from("tasks").insert(dbData).select();
      if (inserted && inserted[0]) {
        // Replace local temp entry with the real database entry
        setTasks(p => p.map(t => t.id === localId ? mapTask(inserted[0]) : t));
      }
    } catch (err) { console.warn("Task save to DB failed:", err); }
  };

  const del = async (type, id) => {
    const cfg = DB_CONFIG[type];
    const setters = { contact: setContacts, call: setCalls, task: setTasks, event: setEvents, fuel: setFuel, maint: setMaint, expense: setExpenses };
    await supabase.from(cfg.table).delete().eq("id", id);
    setters[type](p => p.filter(i => i.id !== id));
  };

  const toggleTask = async (id) => {
    const t = tasks.find(t => t.id === id);
    if (!t) return;
    const newStatus = t.status === "done" ? "pending" : "done";
    await supabase.from("tasks").update({ status: newStatus }).eq("id", id);
    setTasks(p => p.map(t => t.id === id ? { ...t, status: newStatus } : t));
  };

  const saveUser = async (data) => {
    // Validate required fields
    if (!data.name || !data.email || !data.password) {
      alert("Please fill in name, username, and password");
      return;
    }
    if (data.id) {
      // UPDATE
      setUsers(p => p.map(u => u.id === data.id ? data : u));
      try { await supabase.from("users").update(toDbUser(data)).eq("id", data.id); }
      catch (err) { console.warn("User update DB save failed:", err); }
    } else {
      // INSERT — add locally first so UI updates immediately
      const localId = uid();
      const localUser = { ...data, id: localId };
      setUsers(p => [...p, localUser]);
      try {
        const { data: inserted, error } = await supabase.from("users").insert(toDbUser(data)).select();
        if (error) throw error;
        if (inserted && inserted[0]) {
          setUsers(p => p.map(u => u.id === localId ? mapUser(inserted[0]) : u));
        }
      } catch (err) { console.warn("User insert DB save failed:", err); }
    }
    close();
  };

  const delUser = async (id) => {
    await supabase.from("users").delete().eq("id", id);
    setUsers(p => p.filter(u => u.id !== id));
  };

  const saveVehicle = async (name) => {
    const { data: inserted } = await supabase.from("vehicles").insert({ name }).select();
    if (inserted) setVehicles(p => [...p, name]);
  };

  const delVehicle = async (name) => {
    await supabase.from("vehicles").delete().eq("name", name);
    setVehicles(p => p.filter(v => v !== name));
  };

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
    { s: "CATALOG" },
    { id: "products", icon: IC.tag, label: "Product Catalog" },
    { id: "quotes", icon: IC.report, label: "Create Quote" },
    { s: "ADMIN" },
    ...(isMgr ? [{ id: "team", icon: IC.users, label: "Team Overview" }] : []),
    ...(isMgr ? [{ id: "admin", icon: IC.settings, label: "Manage Users" }] : []),
    { id: "reports", icon: IC.report, label: "Reports" },
  ];

  const pg = () => {
    switch (page) {
      case "dashboard": return <Dashboard user={user} contacts={contacts} calls={my(calls)} tasks={my(tasks)} events={my(events)} fuel={my(fuel)} maint={my(maint)} expenses={my(expenses)} overdue={myOverdue} setPage={setPage} getContactName={getContactName} getRep={getRep} />;
      case "contacts": return <Contacts contacts={contacts} isRep={isRep} isMgr={isMgr} getRep={getRep} onAdd={() => open("contact")} onEdit={c => open("contact", c)} onDel={id => del("contact", id)} />;
      case "calls": return <Calls calls={my(calls)} contacts={contacts} isRep={isRep} isMgr={isMgr} getContactName={getContactName} getContact={getContact} getRep={getRep} onAdd={() => open("call")} onEdit={c => open("call", c)} onDel={id => del("call", id)} />;
      case "tasks": return <Tasks tasks={my(tasks)} isRep={isRep} isMgr={isMgr} getContactName={getContactName} getRep={getRep} onAdd={() => open("task")} onEdit={t => open("task", t)} onToggle={toggleTask} onDel={id => del("task", id)} />;
      case "calendar": return <Calendar events={my(events)} tasks={my(tasks)} isRep={isRep} isMgr={isMgr} getContactName={getContactName} onAdd={() => open("event")} onEdit={e => open("event", e)} />;
      case "vehicle": return <Vehicle fuel={my(fuel)} maint={my(maint)} isRep={isRep} isMgr={isMgr} getRep={getRep} onAddF={() => open("fuel")} onAddM={() => open("maint")} onEditF={f => open("fuel", f)} onEditM={m => open("maint", m)} onDelF={id => del("fuel", id)} onDelM={id => del("maint", id)} />;
      case "expenses": return <Expenses expenses={my(expenses)} isRep={isRep} isMgr={isMgr} getRep={getRep} onAdd={() => open("expense")} onEdit={e => open("expense", e)} onDel={id => del("expense", id)} />;
      case "products": return <ProductCatalog />;
      case "quotes": return <QuoteBuilder contacts={contacts} user={user} />;
      case "team": return isMgr ? <Team users={users} tasks={tasks} contacts={contacts} calls={calls} expenses={expenses} fuel={fuel} maint={maint} mgrView={mgrView} setMgrView={setMgrView} setPage={setPage} /> : null;
      case "admin": return isMgr ? <AdminPage users={users} vehicles={vehicles} onEdit={u => open("user", u)} onAdd={() => open("user")} onDel={delUser} onAddVehicle={saveVehicle} onDelVehicle={delVehicle} /> : null;
      case "reports": return <Reports user={user} contacts={contacts} calls={my(calls)} tasks={my(tasks)} events={my(events)} fuel={my(fuel)} maint={my(maint)} expenses={my(expenses)} getContactName={getContactName} getRep={getRep} range={reportRange} setRange={setReportRange} />;
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
            {isMgr && <div style={{ padding: "4px 12px 8px" }}><select value={mgrView} onChange={e => setMgrView(e.target.value)} style={{ width: "100%", fontSize: 10, padding: "5px 6px" }}><option value="all">All Reps</option>{users.filter(u => u.role === "rep").map(u => <option key={u.id} value={u.id}>{u.name}</option>)}</select></div>}
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
              {loading && <span style={{ fontSize: 10, color: "var(--accent)", marginRight: 8 }}>Syncing...</span>}
              <button className="btn btn-g btn-ic" title="Refresh data" onClick={loadAll} style={{ marginRight: 4 }}>↻</button>
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

      {modal === "contact" && <ContactForm item={editItem} isMgr={isMgr} reps={reps} onSave={d => save("contact", d)} onClose={close} />}
      {modal === "call" && <CallForm item={editItem} contacts={contacts} isMgr={isMgr} reps={reps} onSave={d => save("call", d)} onSaveTask={saveTask} onClose={close} />}
      {modal === "task" && <TaskForm item={editItem} contacts={contacts} isMgr={isMgr} reps={reps} onSave={d => save("task", d)} onClose={close} />}
      {modal === "event" && <EventForm item={editItem} contacts={contacts} isMgr={isMgr} reps={reps} onSave={d => save("event", d)} onClose={close} />}
      {modal === "fuel" && <FuelForm item={editItem} vehicles={vehicles} isMgr={isMgr} reps={reps} onSave={d => save("fuel", d)} onClose={close} />}
      {modal === "maint" && <MaintForm item={editItem} vehicles={vehicles} isMgr={isMgr} reps={reps} onSave={d => save("maint", d)} onClose={close} />}
      {modal === "expense" && <ExpenseForm item={editItem} isMgr={isMgr} reps={reps} onSave={d => save("expense", d)} onClose={close} />}
      {modal === "user" && <UserForm item={editItem} onSave={saveUser} onClose={close} />}
    </>
  );
}

// ═════════════════════════════════════════════════════════════
// LOGIN
// ═════════════════════════════════════════════════════════════
function LoginScreen({ onLogin, users, loadUsers }) {
  const [e, setE] = useState(""); const [p, setP] = useState(""); const [err, setErr] = useState(""); const [allUsers, setAllUsers] = useState(INITIAL_USERS);
  useEffect(() => {
    // Try to load from Supabase with a 5-second timeout — fall back to built-in users
    const timeout = setTimeout(() => {}, 5000);
    const racePromise = Promise.race([
      loadUsers(),
      new Promise(resolve => setTimeout(() => resolve(null), 5000))
    ]);
    racePromise.then(u => {
      clearTimeout(timeout);
      if (u && u.length > 0) setAllUsers(u);
    }).catch(() => {});
  }, []);
  const go = () => { const u = allUsers.find(u => u.email === e && u.password === p); if (u) onLogin(u); else setErr("Invalid username or password"); };
  return (
    <><style>{CSS}</style>
      <div className="lp"><div className="lb-box">
        <h1>Flash<span style={{fontWeight:800}}>T</span>ech</h1>
        <div className="sub">Sales Assistant</div>
        <p>Sign in to continue</p>
        <div className="fi"><label>Username</label><input value={e} onChange={v => setE(v.target.value)} placeholder="Enter username" onKeyDown={v => v.key === "Enter" && go()} /></div>
        <div className="fi" style={{ marginTop: 10 }}><label>Password</label><input type="password" value={p} onChange={v => setP(v.target.value)} placeholder="Enter password" onKeyDown={v => v.key === "Enter" && go()} /></div>
        <button className="btn btn-p" onClick={go}>Sign In</button>
        {err && <div className="le">{err}</div>}
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
        <button className="btn btn-p" onClick={onAdd}><I d={IC.plus} s={13} /> Add Contact</button>
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
                <td style={{ whiteSpace: "nowrap" }}>
                  {c.email && <button className="btn btn-sm btn-ic" style={{ background: "var(--accent-s)", color: "var(--accent)", marginRight: 4 }} title="Send email" onClick={() => openEmail(c.email, `Flash-Tech Mfg — ${c.company}`, `Hi ${c.name || ""},\n\nI'm reaching out from Flash-Tech Mfg regarding our single-ply roofing accessories.\n\nBest regards,\nFlash-Tech Mfg, Inc.\n(619) 334-9491`)}><I d={IC.mail} s={12} /></button>}
                  <button className="btn btn-g btn-sm btn-ic" onClick={() => onEdit(c)}><I d={IC.edit} s={12} /></button>
                  {(isRep || isMgr) && <button className="btn btn-d btn-sm btn-ic" style={{ marginLeft: 4 }} onClick={() => onDel(c.id)}><I d={IC.trash} s={12} /></button>}
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
function Calls({ calls, contacts, isRep, isMgr, getContactName, getContact, getRep, onAdd, onEdit, onDel }) {
  return (
    <div>
      {(isRep || isMgr) && <div style={{ marginBottom: 14 }}><button className="btn btn-p" onClick={onAdd}><I d={IC.plus} s={13} /> Log Sales Call</button></div>}
      <div className="tw">
        <table>
          <thead><tr><th>Date</th><th>Time</th>{isMgr && <th>Rep</th>}<th>Company</th><th>Spoke With</th><th>Where</th><th>Products</th><th>Discussion</th><th>Outcome</th><th>Follow Up</th><th></th></tr></thead>
          <tbody>
            {calls.sort((a, b) => b.date.localeCompare(a.date)).map(c => {
              const contact = getContact(c.contactId);
              return (
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
                <td style={{ whiteSpace: "nowrap" }}>
                  {contact?.email && <button className="btn btn-sm btn-ic" style={{ background: "var(--accent-s)", color: "var(--accent)", marginRight: 4 }} title="Send follow-up email" onClick={() => buildFollowUpEmail(c, contact.company, contact.email)}><I d={IC.mail} s={12} /></button>}
                  <button className="btn btn-g btn-sm btn-ic" onClick={() => onEdit(c)}><I d={IC.edit} s={12} /></button>
                  {isMgr && <button className="btn btn-d btn-sm btn-ic" style={{ marginLeft: 4 }} onClick={() => { if (confirm("Delete this sales call?")) onDel(c.id); }}><I d={IC.trash} s={12} /></button>}
                </td>
              </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
// TASKS
// ═════════════════════════════════════════════════════════════
function Tasks({ tasks, isRep, isMgr, getContactName, getRep, onAdd, onEdit, onToggle, onDel }) {
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
        {(isRep || isMgr) && <button className="btn btn-p" onClick={onAdd}><I d={IC.plus} s={13} /> New Task</button>}
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
                <td style={{ whiteSpace: "nowrap" }}>
                  <button className="btn btn-g btn-sm btn-ic" onClick={() => onEdit(t)}><I d={IC.edit} s={12} /></button>
                  {isMgr && <button className="btn btn-d btn-sm btn-ic" style={{ marginLeft: 4 }} onClick={() => { if (confirm("Delete this task?")) onDel(t.id); }}><I d={IC.trash} s={12} /></button>}
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
// CALENDAR
// ═════════════════════════════════════════════════════════════
function Calendar({ events, tasks, isRep, isMgr, getContactName, onAdd, onEdit }) {
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
        {(isRep || isMgr) && <button className="btn btn-p" onClick={onAdd}><I d={IC.plus} s={13} /> Add Event</button>}
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
function Vehicle({ fuel, maint, isRep, isMgr, getRep, onAddF, onAddM, onEditF, onEditM, onDelF, onDelM }) {
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
        {(isRep || isMgr) && (tab === "fuel" ? <button className="btn btn-p" onClick={onAddF}><I d={IC.plus} s={13} /> Add Fuel</button> : <button className="btn btn-p" onClick={onAddM}><I d={IC.plus} s={13} /> Add Expense</button>)}
      </div>
      {tab === "fuel" ? (
        <div className="tw"><table>
          <thead><tr><th>Date</th>{isMgr && <th>Rep</th>}<th>Vehicle</th><th>Station</th><th>Gallons</th><th>$/Gal</th><th>Total</th><th>Mileage</th><th></th></tr></thead>
          <tbody>{fuel.sort((a, b) => b.date.localeCompare(a.date)).map(f => (
            <tr key={f.id}><td>{fmtShort(f.date)}</td>{isMgr && <td>{getRep(f.repId)}</td>}<td style={{ fontSize: 11 }}>{f.vehicleId || "—"}</td><td>{f.station}</td><td>{f.gallons}</td><td>${Number(f.pricePerGal).toFixed(2)}</td><td style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 600 }}>{fmt(f.total)}</td><td>{Number(f.mileage).toLocaleString()}</td><td style={{ whiteSpace: "nowrap" }}><button className="btn btn-g btn-sm btn-ic" onClick={() => onEditF(f)}><I d={IC.edit} s={12} /></button>{isMgr && <button className="btn btn-d btn-sm btn-ic" style={{ marginLeft: 4 }} onClick={() => { if (confirm("Delete this fuel entry?")) onDelF(f.id); }}><I d={IC.trash} s={12} /></button>}</td></tr>
          ))}</tbody>
        </table></div>
      ) : (
        <div className="tw"><table>
          <thead><tr><th>Date</th>{isMgr && <th>Rep</th>}<th>Vehicle</th><th>Type</th><th>Vendor</th><th>Cost</th><th>Mileage</th><th>Notes</th><th></th></tr></thead>
          <tbody>{maint.sort((a, b) => b.date.localeCompare(a.date)).map(m => (
            <tr key={m.id}><td>{fmtShort(m.date)}</td>{isMgr && <td>{getRep(m.repId)}</td>}<td style={{ fontSize: 11 }}>{m.vehicleId || "—"}</td><td style={{ fontWeight: 600 }}>{m.type}</td><td>{m.vendor}</td><td style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 600 }}>{fmt(m.cost)}</td><td>{Number(m.mileage).toLocaleString()}</td><td style={{ fontSize: 11 }}>{m.notes}</td><td style={{ whiteSpace: "nowrap" }}><button className="btn btn-g btn-sm btn-ic" onClick={() => onEditM(m)}><I d={IC.edit} s={12} /></button>{isMgr && <button className="btn btn-d btn-sm btn-ic" style={{ marginLeft: 4 }} onClick={() => { if (confirm("Delete this maintenance entry?")) onDelM(m.id); }}><I d={IC.trash} s={12} /></button>}</td></tr>
          ))}</tbody>
        </table></div>
      )}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
// EXPENSES
// ═════════════════════════════════════════════════════════════
function Expenses({ expenses, isRep, isMgr, getRep, onAdd, onEdit, onDel }) {
  const total = expenses.reduce((s, e) => s + e.amount, 0);
  const cats = [...new Set(expenses.map(e => e.category))];
  return (
    <div>
      <div className="stats">
        <div className="st"><div className="lb">Total Expenses</div><div className="vl" style={{ color: "var(--orange)" }}>{fmt(total)}</div><div className="su">{expenses.length} entries</div></div>
        {cats.map(cat => <div className="st" key={cat}><div className="lb">{cat}</div><div className="vl">{fmt(expenses.filter(e => e.category === cat).reduce((s, e) => s + e.amount, 0))}</div></div>)}
      </div>
      {(isRep || isMgr) && <div style={{ marginBottom: 14 }}><button className="btn btn-p" onClick={onAdd}><I d={IC.plus} s={13} /> Add Expense</button></div>}
      <div className="tw"><table>
        <thead><tr><th>Date</th>{isMgr && <th>Rep</th>}<th>Category</th><th>Amount</th><th>Who</th><th>What</th><th>Where</th><th>Receipt</th><th></th></tr></thead>
        <tbody>{expenses.sort((a, b) => b.date.localeCompare(a.date)).map(e => (
          <tr key={e.id}><td>{fmtShort(e.date)}</td>{isMgr && <td>{getRep(e.repId)}</td>}<td><span className="bg bg-pp">{e.category}</span></td><td style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 600 }}>{fmt(e.amount)}</td><td>{e.who}</td><td>{e.what}</td><td>{e.where}</td><td>{e.receipt ? <span className="bg bg-gr">Yes</span> : <span className="bg bg-rd">No</span>}</td><td style={{ whiteSpace: "nowrap" }}><button className="btn btn-g btn-sm btn-ic" onClick={() => onEdit(e)}><I d={IC.edit} s={12} /></button>{isMgr && <button className="btn btn-d btn-sm btn-ic" style={{ marginLeft: 4 }} onClick={() => { if (confirm("Delete this expense?")) onDel(e.id); }}><I d={IC.trash} s={12} /></button>}</td></tr>
        ))}</tbody>
      </table></div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
// PRODUCT CATALOG
// ═════════════════════════════════════════════════════════════
function ProductCatalog() {
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("All");
  const [matFilter, setMatFilter] = useState("Both");
  const filtered = PRODUCTS.filter(p => {
    const q = search.toLowerCase();
    const matchesSearch = !q || p.desc.toLowerCase().includes(q) || p.tpoPart.toLowerCase().includes(q) || p.pvcPart.toLowerCase().includes(q) || p.cat.toLowerCase().includes(q);
    const matchesCat = catFilter === "All" || p.cat === catFilter;
    return matchesSearch && matchesCat;
  });
  const $$ = (v) => v != null ? `$${v.toFixed(2)}` : "—";
  return (
    <div>
      <div className="stats">
        <div className="st"><div className="lb">Total Products</div><div className="vl" style={{ color: "var(--accent)" }}>{PRODUCTS.length}</div><div className="su">{PROD_CATS.length} categories</div></div>
        <div className="st"><div className="lb">Showing</div><div className="vl">{filtered.length}</div><div className="su">matching filters</div></div>
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap", alignItems: "center" }}>
        <input placeholder="Search part #, description..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: 260 }} />
        <select value={catFilter} onChange={e => setCatFilter(e.target.value)} style={{ fontSize: 12, padding: "7px 8px" }}>
          <option value="All">All Categories</option>
          {PROD_CATS.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <div className="tabs" style={{ marginLeft: "auto" }}>
          <div className={`tab ${matFilter === "Both" ? "act" : ""}`} onClick={() => setMatFilter("Both")}>Both</div>
          <div className={`tab ${matFilter === "TPO" ? "act" : ""}`} onClick={() => setMatFilter("TPO")}>TPO Only</div>
          <div className={`tab ${matFilter === "PVC" ? "act" : ""}`} onClick={() => setMatFilter("PVC")}>PVC Only</div>
        </div>
      </div>
      <div className="tw"><table>
        <thead><tr>
          <th style={{ minWidth: 140 }}>Category</th>
          <th style={{ minWidth: 220 }}>Description</th>
          {(matFilter === "Both" || matFilter === "TPO") && <><th>TPO Part #</th><th style={{ color: "var(--green)" }}>TPO Wholesale</th><th style={{ color: "var(--accent)" }}>TPO Retail</th></>}
          {(matFilter === "Both" || matFilter === "PVC") && <><th>PVC Part #</th><th style={{ color: "var(--green)" }}>PVC Wholesale</th><th style={{ color: "var(--accent)" }}>PVC Retail</th></>}
        </tr></thead>
        <tbody>
          {filtered.map((p, i) => (
            <tr key={i}>
              <td><span className="bg bg-cy">{p.cat}</span></td>
              <td style={{ fontWeight: 600 }}>{p.desc}</td>
              {(matFilter === "Both" || matFilter === "TPO") && <>
                <td style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11 }}>{p.tpoPart}</td>
                <td style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 600, color: "var(--green)" }}>{$$(p.tW)}</td>
                <td style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 600, color: "var(--accent)" }}>{$$(p.tR)}</td>
              </>}
              {(matFilter === "Both" || matFilter === "PVC") && <>
                <td style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11 }}>{p.pvcPart}</td>
                <td style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 600, color: "var(--green)" }}>{$$(p.pW)}</td>
                <td style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 600, color: "var(--accent)" }}>{$$(p.pR)}</td>
              </>}
            </tr>
          ))}
        </tbody>
      </table></div>
      <div style={{ marginTop: 12, fontSize: 10, color: "var(--text3)" }}>
        Flash-Tech Mfg, Inc. | 215 Denny Way Ste D, El Cajon, CA 92020 | (619) 334-9491 | sales@flash-techinc.com
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
// QUOTE BUILDER
// ═════════════════════════════════════════════════════════════
function QuoteBuilder({ contacts, user }) {
  const [customer, setCustomer] = useState({ company: "", contact: "", email: "", phone: "", jobName: "", location: "" });
  const [material, setMaterial] = useState("TPO");
  const [priceLevel, setPriceLevel] = useState("retail");
  const [lines, setLines] = useState([]);
  const [selProd, setSelProd] = useState("");
  const [qty, setQty] = useState(1);
  const [notes, setNotes] = useState("");
  const [contactId, setContactId] = useState("");

  const fillFromContact = (id) => {
    setContactId(id);
    const c = contacts.find(x => x.id === id);
    if (c) setCustomer({ company: c.company, contact: c.name, email: c.email, phone: c.phone, jobName: "", location: c.address });
  };
  const addLine = () => {
    const prod = PRODUCTS.find((p, i) => String(i) === selProd);
    if (!prod || qty < 1) return;
    const partNum = material === "TPO" ? prod.tpoPart : prod.pvcPart;
    const unitPrice = priceLevel === "wholesale" ? (material === "TPO" ? prod.tW : prod.pW) : (material === "TPO" ? prod.tR : prod.pR);
    if (unitPrice == null) { alert("No " + priceLevel + " price available for this item in " + material); return; }
    setLines(p => [...p, { desc: prod.desc, partNum, qty: +qty, unitPrice, total: +(qty * unitPrice).toFixed(2), cat: prod.cat }]);
    setQty(1);
  };
  const removeLine = (i) => setLines(p => p.filter((_, idx) => idx !== i));
  const subtotal = lines.reduce((s, l) => s + l.total, 0);

  const generateQuote = () => {
    const quoteNum = "FT-" + Date.now().toString(36).toUpperCase();
    const dateStr = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    const w = window.open("", "_blank");
    w.document.write(`<!DOCTYPE html><html><head><title>Flash-Tech Quote ${quoteNum}</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Inter',sans-serif;color:#1a1a1a;padding:40px;max-width:850px;margin:0 auto}
.hdr{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:4px solid #39B54A;padding-bottom:20px;margin-bottom:24px}
.hdr-left h1{font-size:28px;font-weight:700;color:#1a1a1a;letter-spacing:-0.5px}
.hdr-left h1 span{color:#39B54A}
.hdr-left p{font-size:11px;color:#666;margin-top:4px}
.hdr-right{text-align:right}
.hdr-right .qt{font-size:22px;font-weight:700;color:#39B54A}
.hdr-right .dt{font-size:11px;color:#666;margin-top:4px}
.info{display:flex;gap:40px;margin-bottom:24px}
.info-box{flex:1;background:#f8f8f8;border:1px solid #e5e5e5;border-radius:6px;padding:14px 16px}
.info-box h3{font-size:10px;text-transform:uppercase;letter-spacing:1px;color:#39B54A;margin-bottom:8px;font-weight:700}
.info-box p{font-size:12px;line-height:1.6;color:#333}
.info-box p strong{font-weight:600}
table{width:100%;border-collapse:collapse;margin-bottom:20px}
thead th{background:#1a1a1a;color:#fff;padding:10px 12px;font-size:10px;text-transform:uppercase;letter-spacing:0.5px;font-weight:600;text-align:left}
thead th:last-child,thead th:nth-child(3),thead th:nth-child(4){text-align:right}
tbody td{padding:9px 12px;border-bottom:1px solid #e5e5e5;font-size:12px}
tbody td:last-child,tbody td:nth-child(3),tbody td:nth-child(4){text-align:right;font-family:'JetBrains Mono',monospace;font-weight:600}
tbody tr:nth-child(even){background:#fafafa}
.part{font-family:'JetBrains Mono',monospace;font-size:10px;color:#888}
.cat{display:inline-block;background:#e8f5e9;color:#1B7A28;padding:2px 8px;border-radius:3px;font-size:9px;font-weight:600}
.totals{display:flex;justify-content:flex-end;margin-bottom:30px}
.totals-box{width:260px}
.totals-row{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #eee;font-size:13px}
.totals-row.grand{border-top:2px solid #1a1a1a;border-bottom:none;padding-top:12px;font-size:16px;font-weight:700;color:#39B54A}
.notes{background:#f8f8f8;border:1px solid #e5e5e5;border-radius:6px;padding:14px 16px;margin-bottom:24px}
.notes h3{font-size:10px;text-transform:uppercase;letter-spacing:1px;color:#39B54A;margin-bottom:6px;font-weight:700}
.notes p{font-size:11px;color:#555;line-height:1.6}
.footer{text-align:center;padding-top:20px;border-top:2px solid #39B54A}
.footer p{font-size:10px;color:#888;line-height:1.8}
.footer .tag{font-size:11px;font-weight:600;color:#39B54A;margin-bottom:4px}
.material-tag{display:inline-block;background:${material === "TPO" ? "#e3f2fd" : "#f3e5f5"};color:${material === "TPO" ? "#1565c0" : "#7b1fa2"};padding:3px 10px;border-radius:3px;font-size:11px;font-weight:600}
.price-tag{display:inline-block;background:${priceLevel === "wholesale" ? "#e8f5e9" : "#fff3e0"};color:${priceLevel === "wholesale" ? "#2e7d32" : "#e65100"};padding:3px 10px;border-radius:3px;font-size:11px;font-weight:600;margin-left:6px}
@media print{body{padding:20px}button{display:none!important}}
</style></head><body>
<div class="hdr">
  <div class="hdr-left">
    <h1>FLASH<span>-TECH</span> MFG</h1>
    <p>Single-Ply Roofing Accessories | Prefabricated Flashings</p>
    <p>215 Denny Way Suite D, El Cajon, CA 92020</p>
    <p>(619) 334-9491 | sales@flash-techinc.com</p>
  </div>
  <div class="hdr-right">
    <div class="qt">QUOTE</div>
    <div class="dt">${quoteNum}</div>
    <div class="dt">${dateStr}</div>
    <div style="margin-top:8px"><span class="material-tag">${material}</span><span class="price-tag">${priceLevel === "wholesale" ? "Wholesale" : "Retail"}</span></div>
  </div>
</div>
<div class="info">
  <div class="info-box">
    <h3>Prepared For</h3>
    <p><strong>${customer.company || "—"}</strong></p>
    <p>${customer.contact ? "Attn: " + customer.contact : ""}</p>
    <p>${customer.phone || ""}</p>
    <p>${customer.email || ""}</p>
    <p>${customer.location || ""}</p>
  </div>
  <div class="info-box">
    <h3>Project Details</h3>
    <p><strong>Job:</strong> ${customer.jobName || "—"}</p>
    <p><strong>Material:</strong> ${material}</p>
    <p><strong>Prepared By:</strong> ${user.name}</p>
    <p><strong>Valid For:</strong> 30 Days</p>
  </div>
</div>
<table>
  <thead><tr><th>Item</th><th>Description</th><th>Qty</th><th>Unit Price</th><th>Total</th></tr></thead>
  <tbody>
    ${lines.map((l, i) => `<tr><td><span class="cat">${l.cat}</span><br/><span class="part">${l.partNum}</span></td><td>${l.desc}</td><td style="text-align:right">${l.qty}</td><td>$${l.unitPrice.toFixed(2)}</td><td>$${l.total.toFixed(2)}</td></tr>`).join("")}
  </tbody>
</table>
<div class="totals">
  <div class="totals-box">
    <div class="totals-row"><span>Subtotal</span><span>$${subtotal.toFixed(2)}</span></div>
    <div class="totals-row"><span>Tax</span><span>TBD</span></div>
    <div class="totals-row"><span>Shipping</span><span>TBD</span></div>
    <div class="totals-row grand"><span>Total</span><span>$${subtotal.toFixed(2)}</span></div>
  </div>
</div>
${notes ? `<div class="notes"><h3>Notes</h3><p>${notes.replace(/\n/g, "<br/>")}</p></div>` : ""}
<div class="footer">
  <p class="tag">FLASH-TECH MFG, INC.</p>
  <p>CNC-Cut Precision | Automated Heat Welding | Quality-Controlled In-House Manufacturing</p>
  <p>www.flash-techinc.com | sales@flash-techinc.com | (619) 334-9491</p>
  <p style="margin-top:8px;font-size:9px">This quote is valid for 30 days from the date issued. Prices subject to change. Custom accessories are non-returnable upon order placement.</p>
</div>
<div style="text-align:center;margin-top:20px">
  <button onclick="window.print()" style="background:#39B54A;color:#fff;border:none;padding:12px 32px;border-radius:6px;font-size:14px;font-weight:600;cursor:pointer;margin-right:10px">Print / Save as PDF</button>
  <button onclick="window.close()" style="background:#666;color:#fff;border:none;padding:12px 32px;border-radius:6px;font-size:14px;cursor:pointer">Close</button>
</div>
</body></html>`);
    w.document.close();
  };

  const emailQuote = () => {
    const linesSummary = lines.map(l => `${l.qty}x ${l.desc} (${l.partNum}) - $${l.total.toFixed(2)}`).join("\n");
    const body = `Dear ${customer.contact || customer.company},\n\nThank you for your interest in Flash-Tech products. Please find your quote details below:\n\nMaterial: ${material}\nJob: ${customer.jobName || "N/A"}\n\n${linesSummary}\n\nSubtotal: $${subtotal.toFixed(2)}\n(Tax & shipping TBD)\n\nThis quote is valid for 30 days.\n\nPlease let me know if you have any questions.\n\nBest regards,\n${user.name}\nFlash-Tech Mfg, Inc.\n(619) 334-9491\nsales@flash-techinc.com`;
    openEmail(customer.email, `Flash-Tech Quote — ${customer.company || "Quote"}`, body);
  };

  return (
    <div>
      <div style={{ display: "flex", gap: 16, marginBottom: 16, flexWrap: "wrap" }}>
        <div className="card" style={{ flex: 1, minWidth: 300 }}>
          <div className="card-h"><h3>Customer Info</h3></div>
          <div className="fg">
            <div className="fi full"><label>Select from Contacts</label><select value={contactId} onChange={e => fillFromContact(e.target.value)}><option value="">— Select contact —</option>{contacts.map(c => <option key={c.id} value={c.id}>{c.company}</option>)}</select></div>
            <div className="fi"><label>Company</label><input value={customer.company} onChange={e => setCustomer(p => ({ ...p, company: e.target.value }))} /></div>
            <div className="fi"><label>Contact Person</label><input value={customer.contact} onChange={e => setCustomer(p => ({ ...p, contact: e.target.value }))} /></div>
            <div className="fi"><label>Email</label><input value={customer.email} onChange={e => setCustomer(p => ({ ...p, email: e.target.value }))} /></div>
            <div className="fi"><label>Phone</label><input value={customer.phone} onChange={e => setCustomer(p => ({ ...p, phone: e.target.value }))} /></div>
            <div className="fi"><label>Job Name</label><input value={customer.jobName} onChange={e => setCustomer(p => ({ ...p, jobName: e.target.value }))} placeholder="Project name" /></div>
            <div className="fi"><label>Location</label><input value={customer.location} onChange={e => setCustomer(p => ({ ...p, location: e.target.value }))} /></div>
          </div>
        </div>
        <div className="card" style={{ flex: 1, minWidth: 300 }}>
          <div className="card-h"><h3>Add Products</h3></div>
          <div className="fg">
            <div className="fi"><label>Material</label><select value={material} onChange={e => setMaterial(e.target.value)}><option>TPO</option><option>PVC</option></select></div>
            <div className="fi"><label>Price Level</label><select value={priceLevel} onChange={e => setPriceLevel(e.target.value)}><option value="retail">Retail</option><option value="wholesale">Wholesale</option></select></div>
            <div className="fi full"><label>Product</label><select value={selProd} onChange={e => setSelProd(e.target.value)}><option value="">— Select product —</option>{PRODUCTS.map((p, i) => <option key={i} value={String(i)}>[{p.cat}] {p.desc}</option>)}</select></div>
            <div className="fi"><label>Quantity</label><input type="number" min="1" value={qty} onChange={e => setQty(e.target.value)} /></div>
            <div className="fi"><label>&nbsp;</label><button className="btn btn-p" onClick={addLine}><I d={IC.plus} s={13} /> Add to Quote</button></div>
          </div>
        </div>
      </div>

      {lines.length > 0 && (
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="card-h"><h3>Quote Line Items</h3><span className="bg bg-gr">{lines.length} items</span></div>
          <div className="tw"><table>
            <thead><tr><th>Part #</th><th>Description</th><th>Category</th><th>Qty</th><th>Unit Price</th><th>Total</th><th></th></tr></thead>
            <tbody>
              {lines.map((l, i) => (
                <tr key={i}>
                  <td style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11 }}>{l.partNum}</td>
                  <td style={{ fontWeight: 600 }}>{l.desc}</td>
                  <td><span className="bg bg-cy">{l.cat}</span></td>
                  <td>{l.qty}</td>
                  <td style={{ fontFamily: "'JetBrains Mono',monospace" }}>${l.unitPrice.toFixed(2)}</td>
                  <td style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 600, color: "var(--accent)" }}>${l.total.toFixed(2)}</td>
                  <td><button className="btn btn-d btn-sm btn-ic" onClick={() => removeLine(i)}><I d={IC.trash} s={12} /></button></td>
                </tr>
              ))}
            </tbody>
          </table></div>
          <div style={{ display: "flex", justifyContent: "flex-end", padding: "12px 0", fontSize: 18, fontWeight: 700, color: "var(--accent)" }}>
            Subtotal: ${subtotal.toFixed(2)}
          </div>
        </div>
      )}

      <div className="fg" style={{ marginBottom: 16 }}>
        <div className="fi full"><label>Notes (optional)</label><textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Lead times, special instructions, color, shipping notes..." /></div>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button className="btn btn-p" onClick={generateQuote} disabled={lines.length === 0}>
          <I d={IC.report} s={13} /> Preview / Print / Save PDF
        </button>
        {customer.email && <button className="btn btn-g" onClick={emailQuote} disabled={lines.length === 0}>
          <I d={IC.mail} s={13} /> Email Quote Summary
        </button>}
      </div>
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
function ContactForm({ item, isMgr, reps, onSave, onClose }) {
  const [f, setF] = useState(item || { company: "", name: "", title: "", phone: "", email: "", address: "", notes: "", _assignTo: reps[0]?.id || "" });
  const u = (k, v) => setF(p => ({ ...p, [k]: v }));
  return (
    <Modal title={item ? "Edit Contact" : "Add Contact"} onClose={onClose} footer={<><button className="btn btn-g" onClick={onClose}>Cancel</button><button className="btn btn-p" onClick={() => onSave(f)}>Save</button></>}>
      <div className="fg">
        {isMgr && !item && <div className="fi full"><label>Assign to Rep</label><select value={f._assignTo} onChange={e => u("_assignTo", e.target.value)}>{reps.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}</select></div>}
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

function CallForm({ item, contacts, isMgr, reps, onSave, onSaveTask, onClose }) {
  const [f, setF] = useState(item || { contactId: contacts[0]?.id || "", date: today(), time: "", who: "", what: "", where: "", productsDiscussed: "", outcome: "", followUp: "", _assignTo: reps[0]?.id || "" });
  const [addTask, setAddTask] = useState(false);
  const [task, setTask] = useState({ type: "Follow Up Call", title: "", due: "", priority: "medium", notes: "" });
  const u = (k, v) => setF(p => ({ ...p, [k]: v }));
  const ut = (k, v) => setTask(p => ({ ...p, [k]: v }));
  const handleSave = () => {
    onSave(f);
    if (addTask && task.title && task.due) {
      const taskData = { ...task, contactId: f.contactId, status: "pending" };
      if (isMgr) taskData._assignTo = f._assignTo;
      onSaveTask(taskData);
    }
  };
  return (
    <Modal title={item ? "Edit Sales Call" : "Log Sales Call"} onClose={onClose} footer={<><button className="btn btn-g" onClick={onClose}>Cancel</button><button className="btn btn-p" onClick={handleSave}>Save</button></>}>
      <div className="fg">
        {isMgr && !item && <div className="fi full"><label>Assign to Rep</label><select value={f._assignTo} onChange={e => u("_assignTo", e.target.value)}>{reps.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}</select></div>}
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

      {/* ── QUICK ADD TASK ── */}
      <div style={{ marginTop: 16, padding: 14, background: "var(--bg3)", borderRadius: 8, border: "1px solid var(--border)" }}>
        <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 12, fontWeight: 600, color: "var(--accent)" }}>
          <input type="checkbox" checked={addTask} onChange={e => setAddTask(e.target.checked)} style={{ width: 15, height: 15 }} />
          <I d={IC.task} s={14} c="var(--accent)" /> Create a follow-up task from this call
        </label>
        {addTask && (
          <div className="fg" style={{ marginTop: 12 }}>
            <div className="fi"><label>Task Type</label><select value={task.type} onChange={e => ut("type", e.target.value)}>{TASK_TYPES.map(t => <option key={t}>{t}</option>)}</select></div>
            <div className="fi"><label>Due Date</label><input type="date" value={task.due} onChange={e => ut("due", e.target.value)} /></div>
            <div className="fi full"><label>Task Description</label><input value={task.title} onChange={e => ut("title", e.target.value)} placeholder="What needs to be done..." /></div>
            <div className="fi"><label>Priority</label><select value={task.priority} onChange={e => ut("priority", e.target.value)}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></div>
            <div className="fi"><label>Notes</label><input value={task.notes} onChange={e => ut("notes", e.target.value)} /></div>
          </div>
        )}
      </div>
    </Modal>
  );
}

function TaskForm({ item, contacts, isMgr, reps, onSave, onClose }) {
  const [f, setF] = useState(item || { contactId: contacts[0]?.id || "", type: "Quote Order", title: "", due: today(), priority: "medium", notes: "", _assignTo: reps[0]?.id || "" });
  const u = (k, v) => setF(p => ({ ...p, [k]: v }));
  return (
    <Modal title={item ? "Edit Task" : "New Task"} onClose={onClose} footer={<><button className="btn btn-g" onClick={onClose}>Cancel</button><button className="btn btn-p" onClick={() => onSave(f)}>Save</button></>}>
      <div className="fg">
        {isMgr && !item && <div className="fi full"><label>Assign to Rep</label><select value={f._assignTo} onChange={e => u("_assignTo", e.target.value)}>{reps.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}</select></div>}
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

function EventForm({ item, contacts, isMgr, reps, onSave, onClose }) {
  const [f, setF] = useState(item || { date: today(), time: "09:00", endTime: "10:00", title: "", type: "call", contactId: "", notes: "", _assignTo: reps[0]?.id || "" });
  const u = (k, v) => setF(p => ({ ...p, [k]: v }));
  return (
    <Modal title={item ? "Edit Event" : "Add Event"} onClose={onClose} footer={<><button className="btn btn-g" onClick={onClose}>Cancel</button><button className="btn btn-p" onClick={() => onSave(f)}>Save</button></>}>
      <div className="fg">
        {isMgr && !item && <div className="fi full"><label>Assign to Rep</label><select value={f._assignTo} onChange={e => u("_assignTo", e.target.value)}>{reps.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}</select></div>}
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

function FuelForm({ item, vehicles, isMgr, reps, onSave, onClose }) {
  const [f, setF] = useState(item || { date: today(), gallons: "", pricePerGal: "", total: "", mileage: "", station: "", vehicleId: vehicles[0] || "", _assignTo: reps[0]?.id || "" });
  const u = (k, v) => { const n = { ...f, [k]: v }; if ((k === "gallons" || k === "pricePerGal") && n.gallons && n.pricePerGal) n.total = (parseFloat(n.gallons) * parseFloat(n.pricePerGal)).toFixed(2); setF(n); };
  return (
    <Modal title={item ? "Edit Fuel Entry" : "Add Fuel Entry"} onClose={onClose} footer={<><button className="btn btn-g" onClick={onClose}>Cancel</button><button className="btn btn-p" onClick={() => onSave({ ...f, gallons: +f.gallons, pricePerGal: +f.pricePerGal, total: +f.total, mileage: +f.mileage })}>Save</button></>}>
      <div className="fg">
        {isMgr && !item && <div className="fi full"><label>Assign to Rep</label><select value={f._assignTo} onChange={e => u("_assignTo", e.target.value)}>{reps.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}</select></div>}
        <div className="fi"><label>Vehicle</label><select value={f.vehicleId} onChange={e => u("vehicleId", e.target.value)}>{vehicles.map(v => <option key={v}>{v}</option>)}</select></div>
        <div className="fi"><label>Date</label><input type="date" value={f.date} onChange={e => u("date", e.target.value)} /></div>
        <div className="fi"><label>Station</label><input value={f.station} onChange={e => u("station", e.target.value)} /></div>
        <div className="fi"><label>Current Mileage</label><input type="number" value={f.mileage} onChange={e => u("mileage", e.target.value)} /></div>
        <div className="fi"><label>Gallons</label><input type="number" step="0.01" value={f.gallons} onChange={e => u("gallons", e.target.value)} /></div>
        <div className="fi"><label>Price Per Gallon ($)</label><input type="number" step="0.01" value={f.pricePerGal} onChange={e => u("pricePerGal", e.target.value)} /></div>
        <div className="fi"><label>Total ($)</label><input type="number" step="0.01" value={f.total} readOnly style={{ opacity: .7 }} /></div>
      </div>
    </Modal>
  );
}

function MaintForm({ item, vehicles, isMgr, reps, onSave, onClose }) {
  const [f, setF] = useState(item || { date: today(), type: "Oil Change", cost: "", mileage: "", vendor: "", notes: "", vehicleId: vehicles[0] || "", _assignTo: reps[0]?.id || "" });
  const u = (k, v) => setF(p => ({ ...p, [k]: v }));
  return (
    <Modal title={item ? "Edit Vehicle Expense" : "Add Vehicle Expense"} onClose={onClose} footer={<><button className="btn btn-g" onClick={onClose}>Cancel</button><button className="btn btn-p" onClick={() => onSave({ ...f, cost: +f.cost, mileage: +f.mileage })}>Save</button></>}>
      <div className="fg">
        {isMgr && !item && <div className="fi full"><label>Assign to Rep</label><select value={f._assignTo} onChange={e => u("_assignTo", e.target.value)}>{reps.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}</select></div>}
        <div className="fi"><label>Vehicle</label><select value={f.vehicleId} onChange={e => u("vehicleId", e.target.value)}>{vehicles.map(v => <option key={v}>{v}</option>)}</select></div>
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

function ExpenseForm({ item, isMgr, reps, onSave, onClose }) {
  const [f, setF] = useState(item || { date: today(), amount: "", category: "Client Meal", who: "", what: "", where: "", receipt: true, _assignTo: reps[0]?.id || "" });
  const u = (k, v) => setF(p => ({ ...p, [k]: v }));
  return (
    <Modal title={item ? "Edit Expense" : "Add Expense"} onClose={onClose} footer={<><button className="btn btn-g" onClick={onClose}>Cancel</button><button className="btn btn-p" onClick={() => onSave({ ...f, amount: +f.amount })}>Save</button></>}>
      <div className="fg">
        {isMgr && !item && <div className="fi full"><label>Assign to Rep</label><select value={f._assignTo} onChange={e => u("_assignTo", e.target.value)}>{reps.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}</select></div>}
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

// ═════════════════════════════════════════════════════════════
// ADMIN — Manage Users
// ═════════════════════════════════════════════════════════════
function AdminPage({ users, vehicles, onEdit, onAdd, onDel, onAddVehicle, onDelVehicle }) {
  const managers = users.filter(u => u.role === "manager");
  const reps = users.filter(u => u.role === "rep");
  const [newVehicle, setNewVehicle] = useState("");
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
        <div />
        <button className="btn btn-p" onClick={onAdd}><I d={IC.plus} s={13} /> Add User</button>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-h"><h3>Managers</h3><span className="bg bg-gr">{managers.length}</span></div>
        <div className="tw"><table>
          <thead><tr><th>Name</th><th>Username</th><th>Password</th><th>Work Email</th><th>Role</th><th></th></tr></thead>
          <tbody>
            {managers.map(u => (
              <tr key={u.id}>
                <td style={{ fontWeight: 600 }}>{u.name}</td>
                <td><span className="bg bg-bl">{u.email}</span></td>
                <td style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11 }}>{u.password}</td>
                <td>{u.workEmail ? <span style={{ fontSize: 11, color: "var(--accent)", cursor: "pointer" }} onClick={() => openEmail(u.workEmail)}><I d={IC.mail} s={11} c="var(--accent)" /> {u.workEmail}</span> : <span style={{ fontSize: 10, color: "var(--text3)" }}>Not set</span>}</td>
                <td><span className="bg bg-pp">Manager</span></td>
                <td><button className="btn btn-g btn-sm btn-ic" onClick={() => onEdit(u)}><I d={IC.edit} s={12} /></button></td>
              </tr>
            ))}
          </tbody>
        </table></div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-h"><h3>Sales Reps</h3><span className="bg bg-cy">{reps.length}</span></div>
        <div className="tw"><table>
          <thead><tr><th>Name</th><th>Username</th><th>Password</th><th>Work Email</th><th>Role</th><th></th></tr></thead>
          <tbody>
            {reps.map(u => (
              <tr key={u.id}>
                <td style={{ fontWeight: 600 }}>{u.name}</td>
                <td><span className="bg bg-bl">{u.email}</span></td>
                <td style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11 }}>{u.password}</td>
                <td>{u.workEmail ? <span style={{ fontSize: 11, color: "var(--accent)", cursor: "pointer" }} onClick={() => openEmail(u.workEmail)}><I d={IC.mail} s={11} c="var(--accent)" /> {u.workEmail}</span> : <span style={{ fontSize: 10, color: "var(--text3)" }}>Not set</span>}</td>
                <td><span className="bg bg-cy">Sales Rep</span></td>
                <td style={{ whiteSpace: "nowrap" }}>
                  <button className="btn btn-g btn-sm btn-ic" onClick={() => onEdit(u)}><I d={IC.edit} s={12} /></button>
                  <button className="btn btn-d btn-sm btn-ic" style={{ marginLeft: 4 }} onClick={() => { if (confirm(`Remove ${u.name}? This won't delete their data.`)) onDel(u.id); }}><I d={IC.trash} s={12} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table></div>
      </div>

      <div className="card">
        <div className="card-h"><h3>Company Vehicles</h3><span className="bg bg-or">{vehicles.length}</span></div>
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <input value={newVehicle} onChange={e => setNewVehicle(e.target.value)} placeholder="Add vehicle (e.g. 2024 Ford F-150 #1234)" style={{ flex: 1 }} onKeyDown={e => { if (e.key === "Enter" && newVehicle.trim()) { onAddVehicle(newVehicle.trim()); setNewVehicle(""); } }} />
          <button className="btn btn-p" onClick={() => { if (newVehicle.trim()) { onAddVehicle(newVehicle.trim()); setNewVehicle(""); } }}><I d={IC.plus} s={13} /> Add</button>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {vehicles.map(v => (
            <div key={v} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 10px", background: "var(--bg3)", borderRadius: 6, border: "1px solid var(--border)", fontSize: 12 }}>
              <I d={IC.car} s={13} c="var(--orange)" />
              <span>{v}</span>
              <span style={{ cursor: "pointer", color: "var(--red)", marginLeft: 4 }} onClick={() => { if (confirm(`Remove vehicle "${v}"?`)) onDelVehicle(v); }}>×</span>
            </div>
          ))}
          {vehicles.length === 0 && <div style={{ fontSize: 11, color: "var(--text3)" }}>No vehicles added yet. Add your company vehicles above.</div>}
        </div>
      </div>
    </div>
  );
}

function UserForm({ item, onSave, onClose }) {
  const [f, setF] = useState(item || { name: "", email: "", password: "", role: "rep", workEmail: "" });
  const u = (k, v) => setF(p => ({ ...p, [k]: v }));
  return (
    <Modal title={item ? "Edit User" : "Add User"} onClose={onClose} footer={<><button className="btn btn-g" onClick={onClose}>Cancel</button><button className="btn btn-p" onClick={() => onSave(f)}>Save</button></>}>
      <div className="fg">
        <div className="fi full"><label>Full Name</label><input value={f.name} onChange={e => u("name", e.target.value)} placeholder="First and last name" /></div>
        <div className="fi"><label>Username (login)</label><input value={f.email} onChange={e => u("email", e.target.value)} placeholder="Lowercase, no spaces" /></div>
        <div className="fi"><label>Password</label><input value={f.password} onChange={e => u("password", e.target.value)} placeholder="Set password" /></div>
        <div className="fi"><label>Role</label><select value={f.role} onChange={e => u("role", e.target.value)}><option value="rep">Sales Rep</option><option value="manager">Manager</option></select></div>
        <div className="fi"><label>Work Email (Outlook)</label><input value={f.workEmail || ""} onChange={e => u("workEmail", e.target.value)} placeholder="name@flash-techinc.com" /></div>
      </div>
    </Modal>
  );
}
