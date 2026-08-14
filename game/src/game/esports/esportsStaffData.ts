/**
 * Business Empire: Ultimate
 * Esports Empire — Staff System Catalog & Generator
 */

import { DisciplineId, EsportsStaff, StaffRole } from '../../types/esports';

export interface StaffTemplate {
  role: StaffRole;
  titleRu: string;
  description: string;
  baseSalary: number;
  bonusEffect: string;
}

export const STAFF_ROLES_INFO: Record<StaffRole, StaffTemplate> = {
  head_coach: {
    role: 'head_coach',
    titleRu: 'Главный тренер (Head Coach)',
    description: 'Улучшает тактику, драфты, координацию и даёт +15% к шансу победы в клатчах.',
    baseSalary: 12000,
    bonusEffect: '+12 к тактике, +10% к винрейту в ключевых раундах',
  },
  assistant_coach: {
    role: 'assistant_coach',
    titleRu: 'Помощник тренера (Assistant Coach)',
    description: 'Индивидуально работает с игроками, ускоряя рост характеристик (Aim/Reaction/Mechanics).',
    baseSalary: 7500,
    bonusEffect: '+25% к скорости прокачки навыков игроков',
  },
  analyst: {
    role: 'analyst',
    titleRu: 'Аналитик (Analyst)',
    description: 'Изучает демо-записи соперников, контрит тактики и повышает рейтинг команды перед матчем.',
    baseSalary: 8500,
    bonusEffect: '+10 к рейтингу команды против топ-соперников',
  },
  scout: {
    role: 'scout',
    titleRu: 'Главный скаут (Talent Scout)',
    description: 'Находит молодых вундеркиндов с потенциалом 90+ на трансферном рынке с 50% скидкой.',
    baseSalary: 6000,
    bonusEffect: 'Открывает скрытый потенциал и скидки на трансферы',
  },
  manager: {
    role: 'manager',
    titleRu: 'Генеральный менеджер (Team Manager)',
    description: 'Организует буткемпы, логистику турниров и снижает расходы на содержание команды.',
    baseSalary: 9000,
    bonusEffect: '-20% к расходам на поездки и буткемпы, +10% к призовым',
  },
  performance_coach: {
    role: 'performance_coach',
    titleRu: 'Тренер по физподготовке (Performance Coach)',
    description: 'Снижает накопление усталости игроков во время долгих матчей на 40%.',
    baseSalary: 6500,
    bonusEffect: '-40% к усталости (Fatigue), быстрый рекавери',
  },
  psychologist: {
    role: 'psychologist',
    titleRu: 'Спортивный психолог (Sports Psychologist)',
    description: 'Поддерживает мораль (Morale) на максимуме и предотвращает тильт после поражений.',
    baseSalary: 8000,
    bonusEffect: 'Иммунитет к тильту, мораль команды всегда выше 85%',
  },
  content_manager: {
    role: 'content_manager',
    titleRu: 'Контент-директор (Content Manager)',
    description: 'Создаёт вирусные хайлайты, влоги с буткемпов и удваивает медиа-охваты.',
    baseSalary: 7000,
    bonusEffect: '+50% к приросту фанатов и подписчиков соцсетей',
  },
  smm_manager: {
    role: 'smm_manager',
    titleRu: 'SMM-менеджер (Social Media Manager)',
    description: 'Ведёт соцсети организации, запускает тренды и привлекает дорогих спонсоров.',
    baseSalary: 5500,
    bonusEffect: '+30% к стоимости спонсорских контрактов',
  },
};

const STAFF_NAMES = [
  'Viktor "TaZ" Wojtas', 'Danny "zonic" Sørensen', 'Andrey "B1ad3" Gorodenskiy',
  'Remy "XTQZZZ" Quoniam', 'Kim "kkOma" Jeong-gyun', 'Clement "Puppey" Ivanov',
  'Kory "SEMPHIS" Friesen', 'James "Maka" Crolley', 'Alexey "OverDrive" Birukov',
  'Egor "JotM" Surkov', 'Dr. Mia "MindFlow" Lindqvist', 'Marcus "Boost" Vance',
  'Sarah "Aura" Jenkins', 'Dmitry "CyberSMM" Levin', 'Elena "Viral" Volkova'
];

export function generateStaffMember(role: StaffRole, disciplineId: DisciplineId | 'all' = 'all'): EsportsStaff {
  const info = STAFF_ROLES_INFO[role];
  const name = STAFF_NAMES[Math.floor(Math.random() * STAFF_NAMES.length)];
  const rating = Math.floor(Math.random() * 26) + 70; // 70-95
  const experience = Math.floor(Math.random() * 30) + 65;
  const salary = Math.round((info.baseSalary * (rating / 75)) / 100) * 100;

  return {
    id: `staff_${role}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    name,
    role,
    rating,
    salary,
    experience,
    specialization: `${info.titleRu} Tier ${rating >= 88 ? 'Elite' : rating >= 80 ? 'Pro' : 'Standard'}`,
    assignedDisciplineId: disciplineId,
    bonusEffect: info.bonusEffect,
  };
}
