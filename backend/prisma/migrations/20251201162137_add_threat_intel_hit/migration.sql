-- CreateTable
CREATE TABLE "ThreatIntelHit" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "verdict" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "urlId" TEXT NOT NULL,

    CONSTRAINT "ThreatIntelHit_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ThreatIntelHit" ADD CONSTRAINT "ThreatIntelHit_urlId_fkey" FOREIGN KEY ("urlId") REFERENCES "Url"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
