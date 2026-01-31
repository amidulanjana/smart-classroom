import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PickupMapScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const latitude = parseFloat(params.latitude as string);
  const longitude = parseFloat(params.longitude as string);
  const studentName = params.studentName as string;
  const address = params.address as string;

  const [region, setRegion] = useState({
    latitude: latitude || 37.78825,
    longitude: longitude || -122.4324,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Pickup Location</Text>
        <View style={{ width: 50 }} />
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.studentName}>{studentName}'s Home</Text>
        <Text style={styles.address}>{address || 'Location Address'}</Text>
      </View>

      <MapView
        style={styles.map}
        provider={PROVIDER_DEFAULT}
        region={region}
      >
        <Marker
          coordinate={{
            latitude: region.latitude,
            longitude: region.longitude,
          }}
          title={`${studentName}'s Home`}
          description={address}
        />
      </MapView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#2196F3',
    fontWeight: 'bold',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  map: {
    flex: 1,
    width: Dimensions.get('window').width,
    height: '100%',
  },
  infoCard: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    zIndex: 1,
  },
  studentName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  address: {
    fontSize: 14,
    color: '#666',
  }
});
