CREATE TABLE "schedule_blocks" (
	"id" serial PRIMARY KEY NOT NULL,
	"doctor_id" integer NOT NULL,
	"block_type" varchar(20) DEFAULT 'single_date' NOT NULL,
	"block_date" date NOT NULL,
	"start_time" time NOT NULL,
	"end_time" time NOT NULL,
	"recurring_pattern" varchar(50),
	"recurring_end_date" date,
	"reason" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
DROP INDEX "budgets_patient_active_unique";--> statement-breakpoint
ALTER TABLE "schedule_blocks" ADD CONSTRAINT "schedule_blocks_doctor_id_users_id_fk" FOREIGN KEY ("doctor_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "idx_schedule_blocks_doctor" ON "schedule_blocks" USING btree ("doctor_id");--> statement-breakpoint
CREATE INDEX "idx_schedule_blocks_date" ON "schedule_blocks" USING btree ("block_date");--> statement-breakpoint
CREATE INDEX "idx_schedule_blocks_doctor_date" ON "schedule_blocks" USING btree ("doctor_id","block_date");--> statement-breakpoint
CREATE INDEX "idx_schedule_blocks_type" ON "schedule_blocks" USING btree ("block_type");