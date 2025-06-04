CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"lastName" varchar NOT NULL,
	"username" varchar NOT NULL,
	"emailValidated" boolean DEFAULT false,
	"email" varchar NOT NULL,
	"password" varchar NOT NULL,
	"phone" varchar,
	"address" varchar,
	"zipCode" varchar,
	"city" varchar,
	"img" varchar,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp,
	"isActive" boolean DEFAULT true,
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
