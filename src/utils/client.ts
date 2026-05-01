import { db } from "../db";
import { clientRegistrations, clients } from "../db/schema";
import { eq, and } from "drizzle-orm";
import crypto from "node:crypto";

export interface RegistrationData {
  id: string;
  clientName: string;
  description?: string;
  redirectUris: string[];
  status: "pending" | "approved" | "rejected";
  createdBy?: string;
  reviewedBy?: string;
  reviewedAt?: Date;
  createdAt: Date;
  updatedAt?: Date;
}

export interface ClientCredential {
  clientId: string;
  clientSecret: string;
  clientName: string;
  message: string;
}

// Generate client credentials

export function generateClientCredentials(): {
  clientId: string;
  clientSecret: string;
} {
  const clientId = crypto.randomUUID();
  const clientSecret = crypto.randomBytes(32).toString("hex");
  return { clientId, clientSecret };
}

// create pending registration

export async function createClientRegistration(
  clientName: string,
  redirectUris: string[],
  description?: string,
  createdBy?: string,
): Promise<string> {
  const [registration] = await db
    .insert(clientRegistrations)
    .values({
      clientName,
      description,
      redirectUris,
      createdBy,
    })
    .returning();

  if (!registration) {
    throw new Error("Failed to create client registration");
  }
  return registration.id;
}

// Get all pending registrations

export async function getPendingRegistrations(): Promise<RegistrationData[]> {
  const pendingRegs = await db
    .select()
    .from(clientRegistrations)
    .where(eq(clientRegistrations.status, "pending"));

  return pendingRegs.map((reg) => ({
    id: reg.id,
    clientName: reg.clientName,
    description: reg.description || undefined,
    redirectUris: reg.redirectUris as string[],
    status: reg.status as "pending" | "approved" | "rejected",
    createdBy: reg.createdBy || undefined,
    reviewedBy: reg.reviewedBy || undefined,
    reviewedAt: reg.reviewedAt || undefined,
    createdAt: reg.createdAt,
    updatedAt: reg.updatedAt || undefined,
  }));
}

// get registration by id
export async function getRegistrationById(
  registrationId: string,
): Promise<RegistrationData | null> {
  const [reg] = await db
    .select()
    .from(clientRegistrations)
    .where(eq(clientRegistrations.id, registrationId))
    .limit(1);

  if (!reg) return null;

  return {
    id: reg.id,
    clientName: reg.clientName,
    description: reg.description || undefined,
    redirectUris: reg.redirectUris as string[],
    status: reg.status as "pending" | "approved" | "rejected",
    createdBy: reg.createdBy || undefined,
    reviewedBy: reg.reviewedBy || undefined,
    reviewedAt: reg.reviewedAt || undefined,
    createdAt: reg.createdAt,
    updatedAt: reg.updatedAt || undefined,
  };
}

// Approve  registration

export async function approveRegistration(
  registrationId: string,
  reviewerId: string,
): Promise<ClientCredential> {
  const registration = await getRegistrationById(registrationId);
  if (!registration) {
    throw new Error("Registration not found");
  }

  const { clientId, clientSecret } = generateClientCredentials();

  if (!registration.createdBy) {
    throw new Error("Invalid registration data: missing createdBy");
  }

  await db
    .update(clientRegistrations)
    .set({
      status: "approved",
      reviewedBy: reviewerId,
      reviewedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(clientRegistrations.id, registrationId));

  await db.insert(clients).values({
    clientId,
    clientName: registration.clientName,
    clientSecret,
    redirectUri: registration.redirectUris,
    grantTypes: ["authorization_code"],
    userId: registration.createdBy,
    scope: "openid profile email",
    verified: true,
    registration_id: registrationId,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  return {
    clientId,
    clientSecret,
    clientName: registration.clientName,
    message:
      "Save these credentials now. Client secret cannot be retrieved later.",
  };
}

// Reject registration

export async function rejectRegistration(
  registrationId: string,
  rejectedBy: string,
): Promise<void> {
  await db
    .update(clientRegistrations)
    .set({
      status: "rejected",
      reviewedBy: rejectedBy,
      reviewedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(clientRegistrations.id, registrationId));
}

// Approve client by clientID

export async function getApprovedClient(clientId: string) {
  const [client] = await db
    .select()
    .from(clients)
    .where(and(eq(clients.clientId, clientId), eq(clients.verified, true)))
    .limit(1);

  return client || null;
}
