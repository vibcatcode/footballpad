import React from 'react';
import { Stage, Layer, Rect, Circle, Text, Group } from 'react-konva';
import { useLineupStore } from '../store/useLineupStore';

const FIELD_WIDTH = 750;
const FIELD_HEIGHT = 480;
const FIELD_COLOR = '#0b3d0b';
const LINE_COLOR = '#fff';
const PLAYER_RADIUS = 28;
const TEAM_COLOR = '#2e6aff';

export function FieldCanvas() {
  const { players, updatePosition } = useLineupStore();
  const handleDrag = (id: string, x: number, y: number) => {
    updatePosition(id, x, y);
  };

  return (
    <Stage width={FIELD_WIDTH} height={FIELD_HEIGHT} style={{ background: FIELD_COLOR, borderRadius: 16 }}>
      <Layer>
        {/* 필드 라인 */}
        <Rect x={0} y={0} width={FIELD_WIDTH} height={FIELD_HEIGHT} fill={FIELD_COLOR} stroke={LINE_COLOR} strokeWidth={4} cornerRadius={16} />
        <Rect x={50} y={50} width={FIELD_WIDTH-100} height={FIELD_HEIGHT-100} stroke={LINE_COLOR} strokeWidth={2} cornerRadius={10} />
        {/* 센터 서클 */}
        <Circle x={FIELD_WIDTH/2} y={FIELD_HEIGHT/2} radius={60} stroke={LINE_COLOR} strokeWidth={3} />
        <Circle x={FIELD_WIDTH/2} y={FIELD_HEIGHT/2} radius={3} fill={LINE_COLOR} />
        {/* 선수 등장 */}
        {players.map((player) => (
          <Group key={player.id}
            x={player.x}
            y={player.y}
            draggable
            onDragEnd={e => handleDrag(player.id, e.target.x(), e.target.y())}
          >
            <Circle
              radius={PLAYER_RADIUS}
              fill={TEAM_COLOR}
              stroke={'#dedede'}
              strokeWidth={3}
            />
            <Text
              text={player.number ? String(player.number) : ''}
              fontSize={18}
              fill={'#fff'}
              align="center"
              x={-16}
              y={-12}
              width={PLAYER_RADIUS*1.5}
            />
            <Text
              text={player.name}
              fontSize={14}
              fill={'#fff'}
              align="center"
              x={-PLAYER_RADIUS}
              y={PLAYER_RADIUS+4}
              width={PLAYER_RADIUS*2}
            />
          </Group>
        ))}
      </Layer>
    </Stage>
  );
}
