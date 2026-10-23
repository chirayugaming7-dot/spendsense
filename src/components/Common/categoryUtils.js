// src/components/Common/categoryUtils.js

export const ICON_TO_EMOJI = {
  Utensils: '🍽️',
  Car: '🚗',
  ShoppingBag: '🛍️',
  Film: '🎬',
  Zap: '⚡',
  Activity: '🏥',
  BookOpen: '📚',
  Plane: '✈️',
  Tag: '🏷️',
  DollarSign: '💵',
  Briefcase: '💼',
  Gift: '🎁',
  Home: '🏠',
  Smartphone: '📱',
  Wrench: '🔧'
};

export function getCategoryEmoji(icon) {
  if (!icon) return '🏷️';
  return ICON_TO_EMOJI[icon] || icon;
}
