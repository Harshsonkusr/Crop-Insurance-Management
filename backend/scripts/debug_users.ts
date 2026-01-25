
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const farmers = await prisma.user.findMany({
        where: { role: 'FARMER' },
        select: { id: true, name: true, mobileNumber: true, email: true, createdAt: true, status: true }
    });

    console.log('--- Registered Farmers ---');
    if (farmers.length === 0) {
        console.log('No farmers found.');
    } else {
        farmers.forEach(f => {
            console.log(`ID: ${f.id} | Name: ${f.name} | Mobile: ${f.mobileNumber} | Status: ${f.status} | Created: ${f.createdAt}`);
        });
    }

    const insurers = await prisma.user.findMany({
        where: { role: 'INSURER' },
        select: { id: true, name: true, mobileNumber: true, isApproved: true }
    });
    console.log('\n--- Registered Insurers ---');
    insurers.forEach(f => {
        console.log(`ID: ${f.id} | Name: ${f.name} | Mobile: ${f.mobileNumber} | Approved: ${f.isApproved}`);
    });
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
