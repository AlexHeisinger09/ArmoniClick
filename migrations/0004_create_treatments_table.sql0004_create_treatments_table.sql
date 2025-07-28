-- migrations/0004_create_treatments_table.sql
CREATE TABLE "treatments" (
	"id_tratamiento" serial PRIMARY KEY NOT NULL,
	"id_paciente" integer NOT NULL,
	"id_doctor" integer NOT NULL,
	"fecha_control" date DEFAULT CURRENT_DATE NOT NULL,
	"hora_control" time NOT NULL,
	"fecha_proximo_control" date,
	"hora_proximo_control" time,
	"nombre_servicio" varchar NOT NULL,
	"producto" varchar,
	"lote_producto" varchar,
	"fecha_venc_producto" date,
	"dilucion" varchar,
	"foto1" varchar,
	"foto2" varchar,
	"descripcion" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"is_active" boolean DEFAULT true,
	CONSTRAINT "treatments_id_paciente_fkey" FOREIGN KEY ("id_paciente") REFERENCES "patients"("id") ON DELETE restrict ON UPDATE cascade,
	CONSTRAINT "treatments_id_doctor_fkey" FOREIGN KEY ("id_doctor") REFERENCES "users"("id") ON DELETE restrict ON UPDATE cascade
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX "idx_treatments_id_paciente" ON "treatments" ("id_paciente");
CREATE INDEX "idx_treatments_id_doctor" ON "treatments" ("id_doctor");
CREATE INDEX "idx_treatments_fecha_control" ON "treatments" ("fecha_control");
CREATE INDEX "idx_treatments_fecha_proximo_control" ON "treatments" ("fecha_proximo_control");
CREATE INDEX "idx_treatments_active" ON "treatments" ("is_active");