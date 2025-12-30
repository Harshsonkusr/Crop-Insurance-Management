import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkClaims() {
  try {
    const claims = await prisma.claim.findMany({
      include: {
        policy: {
          include: {
            serviceProvider: true
          }
        }
      }
    });

    console.log('Claims found:', claims.length);
    claims.forEach((claim, i) => {
      console.log(`Claim ${i+1}:`, {
        id: claim.id,
        claimId: claim.claimId,
        assignedToId: claim.assignedToId,
        policyServiceProviderId: claim.policy?.serviceProviderId,
        status: claim.status,
        farmerId: claim.farmerId
      });
    });

    // Also check service providers
    const sps = await prisma.serviceProvider.findMany();
    console.log('\nService Providers found:', sps.length);
    sps.forEach((sp, i) => {
      console.log(`SP ${i+1}:`, {
        id: sp.id,
        name: sp.name,
        userId: sp.userId,
        status: sp.status
      });
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkClaims();
