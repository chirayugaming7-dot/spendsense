// src/components/Common/CategoryIcon.jsx
import React from 'react';
import { 
  Utensils, 
  Car, 
  ShoppingBag, 
  Film, 
  Zap, 
  Activity, 
  BookOpen, 
  Plane, 
  Tag, 
  DollarSign, 
  Briefcase, 
  Gift, 
  Home, 
  Smartphone, 
  Wrench 
} from 'lucide-react';

const ICON_MAP = {
  Utensils,
  Car,
  ShoppingBag,
  Film,
  Zap,
  Activity,
  BookOpen,
  Plane,
  Tag,
  DollarSign,
  Briefcase,
  Gift,
  Home,
  Smartphone,
  Wrench
};

export default function CategoryIcon({ icon, size = 18, color, style = {} }) {
  if (!icon) {
    return <Tag size={size} style={{ color, ...style }} />;
  }

  // If icon is a known Lucide component name
  const IconComponent = ICON_MAP[icon];
  if (IconComponent) {
    return <IconComponent size={size} style={{ color, ...style }} />;
  }

  // Otherwise, render as emoji / text
  return (
    <span style={{ fontSize: `${size}px`, lineHeight: 1, display: 'inline-flex', alignItems: 'center', ...style }}>
      {icon}
    </span>
  );
}
