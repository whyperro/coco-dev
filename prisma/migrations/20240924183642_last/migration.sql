-- CreateEnum
CREATE TYPE "Role" AS ENUM ('SELLER', 'ADMIN', 'AUDITOR');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "user_role" "Role" NOT NULL DEFAULT 'SELLER';
