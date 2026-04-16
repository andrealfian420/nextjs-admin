const users = Array.from({ length: 23 }).map((_, i) => ({
  id: i + 1,
  name: `Jack Wilders ${i + 1}`,
  email: `jack${i + 1}@gmail.com`,
  age: 20 + (i % 10),
  uuid: crypto.randomUUID(),
  createdAt: new Date().toISOString(),
}));

export const userService = {
  // Simulate an API call with pagination, search, and sorting
  async getUsers({ page = 1, per_page = 10, search = '', sort }) {
    await new Promise((r) => setTimeout(r, 500));

    let filtered = [...users];

    if (search) {
      filtered = filtered.filter(
        (u) =>
          u.name.toLowerCase().includes(search.toLowerCase()) ||
          u.email.toLowerCase().includes(search.toLowerCase()),
      );
    }

    if (sort) {
      const desc = sort.startsWith('-');
      const key = desc ? sort.slice(1) : sort;

      filtered.sort((a, b) => {
        if (desc) return a[key] < b[key] ? 1 : -1;
        return a[key] > b[key] ? 1 : -1;
      });
    }

    const total = filtered.length;
    const lastPage = Math.ceil(total / per_page);

    const start = (page - 1) * per_page;
    const paginated = filtered.slice(start, start + per_page);

    return {
      success: true,
      data: {
        data: paginated,
        meta: {
          total,
          per_page: per_page,
          current_page: page,
          last_page: lastPage,
        },
        links: [
          {
            label: 'Previous',
            url: page > 1 ? `?page=${page - 1}` : null,
            active: false,
          },
          ...Array.from({ length: lastPage }).map((_, i) => ({
            label: String(i + 1),
            url: `?page=${i + 1}`,
            active: page === i + 1,
          })),
          {
            label: 'Next',
            url: page < lastPage ? `?page=${page + 1}` : null,
            active: false,
          },
        ],
      },
    };
  },
};
