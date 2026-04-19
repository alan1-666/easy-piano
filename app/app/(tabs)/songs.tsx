import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Search, Lock, Music, Clock } from '../../src/components/Icons';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '../../src/theme';
import {
  mockSongs,
  getDifficultyStars,
  formatDuration,
} from '../../src/utils/mockData';
import type { Song } from '../../src/types/song';

const DIFFICULTY_LABELS = ['全部', '入门', '初级', '中级', '进阶', '高级'];

export default function SongsScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState(0);

  const filteredSongs = useMemo(() => {
    let songs = mockSongs;
    if (selectedDifficulty > 0) {
      songs = songs.filter((s) => s.difficulty === selectedDifficulty);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      songs = songs.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.artist.toLowerCase().includes(q)
      );
    }
    return songs;
  }, [searchQuery, selectedDifficulty]);

  const renderSongItem = ({ item, index }: { item: Song; index: number }) => (
    <Animated.View entering={FadeInDown.duration(300).delay(index * 30)}>
      <TouchableOpacity
        style={styles.songCard}
        onPress={() => router.push(`/game/${item.id}`)}
        activeOpacity={0.85}
      >
        <View style={styles.songCover}>
          <Music size={20} color={Colors.textTertiary} />
        </View>
        <View style={styles.songInfo}>
          <Text style={styles.songTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.songArtist} numberOfLines={1}>
            {item.artist}
          </Text>
          <View style={styles.songMeta}>
            <View style={styles.difficultyDots}>
              {[1, 2, 3, 4, 5].map((level) => (
                <View
                  key={level}
                  style={[
                    styles.difficultyDot,
                    level <= item.difficulty
                      ? styles.difficultyDotActive
                      : styles.difficultyDotInactive,
                  ]}
                />
              ))}
            </View>
            <Clock size={12} color={Colors.textTertiary} />
            <Text style={styles.songDuration}>
              {formatDuration(item.duration)}
            </Text>
          </View>
        </View>
        {!item.isFree && (
          <View style={styles.lockBadge}>
            <Lock size={12} color={Colors.textTertiary} />
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Music size={40} color={Colors.textTertiary} />
      <Text style={styles.emptyText}>没有找到曲目</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={styles.pageTitle}>曲库</Text>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={18} color={Colors.textTertiary} />
          <TextInput
            style={styles.searchInput}
            placeholder="搜索曲目或艺术家"
            placeholderTextColor={Colors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterContainer}
        style={styles.filterScroll}
      >
        {DIFFICULTY_LABELS.map((label, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.filterChip,
              selectedDifficulty === index && styles.filterChipSelected,
            ]}
            onPress={() => setSelectedDifficulty(index)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.filterChipText,
                selectedDifficulty === index && styles.filterChipTextSelected,
              ]}
            >
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={filteredSongs}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderSongItem}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgPrimary,
  },
  pageTitle: {
    fontSize: FontSize.display,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
    marginBottom: Spacing.base,
  },
  searchContainer: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.base,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.bgSecondary,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.base,
    height: 44,
  },
  searchInput: {
    flex: 1,
    fontSize: FontSize.body,
    color: Colors.textPrimary,
    padding: 0,
  },
  filterScroll: {
    marginBottom: Spacing.base,
  },
  filterContainer: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  filterChip: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.bgSecondary,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    height: 34,
    justifyContent: 'center',
  },
  filterChipSelected: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  filterChipText: {
    fontSize: FontSize.caption,
    color: Colors.textSecondary,
  },
  filterChipTextSelected: {
    color: Colors.bgPrimary,
    fontWeight: FontWeight.semibold,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  separator: {
    height: Spacing.sm,
  },
  songCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgSecondary,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
  },
  songCover: {
    width: 52,
    height: 52,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.bgTertiary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  songInfo: {
    flex: 1,
    gap: 2,
  },
  songTitle: {
    fontSize: FontSize.body,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  songArtist: {
    fontSize: FontSize.caption,
    color: Colors.textSecondary,
  },
  songMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  difficultyDots: {
    flexDirection: 'row',
    gap: 3,
  },
  difficultyDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  difficultyDotActive: {
    backgroundColor: Colors.accent,
  },
  difficultyDotInactive: {
    backgroundColor: Colors.bgElevated,
  },
  songDuration: {
    fontSize: FontSize.small,
    color: Colors.textTertiary,
  },
  lockBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.bgTertiary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: Spacing.sm,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.xxl * 2,
    gap: Spacing.md,
  },
  emptyText: {
    fontSize: FontSize.body,
    color: Colors.textSecondary,
  },
});
