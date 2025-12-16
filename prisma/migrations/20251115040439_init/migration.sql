-- CreateEnum
CREATE TYPE "typeSuppliers" AS ENUM ('REPUESTOS', 'HERRAMIENTAS', 'LUBRICANTES', 'SERVICIOS', 'VEHICULOS', 'CONSUMIBLES', 'SOFTWARE');

-- CreateEnum
CREATE TYPE "stateSuppliers" AS ENUM ('ACTIVO', 'INACTIVO', 'PENDIENTE', 'BLOQUEADO', 'SUSPENDIDO', 'ELIMINADO');

-- CreateEnum
CREATE TYPE "TypeChange" AS ENUM ('UPDATE', 'CREATE', 'DELETE', 'READ');

-- CreateEnum
CREATE TYPE "TypeAccount" AS ENUM ('MECANICO', 'ADMINISTRADOR');

-- CreateEnum
CREATE TYPE "AppointmentState" AS ENUM ('ASIGNADA', 'COMPLETADA', 'PENDIENTE', 'CANCELADA');

-- CreateEnum
CREATE TYPE "PieceState" AS ENUM ('DISPONIBLE', 'AGOTADO');

-- CreateTable
CREATE TABLE "Session" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "identificacion" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "TypeAccount" NOT NULL DEFAULT 'MECANICO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Credentials" (
    "id" SERIAL NOT NULL,
    "password" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "sessionId" INTEGER NOT NULL,

    CONSTRAINT "Credentials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Client" (
    "id" SERIAL NOT NULL,
    "fullName" VARCHAR(100) NOT NULL,
    "fullSurname" VARCHAR(100) NOT NULL,
    "identified" VARCHAR(50) NOT NULL,
    "clientState" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientContact" (
    "id" SERIAL NOT NULL,
    "phoneNumber" VARCHAR(20) NOT NULL,
    "email" VARCHAR(50) NOT NULL,
    "address" VARCHAR(50),
    "createAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "clientId" INTEGER NOT NULL,

    CONSTRAINT "ClientContact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AppointmentScheduling" (
    "id" SERIAL NOT NULL,
    "appointmentDate" TIMESTAMP(3) NOT NULL,
    "ubicacion" VARCHAR(50) NOT NULL,
    "appointmentState" "AppointmentState" NOT NULL DEFAULT 'ASIGNADA',
    "details" TEXT,
    "clientId" INTEGER NOT NULL,
    "employedId" INTEGER,

    CONSTRAINT "AppointmentScheduling_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientVehicle" (
    "id" SERIAL NOT NULL,
    "brand" VARCHAR(20) NOT NULL,
    "model" VARCHAR(20) NOT NULL,
    "year" INTEGER NOT NULL,
    "engineDisplacement" INTEGER NOT NULL,
    "createAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "description" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "clientId" INTEGER,

    CONSTRAINT "ClientVehicle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invoice" (
    "id" SERIAL NOT NULL,
    "createAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "total" DECIMAL(15,2) NOT NULL,
    "clientId" INTEGER NOT NULL,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvoiceDetail" (
    "id" SERIAL NOT NULL,
    "amount" INTEGER,
    "subtotal" DECIMAL(15,2) NOT NULL,
    "extra" DECIMAL(15,2),
    "description" TEXT,
    "pieceId" INTEGER,
    "invoiceDetail_id" INTEGER NOT NULL,
    "serviceId" INTEGER,

    CONSTRAINT "InvoiceDetail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Services" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "description" TEXT,
    "price" DECIMAL(15,2) NOT NULL,
    "createAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "serviceCategory_id" INTEGER NOT NULL,
    "guarantee" TEXT,

    CONSTRAINT "Services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceCategory" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "description" TEXT,
    "createAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ServiceCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pieces" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(30) NOT NULL,
    "description" TEXT,
    "price" DECIMAL(15,2) NOT NULL,
    "estado" "PieceState" NOT NULL DEFAULT 'DISPONIBLE',
    "stock" INTEGER NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "createAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pieces_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InformationPieces" (
    "id" SERIAL NOT NULL,
    "pieceName" TEXT NOT NULL,
    "stockEntry" INTEGER NOT NULL,
    "dateOf_entry" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "moreInformation_id" INTEGER NOT NULL,

    CONSTRAINT "InformationPieces_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PieceCategory" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "description" TEXT NOT NULL,
    "createAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PieceCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AvailablePieces_vehicle" (
    "id" SERIAL NOT NULL,
    "brand" VARCHAR(20) NOT NULL,
    "model" VARCHAR(20) NOT NULL,
    "pieceVehiculo_id" INTEGER NOT NULL,
    "createAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createUpdate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AvailablePieces_vehicle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Suppliers" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "state" "stateSuppliers" NOT NULL DEFAULT 'ACTIVO',
    "payCondition" TEXT NOT NULL,
    "createAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Suppliers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SuppliersUbication" (
    "id" SERIAL NOT NULL,
    "country" VARCHAR(50) NOT NULL,
    "city" VARCHAR(50) NOT NULL,
    "region" VARCHAR(50) NOT NULL,
    "proveedorId" INTEGER NOT NULL,

    CONSTRAINT "SuppliersUbication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SuppliersContact" (
    "id" SERIAL NOT NULL,
    "direction" VARCHAR(50) NOT NULL,
    "phoneNumber" VARCHAR(15) NOT NULL,
    "email" VARCHAR(50) NOT NULL,
    "proveedorId" INTEGER NOT NULL,

    CONSTRAINT "SuppliersContact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SuppliersType" (
    "id" SERIAL NOT NULL,
    "type" "typeSuppliers" NOT NULL,
    "proveedorId" INTEGER NOT NULL,

    CONSTRAINT "SuppliersType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PasswordResetToken" (
    "id" SERIAL NOT NULL,
    "token" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VehicleChecklist" (
    "id" SERIAL NOT NULL,
    "checkType" TEXT NOT NULL,
    "fuelLevel" INTEGER NOT NULL,
    "mileage" TEXT NOT NULL,
    "generalNotes" TEXT NOT NULL,
    "technicianName" TEXT NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "appointmentId" INTEGER NOT NULL,

    CONSTRAINT "VehicleChecklist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChecklistItem" (
    "id" SERIAL NOT NULL,
    "label" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "checked" BOOLEAN NOT NULL,
    "condition" TEXT,
    "notes" TEXT,
    "checklistId" INTEGER NOT NULL,

    CONSTRAINT "ChecklistItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LogApp" (
    "id" SERIAL NOT NULL,
    "typeChange" "TypeChange" NOT NULL,
    "origin" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT,
    "data" JSONB NOT NULL,

    CONSTRAINT "LogApp_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Session_identificacion_key" ON "Session"("identificacion");

-- CreateIndex
CREATE UNIQUE INDEX "Session_email_key" ON "Session"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Credentials_sessionId_key" ON "Credentials"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "Client_identified_key" ON "Client"("identified");

-- CreateIndex
CREATE UNIQUE INDEX "SuppliersContact_proveedorId_key" ON "SuppliersContact"("proveedorId");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordResetToken_token_key" ON "PasswordResetToken"("token");

-- CreateIndex
CREATE INDEX "PasswordResetToken_token_idx" ON "PasswordResetToken"("token");

-- AddForeignKey
ALTER TABLE "Credentials" ADD CONSTRAINT "Credentials_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientContact" ADD CONSTRAINT "ClientContact_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AppointmentScheduling" ADD CONSTRAINT "AppointmentScheduling_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AppointmentScheduling" ADD CONSTRAINT "AppointmentScheduling_employedId_fkey" FOREIGN KEY ("employedId") REFERENCES "Session"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientVehicle" ADD CONSTRAINT "ClientVehicle_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceDetail" ADD CONSTRAINT "InvoiceDetail_invoiceDetail_id_fkey" FOREIGN KEY ("invoiceDetail_id") REFERENCES "Invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceDetail" ADD CONSTRAINT "InvoiceDetail_pieceId_fkey" FOREIGN KEY ("pieceId") REFERENCES "Pieces"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceDetail" ADD CONSTRAINT "InvoiceDetail_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Services"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Services" ADD CONSTRAINT "Services_serviceCategory_id_fkey" FOREIGN KEY ("serviceCategory_id") REFERENCES "ServiceCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pieces" ADD CONSTRAINT "Pieces_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "PieceCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InformationPieces" ADD CONSTRAINT "InformationPieces_moreInformation_id_fkey" FOREIGN KEY ("moreInformation_id") REFERENCES "Pieces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AvailablePieces_vehicle" ADD CONSTRAINT "AvailablePieces_vehicle_pieceVehiculo_id_fkey" FOREIGN KEY ("pieceVehiculo_id") REFERENCES "Pieces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SuppliersUbication" ADD CONSTRAINT "SuppliersUbication_proveedorId_fkey" FOREIGN KEY ("proveedorId") REFERENCES "Suppliers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SuppliersContact" ADD CONSTRAINT "SuppliersContact_proveedorId_fkey" FOREIGN KEY ("proveedorId") REFERENCES "Suppliers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SuppliersType" ADD CONSTRAINT "SuppliersType_proveedorId_fkey" FOREIGN KEY ("proveedorId") REFERENCES "Suppliers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PasswordResetToken" ADD CONSTRAINT "PasswordResetToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Session"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VehicleChecklist" ADD CONSTRAINT "VehicleChecklist_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "AppointmentScheduling"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChecklistItem" ADD CONSTRAINT "ChecklistItem_checklistId_fkey" FOREIGN KEY ("checklistId") REFERENCES "VehicleChecklist"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
