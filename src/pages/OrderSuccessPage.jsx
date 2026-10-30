// src/pages/OrderSuccessPage.jsx
import { useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { CheckCircle, Clock } from 'lucide-react';

const OrderSuccessPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const bookingId = location.state?.bookingId;
  // 'paid' | 'pending' (online payment not completed) | 'cod' (pay after service)
  const payment = location.state?.payment;
  const paymentMessage = location.state?.paymentMessage;
  const paymentPending = payment === 'pending';

  useEffect(() => {
    if (!bookingId) {
      // If no bookingId, redirect to home after 3 seconds
      const timer = setTimeout(() => navigate('/'), 3000);
      return () => clearTimeout(timer);
    }
  }, [bookingId, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
        <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${paymentPending ? 'bg-amber-100' : 'bg-green-100'}`}>
          {paymentPending ? <Clock className="w-10 h-10 text-amber-600" /> : <CheckCircle className="w-10 h-10 text-green-600" />}
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">{paymentPending ? 'Booking Created' : 'Booking Confirmed!'}</h1>
        <p className="text-gray-600 mb-4">
          {payment === 'paid' && 'Payment received. Your booking has been successfully created.'}
          {payment === 'cod' && 'Your booking has been created. You can pay in cash after the service is completed.'}
          {paymentPending && 'Your booking is created, but the payment is still pending.'}
          {!payment && 'Your booking has been successfully created.'}
        </p>
        {paymentPending && (
          <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 p-3 rounded-lg mb-4">
            {paymentMessage ? `${paymentMessage} ` : ''}You can complete the payment anytime from My Bookings using the Pay Now button.
          </p>
        )}
        {bookingId && (
          <p className="text-sm text-gray-500 bg-gray-50 p-2 rounded-lg mb-6">
            Booking ID: <span className="font-mono font-semibold">{bookingId}</span>
          </p>
        )}
        <div className="space-y-3">
          <Link
            to="/my-bookings"
            className="block w-full bg-emerald-600 text-white py-2.5 rounded-xl font-semibold hover:bg-emerald-700 transition"
          >
            {paymentPending ? 'Go to My Bookings to Pay' : 'View My Bookings'}
          </Link>
          <Link
            to="/"
            className="block w-full border border-gray-300 text-gray-700 py-2.5 rounded-xl font-semibold hover:bg-gray-50 transition"
          >
            Continue Shopping
          </Link>
        </div>
        <p className="text-xs text-gray-400 mt-6">
          {paymentPending ? 'Your booking is confirmed once the payment is completed.' : 'You will receive a confirmation email shortly.'}
        </p>
      </div>
    </div>
  );
};

export default OrderSuccessPage;