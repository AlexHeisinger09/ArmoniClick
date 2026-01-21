CREATE TABLE "aesthetic_notes" (
	"id" serial PRIMARY KEY NOT NULL,
	"patient_id" integer NOT NULL,
	"doctor_id" integer NOT NULL,
	"budget_id" integer,
	"facial_data" text NOT NULL,
	"drawings_data" text NOT NULL,
	"gender" varchar(10) DEFAULT 'female',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "aesthetic_notes" ADD CONSTRAINT "aesthetic_notes_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "aesthetic_notes" ADD CONSTRAINT "aesthetic_notes_doctor_id_users_id_fk" FOREIGN KEY ("doctor_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "aesthetic_notes" ADD CONSTRAINT "aesthetic_notes_budget_id_budgets_id_fk" FOREIGN KEY ("budget_id") REFERENCES "public"."budgets"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "idx_aesthetic_notes_doctor_patient" ON "aesthetic_notes" USING btree ("doctor_id","patient_id");--> statement-breakpoint
CREATE INDEX "idx_aesthetic_notes_budget" ON "aesthetic_notes" USING btree ("budget_id");--> statement-breakpoint
CREATE INDEX "idx_aesthetic_notes_created" ON "aesthetic_notes" USING btree ("created_at");