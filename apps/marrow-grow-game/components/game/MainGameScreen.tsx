"use client"

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import DailySpinModal from "@/components/game/DailySpinModal";
import HowToPlayModal from "@/components/game/HowToPlayModal";
import LeaderboardModal from "@/components/game/LeaderboardModal";
import HelpMenu from "@/components/game/HelpMenu";
import HarvestCompleteModal from "@/components/game/HarvestCompleteModal";
import { useGameStore, GameOptions as ZustandGameOptions } from "@/stores/useGameStore";

// --- Type Definitions ---
interface PlantResources {
  water: number;
  light: number;
  nutrients: number;
  stress: number;
}

interface PlantEvent {
  type: "warning" | "danger" | "info" | "actofgod";
  title?: string;
  message: string;
  bgColor: string;
}

interface LiveGameState {
  plantName: string;
  stage: string;
  stageIndex: number;
  health: number;
  healthSum: number;
  healthTicks: number;
  growthProgress: number;
  stageTime: number;
  totalGrowthTime: number;
  resources: PlantResources;
  events: PlantEvent[];
  lightsOut: boolean;
  lightsOffTimer: number;
  pestPenalty: number;
  raiderPenalty: number;
  potencyBoost: number;
  waterDrainRate: number;
  nutrientDrainRate: number;
  currentLightSourceKey: string;
  sproutNutrientApplied?: boolean;
  vegetativeNutrientApplied?: boolean;
  floweringNutrientApplied?: boolean;
}

interface HarvestData {
  strainName: string;
  weight: number;
  potency: number;
}

interface MainGameScreenProps {
  user: {
    username: string;
    email: string;
    lives: number;
    totalYieldData?: number; // For light unlocks, synced from backend
    growCountData?: number;  // Synced from backend
    // ownedLightsData?: string[]; // For light unlocks
  };
  gameOptions: ZustandGameOptions;
  onBackToDashboard: () => void;
}

// --- Game Constants ---
const GROWTH_STAGES = [
    { name: 'Sprout', time: 30, image: '/images/stages/sprout.png' },
    { name: 'Vegetative', time: 45, image: '/images/stages/veg.png' },
    { name: 'Flowering', time: 60, image: '/images/stages/flower.png' },
    { name: 'Harvest', time: 0, image: '/images/stages/harvest.png' }
];
const PEST_TYPES = [{ name: "Space Slugs", potencyDamage: [4, 7], successRate: 0.5, message: "Space slugs are oozing!" },{ name: "Crypt Mites", potencyDamage: [3, 6], successRate: 0.6, message: "Crypt mites are gnawing!" }];
const RAID_TYPES = [{ name: "Crypt Bandits", damageRange: [5, 10], successRate: 0.3, message: "Crypt bandits!" },{ name: "Mutant Chickens", damageRange: [3, 8], successRate: 0.35, message: "Mutant chickens!" }];
const ACTS_OF_GOD = [
    { type: 'water', message: "Drought!", effect: (s: LiveGameState) => { s.resources.water = Math.max(10, s.resources.water - 30); } },
    { type: 'light', message: "Solar eclipse!", effect: (s: LiveGameState) => { if(!s.lightsOut) s.resources.light = Math.max(10, s.resources.light - 40);} },
    { type: 'nutrients', message: "Soil mites!", effect: (s: LiveGameState) => { s.resources.nutrients = Math.max(10, s.resources.nutrients - 30); } },
    { type: 'wild', message: "Strange energy!", effect: (s: LiveGameState) => { s.resources.stress = Math.min(100, s.resources.stress + 20); } },
];
const NUTRIENT_BOOST_CHANCE = 0.03;
const NUTRIENT_BOOST_AMOUNT = [0.05, 0.15];
const LIGHT_SOURCES_DATA: Record<string, { name: string; yieldBonus: number }> = {
  candle: { name: 'Candle Light', yieldBonus: 1.0 }, grow: { name: 'Grow Light', yieldBonus: 1.2 }, quantum: { name: 'Quantum Board', yieldBonus: 1.5 }
};
let actOfGodHasOccurredThisGame = false; // Module-level flag for one-time event per game instance
const MAX_SEED_LIVES = 3;

// --- Helper Functions ---
function addEventToState(currentEvents: PlantEvent[], event: Omit<PlantEvent, 'bgColor' | 'type'> & {type: PlantEvent['type']}, bgColor: string): PlantEvent[] {
    return [{ ...event, bgColor }, ...currentEvents.slice(0, 4)];
}
function lerpColor(a: string, b: string, amount: number): string {
  const n=(h:string)=>parseInt(h,16), L=(s:number,e:number,t:number)=>Math.round(s+t*(e-s)), X=(c:number)=>c.toString(16).padStart(2,'0');
  const r1=n(a.slice(1,3)),g1=n(a.slice(3,5)),b1=n(a.slice(5,7)),r2=n(b.slice(1,3)),g2=n(b.slice(3,5)),b2=n(b.slice(5,7));
  return `#${X(L(r1,r2,amount))}${X(L(g1,g2,amount))}${X(L(b1,b2,amount))}`;
}

function triggerPestEventIfNeeded(cs: LiveGameState, dT?: string): boolean { if(cs.stage==="Sprout"||cs.stage==="Harvest"||Math.random()>0.05)return false;const p=PEST_TYPES[Math.floor(Math.random()*PEST_TYPES.length)];let eM=p.message,eT:PlantEvent['type']="warning",bG="bg-yellow-500";if(dT==="grower"){eM=`Grower protected vs ${p.name}!`;eT="info";bG="bg-blue-500";}else if(Math.random()<p.successRate){const d=p.potencyDamage[0]+Math.floor(Math.random()*(p.potencyDamage[1]-p.potencyDamage[0]+1));cs.pestPenalty=Math.max(0.1,cs.pestPenalty*(1-(d/100)));eM=`${p.name} reduced potency by ${d}%.`;eT="danger";bG="bg-red-600";}else{eM=`${p.name} repelled!`;eT="info";bG="bg-blue-500";}cs.events=addEventToState(cs.events,{type:eT,title:"Pest Attack!",message:eM},bG);return true;}
function triggerRaiderEventIfNeeded(cs: LiveGameState, dT?: string): boolean { if(cs.stage!=="Flowering"&&cs.stage!=="Vegetative")return false;if(Math.random()>0.04)return false;const r=RAID_TYPES[Math.floor(Math.random()*RAID_TYPES.length)];let eM=r.message,eT:PlantEvent['type']="warning",bG="bg-yellow-500";if(dT==="hound"){eM=`Hound chased off ${r.name}!`;eT="info";bG="bg-blue-500";}else{const d=r.damageRange[0]+Math.floor(Math.random()*(r.damageRange[1]-r.damageRange[0]+1));cs.raiderPenalty=Math.max(0.1,cs.raiderPenalty*(1-(d/100)));eM=`${r.name} reduced yield by ${d}%.`;eT="danger";bG="bg-red-600";}cs.events=addEventToState(cs.events,{type:eT,title:"Raid!",message:eM},bG);return true;}
function triggerActOfGodIfNeeded(cs: LiveGameState): boolean { if(actOfGodHasOccurredThisGame||Math.random()>0.005)return false;const gE=ACTS_OF_GOD[Math.floor(Math.random()*ACTS_OF_GOD.length)];gE.effect(cs);actOfGodHasOccurredThisGame=true;cs.events=addEventToState(cs.events,{type:"actofgod",title:"Act of God!",message:gE.message},"bg-purple-600");return true;}
function triggerNutrientBoostIfNeeded(cs: LiveGameState): boolean { if(cs.stage!=="Flowering"||Math.random()>NUTRIENT_BOOST_CHANCE)return false;let eM:string,eT:PlantEvent['type']="info",bG="bg-blue-500";if(Math.random()<0.5){const b=NUTRIENT_BOOST_AMOUNT[0]+Math.random()*(NUTRIENT_BOOST_AMOUNT[1]-NUTRIENT_BOOST_AMOUNT[0]);cs.potencyBoost+=b;eM=`Potency boosted by ${(b*100).toFixed(0)}%!`;}else{eM="Nutrient boost missed.";eT="warning";bG="bg-yellow-500";}cs.events=addEventToState(cs.events,{type:eT,title:"Nutrient Surge!",message:eM},bG);return true;}
function triggerMarrowCorpTheftIfNeeded(cs: LiveGameState, dT: string | undefined, cL: number, uLCb: (nL: number) => void): boolean {if(dT==="vault"){cs.events=addEventToState(cs.events,{type:"info",title:"Secure Vault",message:"Vault protected seeds!"},"bg-blue-500");return false;}if(Math.random()<0.25&&cL>0){const nL=cL-1;uLCb(nL);cs.events=addEventToState(cs.events,{type:"danger",title:"Corporate Theft!",message:"MarrowCorp stole 1 seed!"},"bg-red-700");return true;}return false;}

function calculateHarvestResults(fGS: LiveGameState): HarvestData {
  const {plantName,healthSum,healthTicks,potencyBoost,pestPenalty,raiderPenalty,currentLightSourceKey}=fGS;const aH=healthTicks>0?(healthSum/healthTicks)/100:0;let bP=20+(Math.random()*10);if(Math.random()<0.20)bP=30+(Math.random()*40);const bY=1+(Math.random()*199);const lB=LIGHT_SOURCES_DATA[currentLightSourceKey]?.yieldBonus||1.0;const fPR=bP*Math.max(0.1,potencyBoost)*Math.max(0.1,pestPenalty);const fWR=bY*Math.max(0,aH)*Math.max(0.1,raiderPenalty)*lB;let fP=Math.max(0,Math.min(70,Math.round(fPR)));let fW=Math.max(1,Math.min(200,Math.round(fWR)));return{strainName:plantName,weight:fW,potency:fP};
}

async function syncHarvestWithBackend(userId: string, harvestData: HarvestData, zustandActions: any /* Type this properly from store */) {
  const payload = { harvestedAmount: harvestData.weight, potencyScore: harvestData.potency };
  try {
    console.log(`SYNCING HARVEST TO BACKEND for user ${userId}:`, payload);
    // const response = await fetch(`/api/players/${userId}/complete-grow`, { // ADJUST YOUR ENDPOINT & USER ID
    //   method: 'PATCH', 
    //   headers: { 'Content-Type': 'application/json', /* Add auth headers if needed */ },
    //   body: JSON.stringify(payload),
    // });
    // if (!response.ok) {
    //   const errorData = await response.json();
    //   throw new Error(errorData.message || 'Failed to sync harvest data with backend');
    // }
    // const backendResponse = await response.json(); // e.g., { growCount, totalYield, avgPotency, ... }
    // console.log("Backend sync successful:", backendResponse);
    // zustandActions.updateUserBackendStats(backendResponse); // Hypothetical action
    alert("SIMULATED: Harvest synced with backend. Check console for details.");
  } catch (error) {
    console.error("Error syncing harvest with backend:", error);
    alert("Error syncing harvest with backend. See console.");
  }
}

// --- Main Component ---
export default function MainGameScreen({ user, gameOptions, onBackToDashboard }: MainGameScreenProps) {
  const zustandActions = useGameStore((state) => state.actions);
  const [isHelpMenuOpen, setIsHelpMenuOpen] = useState(false);
  const [isDailySpinModalOpen, setIsDailySpinModalOpen] = useState(false);
  const [isHowToPlayModalOpen, setIsHowToPlayModalOpen] = useState(false);
  const [isLeaderboardModalOpen, setIsLeaderboardModalOpen] = useState(false);
  const [isHarvestModalOpen, setIsHarvestModalOpen] = useState(false);
  const [currentHarvestData, setCurrentHarvestData] = useState<HarvestData | null>(null);
  const [isPlantDiedModalOpen, setIsPlantDiedModalOpen] = useState(false);
  const [isGameReady, setIsGameReady] = useState(false);
  const [canSpinToday, setCanSpinToday] = useState(false);

  const [liveGameState, setLiveGameState] = useState<LiveGameState>(() => {
    actOfGodHasOccurredThisGame = false; // Reset for this game instance
    const initialSeed = gameOptions.selectedSeed; const initialSoil = gameOptions.selectedSoil;
    const plantName = initialSeed?.name || "My Plant";
    let waterDrain = 0.5; if (initialSoil?.waterDrainRate) waterDrain = initialSoil.waterDrainRate; else if (initialSeed?.waterDrainRate) waterDrain = initialSeed.waterDrainRate;
    let nutrientDrain = 0.5; if (initialSeed?.nutrientDrainRate) nutrientDrain = initialSeed.nutrientDrainRate;
    const initialStageIndex = 0; const initialStage = GROWTH_STAGES[initialStageIndex];
    const totalTime = GROWTH_STAGES.reduce((acc, curr) => acc + curr.time, 0) - (GROWTH_STAGES.find(s=>s.name==='Harvest')?.time || 0);
    return {
      plantName, stage: initialStage.name, stageIndex: initialStageIndex, health: 100, healthSum: 0, healthTicks: 0,
      growthProgress: 0, stageTime: 0, totalGrowthTime: totalTime || 135, lightsOffTimer: 0,
      resources: { water: 80, light: 100, nutrients: 80, stress: 0 },
      events: [{ type: "info", message: `Your "${plantName}" journey begins!`, bgColor: "bg-blue-500" }],
      lightsOut: false, pestPenalty: 1, raiderPenalty: 1, potencyBoost: 1,
      waterDrainRate: waterDrain, nutrientDrainRate: nutrientDrain, currentLightSourceKey: "candle",
      sproutNutrientApplied: false, vegetativeNutrientApplied: false, floweringNutrientApplied: false,
    };
  });

  const updateLivesAndStore = useCallback((newLivesCount: number) => {
    const validatedLives = Math.max(0, newLivesCount);
    localStorage.setItem('seedLives', validatedLives.toString());
    zustandActions.updateUserLives(validatedLives);
  }, [zustandActions]);

  useEffect(() => { // Daily Resets and Initial Sync
    const todayDateString = new Date().toISOString().slice(0, 10);
    const lastLivesResetStr = localStorage.getItem('seedLivesLastResetDate');
    let LSLives = localStorage.getItem('seedLives');
    let currentSeedLives = LSLives === null ? MAX_SEED_LIVES : parseInt(LSLives);

    if (lastLivesResetStr !== todayDateString || LSLives === null) {
      currentSeedLives = MAX_SEED_LIVES;
      localStorage.setItem('seedLivesLastResetDate', todayDateString);
      updateLivesAndStore(currentSeedLives);
    } else if ((user?.lives ?? MAX_SEED_LIVES) !== currentSeedLives) {
        zustandActions.updateUserLives(currentSeedLives);
    }
    const lastSpinDateStr = localStorage.getItem('lastSpinDate');
    if (lastSpinDateStr) { const lastSpinDateOnly = lastSpinDateStr.slice(0,10); setCanSpinToday(lastSpinDateOnly !== todayDateString);
    } else { setCanSpinToday(true); }
  }, [zustandActions, updateLivesAndStore, user?.lives]);

  useEffect(() => { // Consume Life on New Game Start
    if (!user || !gameOptions.selectedSeed) {
      if (!isHarvestModalOpen && !isPlantDiedModalOpen && !isGameReady && typeof onBackToDashboard === 'function') {
        onBackToDashboard();
      }
      return;
    }
    if (liveGameState.stageIndex === 0 && liveGameState.stageTime === 0 && !isGameReady && !currentHarvestData && !isPlantDiedModalOpen) {
        let lives = parseInt(localStorage.getItem('seedLives') || '0');
        if (lives > 0) {
            lives--; updateLivesAndStore(lives); setIsGameReady(true);
        } else {
            alert("You've run out of Marrow Seeds for today! Return tomorrow for a new batch.");
            zustandActions.resetGameOptions();
            if (typeof onBackToDashboard === 'function') onBackToDashboard();
        }
    } else if ((liveGameState.stageIndex !== 0 || liveGameState.stageTime !== 0 || currentHarvestData || isPlantDiedModalOpen) && !isGameReady) {
        setIsGameReady(true);
    }
  }, [user, gameOptions.selectedSeed, onBackToDashboard, zustandActions, updateLivesAndStore, liveGameState.stageIndex, liveGameState.stageTime, isGameReady, currentHarvestData, isPlantDiedModalOpen]);

  const handleOpenDailySpin = () => setIsDailySpinModalOpen(true);
  const handleCloseDailySpin = () => setIsDailySpinModalOpen(false);
  
  const handleDailySpinComplete = useCallback((awardedLives: number) => {
    localStorage.setItem('lastSpinDate', new Date().toISOString().slice(0, 10));
    setCanSpinToday(false);
    if (awardedLives > 0) { // Check if any lives were awarded
      const currentLives = parseInt(localStorage.getItem('seedLives') || '0');
      updateLivesAndStore(currentLives + awardedLives);
      console.log(`Player won ${awardedLives} life/lives from the daily spin!`);
    } else {
      console.log("Player lost the daily spin.");
    }
  }, [updateLivesAndStore]);
  
  const handleOpenHowToPlay = () => setIsHowToPlayModalOpen(true);
  const handleCloseHowToPlay = () => setIsHowToPlayModalOpen(false);
  const handleOpenLeaderboard = () => setIsLeaderboardModalOpen(true);
  const handleCloseLeaderboard = () => setIsLeaderboardModalOpen(false);
  const toggleHelpMenu = () => setIsHelpMenuOpen(!isHelpMenuOpen);
  const fixLights = () => {setLiveGameState(p => p.lightsOut ? {...p, lightsOut:false, resources:{...p.resources,light:100}, events:addEventToState(p.events,{type:"info",message:"Lights back on!"},"bg-blue-500")} : p);};

  useEffect(() => { // Main Game Loop
    if (!isGameReady || currentHarvestData || isPlantDiedModalOpen) return;

    if (liveGameState.health <= 0) {
      if (!isPlantDiedModalOpen) { // Prevent re-triggering if already open
        setIsPlantDiedModalOpen(true);
        setLiveGameState(prev => ({...prev, events: addEventToState(prev.events, {type:"danger", title:"Plant Died!", message:`${prev.plantName} withered!`}, "bg-red-700")}));
      }
      return; 
    }
    if (liveGameState.stage === "Harvest") { 
      if (!currentHarvestData) {
        const harvestResults = calculateHarvestResults(liveGameState);
        setCurrentHarvestData(harvestResults);
        setIsHarvestModalOpen(true);
        if (user?.username) syncHarvestWithBackend(user.username, harvestResults, zustandActions);

        setLiveGameState(prev => {
            let finalState = {...prev};
            finalState.events = addEventToState(prev.events, {type: "info", title: "Harvest Ready!", message: `${prev.plantName} ready.`}, "bg-green-500");
            const cKL = parseInt(localStorage.getItem('seedLives')||'0');
            triggerMarrowCorpTheftIfNeeded(finalState, gameOptions.defenseType, cKL, updateLivesAndStore);
            return finalState;
        });
      }
      return; 
    }

    const gameTickInterval = setInterval(() => {
      setLiveGameState(prev => {
        if (prev.health <= 0 || prev.stage === "Harvest") return prev;
        let ns = {...prev,resources:{...prev.resources},events:[...prev.events]}; let eTT=false;
        if(!ns.lightsOut&&Math.random()<0.03){ns.lightsOut=true;ns.events=addEventToState(ns.events,{type:"warning",title:"Lights Out!",message:"Lights failed!"},"bg-yellow-500");eTT=true;}
        ns.resources.water=Math.max(0,ns.resources.water-ns.waterDrainRate*0.1);ns.resources.nutrients=Math.max(0,ns.resources.nutrients-ns.nutrientDrainRate*0.1);
        let nLOT=ns.lightsOffTimer;if(ns.lightsOut){ns.resources.light=Math.max(0,ns.resources.light-2);nLOT+=1;}else{ns.resources.light=100;nLOT=0;} ns.lightsOffTimer=nLOT;
        let hPTT=0,sITT=0,sDTT=0;
        if(ns.resources.water<25||ns.resources.water>95){hPTT+=0.35;sITT+=0.2;} if(ns.resources.nutrients<25||ns.resources.nutrients>95){hPTT+=0.35;sITT+=0.2;}
        if(ns.lightsOut){let lOP=0.20+Math.min(0.8,ns.lightsOffTimer*0.01);if(ns.resources.light<15)lOP+=0.35;hPTT+=lOP;sITT+=(0.3+(ns.resources.light<15?0.2:0));}
        if(ns.resources.stress>70){hPTT+=0.3;} ns.health=Math.max(0,ns.health-hPTT);ns.healthSum+=ns.health;ns.healthTicks+=1;
        if(!ns.lightsOut&&ns.resources.water>=30&&ns.resources.water<=80&&ns.resources.nutrients>=30&&ns.resources.nutrients<=80&&ns.resources.stress>0){sDTT+=0.25;}else if(sITT===0&&ns.resources.stress<50&&ns.resources.stress>0){sDTT+=0.05;}
        ns.resources.stress=Math.min(100,Math.max(0,ns.resources.stress+sITT-sDTT));
        if(!eTT){if(triggerPestEventIfNeeded(ns,gameOptions.defenseType))eTT=true;}
        if(!eTT&&(ns.stage==="Flowering"||ns.stage==="Vegetative")){if(triggerRaiderEventIfNeeded(ns,gameOptions.defenseType))eTT=true;}
        if(!eTT&&ns.stage==="Flowering"){if(triggerNutrientBoostIfNeeded(ns))eTT=true;}
        if(!actOfGodHasOccurredThisGame&&Math.random()<0.005)triggerActOfGodIfNeeded(ns);
        ns.stageTime+=1;if(ns.totalGrowthTime>0){let aT=0;for(let i=0;i<ns.stageIndex;i++){aT+=GROWTH_STAGES[i].time;}aT+=ns.stageTime;ns.growthProgress=Math.min(100,(aT/ns.totalGrowthTime)*100);}
        if(ns.stageTime>=GROWTH_STAGES[ns.stageIndex].time&&ns.stageIndex<GROWTH_STAGES.length-1){if(GROWTH_STAGES[ns.stageIndex].name!=="Harvest"){ns.stageIndex+=1;ns.stage=GROWTH_STAGES[ns.stageIndex].name;ns.stageTime=0;ns.events=addEventToState(ns.events,{type:"info",message:`Entered ${ns.stage} stage.`},"bg-blue-500");}}
        if(ns.stageIndex>=GROWTH_STAGES.length-1&&GROWTH_STAGES[ns.stageIndex].name==="Harvest"){ns.stage="Harvest";ns.growthProgress=100;}
        ['health','growthProgress'].forEach(k=>ns[k as keyof LiveGameState]=parseFloat((ns[k as keyof LiveGameState]as number).toFixed(2)));
        ['water','light','nutrients','stress'].forEach(k=>ns.resources[k as keyof PlantResources]=parseFloat(ns.resources[k as keyof PlantResources].toFixed(2)));
        return ns;
      });
    }, 1000);
    return () => clearInterval(gameTickInterval);
  }, [isGameReady, liveGameState.stage, liveGameState.health, gameOptions.defenseType, currentHarvestData, isPlantDiedModalOpen, onBackToDashboard, zustandActions, user, updateLivesAndStore]);

  const handlePlantDiedModalClose = useCallback(() => {
    setIsPlantDiedModalOpen(false);
    zustandActions.resetGameOptions();
    onBackToDashboard();
  }, [zustandActions, onBackToDashboard]);

  const handleLookForSeeds = useCallback(() => { const cL=parseInt(localStorage.getItem('seedLives')||'0');if(Math.random()<0.95){const nL=cL+1;updateLivesAndStore(nL);alert(`Cosmic winds blessed you! +1 Marrow Seed! Total: ${nL}`);}else{alert("The void offers no seeds...");}}, [updateLivesAndStore]);
  const handleStartNewGameFromModal = useCallback(() => { setIsHarvestModalOpen(false);setCurrentHarvestData(null);zustandActions.resetGameOptions();onBackToDashboard();}, [zustandActions, onBackToDashboard]);
  const handleBreedNewStrainFromModal = useCallback(() => { alert("Marrow-Genesis secrets are still unfolding!");}, []);

  const stressPercentage = liveGameState.resources.stress / 100;
  const stressBarColor = lerpColor("#6B7280", "#EF4444", stressPercentage); // Tailwind gray-500 to red-500

  if (!isGameReady && !(liveGameState.stage === "Harvest" || liveGameState.health <= 0 || isPlantDiedModalOpen || isHarvestModalOpen )) {
    return <div className="flex items-center justify-center min-h-screen bg-gray-950 text-white font-pixel">Preparing Your Grow Operation... Verifying Seed Licenses...</div>;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-950">
      <div className="relative w-[800px] h-[600px] rounded-xl overflow-hidden shadow-2xl border-2 border-gray-800">
        <div className="absolute inset-0"><Image src="/images/bg3.png" alt="Marrow Grow Workshop" fill className="object-cover pixel-art" priority /></div>
        <div className="absolute top-4 left-4 z-10"><Image src="/images/mglogo.png" alt="Marrow Grow Logo" width={80} height={80} className="drop-shadow-lg" /></div>
        <div className="absolute top-4 right-4 z-10"><Button onClick={toggleHelpMenu} className="bg-orange-500 hover:bg-orange-600 border-2 border-orange-400 font-pixel text-xs px-3 py-1 text-black">HELP</Button></div>
        
        {isHelpMenuOpen && <HelpMenu user={user} onClose={() => setIsHelpMenuOpen(false)} onLogoutClick={() => { if (liveGameState.stage === "Harvest" || liveGameState.health <= 0) { zustandActions.resetGameOptions(); } zustandActions.logoutUser(); }} onDailySpinClick={handleOpenDailySpin} onHowToPlayClick={handleOpenHowToPlay} onLeaderboardClick={handleOpenLeaderboard} />}
        <DailySpinModal isOpen={isDailySpinModalOpen} onClose={handleCloseDailySpin} canSpin={canSpinToday} onSpinComplete={handleDailySpinComplete} />
        <HowToPlayModal isOpen={isHowToPlayModalOpen} onClose={handleCloseHowToPlay} />
        <LeaderboardModal isOpen={isLeaderboardModalOpen} onClose={handleCloseLeaderboard} />

        {isPlantDiedModalOpen && (
            <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-50 font-pixel" aria-labelledby="plant-died-dialog-title" role="alertdialog">
                <div className="p-8 bg-gray-800 border-4 border-red-500 rounded-lg text-center text-white shadow-xl">
                    <VisuallyHidden><h2 id="plant-died-dialog-title">Plant Lost Notification</h2></VisuallyHidden>
                    <p className="text-2xl text-red-400 mb-4">Plant Lost!</p>
                    <p className="mb-6">Alas, your <span className="text-yellow-300">{liveGameState.plantName}</span> has withered into cosmic dust!</p>
                    <p className="mb-6 text-sm">Better luck next time, space farmer.</p>
                    <Button onClick={handlePlantDiedModalClose} className="bg-purple-600 hover:bg-purple-700 text-white">Return to the Void</Button>
                </div>
            </div>
        )}

        {!(isPlantDiedModalOpen && liveGameState.health <=0) && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
              <div className="border-4 border-blue-500 bg-gray-800/95 rounded-lg p-1 w-[700px] h-[400px]">
                <div className="flex gap-1 h-[280px] mb-1">
                  <div className="w-[270px] bg-red-600/20 border-2 border-red-500 rounded relative overflow-hidden">
                    <Image src={GROWTH_STAGES[liveGameState.stageIndex]?.image || "/images/stages/sprout.png"} alt="Animated Flower Pot" fill className="pixel-art object-cover" unoptimized />
                    {liveGameState.lightsOut && (<div onClick={fixLights} className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center cursor-pointer hover:bg-black/60 transition-colors z-10"><div className="text-white font-pixel text-center"><div className="text-sm mb-1">Lights Out!</div><div className="text-xs">Click to Fix</div></div></div>)}
                  </div>
                  <div className="flex-1 bg-gray-900/90 border-2 border-gray-600 rounded p-2">
                    <div className="text-center mb-2"><h2 className="font-pixel text-yellow-300 text-base mb-0.5">{liveGameState.plantName}</h2><div className="font-pixel text-blue-300 text-xs">Stage: <span className="text-blue-200">{liveGameState.stage}</span></div><div className="font-pixel text-blue-300 text-xs">Health: <span className="text-blue-200">{liveGameState.health}%</span></div></div>
                    <div className="mb-1"><div className="font-pixel text-white text-xs mb-0.5">Health</div><div className="bg-gray-700 border border-gray-600 rounded h-3"><div className="bg-green-500 h-full rounded" style={{ width: `${liveGameState.health}%` }}></div></div></div>
                    <div className="mb-2"><div className="font-pixel text-white text-xs mb-0.5">Growth Progress</div><div className="bg-gray-700 border border-gray-600 rounded h-3"><div className="bg-white h-full rounded" style={{ width: `${liveGameState.growthProgress}%` }}></div></div></div>
                    <div className="space-y-1.5 mb-3">
                      <div><div className="font-pixel text-white text-xs mb-0.5">Water</div><div className="bg-gray-700 border border-gray-600 rounded h-2"><div className="bg-blue-400 h-full rounded" style={{ width: `${liveGameState.resources.water}%` }}></div></div></div>
                      <div><div className="font-pixel text-white text-xs mb-0.5">Light</div><div className="bg-gray-700 border border-gray-600 rounded h-2"><div className="bg-white h-full rounded" style={{ width: `${liveGameState.resources.light}%` }}></div></div></div>
                      <div><div className="font-pixel text-white text-xs mb-0.5">Nutrients</div><div className="bg-gray-700 border border-gray-600 rounded h-2"><div className="bg-gray-300 h-full rounded" style={{ width: `${liveGameState.resources.nutrients}%` }}></div></div></div>
                      <div><div className="font-pixel text-white text-xs mb-0.5">Stress</div><div className="bg-gray-700 border border-gray-600 rounded h-2"><div className="h-full rounded" style={{ width: `${liveGameState.resources.stress}%`, backgroundColor: stressBarColor }}></div></div></div>
                    </div>
                    <div className="flex gap-1"><Button className="flex-1 bg-green-500 hover:bg-green-600 text-black font-pixel text-[10px] py-1 h-auto">Candle Light</Button><Button disabled className="flex-1 bg-gray-600 text-gray-400 font-pixel text-[10px] py-1 h-auto cursor-not-allowed"><div className="text-center"><div>Grow Light</div><div className="text-[8px]">Unlocks at: 500</div></div></Button><Button disabled className="flex-1 bg-gray-600 text-gray-400 font-pixel text-[10px] py-1 h-auto cursor-not-allowed"><div className="text-center"><div>Quantum Light</div><div className="text-[8px]">Unlocks at: 5000</div></div></Button></div>
                  </div>
                </div>
                <div className="flex gap-1 h-[90px]">
                  <div className="w-[85px] bg-gray-700/90 border-2 border-gray-500 rounded flex flex-col items-center justify-center">{gameOptions.selectedSeed?.imageUrl ? <Image src={gameOptions.selectedSeed.imageUrl} alt={gameOptions.selectedSeed.name} width={24} height={24} className="mb-0.5" /> : <div className="text-purple-400 text-xl mb-0.5">💀</div>}<div className="font-pixel text-white text-[8px] text-center">{gameOptions.selectedSeed?.name || "N/A"}</div></div>
                  <div className="w-[85px] bg-gray-700/90 border-2 border-gray-500 rounded flex flex-col items-center justify-center">{gameOptions.selectedSoil?.image ? <Image src={gameOptions.selectedSoil.image} alt={gameOptions.selectedSoil.name} width={24} height={24} className="mb-0.5" /> : <div className="text-purple-400 text-xl mb-0.5">🧪</div>}<div className="font-pixel text-white text-[8px] text-center">{gameOptions.selectedSoil?.name || "N/A"}</div></div>
                  <div className="flex-1 bg-yellow-600/20 border-2 border-yellow-500 rounded p-1.5"><h3 className="font-pixel text-white text-center text-xs mb-1">events</h3><ScrollArea className="h-[60px] pr-2"><div className="space-y-1">{liveGameState.events.map((event, index) => ( <div key={index} className={`${event.bgColor} rounded p-1`}><div className="font-pixel text-black text-[9px]">{event.title && <span className="font-bold">{event.title} </span>}{event.message}</div></div> ))}</div></ScrollArea></div>
                </div>
              </div>
            </div>
        )}

        {currentHarvestData && isHarvestModalOpen && (
          <HarvestCompleteModal
            isOpen={isHarvestModalOpen}
            onClose={() => setIsHarvestModalOpen(false) }
            harvestData={currentHarvestData}
            onLookForSeeds={handleLookForSeeds}
            onStartNewGame={handleStartNewGameFromModal}
            onBreedNewStrain={handleBreedNewStrainFromModal}
            // Remember: Your HarvestCompleteModal.tsx needs:
            // 1. A <DialogTitle> (can be inside <VisuallyHidden>)
            // 2. onInteractOutside={(e) => e.preventDefault()} on its <DialogContent>
            //    if you use a standard Dialog. Shadcn's Dialog is modal by default.
          />
        )}
      </div>
    </div>
  );
}

// Conceptual VisuallyHidden component if not using Radix's one directly
const VisuallyHidden = ({ children }: { children: React.ReactNode}) => (
  <span style={{ position: 'absolute', width: '1px', height: '1px',padding: 0,margin: '-1px',overflow: 'hidden',clip: 'rect(0, 0, 0, 0)',whiteSpace: 'nowrap',borderWidth: 0 }}>{children}</span>
);