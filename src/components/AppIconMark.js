import Svg, { Path } from 'react-native-svg';

export function AppIconMark({ size = 24 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 128 128" fill="none">
      <Path
        d="M96 15.5C98.4853 15.5 100.5 17.5147 100.5 20V108C100.5 110.485 98.4853 112.5 96 112.5H33C30.5147 112.5 28.5 110.485 28.5 108V34.6211L47.6211 15.5H96Z"
        fill="#FFF1E2"
        stroke="black"
        strokeWidth={3}
      />
      <Path
        d="M47.5 67L47.5 56C47.5 55.1716 48.1716 54.5 49 54.5H57.5V46C57.5 45.1716 58.1716 44.5 59 44.5L70 44.5C70.8284 44.5 71.5 45.1716 71.5 46V54.5L80 54.5C80.8284 54.5 81.5 55.1716 81.5 56V67C81.5 67.8284 80.8284 68.5 80 68.5H71.5V77C71.5 77.8284 70.8284 78.5 70 78.5H59C58.1716 78.5 57.5 77.8284 57.5 77V68.5H49C48.1716 68.5 47.5 67.8284 47.5 67Z"
        fill="#10B981"
        stroke="#059669"
      />
      <Path
        d="M55.5 29.5H90.5M39.5 90.5H90.5M39.5 102.5H90.5"
        stroke="black"
        strokeWidth={3}
        strokeLinecap="round"
      />
    </Svg>
  );
}
