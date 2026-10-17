CREATE TABLE "school_attendance" (
	"id" serial PRIMARY KEY NOT NULL,
	"person_id" integer NOT NULL,
	"person_type" text NOT NULL,
	"class_id" integer,
	"attendance_date" date NOT NULL,
	"status" text NOT NULL,
	"note" text
);
--> statement-breakpoint
CREATE TABLE "school_classes" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"grade" text NOT NULL,
	"section" text NOT NULL,
	"teacher_id" integer,
	"room" text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "school_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"category" text NOT NULL,
	"event_date" date NOT NULL,
	"event_time" text DEFAULT '' NOT NULL,
	"location" text DEFAULT '' NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"color" text DEFAULT 'teal' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "school_fees" (
	"id" serial PRIMARY KEY NOT NULL,
	"student_id" integer NOT NULL,
	"period" text NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"paid_amount" numeric(12, 2) DEFAULT 0 NOT NULL,
	"due_date" date NOT NULL
);
--> statement-breakpoint
CREATE TABLE "homepage_media" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"caption" text DEFAULT '' NOT NULL,
	"media_type" text NOT NULL,
	"url" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "student_performance" (
	"id" serial PRIMARY KEY NOT NULL,
	"student_id" integer NOT NULL,
	"subject" text NOT NULL,
	"assessment" text NOT NULL,
	"score" numeric(7, 2) NOT NULL,
	"max_score" numeric(7, 2) NOT NULL,
	"recorded_at" date NOT NULL
);
--> statement-breakpoint
CREATE TABLE "school_staff" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"role" text NOT NULL,
	"email" text NOT NULL,
	"department" text NOT NULL,
	"avatar_url" text
);
--> statement-breakpoint
CREATE TABLE "school_students" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"admission_number" text NOT NULL,
	"grade" text NOT NULL,
	"section" text NOT NULL,
	"email" text NOT NULL,
	"phone" text DEFAULT '' NOT NULL,
	"avatar_url" text,
	"class_id" integer,
	CONSTRAINT "school_students_admission_number_unique" UNIQUE("admission_number")
);
--> statement-breakpoint
ALTER TABLE "school_fees" ADD CONSTRAINT "school_fees_student_id_school_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."school_students"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_performance" ADD CONSTRAINT "student_performance_student_id_school_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."school_students"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "school_students" ADD CONSTRAINT "school_students_class_id_school_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."school_classes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "school_attendance_person_day_idx" ON "school_attendance" USING btree ("person_id","person_type","attendance_date");