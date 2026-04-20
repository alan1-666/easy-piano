import React from 'react';
import Svg, { Path, Circle, Rect, G } from 'react-native-svg';
import { Palette } from '../theme';

type IconProps = {
  size?: number;
  color?: string;
  fill?: boolean;
};

export const Play = ({ size = 14, color = '#fff' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 16 16">
    <Path d="M4 2.5v11l9-5.5-9-5.5z" fill={color} />
  </Svg>
);

export const Search = ({ size = 18, color = Palette.ink3 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
    <Circle cx={9} cy={9} r={6} stroke={color} strokeWidth={1.8} />
    <Path d="M14 14l4 4" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
  </Svg>
);

export const Chevron = ({ size = 16, color = Palette.ink3, rotate = 0 }: IconProps & { rotate?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 16 16" style={{ transform: [{ rotate: `${rotate}deg` }] }}>
    <Path d="M6 4l4 4-4 4" stroke={color} strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const ChevronLeft = ({ size = 16, color = Palette.ink3 }: IconProps) => (
  <Chevron size={size} color={color} rotate={180} />
);

export const ChevronRight = ({ size = 16, color = Palette.ink3 }: IconProps) => (
  <Chevron size={size} color={color} rotate={0} />
);

export const Lock = ({ size = 12, color = Palette.ink3 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 12 12" fill="none">
    <Rect x={2.5} y={5.5} width={7} height={5} rx={1} stroke={color} strokeWidth={1.4} />
    <Path d="M4 5.5V4a2 2 0 014 0v1.5" stroke={color} strokeWidth={1.4} />
  </Svg>
);

export const Flame = ({ size = 14, color = Palette.primary }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 14 14">
    <Path d="M7 1c1 2 3 3 3 6a3 3 0 11-6 0c0-1 .5-2 1-2.5C5 5.5 6 3 7 1z" fill={color} />
  </Svg>
);

export const IconHome = ({ size = 22, color = Palette.ink3, fill }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 22 22" fill={fill ? color : 'none'}>
    <Path
      d="M3 10l8-6.5L19 10v8.5a1 1 0 0 1-1 1h-3.5v-6h-5v6H4a1 1 0 0 1-1-1V10z"
      stroke={color}
      strokeWidth={1.7}
      strokeLinejoin="round"
    />
  </Svg>
);

export const IconLibrary = ({ size = 22, color = Palette.ink3, fill }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 22 22" fill="none">
    <Circle cx={11} cy={11} r={8} stroke={color} strokeWidth={1.7} />
    <Circle cx={11} cy={11} r={2.5} fill={fill ? color : 'none'} stroke={color} strokeWidth={1.5} />
  </Svg>
);

export const IconBook = ({ size = 22, color = Palette.ink3, fill }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 22 22" fill={fill ? color : 'none'}>
    <Path
      d="M4 4.5h6a3 3 0 013 3V18a2.5 2.5 0 00-2.5-2.5H4v-11z"
      stroke={color}
      strokeWidth={1.7}
      strokeLinejoin="round"
    />
    <Path
      d="M18 4.5h-6a3 3 0 00-3 3V18a2.5 2.5 0 012.5-2.5H18v-11z"
      stroke={color}
      strokeWidth={1.7}
      strokeLinejoin="round"
    />
  </Svg>
);

export const IconUser = ({ size = 22, color = Palette.ink3, fill }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 22 22" fill={fill ? color : 'none'}>
    <Circle cx={11} cy={8} r={3.5} stroke={color} strokeWidth={1.7} />
    <Path d="M4 19c1-3.5 4-5 7-5s6 1.5 7 5" stroke={color} strokeWidth={1.7} strokeLinecap="round" />
  </Svg>
);

export const WifiIcon = ({ size = 14, color = Palette.ink3 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 14 14" fill="none">
    <Path d="M1 5c3-2.5 9-2.5 12 0M3 8c2-1.5 6-1.5 8 0" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
    <Circle cx={7} cy={11} r={1.2} fill={color} />
  </Svg>
);

export const Check = ({ size = 12, color = Palette.mintInk }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 12 9">
    <Path
      d="M1 4.5L4.5 8 11 1"
      stroke={color}
      strokeWidth={2}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const StarIcon = ({ size = 24, color = Palette.primary, fill = true }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M12 2l2.9 6.3 6.9.7-5.2 4.7 1.5 6.8L12 17l-6.1 3.5 1.5-6.8L2.2 9l6.9-.7L12 2z"
      fill={fill ? color : 'none'}
      stroke={color}
      strokeWidth={fill ? 0 : 1.6}
      strokeLinejoin="round"
    />
  </Svg>
);

export const HeadphonesIcon = ({ size = 18, color = Palette.ink2 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 18 18" fill="none">
    <Path d="M3 11v-1a6 6 0 0112 0v1" stroke={color} strokeWidth={1.6} strokeLinecap="round" />
    <Rect x={2.5} y={10.5} width={3.5} height={5.5} rx={1.2} fill={color} />
    <Rect x={12} y={10.5} width={3.5} height={5.5} rx={1.2} fill={color} />
  </Svg>
);

export const SettingsIcon = ({ size = 18, color = Palette.ink2 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 18 18" fill="none">
    <Circle cx={9} cy={9} r={2.4} stroke={color} strokeWidth={1.5} />
    <Path
      d="M9 1.5v2M9 14.5v2M2.5 9h-1M16.5 9h-1M4 4l1.4 1.4M12.6 12.6L14 14M4 14l1.4-1.4M12.6 5.4L14 4"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
    />
  </Svg>
);

export const LogOutIcon = ({ size = 18, color = Palette.ink2 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 18 18" fill="none">
    <Path
      d="M7 3H4a1 1 0 00-1 1v10a1 1 0 001 1h3M11 12l3-3-3-3M14 9H7"
      stroke={color}
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const EyeIcon = ({ size = 18, color = Palette.ink3 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 18 18" fill="none">
    <Path
      d="M1 9s3-5.5 8-5.5S17 9 17 9s-3 5.5-8 5.5S1 9 1 9z"
      stroke={color}
      strokeWidth={1.5}
      strokeLinejoin="round"
    />
    <Circle cx={9} cy={9} r={2.4} stroke={color} strokeWidth={1.5} />
  </Svg>
);

export const EyeOffIcon = ({ size = 18, color = Palette.ink3 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 18 18" fill="none">
    <Path
      d="M2 2l14 14M4.5 5.3C2.6 6.7 1 9 1 9s3 5.5 8 5.5c1.5 0 2.8-.4 4-1.1M8 3.6c.3-.05.7-.1 1-.1 5 0 8 5.5 8 5.5s-.7 1.3-2 2.7"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
    />
  </Svg>
);

export const Pause = ({ size = 14, color = Palette.ink }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 12 12">
    <Rect x={3} y={2} width={2} height={8} fill={color} />
    <Rect x={7} y={2} width={2} height={8} fill={color} />
  </Svg>
);

export const MenuIcon = ({ size = 16, color = Palette.ink }: IconProps) => (
  <Svg width={size} height={14} viewBox="0 0 16 14">
    <Path d="M1 3h14M3 7h10M6 11h4" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
  </Svg>
);

export const Dot = ({ size = 6, color = Palette.ink3 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 6 6">
    <Circle cx={3} cy={3} r={3} fill={color} />
  </Svg>
);

// ── Legacy lucide re-exports ────────────────────────────────────
// Retained so any screen that still imports them doesn't break while
// the redesign migrates. New screens should prefer the custom icons
// above for visual consistency with the design.
/* eslint-disable @typescript-eslint/no-var-requires */
export const Home = IconHome;
export const Music = IconLibrary;
export const BarChart3 = IconLibrary;
export const User = IconUser;
export const Wifi = WifiIcon;
export const Clock = require('lucide-react-native/dist/cjs/icons/clock');
export const Star = StarIcon;
export const Settings = SettingsIcon;
export const LogOut = LogOutIcon;
export const Award = require('lucide-react-native/dist/cjs/icons/award');
export const TrendingUp = require('lucide-react-native/dist/cjs/icons/trending-up');
export const Gamepad2 = require('lucide-react-native/dist/cjs/icons/gamepad-2');
export const BookOpen = IconBook;
export const Eye = EyeIcon;
export const EyeOff = EyeOffIcon;
export const Zap = Flame;
export const Target = require('lucide-react-native/dist/cjs/icons/target');
export const Trophy = require('lucide-react-native/dist/cjs/icons/trophy');
export const Heart = require('lucide-react-native/dist/cjs/icons/heart');
export const Headphones = HeadphonesIcon;
export const Piano = require('lucide-react-native/dist/cjs/icons/piano');
