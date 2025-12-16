import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

// Datos de muestra
const nombres = ['Juan', 'Maria', 'Pedro', 'Ana', 'Luis', 'Carmen', 'Jose', 'Laura', 'Carlos', 'Sofia', 'Miguel', 'Isabel', 'Diego', 'Valentina', 'Andres', 'Camila', 'Roberto', 'Daniela', 'Fernando', 'Gabriela'];
const apellidos = ['Garcia', 'Rodriguez', 'Martinez', 'Lopez', 'Gonzalez', 'Perez', 'Sanchez', 'Ramirez', 'Torres', 'Flores', 'Rivera', 'Gomez', 'Diaz', 'Cruz', 'Morales', 'Reyes', 'Jimenez', 'Hernandez', 'Ruiz', 'Mendoza'];
const marcasVehiculos = ['Toyota', 'Honda', 'Chevrolet', 'Ford', 'Nissan', 'Mazda', 'Hyundai', 'Kia', 'Volkswagen', 'Renault'];
const modelosVehiculos = ['Corolla', 'Civic', 'Spark', 'Fiesta', 'Sentra', 'CX-5', 'Accent', 'Rio', 'Gol', 'Logan'];
const ciudades = ['Barranquilla', 'Bogotá', 'Medellín', 'Cali', 'Cartagena', 'Santa Marta', 'Bucaramanga', 'Pereira', 'Manizales', 'Ibagué'];
const direcciones = ['Calle 72 #45-23', 'Carrera 50 #80-15', 'Avenida Boyacá #123-45', 'Calle 100 #20-30', 'Diagonal 25 #67-89'];

// Función para generar cédula aleatoria
function generarCedula(): string {
  return Math.floor(10000000 + Math.random() * 90000000).toString();
}

// Función para generar email con ID único
function generarEmail(nombre: string, apellido: string, id?: number): string {
  const base = `${nombre.toLowerCase()}.${apellido.toLowerCase()}`;
  return id ? `${base}.${id}@email.com` : `${base}@email.com`;
}

// Función para generar teléfono
function generarTelefono(): string {
  return `300${Math.floor(1000000 + Math.random() * 9000000)}`;
}

// Función para generar placas aleatorias (formato colombiano ABC123)
function generarPlacas(): string {
  const letras = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const placa =
    letras.charAt(Math.floor(Math.random() * letras.length)) +
    letras.charAt(Math.floor(Math.random() * letras.length)) +
    letras.charAt(Math.floor(Math.random() * letras.length)) +
    Math.floor(100 + Math.random() * 900).toString();
  return placa;
}

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...');

  // Limpiar base de datos
  console.log('🧹 Limpiando base de datos...');
  await prisma.checklistItem.deleteMany();
  await prisma.vehicleChecklist.deleteMany();
  await prisma.passwordResetToken.deleteMany();
  await prisma.suppliersType.deleteMany();
  await prisma.suppliersContact.deleteMany();
  await prisma.suppliersUbication.deleteMany();
  await prisma.suppliers.deleteMany();
  await prisma.availablePieces_vehicle.deleteMany();
  await prisma.informationPieces.deleteMany();
  await prisma.invoiceDetail.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.pieces.deleteMany();
  await prisma.pieceCategory.deleteMany();
  await prisma.services.deleteMany();
  await prisma.serviceCategory.deleteMany();
  await prisma.appointmentScheduling.deleteMany();
  await prisma.clientVehicle.deleteMany();
  await prisma.clientContact.deleteMany();
  await prisma.client.deleteMany();
  await prisma.credentials.deleteMany();
  await prisma.session.deleteMany();
  await prisma.logApp.deleteMany();

  // 1. Crear Sessions (Empleados/Mecánicos)
  console.log('👤 Creando sesiones de empleados...');
  const hashedPassword = await argon2.hash('password123');

  const sessions = [];
  for (let i = 0; i < 20; i++) {
    const session = await prisma.session.create({
      data: {
        name: `${nombres[i % nombres.length]} ${apellidos[i % apellidos.length]}`,
        identificacion: generarCedula(),
        email: generarEmail(nombres[i % nombres.length], apellidos[i % apellidos.length], i + 1000),
        role: i < 5 ? 'ADMINISTRADOR' : 'MECANICO',
        credentials: {
          create: {
            password: hashedPassword,
          },
        },
      },
    });
    sessions.push(session);
  }
  console.log(`✅ ${sessions.length} sesiones creadas`);

  // 2. Crear Clientes
  console.log('👥 Creando clientes...');
  const clients = [];
  for (let i = 0; i < 100; i++) {
    const nombre = nombres[Math.floor(Math.random() * nombres.length)];
    const apellido = apellidos[Math.floor(Math.random() * apellidos.length)];

    const client = await prisma.client.create({
      data: {
        fullName: nombre,
        fullSurname: apellido,
        identified: generarCedula(),
        clientState: Math.random() > 0.1,
      },
    });
    clients.push(client);
  }
  console.log(`✅ ${clients.length} clientes creados`);

  // 3. Crear Contactos de Clientes
  console.log('📞 Creando contactos de clientes...');
  for (const client of clients) {
    await prisma.clientContact.create({
      data: {
        phoneNumber: generarTelefono(),
        email: generarEmail(client.fullName, client.fullSurname, client.id),
        address: direcciones[Math.floor(Math.random() * direcciones.length)],
        clientId: client.id,
      },
    });
  }
  console.log('✅ Contactos de clientes creados');

  // 4. Crear Vehículos de Clientes (CON PLACAS)
  console.log('🚗 Creando vehículos de clientes...');
  const vehicles = [];
  const placasGeneradas = new Set<string>(); // Para evitar duplicados

  for (const client of clients) {
    const numVehicles = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < numVehicles; i++) {
      // Generar placa única
      let placa = generarPlacas();
      while (placasGeneradas.has(placa)) {
        placa = generarPlacas();
      }
      placasGeneradas.add(placa);

      const vehicle = await prisma.clientVehicle.create({
        data: {
          brand: marcasVehiculos[Math.floor(Math.random() * marcasVehiculos.length)],
          model: modelosVehiculos[Math.floor(Math.random() * modelosVehiculos.length)],
          year: 2010 + Math.floor(Math.random() * 14),
          engineDisplacement: [1400, 1600, 1800, 2000, 2400][Math.floor(Math.random() * 5)],
          plates: placa,
          description: 'Vehículo en buen estado',
          clientId: client.id,
        },
      });
      vehicles.push(vehicle);
    }
  }
  console.log(`✅ ${vehicles.length} vehículos creados con placas únicas`);

  // 5. Crear Categorías de Servicios
  console.log('🔧 Creando categorías de servicios...');
  const serviceCategories = await Promise.all([
    prisma.serviceCategory.create({
      data: {
        name: 'Mantenimiento Preventivo',
        description: 'Servicios de mantenimiento periódico del vehículo',
      },
    }),
    prisma.serviceCategory.create({
      data: {
        name: 'Reparación de Motor',
        description: 'Servicios relacionados con el motor del vehículo',
      },
    }),
    prisma.serviceCategory.create({
      data: {
        name: 'Sistema de Frenos',
        description: 'Reparación y mantenimiento del sistema de frenos',
      },
    }),
    prisma.serviceCategory.create({
      data: {
        name: 'Sistema Eléctrico',
        description: 'Diagnóstico y reparación del sistema eléctrico',
      },
    }),
    prisma.serviceCategory.create({
      data: {
        name: 'Transmisión',
        description: 'Servicios de transmisión y caja de cambios',
      },
    }),
    prisma.serviceCategory.create({
      data: {
        name: 'Suspensión',
        description: 'Reparación y ajuste de suspensión',
      },
    }),
  ]);
  console.log(`✅ ${serviceCategories.length} categorías de servicios creadas`);

  // 6. Crear Servicios
  console.log('🛠️ Creando servicios...');
  const servicios = [
    { name: 'Cambio de Aceite', description: 'Cambio de aceite y filtro', price: 45000, serviceCategory_id: serviceCategories[0].id, guarantee: '3 meses o 5000 km' },
    { name: 'Alineación y Balanceo', description: 'Alineación y balanceo de ruedas', price: 60000, serviceCategory_id: serviceCategories[0].id, guarantee: '1 mes' },
    { name: 'Revisión de Frenos', description: 'Inspección completa del sistema de frenos', price: 35000, serviceCategory_id: serviceCategories[2].id, guarantee: '15 días' },
    { name: 'Cambio de Pastillas de Freno', description: 'Reemplazo de pastillas delanteras o traseras', price: 120000, serviceCategory_id: serviceCategories[2].id, guarantee: '6 meses' },
    { name: 'Cambio de Batería', description: 'Instalación de batería nueva', price: 250000, serviceCategory_id: serviceCategories[3].id, guarantee: '1 año' },
    { name: 'Diagnóstico Computarizado', description: 'Escaneo completo del vehículo', price: 50000, serviceCategory_id: serviceCategories[3].id, guarantee: 'N/A' },
    { name: 'Cambio de Bujías', description: 'Reemplazo de bujías', price: 80000, serviceCategory_id: serviceCategories[1].id, guarantee: '6 meses' },
    { name: 'Afinación de Motor', description: 'Afinación completa del motor', price: 150000, serviceCategory_id: serviceCategories[1].id, guarantee: '3 meses' },
    { name: 'Cambio de Correa de Distribución', description: 'Reemplazo de kit de distribución', price: 350000, serviceCategory_id: serviceCategories[1].id, guarantee: '1 año o 20000 km' },
    { name: 'Revisión de Transmisión', description: 'Inspección y ajuste de transmisión', price: 90000, serviceCategory_id: serviceCategories[4].id, guarantee: '1 mes' },
    { name: 'Cambio de Aceite de Transmisión', description: 'Cambio de aceite de caja de cambios', price: 180000, serviceCategory_id: serviceCategories[4].id, guarantee: '6 meses' },
    { name: 'Cambio de Amortiguadores', description: 'Reemplazo de amortiguadores', price: 280000, serviceCategory_id: serviceCategories[5].id, guarantee: '1 año' },
    { name: 'Revisión de Suspensión', description: 'Inspección completa de suspensión', price: 45000, serviceCategory_id: serviceCategories[5].id, guarantee: '15 días' },
    { name: 'Cambio de Terminales', description: 'Reemplazo de terminales de dirección', price: 95000, serviceCategory_id: serviceCategories[5].id, guarantee: '6 meses' },
    { name: 'Limpieza de Inyectores', description: 'Limpieza ultrasónica de inyectores', price: 120000, serviceCategory_id: serviceCategories[1].id, guarantee: '3 meses' },
  ];

  const services = [];
  for (const servicio of servicios) {
    const service = await prisma.services.create({
      data: servicio,
    });
    services.push(service);
  }
  console.log(`✅ ${services.length} servicios creados`);

  // 7. Crear Categorías de Piezas
  console.log('📦 Creando categorías de piezas...');
  const pieceCategories = await Promise.all([
    prisma.pieceCategory.create({
      data: {
        name: 'Frenos',
        description: 'Componentes del sistema de frenos',
      },
    }),
    prisma.pieceCategory.create({
      data: {
        name: 'Motor',
        description: 'Piezas del motor',
      },
    }),
    prisma.pieceCategory.create({
      data: {
        name: 'Suspensión',
        description: 'Componentes de suspensión',
      },
    }),
    prisma.pieceCategory.create({
      data: {
        name: 'Eléctrico',
        description: 'Componentes eléctricos',
      },
    }),
    prisma.pieceCategory.create({
      data: {
        name: 'Filtros',
        description: 'Filtros varios',
      },
    }),
    prisma.pieceCategory.create({
      data: {
        name: 'Lubricantes',
        description: 'Aceites y lubricantes',
      },
    }),
  ]);
  console.log(`✅ ${pieceCategories.length} categorías de piezas creadas`);

  // 8. Crear Piezas
  console.log('🔩 Creando piezas...');
  const piezasData = [
    { name: 'Pastillas de Freno', description: 'Pastillas delanteras', price: 85000, stock: 50, brand_piece: 'Brembo', categoryId: pieceCategories[0].id },
    { name: 'Discos de Freno', description: 'Discos ventilados', price: 150000, stock: 30, brand_piece: 'Ate', categoryId: pieceCategories[0].id },
    { name: 'Liquido de Frenos DOT 4', description: 'Líquido de frenos', price: 25000, stock: 100, brand_piece: 'Castrol', categoryId: pieceCategories[0].id },
    { name: 'Bujías', description: 'Bujías de platino', price: 18000, stock: 200, brand_piece: 'NGK', categoryId: pieceCategories[1].id },
    { name: 'Filtro de Aceite', description: 'Filtro de aceite', price: 15000, stock: 150, brand_piece: 'Mann', categoryId: pieceCategories[4].id },
    { name: 'Filtro de Aire', description: 'Filtro de aire del motor', price: 25000, stock: 120, brand_piece: 'Mann', categoryId: pieceCategories[4].id },
    { name: 'Filtro de Combustible', description: 'Filtro gasolina', price: 30000, stock: 80, brand_piece: 'Bosch', categoryId: pieceCategories[4].id },
    { name: 'Aceite Motor 10W-40', description: 'Aceite sintético', price: 45000, stock: 200, brand_piece: 'Mobil', categoryId: pieceCategories[5].id },
    { name: 'Aceite Motor 5W-30', description: 'Aceite full sintético', price: 65000, stock: 150, brand_piece: 'Castrol', categoryId: pieceCategories[5].id },
    { name: 'Batería 12V 55Ah', description: 'Batería sellada', price: 280000, stock: 25, brand_piece: 'MAC', categoryId: pieceCategories[3].id },
    { name: 'Alternador', description: 'Alternador 90A', price: 350000, stock: 15, brand_piece: 'Bosch', categoryId: pieceCategories[3].id },
    { name: 'Motor de Arranque', description: 'Motor de arranque', price: 420000, stock: 12, brand_piece: 'Valeo', categoryId: pieceCategories[3].id },
    { name: 'Amortiguador Delantero', description: 'Amortiguador gas', price: 180000, stock: 40, brand_piece: 'Monroe', categoryId: pieceCategories[2].id },
    { name: 'Amortiguador Trasero', description: 'Amortiguador hidráulico', price: 150000, stock: 45, brand_piece: 'Monroe', categoryId: pieceCategories[2].id },
    { name: 'Terminal de Dirección', description: 'Terminal axial', price: 45000, stock: 60, brand_piece: 'TRW', categoryId: pieceCategories[2].id },
    { name: 'Rótula Delantera', description: 'Rótula suspensión', price: 55000, stock: 50, brand_piece: 'TRW', categoryId: pieceCategories[2].id },
    { name: 'Correa de Distribución', description: 'Kit distribución', price: 120000, stock: 35, brand_piece: 'Gates', categoryId: pieceCategories[1].id },
    { name: 'Bomba de Agua', description: 'Bomba refrigeración', price: 95000, stock: 30, brand_piece: 'Aisin', categoryId: pieceCategories[1].id },
    { name: 'Termostato', description: 'Termostato motor', price: 35000, stock: 70, brand_piece: 'Wahler', categoryId: pieceCategories[1].id },
    { name: 'Sensor de Oxígeno', description: 'Sonda lambda', price: 180000, stock: 20, brand_piece: 'Bosch', categoryId: pieceCategories[3].id },
  ];

  const pieces = [];
  for (const pieza of piezasData) {
    const piece = await prisma.pieces.create({
      data: {
        ...pieza,
        estado: pieza.stock > 10 ? 'DISPONIBLE' : 'AGOTADO',
      },
    });
    pieces.push(piece);

    // Crear información de entrada de inventario
    await prisma.informationPieces.create({
      data: {
        pieceName: pieza.name,
        stockEntry: pieza.stock,
        moreInformation_id: piece.id,
      },
    });
  }
  console.log(`✅ ${pieces.length} piezas creadas`);

  // 9. Crear Compatibilidad de Piezas con Vehículos
  console.log('🔗 Creando compatibilidad de piezas con vehículos...');
  let compatibilidadCount = 0;
  for (const piece of pieces) {
    const numCompatibilidades = Math.floor(Math.random() * 5) + 3;
    for (let i = 0; i < numCompatibilidades; i++) {
      await prisma.availablePieces_vehicle.create({
        data: {
          brand: marcasVehiculos[Math.floor(Math.random() * marcasVehiculos.length)],
          model: modelosVehiculos[Math.floor(Math.random() * modelosVehiculos.length)],
          pieceVehiculo_id: piece.id,
        },
      });
      compatibilidadCount++;
    }
  }
  console.log(`✅ ${compatibilidadCount} compatibilidades creadas`);

  // 10. Crear Citas (Appointments)
  console.log('📅 Creando citas...');
  const appointments = [];
  const estados: any[] = ['ASIGNADA', 'COMPLETADA', 'PENDIENTE', 'CANCELADA'];

  for (let i = 0; i < 150; i++) {
    const diasAtras = Math.floor(Math.random() * 90);
    const fecha = new Date();
    fecha.setDate(fecha.getDate() - diasAtras);

    const appointment = await prisma.appointmentScheduling.create({
      data: {
        appointmentDate: fecha,
        ubicacion: ciudades[Math.floor(Math.random() * ciudades.length)],
        appointmentState: estados[Math.floor(Math.random() * estados.length)],
        details: 'Revisión general del vehículo',
        clientId: clients[Math.floor(Math.random() * clients.length)].id,
        employedId: sessions[Math.floor(Math.random() * sessions.length)].id,
      },
    });
    appointments.push(appointment);
  }
  console.log(`✅ ${appointments.length} citas creadas`);

  // 11. Crear Checklists para algunas citas
  console.log('📋 Creando checklists de vehículos...');
  const completedAppointments = appointments.filter(a => Math.random() > 0.5);

  for (const appointment of completedAppointments) {
    const checklist = await prisma.vehicleChecklist.create({
      data: {
        checkType: 'Pre-servicio',
        fuelLevel: Math.floor(Math.random() * 100),
        mileage: `${Math.floor(50000 + Math.random() * 150000)} km`,
        generalNotes: 'Vehículo en condiciones normales',
        technicianName: sessions[Math.floor(Math.random() * sessions.length)].name,
        appointmentId: appointment.id,
      },
    });

    // Crear items del checklist
    const checklistItems = [
      { label: 'Luces delanteras', category: 'Luces', checked: true, condition: 'Bueno' },
      { label: 'Luces traseras', category: 'Luces', checked: true, condition: 'Bueno' },
      { label: 'Nivel de aceite', category: 'Fluidos', checked: true, condition: 'Adecuado' },
      { label: 'Líquido de frenos', category: 'Fluidos', checked: true, condition: 'Adecuado' },
      { label: 'Presión de llantas', category: 'Neumáticos', checked: true, condition: 'Correcto' },
      { label: 'Frenos delanteros', category: 'Frenos', checked: true, condition: 'Bueno' },
      { label: 'Frenos traseros', category: 'Frenos', checked: true, condition: 'Bueno' },
      { label: 'Batería', category: 'Eléctrico', checked: true, condition: 'Bueno' },
    ];

    for (const item of checklistItems) {
      await prisma.checklistItem.create({
        data: {
          ...item,
          checklistId: checklist.id,
        },
      });
    }
  }
  console.log(`✅ Checklists creados para ${completedAppointments.length} citas`);

  // 12. Crear Facturas
  console.log('💰 Creando facturas...');
  const invoices = [];

  for (let i = 0; i < 200; i++) {
    const client = clients[Math.floor(Math.random() * clients.length)];
    const numServicios = Math.floor(Math.random() * 3) + 1;
    const numPiezas = Math.floor(Math.random() * 4);

    let total = 0;
    const detalles = [];

    // Agregar servicios
    for (let j = 0; j < numServicios; j++) {
      const service = services[Math.floor(Math.random() * services.length)];
      const subtotal = Number(service.price);
      total += subtotal;
      detalles.push({
        amount: 1,
        subtotal: subtotal,
        description: service.name,
        serviceId: service.id,
      });
    }

    // Agregar piezas
    for (let j = 0; j < numPiezas; j++) {
      const piece = pieces[Math.floor(Math.random() * pieces.length)];
      const cantidad = Math.floor(Math.random() * 3) + 1;
      const subtotal = Number(piece.price) * cantidad;
      total += subtotal;
      detalles.push({
        amount: cantidad,
        subtotal: subtotal,
        description: piece.name,
        pieceId: piece.id,
      });
    }

    const invoice = await prisma.invoice.create({
      data: {
        total: total,
        clientId: client.id,
      },
    });
    invoices.push(invoice);

    // Crear detalles de factura
    for (const detalle of detalles) {
      await prisma.invoiceDetail.create({
        data: {
          ...detalle,
          invoiceDetail_id: invoice.id,
        },
      });
    }
  }
  console.log(`✅ ${invoices.length} facturas creadas`);

  // 13. Crear Proveedores
  console.log('🏭 Creando proveedores...');
  const proveedoresData: Array<{ name: string, payCondition: string, state: 'ACTIVO' | 'INACTIVO' | 'PENDIENTE' | 'BLOQUEADO' | 'SUSPENDIDO' | 'ELIMINADO' }> = [
    { name: 'Autopartes García', payCondition: 'Contado', state: 'ACTIVO' },
    { name: 'Repuestos Rodríguez', payCondition: '30 días', state: 'ACTIVO' },
    { name: 'Lubricantes del Caribe', payCondition: '15 días', state: 'ACTIVO' },
    { name: 'Herramientas Industriales', payCondition: 'Contado', state: 'ACTIVO' },
    { name: 'Importadora de Repuestos', payCondition: '45 días', state: 'ACTIVO' },
    { name: 'Suministros Automotrices', payCondition: '30 días', state: 'ACTIVO' },
    { name: 'Distribuidora Nacional', payCondition: '60 días', state: 'ACTIVO' },
    { name: 'Frenos y Suspensión SAS', payCondition: '30 días', state: 'ACTIVO' },
    { name: 'Eléctricos del Norte', payCondition: 'Contado', state: 'ACTIVO' },
    { name: 'Filtros y Aceites', payCondition: '15 días', state: 'ACTIVO' },
  ];

  for (const prov of proveedoresData) {
    const supplier = await prisma.suppliers.create({
      data: prov,
    });

    // Crear contacto del proveedor
    await prisma.suppliersContact.create({
      data: {
        direction: direcciones[Math.floor(Math.random() * direcciones.length)],
        phoneNumber: generarTelefono(),
        email: `contacto@${prov.name.toLowerCase().replace(/ /g, '')}.com`,
        proveedorId: supplier.id,
      },
    });

    // Crear ubicación del proveedor
    await prisma.suppliersUbication.create({
      data: {
        country: 'Colombia',
        city: ciudades[Math.floor(Math.random() * ciudades.length)],
        region: 'Atlántico',
        proveedorId: supplier.id,
      },
    });

    // Crear tipos de proveedor
    const tipos: Array<'REPUESTOS' | 'HERRAMIENTAS' | 'LUBRICANTES' | 'SERVICIOS' | 'VEHICULOS' | 'CONSUMIBLES' | 'SOFTWARE'> = ['REPUESTOS', 'HERRAMIENTAS', 'LUBRICANTES', 'SERVICIOS', 'CONSUMIBLES'];
    const numTipos = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < numTipos; i++) {
      await prisma.suppliersType.create({
        data: {
          type: tipos[Math.floor(Math.random() * tipos.length)],
          proveedorId: supplier.id,
        },
      });
    }
  }
  console.log('✅ Proveedores creados');

  // 14. Crear Logs
  console.log('📝 Creando logs...');
  const tiposLog: Array<'CREATE' | 'UPDATE' | 'DELETE' | 'READ'> = ['CREATE', 'UPDATE', 'DELETE', 'READ'];
  for (let i = 0; i < 100; i++) {
    await prisma.logApp.create({
      data: {
        typeChange: tiposLog[Math.floor(Math.random() * tiposLog.length)],
        origin: 'Sistema',
        title: 'Operación realizada',
        message: 'Se realizó una operación en el sistema',
        data: {
          timestamp: new Date().toISOString(),
          user: sessions[Math.floor(Math.random() * sessions.length)].name,
        },
      },
    });
  }
  console.log('✅ 100 logs creados');

  console.log('\n🎉 Seed completado exitosamente!');
  console.log('\n📊 Resumen:');
  console.log(`   - ${sessions.length} empleados/mecánicos`);
  console.log(`   - ${clients.length} clientes`);
  console.log(`   - ${vehicles.length} vehículos (con placas únicas)`);
  console.log(`   - ${services.length} servicios`);
  console.log(`   - ${pieces.length} piezas`);
  console.log(`   - ${appointments.length} citas`);
  console.log(`   - ${invoices.length} facturas`);
  console.log(`   - ${proveedoresData.length} proveedores`);
  console.log(`   - 100 logs del sistema`);
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });