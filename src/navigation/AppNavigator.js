import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppTheme } from '../context/ThemeContext';
import { CaptureScreen } from '../screens/CaptureScreen';
import { EditorScreen } from '../screens/EditorScreen';
import { ExportScreen } from '../screens/ExportScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { LibraryScreen } from '../screens/LibraryScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function CustomTabBar({ state, descriptors, navigation }) {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const styles = createStyles(colors, insets.bottom);
  const iconByRoute = {
    HomeTab: 'home-outline',
    CaptureTab: 'scan-outline',
    LibraryTab: 'library-outline',
  };

  return (
    <View style={styles.tabBar}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label = options.title ?? route.name;
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        return (
          <Pressable
            key={route.key}
            onPress={onPress}
            style={[styles.tabItem, isFocused ? styles.tabItemActive : null]}
          >
            <Ionicons
              name={iconByRoute[route.name] ?? 'ellipse-outline'}
              size={20}
              color={isFocused ? colors.primary : colors.muted}
            />
            <Text style={[styles.tabLabel, isFocused ? styles.tabLabelActive : null]}>{label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: 'none' },
      }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          title: 'Start',
          tabBarIcon: () => null,
        }}
      />
      <Tab.Screen
        name="CaptureTab"
        component={CaptureScreen}
        options={{
          title: 'Skan',
          tabBarIcon: () => null,
        }}
      />
      <Tab.Screen
        name="LibraryTab"
        component={LibraryScreen}
        options={{
          title: 'Dokumenty',
          tabBarIcon: () => null,
        }}
      />
    </Tab.Navigator>
  );
}

export function AppNavigator() {
  const { colors } = useAppTheme();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen name="Editor" component={EditorScreen} />
      <Stack.Screen name="Export" component={ExportScreen} />
    </Stack.Navigator>
  );
}

const createStyles = (colors, bottomInset) =>
  StyleSheet.create({
    tabBar: {
      flexDirection: 'row',
      gap: 8,
      height: 72 + bottomInset,
      paddingTop: 8,
      paddingHorizontal: 8,
      paddingBottom: Math.max(10, bottomInset),
      marginHorizontal: 0,
      marginBottom: 0,
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      backgroundColor: colors.surface,
      borderTopWidth: 1,
      borderColor: colors.border,
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
    },
    tabItem: {
      flex: 1,
      minHeight: 56,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 2,
      borderWidth: 1,
      borderColor: 'transparent',
    },
    tabItemActive: {
      backgroundColor: colors.primarySoft,
      borderColor: colors.border,
    },
    tabLabel: {
      fontSize: 11,
      fontWeight: '600',
      lineHeight: 14,
      color: colors.muted,
    },
    tabLabelActive: {
      color: colors.primary,
      fontWeight: '700',
    },
  });
