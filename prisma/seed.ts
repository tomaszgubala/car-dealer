import { PrismaClient, VehicleType, VehicleStatus, Role } from '@prisma/client'
import { randomBytes } from 'crypto'

const prisma = new PrismaClient()

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[ąćęłńóśźż]/g, (c) => ({ ą:'a',ć:'c',ę:'e',ł:'l',ń:'n',ó:'o',ś:'s',ź:'z',ż:'z' }[c] || c))
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function makeSlug(make: string, model: string, year: number, id: string): string {
  return `${slugify(make)}-${slugify(model)}-${year}-${id.slice(-6)}`
}

const vehicles = [
  // NEW cars
  {
    type: VehicleType.NEW, make: 'BMW', model: '5 Series', trim: '520d xDrive',
    year: 2024, mileage: 0, fuel: 'Diesel', gearbox: 'Automatyczna', bodyType: 'Sedan',
    drive: '4x4', powerHP: 197, engineCC: 1995, color: 'Czarny',
    priceGross: 269000, currency: 'PLN', installmentAmount: 2890, installmentTermMonths: 60,
    installmentDownPayment: 53800, location: 'Warszawa',
    descriptionPL: 'Nowy BMW 5 Series w wersji 520d xDrive. Pełne wyposażenie, system Live Cockpit Professional, head-up display, kamera 360°.',
    descriptionEN: 'Brand new BMW 5 Series 520d xDrive. Full equipment, Live Cockpit Professional, head-up display, 360° camera.',
    hasEN: true, features: ['Navigation', 'Leather', 'Panorama', 'HUD', 'Keyless'],
    images: [
      'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800',
      'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800',
    ],
    videos: [], status: VehicleStatus.ACTIVE, promoted: true,
    promotedUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  },
  {
    type: VehicleType.NEW, make: 'Mercedes-Benz', model: 'C-Class', trim: 'C220d AMG Line',
    year: 2024, mileage: 0, fuel: 'Diesel', gearbox: 'Automatyczna', bodyType: 'Sedan',
    drive: 'RWD', powerHP: 200, engineCC: 1993, color: 'Srebrny',
    priceGross: 249000, currency: 'PLN', installmentAmount: 2690, installmentTermMonths: 60,
    installmentDownPayment: 49800, location: 'Warszawa',
    descriptionPL: 'Mercedes-Benz C220d AMG Line. Najnowsza generacja z MBUX, wyświetlacz 11.9", fotele komfortowe z masażem.',
    descriptionEN: null, hasEN: false,
    features: ['MBUX', 'AMG Line', 'Massage Seats', 'LED', 'Ambient Light'],
    images: [
      'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800',
      'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800',
    ],
    videos: [], status: VehicleStatus.ACTIVE, promoted: false,
  },
  {
    type: VehicleType.NEW, make: 'Audi', model: 'A6', trim: '40 TDI S line',
    year: 2024, mileage: 0, fuel: 'Diesel', gearbox: 'Automatyczna', bodyType: 'Sedan',
    drive: 'FWD', powerHP: 204, engineCC: 1968, color: 'Granatowy',
    priceGross: 239000, currency: 'PLN', installmentAmount: 2590, installmentTermMonths: 60,
    installmentDownPayment: 47800, location: 'Kraków',
    descriptionPL: 'Audi A6 40 TDI S line, Virtual Cockpit Plus, Matrix LED, kamera cofania, park assist.',
    descriptionEN: 'New Audi A6 40 TDI S line. Virtual Cockpit Plus, Matrix LED, rear camera, park assist.',
    hasEN: true, features: ['Virtual Cockpit', 'Matrix LED', 'S line', 'Park Assist'],
    images: [
      'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=800',
      'https://images.unsplash.com/photo-1571607388263-1044f9ea01dd?w=800',
    ],
    videos: [], status: VehicleStatus.ACTIVE, promoted: true,
    promotedUntil: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
  },
  {
    type: VehicleType.NEW, make: 'Volkswagen', model: 'Passat', trim: '2.0 TDI Business',
    year: 2024, mileage: 0, fuel: 'Diesel', gearbox: 'Automatyczna', bodyType: 'Kombi',
    drive: 'FWD', powerHP: 150, engineCC: 1968, color: 'Biały',
    priceGross: 179000, currency: 'PLN', installmentAmount: 1990, installmentTermMonths: 48,
    installmentDownPayment: 35800, location: 'Wrocław',
    descriptionPL: 'Nowy VW Passat Business w nadwoziu Kombi. IQ.DRIVE, Digital Cockpit, bezkluczykowy dostęp.',
    descriptionEN: 'New VW Passat Business Estate. IQ.DRIVE, Digital Cockpit, keyless entry.',
    hasEN: true, features: ['IQ.DRIVE', 'Digital Cockpit', 'Keyless', 'ACC'],
    images: [
      'https://images.unsplash.com/photo-1471479917193-f00955256257?w=800',
    ],
    videos: [], status: VehicleStatus.ACTIVE, promoted: false,
  },
  {
    type: VehicleType.NEW, make: 'Toyota', model: 'Camry', trim: '2.5 Hybrid Executive',
    year: 2024, mileage: 0, fuel: 'Hybryda', gearbox: 'CVT', bodyType: 'Sedan',
    drive: 'FWD', powerHP: 218, engineCC: 2487, color: 'Czarny',
    priceGross: 169000, currency: 'PLN', installmentAmount: 1890, installmentTermMonths: 60,
    installmentDownPayment: 33800, location: 'Gdańsk',
    descriptionPL: 'Toyota Camry Hybrid Executive. Certyfikowany dealer Toyota, gwarancja 5 lat.',
    descriptionEN: null, hasEN: false,
    features: ['Hybrid', 'JBL Audio', 'Radar Cruise', 'Lane Assist'],
    images: [
      'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800',
    ],
    videos: [], status: VehicleStatus.ACTIVE, promoted: false,
  },

  // USED cars
  {
    type: VehicleType.USED, make: 'BMW', model: 'X5', trim: 'xDrive30d M Sport',
    year: 2022, mileage: 45000, fuel: 'Diesel', gearbox: 'Automatyczna', bodyType: 'SUV',
    drive: '4x4', powerHP: 298, engineCC: 2993, color: 'Czarny',
    priceGross: 349000, currency: 'PLN', installmentAmount: 3490, installmentTermMonths: 60,
    installmentDownPayment: 69800, location: 'Warszawa',
    descriptionPL: 'BMW X5 xDrive30d M Sport 2022. Stan idealny, serwisowany w ASO BMW. Panorama, HUD, Bowers & Wilkins.',
    descriptionEN: 'BMW X5 xDrive30d M Sport 2022. Perfect condition, BMW authorized service. Panoramic roof, HUD, B&W audio.',
    hasEN: true, features: ['M Sport', 'Panorama', 'HUD', 'B&W Audio', 'Adaptive LED'],
    images: [
      'https://images.unsplash.com/photo-1661956602116-aa6865609028?w=800',
      'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800',
    ],
    videos: ['https://www.youtube.com/watch?v=dQw4w9WgXcQ'],
    status: VehicleStatus.ACTIVE, promoted: true,
    promotedUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  },
  {
    type: VehicleType.USED, make: 'Audi', model: 'Q7', trim: '3.0 TDI quattro',
    year: 2021, mileage: 62000, fuel: 'Diesel', gearbox: 'Automatyczna', bodyType: 'SUV',
    drive: '4x4', powerHP: 231, engineCC: 2967, color: 'Szary',
    priceGross: 289000, currency: 'PLN', installmentAmount: 2990, installmentTermMonths: 60,
    installmentDownPayment: 57800, location: 'Kraków',
    descriptionPL: 'Audi Q7 3.0 TDI quattro 2021. 7 miejsc, Virtual Cockpit, head-up display, kamera 360°.',
    descriptionEN: 'Audi Q7 3.0 TDI quattro 2021. 7 seats, Virtual Cockpit, head-up display, 360° camera.',
    hasEN: true, features: ['7 Seats', 'Virtual Cockpit', 'HUD', '360 Camera', 'Air Suspension'],
    images: [
      'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800',
    ],
    videos: [], status: VehicleStatus.ACTIVE, promoted: false,
  },
  {
    type: VehicleType.USED, make: 'Mercedes-Benz', model: 'GLC', trim: '220d 4MATIC AMG',
    year: 2022, mileage: 38000, fuel: 'Diesel', gearbox: 'Automatyczna', bodyType: 'SUV',
    drive: '4x4', powerHP: 194, engineCC: 1993, color: 'Biały',
    priceGross: 269000, currency: 'PLN', installmentAmount: 2790, installmentTermMonths: 60,
    installmentDownPayment: 53800, location: 'Warszawa',
    descriptionPL: 'Mercedes GLC 220d 4MATIC AMG Line. Bezwypadkowy, jeden właściciel, pełna historia serwisowa.',
    descriptionEN: null, hasEN: false,
    features: ['AMG Line', '4MATIC', 'Burmester Audio', 'Multibeam LED'],
    images: [
      'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800',
    ],
    videos: [], status: VehicleStatus.ACTIVE, promoted: false,
  },
  {
    type: VehicleType.USED, make: 'Skoda', model: 'Octavia', trim: '2.0 TDI Scout',
    year: 2021, mileage: 78000, fuel: 'Diesel', gearbox: 'Automatyczna', bodyType: 'Kombi',
    drive: '4x4', powerHP: 200, engineCC: 1968, color: 'Zielony',
    priceGross: 119000, currency: 'PLN', installmentAmount: 1290, installmentTermMonths: 60,
    installmentDownPayment: 23800, location: 'Wrocław',
    descriptionPL: 'Skoda Octavia Scout 4x4, idealny na długie trasy. Nawigacja Columbus, Canton audio, grzane fotele.',
    descriptionEN: 'Skoda Octavia Scout 4x4. Columbus navigation, Canton audio, heated seats.',
    hasEN: true, features: ['Scout', '4x4', 'Columbus Nav', 'Canton Audio', 'Heated Seats'],
    images: [
      'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=800',
    ],
    videos: [], status: VehicleStatus.ACTIVE, promoted: false,
  },
  {
    type: VehicleType.USED, make: 'Volkswagen', model: 'Golf', trim: '2.0 TSI GTI',
    year: 2022, mileage: 29000, fuel: 'Benzyna', gearbox: 'Automatyczna', bodyType: 'Hatchback',
    drive: 'FWD', powerHP: 245, engineCC: 1984, color: 'Czerwony',
    priceGross: 139000, currency: 'PLN', installmentAmount: 1490, installmentTermMonths: 60,
    installmentDownPayment: 27800, location: 'Gdańsk',
    descriptionPL: 'VW Golf GTI 7. generacji. Jak nowy, serwisowany w ASO. Harman Kardon, head-up display.',
    descriptionEN: 'VW Golf GTI. Like new, authorized service history. Harman Kardon, head-up display.',
    hasEN: true, features: ['GTI', 'Harman Kardon', 'HUD', 'DCC'],
    images: [
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800',
    ],
    videos: [], status: VehicleStatus.ACTIVE, promoted: false,
  },
  {
    type: VehicleType.USED, make: 'Porsche', model: 'Cayenne', trim: 'S E-Hybrid',
    year: 2020, mileage: 55000, fuel: 'Hybryda plug-in', gearbox: 'Automatyczna', bodyType: 'SUV',
    drive: '4x4', powerHP: 462, engineCC: 2995, color: 'Szary',
    priceGross: 419000, currency: 'PLN', installmentAmount: 4290, installmentTermMonths: 60,
    installmentDownPayment: 83800, location: 'Warszawa',
    descriptionPL: 'Porsche Cayenne S E-Hybrid. Sportowy pakiet, koła 21", adaptacyjny zawieszenie pneumatyczne.',
    descriptionEN: 'Porsche Cayenne S E-Hybrid. Sport package, 21" wheels, adaptive air suspension.',
    hasEN: true, features: ['PHEV', 'Air Suspension', 'Sport Chrono', 'BOSE', 'Panorama'],
    images: [
      'https://images.unsplash.com/photo-1635073942028-8f7af1025cd6?w=800',
    ],
    videos: [], status: VehicleStatus.ACTIVE, promoted: true,
    promotedUntil: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
  },
  {
    type: VehicleType.USED, make: 'Volvo', model: 'XC90', trim: 'T8 Recharge Inscription',
    year: 2021, mileage: 48000, fuel: 'Hybryda plug-in', gearbox: 'Automatyczna', bodyType: 'SUV',
    drive: '4x4', powerHP: 390, engineCC: 1969, color: 'Srebrny',
    priceGross: 319000, currency: 'PLN', installmentAmount: 3290, installmentTermMonths: 60,
    installmentDownPayment: 63800, location: 'Kraków',
    descriptionPL: 'Volvo XC90 T8 Recharge. 7-osobowe, Bowers & Wilkins, pilot Assist, air suspension.',
    descriptionEN: 'Volvo XC90 T8 Recharge. 7 seats, B&W audio, Pilot Assist, air suspension.',
    hasEN: true, features: ['7 Seats', 'B&W Audio', 'Pilot Assist', 'Air Suspension', 'PHEV'],
    images: [
      'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?w=800',
    ],
    videos: [], status: VehicleStatus.ACTIVE, promoted: false,
  },
  {
    type: VehicleType.USED, make: 'Ford', model: 'Mustang', trim: '5.0 V8 GT',
    year: 2021, mileage: 32000, fuel: 'Benzyna', gearbox: 'Manualna', bodyType: 'Coupe',
    drive: 'RWD', powerHP: 450, engineCC: 4951, color: 'Niebieski',
    priceGross: 249000, currency: 'PLN', installmentAmount: null,
    location: 'Wrocław',
    descriptionPL: 'Ford Mustang GT 5.0 V8. Import z USA. Magneride, launch control, B&O audio.',
    descriptionEN: 'Ford Mustang GT 5.0 V8. US import. Magneride, launch control, B&O audio.',
    hasEN: true, features: ['V8', 'Magneride', 'Launch Control', 'B&O Audio'],
    images: [
      'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800',
    ],
    videos: [], status: VehicleStatus.ACTIVE, promoted: false,
  },
  {
    type: VehicleType.USED, make: 'Lexus', model: 'RX', trim: '450h F Sport',
    year: 2020, mileage: 67000, fuel: 'Hybryda', gearbox: 'CVT', bodyType: 'SUV',
    drive: '4x4', powerHP: 313, engineCC: 3456, color: 'Czarny',
    priceGross: 229000, currency: 'PLN', installmentAmount: 2390, installmentTermMonths: 60,
    installmentDownPayment: 45800, location: 'Gdańsk',
    descriptionPL: 'Lexus RX 450h F Sport. Marka i niezawodność. Mark Levinson, kamera 360°, napęd hybrydowy.',
    descriptionEN: null, hasEN: false,
    features: ['F Sport', 'Mark Levinson', '360 Camera', 'Adaptive Suspension'],
    images: [
      'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800',
    ],
    videos: [], status: VehicleStatus.ACTIVE, promoted: false,
  },
  {
    type: VehicleType.USED, make: 'Range Rover', model: 'Sport', trim: 'P400e PHEV HSE',
    year: 2021, mileage: 71000, fuel: 'Hybryda plug-in', gearbox: 'Automatyczna', bodyType: 'SUV',
    drive: '4x4', powerHP: 404, engineCC: 1997, color: 'Szary',
    priceGross: 389000, currency: 'PLN', installmentAmount: 3990, installmentTermMonths: 60,
    installmentDownPayment: 77800, location: 'Warszawa',
    descriptionPL: 'Range Rover Sport P400e PHEV. Zawieszenie pneumatyczne, Meridian, panorama, head-up display.',
    descriptionEN: 'Range Rover Sport P400e PHEV. Air suspension, Meridian audio, panoramic roof, HUD.',
    hasEN: true, features: ['Air Suspension', 'Meridian', 'Panorama', 'HUD', 'PHEV'],
    images: [
      'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800',
    ],
    videos: [], status: VehicleStatus.ACTIVE, promoted: false,
  },
  {
    type: VehicleType.USED, make: 'Tesla', model: 'Model 3', trim: 'Long Range AWD',
    year: 2022, mileage: 41000, fuel: 'Elektryczny', gearbox: 'Automatyczna', bodyType: 'Sedan',
    drive: '4x4', powerHP: 480, engineCC: 0, color: 'Biały',
    priceGross: 179000, currency: 'PLN', installmentAmount: 1890, installmentTermMonths: 60,
    installmentDownPayment: 35800, location: 'Kraków',
    descriptionPL: 'Tesla Model 3 Long Range AWD. Autopilot, 580km zasięgu, szybkie ładowanie DC.',
    descriptionEN: 'Tesla Model 3 Long Range AWD. Autopilot, 580km range, fast DC charging.',
    hasEN: true, features: ['Autopilot', 'FSD Hardware', 'Premium Audio', 'Glass Roof'],
    images: [
      'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800',
    ],
    videos: [], status: VehicleStatus.ACTIVE, promoted: false,
  },
  {
    type: VehicleType.USED, make: 'BMW', model: '3 Series', trim: '320d xDrive M Sport',
    year: 2020, mileage: 89000, fuel: 'Diesel', gearbox: 'Automatyczna', bodyType: 'Sedan',
    drive: '4x4', powerHP: 190, engineCC: 1995, color: 'Biały',
    priceGross: 119000, currency: 'PLN', installmentAmount: 1290, installmentTermMonths: 60,
    installmentDownPayment: 23800, location: 'Warszawa',
    descriptionPL: 'BMW 320d xDrive M Sport. Serwisowany w ASO. Nawigacja Live, kamera cofania, pakiet świetlny.',
    descriptionEN: null, hasEN: false,
    features: ['M Sport', 'Live Nav', 'Rear Camera', 'Adaptive LED'],
    images: [
      'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800',
    ],
    videos: [], status: VehicleStatus.RESERVED, promoted: false,
  },
  {
    type: VehicleType.USED, make: 'Hyundai', model: 'Tucson', trim: '1.6 T-GDi PHEV',
    year: 2023, mileage: 15000, fuel: 'Hybryda plug-in', gearbox: 'Automatyczna', bodyType: 'SUV',
    drive: '4x4', powerHP: 265, engineCC: 1598, color: 'Niebieski',
    priceGross: 159000, currency: 'PLN', installmentAmount: 1690, installmentTermMonths: 60,
    installmentDownPayment: 31800, location: 'Gdańsk',
    descriptionPL: 'Hyundai Tucson PHEV prawie nowy. Gwarancja fabryczna, kamera 360°, adaptive cruise.',
    descriptionEN: 'Nearly new Hyundai Tucson PHEV. Factory warranty, 360° camera, adaptive cruise.',
    hasEN: true, features: ['PHEV', '360 Camera', 'ACC', 'Heated Seats', 'Ventilated Seats'],
    images: [
      'https://images.unsplash.com/photo-1571607388263-1044f9ea01dd?w=800',
    ],
    videos: [], status: VehicleStatus.ACTIVE, promoted: false,
  },
  {
    type: VehicleType.USED, make: 'Mazda', model: 'CX-60', trim: 'PHEV Takumi',
    year: 2023, mileage: 8000, fuel: 'Hybryda plug-in', gearbox: 'Automatyczna', bodyType: 'SUV',
    drive: '4x4', powerHP: 327, engineCC: 2488, color: 'Czerwony',
    priceGross: 219000, currency: 'PLN', installmentAmount: 2290, installmentTermMonths: 60,
    installmentDownPayment: 43800, location: 'Wrocław',
    descriptionPL: 'Mazda CX-60 PHEV Takumi. Prawie nowy, najwyższe wyposażenie. Bose, skóra NAPPA, head-up display.',
    descriptionEN: 'Nearly new Mazda CX-60 PHEV Takumi. Top trim. Bose, NAPPA leather, HUD.',
    hasEN: true, features: ['PHEV', 'NAPPA Leather', 'Bose', 'HUD', 'Kinematic Posture Control'],
    images: [
      'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800',
    ],
    videos: [], status: VehicleStatus.ACTIVE, promoted: false,
  },
  {
    type: VehicleType.USED, make: 'Cupra', model: 'Formentor', trim: 'VZ 2.0 TSI 4Drive',
    year: 2022, mileage: 33000, fuel: 'Benzyna', gearbox: 'Automatyczna', bodyType: 'SUV',
    drive: '4x4', powerHP: 310, engineCC: 1984, color: 'Miedziany',
    priceGross: 169000, currency: 'PLN', installmentAmount: 1790, installmentTermMonths: 60,
    installmentDownPayment: 33800, location: 'Kraków',
    descriptionPL: 'Cupra Formentor VZ 310 KM. Wyjątkowy design, Akrapovič exhaust, dynamic chassis control.',
    descriptionEN: 'Cupra Formentor VZ 310hp. Unique design, Akrapovič exhaust, dynamic chassis control.',
    hasEN: true, features: ['VZ Pack', 'Akrapovič', 'DCC', 'Beats Audio'],
    images: [
      'https://images.unsplash.com/photo-1619682817481-e994891cd1f5?w=800',
    ],
    videos: [], status: VehicleStatus.ACTIVE, promoted: false,
  },
  {
    type: VehicleType.USED, make: 'Kia', model: 'EV6', trim: 'GT-Line AWD',
    year: 2022, mileage: 28000, fuel: 'Elektryczny', gearbox: 'Automatyczna', bodyType: 'Crossover',
    drive: '4x4', powerHP: 325, engineCC: 0, color: 'Szary',
    priceGross: 199000, currency: 'PLN', installmentAmount: 2090, installmentTermMonths: 60,
    installmentDownPayment: 39800, location: 'Warszawa',
    descriptionPL: 'Kia EV6 GT-Line AWD. 800V ładowanie, 528km zasięgu, HUD, Meridian audio.',
    descriptionEN: 'Kia EV6 GT-Line AWD. 800V charging, 528km range, HUD, Meridian audio.',
    hasEN: true, features: ['800V Charging', 'GT-Line', 'HUD', 'Meridian', 'V2L'],
    images: [
      'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800',
    ],
    videos: [], status: VehicleStatus.ACTIVE, promoted: false,
  },
]

async function main() {
  console.log('🌱 Seeding database...')

  // Create admin user
  const { hash } = await import('bcryptjs')
  const passwordHash = await hash('Admin1234!', 12)

  await prisma.user.upsert({
    where: { email: 'admin@dealer.pl' },
    update: {},
    create: {
      email: 'admin@dealer.pl',
      name: 'Administrator',
      password: passwordHash,
      role: Role.ADMIN,
    },
  })

  await prisma.user.upsert({
    where: { email: 'editor@dealer.pl' },
    update: {},
    create: {
      email: 'editor@dealer.pl',
      name: 'Edytor',
      password: passwordHash,
      role: Role.EDITOR,
    },
  })

  console.log('✅ Users created')

  // Seed vehicles
  for (let i = 0; i < vehicles.length; i++) {
    const v = vehicles[i]
    const id = randomBytes(6).toString('hex')
    const slug = `${slugify(v.type === 'NEW' ? 'nowe' : 'uzywane')}-${slugify(v.make)}-${slugify(v.model)}-${v.year}-${id}`

    await prisma.vehicle.upsert({
      where: { slug },
      update: {},
      create: {
        slug,
        type: v.type,
        status: v.status,
        source: 'manual',
        make: v.make,
        model: v.model,
        trim: v.trim,
        year: v.year,
        mileage: v.mileage ?? null,
        fuel: v.fuel,
        gearbox: v.gearbox,
        bodyType: v.bodyType,
        drive: v.drive,
        powerHP: v.powerHP,
        engineCC: v.engineCC,
        color: v.color,
        priceGross: v.priceGross,
        currency: v.currency || 'PLN',
        installmentAmount: v.installmentAmount ?? null,
        installmentTermMonths: v.installmentTermMonths ?? null,
        installmentDownPayment: v.installmentDownPayment ?? null,
        location: v.location,
        descriptionPL: v.descriptionPL ?? null,
        descriptionEN: v.descriptionEN ?? null,
        hasEN: v.hasEN,
        features: v.features,
        images: v.images,
        videos: v.videos,
        promoted: v.promoted ?? false,
        promotedUntil: v.promotedUntil ?? null,
        publishedAt: new Date(Date.now() - i * 3600 * 1000),
      },
    })
  }

  console.log(`✅ ${vehicles.length} vehicles seeded`)
  console.log('🎉 Done! Login: admin@dealer.pl / Admin1234!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
