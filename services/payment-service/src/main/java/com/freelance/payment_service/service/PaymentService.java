package com.freelance.payment_service.service;

import com.freelance.payment_service.model.Payment;
import com.freelance.payment_service.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;

    public Payment createPayment(Payment payment) {
        if (payment.getStatus() == null) {
            payment.setStatus("PENDING");
        }
        return paymentRepository.save(payment);
    }

    public List<Payment> getAllPayments() {
        return paymentRepository.findAll();
    }

    public Payment getPaymentById(UUID id) {
        return paymentRepository.findById(id).orElse(null);
    }

    public Payment updatePaymentStatus(UUID id, String status) {
        Payment payment = getPaymentById(id);
        if (payment != null) {
            payment.setStatus(status);
            return paymentRepository.save(payment);
        }
        return null;
    }

    public void deletePayment(UUID id) {
        paymentRepository.deleteById(id);
    }
}
