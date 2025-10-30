'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Stage, Layer, Rect, Circle, Text, Group } from 'react-konva';
import { useLineupBuilderStore } from '../../store/useLineupBuilderStore';

const PLAYER_RADIUS = 28;
const SNAP_GAP = 10;

export function FieldCanvas() {
  const { players, updatePlayer, selectPlayer, selectedPlayerId, removePlayer } = useLineupBuilderStore();
  const [longPressed, setLongPressed] = useState<string | undefined>();
  const [dimensions, setDimensions] = useState({ width: 450, height: 650 });
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const touchStartPos = useRef<{ x: number; y: number } | null>(null);
  const isDraggingRef = useRef(false);

  useEffect(() => {
    const updateDimensions = () => {
      const isMobile = window.innerWidth < 768;
      setDimensions({
        width: isMobile ? Math.min(350, window.innerWidth - 40) : 450,
        height: isMobile ? 500 : 650,
      });
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // snap helper
  function snap(val: number, gap: number = SNAP_GAP) {
    return Math.round(val / gap) * gap;
  }

  // 모바일 롱탭 핸들러
  function handleTouchStart(playerId: string, e?: any) {
    if (e?.nativeEvent?.touches?.[0]) {
      const touch = e.nativeEvent.touches[0];
      touchStartPos.current = { x: touch.clientX, y: touch.clientY };
    }
    
    timerRef.current = setTimeout(() => {
      if (!isDraggingRef.current) {
        setLongPressed(playerId);
      }
    }, 600); // 600ms
  }

  function handleTouchEnd() {
    if (timerRef.current) clearTimeout(timerRef.current);
    touchStartPos.current = null;
    isDraggingRef.current = false;
  }

  function handleTouchMove(e?: any) {
    if (e?.nativeEvent?.touches?.[0] && touchStartPos.current) {
      const touch = e.nativeEvent.touches[0];
      const deltaX = Math.abs(touch.clientX - touchStartPos.current.x);
      const deltaY = Math.abs(touch.clientY - touchStartPos.current.y);
      
      // 10px 이상 움직이면 드래그로 간주
      if (deltaX > 10 || deltaY > 10) {
        isDraggingRef.current = true;
        if (timerRef.current) clearTimeout(timerRef.current);
      }
    }
  }

  const FIELD_W = dimensions.width;
  const FIELD_H = dimensions.height;

  return (
    <div className="relative flex justify-center">
      <Stage
        width={FIELD_W}
        height={FIELD_H}
        style={{ background: '#0B3D0B', borderRadius: '18px' }}
      >
      <Layer>
        {/* 필드 배경 */}
        <Rect
          x={0}
          y={0}
          width={FIELD_W}
          height={FIELD_H}
          fill="#0B3D0B"
          stroke="#6FCF97"
          strokeWidth={6}
          cornerRadius={18}
        />
        
        {/* 필드 경계선 */}
        <Rect
          x={30}
          y={30}
          width={FIELD_W - 60}
          height={FIELD_H - 60}
          stroke="#6FCF97"
          strokeWidth={3}
          cornerRadius={15}
        />
        
        {/* 센터 서클 */}
        <Circle x={FIELD_W / 2} y={FIELD_H / 2} radius={60} stroke="#6FCF97" strokeWidth={3} />
        <Circle x={FIELD_W / 2} y={FIELD_H / 2} radius={4} fill="#6FCF97" />
        
        {/* 페널티 박스 (상단) */}
        <Rect
          x={FIELD_W / 2 - 60}
          y={30}
          width={120}
          height={120}
          stroke="#6FCF97"
          strokeWidth={3}
          cornerRadius={8}
        />
        
        {/* 페널티 박스 (하단) */}
        <Rect
          x={FIELD_W / 2 - 60}
          y={FIELD_H - 150}
          width={120}
          height={120}
          stroke="#6FCF97"
          strokeWidth={3}
          cornerRadius={8}
        />

        {/* 골 대 (상단) */}
        <Rect
          x={FIELD_W / 2 - 30}
          y={30}
          width={60}
          height={60}
          stroke="#6FCF97"
          strokeWidth={3}
        />

        {/* 골 대 (하단) */}
        <Rect
          x={FIELD_W / 2 - 30}
          y={FIELD_H - 90}
          width={60}
          height={60}
          stroke="#6FCF97"
          strokeWidth={3}
        />

        {/* 선수들 */}
        {players.map((p) => (
          <Group
            key={p.player_id}
            x={p.position.x * FIELD_W}
            y={p.position.y * FIELD_H}
            draggable
            dragBoundFunc={(pos) => ({
              // 필드 경계 내로 제한
              x: Math.max(PLAYER_RADIUS + 30, Math.min(pos.x, FIELD_W - PLAYER_RADIUS - 30)),
              y: Math.max(PLAYER_RADIUS + 30, Math.min(pos.y, FIELD_H - PLAYER_RADIUS - 30)),
            })}
            onDragEnd={(e) => {
              let nx = snap(e.target.x());
              let ny = snap(e.target.y());
              updatePlayer(p.player_id, {
                position: { x: nx / FIELD_W, y: ny / FIELD_H },
              });
            }}
            onClick={() => selectPlayer(p.player_id)}
            onTap={() => selectPlayer(p.player_id)}
            onTouchStart={(e) => handleTouchStart(p.player_id, e)}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* 선수 원 */}
            <Circle
              radius={PLAYER_RADIUS}
              fill={selectedPlayerId === p.player_id ? '#2e6aff' : '#fff'}
              stroke="#6FCF97"
              strokeWidth={4}
              shadowBlur={selectedPlayerId === p.player_id ? 16 : 2}
              shadowColor={selectedPlayerId === p.player_id ? '#2e6aff' : '#000'}
            />
            
            {/* 등번호 */}
            <Text
              text={p.number ? String(p.number) : ''}
              fontSize={20}
              fill={selectedPlayerId === p.player_id ? '#fff' : '#222'}
              align="center"
              fontStyle="bold"
              x={-14}
              y={-12}
              width={28}
            />
            
            {/* 이름 */}
            <Text
              text={p.name}
              fontSize={11}
              fill={selectedPlayerId === p.player_id ? '#fff' : '#333'}
              align="center"
              x={-PLAYER_RADIUS}
              y={PLAYER_RADIUS + 4}
              width={PLAYER_RADIUS * 2}
            />
            
            {/* 포지션 */}
            <Text
              text={p.role || ''}
              fontSize={10}
              fill="#035"
              align="center"
              x={-PLAYER_RADIUS}
              y={PLAYER_RADIUS + 16}
              width={PLAYER_RADIUS * 2}
            />

            {/* 롱탭시 삭제/정보팝업 */}
            {longPressed === p.player_id && (
              <Group x={-PLAYER_RADIUS} y={-60}>
                <Rect
                  width={80}
                  height={40}
                  fill="#fff"
                  stroke="#555"
                  shadowBlur={8}
                  cornerRadius={12}
                  opacity={0.95}
                />
                <Text
                  text="삭제"
                  fill="#d22"
                  x={8}
                  y={8}
                  fontSize={14}
                  fontStyle="bold"
                  onClick={() => {
                    removePlayer(p.player_id);
                    setLongPressed(undefined);
                  }}
                />
                <Text
                  text="닫기"
                  fill="#333"
                  x={38}
                  y={8}
                  fontSize={14}
                  onClick={() => setLongPressed(undefined)}
                />
              </Group>
            )}
          </Group>
        ))}
      </Layer>
    </Stage>
    </div>
  );
}
