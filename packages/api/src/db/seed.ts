import Database from 'better-sqlite3';
import { v4 as uuid } from 'uuid';

export function seedDatabase(db: Database.Database): void {
  const insertPart = db.prepare(`
    INSERT INTO parts (id, part_number, name, category, description, manufacturer, application_domain, specifications, oem_numbers, search_text)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const insertVehicle = db.prepare(`
    INSERT INTO vehicles (id, make, model, year_from, year_to, engine_type, engine_code, category)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const insertCompat = db.prepare(`
    INSERT INTO compatibility (id, part_id, vehicle_id, notes) VALUES (?, ?, ?, ?)
  `);
  const insertFts = db.prepare(`
    INSERT INTO parts_fts (id, part_number, name, category, description, manufacturer, search_text)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const parts = [
    { id: uuid(), part_number: 'SK-BR-001', name: 'S-Cam Brake Shoe Kit', category: 'Brakes', description: 'Heavy duty S-cam brake shoe kit for commercial trucks and trailers, includes 4 shoes with hardware', manufacturer: 'Bendix', application_domain: 'truck/trailer', specifications: JSON.stringify({ width: '410mm', lining_thickness: '16mm', brake_type: 'S-cam drum', axle_type: 'steer/drive' }), oem_numbers: JSON.stringify(['BEN-SK410', 'MRL-4707Q', 'WB-BS410']) },
    { id: uuid(), part_number: 'ALT-24V-001', name: '24V Alternator 100A', category: 'Electrical', description: '24 volt 100 amp alternator for heavy commercial vehicles, Bosch-style mounting', manufacturer: 'Valeo', application_domain: 'truck', specifications: JSON.stringify({ voltage: '24V', amperage: '100A', mounting: 'Bosch B+ style', rotation: 'clockwise', weight: '6.8kg' }), oem_numbers: JSON.stringify(['VAL-TAR206', 'BOC-0124555020', 'HC-PARTS-CA700']) },
    { id: uuid(), part_number: 'TURBO-K27-001', name: 'Turbocharger K27 Series', category: 'Engine', description: 'K27 turbocharger for MAN/Mercedes diesel engines, with wastegate actuator', manufacturer: 'BorgWarner', application_domain: 'truck', specifications: JSON.stringify({ type: 'K27', inlet_diameter: '65mm', outlet_diameter: '55mm', max_boost: '1.8bar', oil_feed: 'M12x1.5' }), oem_numbers: JSON.stringify(['BW-53279706200', 'MAN-51.09100-7597', 'MB-9060960299']) },
    { id: uuid(), part_number: 'ABS-SEN-001', name: 'ABS Wheel Speed Sensor', category: 'Brakes', description: 'Active ABS wheel speed sensor for trailer axle, 2-pin connector', manufacturer: 'Wabco', application_domain: 'trailer', specifications: JSON.stringify({ type: 'active', voltage: '12-24V', connector: '2-pin DIN', cable_length: '2.5m', thread: 'M22x1.5' }), oem_numbers: JSON.stringify(['WABCO-4410328102', 'KNO-K037024', 'HAL-BX1E004-11B1']) },
    { id: uuid(), part_number: 'AIR-DRY-001', name: 'Air Dryer AD-IS', category: 'Air System', description: 'Integrated air dryer with pressure regulator for truck air brake systems', manufacturer: 'Wabco', application_domain: 'truck', specifications: JSON.stringify({ type: 'AD-IS', max_pressure: '13.5bar', port_size: 'M22x1.5', regeneration: 'automatic', voltage: '12/24V compatible' }), oem_numbers: JSON.stringify(['WABCO-4324102020', 'KNO-K128400N00', 'BPW-09.389.18.86.0']) },
    { id: uuid(), part_number: 'CLUTCH-KIT-001', name: 'Clutch Kit 430mm', category: 'Drivetrain', description: 'Heavy duty clutch kit for trucks, 430mm friction plate with pressure plate and release bearing', manufacturer: 'Sachs', category2: 'Drivetrain', application_domain: 'truck', specifications: JSON.stringify({ diameter: '430mm', splines: '10', disc_thickness: '8.5mm', spring_type: 'diaphragm', max_torque: '2800Nm' }), oem_numbers: JSON.stringify(['SACHS-3400-700-456', 'LUK-643-3476-00', 'VF-821-0214']) },
    { id: uuid(), part_number: 'INJECTOR-001', name: 'Common Rail Injector DELPHI', category: 'Engine', description: 'Delphi common rail diesel injector, remanufactured to OE spec', manufacturer: 'Delphi', application_domain: 'truck', specifications: JSON.stringify({ type: 'common_rail', flow_rate: '500ml/30s', connector: '2-pin', rail_pressure: '1800bar', nozzle: 'DLLA150P1090' }), oem_numbers: JSON.stringify(['DEL-R00101D', 'MAN-51.10100-6083', 'BO-0445120059']) },
    { id: uuid(), part_number: 'KING-PIN-001', name: 'King Pin Kit 50mm', category: 'Steering', description: 'King pin repair kit 50mm for front steer axle, includes bushings and seals', manufacturer: 'Febi Bilstein', application_domain: 'truck', specifications: JSON.stringify({ diameter: '50mm', length: '235mm', material: 'hardened_steel', includes: 'bushings, seals, retaining clips' }), oem_numbers: JSON.stringify(['FEBI-07615', 'MAN-81.44201-6011', 'DAF-1440020']) },
    { id: uuid(), part_number: 'LEAFSP-001', name: 'Parabolic Leaf Spring', category: 'Suspension', description: 'Single parabolic leaf spring for trailer front axle, 3-leaf progressive rate', manufacturer: 'Raufoss', application_domain: 'trailer', specifications: JSON.stringify({ width: '90mm', length: '1650mm', leaves: 3, load_rating: '9000kg', eye_diameter: '80mm' }), oem_numbers: JSON.stringify(['SAF-4046980200', 'BPW-03.360.10.81.0', 'ROR-RL-1650-90-3']) },
    { id: uuid(), part_number: 'DIFF-SEAL-001', name: 'Differential Output Seal', category: 'Drivetrain', description: 'Rear axle differential output shaft seal kit', manufacturer: 'Corteco', application_domain: 'truck', specifications: JSON.stringify({ OD: '90mm', ID: '65mm', height: '10mm', material: 'PTFE', lip_type: 'double' }), oem_numbers: JSON.stringify(['COR-82009826', 'MAN-81.96240-0271', 'DAF-1666744']) },
    { id: uuid(), part_number: 'FAN-CLUTCH-001', name: 'Viscous Fan Clutch', category: 'Cooling', description: 'Viscous fan coupling for truck engine cooling, thermostatic control', manufacturer: 'Horton', application_domain: 'truck', specifications: JSON.stringify({ OD: '420mm', thread: 'M52x2 RH', max_RPM: '2800', engagement_temp: '85°C', mounting: 'flange' }), oem_numbers: JSON.stringify(['HOR-99A8015', 'MAN-51.06600-7052', 'VO-20814279']) },
    { id: uuid(), part_number: 'EGR-VALVE-001', name: 'EGR Valve Assembly', category: 'Engine', description: 'Exhaust gas recirculation valve with pneumatic actuator for Euro 5/6 trucks', manufacturer: 'Pierburg', application_domain: 'truck', specifications: JSON.stringify({ actuation: 'pneumatic', port_size: '38mm', voltage: '12V', stroke: '10mm', temp_rating: '750°C' }), oem_numbers: JSON.stringify(['PIE-7.28028.22.0', 'MB-A4571400760', 'VO-21373695']) },
    { id: uuid(), part_number: 'COUPLING-001', name: '50mm Kingpin Coupling', category: 'Trailer', description: '50mm kingpin fifth wheel coupling jaw for semi-trailer, ISO standard', manufacturer: 'JOST', application_domain: 'trailer', specifications: JSON.stringify({ standard: 'ISO 337', jaw_size: '50mm', plate_size: '530x410mm', height: '150mm', load_rating: '90000kg' }), oem_numbers: JSON.stringify(['JOST-JSK37', 'SAF-2010009001', 'GR-GF350P']) },
    { id: uuid(), part_number: 'SLACK-ADJ-001', name: 'Automatic Slack Adjuster', category: 'Brakes', description: 'Automatic brake slack adjuster for S-cam brake systems, 5.5 inch arm', manufacturer: 'Haldex', application_domain: 'truck/trailer', specifications: JSON.stringify({ arm_length: '5.5"', spline: '28t', stroke: '57mm', thread: 'M16x1.5', type: 'automatic' }), oem_numbers: JSON.stringify(['HAL-40010002', 'WABCO-4034100202', 'MRL-RLB22508C']) },
    { id: uuid(), part_number: 'FUEL-PUMP-001', name: 'High Pressure Fuel Pump', category: 'Engine', description: 'Bosch CP3 common rail high pressure fuel pump for Euro 3/4/5 diesel engines', manufacturer: 'Bosch', application_domain: 'truck', specifications: JSON.stringify({ type: 'CP3', max_pressure: '1800bar', flow: '1200ml/min', drive: 'gear_driven', seal: 'viton' }), oem_numbers: JSON.stringify(['BO-0445020175', 'DAF-1780572', 'MAN-51.11103-7394']) },
    { id: uuid(), part_number: 'BEARING-HUB-001', name: 'Wheel Bearing Hub Assembly', category: 'Axle', description: 'Pre-assembled wheel hub bearing for trailer axle, includes ABS ring', manufacturer: 'SKF', application_domain: 'trailer', specifications: JSON.stringify({ PCD: '205mm', studs: 10, bore: '90mm', includes_abs_ring: true, load_rating: '18000kg_static' }), oem_numbers: JSON.stringify(['SKF-VKBA5411', 'BPW-09.262.14.64.0', 'SAF-3058000006']) },
    { id: uuid(), part_number: 'AIR-BELLOW-001', name: 'Air Spring Bellow 1T15', category: 'Suspension', description: 'Contitech 1T15 air spring bellow for trailer air suspension', manufacturer: 'Contitech', application_domain: 'trailer', specifications: JSON.stringify({ type: '1T15-380', height_min: '185mm', height_max: '310mm', effective_area: '510cm2', max_pressure: '10bar' }), oem_numbers: JSON.stringify(['CON-64869-C5', 'BPW-09.262.24.17.0', 'SAF-1440052303']) },
    { id: uuid(), part_number: 'GEARBOX-SYNCHRO-001', name: 'Gearbox Synchroniser Ring', category: 'Transmission', description: 'ZF synchromesh ring for ZF 16S truck gearbox, 3rd/4th gear', manufacturer: 'ZF', application_domain: 'truck', specifications: JSON.stringify({ gearbox: 'ZF16S', gears: '3rd/4th', OD: '145mm', material: 'brass_carbon', cone_angle: '7°' }), oem_numbers: JSON.stringify(['ZF-1304305032', 'MAN-81.23211-1099', 'VO-1582718']) },
    { id: uuid(), part_number: 'COOLANT-PUMP-001', name: 'Water Pump Assembly', category: 'Cooling', description: 'Engine coolant water pump with housing for 6-cylinder truck diesel', manufacturer: 'Hepu', application_domain: 'truck', specifications: JSON.stringify({ outlet_diameter: '38mm', housing: 'aluminium', drive: 'belt', gasket_included: true, flow_rate: '280L/min' }), oem_numbers: JSON.stringify(['HEP-P7752', 'MAN-51.06500-6113', 'MB-0002009601']) },
    { id: uuid(), part_number: 'BRAKE-CHAMBER-001', name: 'Spring Brake Chamber 30/30', category: 'Brakes', description: 'Combination spring/service brake chamber type 30/30 for truck/trailer', manufacturer: 'Knorr-Bremse', application_domain: 'truck/trailer', specifications: JSON.stringify({ type: '30/30', stroke_service: '63mm', stroke_emergency: '57mm', port: 'M22x1.5', mounting: 'flange_3_bolt' }), oem_numbers: JSON.stringify(['KNO-K003478', 'WABCO-9254800180', 'MRL-SB3030EE']) },
  ];

  const vehicles = [
    { id: uuid(), make: 'MAN', model: 'TGX 18.480', year_from: 2012, year_to: 2024, engine_type: 'D2676 LF04 Euro 6', engine_code: 'D2676', category: 'truck' },
    { id: uuid(), make: 'MAN', model: 'TGS 26.400', year_from: 2010, year_to: 2022, engine_type: 'D2066 LF35 Euro 5', engine_code: 'D2066', category: 'truck' },
    { id: uuid(), make: 'Mercedes-Benz', model: 'Actros 1845', year_from: 2011, year_to: 2024, engine_type: 'OM471 Euro 6', engine_code: 'OM471', category: 'truck' },
    { id: uuid(), make: 'Mercedes-Benz', model: 'Atego 1218', year_from: 2004, year_to: 2020, engine_type: 'OM906 LA Euro 5', engine_code: 'OM906', category: 'truck' },
    { id: uuid(), make: 'Volvo', model: 'FH 500', year_from: 2013, year_to: 2024, engine_type: 'D13K Euro 6', engine_code: 'D13K', category: 'truck' },
    { id: uuid(), make: 'Volvo', model: 'FM 420', year_from: 2010, year_to: 2022, engine_type: 'D11K Euro 5', engine_code: 'D11K', category: 'truck' },
    { id: uuid(), make: 'DAF', model: 'XF 106.460', year_from: 2013, year_to: 2024, engine_type: 'MX13 Euro 6', engine_code: 'MX13', category: 'truck' },
    { id: uuid(), make: 'DAF', model: 'CF 85.410', year_from: 2006, year_to: 2017, engine_type: 'MX340 Euro 5', engine_code: 'MX340', category: 'truck' },
    { id: uuid(), make: 'Scania', model: 'R 500', year_from: 2009, year_to: 2016, engine_type: 'DC13 Euro 6', engine_code: 'DC13', category: 'truck' },
    { id: uuid(), make: 'Scania', model: 'S 450', year_from: 2016, year_to: 2024, engine_type: 'DC13 Euro 6 NTG', engine_code: 'DC13NTG', category: 'truck' },
    { id: uuid(), make: 'Iveco', model: 'Stralis 460', year_from: 2012, year_to: 2023, engine_type: 'Cursor 13 Euro 6', engine_code: 'F3GE', category: 'truck' },
    { id: uuid(), make: 'Renault', model: 'T 460', year_from: 2013, year_to: 2024, engine_type: 'DTI 11 Euro 6', engine_code: 'DTI11', category: 'truck' },
    { id: uuid(), make: 'Schmitz Cargobull', model: 'S.KO', year_from: 2005, year_to: 2024, engine_type: 'N/A', engine_code: '', category: 'trailer' },
    { id: uuid(), make: 'Krone', model: 'SD Box', year_from: 2008, year_to: 2024, engine_type: 'N/A', engine_code: '', category: 'trailer' },
    { id: uuid(), make: 'Wielton', model: 'NS3', year_from: 2010, year_to: 2024, engine_type: 'N/A', engine_code: '', category: 'trailer' },
    { id: uuid(), make: 'Fruehauf', model: 'Curtainsider', year_from: 2000, year_to: 2020, engine_type: 'N/A', engine_code: '', category: 'trailer' },
  ];

  // Compatibility map: part_number -> [vehicle indices]
  const compatMap: Record<string, number[]> = {
    'SK-BR-001':        [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15],
    'ALT-24V-001':      [0,1,2,3,4,5,6,7,8,9,10,11],
    'TURBO-K27-001':    [0,1,2,3],
    'ABS-SEN-001':      [12,13,14,15],
    'AIR-DRY-001':      [0,1,2,3,4,5,6,7,8,9,10,11],
    'CLUTCH-KIT-001':   [0,1,4,5,8,9],
    'INJECTOR-001':     [0,1],
    'KING-PIN-001':     [0,1,2,3,6,7],
    'LEAFSP-001':       [12,13,14,15],
    'DIFF-SEAL-001':    [0,1,2,3,4,5],
    'FAN-CLUTCH-001':   [0,1,4,5,8,9],
    'EGR-VALVE-001':    [2,3,4,5,10,11],
    'COUPLING-001':     [12,13,14,15],
    'SLACK-ADJ-001':    [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15],
    'FUEL-PUMP-001':    [6,7,10,11],
    'BEARING-HUB-001':  [12,13,14,15],
    'AIR-BELLOW-001':   [12,13,14,15],
    'GEARBOX-SYNCHRO-001': [0,1,4,5],
    'COOLANT-PUMP-001': [0,1,2,3,4,5,6,7],
    'BRAKE-CHAMBER-001':[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15],
  };

  db.transaction(() => {
    for (const p of parts) {
      const searchText = `${p.part_number} ${p.name} ${p.category} ${p.description} ${p.manufacturer} ${JSON.parse(p.oem_numbers).join(' ')}`;
      insertPart.run(p.id, p.part_number, p.name, p.category, p.description, p.manufacturer, p.application_domain, p.specifications, p.oem_numbers, searchText);
      insertFts.run(p.id, p.part_number, p.name, p.category, p.description, p.manufacturer, searchText);
    }
    for (const v of vehicles) {
      insertVehicle.run(v.id, v.make, v.model, v.year_from, v.year_to, v.engine_type, v.engine_code, v.category);
    }
    for (const p of parts) {
      const vehicleIndices = compatMap[p.part_number] || [];
      for (const vi of vehicleIndices) {
        if (vehicles[vi]) {
          insertCompat.run(uuid(), p.id, vehicles[vi].id, null);
        }
      }
    }
  })();
}
