import { PrismaClient, users } from "@prisma/client";

/**
 * This method will get all of the users global permissions and combine (or) them up to return a number!
 *
 * @param prisma The prisma client instance
 * @param user The user to get the permissions ints for
 */
const getGlobalPermissions = async (
  prisma: PrismaClient,
  user: users
): Promise<number> => {
  // First it finds all the global roles the user has
  return (
    (
      await prisma.roles.findMany({
        select: {
          overrides: true,
        },
        where: {
          role_users: {
            some: {
              users: {
                id: user.id,
              },
            },
          },
        },
      })
    )
      // Then the map turns [{overrides: 69} ...] into [69...]
      .map((role: { overrides: number }) => role.overrides)
      // Then the reduce combines (ORs) the overrides together!
      .reduce((perms: number, newPerms: number) => {
        return perms | newPerms;
      }, 0)
  );
};

export default getGlobalPermissions;
