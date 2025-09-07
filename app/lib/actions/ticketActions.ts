// /app/lib/actions/ticketActions.ts
import { doc, runTransaction, writeBatch, deleteDoc } from "firebase/firestore";
import { firestore } from "@/lib/firebase";

// Define the shape of the ticket data needed for the functions
interface TicketContext {
    id: string;
    residentId: string;
    assignedToId?: string;
    assignedToName?: string;
    finalPrice?: number;
    resolutionNotificationId?: string;
    serviceCategory?: string;
}

interface UserProfileContext {
    uid: string;
    balance: number;
}

/**
 * Handles the logic for a resident denying a ticket resolution.
 * @param ticket - The ticket object or context.
 */
export async function denyResolution(ticket: TicketContext) {
    if (!ticket.id || !ticket.resolutionNotificationId) {
        throw new Error("Missing ticket or notification ID.");
    }
    const ticketRef = doc(firestore, 'tickets', ticket.id);
    const notifRef = doc(firestore, 'notifications', ticket.resolutionNotificationId);

    // Use a batch to update the ticket and delete the notification
    const batch = writeBatch(firestore);
    batch.update(ticketRef, { status: 'In Progress' });
    batch.delete(notifRef);
    await batch.commit();
}


/**
 * Handles the transaction for a resident accepting a ticket resolution.
 * @param ticket - The ticket object or context.
 * @param residentProfile - The profile of the resident accepting.
 */
export async function acceptResolution(ticket: TicketContext, residentProfile: UserProfileContext) {
    if (!ticket.finalPrice || !ticket.assignedToId || !ticket.resolutionNotificationId) {
        throw new Error("Missing critical ticket information for payment.");
    }

    const PLATFORM_USER_ID = "PLATFORM_ACCOUNT";
    const cost = ticket.finalPrice;
    const siteCharge = cost * 0.05;
    const totalCost = cost + siteCharge;

    if (residentProfile.balance < totalCost) {
        throw new Error("Insufficient balance to complete this transaction.");
    }

    await runTransaction(firestore, async (transaction) => {
        const residentRef = doc(firestore, 'users', residentProfile.uid);
        const staffRef = doc(firestore, 'users', ticket.assignedToId!);
        const platformRef = doc(firestore, 'users', PLATFORM_USER_ID);
        const ticketRef = doc(firestore, 'tickets', ticket.id);
        const notifRef = doc(firestore, 'notifications', ticket.resolutionNotificationId!);

        const [residentDoc, staffDoc, platformDoc] = await Promise.all([
            transaction.get(residentRef),
            transaction.get(staffRef),
            transaction.get(platformRef)
        ]);

        if (!residentDoc.exists() || !staffDoc.exists() || !platformDoc.exists()) {
            throw new Error("A required user account (resident, staff, or platform) was not found.");
        }

        const residentPrevBalance = residentDoc.data().balance || 0;
        
        // Final check inside the transaction to prevent race conditions
        if (residentPrevBalance < totalCost) {
            throw new Error("Insufficient balance.");
        }

        const staffPrevBalance = staffDoc.data().balance || 0;
        const platformPrevBalance = platformDoc.data().balance || 0;

        const residentNewBalance = residentPrevBalance - totalCost;
        const staffNewBalance = staffPrevBalance + cost;
        const platformNewBalance = platformPrevBalance + siteCharge;

        // Perform all updates
        transaction.update(residentRef, { balance: residentNewBalance });
        transaction.update(staffRef, { balance: staffNewBalance });
        transaction.update(platformRef, { balance: platformNewBalance });
        transaction.update(ticketRef, { status: 'Resolved' });

        // Update the original notification to become a permanent receipt
        const finalNotifBody = `Cost: ${cost.toFixed(2)} Taka\nSite Charge: ${siteCharge.toFixed(2)} Taka\nTotal Cost: ${totalCost.toFixed(2)} Taka`;
        transaction.update(notifRef, {
            title: `Ticket Resolved: ${ticket.serviceCategory}`,
            body: finalNotifBody,
            isActionable: false,
            details: {
                previousBalance: residentPrevBalance,
                currentBalance: residentNewBalance,
                issuedBy: ticket.assignedToName,
            }
        });
    });
}