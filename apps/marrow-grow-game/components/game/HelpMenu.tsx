// components/game/HelpMenu.tsx
"use client";

import { useRef, useEffect } from "react";
import { Dice6, Trophy, HelpCircle, LogOut } from "lucide-react"; // Added LogOut icon
import GameButton from "@/components/ui/GameButton";

interface HelpMenuProps {
  user: {
    username: string;
    email: string;
    lives: number;
  };
  onClose: () => void;
  onDailySpinClick?: () => void; // To open DailySpinModal
  onHowToPlayClick?: () => void; // To open HowToPlayModal
  onLeaderboardClick?: () => void; // To open LeaderboardModal
  onLogoutClick?: () => void; // New prop for logout action
}

export default function HelpMenu({
  user,
  onClose,
  onDailySpinClick,
  onHowToPlayClick,
  onLeaderboardClick,
  onLogoutClick, // Destructure the new prop
}: HelpMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  const handleLogout = () => {
    if (onLogoutClick) {
      onLogoutClick();
    }
    onClose(); // Close the help menu after initiating logout
  };

  return (
    <div className="absolute top-16 right-4 z-20"> {/* */}
      <div
        ref={menuRef}
        className="bg-gray-900/95 border-2 border-purple-500 rounded-lg p-3 shadow-xl backdrop-blur-sm w-48" //
      >
        <div className="space-y-2"> {/* */}
          <GameButton
            onClick={() => {
              if (onDailySpinClick) onDailySpinClick();
              onClose(); // Close menu after click
            }}
            variant="primary"
            className="w-full h-10 text-xs" //
            icon={<Dice6 size={14} className="text-yellow-300" />} //
          >
            Daily Spin
          </GameButton>

          <GameButton variant="secondary" className="w-full h-10 text-xs pointer-events-none"> {/* */}
            <span className="flex items-center gap-1">
              Lives: <span className="text-yellow-300">{user.lives}</span> {/* */}
            </span>
          </GameButton>

          <GameButton
            onClick={() => {
              if (onHowToPlayClick) onHowToPlayClick();
              onClose(); // Close menu after click
            }}
            variant="secondary"
            className="w-full h-10 text-xs" //
            icon={<HelpCircle size={14} className="text-cyan-300" />} //
          >
            How to Play
          </GameButton>

          <GameButton
            onClick={() => {
              if (onLeaderboardClick) onLeaderboardClick();
              onClose(); // Close menu after click
            }}
            variant="secondary"
            className="w-full h-10 text-xs" //
            icon={<Trophy size={14} className="text-yellow-300" />} //
          >
            Leaderboard
          </GameButton>

          {/* Logout Button Added Here */}
          <div className="pt-2 mt-2 border-t border-gray-700"> {/* Optional Separator */}
            <GameButton
              onClick={handleLogout}
              variant="danger" // Assuming you have or will add a 'danger' variant for logout
              className="w-full h-10 text-xs"
              icon={<LogOut size={14} className="text-red-400" />} // Using LogOut icon
            >
              Logout
            </GameButton>
          </div>

        </div>
      </div>
    </div>
  );
}