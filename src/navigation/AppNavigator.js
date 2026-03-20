import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '../context/ThemeContext';
import { CaptureScreen } from '../screens/CaptureScreen';
import { EditorScreen } from '../screens/EditorScreen';
import { ExportScreen } from '../screens/ExportScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { LibraryScreen } from '../screens/LibraryScreen';
import { ProjectScreen } from '../screens/ProjectScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function CustomTabBar({ state, descriptors, navigation }) {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);

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
      <Tab.Screen
        name="ProjectTab"
        component={ProjectScreen}
        options={{
          title: 'Projekt',
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

const createStyles = (colors) =>
  StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    gap: 8,
    height: 80,
    paddingTop: 8,
    paddingHorizontal: 8,
    paddingBottom: 12,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 24,
    backgroundColor: colors.surface,
    borderTopWidth: 0,
    borderWidth: 1,
    borderColor: colors.border,
    elevation: 0,
    shadowOpacity: 0,
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  tabItem: {
    flex: 1,
    minHeight: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabItemActive: {
    backgroundColor: colors.primary,
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 18,
    color: colors.muted,
  },
  tabLabelActive: {
    color: colors.surface,
  },
});
