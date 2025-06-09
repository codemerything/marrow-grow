"use client"
import Image from "next/image"
import { Dialog, DialogContent } from "@/components/ui/dialog"

interface HarvestCompleteModalProps {
  isOpen: boolean
  onClose: () => void
  harvestData: {
    strainName: string
    weight: number
    potency: number
  }
  onLookForSeeds: () => void
  onStartNewGame: () => void
  onBreedNewStrain: () => void
}

export default function HarvestCompleteModal({
  isOpen,
  onClose,
  harvestData,
  onLookForSeeds,
  onStartNewGame,
  onBreedNewStrain,
}: HarvestCompleteModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="p-0 border-0 bg-transparent shadow-none max-w-[800px]">
        <div className="relative w-[800px] h-[600px]">
          {/* Background Image */}
          <Image src="/images/harvest-bg.png" alt="Harvest Background" fill className="object-cover pixel-art" />

          {/* Harvest Complete Popup */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/90 border-2 border-gray-700 rounded-md p-6 w-[400px] text-center">
            <h2 className="font-pixel text-white text-xl mb-6">Harvest Complete!</h2>

            {/* Harvest Details */}
            <div className="space-y-2 mb-6 text-left">
              <div className="flex">
                <span className="font-pixel text-yellow-400 text-sm w-[180px]">Strain Name:</span>
                <span className="font-pixel text-white text-lg">{harvestData.strainName}</span>
              </div>
              <div className="flex">
                <span className="font-pixel text-yellow-400 text-lg w-[180px]">Final Yield:</span>
                <span className="font-pixel text-white text-lg">{harvestData.weight}g</span>
              </div>
              <div className="flex">
                <span className="font-pixel text-yellow-400 text-lg w-[180px]">Final Potency:</span>
                <span className="font-pixel text-white text-lg">{harvestData.potency}%</span>
              </div>
            </div>

            {/* Harvest Image */}
            <div className="flex justify-center mb-6">
              <div className="border-2 border-gray-600 rounded-md p-1 bg-gray-800/50 w-[120px] h-[120px] flex items-center justify-center">
                <Image
                  src="/images/harvest-bag.png"
                  alt="Harvested Plant"
                  width={100}
                  height={100}
                  className="pixel-art object-contain"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={onLookForSeeds}
                className="w-full py-2 px-4 bg-transparent border-2 border-white text-white font-pixel hover:bg-white/10 transition-colors"
              >
                Look for Seeds
              </button>

              <button
                onClick={onStartNewGame}
                className="w-full py-2 px-4 bg-transparent border-2 border-white text-white font-pixel hover:bg-white/10 transition-colors"
              >
                Start New Game
              </button>

              <button
                onClick={onBreedNewStrain}
                className="w-full py-2 px-4 bg-transparent border-2 border-white text-white font-pixel hover:bg-white/10 transition-colors"
              >
                Breed New Strain
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
