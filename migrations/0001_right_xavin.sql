CREATE TABLE "appointments" (
	"id" serial PRIMARY KEY NOT NULL,
	"doctor_id" integer NOT NULL,
	"patient_id" integer,
	"guest_name" varchar(255),
	"guest_email" varchar(255),
	"guest_phone" varchar(50),
	"guest_rut" varchar(20),
	"title" varchar(255) NOT NULL,
	"description" text,
	"appointment_date" timestamp NOT NULL,
	"duration" integer DEFAULT 60,
	"status" varchar(20) DEFAULT 'pending',
	"type" varchar(20) DEFAULT 'consultation',
	"notes" text,
	"cancellation_reason" text,
	"confirmation_token" varchar(255),
	"confirmed_at" timestamp,
	"reminder_sent" boolean DEFAULT false,
	"reminder_sent_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "appointments_confirmation_token_unique" UNIQUE("confirmation_token")
);
--> statement-breakpoint
CREATE TABLE "budget_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"budget_id" integer NOT NULL,
	"pieza" varchar(100),
	"accion" varchar(255) NOT NULL,
	"valor" numeric(10, 2) NOT NULL,
	"orden" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"is_active" boolean DEFAULT true,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "budgets" (
	"id" serial PRIMARY KEY NOT NULL,
	"patient_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"total_amount" numeric(10, 2) DEFAULT '0' NOT NULL,
	"status" varchar(50) DEFAULT 'pendiente',
	"budget_type" varchar(50) DEFAULT 'odontologico' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "documents" (
	"id" serial PRIMARY KEY NOT NULL,
	"id_patient" integer NOT NULL,
	"id_doctor" integer NOT NULL,
	"document_type" varchar NOT NULL,
	"title" varchar NOT NULL,
	"content" text NOT NULL,
	"signature_data" text,
	"signed_date" timestamp,
	"patient_name" varchar,
	"patient_rut" varchar,
	"status" varchar DEFAULT 'pendiente',
	"createdat" timestamp DEFAULT now() NOT NULL,
	"updatedat" timestamp
);
--> statement-breakpoint
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
	"isactive" boolean DEFAULT true
);
--> statement-breakpoint
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
	"budget_item_id" integer,
	"status" varchar(50) DEFAULT 'pending',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"is_active" boolean DEFAULT true
);
--> statement-breakpoint
CREATE TABLE "services" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"nombre" varchar(255) NOT NULL,
	"tipo" varchar(50) NOT NULL,
	"valor" varchar(20) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "rut" varchar;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "signature" varchar;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_doctor_id_users_id_fk" FOREIGN KEY ("doctor_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "budget_items" ADD CONSTRAINT "budget_items_budget_id_budgets_id_fk" FOREIGN KEY ("budget_id") REFERENCES "public"."budgets"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "budgets" ADD CONSTRAINT "budgets_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "budgets" ADD CONSTRAINT "budgets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_id_patient_patients_id_fk" FOREIGN KEY ("id_patient") REFERENCES "public"."patients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_id_doctor_users_id_fk" FOREIGN KEY ("id_doctor") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patients" ADD CONSTRAINT "patients_id_doctor_users_id_fk" FOREIGN KEY ("id_doctor") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "treatments" ADD CONSTRAINT "treatments_id_paciente_patients_id_fk" FOREIGN KEY ("id_paciente") REFERENCES "public"."patients"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "treatments" ADD CONSTRAINT "treatments_id_doctor_users_id_fk" FOREIGN KEY ("id_doctor") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "treatments" ADD CONSTRAINT "treatments_budget_item_id_budget_items_id_fk" FOREIGN KEY ("budget_item_id") REFERENCES "public"."budget_items"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "idx_appointments_doctor" ON "appointments" USING btree ("doctor_id");--> statement-breakpoint
CREATE INDEX "idx_appointments_patient" ON "appointments" USING btree ("patient_id");--> statement-breakpoint
CREATE INDEX "idx_appointments_date" ON "appointments" USING btree ("appointment_date");--> statement-breakpoint
CREATE INDEX "idx_appointments_status" ON "appointments" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_appointments_confirmation_token" ON "appointments" USING btree ("confirmation_token");--> statement-breakpoint
CREATE INDEX "idx_appointments_reminder" ON "appointments" USING btree ("reminder_sent","appointment_date");--> statement-breakpoint
CREATE INDEX "idx_appointments_reminder_due" ON "appointments" USING btree ("appointment_date","reminder_sent","status");--> statement-breakpoint
CREATE INDEX "idx_budget_items_budget" ON "budget_items" USING btree ("budget_id");--> statement-breakpoint
CREATE INDEX "idx_budget_items_orden" ON "budget_items" USING btree ("budget_id","orden");--> statement-breakpoint
CREATE INDEX "idx_budget_items_active" ON "budget_items" USING btree ("is_active");--> statement-breakpoint
CREATE UNIQUE INDEX "budgets_patient_active_unique" ON "budgets" USING btree ("patient_id","status") WHERE status = 'activo';--> statement-breakpoint
CREATE INDEX "idx_budgets_user" ON "budgets" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_budgets_status" ON "budgets" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_budgets_created" ON "budgets" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_documents_patient" ON "documents" USING btree ("id_patient");--> statement-breakpoint
CREATE INDEX "idx_documents_doctor" ON "documents" USING btree ("id_doctor");--> statement-breakpoint
CREATE INDEX "idx_documents_type" ON "documents" USING btree ("document_type");--> statement-breakpoint
CREATE INDEX "idx_documents_status" ON "documents" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_documents_created" ON "documents" USING btree ("createdat");--> statement-breakpoint
CREATE UNIQUE INDEX "patients_rut_doctor_unique" ON "patients" USING btree ("rut","id_doctor") WHERE "patients"."isactive" = $1;--> statement-breakpoint
CREATE INDEX "idx_patients_rut_search" ON "patients" USING btree ("rut") WHERE "patients"."isactive" = $1;--> statement-breakpoint
CREATE INDEX "idx_patients_doctor" ON "patients" USING btree ("id_doctor");--> statement-breakpoint
CREATE INDEX "idx_patients_active" ON "patients" USING btree ("isactive");--> statement-breakpoint
CREATE INDEX "idx_patients_created" ON "patients" USING btree ("createdat");--> statement-breakpoint
CREATE INDEX "idx_treatments_id_paciente" ON "treatments" USING btree ("id_paciente");--> statement-breakpoint
CREATE INDEX "idx_treatments_id_doctor" ON "treatments" USING btree ("id_doctor");--> statement-breakpoint
CREATE INDEX "idx_treatments_fecha_control" ON "treatments" USING btree ("fecha_control");--> statement-breakpoint
CREATE INDEX "idx_treatments_fecha_proximo_control" ON "treatments" USING btree ("fecha_proximo_control");--> statement-breakpoint
CREATE INDEX "idx_treatments_active" ON "treatments" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_treatments_budget_item" ON "treatments" USING btree ("budget_item_id");--> statement-breakpoint
CREATE INDEX "idx_treatments_status" ON "treatments" USING btree ("status");