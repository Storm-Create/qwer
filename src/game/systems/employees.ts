/**
 * Business Empire: Ultimate
 * Human Resources, Staff & Talent Management Subsystem (Foundation)
 */

import { Employee } from '../../types/game';

export interface TalentCandidate {
  id: string;
  name: string;
  role: 'Менеджер филиала' | 'Финансовый аналитик' | 'Логист-диспетчер' | 'Инженер R&D';
  salaryDaily: number;
  skillLevel: number; // 1 to 5
  efficiencyMultiplier: number;
  specialization: string;
}

export const TALENT_MARKET: TalentCandidate[] = [
  {
    id: 'talent_1',
    name: 'Алексей Романов',
    role: 'Менеджер филиала',
    salaryDaily: 120,
    skillLevel: 3,
    efficiencyMultiplier: 1.15,
    specialization: 'Автономное управление розничными точками',
  },
  {
    id: 'talent_2',
    name: 'Екатерина Воронова',
    role: 'Финансовый аналитик',
    salaryDaily: 180,
    skillLevel: 4,
    efficiencyMultiplier: 1.25,
    specialization: 'Оптимизация налогов и инвестиционных портфелей',
  },
  {
    id: 'talent_3',
    name: 'Денис Соколов',
    role: 'Логист-диспетчер',
    salaryDaily: 95,
    skillLevel: 2,
    efficiencyMultiplier: 1.10,
    specialization: 'Ускорение складских операций и маршрутизация',
  },
];

class EmployeesSystem {
  public getTalentMarket(): TalentCandidate[] {
    return TALENT_MARKET;
  }

  public createEmployee(candidate: TalentCandidate, businessId?: string): Employee {
    return {
      id: `emp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: candidate.name,
      role: candidate.role,
      salaryDaily: candidate.salaryDaily,
      skillLevel: candidate.skillLevel,
      efficiencyMultiplier: candidate.efficiencyMultiplier,
      businessId,
    };
  }
}

export const employeesSystem = new EmployeesSystem();
