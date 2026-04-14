export const authService = {
  // This is a mock login function. In a real application, you would make an API call to your backend here.
  async login(data) {
    if (data.email === 'admin@admin.com' && data.password === 'password') {
      return {
        user: {
          id: 1,
          name: 'Admin',
          email: 'admin@admin.com',
        },
        token: 'sample_token',
      };
    }

    throw new Error('Invalid credentials');
  },

  async forgotPassword(data) {
    if (data.email) {
      // Simulate sending a password reset email
      return true;
    }
  }
};
