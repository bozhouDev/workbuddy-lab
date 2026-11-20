import type { SimId } from '../registry';
import type { SceneData } from '../engine/types';
import { ChatView } from './ChatView';
import { HomeView } from './HomeView';
import { Sidebar } from './Sidebar';

interface WorkBuddyShellProps {
  scene: SceneData;
  activeClickId: SimId | null;
  onTargetClick: (id: SimId) => void;
}

export function WorkBuddyShell({ scene, activeClickId, onTargetClick }: WorkBuddyShellProps) {
  return (
    <div className="w-full h-full flex bg-white text-[#111318] overflow-hidden">
      <Sidebar scene={scene} activeClickId={activeClickId} onTargetClick={onTargetClick} />
      {scene.view === 'chat' ? (
        <ChatView scene={scene} activeClickId={activeClickId} onTargetClick={onTargetClick} />
      ) : (
        <HomeView scene={scene} activeClickId={activeClickId} onTargetClick={onTargetClick} />
      )}
    </div>
  );
}
