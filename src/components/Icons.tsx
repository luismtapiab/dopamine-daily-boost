interface IconProps {
  size?: number;
  color?: string;
  className?: string;
  style?: any;
  title?: string;
}

// Doing Icon - Clean recognizable Pencil
export function PaintBrush({ size = 20, color = 'currentColor', ...props }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} fill={color} viewBox="0 0 256 256" {...props}>
      <path d="M227.31,73.37,182.63,28.69a16,16,0,0,0-22.63,0L36.69,152A15.86,15.86,0,0,0,32,163.31V208a16,16,0,0,0,16,16H92.69A15.86,15.86,0,0,0,104,219.31L227.31,96a16,16,0,0,0,0-22.63ZM92.69,208H48V163.31l88-88L180.69,120ZM180.69,108.69,135.31,63.31l22.63-22.62,45.38,45.38Z" />
    </svg>
  );
}

// Watching Icon - Clean recognizable TV
export function Television({ size = 20, color = 'currentColor', ...props }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} fill={color} viewBox="0 0 256 256" {...props}>
      <path d="M216,80H151.31l32.35-32.35a8,8,0,0,0-11.32-11.32L128,80.69,83.66,36.33A8,8,0,0,0,72.34,47.66L104.69,80H40A16,16,0,0,0,24,96V208a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V96A16,16,0,0,0,216,80Zm0,128H40V96H216V208Z" />
    </svg>
  );
}

// Treat Icon - Clean recognizable Cookie
export function Cookie({ size = 20, color = 'currentColor', ...props }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} fill={color} viewBox="0 0 256 256" {...props}>
      <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm-24-92a12,12,0,1,1,12,12A12,12,0,0,1,104,124Zm56,36a12,12,0,1,1,12,12A12,12,0,0,1,160,160Zm0-64a12,12,0,1,1,12,12A12,12,0,0,1,160,96Z" />
    </svg>
  );
}

// Wildcard Icon - Clean Sparkle
export function PhosphorSparkles({ size = 20, color = 'currentColor', ...props }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} fill={color} viewBox="0 0 256 256" {...props}>
      <path d="M224,112a8,8,0,0,1-8,8,88.1,88.1,0,0,0-88,88,8,8,0,0,1-16,0,88.1,88.1,0,0,0-88-88,8,8,0,0,1,0-16,88.1,88.1,0,0,0,88-88,8,8,0,0,1,16,0,88.1,88.1,0,0,0,88,88A8,8,0,0,1,224,112Z" />
    </svg>
  );
}

// Trash / Delete
export function Trash({ size = 20, color = 'currentColor', ...props }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} fill={color} viewBox="0 0 256 256" {...props}>
      <path d="M216,48H176V40a24,24,0,0,0-24-24H104A24,24,0,0,0,80,40v8H40a8,8,0,0,0,0,16h8V208a16,16,0,0,0,16,16H192a16,16,0,0,0,16-16V64h8a8,8,0,0,0,0-16ZM96,40a8,8,0,0,1,8-8h48a8,8,0,0,1,8,8v8H96ZM192,208H64V64H192V208ZM112,96v80a8,8,0,0,1-16,0V96a8,8,0,0,1,16,0Zm48,0v80a8,8,0,0,1-16,0V96a8,8,0,0,1,16,0Z" />
    </svg>
  );
}

export function getCategoryIcon(category: string, size = 18, color = 'currentColor') {
  switch (category) {
    case 'doing':
      return <PaintBrush size={size} color={color} style={{ display: 'inline-block', verticalAlign: 'middle' }} />;
    case 'watching':
      return <Television size={size} color={color} style={{ display: 'inline-block', verticalAlign: 'middle' }} />;
    case 'treat':
      return <Cookie size={size} color={color} style={{ display: 'inline-block', verticalAlign: 'middle' }} />;
    case 'wildcard':
    default:
      return <PhosphorSparkles size={size} color={color} style={{ display: 'inline-block', verticalAlign: 'middle' }} />;
  }
}

export function getCategoryLabel(category: string) {
  switch (category) {
    case 'doing':
      return 'Doing';
    case 'watching':
      return 'Watching';
    case 'treat':
      return 'Treat';
    case 'wildcard':
    default:
      return 'Wildcard';
  }
}
