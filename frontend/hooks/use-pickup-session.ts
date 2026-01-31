import { useState, useCallback } from 'react';
import Constants from 'expo-constants';

export type PickupSessionStatus = 'pending' | 'accepted' | 'declined' | 'timeout' | 'completed';
export type GuardianType = 'primary' | 'secondary' | 'backup';

export interface Guardian {
  id: string;
  name: string;
  phone: string;
  type: GuardianType;
  priority: number;
  notificationToken?: string;
}

export interface PickupSession {
  id: string;
  studentId: string;
  studentName: string;
  parentId: string;
  parentName: string;
  reason: string;
  originalMessage: string;
  createdAt: Date;
  currentGuardianIndex: number;
  guardians: Guardian[];
  status: PickupSessionStatus;
  responses: {
    guardianId: string;
    guardianName: string;
    response: 'accepted' | 'declined';
    timestamp: Date;
    message?: string;
  }[];
}

export function usePickupSession() {
  const [sessions, setSessions] = useState<Map<string, PickupSession>>(new Map());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createSession = useCallback(async (
    studentId: string,
    studentName: string,
    parentId: string,
    parentName: string,
    reason: string,
    originalMessage: string
  ): Promise<string | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const apiUrl = Constants.expoConfig?.extra?.apiUrl || process.env.EXPO_PUBLIC_API_URL;
      
      if (!apiUrl) {
        throw new Error('API URL not configured');
      }

      // Fetch guardian hierarchy for this student (includes backup circle)
      const guardiansResponse = await fetch(`${apiUrl}/api/students/${studentId}/guardians?includeBackupCircle=true`);
      
      if (!guardiansResponse.ok) {
        throw new Error('Failed to fetch guardians');
      }

      const guardiansData = await guardiansResponse.json();
      const guardians: Guardian[] = guardiansData.data || [];

      if (guardians.length === 0) {
        throw new Error('No guardians configured for this student. Please add guardians and backup circle members.');
      }

      // Sort guardians by priority (primary → secondary → backup1 → backup2 → backup3)
      guardians.sort((a, b) => a.priority - b.priority);

      // Create session on backend
      const sessionResponse = await fetch(`${apiUrl}/api/pickup-sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId,
          studentName,
          parentId,
          parentName,
          reason,
          originalMessage,
          guardians: guardians.map(g => g.id),
        }),
      });

      if (!sessionResponse.ok) {
        throw new Error('Failed to create pickup session');
      }

      const sessionData = await sessionResponse.json();
      const sessionId = sessionData.data.sessionId;

      const newSession: PickupSession = {
        id: sessionId,
        studentId,
        studentName,
        parentId,
        parentName,
        reason,
        originalMessage,
        createdAt: new Date(),
        currentGuardianIndex: 0,
        guardians,
        status: 'pending',
        responses: [],
      };

      setSessions(prev => new Map(prev).set(sessionId, newSession));

      // Notify first guardian
      await notifyGuardian(sessionId, guardians[0], newSession);

      setIsLoading(false);
      return sessionId;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create pickup session';
      setError(errorMessage);
      setIsLoading(false);
      return null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const notifyGuardian = useCallback(async (
    sessionId: string,
    guardian: Guardian,
    session: PickupSession
  ): Promise<boolean> => {
    try {
      const apiUrl = Constants.expoConfig?.extra?.apiUrl || process.env.EXPO_PUBLIC_API_URL;
      
      if (!apiUrl) {
        throw new Error('API URL not configured');
      }

      const guardianTypeLabel = guardian.type === 'primary' ? 'Primary Guardian' :
                               guardian.type === 'secondary' ? 'Secondary Guardian' :
                               `Backup Circle Member #${guardian.priority - 2}`;

      // Send push notification to guardian
      const response = await fetch(`${apiUrl}/api/notifications/pickup-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          guardianId: guardian.id,
          guardianToken: guardian.notificationToken,
          guardianType: guardian.type,
          guardianLabel: guardianTypeLabel,
          studentName: session.studentName,
          parentName: session.parentName,
          reason: session.reason,
          urgency: 'high',
          isPrivate: true, // Emphasize this is NOT a broadcast
        }),
      });

      return response.ok;
    } catch (err) {
      console.error('Error notifying guardian:', err);
      return false;
    }
  }, []);

  const handleGuardianResponse = useCallback(async (
    sessionId: string,
    guardianId: string,
    accepted: boolean,
    message?: string
  ): Promise<void> => {
    const session = sessions.get(sessionId);
    
    if (!session) {
      throw new Error('Session not found');
    }

    const guardian = session.guardians.find(g => g.id === guardianId);
    
    if (!guardian) {
      throw new Error('Guardian not found');
    }

    // Record response
    const newResponse = {
      guardianId,
      guardianName: guardian.name,
      response: accepted ? 'accepted' as const : 'declined' as const,
      timestamp: new Date(),
      message,
    };

    const updatedSession = {
      ...session,
      responses: [...session.responses, newResponse],
    };

    if (accepted) {
      // Guardian accepted - session complete
      updatedSession.status = 'completed';
      
      // Notify parent of acceptance
      await notifyParentOfResolution(session.parentId, {
        status: 'accepted',
        guardianName: guardian.name,
        guardianPhone: guardian.phone,
        studentName: session.studentName,
        message,
      });
    } else {
      // Guardian declined - try next guardian
      const nextIndex = session.currentGuardianIndex + 1;
      
      if (nextIndex < session.guardians.length) {
        // Notify next guardian in chain
        updatedSession.currentGuardianIndex = nextIndex;
        const nextGuardian = session.guardians[nextIndex];
        await notifyGuardian(sessionId, nextGuardian, updatedSession);
      } else {
        // No more guardians - notify parent
        updatedSession.status = 'declined';
        await notifyParentOfResolution(session.parentId, {
          status: 'declined',
          studentName: session.studentName,
          reason: 'All guardians declined or unavailable',
        });
      }
    }

    setSessions(prev => {
      const updated = new Map(prev);
      updated.set(sessionId, updatedSession);
      return updated;
    });

    // Update backend
    await updateSessionOnBackend(sessionId, updatedSession);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessions]);

  const notifyParentOfResolution = useCallback(async (
    parentId: string,
    resolution: {
      status: 'accepted' | 'declined';
      studentName: string;
      guardianName?: string;
      guardianPhone?: string;
      reason?: string;
      message?: string;
    }
  ): Promise<void> => {
    try {
      const apiUrl = Constants.expoConfig?.extra?.apiUrl || process.env.EXPO_PUBLIC_API_URL;
      
      if (!apiUrl) {
        throw new Error('API URL not configured');
      }

      await fetch(`${apiUrl}/api/notifications/pickup-resolution`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          parentId,
          resolution,
        }),
      });
    } catch (err) {
      console.error('Error notifying parent:', err);
    }
  }, []);

  const updateSessionOnBackend = useCallback(async (
    sessionId: string,
    session: PickupSession
  ): Promise<void> => {
    try {
      const apiUrl = Constants.expoConfig?.extra?.apiUrl || process.env.EXPO_PUBLIC_API_URL;
      
      if (!apiUrl) {
        return;
      }

      await fetch(`${apiUrl}/api/pickup-sessions/${sessionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: session.status,
          currentGuardianIndex: session.currentGuardianIndex,
          responses: session.responses,
        }),
      });
    } catch (err) {
      console.error('Error updating session:', err);
    }
  }, []);

  const getSession = useCallback((sessionId: string): PickupSession | undefined => {
    return sessions.get(sessionId);
  }, [sessions]);

  const getActiveSessions = useCallback((): PickupSession[] => {
    return Array.from(sessions.values()).filter(
      s => s.status === 'pending' || s.status === 'timeout'
    );
  }, [sessions]);

  return {
    sessions,
    isLoading,
    error,
    createSession,
    handleGuardianResponse,
    getSession,
    getActiveSessions,
  };
}
