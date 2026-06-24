const Razorpay = require('razorpay');
const env = require('./env');

if (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) {
  throw new Error('RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET missing');
}

const razorpay = new Razorpay({
  key_id: env.RAZORPAY_KEY_ID,
  key_secret: env.RAZORPAY_KEY_SECRET
});

module.exports = razorpay;
