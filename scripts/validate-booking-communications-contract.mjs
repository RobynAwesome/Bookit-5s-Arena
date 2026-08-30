import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

function read(path) {
  return readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
}

const bookingModel = read('models/Booking.js');
const deliveryModel = read('models/BookingDelivery.js');
const userModel = read('models/User.js');
const registeredRoute = read('app/api/bookings/route.js');
const guestRoute = read('app/api/bookings/guest/route.js');
const whatsapp = read('lib/integrations/whatsapp.js');
const dispatcher = read('lib/bookings/dispatchBookingCommunications.js');
const bookingForm = read('components/BookingForm.jsx');
const adminDeliveries = read('app/api/admin/bookings/[id]/deliveries/route.js');

assert.match(bookingModel, /preferredChannel\s*:/);
assert.match(bookingModel, /default:\s*'whatsapp'/);
assert.match(bookingModel, /contactEmail\s*:/);
assert.match(bookingModel, /contactPhone\s*:/);

assert.match(
  deliveryModel,
  /BookingDeliverySchema\.index\([\s\S]*booking:\s*1[\s\S]*recipientType:\s*1[\s\S]*channel:\s*1[\s\S]*purpose:\s*1[\s\S]*unique:\s*true/
);
assert.match(deliveryModel, /'queued', 'sending', 'sent', 'failed', 'skipped'/);

assert.match(userModel, /communicationPreference:[\s\S]*default:\s*'whatsapp'/);

for (const route of [registeredRoute, guestRoute]) {
  assert.match(route, /dispatchBookingCommunications/);
  assert.match(route, /paymentStatus:\s*'reserved'/);
  assert.match(route, /preferredChannel/);
  assert.match(route, /communicationReceipts/);
}

assert.doesNotMatch(registeredRoute, /sendBookingConfirmation/);
assert.doesNotMatch(registeredRoute, /sendBookingWATip/);

assert.match(whatsapp, /mode:\s*'simulation'/);
assert.match(whatsapp, /success:\s*false[\s\S]*mode:\s*'simulation'/);
assert.doesNotMatch(whatsapp, /success:\s*true,\s*mode:\s*['"]simulation['"]/);

assert.match(dispatcher, /recipientType:\s*'user'[\s\S]*channel:\s*'email'[\s\S]*purpose:\s*'reservation_receipt'/);
assert.match(dispatcher, /recipientType:\s*'business'[\s\S]*channel:\s*'email'[\s\S]*purpose:\s*'reservation_receipt'/);
assert.match(dispatcher, /recipientType:\s*'business'[\s\S]*channel:\s*'whatsapp'[\s\S]*purpose:\s*'reservation_notice'/);
assert.match(dispatcher, /safePreference === 'whatsapp'/);
assert.match(dispatcher, /safePreference === 'sms'/);

assert.match(bookingForm, /useState\('whatsapp'\)/);
assert.match(bookingForm, /preferredChannel/);
assert.match(bookingForm, /A reservation receipt is always emailed to you and the venue/);

assert.match(adminDeliveries, /BookingDelivery\.find\(\{ booking: id \}\)/);
assert.match(adminDeliveries, /summary:/);

console.log('booking-communications-contract: PASS');
console.log('default user operational channel: whatsapp');
console.log('always-on reservation receipts: user email + business email');
console.log('always-on business operational alert: whatsapp');
console.log('production WhatsApp simulation success: forbidden');
console.log('admin delivery receipts: queryable by booking id');
