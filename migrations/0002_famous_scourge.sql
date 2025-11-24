DROP INDEX "budgets_patient_active_unique";--> statement-breakpoint
ALTER TABLE "documents" ALTER COLUMN "patient_name" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "documents" ALTER COLUMN "patient_rut" SET NOT NULL;