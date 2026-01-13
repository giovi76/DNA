
import React from 'react';

const DNAHelix: React.FC = () => {
  const pairs = Array.from({ length: 12 });

  return (
    <div className="flex flex-col items-center justify-center space-y-2 opacity-80 pointer-events-none select-none">
      {pairs.map((_, i) => (
        <div 
          key={i} 
          className="relative w-24 h-4 flex items-center justify-between"
          style={{
            transform: `rotateY(${i * 30}deg)`,
            transition: 'transform 0.5s ease-out'
          }}
        >
          {/* Base A/T */}
          <div className="w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
          <div className="h-[1px] flex-grow bg-slate-700" />
          <div className="w-3 h-3 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
        </div>
      ))}
    </div>
  );
};

export default DNAHelix;
