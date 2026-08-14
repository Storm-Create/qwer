/**
 * Business Empire: Ultimate
 * Esports Empire — High-Fidelity Match Simulation Engine
 * Calculates win probabilities and generates detailed round-by-round logs,
 * player performance, clutches, viewer metrics, and MVP awards.
 */

import { DisciplineId, EsportsRoster, MatchLogEvent, ProPlayer, TournamentMatch } from '../../types/esports';
import { ESPORTS_DISCIPLINES } from './esportsDisciplines';

interface SimulationInput {
  tournamentId: string;
  roundName: string;
  disciplineId: DisciplineId;
  teamA: {
    id: string;
    name: string;
    roster?: EsportsRoster;
    players: ProPlayer[];
    coachRating?: number;
    facilityBoost?: number;
  };
  teamB: {
    id: string;
    name: string;
    rating: number;
    coachRating?: number;
  };
}

export function simulateEsportsMatch(input: SimulationInput): TournamentMatch {
  const discipline = ESPORTS_DISCIPLINES[input.disciplineId];

  // 1. Calculate Team A Weighted Rating
  let teamARating = 75;
  const activePlayers = input.teamA.players.slice(0, discipline.rosterSize);
  
  if (activePlayers.length > 0) {
    const avgPlayerRating = activePlayers.reduce((acc, p) => acc + p.rating, 0) / activePlayers.length;
    const avgForm = activePlayers.reduce((acc, p) => acc + p.form, 0) / activePlayers.length;
    const avgMorale = activePlayers.reduce((acc, p) => acc + p.morale, 0) / activePlayers.length;
    const avgFatigue = activePlayers.reduce((acc, p) => acc + p.fatigue, 0) / activePlayers.length;
    
    const chemistry = input.teamA.roster?.chemistry || 70;
    const strategy = input.teamA.roster?.strategy || 70;
    const coachBonus = (input.teamA.coachRating || 70) * 0.1;
    const facilityBonus = (input.teamA.facilityBoost || 0) * 2;

    // Advanced Formula
    teamARating = (
      avgPlayerRating * 0.45 +
      (avgForm - 50) * 0.15 +
      (avgMorale - 50) * 0.1 +
      chemistry * 0.12 +
      strategy * 0.08 +
      coachBonus +
      facilityBonus -
      avgFatigue * 0.2
    );
  }

  const teamBRating = input.teamB.rating;

  // 2. Win Probability Calculation (Elo-style logistic curve)
  const ratingDiff = teamARating - teamBRating;
  const winProbA = 1 / (1 + Math.pow(10, -ratingDiff / 25));

  // Determine Rounds to Win based on game format
  let targetWins = 2; // Best of 3 default
  if (discipline.genre === 'FPS/Tactical') {
    targetWins = 13; // CS2 MR12 format (first to 13)
  } else if (discipline.genre === 'MOBA' || discipline.genre === 'Strategy/RTS' || discipline.genre === 'Chess') {
    targetWins = 2; // Bo3 (2 wins)
  } else if (discipline.genre === 'Battle Royale') {
    targetWins = 5; // 5 maps / matches
  } else if (discipline.genre === 'Sports/Arcade') {
    targetWins = 3; // Bo5 (3 wins)
  }

  let scoreA = 0;
  let scoreB = 0;
  const events: MatchLogEvent[] = [];
  const roundDetails: {
    roundNumber: number;
    winner: 'teamA' | 'teamB';
    eventDescription: string;
    scoreAfter: [number, number];
  }[] = [];

  let currentRound = 1;
  const maxRounds = targetWins === 13 ? 24 : targetWins * 2 - 1;

  // Track player performance for MVP
  const playerKillCounts: Record<string, number> = {};
  activePlayers.forEach((p) => {
    playerKillCounts[p.nickname] = 0;
  });

  while ((scoreA < targetWins && scoreB < targetWins) || (targetWins === 13 && scoreA < 13 && scoreB < 13 && currentRound <= maxRounds)) {
    // Dynamic round probability with momentum factor
    const momentumA = (scoreA - scoreB) * 0.02;
    const roundRoll = Math.random();
    const effectiveProbA = Math.min(0.92, Math.max(0.08, winProbA + momentumA));

    const roundWinner = roundRoll < effectiveProbA ? 'teamA' : 'teamB';
    if (roundWinner === 'teamA') {
      scoreA++;
    } else {
      scoreB++;
    }

    // Generate authentic round text
    const activeActor = activePlayers.length > 0
      ? activePlayers[Math.floor(Math.random() * activePlayers.length)]
      : { nickname: 'Player', role: 'Carry' };

    let eventDesc = '';
    let eventType: MatchLogEvent['type'] = 'kill';

    if (discipline.genre === 'FPS/Tactical') {
      if (roundWinner === 'teamA') {
        const isClutch = Math.random() > 0.65;
        if (isClutch) {
          eventDesc = `${activeActor.nickname} вытаскивает сложнейший клатч 1v2 точным хедшотом и обезвреживает бомбу!`;
          eventType = 'clutch';
        } else {
          eventDesc = `${input.teamA.name} идеально раскидывает смоки на точку и оформляет чистый раунд!`;
          eventType = 'objective';
        }
        playerKillCounts[activeActor.nickname] = (playerKillCounts[activeActor.nickname] || 0) + (isClutch ? 2 : 1);
      } else {
        eventDesc = `${input.teamB.name} перехватывает инициативу агрессивным пушем и забирает раунд.`;
        eventType = 'kill';
      }
    } else if (discipline.genre === 'MOBA') {
      if (roundWinner === 'teamA') {
        const isTeamfight = Math.random() > 0.5;
        if (isTeamfight) {
          eventDesc = `${activeActor.nickname} инициирует идеальный тимфайт 5v5, забирает Рошана/Барона и пушит базу!`;
          eventType = 'teamfight';
        } else {
          eventDesc = `${input.teamA.name} переигрывает соперника на драфте и ломает Трон/Нексус!`;
          eventType = 'objective';
        }
        playerKillCounts[activeActor.nickname] = (playerKillCounts[activeActor.nickname] || 0) + 3;
      } else {
        eventDesc = `${input.teamB.name} ловит на ошибке и сносит главную цитадель.`;
        eventType = 'teamfight';
      }
    } else if (discipline.genre === 'Battle Royale') {
      if (roundWinner === 'teamA') {
        eventDesc = `${input.teamA.name} занимает хайграунд в финальной зоне и берет #1 Топ-1 с 14 фрагами!`;
        eventType = 'highlight';
        playerKillCounts[activeActor.nickname] = (playerKillCounts[activeActor.nickname] || 0) + 4;
      } else {
        eventDesc = `${input.teamB.name} выживает в суматохе и оформляет победу на карте.`;
        eventType = 'objective';
      }
    } else if (discipline.genre === 'Chess') {
      if (roundWinner === 'teamA') {
        eventDesc = `${activeActor.nickname} проводит блестящую позиционную жертву ферзя и ставит мат на 42-м ходу!`;
        eventType = 'highlight';
      } else {
        eventDesc = `${input.teamB.name} переигрывает в цейтноте и фиксирует победу.`;
        eventType = 'objective';
      }
    } else {
      // General Sports / Arcade / CCG
      if (roundWinner === 'teamA') {
        eventDesc = `${activeActor.nickname} забивает невероятный гол в овертайме / находит летальный урон!`;
        eventType = 'highlight';
      } else {
        eventDesc = `${input.teamB.name} выигрывает решающую серию.`;
        eventType = 'objective';
      }
    }

    roundDetails.push({
      roundNumber: currentRound,
      winner: roundWinner,
      eventDescription: eventDesc,
      scoreAfter: [scoreA, scoreB],
    });

    events.push({
      minuteOrRound: currentRound,
      type: eventType,
      text: eventDesc,
      actorName: roundWinner === 'teamA' ? activeActor.nickname : input.teamB.name,
      team: roundWinner,
      viewerSpike: Math.round(discipline.avgViewers * (0.05 + Math.random() * 0.1)),
    });

    currentRound++;
  }

  // Handle Tiebreak if needed for MR12
  if (targetWins === 13 && scoreA === 12 && scoreB === 12) {
    if (Math.random() < winProbA) {
      scoreA = 16;
      scoreB = 14;
    } else {
      scoreA = 14;
      scoreB = 16;
    }
  }

  const isTeamAWinner = scoreA > scoreB;
  const winnerId = isTeamAWinner ? input.teamA.id : input.teamB.id;

  // Determine MVP
  let mvpName = 'MVP Player';
  let maxKills = -1;
  Object.entries(playerKillCounts).forEach(([name, kills]) => {
    if (kills > maxKills) {
      maxKills = kills;
      mvpName = name;
    }
  });

  // Calculate Viewers based on popularity and round importance
  const roundMultiplier = input.roundName.includes('Grand Final') ? 2.4 : input.roundName.includes('Semi') ? 1.6 : 1.1;
  const liveViewers = Math.round(discipline.avgViewers * roundMultiplier * (0.85 + Math.random() * 0.3));
  const peakViewers = Math.round(liveViewers * (1.3 + Math.random() * 0.4));
  const avgViewers = Math.round(liveViewers * 0.9);

  return {
    id: `match_${input.tournamentId}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    tournamentId: input.tournamentId,
    roundName: input.roundName,
    teamAId: input.teamA.id,
    teamAName: input.teamA.name,
    teamARating: Math.round(teamARating),
    teamBId: input.teamB.id,
    teamBName: input.teamB.name,
    teamBRating: Math.round(teamBRating),
    scoreA,
    scoreB,
    isFinished: true,
    winnerId,
    events,
    viewers: {
      live: liveViewers,
      peak: peakViewers,
      avg: avgViewers,
    },
    mvpPlayerName: mvpName,
    roundDetails,
  };
}
