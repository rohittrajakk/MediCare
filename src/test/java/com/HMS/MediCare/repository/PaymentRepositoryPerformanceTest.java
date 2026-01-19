package com.HMS.MediCare.repository;

import com.HMS.MediCare.entity.Appointment;
import com.HMS.MediCare.entity.Doctor;
import com.HMS.MediCare.entity.Patient;
import com.HMS.MediCare.entity.Payment;
import com.HMS.MediCare.enums.AppointmentStatus;
import com.HMS.MediCare.enums.PaymentStatus;
import jakarta.persistence.EntityManager;
import org.hibernate.Session;
import org.hibernate.stat.Statistics;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
public class PaymentRepositoryPerformanceTest {

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private TestEntityManager entityManager;

    @Test
    public void testFindAll_NPlusOneProblem() {
        // Setup data with multiple patients and doctors to force N+1
        createMultipleData();

        entityManager.flush();
        entityManager.clear(); // Clear cache to force DB hits

        Session session = entityManager.getEntityManager().unwrap(Session.class);
        Statistics statistics = session.getSessionFactory().getStatistics();
        statistics.setStatisticsEnabled(true);
        statistics.clear();

        long startQueryCount = statistics.getPrepareStatementCount();

        List<Payment> payments = paymentRepository.findAll();

        // Iterate to trigger lazy loading
        for (Payment payment : payments) {
            payment.getPatient().getName();
            payment.getDoctor().getName();
            payment.getAppointment().getId();
        }

        long queryCount = statistics.getPrepareStatementCount() - startQueryCount;

        // Expectation:
        // Unoptimized: 1 (findAll) + 3 (Patient) + 3 (Doctor) = 7 queries.
        // Optimized: 1 query.
        assertThat(queryCount).as("Query count should be optimized to 1").isEqualTo(1);
    }

    @Test
    public void testFindByPatientId_NPlusOneProblem() {
         // Setup data with multiple payments for one patient but different doctors
         Patient patient = createDataWithMultipleDoctors();

        entityManager.flush();
        entityManager.clear();

        Session session = entityManager.getEntityManager().unwrap(Session.class);
        Statistics statistics = session.getSessionFactory().getStatistics();
        statistics.setStatisticsEnabled(true);
        statistics.clear();

        long startQueryCount = statistics.getPrepareStatementCount();

        List<Payment> payments = paymentRepository.findByPatientId(patient.getId());

        for (Payment payment : payments) {
             payment.getPatient().getName();
             payment.getDoctor().getName();
             payment.getAppointment().getId();
        }

        long queryCount = statistics.getPrepareStatementCount() - startQueryCount;

        // Unoptimized: 1 (find) + 1 (Patient - mostly cached/same) + 3 (Doctor) = ~5 queries
        // Optimized: 1 query.
        assertThat(queryCount).as("Query count should be optimized to 1").isEqualTo(1);
    }

    private void createMultipleData() {
        for (int i = 0; i < 3; i++) {
             Patient patient = Patient.builder().name("P"+i).email("p"+i+UUID.randomUUID()+"@e.com").password("pw").build();
             patientRepository.save(patient);
             Doctor doctor = Doctor.builder().name("D"+i).email("d"+i+UUID.randomUUID()+"@e.com").password("pw").specialization("S").build();
             doctorRepository.save(doctor);
             Appointment app = Appointment.builder().patient(patient).doctor(doctor).appointmentDate(LocalDate.now()).timeSlot(LocalTime.now()).build();
             appointmentRepository.save(app);
             Payment payment = Payment.builder().patient(patient).doctor(doctor).appointment(app).amount(BigDecimal.ONE).build();
             paymentRepository.save(payment);
        }
    }

    private Patient createDataWithMultipleDoctors() {
        Patient patient = Patient.builder()
                .name("John Doe")
                .email("john" + UUID.randomUUID() + "@example.com")
                .password("password")
                .build();
        patientRepository.save(patient);

        for (int i = 0; i < 3; i++) {
            Doctor doctor = Doctor.builder()
                .name("Dr. Smith " + i)
                .email("smith" + UUID.randomUUID() + "@example.com")
                .password("password")
                .specialization("Cardiology")
                .build();
            doctorRepository.save(doctor);

            Appointment appointment = Appointment.builder()
                    .patient(patient)
                    .doctor(doctor)
                    .appointmentDate(LocalDate.now().plusDays(i))
                    .timeSlot(LocalTime.of(10, 0))
                    .status(AppointmentStatus.PENDING)
                    .build();
            appointmentRepository.save(appointment);

            Payment payment = Payment.builder()
                    .appointment(appointment)
                    .patient(patient)
                    .doctor(doctor)
                    .amount(BigDecimal.TEN)
                    .paymentStatus(PaymentStatus.PENDING)
                    .build();
            paymentRepository.save(payment);
        }
        return patient;
    }
}
