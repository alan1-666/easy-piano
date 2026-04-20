import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useQuery } from '@tanstack/react-query';
import { Search, Lock, MenuIcon } from '../../src/components/Icons';
import { Palette, FontWeight } from '../../src/theme';
import { Pill, Button, LinearBar } from '../../src/components/common';
import { formatDuration } from '../../src/utils/mockData';
import { songHue } from '../../src/utils/songColors';
import { getSongs } from '../../src/api/songs';
import { useUserStore } from '../../src/stores/userStore';
import type { Song } from '../../src/types/song';

const FILTERS: Array<{ label: string; diff: number | null; tag?: string }> = [
  { label: '全部', diff: null },
  { label: '入门', diff: 1 },
  { label: '初级', diff: 2 },
  { label: '中级', diff: 3 },
  { label: '进阶', diff: 4 },
  { label: '高级', diff: 5 },
];

const starsOf = (d: number) => '●'.repeat(d) + '○'.repeat(Math.max(0, 5 - d));

export default function SongsScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const isLoggedIn = useUserStore((s) => s.isLoggedIn);

  // Debounce the search so we don't hammer the API on every keystroke.
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(searchQuery.trim()), 350);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const difficulty = FILTERS[selectedIndex].diff ?? undefined;

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['songs', difficulty, debouncedQuery],
    queryFn: () => getSongs(1, 50, difficulty, debouncedQuery || undefined),
    enabled: isLoggedIn,
    staleTime: 30_000,
  });

  const songs: Song[] = data?.items ?? [];
  const featured = songs[3] ?? songs[0];

  const renderSongItem = ({ item, index }: { item: Song; index: number }) => {
    const { hue, ink } = songHue(item.id);
    const primaryTag = item.tags?.[0];
    return (
      <Animated.View entering={FadeInDown.duration(300).delay(index * 30)}>
        <TouchableOpacity
          style={styles.songCard}
          onPress={() => router.push(`/game/${item.id}`)}
          activeOpacity={0.88}
        >
          <View style={[styles.songTile, { backgroundColor: hue }]}>
            <Text style={[styles.songTileLetter, { color: ink }]}>
              {item.title.charAt(0)}
            </Text>
          </View>
          <View style={styles.songInfo}>
            <Text style={styles.songTitle} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={styles.songArtist} numberOfLines={1}>
              {item.artist} · {formatDuration(item.duration)}
            </Text>
            <View style={styles.songMeta}>
              <Text style={[styles.diffText, { color: ink }]}>
                {starsOf(item.difficulty)}
              </Text>
              {primaryTag && <Pill bg={Palette.chip} color={Palette.ink2} size="xs">{primaryTag}</Pill>}
            </View>
          </View>
          {item.isFree ? (
            <Pill bg={Palette.mint} color={Palette.mintInk}>免费</Pill>
          ) : (
            <View style={styles.lockBadge}>
              <Lock size={12} color={Palette.ink2} />
            </View>
          )}
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderEmpty = () => {
    if (isLoading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="small" color={Palette.primary} />
          <Text style={[styles.emptyText, { marginTop: 10 }]}>加载曲库…</Text>
        </View>
      );
    }
    if (isError) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>加载失败，点击重试</Text>
          <TouchableOpacity onPress={() => refetch()} style={{ marginTop: 10 }}>
            <Text style={{ color: Palette.primary, fontWeight: FontWeight.semibold }}>重试</Text>
          </TouchableOpacity>
        </View>
      );
    }
    if (!isLoggedIn) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>请先登录查看曲库</Text>
          <TouchableOpacity onPress={() => router.push('/auth/login')} style={{ marginTop: 10 }}>
            <Text style={{ color: Palette.primary, fontWeight: FontWeight.semibold }}>去登录</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>没有找到曲目</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FlatList
        data={songs}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderSongItem}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        ListHeaderComponent={
          <>
            <View style={styles.headerRow}>
              <Text style={styles.pageTitle}>曲库</Text>
              <TouchableOpacity style={styles.headerBtn} activeOpacity={0.8}>
                <MenuIcon size={16} color={Palette.ink} />
              </TouchableOpacity>
            </View>

            <View style={styles.searchBar}>
              <Search size={18} color={Palette.ink3} />
              <TextInput
                style={styles.searchInput}
                placeholder="搜索曲目或艺术家"
                placeholderTextColor={Palette.ink3}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterContainer}
              style={{ marginHorizontal: -20 }}
            >
              {FILTERS.map((f, index) => {
                const sel = selectedIndex === index;
                return (
                  <TouchableOpacity
                    key={f.label}
                    style={[
                      styles.filterChip,
                      sel
                        ? { backgroundColor: Palette.ink, borderColor: Palette.ink }
                        : { backgroundColor: Palette.card, borderColor: Palette.line },
                    ]}
                    onPress={() => setSelectedIndex(index)}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        { color: sel ? '#fff' : Palette.ink2 },
                      ]}
                    >
                      {f.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {featured && (
              <View style={styles.featuredCard}>
                <View pointerEvents="none" style={StyleSheet.absoluteFill}>
                  <LinearBar from={Palette.primarySoft} to={Palette.lilac} angle={45} radius={24} />
                </View>
                <Pill bg="rgba(255,255,255,0.7)" color={Palette.primary}>本周精选</Pill>
                <Text style={styles.featuredTitle}>{featured.title}</Text>
                <Text style={styles.featuredMeta}>
                  {featured.artist} · {formatDuration(featured.duration)} · {starsOf(featured.difficulty)}
                </Text>
                <View style={styles.featuredCta}>
                  <Button
                    size="sm"
                    variant="primary"
                    onPress={() => router.push(`/game/${featured.id}`)}
                  >
                    开始练习
                  </Button>
                  <Button size="sm" variant="secondary" onPress={() => {}}>
                    试听
                  </Button>
                </View>
                <View style={styles.featuredKeys} pointerEvents="none">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <View key={i} style={styles.featuredKey} />
                  ))}
                </View>
              </View>
            )}
          </>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.bg,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  headerRow: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pageTitle: {
    fontSize: 32,
    fontWeight: FontWeight.bold,
    color: Palette.ink,
    letterSpacing: -1,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Palette.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Palette.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBar: {
    marginTop: 14,
    height: 48,
    backgroundColor: Palette.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Palette.line,
    borderRadius: 24,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Palette.ink,
    padding: 0,
  },
  filterContainer: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: FontWeight.semibold,
    letterSpacing: -0.1,
  },
  featuredCard: {
    marginTop: 4,
    marginBottom: 14,
    borderRadius: 24,
    padding: 18,
    overflow: 'hidden',
  },
  featuredTitle: {
    fontSize: 22,
    fontWeight: FontWeight.bold,
    color: Palette.ink,
    letterSpacing: -0.5,
    marginTop: 10,
  },
  featuredMeta: {
    fontSize: 13,
    color: Palette.ink2,
    marginTop: 2,
  },
  featuredCta: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
  },
  featuredKeys: {
    position: 'absolute',
    right: -10,
    bottom: -20,
    flexDirection: 'row',
    gap: 2,
    opacity: 0.4,
    transform: [{ rotate: '12deg' }],
  },
  featuredKey: {
    width: 22,
    height: 70,
    backgroundColor: '#fff',
    borderRadius: 6,
  },
  songCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.card,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Palette.line,
    padding: 10,
    gap: 12,
  },
  songTile: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  songTileLetter: {
    fontSize: 18,
    fontWeight: FontWeight.heavy,
    letterSpacing: -0.5,
  },
  songInfo: {
    flex: 1,
    minWidth: 0,
  },
  songTitle: {
    fontSize: 14,
    fontWeight: FontWeight.semibold,
    color: Palette.ink,
    letterSpacing: -0.2,
  },
  songArtist: {
    fontSize: 12,
    color: Palette.ink3,
    marginTop: 2,
  },
  songMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  diffText: {
    fontSize: 9,
    fontWeight: FontWeight.bold,
    letterSpacing: 1,
  },
  lockBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Palette.chip,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 14,
    color: Palette.ink2,
  },
});
