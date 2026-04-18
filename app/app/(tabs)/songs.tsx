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
import { Colors, Spacing, FontSize, BorderRadius } from '../../src/theme';
import {
  mockSongs,
  getDifficultyStars,
  formatDuration,
} from '../../src/utils/mockData';
import type { Song } from '../../src/types/song';

const DIFFICULTY_FILTERS = ['全部', '★', '★★', '★★★', '★★★★', '★★★★★'];

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

  const renderSongItem = ({ item }: { item: Song }) => (
    <TouchableOpacity
      style={styles.songCard}
      onPress={() => router.push(`/game/${item.id}`)}
      activeOpacity={0.7}
    >
      <View style={styles.songCover}>
        <Text style={styles.songCoverEmoji}>🎹</Text>
      </View>
      <View style={styles.songInfo}>
        <Text style={styles.songTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.songArtist} numberOfLines={1}>
          {item.artist}
        </Text>
        <View style={styles.songMeta}>
          <Text style={styles.songDifficulty}>
            {getDifficultyStars(item.difficulty)}
          </Text>
          <Text style={styles.songDuration}>
            {formatDuration(item.duration)}
          </Text>
        </View>
      </View>
      <View
        style={[
          styles.badge,
          item.isFree ? styles.badgeFree : styles.badgeLocked,
        ]}
      >
        <Text
          style={[
            styles.badgeText,
            item.isFree ? styles.badgeFreeText : styles.badgeLockedText,
          ]}
        >
          {item.isFree ? '免费' : '🔒 订阅'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>没有找到曲目</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={styles.pageTitle}>曲库</Text>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="搜索曲目名称或艺术家"
            placeholderTextColor={Colors.textDisabled}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Filter Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterContainer}
        style={styles.filterScroll}
      >
        {DIFFICULTY_FILTERS.map((filter, index) => (
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
              {filter}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Song List */}
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
    backgroundColor: Colors.background,
  },
  pageTitle: {
    fontSize: FontSize.h1,
    fontWeight: '700',
    color: Colors.white,
    paddingHorizontal: Spacing.base,
    marginTop: Spacing.base,
    marginBottom: Spacing.md,
  },
  searchContainer: {
    paddingHorizontal: Spacing.base,
    marginBottom: Spacing.md,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceLight,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    height: 44,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: FontSize.body,
    color: Colors.white,
    padding: 0,
  },
  filterScroll: {
    marginBottom: Spacing.md,
  },
  filterContainer: {
    paddingHorizontal: Spacing.base,
    gap: Spacing.sm,
  },
  filterChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.surfaceLight,
    borderRadius: BorderRadius.xl,
    height: 32,
    justifyContent: 'center',
  },
  filterChipSelected: {
    backgroundColor: Colors.accent,
  },
  filterChipText: {
    fontSize: FontSize.caption,
    color: Colors.textSecondary,
  },
  filterChipTextSelected: {
    color: Colors.background,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.xl,
  },
  separator: {
    height: Spacing.sm,
  },
  songCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
  },
  songCover: {
    width: 60,
    height: 60,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  songCoverEmoji: {
    fontSize: 24,
  },
  songInfo: {
    flex: 1,
  },
  songTitle: {
    fontSize: FontSize.h4,
    fontWeight: '600',
    color: Colors.white,
  },
  songArtist: {
    fontSize: FontSize.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  songMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.xs,
    gap: Spacing.sm,
  },
  songDifficulty: {
    fontSize: FontSize.small,
    color: Colors.accent,
  },
  songDuration: {
    fontSize: FontSize.caption,
    color: Colors.textSecondary,
  },
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    marginLeft: Spacing.sm,
  },
  badgeFree: {
    backgroundColor: Colors.success,
  },
  badgeLocked: {
    backgroundColor: Colors.textDisabled,
  },
  badgeText: {
    fontSize: FontSize.small,
    fontWeight: '600',
  },
  badgeFreeText: {
    color: Colors.white,
  },
  badgeLockedText: {
    color: Colors.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.xxl * 2,
  },
  emptyText: {
    fontSize: FontSize.body,
    color: Colors.textSecondary,
  },
});
