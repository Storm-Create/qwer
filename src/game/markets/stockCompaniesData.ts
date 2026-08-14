/**
 * Business Empire: Ultimate
 * High-Performance 3,000+ Public Companies Dataset & Generator
 */

import { StockCompany, StockSector } from '../../types/stockExchange';

// Curated authentic real-world large-cap & mid-cap companies across all major global sectors
export const REAL_WORLD_TITANS: {
  ticker: string;
  name: string;
  sector: StockSector;
  basePrice: number;
  marketCapBln: number;
  revenueBln: number;
  profitBln: number;
  debtBln: number;
  dividendYield: number;
  volatility: number;
  country: string;
  description: string;
}[] = [
  // Technology
  { ticker: 'AAPL', name: 'Apple Inc.', sector: 'Technology', basePrice: 228.5, marketCapBln: 3450, revenueBln: 385, profitBln: 101, debtBln: 105, dividendYield: 0.0055, volatility: 0.022, country: 'USA', description: 'Мировой лидер потребительской электроники, экосистемы iOS, сервисов и чипов Apple Silicon.' },
  { ticker: 'MSFT', name: 'Microsoft Corp.', sector: 'Technology', basePrice: 420.2, marketCapBln: 3120, revenueBln: 245, profitBln: 88, debtBln: 75, dividendYield: 0.0075, volatility: 0.021, country: 'USA', description: 'Корпоративный софт Windows, облачная инфраструктура Azure и лидер генеративного ИИ OpenAI.' },
  { ticker: 'NVDA', name: 'NVIDIA Corporation', sector: 'Technology', basePrice: 125.8, marketCapBln: 3080, revenueBln: 120, profitBln: 62, debtBln: 11, dividendYield: 0.0015, volatility: 0.045, country: 'USA', description: 'Архитектор графических процессоров и суперкомпьютерных чипов Blackwell для обучения нейросетей.' },
  { ticker: 'GOOGL', name: 'Alphabet Inc.', sector: 'Technology', basePrice: 168.4, marketCapBln: 2100, revenueBln: 320, profitBln: 82, debtBln: 28, dividendYield: 0.0048, volatility: 0.026, country: 'USA', description: 'Поисковый гигант Google, видеохостинг YouTube, облако Google Cloud и семейство моделей Gemini.' },
  { ticker: 'AMZN', name: 'Amazon.com Inc.', sector: 'Technology', basePrice: 184.6, marketCapBln: 1920, revenueBln: 590, profitBln: 38, debtBln: 65, dividendYield: 0.0, volatility: 0.030, country: 'USA', description: 'Крупнейший в мире маркетплейс электронной коммерции и лидер облачных сервисов AWS.' },
  { ticker: 'META', name: 'Meta Platforms Inc.', sector: 'Technology', basePrice: 512.0, marketCapBln: 1300, revenueBln: 155, profitBln: 49, debtBln: 35, dividendYield: 0.004, volatility: 0.035, country: 'USA', description: 'Глобальные социальные сети Facebook, Instagram, WhatsApp и открытые ИИ-модели LLaMA.' },
  { ticker: 'TSM', name: 'Taiwan Semiconductor (TSMC)', sector: 'Technology', basePrice: 172.5, marketCapBln: 890, revenueBln: 78, profitBln: 34, debtBln: 22, dividendYield: 0.014, volatility: 0.032, country: 'Taiwan', description: 'Крупнейший в мире контрактный производитель полупроводниковых микрочипов 3nm/2nm.' },
  { ticker: 'AVGO', name: 'Broadcom Inc.', sector: 'Technology', basePrice: 164.0, marketCapBln: 760, revenueBln: 52, profitBln: 18, debtBln: 72, dividendYield: 0.013, volatility: 0.034, country: 'USA', description: 'Полупроводниковые коммуникационные чипы и корпоративная инфраструктура VMware.' },
  { ticker: 'ORCL', name: 'Oracle Corporation', sector: 'Technology', basePrice: 145.2, marketCapBln: 400, revenueBln: 53, profitBln: 11, debtBln: 86, dividendYield: 0.011, volatility: 0.028, country: 'USA', description: 'СУБД корпоративного уровня и быстрорастущее облако Oracle Cloud Infrastructure.' },
  { ticker: 'ASML', name: 'ASML Holding N.V.', sector: 'Technology', basePrice: 860.0, marketCapBln: 340, revenueBln: 29, profitBln: 8.5, debtBln: 5.2, dividendYield: 0.008, volatility: 0.033, country: 'Netherlands', description: 'Единственный в мире производитель EUV-литографических сканеров для микроэлектроники.' },
  { ticker: 'CRM', name: 'Salesforce Inc.', sector: 'Technology', basePrice: 255.0, marketCapBln: 245, revenueBln: 36, profitBln: 5.2, debtBln: 14, dividendYield: 0.006, volatility: 0.031, country: 'USA', description: 'Глобальный флагман облачных CRM-систем и платформ клиентского взаимодействия.' },
  { ticker: 'AMD', name: 'Advanced Micro Devices', sector: 'Technology', basePrice: 148.5, marketCapBln: 240, revenueBln: 24, profitBln: 2.1, debtBln: 3.5, dividendYield: 0.0, volatility: 0.048, country: 'USA', description: 'Высокопроизводительные процессоры Ryzen, серверные EPYC и ИИ-ускорители Instinct MI300.' },
  { ticker: 'ADBE', name: 'Adobe Inc.', sector: 'Technology', basePrice: 530.0, marketCapBln: 235, revenueBln: 21, profitBln: 5.8, debtBln: 6.1, dividendYield: 0.0, volatility: 0.030, country: 'USA', description: 'Пакет креативных программ Creative Cloud, Photoshop и генеративный ИИ Firefly.' },
  { ticker: 'CSCO', name: 'Cisco Systems Inc.', sector: 'Technology', basePrice: 50.8, marketCapBln: 205, revenueBln: 54, profitBln: 12.5, debtBln: 31, dividendYield: 0.031, volatility: 0.019, country: 'USA', description: 'Мировой стандарт маршрутизаторов, коммутаторов и корпоративной кибербезопасности.' },
  { ticker: 'QCOM', name: 'Qualcomm Inc.', sector: 'Technology', basePrice: 168.0, marketCapBln: 188, revenueBln: 38, profitBln: 9.8, debtBln: 15.5, dividendYield: 0.020, volatility: 0.036, country: 'USA', description: 'Процессоры Snapdragon и беспроводные патенты 5G/6G для мобильной индустрии.' },
  { ticker: 'INTC', name: 'Intel Corporation', sector: 'Technology', basePrice: 22.4, marketCapBln: 96, revenueBln: 54, profitBln: 1.6, debtBln: 49, dividendYield: 0.022, volatility: 0.042, country: 'USA', description: 'Крупнейший американский производитель x86 микропроцессоров и фабрик Foundry.' },

  // Finance
  { ticker: 'JPM', name: 'JPMorgan Chase & Co.', sector: 'Finance', basePrice: 215.0, marketCapBln: 615, revenueBln: 162, profitBln: 50, debtBln: 320, dividendYield: 0.022, volatility: 0.018, country: 'USA', description: 'Крупнейший финансовый конгломерат и инвестиционный банк США под управлением Джейми Даймона.' },
  { ticker: 'V', name: 'Visa Inc.', sector: 'Finance', basePrice: 275.0, marketCapBln: 550, revenueBln: 34, profitBln: 18.2, debtBln: 21, dividendYield: 0.0075, volatility: 0.016, country: 'USA', description: 'Глобальная расчетная сеть электронных платежей с высочайшей маржинальностью бизнеса.' },
  { ticker: 'MA', name: 'Mastercard Inc.', sector: 'Finance', basePrice: 460.0, marketCapBln: 425, revenueBln: 26, profitBln: 12.0, debtBln: 16, dividendYield: 0.006, volatility: 0.017, country: 'USA', description: 'Международная платежная система, объединяющая банки и миллиарды держателей карт.' },
  { ticker: 'BAC', name: 'Bank of America Corp.', sector: 'Finance', basePrice: 39.5, marketCapBln: 310, revenueBln: 101, profitBln: 26.5, debtBln: 280, dividendYield: 0.026, volatility: 0.021, country: 'USA', description: 'Один из крупнейших розничных и корпоративных банков с огромным портфелем депозитов.' },
  { ticker: 'WFC', name: 'Wells Fargo & Company', sector: 'Finance', basePrice: 56.2, marketCapBln: 195, revenueBln: 82, profitBln: 19.1, debtBln: 170, dividendYield: 0.025, volatility: 0.023, country: 'USA', description: 'Ведущий американский ипотечный и коммерческий банк.' },
  { ticker: 'GS', name: 'Goldman Sachs Group', sector: 'Finance', basePrice: 490.0, marketCapBln: 160, revenueBln: 47, profitBln: 10.8, debtBln: 240, dividendYield: 0.024, volatility: 0.024, country: 'USA', description: 'Элитный инвестиционный банк, лидер сделок слияний и поглощений (M&A) и трейдинга.' },
  { ticker: 'MS', name: 'Morgan Stanley', sector: 'Finance', basePrice: 102.5, marketCapBln: 165, revenueBln: 55, profitBln: 10.2, debtBln: 210, dividendYield: 0.033, volatility: 0.022, country: 'USA', description: 'Глобальный управляющий частным капиталом (Wealth Management) и инвестиционный банк.' },
  { ticker: 'BLK', name: 'BlackRock Inc.', sector: 'Finance', basePrice: 875.0, marketCapBln: 130, revenueBln: 19, profitBln: 6.1, debtBln: 11, dividendYield: 0.023, volatility: 0.020, country: 'USA', description: 'Крупнейший в мире инвестиционный управляющий фондами ETF iShares с активами >$10 трлн.' },
  { ticker: 'HSBC', name: 'HSBC Holdings plc', sector: 'Finance', basePrice: 42.0, marketCapBln: 155, revenueBln: 66, profitBln: 23.5, debtBln: 190, dividendYield: 0.072, volatility: 0.020, country: 'UK', description: 'Британско-гонконгский международный финансовый гигант с сильным присутствием в Азии.' },
  { ticker: 'SBER', name: 'Sberbank of Russia', sector: 'Finance', basePrice: 3.1, marketCapBln: 72, revenueBln: 42, profitBln: 16.5, debtBln: 45, dividendYield: 0.115, volatility: 0.035, country: 'Russia', description: 'Доминирующий банк и цифровая экосистема Восточной Европы с высокой отдачей на капитал (ROE >25%).' },

  // Healthcare
  { ticker: 'LLY', name: 'Eli Lilly and Company', sector: 'Healthcare', basePrice: 940.0, marketCapBln: 895, revenueBln: 38, profitBln: 6.8, debtBln: 26, dividendYield: 0.0055, volatility: 0.025, country: 'USA', description: 'Фармацевтический первопроходец, лидер рынка инновационных препаратов от диабета и ожирения.' },
  { ticker: 'UNH', name: 'UnitedHealth Group', sector: 'Healthcare', basePrice: 575.0, marketCapBln: 530, revenueBln: 375, profitBln: 22.5, debtBln: 68, dividendYield: 0.015, volatility: 0.015, country: 'USA', description: 'Крупнейшая страховая медицинская организация США и провайдер сервисов Optum.' },
  { ticker: 'JNJ', name: 'Johnson & Johnson', sector: 'Healthcare', basePrice: 162.0, marketCapBln: 390, revenueBln: 86, profitBln: 18.0, debtBln: 34, dividendYield: 0.030, volatility: 0.012, country: 'USA', description: 'Диверсифицированный медицинский гигант: онкология, иммунология и хирургические роботы.' },
  { ticker: 'NVO', name: 'Novo Nordisk A/S', sector: 'Healthcare', basePrice: 135.0, marketCapBln: 600, revenueBln: 36, profitBln: 13.5, debtBln: 4.8, dividendYield: 0.012, volatility: 0.024, country: 'Denmark', description: 'Датский фармацевтический гигант, создатель препаратов Ozempic и Wegovy.' },
  { ticker: 'ABBV', name: 'AbbVie Inc.', sector: 'Healthcare', basePrice: 195.0, marketCapBln: 345, revenueBln: 55, profitBln: 14.8, debtBln: 62, dividendYield: 0.032, volatility: 0.018, country: 'USA', description: 'Биофармацевтическая компания, разработчик блокбастеров Humira, Skyrizi и Rinvoq.' },
  { ticker: 'MRK', name: 'Merck & Co. Inc.', sector: 'Healthcare', basePrice: 118.0, marketCapBln: 300, revenueBln: 61, profitBln: 14.0, debtBln: 36, dividendYield: 0.026, volatility: 0.016, country: 'USA', description: 'Создатель онкологического препарата Keytruda и вакцин мирового класса.' },
  { ticker: 'PFE', name: 'Pfizer Inc.', sector: 'Healthcare', basePrice: 28.5, marketCapBln: 162, revenueBln: 59, profitBln: 8.5, debtBln: 64, dividendYield: 0.058, volatility: 0.021, country: 'USA', description: 'Международный фармпроизводитель с широким портфелем лекарств и вакцин.' },

  // Energy
  { ticker: 'XOM', name: 'Exxon Mobil Corp.', sector: 'Energy', basePrice: 118.5, marketCapBln: 470, revenueBln: 345, profitBln: 36.0, debtBln: 41, dividendYield: 0.032, volatility: 0.019, country: 'USA', description: 'Крупнейшая энергетическая корпорация Запада с гигантскими месторождениями в Гайане и Пермском бассейне.' },
  { ticker: 'CVX', name: 'Chevron Corporation', sector: 'Energy', basePrice: 146.0, marketCapBln: 270, revenueBln: 200, profitBln: 21.5, debtBln: 23, dividendYield: 0.044, volatility: 0.020, country: 'USA', description: 'Нефтегазовый гигант с интегрированной цепочкой разведки, переработки и экспорта СПГ.' },
  { ticker: 'SHEL', name: 'Shell plc', sector: 'Energy', basePrice: 68.0, marketCapBln: 215, revenueBln: 315, profitBln: 19.5, debtBln: 74, dividendYield: 0.039, volatility: 0.022, country: 'UK', description: 'Англо-голландский энергетический концерн, мировой лидер торговли сжиженным газом (LNG).' },
  { ticker: 'TTE', name: 'TotalEnergies SE', sector: 'Energy', basePrice: 65.0, marketCapBln: 155, revenueBln: 220, profitBln: 21.0, debtBln: 45, dividendYield: 0.048, volatility: 0.021, country: 'France', description: 'Французская мультиэнергетическая компания, активно развивающая солнечные и ветропарки.' },
  { ticker: 'GAZP', name: 'Gazprom PJSC', sector: 'Energy', basePrice: 1.4, marketCapBln: 33, revenueBln: 85, profitBln: 7.2, debtBln: 52, dividendYield: 0.085, volatility: 0.040, country: 'Russia', description: 'Крупнейшие мировые запасы природного газа и разветвленная сеть газопроводов.' },
  { ticker: 'LKOH', name: 'Lukoil PJSC', sector: 'Energy', basePrice: 72.0, marketCapBln: 50, revenueBln: 78, profitBln: 12.0, debtBln: 8.5, dividendYield: 0.135, volatility: 0.030, country: 'Russia', description: 'Высокоэффективная частная нефтяная корпорация с щедрой дивидендной политикой.' },

  // Consumer Discretionary & Retail
  { ticker: 'TSLA', name: 'Tesla Inc.', sector: 'Consumer Discretionary', basePrice: 215.0, marketCapBln: 685, revenueBln: 98, profitBln: 14.5, debtBln: 9.5, dividendYield: 0.0, volatility: 0.055, country: 'USA', description: 'Флагман электромобилей (Model Y, Cybertruck), систем автономного вождения FSD и батарей Megapack.' },
  { ticker: 'HD', name: 'The Home Depot Inc.', sector: 'Consumer Discretionary', basePrice: 375.0, marketCapBln: 370, revenueBln: 153, profitBln: 15.0, debtBln: 44, dividendYield: 0.024, volatility: 0.017, country: 'USA', description: 'Крупнейшая в мире розничная сеть товаров для дома, ремонта и строительства.' },
  { ticker: 'MCD', name: "McDonald's Corporation", sector: 'Consumer Discretionary', basePrice: 290.0, marketCapBln: 208, revenueBln: 26, profitBln: 8.5, debtBln: 38, dividendYield: 0.023, volatility: 0.014, country: 'USA', description: 'Франчайзинговая сеть ресторанов быстрого питания и владелец ценнейшей коммерческой недвижимости.' },
  { ticker: 'NKE', name: 'NIKE Inc.', sector: 'Consumer Discretionary', basePrice: 83.0, marketCapBln: 125, revenueBln: 51, profitBln: 5.7, debtBln: 12, dividendYield: 0.018, volatility: 0.027, country: 'USA', description: 'Мировой бренд спортивной обуви, одежды и инновационной атлетической экипировки.' },
  { ticker: 'SBUX', name: 'Starbucks Corporation', sector: 'Consumer Discretionary', basePrice: 94.0, marketCapBln: 107, revenueBln: 36, profitBln: 4.1, debtBln: 15, dividendYield: 0.024, volatility: 0.023, country: 'USA', description: 'Крупнейшая сеть кофеен премиального обжарочного кофе в 80+ странах мира.' },
  { ticker: 'LVMH', name: 'LVMH Moët Hennessy', sector: 'Consumer Discretionary', basePrice: 670.0, marketCapBln: 335, revenueBln: 92, profitBln: 16.2, debtBln: 38, dividendYield: 0.019, volatility: 0.022, country: 'France', description: 'Мировая империя роскоши: Louis Vuitton, Christian Dior, Tiffany & Co, Hennessy.' },

  // Consumer Staples
  { ticker: 'WMT', name: 'Walmart Inc.', sector: 'Consumer Staples', basePrice: 74.0, marketCapBln: 595, revenueBln: 650, profitBln: 16.5, debtBln: 60, dividendYield: 0.011, volatility: 0.013, country: 'USA', description: 'Крупнейший мировой ритейлер по выручке с тысячами гипермаркетов и растущим e-commerce.' },
  { ticker: 'COST', name: 'Costco Wholesale Corp.', sector: 'Consumer Staples', basePrice: 885.0, marketCapBln: 392, revenueBln: 250, profitBln: 7.4, debtBln: 9, dividendYield: 0.0055, volatility: 0.015, country: 'USA', description: 'Клубные склады мелкооптовой торговли с рекордной лояльностью покупателей.' },
  { ticker: 'PG', name: 'Procter & Gamble Co.', sector: 'Consumer Staples', basePrice: 172.0, marketCapBln: 405, revenueBln: 84, profitBln: 15.0, debtBln: 32, dividendYield: 0.023, volatility: 0.011, country: 'USA', description: 'Дивидендный король потребительских брендов: Pampers, Gillette, Tide, Head & Shoulders.' },
  { ticker: 'KO', name: 'The Coca-Cola Company', sector: 'Consumer Staples', basePrice: 69.5, marketCapBln: 300, revenueBln: 46, profitBln: 10.8, debtBln: 40, dividendYield: 0.028, volatility: 0.011, country: 'USA', description: 'Легендарный производитель напитков с мощнейшей дистрибьюторской сетью на планете.' },
  { ticker: 'PEP', name: 'PepsiCo Inc.', sector: 'Consumer Staples', basePrice: 176.0, marketCapBln: 242, revenueBln: 92, profitBln: 9.1, debtBln: 38, dividendYield: 0.031, volatility: 0.012, country: 'USA', description: 'Продуктовый гигант: напитки Pepsi, чипсы Lay’s, Doritos, соки и снеки Quaker.' },
  { ticker: 'NESN', name: 'Nestlé S.A.', sector: 'Consumer Staples', basePrice: 92.0, marketCapBln: 245, revenueBln: 105, profitBln: 12.0, debtBln: 52, dividendYield: 0.033, volatility: 0.012, country: 'Switzerland', description: 'Швейцарский производитель продуктов питания, кофе Nespresso, детского питания и кормов Purina.' },

  // Industrials & Aerospace
  { ticker: 'CAT', name: 'Caterpillar Inc.', sector: 'Industrials', basePrice: 350.0, marketCapBln: 170, revenueBln: 67, profitBln: 10.3, debtBln: 37, dividendYield: 0.016, volatility: 0.024, country: 'USA', description: 'Мировой флагман тяжелой строительной, горнодобывающей техники и дизельных двигателей.' },
  { ticker: 'GE', name: 'GE Aerospace', sector: 'Industrials', basePrice: 175.0, marketCapBln: 190, revenueBln: 70, profitBln: 9.5, debtBln: 21, dividendYield: 0.006, volatility: 0.025, country: 'USA', description: 'Ведущий мировой разработчик и сервисный оператор авиационных турбореактивных двигателей.' },
  { ticker: 'LMT', name: 'Lockheed Martin Corp.', sector: 'Industrials', basePrice: 560.0, marketCapBln: 135, revenueBln: 68, profitBln: 6.9, debtBln: 20, dividendYield: 0.022, volatility: 0.015, country: 'USA', description: 'Аэрокосмический оборонный гигант, создатель истребителей 5-го поколения F-35 и ракетных систем HIMARS.' },
  { ticker: 'BA', name: 'The Boeing Company', sector: 'Industrials', basePrice: 160.0, marketCapBln: 98, revenueBln: 77, profitBln: 2.2, debtBln: 58, dividendYield: 0.0, volatility: 0.038, country: 'USA', description: 'Крупнейший мировой производитель гражданских лайнеров 737/787 и военной техники.' },
  { ticker: 'SIE', name: 'Siemens AG', sector: 'Industrials', basePrice: 170.0, marketCapBln: 138, revenueBln: 83, profitBln: 9.0, debtBln: 45, dividendYield: 0.028, volatility: 0.022, country: 'Germany', description: 'Немецкий промышленный концерн: цифровая индустрия, автоматизация заводов и скоростные поезда.' },

  // Telecommunications
  { ticker: 'VZ', name: 'Verizon Communications', sector: 'Telecommunications', basePrice: 41.5, marketCapBln: 175, revenueBln: 134, profitBln: 11.6, debtBln: 148, dividendYield: 0.065, volatility: 0.014, country: 'USA', description: 'Крупнейший национальный оператор беспроводной связи и широкополосного интернета США.' },
  { ticker: 'T', name: 'AT&T Inc.', sector: 'Telecommunications', basePrice: 19.8, marketCapBln: 142, revenueBln: 122, profitBln: 14.4, debtBln: 130, dividendYield: 0.056, volatility: 0.015, country: 'USA', description: 'Телекоммуникационная корпорация с обширной волоконно-оптической инфраструктурой 5G.' },
  { ticker: 'TMUS', name: 'T-Mobile US Inc.', sector: 'Telecommunications', basePrice: 198.0, marketCapBln: 230, revenueBln: 79, profitBln: 8.3, debtBln: 72, dividendYield: 0.013, volatility: 0.018, country: 'USA', description: 'Быстрорастущий мобильный провайдер с наибольшим покрытием сетей Ultra Capacity 5G.' },

  // Utilities
  { ticker: 'NEE', name: 'NextEra Energy Inc.', sector: 'Utilities', basePrice: 82.0, marketCapBln: 168, revenueBln: 28, profitBln: 7.3, debtBln: 70, dividendYield: 0.026, volatility: 0.017, country: 'USA', description: 'Крупнейшая в мире электроэнергетическая компания по солнечной и ветрогенерации.' },
  { ticker: 'DUK', name: 'Duke Energy Corp.', sector: 'Utilities', basePrice: 112.0, marketCapBln: 86, revenueBln: 29, profitBln: 4.5, debtBln: 75, dividendYield: 0.037, volatility: 0.012, country: 'USA', description: 'Регулируемая коммунальная корпорация, снабжающая электроэнергией 8+ млн клиентов.' },
  { ticker: 'SO', name: 'The Southern Company', sector: 'Utilities', basePrice: 88.0, marketCapBln: 96, revenueBln: 25, profitBln: 4.1, debtBln: 60, dividendYield: 0.033, volatility: 0.013, country: 'USA', description: 'Энергетический оператор с современными атомными блоками Vogtle 3 & 4.' },

  // Real Estate (REITs)
  { ticker: 'PLD', name: 'Prologis Inc.', sector: 'Real Estate', basePrice: 124.0, marketCapBln: 115, revenueBln: 8.2, profitBln: 3.1, debtBln: 29, dividendYield: 0.031, volatility: 0.019, country: 'USA', description: 'Мировой лидер логистической складской недвижимости для электронной коммерции.' },
  { ticker: 'AMT', name: 'American Tower Corp.', sector: 'Real Estate', basePrice: 220.0, marketCapBln: 102, revenueBln: 11.2, profitBln: 2.8, debtBln: 39, dividendYield: 0.029, volatility: 0.018, country: 'USA', description: 'Владелец и оператор 220,000+ вышек сотовой связи и дата-центров по всему миру.' },
  { ticker: 'O', name: 'Realty Income Corporation', sector: 'Real Estate', basePrice: 62.0, marketCapBln: 54, revenueBln: 4.5, profitBln: 1.1, debtBln: 24, dividendYield: 0.051, volatility: 0.015, country: 'USA', description: '«The Monthly Dividend Company» — траст с 15,000+ коммерческими объектами под аренду.' },

  // Materials & Mining
  { ticker: 'LIN', name: 'Linde plc', sector: 'Materials', basePrice: 465.0, marketCapBln: 220, revenueBln: 33, profitBln: 6.2, debtBln: 18, dividendYield: 0.012, volatility: 0.016, country: 'UK', description: 'Крупнейший в мире производитель технических, медицинских и водородных газов.' },
  { ticker: 'BHP', name: 'BHP Group Limited', sector: 'Materials', basePrice: 56.0, marketCapBln: 142, revenueBln: 54, profitBln: 13.0, debtBln: 14, dividendYield: 0.054, volatility: 0.025, country: 'Australia', description: 'Глобальный горнодобывающий концерн: железная руда, медь, никель и металлургический уголь.' },
  { ticker: 'RIO', name: 'Rio Tinto plc', sector: 'Materials', basePrice: 64.0, marketCapBln: 105, revenueBln: 52, profitBln: 10.1, debtBln: 13, dividendYield: 0.068, volatility: 0.024, country: 'UK', description: 'Международный лидер добычи алюминия, бокситов, меди и литиевых проектов.' },
  { ticker: 'GMKN', name: 'Nornickel PJSC', sector: 'Materials', basePrice: 15.2, marketCapBln: 23, revenueBln: 14, profitBln: 4.2, debtBln: 8.5, dividendYield: 0.080, volatility: 0.032, country: 'Russia', description: 'Мировой лидер по добыче палладия и высокосортного никеля для аккумуляторов.' },
];

const SECTORS: StockSector[] = [
  'Technology',
  'Finance',
  'Healthcare',
  'Energy',
  'Consumer Discretionary',
  'Consumer Staples',
  'Industrials',
  'Telecommunications',
  'Utilities',
  'Real Estate',
  'Materials',
];

const NAME_PREFIXES: Record<StockSector, string[]> = {
  Technology: [
    'Quantum', 'Cyber', 'Apex', 'Nova', 'Synapse', 'Cloud', 'Nexar', 'Aero', 'Vector', 'Silicon',
    'Core', 'Infini', 'Matrix', 'Pulse', 'Byte', 'Hyper', 'Titan', 'Vanguard', 'Omni', 'Stellar',
    'Aether', 'Logic', 'Neuro', 'Prism', 'Orbit', 'Flux', 'Data', 'Altos', 'Helios', 'Krypto',
    'Zenith', 'Chrono', 'Axiom', 'Stratum', 'Vertex', 'Solas', 'Micro', 'Macro', 'Tera', 'Optic'
  ],
  Finance: [
    'First National', 'Global Capital', 'Apex Trust', 'Vanguard Equity', 'Union Merchant', 'Sterling',
    'Beacon Wealth', 'Pacific Crest', 'Atlantic Reserve', 'Highland Bancorp', 'Heritage Financial',
    'Charter Oak', 'Cornerstone Asset', 'Summit Partners', 'Equinox Capital', 'Liberty Holdings',
    'Crown Sovereign', 'Meridian Trust', 'Pioneer Mutual', 'Standard Credit', 'Valiant Bancshares'
  ],
  Healthcare: [
    'BioGenix', 'TheraPulse', 'MedVantage', 'Celesta Labs', 'NeuroHealth', 'ImmunoCore', 'Vitalis',
    'PharmaSys', 'GeneCraft', 'OmniCare Bio', 'SynthoMed', 'Apex Therapeutics', 'Novalis Biotech',
    'Healixa', 'CarePoint Health', 'Aegis Medical', 'Aura Genomics', 'Kura Oncology', 'Elysium Bio'
  ],
  Energy: [
    'Pacific Oil & Gas', 'Nordic Petroleum', 'Apex Energy', 'Solaris Green', 'Vortex Clean Fuels',
    'TransGlobal LNG', 'Helios Renewables', 'Permian Resource', 'TerraVolt Power', 'Arctic Drill Corp',
    'Equator Energy', 'HydroGen Global', 'Strata Fuels', 'VoltPeak Grid', 'Echo Basin Energy'
  ],
  'Consumer Discretionary': [
    'Velox Auto', 'Lumina Luxury', 'Urban Outfitters Global', 'Nova Apparel', 'Monarch Resorts',
    'Prestige Motors', 'AeroSpeed Vehicles', 'Moda Elegance', 'Summit Entertainment', 'Aura Retail',
    'Zenith Lifestyle', 'Crux Activewear', 'Veloce Footwear', 'Palacio Hotels', 'Eclipse Media'
  ],
  'Consumer Staples': [
    'GreenHarvest Foods', 'PureVita Organics', 'Nordic Beverage', 'Continental Dairy', 'AgriPure',
    'VitalBake Global', 'EverClean Household', 'Sunrise Milling', 'Pacific Fishery', 'Orchard Valley',
    'BioNutrition', 'Grand Feast Foods', 'Starlight Brewery', 'Crown Mills', 'Nectarine Drinks'
  ],
  Industrials: [
    'Apex Heavy Dynamics', 'Vanguard Aerospace', 'Titan Machine Works', 'Atlas Robotics', 'ForgeMaster',
    'Pacific Rail Logistics', 'Nordic Maritime Shipyards', 'AeroTurbine Systems', 'Vulcan Defense Corp',
    'TerraForge Steel', 'Modular Industrial', 'Hydra Hydraulics', 'Vector Transport', 'Kinetix Tools'
  ],
  Telecommunications: [
    'SatLink Global', 'FiberWave Networks', 'AeroNet Telecom', 'OmniBeam 5G', 'TransTel Communications',
    'Vanguard Satellite', 'Apex Broadband', 'Horizon Mobile', 'SkyPort Communications', 'PulseWave'
  ],
  Utilities: [
    'MetroGrid Electric', 'Pacific Clean Water', 'Nordic Hydro Power', 'Atlas Gas Distro', 'SolarPeak Utility',
    'ThermalFlow Energy', 'Central Basin Water', 'Highland Wind Grid', 'TerraVolt Power', 'NuGrid Atomic'
  ],
  'Real Estate': [
    'Skyline Tower REIT', 'Apex Industrial Parks', 'Colonial Commercial Trust', 'Harborview Residential',
    'LogisPoint Warehouses', 'Metropolitan Retail Trust', 'Beacon Medical REIT', 'Keystone Land Partners',
    'Summit Lodging Trust', 'Highland Estates REIT', 'Equinox Office Holdings'
  ],
  Materials: [
    'Apex Minerals', 'Titan Copper Corp', 'Nordic Lithium Group', 'Pacific Rare Earths', 'TerraGold Mines',
    'AlloyMaster Metals', 'Global Chemical Systems', 'PolymerTech Corp', 'Silica Core Materials', 'Vanguard Steel'
  ],
};

const NAME_SUFFIXES: Record<StockSector, string[]> = {
  Technology: ['Systems', 'Technologies', 'Networks', 'Software', 'Computing', 'Innovations', 'Labs', 'Digital', 'Platforms', 'Robotics'],
  Finance: ['Bancorp', 'Holdings', 'Capital', 'Financial Group', 'Asset Management', 'Trust', 'Securities', 'Partners', 'Investment Corp'],
  Healthcare: ['Therapeutics', 'Biotech', 'Pharmaceuticals', 'Biosciences', 'Medical Devices', 'Healthcare Corp', 'Genomics', 'Lifesciences'],
  Energy: ['Energy', 'Resources', 'Petroleum', 'Power Corp', 'Renewables', 'Exploration', 'Clean Fuels', 'Gas & Electric'],
  'Consumer Discretionary': ['Brands', 'Luxury Group', 'Motors', 'Entertainment', 'Retail Group', 'Lifestyle', 'Hotels & Resorts'],
  'Consumer Staples': ['Foods', 'Consumer Products', 'Beverages', 'Nutrition', 'Agri-Corp', 'Brands International', 'Mills'],
  Industrials: ['Dynamics', 'Aerospace', 'Manufacturing', 'Logistics', 'Industries', 'Engineering', 'Robotics Corp', 'Shipbuilding'],
  Telecommunications: ['Telecom', 'Networks', 'Communications', 'Wireless', 'Broadband Group', 'Satellite Systems'],
  Utilities: ['Energy Group', 'Utility Corp', 'Power & Light', 'Water Resources', 'Grid Systems', 'Infrastructure Partners'],
  'Real Estate': ['REIT', 'Properties Group', 'Real Estate Trust', 'Land Corp', 'Asset Trust', 'Development Partners'],
  Materials: ['Materials Corp', 'Mining Group', 'Chemicals', 'Metals & Mining', 'Resources', 'Alloys International', 'Specialty Chemicals'],
};

// Seeded pseudo-random generator for consistent, high-speed generation of 3,000+ items
class FastPRNG {
  private seed: number;
  constructor(seed = 133742) {
    this.seed = seed;
  }
  public next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }
}

/**
 * Builds the complete 3,000+ public company directory
 */
export function generateStockMarketDirectory(): StockCompany[] {
  const list: StockCompany[] = [];
  const tickerSet = new Set<string>();

  // 1. First add curated real-world global titans (~60 giants)
  for (const item of REAL_WORLD_TITANS) {
    tickerSet.add(item.ticker);

    const price = item.basePrice;
    const priceHistory: number[] = [];
    let histPrice = price * 0.92;
    for (let i = 0; i < 30; i++) {
      const dailyDrift = 1 + (Math.sin(i * 0.4) * 0.015 + (Math.random() - 0.48) * item.volatility * 2);
      histPrice = Math.max(1, Math.round(histPrice * dailyDrift * 100) / 100);
      priceHistory.push(histPrice);
    }
    priceHistory[priceHistory.length - 1] = price;

    const sharesOutstanding = Math.round((item.marketCapBln * 1_000_000_000) / price);
    const eps = Math.round(((item.profitBln * 1_000_000_000) / sharesOutstanding) * 100) / 100;
    const peRatio = eps > 0 ? Math.round((price / eps) * 10) / 10 : 25;
    const pbRatio = Math.round((price / (price * 0.25)) * 10) / 10;
    const change24h = Math.round((price - (priceHistory[priceHistory.length - 2] || price * 0.99)) * 100) / 100;
    const change24hPercent = Math.round(((change24h / (price - change24h || 1)) * 100) * 100) / 100;

    list.push({
      ticker: item.ticker,
      name: item.name,
      sector: item.sector,
      price,
      previousPrice: price - change24h,
      priceHistory,
      marketCap: item.marketCapBln * 1_000_000_000,
      revenue: item.revenueBln * 1_000_000_000,
      profit: item.profitBln * 1_000_000_000,
      debt: item.debtBln * 1_000_000_000,
      dividend: Math.round(price * item.dividendYield * 100) / 100,
      dividendYield: item.dividendYield,
      volatility: item.volatility,
      sharesOutstanding,
      peRatio,
      pbRatio,
      eps,
      change24h,
      change24hPercent,
      dayLow: Math.round(price * (1 - item.volatility * 1.2) * 100) / 100,
      dayHigh: Math.round(price * (1 + item.volatility * 1.4) * 100) / 100,
      week52Low: Math.round(price * 0.72 * 100) / 100,
      week52High: Math.round(price * 1.35 * 100) / 100,
      volume: Math.round(sharesOutstanding * (0.005 + item.volatility * 0.08)),
      aiCompetitorHoldings: Math.round(sharesOutstanding * 0.12),
      investorSentiment: 0.25,
      country: item.country,
      description: item.description,
    });
  }

  // 2. Algorithmically generate realistic mid-caps, large-caps and growth companies to reach 3,000+
  const rng = new FastPRNG(987654);
  const TARGET_COUNT = 3050;
  let id = 1;

  while (list.length < TARGET_COUNT) {
    const sector = SECTORS[Math.floor(rng.next() * SECTORS.length)];
    const prefixes = NAME_PREFIXES[sector];
    const suffixes = NAME_SUFFIXES[sector];

    const p = prefixes[Math.floor(rng.next() * prefixes.length)];
    const s = suffixes[Math.floor(rng.next() * suffixes.length)];
    
    // Generate unique 3-4 letter ticker
    let tickerCandidate = '';
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const tickerLength = rng.next() > 0.6 ? 4 : 3;
    
    for (let k = 0; k < tickerLength; k++) {
      tickerCandidate += letters[Math.floor(rng.next() * letters.length)];
    }

    if (tickerSet.has(tickerCandidate)) {
      tickerCandidate = `${tickerCandidate.slice(0, 3)}${id % 10}`;
    }
    if (tickerSet.has(tickerCandidate)) {
      id++;
      continue;
    }
    tickerSet.add(tickerCandidate);

    const name = `${p} ${s}`;
    
    // Market cap tiers: Mega (5%), Large (25%), Mid (50%), Small (20%)
    const capTierRoll = rng.next();
    let marketCapMln = 0;
    let basePrice = 0;

    if (capTierRoll > 0.95) {
      // Mega Cap ($100B - $500B)
      marketCapMln = 100_000 + Math.round(rng.next() * 400_000);
      basePrice = 120 + Math.round(rng.next() * 500 * 10) / 10;
    } else if (capTierRoll > 0.70) {
      // Large Cap ($10B - $100B)
      marketCapMln = 10_000 + Math.round(rng.next() * 90_000);
      basePrice = 45 + Math.round(rng.next() * 250 * 10) / 10;
    } else if (capTierRoll > 0.20) {
      // Mid Cap ($2B - $10B)
      marketCapMln = 2_000 + Math.round(rng.next() * 8_000);
      basePrice = 18 + Math.round(rng.next() * 120 * 10) / 10;
    } else {
      // Small Cap ($300M - $2B)
      marketCapMln = 300 + Math.round(rng.next() * 1_700);
      basePrice = 5 + Math.round(rng.next() * 45 * 10) / 10;
    }

    // Sector-based financial profile
    let profitMargin = 0.10;
    let debtRatio = 0.40;
    let dividendYield = 0.015;
    let volatility = 0.025;

    switch (sector) {
      case 'Technology':
        profitMargin = 0.18 + rng.next() * 0.15;
        debtRatio = 0.15 + rng.next() * 0.25;
        dividendYield = rng.next() > 0.5 ? (rng.next() * 0.012) : 0;
        volatility = 0.030 + rng.next() * 0.035;
        break;
      case 'Finance':
        profitMargin = 0.22 + rng.next() * 0.12;
        debtRatio = 0.60 + rng.next() * 0.30;
        dividendYield = 0.022 + rng.next() * 0.035;
        volatility = 0.018 + rng.next() * 0.020;
        break;
      case 'Healthcare':
        profitMargin = 0.14 + rng.next() * 0.14;
        debtRatio = 0.25 + rng.next() * 0.30;
        dividendYield = 0.010 + rng.next() * 0.025;
        volatility = 0.022 + rng.next() * 0.025;
        break;
      case 'Energy':
        profitMargin = 0.12 + rng.next() * 0.16;
        debtRatio = 0.30 + rng.next() * 0.35;
        dividendYield = 0.035 + rng.next() * 0.045;
        volatility = 0.025 + rng.next() * 0.030;
        break;
      case 'Consumer Staples':
        profitMargin = 0.08 + rng.next() * 0.08;
        debtRatio = 0.35 + rng.next() * 0.25;
        dividendYield = 0.025 + rng.next() * 0.025;
        volatility = 0.012 + rng.next() * 0.015;
        break;
      case 'Utilities':
        profitMargin = 0.12 + rng.next() * 0.08;
        debtRatio = 0.65 + rng.next() * 0.25;
        dividendYield = 0.035 + rng.next() * 0.030;
        volatility = 0.012 + rng.next() * 0.014;
        break;
      case 'Real Estate':
        profitMargin = 0.25 + rng.next() * 0.15;
        debtRatio = 0.50 + rng.next() * 0.30;
        dividendYield = 0.040 + rng.next() * 0.040;
        volatility = 0.016 + rng.next() * 0.018;
        break;
      case 'Materials':
        profitMargin = 0.12 + rng.next() * 0.12;
        debtRatio = 0.30 + rng.next() * 0.30;
        dividendYield = 0.028 + rng.next() * 0.035;
        volatility = 0.026 + rng.next() * 0.028;
        break;
      default:
        profitMargin = 0.10 + rng.next() * 0.10;
        debtRatio = 0.40 + rng.next() * 0.25;
        dividendYield = 0.018 + rng.next() * 0.025;
        volatility = 0.022 + rng.next() * 0.022;
        break;
    }

    const marketCap = marketCapMln * 1_000_000;
    const revenue = Math.round(marketCap * (0.4 + rng.next() * 1.2));
    const profit = Math.round(revenue * profitMargin);
    const debt = Math.round(marketCap * debtRatio);
    const sharesOutstanding = Math.round(marketCap / basePrice);
    const eps = Math.round((profit / sharesOutstanding) * 100) / 100;
    const peRatio = eps > 0 ? Math.round((basePrice / eps) * 10) / 10 : 20.0;
    const pbRatio = Math.round((1.2 + rng.next() * 5.0) * 10) / 10;
    const dividend = Math.round(basePrice * dividendYield * 100) / 100;

    // Price history
    const priceHistory: number[] = [];
    let pIter = basePrice * (0.90 + rng.next() * 0.20);
    for (let h = 0; h < 30; h++) {
      const step = 1 + (Math.sin((h + id) * 0.3) * 0.012 + (rng.next() - 0.49) * volatility * 2);
      pIter = Math.max(1, Math.round(pIter * step * 100) / 100);
      priceHistory.push(pIter);
    }
    priceHistory[priceHistory.length - 1] = basePrice;

    const change24h = Math.round((basePrice - (priceHistory[priceHistory.length - 2] || basePrice * 0.99)) * 100) / 100;
    const change24hPercent = Math.round(((change24h / (basePrice - change24h || 1)) * 100) * 100) / 100;

    list.push({
      ticker: tickerCandidate,
      name,
      sector,
      price: basePrice,
      previousPrice: basePrice - change24h,
      priceHistory,
      marketCap,
      revenue,
      profit,
      debt,
      dividend,
      dividendYield: Math.round(dividendYield * 1000) / 1000,
      volatility: Math.round(volatility * 1000) / 1000,
      sharesOutstanding,
      peRatio,
      pbRatio,
      eps,
      change24h,
      change24hPercent,
      dayLow: Math.round(basePrice * (1 - volatility * 1.3) * 100) / 100,
      dayHigh: Math.round(basePrice * (1 + volatility * 1.3) * 100) / 100,
      week52Low: Math.round(basePrice * 0.68 * 100) / 100,
      week52High: Math.round(basePrice * 1.42 * 100) / 100,
      volume: Math.round(sharesOutstanding * (0.003 + rng.next() * 0.02)),
      aiCompetitorHoldings: Math.round(sharesOutstanding * (0.05 + rng.next() * 0.15)),
      investorSentiment: Math.round((rng.next() * 2 - 1) * 100) / 100,
      country: rng.next() > 0.3 ? 'USA' : rng.next() > 0.5 ? 'Europe' : 'Asia',
    });

    id++;
  }

  return list;
}
