import API from './api';
import SocketService from './socket';

class PrescriptionService {
    constructor() {
        this.listeners = new Map();
        this.setupSocketListeners();
    }

    setupSocketListeners() {
        // Listen for new prescriptions
        SocketService.on('new-prescription', (data) => {
            this.notifyListeners('new-prescription', data);
        });

        // Listen for prescription updates
        SocketService.on('prescription-updated', (data) => {
            this.notifyListeners('prescription-updated', data);
        });

        // Listen for prescription deletions
        SocketService.on('prescription-deleted', (data) => {
            this.notifyListeners('prescription-deleted', data);
        });
    }

    // Subscribe to prescription events
    subscribe(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event).add(callback);
    }

    // Unsubscribe from prescription events
    unsubscribe(event, callback) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).delete(callback);
        }
    }

    // Notify all listeners of an event
    notifyListeners(event, data) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error('Error in prescription event listener:', error);
                }
            });
        }
    }

    // Add a new prescription
    async addPrescription(prescriptionData) {
        try {
            const response = await API.post('/prescriptions', prescriptionData);
            
            // Emit real-time event
            SocketService.sendMessage({
                type: 'new-prescription',
                data: response.data,
                roomId: `patient-${prescriptionData.patientId}`
            });

            return response.data;
        } catch (error) {
            console.error('Failed to add prescription:', error);
            throw error;
        }
    }

    // Update a prescription
    async updatePrescription(prescriptionId, updateData) {
        try {
            const response = await API.put(`/prescriptions/${prescriptionId}`, updateData);
            
            // Emit real-time event
            SocketService.sendMessage({
                type: 'prescription-updated',
                data: response.data,
                roomId: `patient-${updateData.patientId}`
            });

            return response.data;
        } catch (error) {
            console.error('Failed to update prescription:', error);
            throw error;
        }
    }

    // Delete a prescription
    async deletePrescription(prescriptionId, patientId) {
        try {
            await API.delete(`/prescriptions/${prescriptionId}`);
            
            // Emit real-time event
            SocketService.sendMessage({
                type: 'prescription-deleted',
                data: { prescriptionId, patientId },
                roomId: `patient-${patientId}`
            });

            return { success: true };
        } catch (error) {
            console.error('Failed to delete prescription:', error);
            throw error;
        }
    }

    // Get patient prescriptions
    async getPatientPrescriptions(patientId) {
        try {
            const response = await API.get(`/prescriptions/patient/${patientId}`);
            return response.data;
        } catch (error) {
            console.error('Failed to get patient prescriptions:', error);
            throw error;
        }
    }

    // Get doctor prescriptions
    async getDoctorPrescriptions(doctorId) {
        try {
            const response = await API.get(`/prescriptions/doctor/${doctorId}`);
            return response.data;
        } catch (error) {
            console.error('Failed to get doctor prescriptions:', error);
            throw error;
        }
    }

    // Get active prescriptions for a patient
    async getActivePrescriptions(patientId) {
        try {
            const response = await API.get(`/prescriptions/patient/${patientId}/active`);
            return response.data;
        } catch (error) {
            console.error('Failed to get active prescriptions:', error);
            throw error;
        }
    }

    // Mark prescription as taken
    async markAsTaken(prescriptionId, doseTime) {
        try {
            const response = await API.post(`/prescriptions/${prescriptionId}/mark-taken`, {
                doseTime,
                timestamp: new Date().toISOString()
            });
            
            // Emit real-time event
            SocketService.sendMessage({
                type: 'prescription-taken',
                data: response.data,
                roomId: `patient-${response.data.patientId}`
            });

            return response.data;
        } catch (error) {
            console.error('Failed to mark prescription as taken:', error);
            throw error;
        }
    }

    // Get prescription adherence data
    async getAdherenceData(patientId, period = '30d') {
        try {
            const response = await API.get(`/prescriptions/patient/${patientId}/adherence?period=${period}`);
            return response.data;
        } catch (error) {
            console.error('Failed to get adherence data:', error);
            throw error;
        }
    }

    // Check for drug interactions
    async checkDrugInteractions(medicines) {
        try {
            const response = await API.post('/prescriptions/check-interactions', {
                medicines
            });
            return response.data;
        } catch (error) {
            console.error('Failed to check drug interactions:', error);
            throw error;
        }
    }

    // Get refill reminders
    async getRefillReminders(patientId) {
        try {
            const response = await API.get(`/prescriptions/patient/${patientId}/refill-reminders`);
            return response.data;
        } catch (error) {
            console.error('Failed to get refill reminders:', error);
            throw error;
        }
    }

    // Schedule refill reminder
    async scheduleRefillReminder(prescriptionId, reminderDate) {
        try {
            const response = await API.post(`/prescriptions/${prescriptionId}/refill-reminder`, {
                reminderDate
            });
            return response.data;
        } catch (error) {
            console.error('Failed to schedule refill reminder:', error);
            throw error;
        }
    }

    // Generate prescription PDF
    async generatePrescriptionPDF(prescriptionId) {
        try {
            const response = await API.get(`/prescriptions/${prescriptionId}/pdf`, {
                responseType: 'blob'
            });
            
            // Create download link
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `prescription-${prescriptionId}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            return { success: true };
        } catch (error) {
            console.error('Failed to generate prescription PDF:', error);
            throw error;
        }
    }

    // Send prescription to pharmacy
    async sendToPharmacy(prescriptionId, pharmacyId) {
        try {
            const response = await API.post(`/prescriptions/${prescriptionId}/send-to-pharmacy`, {
                pharmacyId
            });
            
            // Emit real-time event
            SocketService.sendMessage({
                type: 'prescription-sent-to-pharmacy',
                data: response.data,
                roomId: `patient-${response.data.patientId}`
            });

            return response.data;
        } catch (error) {
            console.error('Failed to send prescription to pharmacy:', error);
            throw error;
        }
    }

    // Get prescription history
    async getPrescriptionHistory(patientId, limit = 50) {
        try {
            const response = await API.get(`/prescriptions/patient/${patientId}/history?limit=${limit}`);
            return response.data;
        } catch (error) {
            console.error('Failed to get prescription history:', error);
            throw error;
        }
    }

    // Search prescriptions
    async searchPrescriptions(query, filters = {}) {
        try {
            const response = await API.post('/prescriptions/search', {
                query,
                filters
            });
            return response.data;
        } catch (error) {
            console.error('Failed to search prescriptions:', error);
            throw error;
        }
    }

    // Get prescription statistics
    async getPrescriptionStats(period = '30d') {
        try {
            const response = await API.get(`/prescriptions/stats?period=${period}`);
            return response.data;
        } catch (error) {
            console.error('Failed to get prescription statistics:', error);
            throw error;
        }
    }
}

export default new PrescriptionService();
