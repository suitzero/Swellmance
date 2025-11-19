// Mock API for frontend development

const mockUsers = [
  { id: 1, email: 'user1@example.com', password: 'password', name: 'Alice', gender: 'Female' },
  { id: 2, email: 'user2@example.com', password: 'password', name: 'Bob', gender: 'Male' },
];

const mockSurfSpots = [
  { id: 1, name: 'Malibu', location: 'California' },
  { id: 2, name: 'Pipeline', location: 'Hawaii' },
];

let userPreferredSpots = {
  1: [1],
  2: [2],
};

const mockApi = {
  login: async ({ email, password }) => {
    const user = mockUsers.find((u) => u.email === email && u.password === password);
    if (user) {
      return Promise.resolve({ data: { token: `mock-token-for-${user.id}` } });
    }
    return Promise.reject(new Error('Invalid credentials'));
  },
  register: async ({ email, password, name, gender }) => {
    const newUser = { id: mockUsers.length + 1, email, password, name, gender };
    mockUsers.push(newUser);
    return Promise.resolve({ data: { token: `mock-token-for-${newUser.id}` } });
  },
  getSurfSpots: async () => {
    return Promise.resolve({ data: mockSurfSpots });
  },
  addSurfSpot: async (userId, surfSpotId) => {
    if (!userPreferredSpots[userId]) {
      userPreferredSpots[userId] = [];
    }
    userPreferredSpots[userId].push(surfSpotId);
    return Promise.resolve();
  },
  getMatches: async (userId) => {
    const currentUser = mockUsers.find(u => u.id === userId);
    const preferredSpots = userPreferredSpots[userId] || [];
    const matches = mockUsers.filter(u => {
      if (u.id === userId || u.gender === currentUser.gender) {
        return false;
      }
      const otherUserSpots = userPreferredSpots[u.id] || [];
      return preferredSpots.some(spotId => otherUserSpots.includes(spotId));
    });
    return Promise.resolve({ data: matches });
  },
};

export default mockApi;
