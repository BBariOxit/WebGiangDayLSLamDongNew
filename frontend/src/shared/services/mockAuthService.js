/**
 * Mock Authentication Service
 * Simulates backend authentication with localStorage
 * Remove this when real backend is ready
 */

// Mock user database
const MOCK_USERS = [
  {
    id: 'admin1',
    email: 'admin@lamdong.edu.vn',
    password: 'admin123', // In production, never store plain passwords!
    fullName: 'Admin Hệ thống',
    role: 'admin',
    avatar: null,
  },
  {
    id: 'teacher1',
    email: 'teacher@lamdong.edu.vn',
    password: 'teacher123',
    fullName: 'GV. Nguyễn Văn A',
    role: 'teacher',
    avatar: null,
  },
  {
    id: 'student1',
    email: 'student@lamdong.edu.vn',
    password: 'student123',
    fullName: 'HS. Trần Thị B',
    role: 'student',
    avatar: null,
  },
];

// Generate mock JWT token
function generateMockToken(user) {
  const payload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    exp: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
  };
  // In real app, this would be a real JWT
  return btoa(JSON.stringify(payload));
}

class MockAuthService {
  /**
   * Mock login
   */
  async login(email, password) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const user = MOCK_USERS.find(
          u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
        );

        if (!user) {
          reject({
            response: {
              data: {
                error: 'Email hoặc mật khẩu không đúng',
              },
            },
          });
          return;
        }

        // Remove password from response
        const { password: _, ...userWithoutPassword } = user;

        resolve({
          data: {
            user: userWithoutPassword,
            accessToken: generateMockToken(user),
            refreshToken: generateMockToken(user) + '_refresh',
          },
        });
      }, 500); // Simulate network delay
    });
  }

  /**
   * Mock register
   */
  async register(userData) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Check if email already exists
        const exists = MOCK_USERS.find(
          u => u.email.toLowerCase() === userData.email.toLowerCase()
        );

        if (exists) {
          reject({
            response: {
              data: {
                error: 'Email đã được sử dụng',
              },
            },
          });
          return;
        }

        // Create new user
        const newUser = {
          id: 'user_' + Date.now(),
          email: userData.email,
          password: userData.password,
          fullName: userData.name || userData.fullName,
          role: userData.role || 'student',
          avatar: null,
        };

        // In a real app, this would be saved to database
        MOCK_USERS.push(newUser);

        const { password: _, ...userWithoutPassword } = newUser;

        resolve({
          data: {
            user: userWithoutPassword,
            accessToken: generateMockToken(newUser),
            refreshToken: generateMockToken(newUser) + '_refresh',
          },
        });
      }, 500);
    });
  }

  /**
   * Mock Google login
   */
  async loginWithGoogle(idToken) {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulate Google OAuth
        const mockGoogleUser = {
          id: 'google_' + Date.now(),
          email: 'google.user@gmail.com',
          fullName: 'Google User',
          role: 'student',
          avatar: 'https://ui-avatars.com/api/?name=Google+User',
        };

        resolve({
          data: {
            user: mockGoogleUser,
            accessToken: generateMockToken(mockGoogleUser),
            refreshToken: generateMockToken(mockGoogleUser) + '_refresh',
          },
        });
      }, 800);
    });
  }

  /**
   * Mock logout
   */
  async logout() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ data: { message: 'Logged out successfully' } });
      }, 200);
    });
  }

  /**
   * Get current user info
   */
  async getCurrentUser(token) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const payload = JSON.parse(atob(token));
          const user = MOCK_USERS.find(u => u.id === payload.userId);
          
          if (!user) {
            reject({ response: { data: { error: 'User not found' } } });
            return;
          }

          const { password: _, ...userWithoutPassword } = user;
          resolve({ data: { user: userWithoutPassword } });
        } catch (error) {
          reject({ response: { data: { error: 'Invalid token' } } });
        }
      }, 300);
    });
  }

  /**
   * Get mock users for demo (development only)
   */
  getMockUsers() {
    return MOCK_USERS.map(({ password: _, ...user }) => user);
  }
}

export default new MockAuthService();

// Export mock users info for demo purposes
export const DEMO_ACCOUNTS = [
  {
    role: 'Admin',
    email: 'admin@lamdong.edu.vn',
    password: 'admin123',
    description: 'Quản trị viên hệ thống',
  },
  {
    role: 'Teacher',
    email: 'teacher@lamdong.edu.vn',
    password: 'teacher123',
    description: 'Giáo viên',
  },
  {
    role: 'Student',
    email: 'student@lamdong.edu.vn',
    password: 'student123',
    description: 'Học sinh',
  },
];
