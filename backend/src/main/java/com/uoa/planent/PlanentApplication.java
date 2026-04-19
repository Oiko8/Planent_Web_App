package com.uoa.planent;

import com.uoa.planent.model.User;
import com.uoa.planent.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;

@SpringBootApplication
public class PlanentApplication {

    private static final Logger logger = LoggerFactory.getLogger(PlanentApplication.class);

	public static void main(String[] args) {
		SpringApplication.run(PlanentApplication.class, args);
	}


    // create a default admin user if none exist
    @Bean
    public CommandLineRunner initDatabase(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            if (userRepository.count() == 0) {
                User admin = User.builder()
                        .username("admin")
                        .password(passwordEncoder.encode("admin"))
                        .isAdmin(true)
                        .isApproved(true)
                        .firstName("John")
                        .lastName("Doe")
                        .email("john.doe@example.com")
                        .phone("2101234567")
                        .country("Greece")
                        .city("Athens")
                        .address("Athinas 10")
                        .zipcode("10551")
                        .latitude(new BigDecimal("37.9775"))
                        .longitude(new BigDecimal("23.7265"))
                        .afm("123456789")
                        .build();

                userRepository.save(admin);
                logger.info("First (admin) user created!");
            }
        };
    }

}
