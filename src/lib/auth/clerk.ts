import { auth, currentUser } from '@clerk/nextjs/server';

export async function getClerkAuth() {
  const { userId, orgId, orgRole } = await auth();
  return { userId, orgId, orgRole };
}

export async function getClerkUser() {
  const user = await currentUser();
  return user;
}
