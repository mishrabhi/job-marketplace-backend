const memoryStore = {
  jobs: [
    { id: "job_01", title: "Full Stack Engineer", department: "Engineering", location: "Bengaluru", type: "FULL_TIME", status: "OPEN", created_at: "2026-08-01T10:00:00Z" },
    { id: "job_02", title: "Backend Engineer", department: "Engineering", location: "Remote", type: "FULL_TIME", status: "OPEN", created_at: "2026-08-02T11:00:00Z" },
    { id: "job_03", title: "Data Scientist", department: "AI/ML", location: "Pune", type: "FULL_TIME", status: "CLOSED", created_at: "2026-08-03T12:00:00Z" },
    { id: "job_04", title: "Frontend Specialist", department: "Engineering", location: "Bengaluru", type: "FULL_TIME", status: "OPEN", created_at: "2026-08-04T13:00:00Z" }
  ],
  candidates: [
    { id: "cand_01", full_name: "Aarav Sharma", email: "aarav@example.com", degree: "B.Tech CS", grad_year: 2026, skills: ["Node.js", "React"], created_at: "2026-08-01T09:00:00Z" },
    { id: "cand_02", full_name: "Priya Patel", email: "priya@example.com", degree: "B.Tech IT", grad_year: 2026, skills: ["Python", "FastAPI"], created_at: "2026-08-02T09:30:00Z" },
    { id: "cand_03", full_name: "Rohan Varma", email: "rohan@example.com", degree: "MCA", grad_year: 2025, skills: ["Node.js", "PostgreSQL"], created_at: "2026-08-03T10:00:00Z" }
  ]
};

export const repository = {
  // Query collection with pagination & filtering[cite: 15]
  findMany: async (collection, filters = {}, pagination = { offset: 0, limit: 10 }) => {
    let items = [...(memoryStore[collection] || [])];

    // Dynamic filtering[cite: 15]
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null) {
        if (Array.isArray(items[0]?.[key])) {
          items = items.filter(item => item[key].includes(filters[key]));
        } else {
          items = items.filter(item => String(item[key]).toLowerCase() === String(filters[key]).toLowerCase());
        }
      }
    });

    const totalRecords = items.length;
    const paginatedItems = items.slice(pagination.offset, pagination.offset + pagination.limit);

    return {
      items: paginatedItems,
      totalRecords
    };
  },

  findById: async (collection, id) => {
    return (memoryStore[collection] || []).find(item => item.id === id) || null;
  },

  create: async (collection, record) => {
    const newRecord = {
      id: `${collection.slice(0, 4)}_${Date.now()}`,
      ...record,
      created_at: new Date().toISOString()
    };
    memoryStore[collection].unshift(newRecord);
    return newRecord;
  }
};