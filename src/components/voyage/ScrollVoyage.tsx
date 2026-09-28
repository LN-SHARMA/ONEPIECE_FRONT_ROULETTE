import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { useFleetStore } from '../../store/fleetStore';
import { VoyageBackground } from './VoyageBackground';
import { VoyageHUD } from '../navigation/VoyageHUD';
import { OrganizerDashboard } from '../dashboard/OrganizerDashboard';
import { EnlistPirateForm } from '../recruitment/EnlistPirateForm';
import { WantedPosterWall } from '../posters/WantedPosterWall';
import { SeaTrialsBoard } from '../trials/SeaTrialsBoard';
import { CrewRosterManager } from '../crews/CrewRosterManager';
import { ScoreboardTable } from '../scoreboard/ScoreboardTable';
import { ChallengeTeamDashboard } from '../dashboard/ChallengeTeamDashboard';
import { DualModeShowcaseCard } from '../common/DualModeShowcaseCard';
import { JollyRogerAvatar } from '../common/SvgIcons';
import { ArrowDown, Compass, ChevronDown, MapPin, Sparkles, ArrowRight, Mouse } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export const ScrollVoyage: React.FC = () => {
  const { setViewMode, setSelectedIslandId } = useFleetStore();
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    lenisRef.current = lenis;

    lenis.on('scroll', (e: any) => {
      ScrollTrigger.update();
      if (typeof e.progress === 'number') {
        setScrollProgress(e.progress);
      }
    });

    const tickerCallback = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tickerCallback);
    gsap.ticker.lagSmoothing(0);

    const masterTrigger = ScrollTrigger.create({
      trigger: document.body,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        setScrollProgress(self.progress);
      },
    });

    const scenes = [
      { id: '#scene-sky', idx: 0 },
      { id: '#scene-islands', idx: 1 },
      { id: '#scene-sunny', idx: 2 },
      { id: '#scene-whitebeard', idx: 3 },
      { id: '#scene-battlefield', idx: 4 },
      { id: '#scene-scoreboard', idx: 5 },
    ];

    const triggers = scenes.map(({ id, idx }) => {
      return ScrollTrigger.create({
        trigger: id,
        start: 'top center',
        end: 'bottom center',
        onEnter: () => setCurrentSceneIndex(idx),
        onEnterBack: () => setCurrentSceneIndex(idx),
      });
    });

    return () => {
      gsap.ticker.remove(tickerCallback);
      lenis.destroy();
      masterTrigger.kill();
      triggers.forEach(t => t.kill());
    };
  }, []);

  const navigateToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el && lenisRef.current) {
      lenisRef.current.scrollTo(el, { offset: -70 });
    }
  };

  const jumpToIslandMap = (islandId: string) => {
    setSelectedIslandId(islandId);
    setViewMode('map');
  };

  return (
    <div className="relative min-h-screen text-slate-100 selection:bg-amber-500 selection:text-black">
      {/* Continuous 5-Stage Camera Descent Background */}
      <VoyageBackground currentSceneIndex={currentSceneIndex} scrollProgress={scrollProgress} />

      {/* Persistent Minimalist Header HUD */}
      <VoyageHUD
        currentSceneIndex={currentSceneIndex}
        scrollProgress={scrollProgress}
        onNavigateSection={navigateToSection}
      />

      {/* Voyage Main Content Flow */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 space-y-36 sm:space-y-48 pt-20 pb-36">

        {/* ======================================================== */}
        {/* PANEL 1: HIGH SKY / A DREAM NEVER ENDS & ABOUT */}
        {/* ======================================================== */}
        <section id="scene-sky" className="min-h-screen flex flex-col justify-between pt-16 pb-12">
          {/* Top Hero Banner matching Reference Photo 1 */}
          <div className="text-center max-w-3xl mx-auto space-y-4 pt-10">
            <span className="text-xs sm:text-sm font-bold tracking-[0.35em] text-white/90 uppercase drop-shadow">
              O N E &nbsp; P I E C E
            </span>

            <h1 className="font-pirate text-5xl sm:text-7xl lg:text-8xl tracking-wider text-white drop-shadow-[0_8px_20px_rgba(0,0,0,0.8)] uppercase leading-none">
              A DREAM NEVER ENDS
            </h1>

            <p className="text-sm sm:text-base text-sky-100 drop-shadow font-medium tracking-wide">
              Same ocean. Different dreams. One journey.
            </p>

            <div className="pt-2">
              <button
                onClick={() => navigateToSection('scene-islands')}
                className="inline-flex items-center gap-1.5 px-6 py-2 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/40 text-white text-xs font-bold transition-all shadow-lg active:scale-95"
              >
                <span>Scroll Down</span>
                <ArrowDown className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Mouse Scroll Indicator */}
          <div className="flex flex-col items-center justify-center text-white/80 gap-1.5 my-16 drop-shadow">
            <div className="w-5 h-8 rounded-full border-2 border-white/60 flex items-start justify-center p-1">
              <div className="w-1 h-2 rounded-full bg-white animate-bounce" />
            </div>
            <span className="text-[10px] tracking-widest uppercase font-semibold">Scroll</span>
          </div>

          {/* Bottom Card: ABOUT & The Adventure of a Lifetime */}
          <div className="max-w-2xl bg-slate-950/70 backdrop-blur-md border border-white/20 rounded-3xl p-6 sm:p-8 shadow-2xl">
            <span className="text-xs font-bold tracking-[0.2em] uppercase text-sky-300">
              A B O U T
            </span>
            <h2 className="font-pirate text-3xl sm:text-4xl text-parchment tracking-wide mt-1">
              The Adventure of a Lifetime
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
              It all started with a dream... A boy with a straw hat, a crew of misfits, and a sea full of possibilities. Now Foxy challenges the fleet to the ultimate Davy Back Fight!
            </p>

            <div className="flex items-center gap-4 mt-4">
              <button
                onClick={() => navigateToSection('scene-islands')}
                className="inline-flex items-center gap-1 text-xs text-sky-300 hover:text-sky-200 font-bold"
              >
                <span>Learn More</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => jumpToIslandMap('island-sunny-hq')}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-semibold hover:bg-amber-500/30 transition-colors"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Thousand Sunny Dock</span>
              </button>
            </div>
          </div>

          {/* Organizer Dashboard Drawer */}
          <div className="mt-8">
            <OrganizerDashboard onJumpToSection={navigateToSection} />
          </div>
        </section>


        {/* ======================================================== */}
        {/* PANEL 2: THE GRAND LINE / A SEA OF DREAMS AND DANGER */}
        {/* ======================================================== */}
        <section id="scene-islands" className="scroll-mt-24 space-y-6">
          {/* Poetic Transition Quote matching Photo 2 */}
          <div className="text-center py-8">
            <p className="font-serif italic text-lg sm:text-xl text-sky-100 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
              "The sky... ...slowly gives way to the endless ocean."
            </p>
          </div>

          {/* Story Intro Block */}
          <div className="max-w-2xl bg-slate-950/75 backdrop-blur-md border border-cyan-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl">
            <span className="text-xs font-bold tracking-[0.2em] uppercase text-cyan-400">
              T H E &nbsp; G R A N D &nbsp; L I N E
            </span>
            <h2 className="font-pirate text-3xl sm:text-5xl text-parchment tracking-wide mt-1">
              A Sea of Dreams and Danger
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
              The Grand Line — where the sky meets the sea, and the impossible becomes just another day. Enlist capable nakama before entering treacherous sea trials.
            </p>

            <div className="flex items-center gap-3 mt-4">
              <button
                onClick={() => jumpToIslandMap('island-recruitment')}
                className="inline-flex items-center gap-1 text-xs text-cyan-300 hover:text-cyan-200 font-bold"
              >
                <span>Explore the World</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Functional: Enlist a Pirate Form (R1, R2, R3) */}
          <EnlistPirateForm />
        </section>


        {/* ======================================================== */}
        {/* PANEL 3: THE CREW / MORE THAN JUST PIRATES (Thousand Sunny) */}
        {/* ======================================================== */}
        <section id="scene-sunny" className="scroll-mt-24 space-y-6">
          {/* Poetic Quote matching Photo 3 */}
          <div className="text-center py-8">
            <p className="font-serif italic text-lg sm:text-xl text-amber-100 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
              "New islands... new people... new stories."
            </p>
          </div>

          {/* Story Intro Block */}
          <div className="max-w-2xl bg-slate-950/75 backdrop-blur-md border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl">
            <span className="text-xs font-bold tracking-[0.2em] uppercase text-amber-400">
              T H E &nbsp; C R E W
            </span>
            <h2 className="font-pirate text-3xl sm:text-5xl text-parchment tracking-wide mt-1">
              More Than Just Pirates
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
              A family. A crew. A reason to keep going — no matter what. Browse the bounty wall and evaluate your nakama's Haki power.
            </p>

            <div className="flex items-center gap-3 mt-4">
              <button
                onClick={() => jumpToIslandMap('island-recruitment')}
                className="inline-flex items-center gap-1 text-xs text-amber-300 hover:text-amber-200 font-bold"
              >
                <span>Meet the Crew</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Functional: Wanted Poster Wall (R4) */}
          <WantedPosterWall />
        </section>


        {/* ======================================================== */}
        {/* PANEL 4: THE WHITEBEARD PIRATES / THE STRONGEST MAN */}
        {/* ======================================================== */}
        <section id="scene-whitebeard" className="scroll-mt-24 space-y-6">
          {/* Whitebeard Quote matching Photo 4 */}
          <div className="text-center py-8">
            <p className="font-serif italic text-lg sm:text-2xl text-amber-200 drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]">
              "The sea is not just a place... it's a dream."
            </p>
            <span className="text-xs uppercase tracking-widest text-amber-400/80 font-bold mt-1 block">
              — Edward Newgate "Whitebeard"
            </span>
          </div>

          {/* Story Intro Block */}
          <div className="max-w-2xl bg-slate-950/80 backdrop-blur-md border border-orange-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl">
            <span className="text-xs font-bold tracking-[0.2em] uppercase text-orange-400">
              T H E &nbsp; W H I T E B E A R D &nbsp; P I R A T E S
            </span>
            <h2 className="font-pirate text-3xl sm:text-5xl text-parchment tracking-wide mt-1">
              The Strongest Man in the World
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
              Power. Loyalty. Family. The Whitebeard Pirates — a legend that never fades. Configure the Davy Back Fight trial rules before meeting the emperor's fleets in the arena ring.
            </p>

            <div className="flex items-center gap-3 mt-4">
              <button
                onClick={() => jumpToIslandMap('island-foxy')}
                className="inline-flex items-center gap-1 text-xs text-orange-300 hover:text-orange-200 font-bold"
              >
                <span>Know More</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Functional: Sea Trials Board & Event Rules (R5, R6, R7) */}
          <SeaTrialsBoard />
        </section>


        {/* ======================================================== */}
        {/* PANEL 5: BATTLEFIELD SUNSET / ONE PIECE FOREVER */}
        {/* ======================================================== */}
        <section id="scene-battlefield" className="scroll-mt-24 space-y-8">
          {/* Finale Quote matching Photo 5 */}
          <div className="text-center py-6">
            <p className="font-serif italic text-base sm:text-lg text-red-200 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] max-w-xl mx-auto">
              "Because in the end... it's not just about the destination. It's about the journey."
            </p>

            {/* Giant Brush Calligraphy: ONE PIECE FOREVER with Red Stroke Accent */}
            <div className="my-6">
              <h2 className="font-pirate text-6xl sm:text-8xl text-white tracking-wider uppercase drop-shadow-[0_8px_25px_rgba(220,38,38,0.8)] italic">
                ONE PIECE FOREVER
              </h2>
              {/* Red brush stroke underline */}
              <div className="w-48 sm:w-72 h-2 mx-auto bg-gradient-to-r from-red-600 via-red-500 to-red-700 rounded-full shadow-[0_0_15px_rgba(220,38,38,0.9)] transform -rotate-1" />
            </div>

            <div className="pt-2">
              <button
                onClick={() => navigateToSection('scene-scoreboard')}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-red-600/30 hover:bg-red-600/40 border border-red-500/60 text-white text-xs sm:text-sm font-bold shadow-lg shadow-red-600/20 active:scale-95 transition-all"
              >
                <span>(+) Join the Journey</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Functional: Assemble the Fleet, Crews, Radars, Drag-Drop (R8–R12) */}
          <CrewRosterManager />

          {/* Dual Mode Switcher Showcase Card matching reference photo */}
          <DualModeShowcaseCard />
        </section>


        {/* ======================================================== */}
        {/* PANEL 6: SCOREBOARD & TOURNAMENT PODIUM (R13, R14) */}
        {/* ======================================================== */}
        <section id="scene-scoreboard" className="scroll-mt-24 space-y-8">
          <ChallengeTeamDashboard />
          <ScoreboardTable />
        </section>

      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800 bg-slate-950/95 py-10 px-4 text-center text-xs text-slate-500">
        <p className="font-pirate text-2xl text-parchment">ONE PIECE FOREVER • GRAND FLEET</p>
        <p className="mt-1">Continuous cinematic descent from Stratosphere to Battlefield Abyss.</p>
        <p className="mt-2 text-[10px] text-slate-600 font-mono">Tip: Type Konami Code for Gear 5 celebration!</p>
      </footer>
    </div>
  );
};
