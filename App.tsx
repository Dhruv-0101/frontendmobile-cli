import React, { useState } from 'react';
import {
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
  ScrollView,
} from 'react-native';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <AppContent />
    </SafeAreaProvider>
  );
}

function AppContent() {
  const safeAreaInsets = useSafeAreaInsets();
  const isDarkMode = useColorScheme() === 'dark';
  const [clickCount, setClickCount] = useState(0);

  // Theme-based styling colors
  const theme = {
    background: isDarkMode ? '#0f172a' : '#f8fafc',
    cardBackground: isDarkMode ? '#1e293b' : '#ffffff',
    textPrimary: isDarkMode ? '#f8fafc' : '#0f172a',
    textSecondary: isDarkMode ? '#94a3b8' : '#64748b',
    accent: '#6366f1',
    accentLight: isDarkMode ? '#312e81' : '#e0e7ff',
    border: isDarkMode ? '#334155' : '#e2e8f0',
  };

  const handleIncrement = () => {
    setClickCount((prev) => prev + 1);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background, paddingTop: safeAreaInsets.top, paddingBottom: safeAreaInsets.bottom }]}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
            BlogMapp Mobile
          </Text>
          <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>
            Welcome Back! ⚡
          </Text>
        </View>

        {/* Live Status Card */}
        <View style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
          <View style={styles.statusBadgeRow}>
            <View style={styles.glowingDot} />
            <Text style={styles.statusBadgeText}>LIVE RELOAD ACTIVE</Text>
          </View>
          <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>
            Hot Reloading Test
          </Text>
          <Text style={[styles.cardDescription, { color: theme.textSecondary }]}>
            Edit any code in App.tsx or subcomponents. The app will update instantly without losing state!
          </Text>
        </View>

        {/* Interactive State Card */}
        <View style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
          <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>
            Interactive Counter
          </Text>
          <Text style={[styles.cardDescription, { color: theme.textSecondary }]}>
            Tap the button below. This count demonstrates that React Native retains local component state during hot reload.
          </Text>
          
          <View style={styles.counterRow}>
            <Text style={[styles.counterValue, { color: theme.accent }]}>
              {clickCount}
            </Text>
            <Text style={[styles.counterLabel, { color: theme.textSecondary }]}>
              taps registered
            </Text>
          </View>

          <TouchableOpacity 
            style={[styles.button, { backgroundColor: theme.accent }]}
            onPress={handleIncrement}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Tap Me</Text>
          </TouchableOpacity>
        </View>

        {/* Tech Stack Cards */}
        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
          Application Details
        </Text>
        
        <View style={[styles.techRow]}>
          <View style={[styles.techBadge, { backgroundColor: theme.accentLight }]}>
            <Text style={[styles.techBadgeText, { color: theme.accent }]}>React Native 0.86</Text>
          </View>
          <View style={[styles.techBadge, { backgroundColor: theme.accentLight }]}>
            <Text style={[styles.techBadgeText, { color: theme.accent }]}>TypeScript</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    padding: 24,
    gap: 20,
  },
  header: {
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    marginTop: 4,
  },
  card: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    gap: 12,
  },
  statusBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dcfce7',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    alignSelf: 'flex-start',
    gap: 6,
  },
  glowingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22c55e',
  },
  statusBadgeText: {
    color: '#15803d',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  cardDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginVertical: 8,
  },
  counterValue: {
    fontSize: 48,
    fontWeight: '800',
  },
  counterLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  button: {
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 12,
  },
  techRow: {
    flexDirection: 'row',
    gap: 10,
  },
  techBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  techBadgeText: {
    fontSize: 13,
    fontWeight: '600',
  },
});

export default App;
