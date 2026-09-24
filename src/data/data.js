// ============================================================
// DATA — Replace placeholder content with your real data here
// ============================================================

// ---------- STATS ----------
export const STATS = [
  { id: "units",    label: "Units",             target: 7    },
  { id: "pos",      label: "Programme Officers",  target: 7    },
  { id: "students", label: "Volunteers", target: 350 },
];

// ---------- GALLERY (Home recent images) ----------
export const GALLERY = [
  { id: 1, label: "Annual Special Camp 2024", caption: "January 2024 · Kunnathur Village", featured: true },
  { id: 2, label: "Blood Donation Drive",     caption: "February 2024 · NSS Hall" },
  { id: 3, label: "Tree Plantation",          caption: "January 2024 · Govt School" },
  { id: 4, label: "Youth Parliament",         caption: "March 2024 · Auditorium" },
  { id: 5, label: "Swachh Bharat Drive",      caption: "April 2024 · Railway Station" },
];

// ---------- ABOUT — event types ----------
export const EVENT_TYPES = [
  { icon: "🩸", title: "Blood Donation Drives",        desc: "Voluntary blood donation camps in collaboration with local hospitals to meet critical blood supply needs." },
  { icon: "🌱", title: "Tree Plantation & Environment", desc: "Mass plantation drives, cleanliness campaigns, plastic-free awareness, and eco-restoration efforts." },
  { icon: "🏕️", title: "Special & Annual Camps",       desc: "Residential 7-day camps in adopted villages for intensive, hands-on community service." },
  { icon: "📚", title: "Literacy Drives",               desc: "Teaching adults and children in rural areas, skill-building workshops and educational awareness." },
  { icon: "🏥", title: "Health & Hygiene Camps",        desc: "Free health check-up camps, vaccination drives, COVID-19 awareness, and menstrual hygiene education." },
  { icon: "🎭", title: "Cultural & Youth Festivals",    desc: "Youth parliament, cultural fests, rallies, street plays, and awareness marches on social issues." },
  { icon: "🆘", title: "Disaster Relief",               desc: "Volunteer deployment during floods and cyclones for rescue, relief, and rehabilitation support." },
  { icon: "🗳️", title: "Election Awareness (SVEEP)",   desc: "Voter registration drives and awareness campaigns encouraging democratic participation among youth." },
  { icon: "⚽", title: "Sports & Recreation",           desc: "Sports events, yoga camps, fitness programmes, and inter-unit tournaments building team spirit." },
];

// ---------- SESSIONS (Calendar) ----------
export const SESSIONS = {
  "2024-01-15": { name: "NSS Day Celebration",            location: "College Auditorium",           desc: "Annual NSS Day celebrated with cultural programmes, felicitation of outstanding volunteers, and motivational talks by distinguished guests.", images: 4 },
  "2024-01-22": { name: "Tree Plantation Drive",           location: "Government School Campus",     desc: "Over 200 saplings planted at the government school campus. Volunteers educated students about environmental conservation.", images: 6 },
  "2024-02-10": { name: "Blood Donation Camp",             location: "NSS Hall, Admin Block",        desc: "Successful blood donation camp in collaboration with Government General Hospital. 148 units of blood collected.", images: 5 },
  "2024-02-28": { name: "Voter Awareness Rally",           location: "College Main Gate",            desc: "SVEEP activity – a voter awareness rally conducted around campus and nearby streets encouraging youth to vote.", images: 3 },
  "2024-03-05": { name: "Health Awareness Camp",           location: "Periyapalayam Village",        desc: "Free health screening camp with support from the college medical team. Over 300 villagers examined and referred.", images: 7 },
  "2024-04-07": { name: "Swachh Bharat Cleanliness Drive", location: "Tiruppur Railway Station Area",desc: "Major cleanliness drive covering railway station, bus stands, and main market areas. 350+ volunteers participated.", images: 5 },
  "2024-05-15": { name: "Pre-University Orientation Camp", location: "College Campus",               desc: "Training camp for newly enrolled NSS volunteers covering leadership, first aid, disaster management, and community mobilisation.", images: 4 },
  "2025-01-10": { name: "Inaugural NSS Session 2025",      location: "College Auditorium",           desc: "Commencement of NSS activities for the 2024-25 academic year with enrolment, orientation and oath-taking ceremony.", images: 5 },
  "2025-02-14": { name: "Blood Donation Drive 2025",        location: "NSS Hall, Admin Block",        desc: "Second edition of our annual blood donation drive. 165 units collected in collaboration with GGH.", images: 4 },
  "2025-03-21": { name: "World Forest Day Plantation",      location: "College Green Belt Area",      desc: "300 native species saplings planted to celebrate World Forest Day with participation from all units.", images: 6 },
};

// ---------- EVENTS (by Academic Year) ----------
export const EVENTS_BY_YEAR = {
  "2023-2024": [
    {
      id: "ov-2324", title: "Orphanage Visit", type: "visit",
      date: "December 2023", location: "Sneha Children's Home, Coimbatore",
      desc: "NSS volunteers visited Sneha Children's Home and spent a day with the children — conducting games, distributing stationery and food, and performing cultural skits. Over 80 volunteers participated.",
      images: 5,
    },
    {
      id: "ac-2324", title: "Annual Camp", type: "camp",
      date: "January 2024", location: "Kunnathur Village, Erode District",
      days: [
        { day: 1, title: "Arrival & Village Survey",      desc: "Volunteers arrived, set up camp, conducted household surveys to identify community needs, and participated in a welcome cultural programme by villagers." },
        { day: 2, title: "Infrastructure & Cleanliness",  desc: "Cleaning of village roads, painting of community centre walls, and repairs to the public water tank. Volunteers also installed dustbins at key public spots." },
        { day: 3, title: "Health Camp",                   desc: "Free medical check-up camp with doctors from our institution. 190 villagers screened for blood pressure, sugar, and vision. Medicines distributed free of cost." },
        { day: 4, title: "Literacy & Awareness Sessions", desc: "NSS volunteers conducted literacy sessions for women and senior citizens, along with awareness talks on hygiene, nutrition, and government welfare schemes." },
        { day: 5, title: "Tree Plantation & Eco-Drive",   desc: "150 saplings planted around the village school and temple pond. Volunteers conducted a cleanliness drive on the village lake shores." },
        { day: 6, title: "Cultural Night & Village Fair",  desc: "A cultural evening featuring folk dances, skits on social issues, and a street play on voter awareness. Village artisans set up a local crafts fair." },
        { day: 7, title: "Valedictory & Departure",       desc: "Valedictory function with village panchayat leaders. Certificates distributed to local volunteers. Camp concluded with a review meeting and departure." },
      ],
      images: 20,
    },
    {
      id: "sc-2324", title: "Special Camp", type: "camp",
      date: "March 2024", location: "Periyapalayam, Tiruvallur District",
      days: [
        { day: 1, title: "Camp Inauguration",            desc: "Official inauguration by the Dean of NSS and local MLA. Volunteers briefed on the camp schedule, village needs, and code of conduct." },
        { day: 2, title: "Road & Drain Cleaning",        desc: "Deep cleaning of all 12 village streets, desilting of open drains, and filling of potholes using gravel with support from local panchayat." },
        { day: 3, title: "Women Empowerment Workshop",   desc: "Workshop on self-help groups, legal rights, domestic safety, and small-scale entrepreneurship, conducted by NGO partner 'Shakti Foundation'." },
        { day: 4, title: "Child Education Drive",        desc: "Door-to-door survey for school dropouts. Interactive learning sessions with primary school children in maths and English conducted by volunteers." },
        { day: 5, title: "Digital Literacy Session",     desc: "Training for 60 youth in basic smartphone usage, UPI payments, and government portal navigation." },
        { day: 6, title: "Sports & Recreational Day",    desc: "Friendly cricket, kabaddi, and kho-kho matches between volunteers and village youth. Prize distribution and cultural programme in the evening." },
        { day: 7, title: "Closing Ceremony",             desc: "Grand closing ceremony attended by District Collector. Village adoption certificate presented. Feedback from community leaders and final group photo." },
      ],
      images: 22,
    },
  ],
  "2024-2025": [
    {
      id: "ov-2425", title: "Orphanage Visit", type: "visit",
      date: "November 2024", location: "Grace Old Age Home & Orphanage, Salem",
      desc: "Volunteers visited Grace Home, spending quality time with elderly residents and children. Activities included music, storytelling, craft sessions, and a shared lunch. Essential items like blankets, toiletries, and snacks were donated.",
      images: 6,
    },
    {
      id: "ac-2425", title: "Annual Camp", type: "camp",
      date: "January 2025", location: "Vellanur Village, Thiruvallur District",
      days: [
        { day: 1, title: "Arrival & Inauguration",        desc: "Camp opened by the Programme Officer and Village President. Volunteers allocated duties, handed camp kits, and conducted a quick walkthrough survey of the village." },
        { day: 2, title: "Infrastructure Improvement",    desc: "Repainting of school classrooms, repair of compound wall, and installation of handwash stations at the primary school and community hall." },
        { day: 3, title: "Medical & Dental Camp",         desc: "Comprehensive health camp including dental check-ups, blood glucose screening, eye testing, and free spectacle distribution to 40 identified beneficiaries." },
        { day: 4, title: "Environmental Awareness Walk",  desc: "5 km awareness walk through village with placards on plastic pollution, open defecation, and tree conservation. Followed by a sapling planting session." },
        { day: 5, title: "Women & Youth Workshops",       desc: "Skill development sessions for women on tailoring and handicrafts. Separate session for youth on resume building, interview skills, and digital literacy." },
        { day: 6, title: "Cultural Exchange Evening",     desc: "Cultural performances by volunteers and villagers. Traditional folk art demonstration by local artisans. Prize distribution for best volunteer of the camp." },
        { day: 7, title: "Valedictory Function",          desc: "Closing ceremony graced by the District Social Welfare Officer. Mementos presented to village leaders. Formal conclusion of camp activities." },
      ],
      images: 21,
    },
    {
      id: "sc-2425", title: "Special Camp", type: "camp",
      date: "March 2025", location: "Omalur Block, Salem District",
      days: [
        { day: 1, title: "Inauguration Day",              desc: "Camp inaugurated with flag hoisting, NSS pledge, and a welcome address by the Block Development Officer. Volunteer units assigned to specific hamlets." },
        { day: 2, title: "Swachh Bharat Mission Day",     desc: "Large-scale sanitation drive covering 3 hamlets. Construction of two new soak pits and distribution of dustbins to 45 households." },
        { day: 3, title: "Farmers' Interaction & Help",   desc: "Sessions with farmers on soil health, crop insurance, PM-KISAN scheme registration, and introduction to drip irrigation with demonstration." },
        { day: 4, title: "Youth & Career Guidance",       desc: "Motivational talks and career counselling sessions for local youth on government job opportunities, competitive exams, and skill development programmes." },
        { day: 5, title: "Wall Mural & Art Day",          desc: "Volunteers painted 15 awareness murals on village walls covering health, education, gender equality, and environmental protection." },
        { day: 6, title: "Night Cultural Programme",      desc: "Grand cultural night with folk art by local artistes, dance performances by volunteers, skit on drug awareness, and patriotic song competition." },
        { day: 7, title: "Closing & Flag-off",            desc: "Valedictory ceremony attended by RDO and media. Best volunteer and best unit awards presented. Camp formally concluded with the NSS song." },
      ],
      images: 24,
    },
  ],
};

// ---------- PEOPLE ----------
// For images: set the `image` field to the path of the photo file, e.g.:
//   image: "/images/people/dr-rajendran.jpg"
// Leave as null to show initials instead.

export const PEOPLE = {

 
  // 2. NSS Coordinator
  nssCoordinator: {
    name: "Dr. K.M. VEERABADRAN",
    role: "NSS CAMPUS COORDINATOR",
    dept:"Department of Applied Science and Humanities",
    post: "Assistant Professor (Sr. Gr.)",
    phone: "04422516142",
    email: "kmveera@mitindia.edu",
    initials: "Dr. K.M. VEERABADRAN",
    image: null, // e.g. "/images/people/coordinator.jpg"
  },

  // 3. Programme Officers — Unit I to Unit VII
  programOfficers: [
    { name: "Dr. J. Ramajothi",   unit: "Unit I",  dept:"Applied Science and Humanities", post: "Assistant Professor",   phone: "04422516142", initials: "1", image: null },
    { name: "Dr. K. MARIAMMAL", unit: "Unit II",  dept:"Electronics and Communication Engineering",post: "Associate Professor",   phone: "044516238", initials: "2", image: null },
    { name: "Dr. S. NEELAVATHY PARI",   unit: "Unit III", dept:"Computer Technology",post: "Assistant Professor (Sr. Gr.)",    phone: "04422516226", initials: "3", image: null },
    { name: "Dr. A. DHIVYA",  unit: "Unit IV",dept:"Electronics and Communication Engineering",  post: "Assistant Professor",  phone: "04422516241", initials: "4", image: null },
    { name: "Dr. M. MANOJ", unit: "Unit V",   dept:"Production Technology",post: "Teaching Fellow", phone: "04422516204", initials: "5", image: null },
    { name: "Dr. K.M. VEERABADRAN",  unit: "Unit VI",  dept:"Applied Science and Humanities",post: "Assistant Professor (Sr. Gr.)",   phone: "04422516142", initials: "6", image: null },
    { name: "Dr. G. KUMARESAN", unit: "Unit VII",dept:"Production Technology", post: "Assistant Professor",  phone: "0422516129", initials: "7", image: null },
  ],

  // 4. Treasurers
  treasurers: [
    { name: "Mr. M. S. Achudhavarman",reg:"2022501001", role: "Treasurer",   year: "Final Year",   dept: "AERO", initials: "Achu",  image: "/images/people/final-years/Achudhavarman M S.jpg" },
    { name: "Ms. T. Manjuvarsheni",   reg:"2022510055", role: "Joint Treasurer", year: "Final Year",dept: "IT", initials: "Manju", image: "/images/people/final-years/Manjuvarsheni_T.jpg" },
  ],

  // 5. Session Coordinators
  sessionCoordinators: [
    { name: "Mr. T. Mathivanan",reg: "2022501053" , role: "Session Coordinator", year: "Final Year", dept: "AERO",  initials: "1", image: "/images/people/final-years/Mathivanan T.jpg" },
    { name: "Mr. S.M. Srimaan", reg:"2022507006",role: "Session Coordinator", year: "Final Year", dept: "PT",  initials: "2", image: "/images/people/final-years/Srimaan S M_.jpg" },
    { name: "Ms. M. Varshigashree", reg:"2022504033", role: "Session Coordinator", year: "Final Year", dept: "ECE", initials: "3", image: "/images/people/final-years/VARSHIGASHREE M.jpg" },
  ],

  // 6. Report Heads
  reportHeads: [
    
    { name: "Ms. Abinaya G", reg:"2022511017",role: "Report Head",  year: "Final Year", dept: "RA",  initials: "NK", image: "/images/people/final-years/ABINAYA G.jpg" },
    { name: "Ms. Poonguzhali S",reg:"2022504027", role: "Report Head",  year: "Final Year", dept: "ECE", initials: "HP", image: null },
  ],

  // 7. Design Heads
  designHeads: [
    { name: "Ms. Divya Kannathaal",reg:"2022501001", role: "Design Head",      year: "Final Year", dept: "CT", initials: "AR", image: null },
    { name: "Ms. Preethi",   reg:"2022501001",  role: "Design Head", year: "Final Year", dept: "CT",   initials: "KM", image: null },
    { name: "Mr. Bhuvanesh P S",   reg:"2022507033",  role: "Design Head", year: "Final Year", dept: "PT",   initials: "SP", image: null },
  ],

  // 8. Unit Incharges
  unitIncharges: {
    finalYear: [
      { name: "Ms. Malavika N Raj", reg:"2022501024", unit: "Unit I",   dept: "AE",   initials: "RM", image: null },
      { name: "Mr. Elamaran P", reg:"2022507007",  unit: "Unit II",  dept: "PT",   initials: "KS", image: null },
      { name: "Ms. Gopika S",  reg:"2022503505",  unit: "Unit II", dept: "CT",    initials: "ST", image: null },
      { name: "Mr. Arun V",   reg:"2022501027",  unit: "Unit II",  dept: "AE",  initials: "DN", image: null },
      { name: "Ms. Archana K",reg:"2022506128",  unit: "Unit IV",   dept: "IT", initials: "EC", image: null },
      { name: "Mr. Dharanessh S A", reg:"2022506052",  unit: "Unit IV",  dept: "IT",   initials: "FB", image: null },
      { name: "Mr. Ragavan R",   reg:"2022503010",  unit: "Unit IV", dept: "CT",  initials: "GR", image: null },
      { name: "Mr. Annamalai S",   reg:"2022502027",  unit: "Unit V", dept: "AU",  initials: "GR", image: null },
      { name: "Mr. Purushothaman S ",   reg:"2022507045",  unit: "Unit V", dept: "PT",  initials: "GR", image: null },
      { name: "Mr. Abiramshiva N",   reg:"2022507001",  unit: "Unit V", dept: "PT",  initials: "GR", image: null },
      { name: "Mr. Muthukaviarasan K",   reg:"2022507029",  unit: "Unit VI", dept: "PT",  initials: "GR", image: null },
      { name: "Mr. Hariakshay S K",   reg:"2022501026",  unit: "Unit VI", dept: "AE",  initials: "GR", image: null },
      { name: "Mr. Saravanan",   reg:"202250",  unit: "Unit VII", dept: "CT",  initials: "GR", image: null },
    ],
    preFinalYear: [
      { name: "Mr.Barath R",  reg:"2023501018", unit: "Unit I",   dept: "AE",   initials: "AK", image: null },
      { name: "Ms. Reshma P",    reg:"2023501059", unit: "Unit I",  dept: "AE",   initials: "MR", image: null },
      { name: "Ms. Supriya R",  reg:"2023504052", unit: "Unit I", dept: "ECE",    initials: "GV", image: null },
      { name: "Mr. Hari Prasath S",    reg:"2023504030", unit: "Unit I",  dept: "ECE",  initials: "IS", image: null },
      { name: "Mr. Pragadeesh D",reg:"2023503035", unit: "Unit I",   dept: "CT", initials: "JP", image: null },
      { name: "Ms. Vishali V",reg:"2023506100", unit: "Unit I",  dept: "IT",   initials: "KL", image: null },
      { name: "Mr. Eaknath M S",   reg:"2023511012", unit: "Unit I", dept: "RA",  initials: "LD", image: null },
      { name: "Mr. Rishibala B",   reg:"2023506050", unit: "Unit II", dept: "IT",  initials: "LD", image: null },
      { name: "Ms. Priyadharshini R",   reg:"2023504514", unit: "Unit II", dept: "ECE",  initials: "LD", image: null },
      { name: "Mr. Karthikeyan A",   reg:"2023504509", unit: "Unit II", dept: "ECE",  initials: "LD", image: null },
      { name: "Ms. Dharshini T",   reg:"2023510062", unit: "Unit II", dept: "CT",  initials: "LD", image: null },
      { name: "Ms. Karthika S",   reg:"2023501043", unit: "Unit II", dept: "AE",  initials: "LD", image: null },
      { name: "Ms. Sivasankari M",   reg:"2023503039", unit: "Unit II", dept: "CT",  initials: "LD", image: null },
      { name: "Ms. Sri Poorni Nivetha D",   reg:"2023504517", unit: "Unit II", dept: "ECE",  initials: "LD", image: null },
      { name: "Ms. Madhuvanthi K",   reg:"2023504526", unit: "Unit III", dept: "ECE",  initials: "LD", image: null },
      { name: "Ms. Shree Meenakshi V",   reg:"2023501056", unit: "Unit III", dept: "AE",  initials: "LD", image: null },
      { name: "Mr. Sundara Raman V",   reg:"2023508052", unit: "Unit III", dept: "RPT",  initials: "LD", image: null },
      { name: "Ms. Kaviya V",   reg:"2023504516", unit: "Unit IV", dept: "ECE",  initials: "LD", image: null },
      { name: "Mr. Shankar B",   reg:"2023501038", unit: "Unit V", dept: "AE",  initials: "LD", image: null },
      { name: "Ms. Abinaya Sri R",   reg:"2023501028", unit: "Unit V", dept: "AE",  initials: "LD", image: null },
      { name: "Mr. Karthik Saran S",   reg:"2023501058", unit: "Unit V", dept: "AE",  initials: "LD", image: null },
      { name: "Ms. Raveena K",   reg:"2023503553", unit: "Unit V", dept: "CT",  initials: "LD", image: null },
      { name: "Mr. Banoth Rahul",   reg:"2023506128", unit: "Unit V", dept: "IT",  initials: "LD", image: null },
      { name: "Mr. Abiseik P",   reg:"2023507013", unit: "Unit VI", dept: "PT",  initials: "LD", image: null },
      { name: "Ms. Subaranjani M",   reg:"2023504552", unit: "Unit VI", dept: "ECE",  initials: "LD", image: null },
      { name: "Mr. Kannan A",   reg:"2023504549", unit: "Unit VII", dept: "ECE",  initials: "LD", image: null },
      { name: "Mr. Balamurugan V",   reg:"2023503015", unit: "Unit VII", dept: "AE",  initials: "LD", image: null },
    ],
  },
};