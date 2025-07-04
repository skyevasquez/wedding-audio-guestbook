import { mutation } from "./_generated/server";
import { v } from "convex/values";

// Generate a random access code
function generateAccessCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Helper function to generate a unique access code
async function generateUniqueAccessCode(ctx: any): Promise<string> {
  let accessCode: string;
  let existingEvent;
  
  do {
    accessCode = generateAccessCode();
    existingEvent = await ctx.db
      .query("events")
      .withIndex("by_access_code", (q: any) => q.eq("accessCode", accessCode))
      .first();
  } while (existingEvent);
  
  return accessCode;
}

// Migration to add accessCode to existing events
export const addAccessCodeToEvents = mutation({
  handler: async (ctx) => {
    const events = await ctx.db.query("events").collect();
    
    for (const event of events) {
      // Check if event already has accessCode
      if (!(event as any).accessCode) {
        const accessCode = await generateUniqueAccessCode(ctx);
        await ctx.db.patch(event._id, {
          accessCode,
          updatedAt: Date.now(),
        });
        console.log(`Added accessCode ${accessCode} to event ${event._id}`);
      }
    }
    
    return { success: true, message: "Migration completed" };
  },
});