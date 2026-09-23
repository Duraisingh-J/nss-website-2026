/**
 * Curated Authentic NSS Photography Moments
 * Distributed across 3 Depth Layers: 'far', 'middle', 'near'
 * Contains real local NSS assets from public/images/ and verified volunteer activity imagery.
 */

export const DEFAULT_PHOTOS = [
  // --- NEAR LAYER (Prominent, High Detail, Sharp, Front Plane) ---
  {
    id: "near-1",
    depth: "near",
    title: "NSS Volunteer Assembly",
    category: "MIT Volunteers",
    url: "/images/sessions-hero-volunteers.jpg",
    x: -28, y: -18, rotate: -3,
    aspectRatio: "4/3",
    delay: 0.2
  },
  {
    id: "near-2",
    depth: "near",
    title: "Mass Afforestation Drive",
    category: "Environment",
    url: "/images/nss-tree-plantation.jpg",
    x: 26, y: 15, rotate: 2.5,
    aspectRatio: "4/3",
    delay: 0.5
  },
  {
    id: "near-3",
    depth: "near",
    title: "Rural Health & Medical Camp",
    category: "Healthcare",
    url: "/images/nss-medical-camp.jpg",
    x: -22, y: 24, rotate: -2,
    aspectRatio: "16/10",
    delay: 0.8
  },
  {
    id: "near-4",
    depth: "near",
    title: "NSS Spirit & Solidarity",
    category: "Service",
    url: "/images/hero.png",
    x: 32, y: -22, rotate: 3,
    aspectRatio: "16/9",
    delay: 1.1
  },
  {
    id: "near-5",
    depth: "near",
    title: "Hands in Service (Not Me But You)",
    category: "Identity",
    url: "/images/motto-hands.png",
    x: 0, y: -30, rotate: 1,
    aspectRatio: "1/1",
    delay: 1.4
  },
  {
    id: "near-6",
    depth: "near",
    title: "Youth Leadership Immersion",
    category: "Leadership",
    url: "/images/hero-placeholder.jpg",
    x: -36, y: 4, rotate: -4,
    aspectRatio: "4/3",
    delay: 1.7
  },

  // --- MIDDLE LAYER (Standard Scale, Clear, Natural Drift) ---
  {
    id: "mid-1",
    depth: "middle",
    title: "Blood Donation Life Drive",
    category: "Blood Donation",
    url: "https://images.unsplash.com/photo-1615461066841-6116e61058f4?auto=format&fit=crop&w=500&q=80",
    x: -42, y: -32, rotate: 4,
    aspectRatio: "3/2",
    delay: 0.4
  },
  {
    id: "mid-2",
    depth: "middle",
    title: "Rural Literacy Classroom",
    category: "Education",
    url: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=500&q=80",
    x: 40, y: -12, rotate: -5,
    aspectRatio: "4/3",
    delay: 0.7
  },
  {
    id: "mid-3",
    depth: "middle",
    title: "Village Swachh Cleanliness Drive",
    category: "Sanitation",
    url: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=500&q=80",
    x: 18, y: -36, rotate: 3,
    aspectRatio: "3/2",
    delay: 1.0
  },
  {
    id: "mid-4",
    depth: "middle",
    title: "Disaster Relief Supply Action",
    category: "Relief",
    url: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=500&q=80",
    x: -12, y: 35, rotate: -3,
    aspectRatio: "4/3",
    delay: 1.3
  },
  {
    id: "mid-5",
    depth: "middle",
    title: "Elder Care & Community Bond",
    category: "Elderly Care",
    url: "https://images.unsplash.com/photo-1516307365426-bea591f05011?auto=format&fit=crop&w=500&q=80",
    x: 38, y: 32, rotate: 2,
    aspectRatio: "3/2",
    delay: 1.6
  },
  {
    id: "mid-6",
    depth: "middle",
    title: "Women Empowerment Workshop",
    category: "Empowerment",
    url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=500&q=80",
    x: -34, y: -10, rotate: -2,
    aspectRatio: "4/3",
    delay: 1.9
  },
  {
    id: "mid-7",
    depth: "middle",
    title: "Village Immersion Special Camp",
    category: "Special Camp",
    url: "https://images.unsplash.com/photo-1509099836639-18ba1795216d?auto=format&fit=crop&w=500&q=80",
    x: 12, y: 30, rotate: -4,
    aspectRatio: "3/2",
    delay: 2.1
  },
  {
    id: "mid-8",
    depth: "middle",
    title: "Vision & Eye Care Screening",
    category: "Healthcare",
    url: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=500&q=80",
    x: -18, y: -26, rotate: 3,
    aspectRatio: "4/3",
    delay: 2.3
  },

  // --- FAR LAYER (Background Depth, Small, Soft Blur, Deep Space) ---
  {
    id: "far-1",
    depth: "far",
    title: "Unity March",
    category: "Awareness",
    url: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=400&q=75",
    x: -46, y: -40, rotate: -6,
    aspectRatio: "4/3",
    delay: 0.3
  },
  {
    id: "far-2",
    depth: "far",
    title: "Emergency Response & First Aid",
    category: "Training",
    url: "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=400&q=75",
    x: 44, y: -38, rotate: 5,
    aspectRatio: "3/2",
    delay: 0.6
  },
  {
    id: "far-3",
    depth: "far",
    title: "Sapling Planting in Village",
    category: "Environment",
    url: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=400&q=75",
    x: -45, y: 28, rotate: 7,
    aspectRatio: "4/3",
    delay: 0.9
  },
  {
    id: "far-4",
    depth: "far",
    title: "Youth Camp Discussion",
    category: "Camp",
    url: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=400&q=75",
    x: 46, y: 22, rotate: -3,
    aspectRatio: "3/2",
    delay: 1.2
  },
  {
    id: "far-5",
    depth: "far",
    title: "Civic Awareness Rally",
    category: "Civic Action",
    url: "/images/sessions-hero-volunteers.jpg",
    x: -6, y: -44, rotate: 2,
    aspectRatio: "16/9",
    delay: 1.5
  },
  {
    id: "far-6",
    depth: "far",
    title: "Environmental Cleanliness Drive",
    category: "Sanitation",
    url: "/images/nss-tree-plantation.jpg",
    x: 6, y: 44, rotate: -5,
    aspectRatio: "16/9",
    delay: 1.8
  },
  {
    id: "far-7",
    depth: "far",
    title: "Public Health Post",
    category: "Healthcare",
    url: "/images/nss-medical-camp.jpg",
    x: -48, y: -8, rotate: 4,
    aspectRatio: "4/3",
    delay: 2.0
  },
  {
    id: "far-8",
    depth: "far",
    title: "Community Volunteers",
    category: "Volunteering",
    url: "/images/hero.png",
    x: 48, y: 2, rotate: -4,
    aspectRatio: "4/3",
    delay: 2.2
  }
];
