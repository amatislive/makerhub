import React from 'react';
import {
  BreadboardHole,
  BREADBOARD_WIDTH,
  BREADBOARD_HEIGHT,
  BREADBOARD_ORIGIN_X,
  BREADBOARD_ORIGIN_Y,
  BREADBOARD_COLS,
  HOLE_PITCH_PX
} from '../../utils/breadboardModel';

interface BreadboardCanvasProps {
  holes: BreadboardHole[];
  highlightedHoleIds?: Set<string>;
  onHoleClick: (hole: BreadboardHole) => void;
  activeWiringHoleId?: string | null;
}

export const BreadboardCanvas: React.FC<BreadboardCanvasProps> = ({
  holes,
  highlightedHoleIds,
  onHoleClick,
  activeWiringHoleId,
}) => {
  return (
    <g id="breadboard-group">
      {/* Breadboard Outer Body */}
      <rect
        x={BREADBOARD_ORIGIN_X - 25}
        y={BREADBOARD_ORIGIN_Y - 20}
        width={BREADBOARD_WIDTH}
        height={BREADBOARD_HEIGHT}
        rx={8}
        fill="#fcfcfc"
        stroke="#111111"
        strokeWidth={1.5}
        className="filter drop-shadow-[3px_3px_0px_#111111]"
      />

      {/* Decorative Notches on sides */}
      <circle cx={BREADBOARD_ORIGIN_X - 25} cy={BREADBOARD_ORIGIN_Y + 185} r={8} fill="#ffffff" stroke="#111111" strokeWidth={1.5} />
      <circle cx={BREADBOARD_ORIGIN_X + BREADBOARD_WIDTH - 25} cy={BREADBOARD_ORIGIN_Y + 185} r={8} fill="#ffffff" stroke="#111111" strokeWidth={1.5} />

      {/* Center Divider Trough (DIP IC divider) */}
      <rect
        x={BREADBOARD_ORIGIN_X - 5}
        y={BREADBOARD_ORIGIN_Y + 176}
        width={BREADBOARD_WIDTH - 40}
        height={16}
        fill="#eeeeee"
        stroke="#111111"
        strokeWidth={1}
      />
      <text
        x={BREADBOARD_ORIGIN_X + BREADBOARD_WIDTH / 2 - 30}
        y={BREADBOARD_ORIGIN_Y + 188}
        className="font-mono-tech text-[9px] fill-[#111111]/40 font-bold select-none"
      >
        MAKEO BREADBOARD 30
      </text>

      {/* Top Power Rails Lines (+ and -) */}
      <line
        x1={BREADBOARD_ORIGIN_X}
        y1={BREADBOARD_ORIGIN_Y + 10}
        x2={BREADBOARD_ORIGIN_X + BREADBOARD_COLS * HOLE_PITCH_PX + 10}
        y2={BREADBOARD_ORIGIN_Y + 10}
        stroke="#fe5029"
        strokeWidth={2}
        strokeLinecap="round"
      />
      <text
        x={BREADBOARD_ORIGIN_X - 18}
        y={BREADBOARD_ORIGIN_Y + 23}
        className="font-mono-tech text-[10px] font-extrabold fill-[#fe5029] select-none"
      >
        +
      </text>

      <line
        x1={BREADBOARD_ORIGIN_X}
        y1={BREADBOARD_ORIGIN_Y + 52}
        x2={BREADBOARD_ORIGIN_X + BREADBOARD_COLS * HOLE_PITCH_PX + 10}
        y2={BREADBOARD_ORIGIN_Y + 52}
        stroke="#6ebdf7"
        strokeWidth={2}
        strokeLinecap="round"
      />
      <text
        x={BREADBOARD_ORIGIN_X - 18}
        y={BREADBOARD_ORIGIN_Y + 44}
        className="font-mono-tech text-[12px] font-extrabold fill-[#6ebdf7] select-none"
      >
        -
      </text>

      {/* Bottom Power Rails Lines (+ and -) */}
      <line
        x1={BREADBOARD_ORIGIN_X}
        y1={BREADBOARD_ORIGIN_Y + 310}
        x2={BREADBOARD_ORIGIN_X + BREADBOARD_COLS * HOLE_PITCH_PX + 10}
        y2={BREADBOARD_ORIGIN_Y + 310}
        stroke="#fe5029"
        strokeWidth={2}
        strokeLinecap="round"
      />
      <text
        x={BREADBOARD_ORIGIN_X - 18}
        y={BREADBOARD_ORIGIN_Y + 324}
        className="font-mono-tech text-[10px] font-extrabold fill-[#fe5029] select-none"
      >
        +
      </text>

      <line
        x1={BREADBOARD_ORIGIN_X}
        y1={BREADBOARD_ORIGIN_Y + 352}
        x2={BREADBOARD_ORIGIN_X + BREADBOARD_COLS * HOLE_PITCH_PX + 10}
        y2={BREADBOARD_ORIGIN_Y + 352}
        stroke="#6ebdf7"
        strokeWidth={2}
        strokeLinecap="round"
      />
      <text
        x={BREADBOARD_ORIGIN_X - 18}
        y={BREADBOARD_ORIGIN_Y + 344}
        className="font-mono-tech text-[12px] font-extrabold fill-[#6ebdf7] select-none"
      >
        -
      </text>

      {/* Row Labels (A..E) */}
      {['A', 'B', 'C', 'D', 'E'].map((letter, idx) => (
        <text
          key={letter}
          x={BREADBOARD_ORIGIN_X - 14}
          y={BREADBOARD_ORIGIN_Y + 84 + idx * HOLE_PITCH_PX}
          className="font-mono-tech text-[8px] font-bold fill-[#111111]/70 select-none text-anchor-middle"
        >
          {letter}
        </text>
      ))}

      {/* Row Labels (F..J) */}
      {['F', 'G', 'H', 'I', 'J'].map((letter, idx) => (
        <text
          key={letter}
          x={BREADBOARD_ORIGIN_X - 14}
          y={BREADBOARD_ORIGIN_Y + 204 + idx * HOLE_PITCH_PX}
          className="font-mono-tech text-[8px] font-bold fill-[#111111]/70 select-none text-anchor-middle"
        >
          {letter}
        </text>
      ))}

      {/* Column Number Labels (1, 5, 10, 15, 20, 25, 30) */}
      {Array.from({ length: BREADBOARD_COLS }, (_, i) => i + 1).map((col) => {
        if (col === 1 || col % 5 === 0) {
          const x = BREADBOARD_ORIGIN_X + col * HOLE_PITCH_PX;
          return (
            <React.Fragment key={col}>
              <text
                x={x - 4}
                y={BREADBOARD_ORIGIN_Y + 70}
                className="font-mono-tech text-[8px] font-bold fill-[#111111]/60 select-none"
              >
                {col}
              </text>
              <text
                x={x - 4}
                y={BREADBOARD_ORIGIN_Y + 305}
                className="font-mono-tech text-[8px] font-bold fill-[#111111]/60 select-none"
              >
                {col}
              </text>
            </React.Fragment>
          );
        }
        return null;
      })}

      {/* Breadboard Holes */}
      {holes.map((hole) => {
        const isHighlighted = highlightedHoleIds?.has(hole.id);
        const isActiveWiring = activeWiringHoleId === hole.id;

        return (
          <g
            key={hole.id}
            onClick={(e) => {
              e.stopPropagation();
              onHoleClick(hole);
            }}
            className="cursor-pointer group"
          >
            {/* Visual Hole Socket */}
            <circle
              cx={hole.x}
              cy={hole.y}
              r={3.2}
              fill={isActiveWiring ? '#fe5029' : isHighlighted ? '#75f76e' : '#111111'}
              stroke={isActiveWiring ? '#111111' : isHighlighted ? '#111111' : '#ffffff'}
              strokeWidth={1}
              className="transition-colors duration-100"
            />
            {/* Inner socket contact pin appearance */}
            <rect
              x={hole.x - 1.2}
              y={hole.y - 1.2}
              width={2.4}
              height={2.4}
              fill={isActiveWiring ? '#ffffff' : '#333333'}
            />
            {/* Click target (larger hit area) */}
            <circle
              cx={hole.x}
              cy={hole.y}
              r={9}
              fill="transparent"
              className="group-hover:stroke-[#fe5029] group-hover:stroke-[1.5]"
            >
              <title>{hole.id} ({hole.section} // Net: {hole.netId})</title>
            </circle>
          </g>
        );
      })}
    </g>
  );
};
