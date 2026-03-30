import API from './api';

class PaymentService {
    constructor() {
        this.razorpayLoaded = false;
        this.loadRazorpay();
    }

    // Load Razorpay script
    loadRazorpay() {
        if (typeof window !== 'undefined' && !window.Razorpay) {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.async = true;
            script.onload = () => {
                this.razorpayLoaded = true;
            };
            document.body.appendChild(script);
        } else if (window.Razorpay) {
            this.razorpayLoaded = true;
        }
    }

    // Create payment order
    async createPaymentOrder(amount, currency = 'INR', receipt = null) {
        try {
            const response = await API.post('/payments/create-order', {
                amount: amount * 100, // Convert to paise
                currency,
                receipt: receipt || `receipt_${Date.now()}`
            });
            return response.data;
        } catch (error) {
            console.error('Failed to create payment order:', error);
            throw error;
        }
    }

    // Initiate payment for consultation
    async payForConsultation(appointmentId, amount, doctorId) {
        try {
            // Create payment order
            const order = await this.createPaymentOrder(
                amount,
                'INR',
                `consultation_${appointmentId}`
            );

            // Get user info
            const userResponse = await API.get('/auth/profile');
            const user = userResponse.data;

            // Get appointment details
            const appointmentResponse = await API.get(`/appointments/${appointmentId}`);
            const appointment = appointmentResponse.data;

            // Configure Razorpay options
            const options = {
                key: 'rzp_test_1DP5mmOlF5G1ag', // Test key - replace with production key
                amount: order.amount,
                currency: order.currency,
                name: 'Nova Health Intelligence',
                description: `Consultation with Dr. ${appointment.doctorName}`,
                order_id: order.id,
                handler: async (response) => {
                    try {
                        // Verify payment on backend
                        const verification = await this.verifyPayment(response);
                        
                        if (verification.success) {
                            // Update appointment payment status
                            await API.put(`/appointments/${appointmentId}/payment`, {
                                paymentId: response.razorpay_payment_id,
                                orderId: response.razorpay_order_id,
                                signature: response.razorpay_signature,
                                amount: amount,
                                status: 'PAID'
                            });

                            // Send notification
                            await API.post('/notifications/payment-success', {
                                userId: user.id,
                                doctorId: doctorId,
                                appointmentId: appointmentId,
                                amount: amount
                            });

                            return {
                                success: true,
                                message: 'Payment successful',
                                paymentId: response.razorpay_payment_id
                            };
                        } else {
                            throw new Error('Payment verification failed');
                        }
                    } catch (error) {
                        console.error('Payment processing error:', error);
                        throw error;
                    }
                },
                prefill: {
                    name: user.name,
                    email: user.email,
                    contact: user.phone
                },
                notes: {
                    appointmentId: appointmentId,
                    doctorId: doctorId,
                    userId: user.id,
                    type: 'consultation'
                },
                theme: {
                    color: '#3b82f6'
                },
                modal: {
                    ondismiss: () => {
                        throw new Error('Payment cancelled by user');
                    }
                }
            };

            // Open Razorpay checkout
            if (this.razorpayLoaded && window.Razorpay) {
                const razorpay = new window.Razorpay(options);
                razorpay.open();
            } else {
                throw new Error('Payment gateway not loaded');
            }

        } catch (error) {
            console.error('Payment initiation failed:', error);
            throw error;
        }
    }

    // Verify payment signature
    async verifyPayment(paymentResponse) {
        try {
            const response = await API.post('/payments/verify', paymentResponse);
            return response.data;
        } catch (error) {
            console.error('Payment verification failed:', error);
            throw error;
        }
    }

    // Process refund
    async processRefund(paymentId, amount, reason = 'Requested by customer') {
        try {
            const response = await API.post('/payments/refund', {
                paymentId,
                amount: amount * 100, // Convert to paise
                reason
            });
            return response.data;
        } catch (error) {
            console.error('Refund processing failed:', error);
            throw error;
        }
    }

    // Get payment history
    async getPaymentHistory(userId, page = 1, limit = 20) {
        try {
            const response = await API.get(`/payments/history/${userId}?page=${page}&limit=${limit}`);
            return response.data;
        } catch (error) {
            console.error('Failed to get payment history:', error);
            throw error;
        }
    }

    // Get payment details
    async getPaymentDetails(paymentId) {
        try {
            const response = await API.get(`/payments/${paymentId}`);
            return response.data;
        } catch (error) {
            console.error('Failed to get payment details:', error);
            throw error;
        }
    }

    // Get payment statistics
    async getPaymentStats(period = '30d') {
        try {
            const response = await API.get(`/payments/stats?period=${period}`);
            return response.data;
        } catch (error) {
            console.error('Failed to get payment statistics:', error);
            throw error;
        }
    }

    // Download invoice
    async downloadInvoice(paymentId) {
        try {
            const response = await API.get(`/payments/invoice/${paymentId}`, {
                responseType: 'blob'
            });
            
            // Create download link
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `invoice-${paymentId}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            return { success: true };
        } catch (error) {
            console.error('Failed to download invoice:', error);
            throw error;
        }
    }

    // Send invoice via email
    async sendInvoiceEmail(paymentId, emailAddress) {
        try {
            const response = await API.post(`/payments/invoice/${paymentId}/email`, {
                emailAddress
            });
            return response.data;
        } catch (error) {
            console.error('Failed to send invoice email:', error);
            throw error;
        }
    }

    // Check payment status
    async checkPaymentStatus(orderId) {
        try {
            const response = await API.get(`/payments/status/${orderId}`);
            return response.data;
        } catch (error) {
            console.error('Failed to check payment status:', error);
            throw error;
        }
    }

    // Create payment link (for sharing)
    async createPaymentLink(amount, description, customerId = null) {
        try {
            const response = await API.post('/payments/create-link', {
                amount: amount * 100,
                description,
                customerId,
                accept_partial: false,
                expire_by: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours expiry
            });
            return response.data;
        } catch (error) {
            console.error('Failed to create payment link:', error);
            throw error;
        }
    }

    // Validate payment method
    validatePaymentMethod(type, details) {
        const validTypes = ['card', 'upi', 'netbanking', 'wallet'];
        
        if (!validTypes.includes(type)) {
            throw new Error('Invalid payment method');
        }

        switch (type) {
            case 'card':
                if (!details.cardNumber || !details.expiryMonth || !details.expiryYear || !details.cvv) {
                    throw new Error('Invalid card details');
                }
                break;
            case 'upi':
                if (!details.upiId || !details.upiId.includes('@')) {
                    throw new Error('Invalid UPI ID');
                }
                break;
            case 'netbanking':
                if (!details.bankCode) {
                    throw new Error('Bank code is required');
                }
                break;
            case 'wallet':
                if (!details.walletCode) {
                    throw new Error('Wallet code is required');
                }
                break;
        }

        return true;
    }

    // Calculate consultation fees
    calculateConsultationFees(doctorSpecialization, consultationType = 'video') {
        const baseFees = {
            'general': { video: 500, inPerson: 800, chat: 300 },
            'cardiology': { video: 1500, inPerson: 2000, chat: 1000 },
            'neurology': { video: 1200, inPerson: 1800, chat: 800 },
            'pediatrics': { video: 800, inPerson: 1200, chat: 500 },
            'orthopedics': { video: 1000, inPerson: 1500, chat: 700 },
            'dermatology': { video: 600, inPerson: 900, chat: 400 },
            'gynecology': { video: 800, inPerson: 1200, chat: 500 },
            'psychiatry': { video: 1000, inPerson: 1500, chat: 700 }
        };

        const fees = baseFees[doctorSpecialization.toLowerCase()] || baseFees['general'];
        return fees[consultationType] || fees['video'];
    }

    // Apply discounts and promotions
    applyDiscount(amount, promoCode = null, loyaltyPoints = 0) {
        let discountAmount = 0;
        let finalAmount = amount;

        // Apply promo code discount
        if (promoCode) {
            // This would typically validate the promo code with backend
            discountAmount += amount * 0.1; // 10% discount example
        }

        // Apply loyalty points (100 points = ₹10)
        if (loyaltyPoints > 0) {
            const pointsValue = Math.min(loyaltyPoints * 0.1, amount * 0.5); // Max 50% discount
            discountAmount += pointsValue;
        }

        finalAmount = Math.max(0, amount - discountAmount);

        return {
            originalAmount: amount,
            discountAmount,
            finalAmount,
            savings: discountAmount
        };
    }

    // Get supported payment methods
    getSupportedPaymentMethods() {
        return [
            {
                type: 'card',
                name: 'Credit/Debit Card',
                icon: '💳',
                supported: true
            },
            {
                type: 'upi',
                name: 'UPI',
                icon: '📱',
                supported: true
            },
            {
                type: 'netbanking',
                name: 'Net Banking',
                icon: '🏦',
                supported: true
            },
            {
                type: 'wallet',
                name: 'Wallet',
                icon: '👛',
                supported: true
            }
        ];
    }

    // Process subscription payment
    async processSubscriptionPayment(planId, amount) {
        try {
            const order = await this.createPaymentOrder(
                amount,
                'INR',
                `subscription_${planId}_${Date.now()}`
            );

            const userResponse = await API.get('/auth/profile');
            const user = userResponse.data;

            const options = {
                key: 'rzp_test_1DP5mmOlF5G1ag',
                amount: order.amount,
                currency: order.currency,
                name: 'Nova Health Intelligence',
                description: 'Premium Subscription',
                order_id: order.id,
                handler: async (response) => {
                    const verification = await this.verifyPayment(response);
                    
                    if (verification.success) {
                        await API.post('/subscriptions/activate', {
                            planId,
                            paymentId: response.razorpay_payment_id,
                            orderId: response.razorpay_order_id,
                            signature: response.razorpay_signature
                        });

                        return {
                            success: true,
                            message: 'Subscription activated successfully'
                        };
                    }
                },
                prefill: {
                    name: user.name,
                    email: user.email,
                    contact: user.phone
                },
                theme: {
                    color: '#3b82f6'
                }
            };

            const razorpay = new window.Razorpay(options);
            razorpay.open();

        } catch (error) {
            console.error('Subscription payment failed:', error);
            throw error;
        }
    }
}

export default new PaymentService();
