import React from 'react';
import { View, Text } from 'react-native';
import COLORS from '../constants/colors';

interface IconProps {
  color?: string;
  size?: number;
}

export const HomeIcon: React.FC<IconProps> = ({ color = COLORS.textLightSecondary, size = 16 }) => {
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      {/* Roof */}
      <View style={{
        width: 0,
        height: 0,
        backgroundColor: 'transparent',
        borderStyle: 'solid',
        borderLeftWidth: size / 2 - 1,
        borderRightWidth: size / 2 - 1,
        borderBottomWidth: size / 2 - 2,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderBottomColor: color,
      }} />
      {/* Base */}
      <View style={{
        width: size - 5,
        height: size / 2 - 1,
        borderWidth: 1.6,
        borderColor: color,
        borderTopWidth: 0,
        marginTop: -1,
      }} />
    </View>
  );
};

export const FeedIcon: React.FC<IconProps> = ({ color = COLORS.textLightSecondary, size = 16 }) => {
  return (
    <View style={{
      width: size - 2,
      height: size - 2,
      borderWidth: 1.6,
      borderColor: color,
      borderRadius: 3,
      padding: 2,
      justifyContent: 'space-between',
    }}>
      <View style={{ height: 1.5, backgroundColor: color, width: '100%' }} />
      <View style={{ height: 1.5, backgroundColor: color, width: '70%' }} />
      <View style={{ height: 1.5, backgroundColor: color, width: '100%' }} />
    </View>
  );
};

export const WriteIcon: React.FC<IconProps> = ({ color = COLORS.textLightSecondary, size = 16 }) => {
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      {/* Pencil Body */}
      <View style={{
        width: 4,
        height: size - 4,
        borderWidth: 1.6,
        borderColor: color,
        transform: [{ rotate: '45deg' }],
        position: 'relative',
        borderRadius: 1,
      }}>
        {/* Lead Tip */}
        <View style={{
          position: 'absolute',
          bottom: -3.5,
          left: -0.5,
          width: 0,
          height: 0,
          borderStyle: 'solid',
          borderLeftWidth: 1,
          borderRightWidth: 1,
          borderBottomWidth: 3,
          borderLeftColor: 'transparent',
          borderRightColor: 'transparent',
          borderBottomColor: color,
          transform: [{ rotate: '180deg' }],
        }} />
      </View>
    </View>
  );
};

export const RankingsIcon: React.FC<IconProps> = ({ color = COLORS.warning, size = 16 }) => {
  return (
    <Text style={{ fontSize: size, color, fontWeight: '900', lineHeight: size + 2 }}>★</Text>
  );
};

export const AlertsIcon: React.FC<IconProps> = ({ color = COLORS.textLightPrimary, size = 16 }) => {
  return (
    <View style={{ width: size, height: size + 2, alignItems: 'center', justifyContent: 'center' }}>
      {/* Bell cap */}
      <View style={{
        width: size - 6,
        height: size - 6,
        borderTopLeftRadius: size / 2,
        borderTopRightRadius: size / 2,
        borderWidth: 1.6,
        borderColor: color,
        borderBottomWidth: 0,
        backgroundColor: 'transparent',
      }} />
      {/* Bell lip */}
      <View style={{
        width: size - 2,
        height: 1.8,
        backgroundColor: color,
        borderRadius: 1,
      }} />
      {/* Clapper */}
      <View style={{
        width: 3.5,
        height: 2.5,
        borderBottomLeftRadius: 1.8,
        borderBottomRightRadius: 1.8,
        backgroundColor: color,
        marginTop: 0.8,
      }} />
    </View>
  );
};
