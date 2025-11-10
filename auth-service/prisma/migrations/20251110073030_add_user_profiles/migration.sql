-- CreateTable
CREATE TABLE "user_profiles" (
    "user_id" UUID NOT NULL,
    "fullname" VARCHAR(200),
    "bio" TEXT,
    "profile_picture_url" VARCHAR(255),
    "interests" VARCHAR(50)[],

    CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("user_id")
);

-- CreateIndex
CREATE INDEX "user_profiles_interests_idx" ON "user_profiles" USING GIN ("interests");

-- AddForeignKey
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;
