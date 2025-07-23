# Database Migration: Fix Missing Address and Professional Fields

## Problem
Existing bookings in the database are missing `guardianAddress` and `selectedProfessional` fields because these were added to the model after bookings were already created.

## Solution
Run the migration script to update existing records with default values.

## How to Run Migration

### Option 1: On Render.com (Deployed Server)

1. **Access your Render dashboard**
2. **Go to your API service**
3. **Open the Shell/Console**
4. **Run the migration:**
   ```bash
   node migration-fix-missing-fields.js
   ```

### Option 2: Locally (if connected to production database)

1. **Make sure you have the production MONGODB_URI in your .env file**
2. **Run from the api directory:**
   ```bash
   node migration-fix-missing-fields.js
   ```

### Option 3: Using MongoDB Compass/CLI

If you have direct database access, you can run this MongoDB query:

```javascript
// Update all bookings missing guardianAddress
db.bookings.updateMany(
  { guardianAddress: { $exists: false } },
  { $set: { guardianAddress: "Address not provided (existing booking)" } }
);

// Update all bookings missing selectedProfessional  
db.bookings.updateMany(
  { selectedProfessional: { $exists: false } },
  { $set: { selectedProfessional: "not-specified" } }
);
```

## What the Migration Does

1. **Connects to your MongoDB database**
2. **Finds all bookings missing the new fields**
3. **Updates them with default values:**
   - `guardianAddress`: "Address not provided (existing booking)"
   - `selectedProfessional`: "not-specified"
4. **Shows progress and completion status**

## Expected Results

After running the migration:

✅ **Admin Dashboard will show:**
- Address: "Address not provided (existing booking)" for old bookings
- Professional: "Professional not selected (existing booking)" for old bookings

✅ **New bookings will continue to save:**
- Actual guardian addresses
- Selected professional preferences

## Safety Notes

- ✅ **Non-destructive**: Only adds missing fields, doesn't modify existing data
- ✅ **Idempotent**: Can be run multiple times safely
- ✅ **Backup recommended**: Always backup your database before migrations
- ✅ **Test first**: Run on a copy of your database if possible

## After Migration

1. **Deploy the updated code** with the new model fields
2. **Verify the admin dashboard** shows the default values for old bookings
3. **Test new bookings** to ensure they save address and professional correctly

## Troubleshooting

**If the script fails:**
1. Check your MONGODB_URI is correct
2. Ensure database connection is working
3. Verify you have write permissions to the database
4. Check the console output for specific error messages 