// Payment Service for Nova Health Intelligence
// Supports Razorpay and Stripe integrations

export class PaymentService {
    constructor() {
        this.razorpayLoaded = false;
        this.stripeLoaded = false;
    }

    // Load Razorpay script
    async loadRazorpay() {
        if (this.razorpayLoaded) return;
        
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => {
                this.razorpayLoaded = true;
                resolve();
            };
            script.onerror = reject;
            document.body.appendChild(script);
        });
    }

    // Load Stripe script
    async loadStripe() {
        if (this.stripeLoaded) return;
        
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://js.stripe.com/v3/';
            script.onload = () => {
                this.stripeLoaded = true;
                resolve();
            };
            script.onerror = reject;
            document.body.appendChild(script);
        });
    }

    // Process payment with Razorpay
    async processRazorpayPayment(options) {
        await this.loadRazorpay();
        
        const {
            amount,
            currency = 'INR',
            receipt,
            notes = {},
            prefill = {},
            theme = {},
            onSuccess,
            onFailure,
            modal = {}
        } = options;

        const razorpayOptions = {
            key: 'rzp_test_1234567890abcdef', // Replace with actual Razorpay key
            amount: amount * 100, // Razorpay expects amount in paise
            currency,
            name: 'Nova Health Intelligence',
            description: notes.description || 'Healthcare Consultation',
            image: '/logo.png',
            order_id: receipt,
            handler: function (response) {
                // Payment successful
                onSuccess({
                    paymentId: response.razorpay_payment_id,
                    orderId: response.razorpay_order_id,
                    signature: response.razorpay_signature
                });
            },
            prefill: {
                name: prefill.name || '',
                email: prefill.email || '',
                contact: prefill.phone || ''
            },
            notes,
            theme: {
                color: '#3b82f6',
                backdrop_color: '#020617',
                ...theme
            },
            modal: {
                ondismiss: function() {
                    onFailure?.({ message: 'Payment cancelled by user' });
                },
                escape: true,
                handleback: true,
                confirm_close: true,
                animation: 'fade',
                ...modal
            }
        };

        const rzp = new window.Razorpay(razorpayOptions);
        rzp.open();
    }

    // Process payment with Stripe
    async processStripePayment(options) {
        await this.loadStripe();
        
        const {
            amount,
            currency = 'usd',
            paymentMethodId,
            confirmationMethod = 'automatic',
            onSuccess,
            onFailure,
            billingDetails = {}
        } = options;

        try {
            // Create payment intent on backend
            const response = await fetch('/api/payments/stripe/create-intent', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    amount,
                    currency,
                    payment_method_id: paymentMethodId,
                    confirmation_method: confirmationMethod,
                    billing_details: billingDetails
                })
            });

            const { client_secret, payment_intent_id } = await response.json();

            // Confirm payment on client
            const stripe = window.Stripe('pk_test_1234567890abcdef'); // Replace with actual Stripe key
            
            const { error, paymentIntent } = await stripe.confirmCardPayment(client_secret, {
                payment_method: paymentMethodId,
                billing_details: billingDetails
            });

            if (error) {
                onFailure({ message: error.message });
            } else {
                onSuccess({
                    paymentIntentId: paymentIntent.id,
                    status: paymentIntent.status
                });
            }
        } catch (error) {
            onFailure({ message: error.message });
        }
    }

    // Create payment order on backend
    async createPaymentOrder(orderData) {
        try {
            const response = await fetch('/api/payments/create-order', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(orderData)
            });

            if (!response.ok) {
                throw new Error('Failed to create payment order');
            }

            return await response.json();
        } catch (error) {
            console.error('Payment order creation failed:', error);
            throw error;
        }
    }

    // Verify payment status
    async verifyPayment(paymentData) {
        try {
            const response = await fetch('/api/payments/verify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(paymentData)
            });

            if (!response.ok) {
                throw new Error('Payment verification failed');
            }

            return await response.json();
        } catch (error) {
            console.error('Payment verification failed:', error);
            throw error;
        }
    }

    // Get payment history
    async getPaymentHistory(userId) {
        try {
            const response = await fetch(`/api/payments/history/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch payment history');
            }

            return await response.json();
        } catch (error) {
            console.error('Failed to fetch payment history:', error);
            throw error;
        }
    }

    // Process refund
    async processRefund(paymentId, amount, reason) {
        try {
            const response = await fetch('/api/payments/refund', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    payment_id: paymentId,
                    amount,
                    reason
                })
            });

            if (!response.ok) {
                throw new Error('Refund processing failed');
            }

            return await response.json();
        } catch (error) {
            console.error('Refund processing failed:', error);
            throw error;
        }
    }

    // Format currency
    formatCurrency(amount, currency = 'INR') {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency
        }).format(amount);
    }

    // Calculate consultation fee
    calculateConsultationFee(doctor, consultationType = 'video') {
        const baseFee = doctor.consultationFee || 500;
        const typeMultiplier = {
            'video': 1.0,
            'audio': 0.8,
            'chat': 0.6,
            'in-person': 1.5
        };
        
        const experienceBonus = doctor.experience ? Math.min(doctor.experience * 10, 500) : 0;
        const specialtyBonus = doctor.specialty === 'Cardiology' ? 200 : 
                              doctor.specialty === 'Neurology' ? 150 : 0;
        
        const totalFee = (baseFee + experienceBonus + specialtyBonus) * 
                        (typeMultiplier[consultationType] || 1.0);
        
        return Math.round(totalFee);
    }
}

export default new PaymentService();
