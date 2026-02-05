import React, { createContext, useContext, useState, useEffect } from 'react';
import apiService from '@/services/api';
import type { EmergencyPickup } from '@/services/api';

interface PickupContextType {
  activePickups: EmergencyPickup[];
  pendingPickups: any[];
  loading: boolean;
  refreshPickups: () => Promise<void>;
  initiatePickup: (classId: string, teacherId: string, reason: string) => Promise<void>;
  respondToPickup: (pickupId: string, studentId: string, userId: string, response: 'accepted' | 'declined') => Promise<void>;
}

const PickupContext = createContext<PickupContextType | undefined>(undefined);

export function PickupProvider({ children }: { children: React.ReactNode }) {
  const [activePickups, setActivePickups] = useState<EmergencyPickup[]>([]);
  const [pendingPickups, setPendingPickups] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const refreshPickups = async () => {
    // This will be called based on user role
    // Implementation depends on the logged-in user
  };

  const initiatePickup = async (classId: string, teacherId: string, reason: string) => {
    try {
      setLoading(true);
      await apiService.initiateEmergencyPickup(classId, teacherId, reason);
      await refreshPickups();
    } catch (error) {
      console.error('Error initiating pickup:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const respondToPickup = async (
    pickupId: string,
    studentId: string,
    userId: string,
    response: 'accepted' | 'declined'
  ) => {
    try {
      setLoading(true);
      await apiService.respondToPickup(pickupId, studentId, userId, response);
      await refreshPickups();
    } catch (error) {
      console.error('Error responding to pickup:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <PickupContext.Provider
      value={{
        activePickups,
        pendingPickups,
        loading,
        refreshPickups,
        initiatePickup,
        respondToPickup,
      }}
    >
      {children}
    </PickupContext.Provider>
  );
}

export function usePickup() {
  const context = useContext(PickupContext);
  if (context === undefined) {
    throw new Error('usePickup must be used within a PickupProvider');
  }
  return context;
}
