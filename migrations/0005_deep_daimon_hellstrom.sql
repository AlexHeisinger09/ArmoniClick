ALTER TABLE "budget_items" ADD COLUMN "status" varchar(50) DEFAULT 'planificado';--> statement-breakpoint
CREATE INDEX "idx_budget_items_status" ON "budget_items" USING btree ("status");