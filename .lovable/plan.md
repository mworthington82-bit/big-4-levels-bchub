

# Update Resources: Add PDF, Delete Two Resources, Improve Immersive Room Visibility

## Summary
I'll make three changes to the resources file and improve the visibility of Immersive Room resources:

1. **Delete** "Manage Breakout Rooms in Microsoft Teams" from resources
2. **Delete** "Creating Starter Activities" (Canva) from resources  
3. **Ensure Staff Guidelines PDF is visible** - it already exists but the Immersive Room filter is missing from the Resources page
4. **Copy your uploaded PDF** to ensure it's the latest version

---

## Changes to Make

### 1. Delete Resources (in `src/data/resources.ts`)

Remove these two entries:
- **"Manage Breakout Rooms in Microsoft Teams"** (id: `teams-8b`) - lines 88-97
- **"Creating Starter Activities"** (id: `canva-2`) - lines 174-183

### 2. Staff Guidelines PDF

Good news - the **Staff Guidelines for Immersive Room** resource already exists in the resources file with the correct PDF link (`/resources/Immersive_Room_Staff_Guidelines.pdf`).

However, you may not be seeing it because:
- There's **no "Immersive Room" filter button** on the Resources page - only Teams, Forms, Canva, Edpuzzle, and Copilot have filter buttons
- The resource only shows when you search for "immersive" or "staff"

I'll also copy your uploaded PDF to ensure it's the latest version.

### 3. Add Immersive Room Filter Button (in `src/pages/Resources.tsx`)

Add an "Immersive Room" option to the tool filter buttons so you can easily find all Immersive Room resources including the Staff Guidelines.

---

## Technical Details

### File Changes

| File | Action |
|------|--------|
| `src/data/resources.ts` | Remove `teams-8b` and `canva-2` entries |
| `src/pages/Resources.tsx` | Add Immersive Room to the filter buttons |
| `public/resources/Immersive_Room_Staff_Guidelines.pdf` | Replace with uploaded version |

### Resources After Changes

**Immersive Room section will contain:**
- Introduction to Immersive Learning (ThingLink 360 tour)
- Book the Immersive Room (Microsoft Forms booking)
- Staff Guidelines for Immersive Room (PDF with download button)

