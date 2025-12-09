-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ASSISTANT');

-- CreateEnum
CREATE TYPE "LoanType" AS ENUM ('PERSONAL', 'EDUCATION', 'VEHICLE', 'HOME', 'CREDIT_LINE', 'DEBT_CONSOLIDATION');

-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "bank" TEXT NOT NULL,
    "type" "LoanType" NOT NULL,
    "rate_apr" DOUBLE PRECISION NOT NULL,
    "min_income" INTEGER NOT NULL,
    "min_credit_score" INTEGER NOT NULL,
    "tenure_min_months" INTEGER NOT NULL DEFAULT 6,
    "tenure_max_months" INTEGER NOT NULL DEFAULT 60,
    "processing_fee_pct" DOUBLE PRECISION DEFAULT 0,
    "prepayment_allowed" BOOLEAN NOT NULL DEFAULT true,
    "disbursal_speed" TEXT DEFAULT 'standard',
    "docs_level" TEXT DEFAULT 'standard',
    "summary" TEXT,
    "faq" JSONB DEFAULT '[]',
    "terms" JSONB DEFAULT '{}',
    "match_score" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "credit_score" INTEGER,
    "monthly_income" INTEGER,
    "preferred_loan_type" "LoanType",
    "password_hash" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_chat_messages" (
    "id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_chat_messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "products_rate_apr_idx" ON "products"("rate_apr");

-- CreateIndex
CREATE INDEX "products_min_income_idx" ON "products"("min_income");

-- CreateIndex
CREATE INDEX "products_min_credit_score_idx" ON "products"("min_credit_score");

-- CreateIndex
CREATE INDEX "products_bank_idx" ON "products"("bank");

-- CreateIndex
CREATE INDEX "products_type_idx" ON "products"("type");

-- CreateIndex
CREATE INDEX "products_match_score_idx" ON "products"("match_score");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "ai_chat_messages_product_id_user_id_created_at_idx" ON "ai_chat_messages"("product_id", "user_id", "created_at");

-- CreateIndex
CREATE INDEX "ai_chat_messages_user_id_idx" ON "ai_chat_messages"("user_id");

-- AddForeignKey
ALTER TABLE "ai_chat_messages" ADD CONSTRAINT "ai_chat_messages_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_chat_messages" ADD CONSTRAINT "ai_chat_messages_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
