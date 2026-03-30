import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CreditCard, Smartphone, Wallet, CheckCircle, AlertCircle,
    Shield, Lock, ArrowRight, ArrowLeft, Calendar, Clock,
    User, Stethoscope, X, Info, Zap, Award, TrendingUp,
    FileText, Download, Mail, Phone, MapPin, Star,
    ChevronRight, RefreshCw, Loader2, IndianRupee, DollarSign
} from 'lucide-react';
import PaymentService from '../services/payment';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function PaymentModal({ 
    appointment, 
    doctor, 
    isOpen, 
    onClose, 
    onPaymentSuccess 
}) {
    const { user } = useAuth();
    const { addToast } = useToast();
    
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('razorpay');
    const [consultationType, setConsultationType] = useState('video');
    const [couponCode, setCouponCode] = useState('');
    const [couponApplied, setCouponApplied] = useState(null);
    const [orderDetails, setOrderDetails] = useState(null);
    const [paymentProcessing, setPaymentProcessing] = useState(false);
    
    // Calculate fees
    const baseFee = PaymentService.calculateConsultationFee(doctor, consultationType);
    const platformFee = Math.round(baseFee * 0.1); // 10% platform fee
    const discount = couponApplied ? couponApplied.discount : 0;
    const totalAmount = baseFee + platformFee - discount;

    useEffect(() => {
        if (isOpen && appointment) {
            setStep(1);
            setCouponCode('');
            setCouponApplied(null);
            setOrderDetails(null);
        }
    }, [isOpen, appointment]);

    const createPaymentOrder = async () => {
        try {
            setLoading(true);
            
            const orderData = {
                appointmentId: appointment.id,
                doctorId: doctor.id,
                patientId: user.id,
                amount: totalAmount,
                currency: 'INR',
                consultationType,
                paymentMethod,
                couponCode: couponApplied?.code || null
            };

            const response = await PaymentService.createPaymentOrder(orderData);
            setOrderDetails(response);
            setStep(3);
            
        } catch (error) {
            console.error('Failed to create payment order:', error);
            addToast({
                type: 'error',
                title: 'Payment Error',
                message: 'Failed to initialize payment. Please try again.'
            });
        } finally {
            setLoading(false);
        }
    };

    const applyCoupon = async () => {
        if (!couponCode.trim()) return;

        try {
            setLoading(true);
            
            const response = await API.post('/payments/apply-coupon', {
                code: couponCode,
                amount: baseFee + platformFee,
                doctorId: doctor.id
            });

            if (response.data.valid) {
                setCouponApplied(response.data);
                addToast({
                    type: 'success',
                    title: 'Coupon Applied',
                    message: `You saved ${PaymentService.formatCurrency(response.data.discount)}!`
                });
            } else {
                addToast({
                    type: 'error',
                    title: 'Invalid Coupon',
                    message: response.data.message || 'This coupon is not valid.'
                });
            }
        } catch (error) {
            console.error('Failed to apply coupon:', error);
            addToast({
                type: 'error',
                title: 'Coupon Error',
                message: 'Failed to apply coupon. Please try again.'
            });
        } finally {
            setLoading(false);
        }
    };

    const processPayment = async () => {
        try {
            setPaymentProcessing(true);
            
            const paymentOptions = {
                amount: totalAmount,
                currency: 'INR',
                receipt: orderDetails.orderId,
                notes: {
                    appointment_id: appointment.id,
                    doctor_id: doctor.id,
                    patient_id: user.id,
                    consultation_type: consultationType
                },
                prefill: {
                    name: `${user.firstName} ${user.lastName}`,
                    email: user.email,
                    phone: user.phone
                },
                onSuccess: async (paymentData) => {
                    try {
                        // Verify payment on backend
                        const verification = await PaymentService.verifyPayment({
                            ...paymentData,
                            orderId: orderDetails.orderId,
                            amount: totalAmount
                        });

                        if (verification.success) {
                            // Update appointment status
                            await API.put(`/appointments/${appointment.id}/payment-success`, {
                                paymentId: paymentData.paymentId,
                                amount: totalAmount
                            });

                            addToast({
                                type: 'success',
                                title: 'Payment Successful',
                                message: 'Your appointment has been confirmed!'
                            });

                            onPaymentSuccess?.(verification);
                            setStep(4);
                        } else {
                            throw new Error('Payment verification failed');
                        }
                    } catch (error) {
                        console.error('Payment verification failed:', error);
                        addToast({
                            type: 'error',
                            title: 'Verification Failed',
                            message: 'Payment was successful but verification failed. Please contact support.'
                        });
                    }
                },
                onFailure: (error) => {
                    console.error('Payment failed:', error);
                    addToast({
                        type: 'error',
                        title: 'Payment Failed',
                        message: error.message || 'Payment was cancelled or failed. Please try again.'
                    });
                }
            };

            if (paymentMethod === 'razorpay') {
                await PaymentService.processRazorpayPayment(paymentOptions);
            } else if (paymentMethod === 'stripe') {
                await PaymentService.processStripePayment(paymentOptions);
            }

        } catch (error) {
            console.error('Payment processing failed:', error);
            addToast({
                type: 'error',
                title: 'Payment Error',
                message: 'Failed to process payment. Please try again.'
            });
        } finally {
            setPaymentProcessing(false);
        }
    };

    const renderStep1 = () => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            <div>
                <h3 className="text-lg font-semibold text-white mb-4">Consultation Details</h3>
                
                <div className="bg-slate-800/50 rounded-xl p-4 space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                            <Stethoscope className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                            <h4 className="font-semibold text-white">Dr. {doctor.name}</h4>
                            <p className="text-sm text-slate-400">{doctor.specialty}</p>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/10">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-slate-400" />
                            <span className="text-sm text-white">
                                {new Date(appointment.date).toLocaleDateString()}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-slate-400" />
                            <span className="text-sm text-white">{appointment.time}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div>
                <h3 className="text-lg font-semibold text-white mb-4">Consultation Type</h3>
                <div className="grid grid-cols-1 gap-3">
                    {[
                        { value: 'video', label: 'Video Consultation', price: baseFee, icon: '📹' },
                        { value: 'audio', label: 'Audio Call', price: Math.round(baseFee * 0.8), icon: '📞' },
                        { value: 'chat', label: 'Chat Consultation', price: Math.round(baseFee * 0.6), icon: '💬' }
                    ].map((type) => (
                        <button
                            key={type.value}
                            onClick={() => setConsultationType(type.value)}
                            className={`p-4 rounded-xl border-2 transition-all ${
                                consultationType === type.value
                                    ? 'border-blue-500 bg-blue-500/10'
                                    : 'border-white/10 bg-slate-800/50 hover:border-white/20'
                            }`}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">{type.icon}</span>
                                    <div className="text-left">
                                        <h4 className="font-semibold text-white">{type.label}</h4>
                                        <p className="text-sm text-slate-400">30 minutes consultation</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-white">
                                        {PaymentService.formatCurrency(type.price)}
                                    </p>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex justify-between">
                <button
                    onClick={onClose}
                    className="px-6 py-3 bg-slate-700 text-white rounded-xl hover:bg-slate-600 transition-colors"
                >
                    Cancel
                </button>
                <button
                    onClick={() => setStep(2)}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all flex items-center gap-2"
                >
                    Continue
                    <ArrowRight className="w-4 h-4" />
                </button>
            </div>
        </motion.div>
    );

    const renderStep2 = () => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            <div>
                <h3 className="text-lg font-semibold text-white mb-4">Payment Method</h3>
                <div className="space-y-3">
                    {[
                        { value: 'razorpay', label: 'Razorpay', icon: '💳', description: 'Credit/Debit Cards, UPI, Net Banking' },
                        { value: 'stripe', label: 'Stripe', icon: '🌍', description: 'International Cards, Digital Wallets' }
                    ].map((method) => (
                        <button
                            key={method.value}
                            onClick={() => setPaymentMethod(method.value)}
                            className={`w-full p-4 rounded-xl border-2 transition-all ${
                                paymentMethod === method.value
                                    ? 'border-blue-500 bg-blue-500/10'
                                    : 'border-white/10 bg-slate-800/50 hover:border-white/20'
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">{method.icon}</span>
                                <div className="text-left">
                                    <h4 className="font-semibold text-white">{method.label}</h4>
                                    <p className="text-sm text-slate-400">{method.description}</p>
                                </div>
                                {paymentMethod === method.value && (
                                    <CheckCircle className="w-5 h-5 text-blue-400 ml-auto" />
                                )}
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <h3 className="text-lg font-semibold text-white mb-4">Coupon Code</h3>
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        placeholder="Enter coupon code"
                        className="flex-1 px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                    />
                    <button
                        onClick={applyCoupon}
                        disabled={loading || !couponCode.trim()}
                        className="px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-50"
                    >
                        {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : 'Apply'}
                    </button>
                </div>
                
                {couponApplied && (
                    <div className="mt-3 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                        <p className="text-sm text-green-400">
                            Coupon applied! You saved {PaymentService.formatCurrency(couponApplied.discount)}
                        </p>
                    </div>
                )}
            </div>

            <div className="bg-slate-800/50 rounded-xl p-4 space-y-3">
                <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Consultation Fee</span>
                    <span className="text-white">{PaymentService.formatCurrency(baseFee)}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Platform Fee</span>
                    <span className="text-white">{PaymentService.formatCurrency(platformFee)}</span>
                </div>
                {couponApplied && (
                    <div className="flex justify-between text-sm">
                        <span className="text-green-400">Discount</span>
                        <span className="text-green-400">-{PaymentService.formatCurrency(couponApplied.discount)}</span>
                    </div>
                )}
                <div className="pt-3 border-t border-white/10">
                    <div className="flex justify-between">
                        <span className="font-semibold text-white">Total Amount</span>
                        <span className="font-bold text-lg text-white">{PaymentService.formatCurrency(totalAmount)}</span>
                    </div>
                </div>
            </div>

            <div className="flex justify-between">
                <button
                    onClick={() => setStep(1)}
                    className="px-6 py-3 bg-slate-700 text-white rounded-xl hover:bg-slate-600 transition-colors flex items-center gap-2"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                </button>
                <button
                    onClick={createPaymentOrder}
                    disabled={loading}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 flex items-center gap-2"
                >
                    {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : 'Proceed to Pay'}
                    <IndianRupee className="w-4 h-4" />
                </button>
            </div>
        </motion.div>
    );

    const renderStep3 = () => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Secure Payment</h3>
                <p className="text-sm text-slate-400">
                    Your payment information is encrypted and secure
                </p>
            </div>

            <div className="bg-slate-800/50 rounded-xl p-4">
                <div className="flex justify-between items-center mb-3">
                    <span className="text-slate-400">Amount to Pay</span>
                    <span className="font-bold text-xl text-white">{PaymentService.formatCurrency(totalAmount)}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-slate-400">Payment Method</span>
                    <span className="text-white capitalize">{paymentMethod}</span>
                </div>
            </div>

            <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-slate-400">
                    <Lock className="w-4 h-4" />
                    <span>256-bit SSL encryption</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-400">
                    <Shield className="w-4 h-4" />
                    <span>PCI DSS compliant</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-400">
                    <CheckCircle className="w-4 h-4" />
                    <span>100% secure transactions</span>
                </div>
            </div>

            <div className="flex justify-between">
                <button
                    onClick={() => setStep(2)}
                    className="px-6 py-3 bg-slate-700 text-white rounded-xl hover:bg-slate-600 transition-colors"
                >
                    Cancel
                </button>
                <button
                    onClick={processPayment}
                    disabled={paymentProcessing}
                    className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-50 flex items-center gap-2"
                >
                    {paymentProcessing ? (
                        <>
                            <RefreshCw className="w-5 h-5 animate-spin" />
                            Processing...
                        </>
                    ) : (
                        <>
                            Pay {PaymentService.formatCurrency(totalAmount)}
                            <IndianRupee className="w-4 h-4" />
                        </>
                    )}
                </button>
            </div>
        </motion.div>
    );

    const renderStep4 = () => (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-6"
        >
            <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-10 h-10 text-white" />
            </div>
            
            <div>
                <h3 className="text-2xl font-bold text-white mb-2">Payment Successful!</h3>
                <p className="text-slate-400">
                    Your consultation with Dr. {doctor.name} has been confirmed
                </p>
            </div>

            <div className="bg-slate-800/50 rounded-xl p-4 space-y-3">
                <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Appointment ID</span>
                    <span className="text-white font-mono">{appointment.id}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Date & Time</span>
                    <span className="text-white">
                        {new Date(appointment.date).toLocaleDateString()} at {appointment.time}
                    </span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Consultation Type</span>
                    <span className="text-white capitalize">{consultationType}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Amount Paid</span>
                    <span className="text-white font-semibold">{PaymentService.formatCurrency(totalAmount)}</span>
                </div>
            </div>

            <div className="space-y-3">
                <button
                    onClick={() => window.open(`/patient/appointments/${appointment.id}`, '_blank')}
                    className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all"
                >
                    View Appointment Details
                </button>
                <button
                    onClick={onClose}
                    className="w-full px-6 py-3 bg-slate-700 text-white rounded-xl hover:bg-slate-600 transition-colors"
                >
                    Close
                </button>
            </div>
        </motion.div>
    );

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-slate-900/95 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="bg-slate-800 rounded-2xl border border-white/10 max-w-md w-full max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6">
                            {/* Progress Indicator */}
                            <div className="mb-6">
                                <div className="flex items-center justify-between mb-2">
                                    {[1, 2, 3, 4].map((stepNumber) => (
                                        <div key={stepNumber} className="flex items-center">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${
                                                stepNumber === step
                                                    ? 'bg-blue-600 text-white'
                                                    : stepNumber < step
                                                    ? 'bg-green-600 text-white'
                                                    : 'bg-slate-700 text-slate-400'
                                            }`}>
                                                {stepNumber < step ? <CheckCircle className="w-4 h-4" /> : stepNumber}
                                            </div>
                                            {stepNumber < 4 && (
                                                <div className={`flex-1 h-1 mx-2 ${
                                                    stepNumber < step ? 'bg-green-600' : 'bg-slate-700'
                                                }`} />
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <div className="flex justify-between text-xs text-slate-400">
                                    <span>Details</span>
                                    <span>Payment</span>
                                    <span>Review</span>
                                    <span>Confirm</span>
                                </div>
                            </div>

                            {/* Step Content */}
                            {step === 1 && renderStep1()}
                            {step === 2 && renderStep2()}
                            {step === 3 && renderStep3()}
                            {step === 4 && renderStep4()}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
