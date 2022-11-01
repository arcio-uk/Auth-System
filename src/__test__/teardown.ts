import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * This will clear up and "testing.com" accounts left over
 */
async () => {
	await prisma.users.deleteMany({
		where: {
			email: {
				endsWith: 'testing.com'
			},
		}
	});
};