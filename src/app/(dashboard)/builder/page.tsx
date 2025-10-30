import React from 'react';
import { FieldCanvas } from '@/src/components/FieldCanvas';
import { PlayerCard } from '@/src/components/PlayerCard';
import { Toolbar } from '@/src/components/Toolbar';
import { TeamManager } from '@/src/components/TeamManager';

export default function BuilderPage() {
  return (
    <main className="flex flex-col md:flex-row gap-8 justify-center items-start p-6 min-h-screen bg-green-900">
      <aside className="flex flex-col gap-4">
        <TeamManager />
        <PlayerCard />
      </aside>
      <section className="flex flex-col items-center gap-2 bg-white rounded-xl shadow p-6">
        <Toolbar />
        <div id="lineup-canvas" className="mt-4 rounded-xl shadow overflow-hidden">
          <FieldCanvas />
        </div>
      </section>
    </main>
  );
}
