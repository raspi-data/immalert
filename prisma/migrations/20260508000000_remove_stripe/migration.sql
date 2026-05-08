-- DropForeignKey
ALTER TABLE "subscriptions" DROP CONSTRAINT "subscriptions_userId_fkey";

-- DropTable
DROP TABLE "subscriptions";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "trialStart",
DROP COLUMN "subscriptionStatus",
DROP COLUMN "stripeCustomerId";
