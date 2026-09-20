import { ScrollView, Text, TouchableOpacity, View } from "react-native";

// Moved out of app/restaurant-menu.tsx unchanged. Single-feature for now: promote to
// components/ui/ or components/shared/ if a second feature needs it.

export function CategoryTabs({ categoryTabs, activeCategory, onPress, styles }: { categoryTabs: string[]; activeCategory: string; onPress: (c: string) => void; styles: any }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScrollContent}>
      {categoryTabs.map((cat) => (
        <TouchableOpacity key={cat} onPress={() => onPress(cat)} style={styles.tabItem} activeOpacity={0.8}>
          <Text style={[styles.tabText, activeCategory === cat && styles.tabTextActive]}>{cat}</Text>
          {activeCategory === cat && <View style={styles.tabActiveMark} />}
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}
