"use client"

import { useState, useEffect, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog" // Assuming these are from Shadcn/ui
import { Button } from "@/components/ui/button"
import { Skull, Leaf, Bone } from "lucide-react" // Ensure lucide-react is installed

interface DailySpinModalProps {
  isOpen: boolean
  onClose: () => void
  canSpin: boolean
  // Changed onSpinComplete to pass number of lives won for more flexibility, 0 if lost
  onSpinComplete: (awardedLives: number) => void 
  resultMessage?: string | null; // Optional: For MainGameScreen to pass a message if needed (though modal now handles its own)
}

const SPIN_ITEMS = [
  { icon: Bone, name: "Bone", color: "text-gray-300 bg-gray-700" },
  { icon: Leaf, name: "Weed", color: "text-green-400 bg-green-900" }, // Typically means win
  { icon: Skull, name: "Skull", color: "text-red-400 bg-red-900" },   // Typically means lose
]

// Define a win condition, e.g., getting at least two Leaves, or no Skulls.
// For this example, we'll stick to the 25% flat chance and specific item display.
const WIN_ITEM = SPIN_ITEMS[1]; // Leaf
const BONUS_ITEM = SPIN_ITEMS[0]; // Bone
const LOSE_ITEM = SPIN_ITEMS[2]; // Skull

export default function DailySpinModal({
  isOpen,
  onClose,
  canSpin,
  onSpinComplete,
  // resultMessage, // This prop is less needed now if modal handles all its display
}: DailySpinModalProps) {
  const [isSpinning, setIsSpinning] = useState(false)
  // Result now stores the items and if it was a win
  const [result, setResult] = useState<{ won: boolean; finalItems: (typeof SPIN_ITEMS)[number][] } | null>(null)
  
  // Initialize spinningItems with a default display
  const [spinningItems, setSpinningItems] = useState<(typeof SPIN_ITEMS)[number][]>([
    SPIN_ITEMS[0], SPIN_ITEMS[1], SPIN_ITEMS[2] // Bone, Leaf, Skull
  ]);

  const spinIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const spinCountRef = useRef(0)
  const totalSpinDuration = 3000 // 3 seconds
  const spinAnimationInterval = 100 // ms

  useEffect(() => {
    // Reset result when modal is opened and allowed to spin
    if (isOpen && canSpin) {
      setResult(null);
       // Set a default non-winning, non-spinning display
      setSpinningItems([SPIN_ITEMS[0], SPIN_ITEMS[1], SPIN_ITEMS[2]]);
    }
    return () => {
      if (spinIntervalRef.current) {
        clearInterval(spinIntervalRef.current)
      }
    }
  }, [isOpen, canSpin]) // Dependency on isOpen and canSpin

  const getRandomItem = () => {
    return SPIN_ITEMS[Math.floor(Math.random() * SPIN_ITEMS.length)]
  }

  const handleSpin = () => {
    if (!canSpin || isSpinning) return

    setIsSpinning(true)
    setResult(null) // Clear previous result
    spinCountRef.current = 0

    // Set last spin date to today in "YYYY-MM-DD" format
    localStorage.setItem('lastSpinDate', new Date().toISOString().slice(0, 10))

    spinIntervalRef.current = setInterval(() => {
      spinCountRef.current += 1
      setSpinningItems([getRandomItem(), getRandomItem(), getRandomItem()]) // Animation
      
      if (spinCountRef.current * spinAnimationInterval >= totalSpinDuration) {
        if (spinIntervalRef.current) {
          clearInterval(spinIntervalRef.current)
        }
        
        const randomChance = Math.random()
        const wonSpin = randomChance < 0.25 // 25% chance to win
        
        let finalDisplayItems: (typeof SPIN_ITEMS)[number][] = [];
        let awardedLives = 0;
        
        if (wonSpin) {
          awardedLives = 1; // Win 1 life
          // Winning combination: e.g., Leaf, Leaf, Bone
          finalDisplayItems = [
            WIN_ITEM, 
            WIN_ITEM, 
            BONUS_ITEM 
          ];
          // Shuffle for visual variety on win if desired
          // finalDisplayItems.sort(() => Math.random() - 0.5); 
        } else {
          // Losing combination: ensure at least one Skull
          const skullPosition = Math.floor(Math.random() * 3);
          finalDisplayItems = Array(3).fill(null).map((_, i) => 
            i === skullPosition ? LOSE_ITEM : (Math.random() < 0.5 ? BONUS_ITEM : WIN_ITEM) // Mix others
          );
           // Ensure at least one skull, just in case logic above fails (it shouldn't with this setup)
          if (!finalDisplayItems.some(item => item.name === "Skull")) {
            finalDisplayItems[Math.floor(Math.random() * 3)] = LOSE_ITEM;
          }
        }
        
        setSpinningItems(finalDisplayItems) // Set the final visual items
        setResult({ won: wonSpin, finalItems: finalDisplayItems }) // Set the result state
        setIsSpinning(false)
        onSpinComplete(awardedLives) // Notify parent of lives won (0 if lost)
      }
    }, spinAnimationInterval)
  }

  const handleModalClose = () => {
    if (isSpinning && spinIntervalRef.current) { // If spinning, stop it
      clearInterval(spinIntervalRef.current);
      setIsSpinning(false);
    }
    // Don't reset result here if you want it to persist until next open
    // But for a clean state next time, resetting is fine if onClose means "done with this session".
    // setResult(null); // Reset result when modal truly closes
    onClose(); // Call the parent's onClose handler
  }

  // When isOpen becomes false, we should ensure the result is cleared for the next opening
  useEffect(() => {
    if (!isOpen) {
      setResult(null);
    }
  }, [isOpen]);


  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleModalClose(); }}>
      <DialogContent 
        className="sm:max-w-md bg-gray-900 border-purple-500 border-2 font-pixel text-white"
        onInteractOutside={(e) => e.preventDefault()} // Prevents closing on overlay click
      >
        <DialogHeader>
          <DialogTitle className="text-center text-xl text-purple-300">Daily Marrow Spin</DialogTitle>
        </DialogHeader>

        <div className="text-center space-y-6 py-4">
          {!canSpin && !result && ( // Show if cannot spin AND no result is currently being shown
            <div className="text-red-400 text-sm">You've already spun today! Come back tomorrow.</div>
          )}

          {/* Spin Display Area */}
          <div className="bg-gray-800 rounded-lg p-4 sm:p-6 border-2 border-gray-700 min-h-[120px] flex flex-col justify-center items-center">
            {isSpinning ? (
              <div className="flex justify-center space-x-2 sm:space-x-4 items-center">
                {spinningItems.map((item, index) => (
                  <div key={index} className={`p-2 rounded-lg ${item.color.split(" ")[1]} transition-all duration-100 ease-in-out`}>
                    <item.icon className={`w-10 h-10 sm:w-12 sm:h-12 ${item.color.split(" ")[0]}`} />
                  </div>
                ))}
              </div>
            ) : result ? ( // Result is available
              <div className="flex flex-col items-center space-y-3">
                <div className="flex justify-center space-x-2 sm:space-x-4 items-center">
                  {result.finalItems.map((item, index) => (
                    <div key={index} className={`p-2 rounded-lg ${item.color.split(" ")[1]}`}>
                      <item.icon className={`w-10 h-10 sm:w-12 sm:h-12 ${item.color.split(" ")[0]}`} />
                    </div>
                  ))}
                </div>
                {result.won ? (
                  <div className="text-green-400 text-sm mt-2">+1 Marrow Seed!</div>
                ) : (
                  <div className="text-red-400 text-sm mt-2">Better luck next void-crossing!</div>
                )}
              </div>
            ) : canSpin ? ( // Ready to spin (no result yet, can spin)
                <div className="flex justify-center space-x-2 sm:space-x-4 items-center">
                    {/* Default display before spinning */}
                    {[SPIN_ITEMS[0], SPIN_ITEMS[1], SPIN_ITEMS[2]].map((item, index) => ( // Show a default combo
                      <div key={index} className={`p-2 rounded-lg ${item.color.split(" ")[1]}`}>
                        <item.icon className={`w-10 h-10 sm:w-12 sm:h-12 ${item.color.split(" ")[0]}`} />
                      </div>
                    ))}
                  </div>
            ) : null /* Handles the case where !canSpin and !result initially */ }
          </div>

          {/* Instructions or Spin Button */}
          {canSpin && !result && !isSpinning && (
            <div className="text-gray-400 text-xs space-y-1">
              <p>Spin for a chance to win 1 Marrow Seed!</p>
              <p>(25% chance to win - avoid the Skulls!)</p>
            </div>
          )}

          {/* Action Buttons */}
          {canSpin && !result && ( // Show Spin button if can spin and no result yet
            <Button
              onClick={handleSpin}
              disabled={isSpinning}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              {isSpinning ? "Spinning..." : "SPIN FOR SEED"}
            </Button>
          )}

          {(result || !canSpin) && ( // Show Close button if there's a result OR if they can't spin
            <Button onClick={handleModalClose} className="w-full bg-gray-600 hover:bg-gray-700 mt-2">
              Close
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}