require('dotenv').config();
const mongoose = require('mongoose');
const Booking = require('./features/bookings/bookings.model');

// MongoDB connection string - use the same as in your server.js
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/lance-yuri-kids-spot';

async function fixMissingFields() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('🔗 Connected to MongoDB');

    // Find all bookings that are missing the new fields
    const bookingsToUpdate = await Booking.find({
      $or: [
        { guardianAddress: { $exists: false } },
        { selectedProfessional: { $exists: false } }
      ]
    });

    console.log(`📊 Found ${bookingsToUpdate.length} bookings to update`);

    if (bookingsToUpdate.length === 0) {
      console.log('✅ All bookings already have the required fields');
      return;
    }

    // Update each booking with default values
    let updated = 0;
    for (const booking of bookingsToUpdate) {
      const updateData = {};
      
      // Add default address if missing
      if (!booking.guardianAddress) {
        updateData.guardianAddress = 'Address not provided (existing booking)';
      }
      
      // Add default professional if missing
      if (!booking.selectedProfessional) {
        updateData.selectedProfessional = 'not-specified';
      }

      // Update the booking
      await Booking.findByIdAndUpdate(booking._id, updateData);
      updated++;
      
      console.log(`✅ Updated booking ${updated}/${bookingsToUpdate.length}: ${booking.childName} (${booking.guardianName})`);
    }

    console.log(`🎉 Successfully updated ${updated} bookings!`);
    console.log('📝 Missing addresses now show: "Address not provided (existing booking)"');
    console.log('📝 Missing professionals now show: "Professional not selected" in admin dashboard');

  } catch (error) {
    console.error('❌ Error during migration:', error);
  } finally {
    // Close the connection
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the migration
console.log('🚀 Starting database migration to fix missing fields...');
fixMissingFields(); 