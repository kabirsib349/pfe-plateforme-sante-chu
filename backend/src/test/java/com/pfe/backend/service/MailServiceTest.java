package com.pfe.backend.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MailServiceTest {

    @Mock
    private JavaMailSender mailSender;

    @Mock
    private MimeMessage mimeMessage;

    @InjectMocks
    private MailService mailService;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(mailService, "fromAddress", "test@meddatacollect.com");
        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);
    }

    @Test
    void sendVerificationCodeEmail_ShouldSendEmail() {
        assertDoesNotThrow(() -> mailService.sendVerificationCodeEmail("user@test.com", "123456", 10));

        verify(mailSender).send(mimeMessage);
        // We assume success if mailSender.send called without exception.
    }

    @Test
    void sendOtpEmail_ShouldSendEmail() {
        assertDoesNotThrow(() -> mailService.sendOtpEmail("user@test.com", "654321", 5));

        verify(mailSender).send(mimeMessage);
    }
    
    // Test exception cases?
    // If mailSender throws exception, service catches and rethrows RuntimeException.
    @Test
    void sendOtpEmail_ShouldThrowRuntimeException_WhenMailSenderFails() {
        doThrow(new RuntimeException("Mail server failing")).when(mailSender).send(mimeMessage);
        
        org.junit.jupiter.api.Assertions.assertThrows(RuntimeException.class, () -> 
            mailService.sendOtpEmail("user@test.com", "654321", 5)
        );
    }

    @Test
    void sendVerificationCodeEmail_ShouldThrowRuntimeException_WhenMailSenderFails() {
        doThrow(new RuntimeException("Mail server failing")).when(mailSender).send(mimeMessage);

        org.junit.jupiter.api.Assertions.assertThrows(RuntimeException.class, () ->
                mailService.sendVerificationCodeEmail("user@test.com", "123456", 10)
        );
    }

    @Test
    void sendVerificationCodeEmail_ShouldThrowRuntimeException_WhenMessagingExceptionOccurs() throws MessagingException {
        // Trigger MessagingException via mimeMessage method interaction
        doThrow(new MessagingException("Encoding error")).when(mimeMessage).setSubject(anyString());

        org.junit.jupiter.api.Assertions.assertThrows(RuntimeException.class, () ->
                mailService.sendVerificationCodeEmail("user@test.com", "123456", 10)
        );
    }

    @Test
    void sendOtpEmail_ShouldThrowRuntimeException_WhenMessagingExceptionOccurs() throws MessagingException {
        // Trigger MessagingException via mimeMessage method interaction
        doThrow(new MessagingException("Encoding error")).when(mimeMessage).setSubject(anyString());

        org.junit.jupiter.api.Assertions.assertThrows(RuntimeException.class, () ->
                mailService.sendOtpEmail("user@test.com", "654321", 5)
        );
    }
}
