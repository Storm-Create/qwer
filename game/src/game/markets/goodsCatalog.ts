/**
 * Business Empire: Ultimate
 * Comprehensive 1000+ Commodities Catalog Generator
 * Covers all 21 economic categories with realistic specifications,
 * quality grades, weights, volumes, storage costs, and seasonality.
 */

import { CommodityCategory, CommodityQuality, MarketCommodity } from '../../types/game';

interface CategoryTemplate {
  category: CommodityCategory;
  unit: string;
  defaultVolatility: number;
  seasonalityType: 'summer_peak' | 'winter_peak' | 'autumn_harvest' | 'spring_construction' | 'q4_tech' | 'stable';
  items: Array<{
    baseName: string;
    basePrice: number;
    weight: number;
    volume: number;
    variants: Array<{
      suffix: string;
      priceMultiplier: number;
      quality: CommodityQuality;
      volatilityMultiplier?: number;
    }>;
  }>;
}

// Seasonality curve generator (12 months, 1-indexed January..December)
function generateSeasonality(type: string): number[] {
  switch (type) {
    case 'summer_peak':
      // High in Jun-Aug (months 6, 7, 8)
      return [0.85, 0.88, 0.95, 1.05, 1.15, 1.30, 1.35, 1.25, 1.05, 0.92, 0.85, 0.85];
    case 'winter_peak':
      // High in Nov-Feb (months 11, 12, 1, 2)
      return [1.30, 1.25, 1.05, 0.90, 0.85, 0.80, 0.80, 0.85, 0.95, 1.10, 1.25, 1.35];
    case 'autumn_harvest':
      // Supply glut in autumn => price lower Sep-Nov, higher in spring
      return [1.10, 1.15, 1.20, 1.25, 1.15, 1.05, 1.00, 0.90, 0.80, 0.82, 0.88, 0.98];
    case 'spring_construction':
      // High demand in spring & summer (Apr-Sep)
      return [0.85, 0.88, 1.05, 1.20, 1.30, 1.32, 1.28, 1.25, 1.15, 0.95, 0.88, 0.82];
    case 'q4_tech':
      // High in Nov-Dec holiday shopping & launches
      return [0.92, 0.90, 0.95, 0.96, 0.98, 0.95, 0.94, 0.98, 1.05, 1.12, 1.30, 1.35];
    case 'stable':
    default:
      return [1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0];
  }
}

// Pre-generate 30-day realistic price history using stochastic walk with mean reversion
function generate30DayHistory(basePrice: number, minPrice: number, maxPrice: number, volatility: number, seed: number): number[] {
  const history: number[] = [];
  let price = basePrice * (0.92 + ((seed * 17) % 15) * 0.01);

  // Deterministic pseudo-random sequence for initial boot
  let pseudo = seed + 1;
  const rand = () => {
    pseudo = (pseudo * 9301 + 49297) % 233280;
    return pseudo / 233280;
  };

  for (let i = 0; i < 30; i++) {
    const delta = (rand() - 0.49) * volatility;
    const meanReversion = (basePrice - price) * 0.08;
    price = Math.round(price * (1 + delta) + meanReversion);
    price = Math.max(minPrice, Math.min(maxPrice, price));
    history.push(price);
  }

  return history;
}

const CATEGORY_DEFINITIONS: CategoryTemplate[] = [
  // 1. Продукты (Food)
  {
    category: 'Продукты',
    unit: 'кг',
    defaultVolatility: 0.035,
    seasonalityType: 'autumn_harvest',
    items: [
      {
        baseName: 'Кофе в зернах',
        basePrice: 18,
        weight: 1,
        volume: 0.002,
        variants: [
          { suffix: 'Робуста Эконом (Вьетнам)', priceMultiplier: 0.7, quality: 'Эконом' },
          { suffix: 'Арабика Сантос (Бразилия)', priceMultiplier: 1.0, quality: 'Стандарт' },
          { suffix: 'Супремо Спешелти (Колумбия)', priceMultiplier: 1.6, quality: 'Премиум' },
          { suffix: 'Гейша Органик (Панама)', priceMultiplier: 3.2, quality: 'Люкс' },
        ],
      },
      {
        baseName: 'Чай листовой',
        basePrice: 14,
        weight: 1,
        volume: 0.0025,
        variants: [
          { suffix: 'Черный Цейлон ОП', priceMultiplier: 0.8, quality: 'Стандарт' },
          { suffix: 'Зеленый Сенча (Япония)', priceMultiplier: 1.2, quality: 'Премиум' },
          { suffix: 'Улун Да Хун Пао', priceMultiplier: 2.4, quality: 'Люкс' },
          { suffix: 'Индийский Ассам Оптовый', priceMultiplier: 0.6, quality: 'Эконом' },
        ],
      },
      {
        baseName: 'Шоколад сырьевой',
        basePrice: 9,
        weight: 1,
        volume: 0.0012,
        variants: [
          { suffix: 'Какао-тертое Кот-д’Ивуар', priceMultiplier: 1.0, quality: 'Стандарт' },
          { suffix: 'Какао-масло дезодорированное', priceMultiplier: 1.8, quality: 'Премиум' },
          { suffix: 'Какао-порошок алкализованный', priceMultiplier: 0.75, quality: 'Эконом' },
          { suffix: 'Органические какао-бобы Криолло', priceMultiplier: 2.6, quality: 'Люкс' },
        ],
      },
      {
        baseName: 'Сыр твердый',
        basePrice: 12,
        weight: 1,
        volume: 0.0015,
        variants: [
          { suffix: 'Гауда традиционный 45%', priceMultiplier: 0.8, quality: 'Стандарт' },
          { suffix: 'Пармезан выдержка 24 мес.', priceMultiplier: 2.2, quality: 'Премиум' },
          { suffix: 'Маасдам с пропионовыми культурами', priceMultiplier: 1.1, quality: 'Стандарт' },
          { suffix: 'Чеддер крафтовый зрелый', priceMultiplier: 1.5, quality: 'Премиум' },
        ],
      },
      {
        baseName: 'Мясная продукция охлажденная',
        basePrice: 8,
        weight: 1,
        volume: 0.0018,
        variants: [
          { suffix: 'Свинина вырезка бескостная', priceMultiplier: 0.9, quality: 'Стандарт' },
          { suffix: 'Говядина Рибай Black Angus', priceMultiplier: 3.5, quality: 'Люкс' },
          { suffix: 'Филе грудки цыпленка', priceMultiplier: 0.6, quality: 'Эконом' },
          { suffix: 'Баранина каре зачищенное', priceMultiplier: 2.0, quality: 'Премиум' },
        ],
      },
      {
        baseName: 'Морепродукты глубокой заморозки',
        basePrice: 16,
        weight: 1,
        volume: 0.002,
        variants: [
          { suffix: 'Креветка тигровая 16/20', priceMultiplier: 1.4, quality: 'Премиум' },
          { suffix: 'Филе лосося атлантического Trim C', priceMultiplier: 2.1, quality: 'Премиум' },
          { suffix: 'Минтай филе блочное', priceMultiplier: 0.45, quality: 'Эконом' },
          { suffix: 'Краб камчатский конечности L', priceMultiplier: 5.5, quality: 'Люкс' },
        ],
      },
      {
        baseName: 'Масло растительное рафинированное',
        basePrice: 1.8,
        weight: 1,
        volume: 0.0012,
        variants: [
          { suffix: 'Подсолнечное вымороженное', priceMultiplier: 1.0, quality: 'Стандарт' },
          { suffix: 'Оливковое Extra Virgin PDO', priceMultiplier: 6.2, quality: 'Люкс' },
          { suffix: 'Кукурузное дезодорированное', priceMultiplier: 1.4, quality: 'Стандарт' },
          { suffix: 'Кокосовое холодного отжима', priceMultiplier: 3.8, quality: 'Премиум' },
        ],
      },
      {
        baseName: 'Сахар и подсластители',
        basePrice: 0.9,
        weight: 1,
        volume: 0.0011,
        variants: [
          { suffix: 'Сахар белый свекловичный ГОСТ', priceMultiplier: 1.0, quality: 'Стандарт' },
          { suffix: 'Сахар тростниковый Демерара', priceMultiplier: 2.5, quality: 'Премиум' },
          { suffix: 'Стевия порошок натуральный', priceMultiplier: 18.0, quality: 'Премиум' },
          { suffix: 'Эритрит пищевой', priceMultiplier: 7.0, quality: 'Стандарт' },
        ],
      },
      {
        baseName: 'Орехи и сухофрукты',
        basePrice: 11,
        weight: 1,
        volume: 0.0018,
        variants: [
          { suffix: 'Миндаль калифорнийский Nonpareil', priceMultiplier: 1.3, quality: 'Премиум' },
          { suffix: 'Фундук бланшированный', priceMultiplier: 1.5, quality: 'Премиум' },
          { suffix: 'Арахис бланшированный Бразилия', priceMultiplier: 0.4, quality: 'Эконом' },
          { suffix: 'Фисташки натурального раскрытия', priceMultiplier: 2.4, quality: 'Премиум' },
          { suffix: 'Кешью сырой W320', priceMultiplier: 1.6, quality: 'Премиум' },
        ],
      },
      {
        baseName: 'Специи и пряности',
        basePrice: 22,
        weight: 1,
        volume: 0.002,
        variants: [
          { suffix: 'Перец черный горошек Tellicherry', priceMultiplier: 0.8, quality: 'Стандарт' },
          { suffix: 'Шафран кашмирский высший сорт', priceMultiplier: 120.0, quality: 'Люкс' },
          { suffix: 'Ваниль стручковая Бурбон', priceMultiplier: 25.0, quality: 'Люкс' },
          { suffix: 'Корица цейлонская настоящая C5', priceMultiplier: 1.8, quality: 'Премиум' },
          { suffix: 'Паприка копченая Pimenton', priceMultiplier: 0.7, quality: 'Стандарт' },
        ],
      },
    ],
  },

  // 2. Напитки (Beverages)
  {
    category: 'Напитки',
    unit: 'л',
    defaultVolatility: 0.03,
    seasonalityType: 'summer_peak',
    items: [
      {
        baseName: 'Вода минеральная природная',
        basePrice: 0.8,
        weight: 1,
        volume: 0.0012,
        variants: [
          { suffix: 'Столовая артезианская ПЭТ 1.5л', priceMultiplier: 0.6, quality: 'Эконом' },
          { suffix: 'Лечебно-столовая гидрокарбонатная', priceMultiplier: 1.2, quality: 'Стандарт' },
          { suffix: 'Альпийская ледниковая стекло 0.75л', priceMultiplier: 4.5, quality: 'Премиум' },
          { suffix: 'Вулканическая реликтовая в графинах', priceMultiplier: 9.0, quality: 'Люкс' },
        ],
      },
      {
        baseName: 'Соки прямого отжима',
        basePrice: 2.2,
        weight: 1,
        volume: 0.0013,
        variants: [
          { suffix: 'Яблочный осветленный ТетраПак', priceMultiplier: 0.8, quality: 'Стандарт' },
          { suffix: 'Апельсиновый с мякотью пастеризованный', priceMultiplier: 1.4, quality: 'Премиум' },
          { suffix: 'Гранатовый Азербайджан Premium', priceMultiplier: 2.8, quality: 'Премиум' },
          { suffix: 'Томатный с морской солью', priceMultiplier: 0.9, quality: 'Стандарт' },
        ],
      },
      {
        baseName: 'Энергетические и изотонические напитки',
        basePrice: 2.6,
        weight: 1,
        volume: 0.0014,
        variants: [
          { suffix: 'Таурин + Кофеин 500мл ж/б', priceMultiplier: 1.0, quality: 'Стандарт' },
          { suffix: 'Изотоник с электролитами и BCAA', priceMultiplier: 1.6, quality: 'Премиум' },
          { suffix: 'Органик Матэ Энергетик', priceMultiplier: 2.2, quality: 'Премиум' },
          { suffix: 'Бюджетный гуарана-микс', priceMultiplier: 0.65, quality: 'Эконом' },
        ],
      },
      {
        baseName: 'Вино сухое выдержанное',
        basePrice: 18,
        weight: 1.3,
        volume: 0.002,
        variants: [
          { suffix: 'Каберне Совиньон Бордо AOC', priceMultiplier: 1.5, quality: 'Премиум' },
          { suffix: 'Пино Гриджо Венето DOC', priceMultiplier: 1.0, quality: 'Стандарт' },
          { suffix: 'Гран Крю Баролло выдержка 5 лет', priceMultiplier: 8.5, quality: 'Люкс' },
          { suffix: 'Столовое сухое в bag-in-box', priceMultiplier: 0.4, quality: 'Эконом' },
        ],
      },
      {
        baseName: 'Крафтовое пиво и сидр',
        basePrice: 3.5,
        weight: 1,
        volume: 0.0016,
        variants: [
          { suffix: 'Lager нефильтрованный кег 30л', priceMultiplier: 0.8, quality: 'Стандарт' },
          { suffix: 'Double IPA цитра-хмель', priceMultiplier: 1.8, quality: 'Премиум' },
          { suffix: 'Имперский стаут бочковой выдержки', priceMultiplier: 3.2, quality: 'Люкс' },
          { suffix: 'Сухой яблочный сидр Бретань', priceMultiplier: 1.5, quality: 'Премиум' },
        ],
      },
    ],
  },

  // 3. Одежда (Apparel)
  {
    category: 'Одежда',
    unit: 'шт.',
    defaultVolatility: 0.04,
    seasonalityType: 'winter_peak',
    items: [
      {
        baseName: 'Футболка базовая хлопковая',
        basePrice: 12,
        weight: 0.25,
        volume: 0.001,
        variants: [
          { suffix: 'Плотность 140г Эконом промо', priceMultiplier: 0.5, quality: 'Эконом' },
          { suffix: 'Гребенной хлопок 180г regular fit', priceMultiplier: 1.0, quality: 'Стандарт' },
          { suffix: 'Органический хлопок Pima 220г', priceMultiplier: 2.8, quality: 'Премиум' },
          { suffix: 'Шелковый мерсеризованный трикотаж', priceMultiplier: 6.5, quality: 'Люкс' },
        ],
      },
      {
        baseName: 'Джинсы классические',
        basePrice: 45,
        weight: 0.7,
        volume: 0.003,
        variants: [
          { suffix: 'Селвидж деним 14oz (Япония)', priceMultiplier: 3.8, quality: 'Люкс' },
          { suffix: 'Стрейч деним стандартный крой', priceMultiplier: 1.0, quality: 'Стандарт' },
          { suffix: 'Плотный рабочий деним OEM', priceMultiplier: 0.65, quality: 'OEM' },
          { suffix: 'Винтажная обработка stonewash', priceMultiplier: 1.7, quality: 'Премиум' },
        ],
      },
      {
        baseName: 'Костюм деловой классический',
        basePrice: 180,
        weight: 1.8,
        volume: 0.01,
        variants: [
          { suffix: 'Шерсть Super 100s фабричный', priceMultiplier: 1.0, quality: 'Стандарт' },
          { suffix: 'Шерсть Super 150s полуручной шов', priceMultiplier: 3.2, quality: 'Премиум' },
          { suffix: 'Кашемир + Шелк Bespoke tailoring', priceMultiplier: 9.0, quality: 'Люкс' },
          { suffix: 'Поливискоза эконом-офис', priceMultiplier: 0.45, quality: 'Эконом' },
        ],
      },
      {
        baseName: 'Куртка зимняя утепленная',
        basePrice: 120,
        weight: 1.6,
        volume: 0.02,
        variants: [
          { suffix: 'Синтепон 300г ветрозащита', priceMultiplier: 0.6, quality: 'Стандарт' },
          { suffix: 'Гусиный пух 800FP мембрана 20k', priceMultiplier: 3.4, quality: 'Премиум' },
          { suffix: 'Арктическая парка с мехом койота', priceMultiplier: 7.5, quality: 'Люкс' },
          { suffix: 'Утеплитель Thinsulate городской крой', priceMultiplier: 1.6, quality: 'Стандарт' },
        ],
      },
      {
        baseName: 'Свитер и трикотаж',
        basePrice: 55,
        weight: 0.6,
        volume: 0.004,
        variants: [
          { suffix: 'Мериносовая шерсть 100%', priceMultiplier: 1.6, quality: 'Премиум' },
          { suffix: 'Монгольский кашемир Grade A', priceMultiplier: 4.8, quality: 'Люкс' },
          { suffix: 'Акрил + хлопок жаккард', priceMultiplier: 0.5, quality: 'Эконом' },
          { suffix: 'Альпака тонкорунная пряжа', priceMultiplier: 2.4, quality: 'Премиум' },
        ],
      },
    ],
  },

  // 4. Обувь (Footwear)
  {
    category: 'Обувь',
    unit: 'пара',
    defaultVolatility: 0.038,
    seasonalityType: 'spring_construction',
    items: [
      {
        baseName: 'Кроссовки спортивные',
        basePrice: 75,
        weight: 0.9,
        volume: 0.006,
        variants: [
          { suffix: 'Пеноматериал EVA дышащая сетка', priceMultiplier: 0.7, quality: 'Стандарт' },
          { suffix: 'Карбоновая пластина марафонские', priceMultiplier: 3.2, quality: 'Премиум' },
          { suffix: 'Коллаборация лимитированная серия', priceMultiplier: 6.8, quality: 'Люкс' },
          { suffix: 'OEM Фабричный Китай (HQ)', priceMultiplier: 0.45, quality: 'Китай' },
        ],
      },
      {
        baseName: 'Ботинки кожаные классические',
        basePrice: 110,
        weight: 1.3,
        volume: 0.008,
        variants: [
          { suffix: 'Оксфорды Goodyear Welted телячья кожа', priceMultiplier: 2.8, quality: 'Премиум' },
          { suffix: 'Дерби клеевой метод на каждый день', priceMultiplier: 1.0, quality: 'Стандарт' },
          { suffix: 'Лоферы из кордовской кожи (Shell Cordovan)', priceMultiplier: 7.2, quality: 'Люкс' },
          { suffix: 'Экокожа бюджетный сегмент', priceMultiplier: 0.4, quality: 'Эконом' },
        ],
      },
      {
        baseName: 'Ботинки рабочие защитные',
        basePrice: 65,
        weight: 1.8,
        volume: 0.009,
        variants: [
          { suffix: 'Стальной подносок S3 водостойкие', priceMultiplier: 1.0, quality: 'Промышленный' },
          { suffix: 'Композитный подносок кевларовая стелька', priceMultiplier: 1.7, quality: 'Премиум' },
          { suffix: 'Маслобензостойкие с подошвой Vibram', priceMultiplier: 2.3, quality: 'Премиум' },
          { suffix: 'Базовые ПУ-подошва складские', priceMultiplier: 0.6, quality: 'Стандарт' },
        ],
      },
    ],
  },

  // 5. Электроника (Electronics)
  {
    category: 'Электроника',
    unit: 'шт.',
    defaultVolatility: 0.05,
    seasonalityType: 'q4_tech',
    items: [
      {
        baseName: 'Телевизор 4K / 8K',
        basePrice: 450,
        weight: 16,
        volume: 0.12,
        variants: [
          { suffix: '55" LED 60Hz Smart TV', priceMultiplier: 0.8, quality: 'Стандарт' },
          { suffix: '65" OLED 120Hz Dolby Vision', priceMultiplier: 3.2, quality: 'Премиум' },
          { suffix: '85" Mini-LED 144Hz Quantum Dot', priceMultiplier: 5.5, quality: 'Премиум' },
          { suffix: '98" 8K Micro-LED флагман', priceMultiplier: 18.0, quality: 'Люкс' },
          { suffix: '43" Бюджетный FHD гостиничный', priceMultiplier: 0.45, quality: 'Эконом' },
        ],
      },
      {
        baseName: 'Беспроводные наушники',
        basePrice: 90,
        weight: 0.25,
        volume: 0.001,
        variants: [
          { suffix: 'TWS с активным шумоподавлением ANC', priceMultiplier: 1.6, quality: 'Премиум' },
          { suffix: 'Полноразмерные аудиофильские Hi-Res', priceMultiplier: 4.2, quality: 'Люкс' },
          { suffix: 'Базовые Bluetooth вкладыши', priceMultiplier: 0.35, quality: 'Эконом' },
          { suffix: 'Спортивные костная проводимость IP68', priceMultiplier: 1.4, quality: 'Стандарт' },
        ],
      },
      {
        baseName: 'Игровая консоль и аксессуары',
        basePrice: 420,
        weight: 4.5,
        volume: 0.025,
        variants: [
          { suffix: 'Стационарная 4K 120FPS с приводом', priceMultiplier: 1.2, quality: 'Оригинал' },
          { suffix: 'Портативная OLED гибридная', priceMultiplier: 0.85, quality: 'Оригинал' },
          { suffix: 'Беспроводной геймпад Pro с лепестками', priceMultiplier: 0.35, quality: 'Премиум' },
          { suffix: 'Шлем виртуальной реальности VR 4K', priceMultiplier: 2.1, quality: 'Премиум' },
        ],
      },
      {
        baseName: 'Квадрокоптер профессиональный',
        basePrice: 850,
        weight: 2.2,
        volume: 0.018,
        variants: [
          { suffix: 'Камера 4K 3-осевой подвес дальность 10км', priceMultiplier: 1.0, quality: 'Стандарт' },
          { suffix: 'Сенсор Hasselblad 5.1K тепловизор', priceMultiplier: 3.8, quality: 'Премиум' },
          { suffix: 'Агродрон для распыления 40л', priceMultiplier: 8.5, quality: 'Промышленный' },
          { suffix: 'FPV скоростной дрон для гонок', priceMultiplier: 0.65, quality: 'Стандарт' },
        ],
      },
    ],
  },

  // 6. Смартфоны (Smartphones)
  {
    category: 'Смартфоны',
    unit: 'шт.',
    defaultVolatility: 0.055,
    seasonalityType: 'q4_tech',
    items: [
      {
        baseName: 'Смартфон флагманский',
        basePrice: 900,
        weight: 0.35,
        volume: 0.0008,
        variants: [
          { suffix: 'Pro Max 512GB Titanium (Оригинал)', priceMultiplier: 1.4, quality: 'Оригинал' },
          { suffix: 'Foldable Складной экран 1TB', priceMultiplier: 2.1, quality: 'Люкс' },
          { suffix: 'Global Edition 256GB Snapdragon', priceMultiplier: 1.0, quality: 'Стандарт' },
          { suffix: 'OEM Refurbished Восстановленный Grade A', priceMultiplier: 0.6, quality: 'OEM' },
          { suffix: 'Китайская версия CN ROM Unlocked', priceMultiplier: 0.72, quality: 'Китай' },
        ],
      },
      {
        baseName: 'Смартфон среднебюджетный',
        basePrice: 320,
        weight: 0.32,
        volume: 0.0007,
        variants: [
          { suffix: 'AMOLED 120Hz 108MP камера', priceMultiplier: 1.0, quality: 'Стандарт' },
          { suffix: 'Игровой с кулером и триггерами', priceMultiplier: 1.45, quality: 'Премиум' },
          { suffix: 'Защищенный ударопрочный IP69K', priceMultiplier: 1.25, quality: 'Промышленный' },
          { suffix: 'Китайская копия HQ (MediaTek)', priceMultiplier: 0.45, quality: 'Китай' },
        ],
      },
      {
        baseName: 'Смартфон ультрабюджетный',
        basePrice: 110,
        weight: 0.28,
        volume: 0.0006,
        variants: [
          { suffix: '4G 64GB Базовый корпоративный', priceMultiplier: 1.0, quality: 'Стандарт' },
          { suffix: 'Кнопочный защищенный 4G VoLTE', priceMultiplier: 0.45, quality: 'Эконом' },
          { suffix: 'Партия оптовая без упаковки OEM', priceMultiplier: 0.75, quality: 'OEM' },
        ],
      },
    ],
  },

  // 7. Компьютеры (Computers)
  {
    category: 'Компьютеры',
    unit: 'шт.',
    defaultVolatility: 0.045,
    seasonalityType: 'q4_tech',
    items: [
      {
        baseName: 'Ноутбук рабочий / ультрабук',
        basePrice: 850,
        weight: 1.8,
        volume: 0.006,
        variants: [
          { suffix: '14" IPS Core i5 16GB 512GB', priceMultiplier: 0.9, quality: 'Стандарт' },
          { suffix: '16" OLED Core i9 32GB RTX 4070', priceMultiplier: 2.6, quality: 'Премиум' },
          { suffix: 'Ультрабук магниевый корпус 990г', priceMultiplier: 1.8, quality: 'Премиум' },
          { suffix: 'Корпоративный OEM ноутбук б/у Grade A', priceMultiplier: 0.48, quality: 'OEM' },
          { suffix: 'Китайский клон на Celeron/N100', priceMultiplier: 0.3, quality: 'Китай' },
        ],
      },
      {
        baseName: 'Компьютер игровой в сборе',
        basePrice: 1400,
        weight: 14,
        volume: 0.065,
        variants: [
          { suffix: 'Ryzen 5 / RTX 4060 / 32GB RAM', priceMultiplier: 0.85, quality: 'Стандарт' },
          { suffix: 'Core i7 / RTX 4080 Super / СЖО', priceMultiplier: 2.2, quality: 'Премиум' },
          { suffix: 'Core i9 Extreme / RTX 4090 / Кастом СВО', priceMultiplier: 4.5, quality: 'Люкс' },
          { suffix: 'Бюджетный киберспортивный i3/GTX', priceMultiplier: 0.45, quality: 'Эконом' },
        ],
      },
      {
        baseName: 'Серверная стойка и ноды',
        basePrice: 3800,
        weight: 28,
        volume: 0.15,
        variants: [
          { suffix: '2U Dual Xeon 64-Core 256GB ECC', priceMultiplier: 1.0, quality: 'Промышленный' },
          { suffix: 'AI Server 8x GPU H100 Cluster Node', priceMultiplier: 35.0, quality: 'Люкс' },
          { suffix: 'Storage Server 24-Bay SAS 4U', priceMultiplier: 1.8, quality: 'Промышленный' },
          { suffix: '1U Edge Server OEM Refurbished', priceMultiplier: 0.4, quality: 'OEM' },
        ],
      },
    ],
  },

  // 8. Комплектующие (Components for PCs, phones, tablets, laptops)
  {
    category: 'Комплектующие',
    unit: 'шт.',
    defaultVolatility: 0.065,
    seasonalityType: 'q4_tech',
    items: [
      {
        baseName: 'Процессор (CPU)',
        basePrice: 280,
        weight: 0.1,
        volume: 0.0003,
        variants: [
          { suffix: '8 ядер 16 потоков Box Оригинал', priceMultiplier: 1.0, quality: 'Оригинал' },
          { suffix: '16 ядер 32 потока Флагман Box', priceMultiplier: 2.2, quality: 'Премиум' },
          { suffix: 'Tray OEM партия без кулера', priceMultiplier: 0.82, quality: 'OEM' },
          { suffix: 'Серверный 64-ядерный EPYC', priceMultiplier: 9.5, quality: 'Промышленный' },
          { suffix: 'Инженерный семпл (ES) Китай', priceMultiplier: 0.45, quality: 'Китай' },
        ],
      },
      {
        baseName: 'Видеокарта (GPU)',
        basePrice: 650,
        weight: 1.5,
        volume: 0.005,
        variants: [
          { suffix: '12GB GDDR6X 3-кулерная Оригинал', priceMultiplier: 1.0, quality: 'Оригинал' },
          { suffix: '24GB GDDR6X Топовый чип OC', priceMultiplier: 2.8, quality: 'Люкс' },
          { suffix: 'OEM турбинная для рабочих станций', priceMultiplier: 1.15, quality: 'OEM' },
          { suffix: 'Китайский рефаб после майнинга HQ', priceMultiplier: 0.42, quality: 'Китай' },
          { suffix: 'Мобильный видеочип BGA для пайки', priceMultiplier: 0.6, quality: 'OEM' },
        ],
      },
      {
        baseName: 'Оперативная память (RAM)',
        basePrice: 75,
        weight: 0.08,
        volume: 0.0002,
        variants: [
          { suffix: 'DDR5 32GB (2x16GB) 6000MHz CL30 RGB', priceMultiplier: 1.4, quality: 'Премиум' },
          { suffix: 'DDR4 16GB (2x8GB) 3200MHz Базовая', priceMultiplier: 0.6, quality: 'Стандарт' },
          { suffix: 'Серверная DDR5 64GB ECC Reg', priceMultiplier: 3.2, quality: 'Промышленный' },
          { suffix: 'SODIMM для ноутбуков DDR5 16GB', priceMultiplier: 0.75, quality: 'Оригинал' },
          { suffix: 'Китайские чипы памяти (No-Name PCB)', priceMultiplier: 0.35, quality: 'Китай' },
        ],
      },
      {
        baseName: 'Накопитель NVMe SSD / HDD',
        basePrice: 95,
        weight: 0.15,
        volume: 0.0003,
        variants: [
          { suffix: '2TB PCIe 4.0 7400MB/s с радиатором', priceMultiplier: 1.5, quality: 'Премиум' },
          { suffix: '1TB PCIe 3.0 TLC Оригинал', priceMultiplier: 0.8, quality: 'Оригинал' },
          { suffix: '4TB PCIe 5.0 High-End Extreme', priceMultiplier: 4.2, quality: 'Люкс' },
          { suffix: 'Серверный HDD 20TB Enterprise SAS', priceMultiplier: 3.5, quality: 'Промышленный' },
          { suffix: 'Китайский SSD на чипах QLC без DRAM', priceMultiplier: 0.38, quality: 'Китай' },
        ],
      },
      {
        baseName: 'Дисплейный модуль для смартфонов',
        basePrice: 65,
        weight: 0.12,
        volume: 0.0004,
        variants: [
          { suffix: 'OLED 120Hz Сервисный Оригинал 100%', priceMultiplier: 2.2, quality: 'Оригинал' },
          { suffix: 'OLED Hard GX копия (Китай HQ)', priceMultiplier: 0.9, quality: 'Китай' },
          { suffix: 'TFT/In-Cell бюджетный аналог (Китай)', priceMultiplier: 0.4, quality: 'Эконом' },
          { suffix: 'Переклеенное стекло Original Refurb', priceMultiplier: 1.3, quality: 'OEM' },
        ],
      },
      {
        baseName: 'Материнская плата',
        basePrice: 160,
        weight: 1.4,
        volume: 0.007,
        variants: [
          { suffix: 'Z790 / X670 Wi-Fi 7 Топовая система питания', priceMultiplier: 2.4, quality: 'Премиум' },
          { suffix: 'B650 / B760 Надежный средний класс', priceMultiplier: 1.0, quality: 'Стандарт' },
          { suffix: 'Серверная 2-сокетная материнская плата', priceMultiplier: 4.8, quality: 'Промышленный' },
          { suffix: 'Китайская плата на перепаянном чипсете', priceMultiplier: 0.38, quality: 'Китай' },
        ],
      },
      {
        baseName: 'Аккумуляторная батарея (Li-Ion / Li-Po)',
        basePrice: 22,
        weight: 0.08,
        volume: 0.0002,
        variants: [
          { suffix: 'Оригинал 5000mAh со шлейфом контроллера', priceMultiplier: 1.6, quality: 'Оригинал' },
          { suffix: 'Усиленная емкость +20% (Китай HQ)', priceMultiplier: 0.9, quality: 'Китай' },
          { suffix: 'Ноутбучная батарея 86Wh 4-cell', priceMultiplier: 3.5, quality: 'Оригинал' },
          { suffix: 'Бюджетный элемент 18650 2600mAh упак 10шт', priceMultiplier: 0.7, quality: 'Стандарт' },
        ],
      },
    ],
  },

  // 9. Бытовая техника (Home Appliances)
  {
    category: 'Бытовая техника',
    unit: 'шт.',
    defaultVolatility: 0.035,
    seasonalityType: 'q4_tech',
    items: [
      {
        baseName: 'Холодильник двухкамерный',
        basePrice: 550,
        weight: 75,
        volume: 0.85,
        variants: [
          { suffix: 'Total NoFrost инверторный компрессор', priceMultiplier: 1.0, quality: 'Стандарт' },
          { suffix: 'Side-by-Side 600л с льдогенератором', priceMultiplier: 2.8, quality: 'Премиум' },
          { suffix: 'Встраиваемый с зоной свежести BioFresh', priceMultiplier: 3.6, quality: 'Люкс' },
          { suffix: 'Однокамерный компактный для гостиниц', priceMultiplier: 0.35, quality: 'Эконом' },
        ],
      },
      {
        baseName: 'Стиральная машина автоматическая',
        basePrice: 420,
        weight: 62,
        volume: 0.35,
        variants: [
          { suffix: 'Загрузка 8кг с функцией пара и сушки', priceMultiplier: 1.6, quality: 'Премиум' },
          { suffix: 'Прямой привод 6кг тихий инвертор', priceMultiplier: 1.0, quality: 'Стандарт' },
          { suffix: 'Промышленная прачечная машина 15кг', priceMultiplier: 5.5, quality: 'Промышленный' },
          { suffix: 'Узкая 4кг бюджетная коллекция', priceMultiplier: 0.55, quality: 'Эконом' },
        ],
      },
      {
        baseName: 'Кондиционер / Сплит-система',
        basePrice: 380,
        weight: 35,
        volume: 0.18,
        variants: [
          { suffix: 'Инвертор 9000 BTU обогрев до -20°C', priceMultiplier: 1.0, quality: 'Стандарт' },
          { suffix: 'Мульти-сплит 24000 BTU с ионизатором', priceMultiplier: 2.7, quality: 'Премиум' },
          { suffix: 'Кассетный промышленный для офисов 48k', priceMultiplier: 5.2, quality: 'Промышленный' },
          { suffix: 'On/Off неинверторный базовый', priceMultiplier: 0.6, quality: 'Эконом' },
        ],
      },
      {
        baseName: 'Робот-пылесос с базой самоочистки',
        basePrice: 320,
        weight: 12,
        volume: 0.08,
        variants: [
          { suffix: 'Лидар + влажная уборка вращающимися мопами', priceMultiplier: 1.8, quality: 'Премиум' },
          { suffix: 'Базовый с гироскопом сухая уборка', priceMultiplier: 0.55, quality: 'Стандарт' },
          { suffix: 'AI распознавание препятствий станция полного цикла', priceMultiplier: 3.4, quality: 'Люкс' },
        ],
      },
    ],
  },

  // 10. Мебель (Furniture)
  {
    category: 'Мебель',
    unit: 'шт.',
    defaultVolatility: 0.028,
    seasonalityType: 'spring_construction',
    items: [
      {
        baseName: 'Кресло эргономичное офисное',
        basePrice: 160,
        weight: 18,
        volume: 0.22,
        variants: [
          { suffix: 'Сетчатая анатомическая спинка 3D', priceMultiplier: 1.0, quality: 'Стандарт' },
          { suffix: 'Алюминиевый каркас натуральная кожа', priceMultiplier: 3.8, quality: 'Премиум' },
          { suffix: 'Геймерское ковш с поддержкой поясницы', priceMultiplier: 1.4, quality: 'Стандарт' },
          { suffix: 'Базовое операторское ткань ткань C', priceMultiplier: 0.4, quality: 'Эконом' },
        ],
      },
      {
        baseName: 'Стол рабочий / переговорный',
        basePrice: 220,
        weight: 32,
        volume: 0.28,
        variants: [
          { suffix: 'С электрорегулировкой высоты Dual-Motor', priceMultiplier: 2.2, quality: 'Премиум' },
          { suffix: 'Массив дуба 200см с живым краем (Live Edge)', priceMultiplier: 4.5, quality: 'Люкс' },
          { suffix: 'ЛДСП 25мм металлические опоры', priceMultiplier: 0.75, quality: 'Стандарт' },
          { suffix: 'Стол складной для конференц-залов', priceMultiplier: 0.5, quality: 'Эконом' },
        ],
      },
      {
        baseName: 'Диван модульный',
        basePrice: 650,
        weight: 85,
        volume: 1.4,
        variants: [
          { suffix: 'Независимый пружинный блок шенилл', priceMultiplier: 1.0, quality: 'Стандарт' },
          { suffix: 'Итальянская кожа aniline пух-перо', priceMultiplier: 4.8, quality: 'Люкс' },
          { suffix: 'Трансформер еврокнижка антикоготь', priceMultiplier: 1.3, quality: 'Стандарт' },
          { suffix: 'Офисный 3-местный экокожа', priceMultiplier: 0.6, quality: 'Эконом' },
        ],
      },
    ],
  },

  // 11. Стройматериалы (Construction Materials)
  {
    category: 'Стройматериалы',
    unit: 'т',
    defaultVolatility: 0.042,
    seasonalityType: 'spring_construction',
    items: [
      {
        baseName: 'Цемент портланд ГОСТ',
        basePrice: 95,
        weight: 1000,
        volume: 0.8,
        variants: [
          { suffix: 'М500 Д0 мешки по 50кг', priceMultiplier: 1.0, quality: 'Стандарт' },
          { suffix: 'М600 Высокопрочный для мостов', priceMultiplier: 1.6, quality: 'Промышленный' },
          { suffix: 'Белый декоративный цемент (Турция)', priceMultiplier: 2.4, quality: 'Премиум' },
          { suffix: 'М400 навалом в хопперах', priceMultiplier: 0.78, quality: 'Эконом' },
        ],
      },
      {
        baseName: 'Арматура строительная стальная',
        basePrice: 580,
        weight: 1000,
        volume: 0.15,
        variants: [
          { suffix: 'А500С рифленая d=12мм пруток', priceMultiplier: 1.0, quality: 'Стандарт' },
          { suffix: 'Композитная стеклопластиковая d=8мм', priceMultiplier: 0.85, quality: 'Стандарт' },
          { suffix: 'Ат800 термически упрочненная d=16мм', priceMultiplier: 1.45, quality: 'Промышленный' },
          { suffix: 'Катанка стальная в бухтах d=6.5мм', priceMultiplier: 0.92, quality: 'Стандарт' },
        ],
      },
      {
        baseName: 'Керамическая плитка и керамогранит',
        basePrice: 320,
        weight: 1000,
        volume: 0.6,
        variants: [
          { suffix: 'Ректифицированный 60x120 матовый', priceMultiplier: 1.8, quality: 'Премиум' },
          { suffix: 'Крупноформатный сляб 120x280 (Италия)', priceMultiplier: 6.2, quality: 'Люкс' },
          { suffix: 'Технический керамогранит 30x30 для ТЦ', priceMultiplier: 0.6, quality: 'Промышленный' },
          { suffix: 'Настенная глазурованная 20x30', priceMultiplier: 0.75, quality: 'Стандарт' },
        ],
      },
      {
        baseName: 'Сухие строительные смеси и штукатурка',
        basePrice: 140,
        weight: 1000,
        volume: 0.9,
        variants: [
          { suffix: 'Гипсовая машинного нанесения 30кг', priceMultiplier: 1.0, quality: 'Стандарт' },
          { suffix: 'Плиточный клей C2TE S1 эластичный', priceMultiplier: 2.1, quality: 'Премиум' },
          { suffix: 'Самовыравнивающийся наливной пол', priceMultiplier: 1.5, quality: 'Стандарт' },
          { suffix: 'Пескобетон М300 кладочный', priceMultiplier: 0.55, quality: 'Эконом' },
        ],
      },
    ],
  },

  // 12. Инструменты (Tools)
  {
    category: 'Инструменты',
    unit: 'шт.',
    defaultVolatility: 0.035,
    seasonalityType: 'spring_construction',
    items: [
      {
        baseName: 'Аккумуляторный шуруповерт / дрель',
        basePrice: 110,
        weight: 2.5,
        volume: 0.008,
        variants: [
          { suffix: 'Бесщеточный 18V 65Нм 2x4.0Ah в кейсе', priceMultiplier: 1.0, quality: 'Стандарт' },
          { suffix: 'Heavy Duty 135Нм с металлическим патроном', priceMultiplier: 2.4, quality: 'Премиум' },
          { suffix: 'Ударный гайковерт 1000Нм шиномонтажный', priceMultiplier: 2.8, quality: 'Промышленный' },
          { suffix: 'Бытовой 12V щеточный без доп. АКБ', priceMultiplier: 0.38, quality: 'Эконом' },
        ],
      },
      {
        baseName: 'Лазерный нивелир 3D 360°',
        basePrice: 140,
        weight: 1.8,
        volume: 0.005,
        variants: [
          { suffix: '12 линий зеленый луч корейские диоды', priceMultiplier: 1.0, quality: 'Стандарт' },
          { suffix: '16 линий с пультом и микролифтом', priceMultiplier: 1.7, quality: 'Премиум' },
          { suffix: 'Ротационный геодезический 500м приемник', priceMultiplier: 6.5, quality: 'Промышленный' },
          { suffix: '2 линии красный луч бытовой', priceMultiplier: 0.35, quality: 'Эконом' },
        ],
      },
      {
        baseName: 'Сварочный инвертор полуавтомат MIG/MMA',
        basePrice: 280,
        weight: 14,
        volume: 0.035,
        variants: [
          { suffix: '200A Synergy с газом и порошковой проволокой', priceMultiplier: 1.0, quality: 'Стандарт' },
          { suffix: '300A 380V с импульсным режимом Pulse', priceMultiplier: 3.2, quality: 'Промышленный' },
          { suffix: 'Аппарат аргонодуговой сварки TIG AC/DC для алюминия', priceMultiplier: 4.1, quality: 'Премиум' },
          { suffix: 'Компактный MMA 160A электроды 3мм', priceMultiplier: 0.4, quality: 'Эконом' },
        ],
      },
    ],
  },

  // 13. Автозапчасти (Auto Parts)
  {
    category: 'Автозапчасти',
    unit: 'комплект',
    defaultVolatility: 0.04,
    seasonalityType: 'winter_peak',
    items: [
      {
        baseName: 'Тормозные диски и колодки',
        basePrice: 90,
        weight: 12,
        volume: 0.015,
        variants: [
          { suffix: 'Вентилируемые передние ОЕМ стандарт', priceMultiplier: 1.0, quality: 'Оригинал' },
          { suffix: 'Перфорированные с насечками спорт керамика', priceMultiplier: 3.2, quality: 'Премиум' },
          { suffix: 'Углерод-керамический композитный ротор', priceMultiplier: 18.0, quality: 'Люкс' },
          { suffix: 'Аналог эконом-сегмент (Китай HQ)', priceMultiplier: 0.45, quality: 'Китай' },
        ],
      },
      {
        baseName: 'Амортизаторы подвески',
        basePrice: 70,
        weight: 4.5,
        volume: 0.012,
        variants: [
          { suffix: 'Газомасляные двухтрубные Оригинал', priceMultiplier: 1.0, quality: 'Оригинал' },
          { suffix: 'Спортивные с регулировкой жесткости Coilover', priceMultiplier: 3.8, quality: 'Премиум' },
          { suffix: 'Пневмобаллон стойки в сборе', priceMultiplier: 4.5, quality: 'Люкс' },
          { suffix: 'Масляные стандартные OEM', priceMultiplier: 0.55, quality: 'OEM' },
        ],
      },
      {
        baseName: 'Турбокомпрессор в сборе',
        basePrice: 480,
        weight: 8.5,
        volume: 0.02,
        variants: [
          { suffix: 'Двухканальный Twin-Scroll VNT Оригинал', priceMultiplier: 1.6, quality: 'Оригинал' },
          { suffix: 'Шарикоподшипниковый картридж Garrett', priceMultiplier: 2.8, quality: 'Премиум' },
          { suffix: 'Заводской картридж на замену (Китай HQ)', priceMultiplier: 0.45, quality: 'Китай' },
          { suffix: 'Восстановленный в заводских условиях OEM', priceMultiplier: 0.7, quality: 'OEM' },
        ],
      },
    ],
  },

  // 14. Шины (Tires)
  {
    category: 'Шины',
    unit: 'шт.',
    defaultVolatility: 0.045,
    seasonalityType: 'winter_peak',
    items: [
      {
        baseName: 'Шина легковая R16-R20',
        basePrice: 95,
        weight: 10,
        volume: 0.08,
        variants: [
          { suffix: 'R16 205/55 Летняя энергосберегающая', priceMultiplier: 0.75, quality: 'Стандарт' },
          { suffix: 'R18 225/45 Зимняя шипованная премиум', priceMultiplier: 1.6, quality: 'Премиум' },
          { suffix: 'R20 275/40 Спортивная UHP Run-Flat', priceMultiplier: 3.4, quality: 'Люкс' },
          { suffix: 'R15 185/65 Бюджетный бренд (Китай)', priceMultiplier: 0.45, quality: 'Китай' },
        ],
      },
      {
        baseName: 'Шина грузовая магистральная R22.5',
        basePrice: 340,
        weight: 65,
        volume: 0.35,
        variants: [
          { suffix: '315/80 R22.5 Ведущая ось дальнемагистральная', priceMultiplier: 1.0, quality: 'Стандарт' },
          { suffix: '385/65 R22.5 Прицепная "батон" усиленный корд', priceMultiplier: 1.25, quality: 'Премиум' },
          { suffix: 'Рулевая ось с защитой от аквапланирования', priceMultiplier: 1.15, quality: 'Премиум' },
          { suffix: 'Карьерная крупногабаритная OTR 25"', priceMultiplier: 4.8, quality: 'Промышленный' },
        ],
      },
    ],
  },

  // 15. Масла (Motor oils & Lubricants)
  {
    category: 'Масла',
    unit: 'л',
    defaultVolatility: 0.038,
    seasonalityType: 'winter_peak',
    items: [
      {
        baseName: 'Моторное масло синтетическое',
        basePrice: 9,
        weight: 0.9,
        volume: 0.0011,
        variants: [
          { suffix: '5W-30 Full Synthetic API SP / ILSAC GF-6', priceMultiplier: 1.0, quality: 'Стандарт' },
          { suffix: '0W-20 PAO + Эстеры гоночная рецептура', priceMultiplier: 2.6, quality: 'Премиум' },
          { suffix: '10W-40 Полусинтетика для коммерческого парка', priceMultiplier: 0.6, quality: 'Стандарт' },
          { suffix: 'Бочка 208л 15W-40 Дизель Heavy Duty', priceMultiplier: 0.48, quality: 'Промышленный' },
        ],
      },
      {
        baseName: 'Трансмиссионное масло и спецжидкости',
        basePrice: 12,
        weight: 0.9,
        volume: 0.0011,
        variants: [
          { suffix: 'ATF Dexron VI / Mercon LV для 8-ступенчатых АКПП', priceMultiplier: 1.2, quality: 'Премиум' },
          { suffix: 'CVTF Fluid для вариаторов Оригинал', priceMultiplier: 1.6, quality: 'Оригинал' },
          { suffix: 'Гидравлическое масло HLP-46 бочка', priceMultiplier: 0.45, quality: 'Промышленный' },
          { suffix: 'Тормозная жидкость DOT 5.1 силиконовая', priceMultiplier: 1.4, quality: 'Стандарт' },
        ],
      },
    ],
  },

  // 16. Металлы (Metals)
  {
    category: 'Металлы',
    unit: 'т',
    defaultVolatility: 0.055,
    seasonalityType: 'stable',
    items: [
      {
        baseName: 'Медь катодная Grade A',
        basePrice: 8800,
        weight: 1000,
        volume: 0.11,
        variants: [
          { suffix: 'Чистота 99.99% LME Standard', priceMultiplier: 1.0, quality: 'Промышленный' },
          { suffix: 'Бескислородная медь OFHC для электроники', priceMultiplier: 1.45, quality: 'Премиум' },
          { suffix: 'Медный лом блестяшка очищенный', priceMultiplier: 0.88, quality: 'Эконом' },
        ],
      },
      {
        baseName: 'Алюминий первичный слитки',
        basePrice: 2450,
        weight: 1000,
        volume: 0.37,
        variants: [
          { suffix: 'Сплав А7 чистота 99.7%', priceMultiplier: 1.0, quality: 'Промышленный' },
          { suffix: 'Авиационный дюралюминий Д16Т прутки', priceMultiplier: 2.2, quality: 'Премиум' },
          { suffix: 'Алюминиевый профиль анодированный', priceMultiplier: 1.8, quality: 'Стандарт' },
        ],
      },
      {
        baseName: 'Никель и Титан промышленный',
        basePrice: 16500,
        weight: 1000,
        volume: 0.12,
        variants: [
          { suffix: 'Никель катодный 99.9% для аккумуляторов', priceMultiplier: 1.0, quality: 'Промышленный' },
          { suffix: 'Титан ВТ1-0 / Grade 5 пруток аэрокосмический', priceMultiplier: 2.8, quality: 'Премиум' },
          { suffix: 'Ферроникель гранулированный', priceMultiplier: 0.75, quality: 'Стандарт' },
        ],
      },
      {
        baseName: 'Литий и Кобальт аккумуляторные',
        basePrice: 22000,
        weight: 1000,
        volume: 0.45,
        variants: [
          { suffix: 'Карбонат лития Battery Grade 99.5%', priceMultiplier: 1.0, quality: 'Промышленный' },
          { suffix: 'Гидроксид лития моногидрат', priceMultiplier: 1.25, quality: 'Премиум' },
          { suffix: 'Кобальт металлический катодный', priceMultiplier: 1.6, quality: 'Премиум' },
        ],
      },
      {
        baseName: 'Золото и Серебро мерные слитки (унция)',
        basePrice: 2350,
        weight: 0.031,
        volume: 0.000002,
        variants: [
          { suffix: 'Золото 999.9 проба LBMA Good Delivery (унц.)', priceMultiplier: 1.0, quality: 'Люкс' },
          { suffix: 'Серебро 999 проба килограммовый слиток', priceMultiplier: 0.013, quality: 'Премиум' },
          { suffix: 'Платина банковская 999.5 проба', priceMultiplier: 0.44, quality: 'Люкс' },
        ],
      },
    ],
  },

  // 17. Нефть (Oil & Petroleum)
  {
    category: 'Нефть',
    unit: 'барр.',
    defaultVolatility: 0.065,
    seasonalityType: 'winter_peak',
    items: [
      {
        baseName: 'Сырая нефть маркерных сортов',
        basePrice: 82,
        weight: 135,
        volume: 0.159,
        variants: [
          { suffix: 'Brent Crude легкая малосернистая', priceMultiplier: 1.0, quality: 'Стандарт' },
          { suffix: 'WTI Light Sweet (Техас)', priceMultiplier: 0.96, quality: 'Стандарт' },
          { suffix: 'Urals экспортная смесь', priceMultiplier: 0.85, quality: 'Стандарт' },
          { suffix: 'ESPO Blend трубопроводная премиум', priceMultiplier: 1.04, quality: 'Премиум' },
        ],
      },
      {
        baseName: 'Светлые нефтепродукты',
        basePrice: 115,
        weight: 120,
        volume: 0.159,
        variants: [
          { suffix: 'Дизельное топливо Евро-5 ультра-малосернистое', priceMultiplier: 1.0, quality: 'Промышленный' },
          { suffix: 'Авиационный керосин Jet A-1', priceMultiplier: 1.25, quality: 'Премиум' },
          { suffix: 'Бензин АИ-95 неэтилированный', priceMultiplier: 1.08, quality: 'Стандарт' },
          { suffix: 'Бензин АИ-100 высокооктановый', priceMultiplier: 1.35, quality: 'Премиум' },
        ],
      },
      {
        baseName: 'Темные нефтепродукты и сырье',
        basePrice: 55,
        weight: 150,
        volume: 0.159,
        variants: [
          { suffix: 'Мазут топовой М-100', priceMultiplier: 0.8, quality: 'Промышленный' },
          { suffix: 'Битум нефтяной дорожный БНД', priceMultiplier: 0.95, quality: 'Стандарт' },
          { suffix: 'Кокс нефтяной анодный', priceMultiplier: 1.3, quality: 'Промышленный' },
        ],
      },
    ],
  },

  // 18. Пластик (Plastics & Polymers)
  {
    category: 'Пластик',
    unit: 'т',
    defaultVolatility: 0.045,
    seasonalityType: 'stable',
    items: [
      {
        baseName: 'Полиэтилен гранулированный первичный',
        basePrice: 1250,
        weight: 1000,
        volume: 1.2,
        variants: [
          { suffix: 'ПНД (HDPE) для выдувных канистр и труб', priceMultiplier: 1.0, quality: 'Промышленный' },
          { suffix: 'ПВД (LDPE) пленочные марки', priceMultiplier: 1.08, quality: 'Стандарт' },
          { suffix: 'ЛПЭНП (LLDPE) для стретч-пленки', priceMultiplier: 1.15, quality: 'Стандарт' },
          { suffix: 'Вторичная гранула ПНД рециклинг', priceMultiplier: 0.62, quality: 'Эконом' },
        ],
      },
      {
        baseName: 'Инженерные пластики и полимеры',
        basePrice: 2100,
        weight: 1000,
        volume: 1.0,
        variants: [
          { suffix: 'Полипропилен (PP) литьевой гомополимер', priceMultiplier: 0.7, quality: 'Стандарт' },
          { suffix: 'ABS-пластик ударопрочный для корпусов', priceMultiplier: 1.2, quality: 'Премиум' },
          { suffix: 'Поликарбонат оптический для фар и остекления', priceMultiplier: 2.1, quality: 'Премиум' },
          { suffix: 'Полиамид ПА-66 стеклонаполненный 30%', priceMultiplier: 2.8, quality: 'Промышленный' },
        ],
      },
    ],
  },

  // 19. Древесина (Lumber & Wood)
  {
    category: 'Древесина',
    unit: 'м³',
    defaultVolatility: 0.04,
    seasonalityType: 'spring_construction',
    items: [
      {
        baseName: 'Пиломатериалы хвойных пород',
        basePrice: 180,
        weight: 550,
        volume: 1.0,
        variants: [
          { suffix: 'Доска обрезная сосна ГОСТ 1 сорт камерная сушка', priceMultiplier: 1.0, quality: 'Стандарт' },
          { suffix: 'Брус клееный конструкционный 200x200', priceMultiplier: 2.6, quality: 'Премиум' },
          { suffix: 'Лиственница сибирская палубная доска', priceMultiplier: 2.2, quality: 'Премиум' },
          { suffix: 'Доска 2 сорт естественной влажности', priceMultiplier: 0.65, quality: 'Эконом' },
        ],
      },
      {
        baseName: 'Плитные материалы и фанера',
        basePrice: 260,
        weight: 680,
        volume: 1.0,
        variants: [
          { suffix: 'Фанера березовая ФСФ 18мм ламинированная', priceMultiplier: 1.5, quality: 'Промышленный' },
          { suffix: 'OSB-3 плита влагостойкая 12мм', priceMultiplier: 0.75, quality: 'Стандарт' },
          { suffix: 'МДФ шлифованный плотность 750', priceMultiplier: 0.9, quality: 'Стандарт' },
          { suffix: 'Шпон натурального дуба и ореха', priceMultiplier: 4.8, quality: 'Люкс' },
        ],
      },
    ],
  },

  // 20. Хлопок (Cotton & Textiles)
  {
    category: 'Хлопок',
    unit: 'т',
    defaultVolatility: 0.048,
    seasonalityType: 'autumn_harvest',
    items: [
      {
        baseName: 'Хлопок-волокно первичное',
        basePrice: 1950,
        weight: 1000,
        volume: 1.6,
        variants: [
          { suffix: 'Тонковолокнистый 1 сорт тип 4 (Узбекистан)', priceMultiplier: 1.0, quality: 'Стандарт' },
          { suffix: 'Длинноволокнистый Супима (Supima USA)', priceMultiplier: 2.4, quality: 'Премиум' },
          { suffix: 'Египетский длинноштапельный Giza 45', priceMultiplier: 3.5, quality: 'Люкс' },
          { suffix: 'Хлопок средневолокнистый машинный сбор', priceMultiplier: 0.8, quality: 'Эконом' },
        ],
      },
      {
        baseName: 'Пряжа и хлопчатобумажные полотна',
        basePrice: 3200,
        weight: 1000,
        volume: 1.8,
        variants: [
          { suffix: 'Пряжа гребенная кольцевого прядения Ne 30/1', priceMultiplier: 1.1, quality: 'Стандарт' },
          { suffix: 'Суровое полотно бязь ГОСТ рулоны', priceMultiplier: 0.85, quality: 'Стандарт' },
          { suffix: 'Деним плотный индиго 100% хлопок', priceMultiplier: 1.6, quality: 'Премиум' },
        ],
      },
    ],
  },

  // 21. Зерно (Grains & Agriculture)
  {
    category: 'Зерно',
    unit: 'т',
    defaultVolatility: 0.05,
    seasonalityType: 'autumn_harvest',
    items: [
      {
        baseName: 'Пшеница продовольственная и фуражная',
        basePrice: 220,
        weight: 1000,
        volume: 1.3,
        variants: [
          { suffix: '3 класс протеин 12.5% экспорт FOB', priceMultiplier: 1.0, quality: 'Стандарт' },
          { suffix: 'Твердая пшеница Дурум для пасты (Durum)', priceMultiplier: 1.45, quality: 'Премиум' },
          { suffix: '4 класс протеин 11.5% продовольственная', priceMultiplier: 0.88, quality: 'Стандарт' },
          { suffix: '5 класс фуражная для комбикормов', priceMultiplier: 0.72, quality: 'Эконом' },
        ],
      },
      {
        baseName: 'Масличные и бобовые культуры',
        basePrice: 460,
        weight: 1000,
        volume: 1.4,
        variants: [
          { suffix: 'Семена подсолнечника масличность 48%', priceMultiplier: 0.95, quality: 'Стандарт' },
          { suffix: 'Соя бобы протеин 38% без ГМО', priceMultiplier: 1.25, quality: 'Премиум' },
          { suffix: 'Рапс семена масличные экспортные', priceMultiplier: 1.1, quality: 'Стандарт' },
          { suffix: 'Кукуруза фуражная сухая влажность 14%', priceMultiplier: 0.55, quality: 'Стандарт' },
          { suffix: 'Нут калибр 8+ продовольственный', priceMultiplier: 1.8, quality: 'Премиум' },
        ],
      },
      {
        baseName: 'Рис и крупы',
        basePrice: 580,
        weight: 1000,
        volume: 1.2,
        variants: [
          { suffix: 'Рис Басмати длиннозерный экстра 1121', priceMultiplier: 2.1, quality: 'Премиум' },
          { suffix: 'Рис круглозерный шлифованный ГОСТ', priceMultiplier: 0.85, quality: 'Стандарт' },
          { suffix: 'Гречиха пропаренная ядрица 1 сорт', priceMultiplier: 0.92, quality: 'Стандарт' },
          { suffix: 'Овес голозерный для мюсли и хлопьев', priceMultiplier: 0.65, quality: 'Стандарт' },
        ],
      },
    ],
  },
];

// Additional modifiers to dynamically expand catalog to exactly 1,000+ items
const PACKAGING_MODIFIERS = [
  { name: 'Опт: Паллета', priceFactor: 1.0, weightFactor: 1.0, volFactor: 1.0 },
  { name: 'Контейнер 20ft (FCL)', priceFactor: 0.95, weightFactor: 20.0, volFactor: 20.0 },
  { name: 'Мелкий опт (коробка)', priceFactor: 1.06, weightFactor: 0.1, volFactor: 0.1 },
  { name: 'Фасованная розничная партия', priceFactor: 1.14, weightFactor: 0.05, volFactor: 0.05 },
  { name: 'Экспортный стандарт Euro-Grade', priceFactor: 1.18, weightFactor: 1.0, volFactor: 1.0 },
  { name: 'Трейдерская сборная поставка', priceFactor: 0.98, weightFactor: 5.0, volFactor: 5.0 },
];

/**
 * Builds full catalog of over 1000 uniquely configured commodities
 */
export function buildComprehensiveGoodsCatalog(): MarketCommodity[] {
  const catalog: MarketCommodity[] = [];
  let idCounter = 1;

  for (const catDef of CATEGORY_DEFINITIONS) {
    const seasonality = generateSeasonality(catDef.seasonalityType);

    for (const itemDef of catDef.items) {
      for (const variant of itemDef.variants) {
        // Generate distinct packaging/grade permutations to achieve 1,000+ items
        for (let m = 0; m < PACKAGING_MODIFIERS.length; m++) {
          const mod = PACKAGING_MODIFIERS[m];
          const id = `comm_${catDef.category.toLowerCase().replace(/[^a-z0-9]/g, '')}_${idCounter}`;
          idCounter++;

          const isMainVariant = m === 0;
          const fullName = isMainVariant
            ? `${itemDef.baseName} – ${variant.suffix}`
            : `${itemDef.baseName} – ${variant.suffix} [${mod.name}]`;

          const rawBasePrice = itemDef.basePrice * variant.priceMultiplier * mod.priceFactor;
          // Clean roundings depending on price scale
          let basePrice = rawBasePrice;
          if (basePrice > 100) basePrice = Math.round(basePrice);
          else if (basePrice > 10) basePrice = Math.round(basePrice * 10) / 10;
          else basePrice = Math.round(basePrice * 100) / 100;

          const volatility = Math.min(
            0.15,
            Math.max(
              0.015,
              catDef.defaultVolatility * (variant.volatilityMultiplier || 1.0) * (0.85 + (idCounter % 30) * 0.01)
            )
          );

          const minPrice = Math.max(0.1, Math.round(basePrice * 0.45 * 100) / 100);
          const maxPrice = Math.round(basePrice * 2.35 * 100) / 100;

          // Initial stochastic demand/supply
          const demand = Math.round((0.8 + ((idCounter * 13) % 90) * 0.01) * 100) / 100;
          const supply = Math.round((0.8 + ((idCounter * 29) % 90) * 0.01) * 100) / 100;

          const priceHistory = generate30DayHistory(basePrice, minPrice, maxPrice, volatility, idCounter);
          const currentPrice = priceHistory[priceHistory.length - 1];
          const prevPrice = priceHistory[priceHistory.length - 2] || basePrice;
          const change24h = Math.round(((currentPrice - prevPrice) / prevPrice) * 10000) / 100;
          const trend = Math.round(((currentPrice - priceHistory[0]) / priceHistory[0]) * 100) / 100;

          // Unit weight and volume calculation
          const weight = Math.max(0.01, Math.round(itemDef.weight * mod.weightFactor * 100) / 100);
          const volume = Math.max(0.0001, Math.round(itemDef.volume * mod.volFactor * 10000) / 10000);

          // Daily storage cost depends on volume, weight and sensitivity
          let storageCost = Math.max(0.01, Math.round((volume * 0.2 + weight * 0.001) * 100) / 100);
          if (catDef.category === 'Продукты' || catDef.category === 'Нефть') {
            storageCost = Math.round(storageCost * 1.4 * 100) / 100; // refrigeration or hazmat
          }

          catalog.push({
            id,
            name: fullName,
            category: catDef.category,
            basePrice,
            currentPrice,
            minPrice,
            maxPrice,
            demand,
            supply,
            volatility,
            quality: variant.quality,
            weight,
            volume,
            storageCost,
            seasonality,
            priceHistory,
            unit: catDef.unit,
            trend,
            change24h,
            description: `${itemDef.baseName} (${variant.suffix}). Категория: ${catDef.category}. Спецификация поставки: ${mod.name}.`,
          });
        }
      }
    }
  }

  return catalog;
}
