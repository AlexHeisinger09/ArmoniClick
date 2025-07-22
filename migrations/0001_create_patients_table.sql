-- migrations/0001_create_patients_table.sql
CREATE TABLE "patients" (
	"id" serial PRIMARY KEY NOT NULL,
	"rut" varchar NOT NULL,
	"nombres" varchar NOT NULL,
	"apellidos" varchar NOT NULL,
	"fecha_nacimiento" varchar NOT NULL,
	"telefono" varchar NOT NULL,
	"email" varchar NOT NULL,
	"direccion" varchar NOT NULL,
	"ciudad" varchar NOT NULL,
	"codigo_postal" varchar,
	"alergias" varchar,
	"medicamentos_actuales" varchar,
	"enfermedades_cronicas" varchar,
	"cirugias_previas" varchar,
	"hospitalizaciones_previas" varchar,
	"notas_medicas" varchar,
	"id_doctor" integer NOT NULL,
	"createdat" timestamp DEFAULT now() NOT NULL,
	"updatedat" timestamp,
	"isactive" boolean DEFAULT true,
	CONSTRAINT "patients_rut_unique" UNIQUE("rut"),
	CONSTRAINT "patients_id_doctor_fkey" FOREIGN KEY ("id_doctor") REFERENCES "users"("id") ON DELETE restrict ON UPDATE cascade
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX "idx_patients_id_doctor" ON "patients" ("id_doctor");
CREATE INDEX "idx_patients_rut" ON "patients" ("rut");
CREATE INDEX "idx_patients_nombres" ON "patients" ("nombres");
CREATE INDEX "idx_patients_apellidos" ON "patients" ("apellidos");
CREATE INDEX "idx_patients_active" ON "patients" ("isactive");