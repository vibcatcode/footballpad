import React, { useRef, useState } from 'react';
import { Stage, Layer, Rect, Circle, Text, Group } from 'react-konva';
import { useLineupBuilderStore } from '../../store/useLineupBuilderStore';

const FIELD_W = 400;
const FIELD_H = 600;
const PLAYER_RADIUS = 27;
const SNAP_GAP = 10;

export function FieldCanvas() {
  const { players, updatePlayer, selectPlayer, selectedPlayerId, removePlayer } = useLineupBuilderStore();
  const [longPressed, setLongPressed] = useState<string|undefined>();
  const timerRef = useRef<NodeJS.Timeout|null>(null);

  // snap helper
  function snap(val: number, gap: number = SNAP_GAP) {
    return Math.round(val / gap) * gap;
  }

  // 모바일 롱탭 핸들러
  function handleTouchStart(playerId: string) {
    timerRef.current = setTimeout(() => {
      setLongPressed(playerId);
    }, 600); // 600ms
  }
  function handleTouchEnd() {
    if (timerRef.current) clearTimeout(timerRef.current);
  }

  return (
    <Stage
      width={FIELD_W}
      height={FIELD_H}
      style={{ background: '#0B3D0B', borderRadius: '18px', touchAction: 'none' }}
    >
      <Layer>
        {/* 필드 */}
        <Rect x={0} y={0} width={FIELD_W} height={FIELD_H} fill="#0B3D0B" stroke="#6FCF97" strokeWidth={6} cornerRadius={18} />
        <Rect x={20} y={20} width={FIELD_W-40} height={FIELD_H-40} stroke="#6FCF97" strokeWidth={3} cornerRadius={15} />
        <Circle x={FIELD_W/2} y={FIELD_H/2} radius={50} stroke="#6FCF97" strokeWidth={3} />
        
        {players.map((p) => (
          <Group
            key={p.player_id}
            x={p.position.x * FIELD_W}
            y={p.position.y * FIELD_H}
            draggable
            dragBoundFunc={pos => ({ // Edge 제한
              x: Math.max(PLAYER_RADIUS, Math.min(pos.x, FIELD_W-PLAYER_RADIUS)),
              y: Math.max(PLAYER_RADIUS, Math.min(pos.y, FIELD_H-PLAYER_RADIUS))
            })}
            onDragEnd={e => {
              let nx = snap(e.target.x());
              let ny = snap(e.target.y());
              updatePlayer(p.player_id, { position: { x: nx/FIELD_W, y: ny/FIELD_H } });
            }}
            onClick={()=>selectPlayer(p.player_id)}
            onTap={()=>selectPlayer(p.player_id)}
            onTouchStart={() => handleTouchStart(p.player_id)}
            onTouchEnd={handleTouchEnd}
          >
            <Circle
              radius={PLAYER_RADIUS}
              fill={selectedPlayerId === p.player_id ? "#2e6aff" : "#fff"}
              stroke="#6FCF97"
              strokeWidth={4}
              shadowBlur={selectedPlayerId === p.player_id ? 16 : 2}
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
            {/* 롱탭시 삭제/정보팝업 */}
            {longPressed===p.player_id && (
              <Group x={-PLAYER_RADIUS} y={-60}>
                <Rect width={80} height={36} fill="#fff" stroke="#555" shadowBlur={5} cornerRadius={12} />
                <Text 
                  text="삭제"
                  fill="#d22"
                  x={4} y={4}
                  fontSize={14}
                  onClick={()=>{removePlayer(p.player_id);setLongPressed(undefined);}}
                />

                <Text 
                  text="닫기"
                  fill="#333"
                  x={34} y={4} fontSize={14}
                  onClick={()=>setLongPressed(undefined)}
                />
              </Group>)
            }
          </Group>
        ))}
      </Layer>
    </Stage>
  );
}
