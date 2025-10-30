import React from 'react';
import { Stage, Layer, Rect, Circle, Text, Group } from 'react-konva';
import { useLineupBuilderStore } from '../../store/useLineupBuilderStore';

const FIELD_W = 400;
const FIELD_H = 600;
const PLAYER_RADIUS = 27;

export function FieldCanvas() {
  const { players, updatePlayer, selectPlayer, selectedPlayerId } = useLineupBuilderStore();

  function snap(val: number, gap: number = 10) {
    return Math.round(val / gap) * gap;
  }

  return (
    <Stage width={FIELD_W} height={FIELD_H} style={{ background: '#0B3D0B', borderRadius: '18px' }}>
      <Layer>
        {/* 필드 라인, 중앙서클 */}
        <Rect x={0} y={0} width={FIELD_W} height={FIELD_H} fill="#0B3D0B" stroke="#6FCF97" strokeWidth={6} cornerRadius={18} />
        <Rect x={20} y={20} width={FIELD_W-40} height={FIELD_H-40} stroke="#6FCF97" strokeWidth={3} cornerRadius={15} />
        <Circle x={FIELD_W/2} y={FIELD_H/2} radius={50} stroke="#6FCF97" strokeWidth={3} />
        {/* 선수 아이콘 */}
        {players.map((p) => (
          <Group key={p.player_id}
                 x={p.position.x * FIELD_W}
                 y={p.position.y * FIELD_H}
                 draggable
                 onDragEnd={e=>{
                   let nx = Math.max(PLAYER_RADIUS, Math.min(e.target.x(), FIELD_W-PLAYER_RADIUS));
                   let ny = Math.max(PLAYER_RADIUS, Math.min(e.target.y(), FIELD_H-PLAYER_RADIUS));
                   nx = snap(nx); ny = snap(ny);
                   updatePlayer(p.player_id, { position: { x: nx/FIELD_W, y: ny/FIELD_H } });
                 }}
                 onClick={()=>selectPlayer(p.player_id)}
          >
            <Circle
              radius={PLAYER_RADIUS}
              fill={selectedPlayerId===p.player_id ? "#2e6aff" : "#fff"}
              stroke="#6FCF97"
              strokeWidth={4}
              shadowBlur={selectedPlayerId===p.player_id ? 16 : 2}
            />
            <Text
              text={p.number ? String(p.number) : ''}
              fontSize={18}
              fill="#222"
              align="center"
              x={-14} y={-12} width={28}
            />
            <Text
              text={p.name}
              fontSize={12}
              fill="#333"
              align="center"
              x={-PLAYER_RADIUS} y={PLAYER_RADIUS+2} width={PLAYER_RADIUS*2}
            />
            <Text
              text={p.role}
              fontSize={11}
              fill="#035"
              align="center"
              x={-PLAYER_RADIUS} y={PLAYER_RADIUS+18} width={PLAYER_RADIUS*2}
            />
          </Group>
        ))}
      </Layer>
    </Stage>
  );
}
