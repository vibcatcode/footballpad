'use client';

import React from 'react';
import { FieldCanvas } from '@/src/components/lineup/FieldCanvas';
import { FormationSelector } from '@/src/components/lineup/FormationSelector';
import { LineupPlayerManager } from '@/src/components/LineupPlayerManager';
import { ExportButton } from '@/src/components/ExportButton';
import { TeamSelector } from '@/src/components/TeamSelector';

export default function BuilderPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="mb-6 text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">라인업 빌더</h1>
          <p className="text-gray-600">시각적으로 팀 포메이션을 구성하고 관리하세요</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 왼쪽 패널: 팀 선택 및 선수 관리 */}
          <aside className="lg:col-span-1 space-y-6">
            <TeamSelector />
            <LineupPlayerManager />
          </aside>

          {/* 중앙: 필드 캔버스 */}
          <section className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-lg p-6">
              {/* 포메이션 선택 및 내보내기 */}
              <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                <FormationSelector />
                <ExportButton />
              </div>

              {/* 필드 */}
              <div className="bg-gradient-to-b from-green-50 to-green-100 p-4 rounded-lg overflow-hidden">
                <div id="lineup-canvas" className="flex justify-center">
                  <FieldCanvas />
                </div>
              </div>

              {/* 안내 문구 */}
              <div className="mt-4 text-sm text-gray-600 text-center space-y-1">
                <p>💡 드래그로 선수를 이동하세요</p>
                <p>💡 길게 누르면 선수를 삭제할 수 있습니다</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
