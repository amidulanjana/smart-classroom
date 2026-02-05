/**
 * API Service for Smart Classroom App
 * Handles all backend communication for emergency pickup flow
 */

const API_BASE_URL = 'http://192.168.100.159:3000/api/v1'; // Update with your backend URL

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'teacher' | 'parent' | 'admin';
  profilePhoto?: string;
}

interface AuthResponse {
  user: User;
  token: string;
}

interface Student {
  _id: string;
  name: string;
  classId: string;
  grade: string;
  section: string;
  profilePhoto?: string;
}

interface Guardian {
  _id: string;
  userId: {
    _id: string;
    name: string;
    phone: string;
  };
  studentId: string;
  priority: 'primary' | 'secondary' | 'backup';
  backupOrder?: number;
}

interface EmergencyPickup {
  _id: string;
  classId: string;
  initiatedBy: string;
  reason: string;
  newPickupTime: Date;
  status: 'initiated' | 'in_progress' | 'completed' | 'escalated';
  studentPickups: StudentPickup[];
}

interface StudentPickup {
  studentId: string;
  status: string;
  confirmedBy?: string;
  confirmedByRole?: 'primary' | 'secondary' | 'backup';
  confirmedAt?: Date;
  escalationLevel: number;
}

interface BackupCircleParent {
  _id: string;
  userId: {
    _id: string;
    name: string;
    phone: string;
  };
  priorityOrder: number;
}

class ApiService {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
  }

  getToken(): string | null {
    return this.token;
  }

  private async fetchWithTimeout(
    url: string,
    options: RequestInit = {},
    timeout = 10000
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers as Record<string, string>,
    };

    // Add authorization header if token exists
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    try {
      // Check if response is ok
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Response is not JSON');
      }

      return await response.json();
    } catch (error) {
      console.error('Error parsing response:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to parse response',
      };
    }
  }

  // ============ Authentication APIs ============

  /**
   * Login user
   */
  async login(email: string, password: string): Promise<ApiResponse<AuthResponse>> {
    try {
      const response = await this.fetchWithTimeout(
        `${API_BASE_URL}/auth/login`,
        {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        }
      );

      const result = await this.handleResponse<AuthResponse>(response);
      
      // Store token if login successful
      if (result.success && result.data?.token) {
        this.setToken(result.data.token);
      }

      return result;
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Login failed',
      };
    }
  }

  /**
   * Register new user
   */
  async register(
    name: string,
    email: string,
    password: string,
    phone: string,
    role: 'teacher' | 'parent'
  ): Promise<ApiResponse<AuthResponse>> {
    try {
      const response = await this.fetchWithTimeout(
        `${API_BASE_URL}/auth/register`,
        {
          method: 'POST',
          body: JSON.stringify({ name, email, password, phone, role }),
        }
      );

      const result = await this.handleResponse<AuthResponse>(response);
      
      // Store token if registration successful
      if (result.success && result.data?.token) {
        this.setToken(result.data.token);
      }

      return result;
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Registration failed',
      };
    }
  }

  /**
   * Get current user profile
   */
  async getProfile(): Promise<ApiResponse<User>> {
    try {
      const response = await this.fetchWithTimeout(
        `${API_BASE_URL}/auth/profile`
      );

      return await this.handleResponse<User>(response);
    } catch (error) {
      console.error('Get profile error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get profile',
      };
    }
  }

  /**
   * Logout user
   */
  logout() {
    this.setToken(null);
  }

  async createActivity(data: { title: string; description?: string; type: string; classId: string; }): Promise<ApiResponse<any>> {
    return this.fetchWithTimeout(`${API_BASE_URL}/activities`, {
      method: 'POST',
      body: JSON.stringify(data),
    }).then(res => this.handleResponse(res));
  }

  async getActivity(activityId: string): Promise<ApiResponse<any>> {
    return this.fetchWithTimeout(`${API_BASE_URL}/activities/${activityId}`).then(res => this.handleResponse(res));
  }

  async getActivityResults(activityId: string): Promise<ApiResponse<any[]>> {
    return this.fetchWithTimeout(`${API_BASE_URL}/activities/${activityId}/results`).then(res => this.handleResponse(res));
  }
  
  async addStudentsToActivity(activityId: string, studentIds: string[]): Promise<ApiResponse<any>> {
    return this.fetchWithTimeout(`${API_BASE_URL}/activities/${activityId}/students`, {
      method: 'POST',
      body: JSON.stringify({ studentIds }),
    }).then(res => this.handleResponse(res));
  }

  async saveActivityResults(activityId: string, results: any[]): Promise<ApiResponse<any>> {
    return this.fetchWithTimeout(`${API_BASE_URL}/activities/${activityId}/results`, {
      method: 'POST',
      body: JSON.stringify({ results }),
    }).then(res => this.handleResponse(res));
  }

  async getStudentsByClass(classId: string): Promise<ApiResponse<Student[]>> {
    try {
      const resp = await this.fetchWithTimeout(`${API_BASE_URL}/classes/${classId}`);
      const json = await resp.json();
      if (json.success && json.data && json.data.students) {
        return { success: true, data: json.data.students };
      }
      return { success: false, message: json.message || 'Failed to fetch students' };
    } catch (error) {
       console.error(error);
       return { success: false, message: 'Error fetching students' };
    }
  }

  // ============ Evaluation Apis (End) ============ 

  // ============ Emergency Pickup APIs ============

  /**
   * Initiate emergency pickup for a class
   */
  async initiateEmergencyPickup(
    classId: string,
    teacherId: string,
    reason: string,
    pickupTime?: Date
  ): Promise<ApiResponse<EmergencyPickup>> {
    try {
      const response = await this.fetchWithTimeout(
        `${API_BASE_URL}/emergency-pickups`,
        {
          method: 'POST',
          body: JSON.stringify({
            class_id: classId,
            teacher_id: teacherId,
            reason,
            pickup_time: pickupTime || new Date(Date.now() + 30 * 60 * 1000),
          }),
        },
        30000 // 30 seconds timeout for emergency pickup (handles many students)
      );

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Error initiating emergency pickup:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to initiate emergency pickup',
      };
    }
  }

  /**
   * Respond to emergency pickup request (parent accepts/declines)
   */
  async respondToPickup(
    emergencyPickupId: string,
    studentId: string,
    userId: string,
    response: 'accepted' | 'declined'
  ): Promise<ApiResponse<any>> {
    try {
      const res = await this.fetchWithTimeout(
        `${API_BASE_URL}/emergency-pickups/respond`,
        {
          method: 'POST',
          body: JSON.stringify({
            emergency_pickup_id: emergencyPickupId,
            student_id: studentId,
            user_id: userId,
            response,
          }),
        }
      );

      return await this.handleResponse(res);
    } catch (error) {
      console.error('Error responding to pickup:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to respond to pickup',
      };
    }
  }

  /**
   * Get pending pickup requests for a user (parent)
   */
  async getPendingPickups(userId: string): Promise<ApiResponse<any[]>> {
    try {
      const response = await this.fetchWithTimeout(
        `${API_BASE_URL}/emergency-pickups/pending/${userId}`
      );

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Error fetching pending pickups:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch pending pickups',
      };
    }
  }

  /**
   * Get active pickups for teacher
   */
  async getActivePickupsForTeacher(
    teacherId: string
  ): Promise<ApiResponse<EmergencyPickup[]>> {
    try {
      const response = await this.fetchWithTimeout(
        `${API_BASE_URL}/emergency-pickups/teacher/${teacherId}/active`
      );

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Error fetching active pickups:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch active pickups',
      };
    }
  }

  /**
   * Mark student as picked up
   */
  async markAsPickedUp(
    emergencyPickupId: string,
    studentId: string
  ): Promise<ApiResponse<any>> {
    try {
      const response = await this.fetchWithTimeout(
        `${API_BASE_URL}/emergency-pickups/picked-up`,
        {
          method: 'POST',
          body: JSON.stringify({
            emergency_pickup_id: emergencyPickupId,
            student_id: studentId,
          }),
        }
      );

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Error marking as picked up:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to mark as picked up',
      };
    }
  }

  // ============ Class APIs ============

  /**
   * Get teacher's classes
   */
  async getTeacherClasses(teacherId: string): Promise<ApiResponse<any[]>> {
    try {
      const response = await this.fetchWithTimeout(
        `${API_BASE_URL}/classes/teacher/${teacherId}`
      );

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Error fetching teacher classes:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch teacher classes',
      };
    }
  }

  /**
   * Get students in a class
   */
  async getClassStudents(classId: string): Promise<ApiResponse<Student[]>> {
    try {
      const response = await this.fetchWithTimeout(
        `${API_BASE_URL}/classes/${classId}/students`
      );

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Error fetching class students:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch class students',
      };
    }
  }

  // ============ Guardian/Backup Circle APIs ============

  /**
   * Get guardians for a student
   */
  async getStudentGuardians(
    studentId: string
  ): Promise<ApiResponse<Guardian[]>> {
    try {
      const response = await this.fetchWithTimeout(
        `${API_BASE_URL}/students/${studentId}/guardians`
      );

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Error fetching guardians:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch guardians',
      };
    }
  }

  /**
   * Get backup circle for a student
   */
  async getBackupCircle(
    studentId: string
  ): Promise<ApiResponse<BackupCircleParent[]>> {
    try {
      const response = await this.fetchWithTimeout(
        `${API_BASE_URL}/students/${studentId}/backup-circle`
      );

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Error fetching backup circle:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch backup circle',
      };
    }
  }

  /**
   * Add parent to backup circle
   */
  async addToBackupCircle(
    studentId: string,
    guardianId: string,
    priorityOrder: number
  ): Promise<ApiResponse<any>> {
    try {
      const response = await this.fetchWithTimeout(
        `${API_BASE_URL}/students/${studentId}/backup-circle`,
        {
          method: 'POST',
          body: JSON.stringify({
            guardian_id: guardianId,
            priority_order: priorityOrder,
          }),
        }
      );

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Error adding to backup circle:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to add to backup circle',
      };
    }
  }

  /**
   * Remove parent from backup circle
   */
  async removeFromBackupCircle(
    studentId: string,
    backupCircleId: string
  ): Promise<ApiResponse<any>> {
    try {
      const response = await this.fetchWithTimeout(
        `${API_BASE_URL}/students/${studentId}/backup-circle/${backupCircleId}`,
        {
          method: 'DELETE',
        }
      );

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Error removing from backup circle:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to remove from backup circle',
      };
    }
  }

  // ============ Notification APIs ============

  /**
   * Get notifications for user
   */
  async getNotifications(userId: string): Promise<ApiResponse<any[]>> {
    try {
      const response = await this.fetchWithTimeout(
        `${API_BASE_URL}/notifications/user/${userId}`
      );

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch notifications',
      };
    }
  }

  /**
   * Mark notification as read
   */
  async markNotificationAsRead(
    notificationId: string
  ): Promise<ApiResponse<any>> {
    try {
      const response = await this.fetchWithTimeout(
        `${API_BASE_URL}/notifications/${notificationId}/read`,
        {
          method: 'PUT',
        }
      );

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to mark notification as read',
      };
    }
  }
}

export default new ApiService();
export type {
  ApiResponse,
  User,
  AuthResponse,
  Student,
  Guardian,
  EmergencyPickup,
  StudentPickup,
  BackupCircleParent,
};
