package com.uoa.planent;

import com.uoa.planent.model.User;
import com.uoa.planent.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.data.web.config.EnableSpringDataWebSupport;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.uoa.planent.model.Category;
import com.uoa.planent.repository.CategoryRepository;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import java.math.BigDecimal;

@SpringBootApplication
@EnableScheduling
@EnableAsync
@EnableSpringDataWebSupport(pageSerializationMode = EnableSpringDataWebSupport.PageSerializationMode.VIA_DTO)
public class PlanentApplication {

    private static final Logger logger = LoggerFactory.getLogger(PlanentApplication.class);

	public static void main(String[] args) {
		SpringApplication.run(PlanentApplication.class, args);
	}


    // create a default admin user if none exist
    @Bean
    public CommandLineRunner initDatabase(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            if (!userRepository.existsByUsername("admin")) {
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
                logger.info("First admin user created with username 'admin'.");
            }else{
                logger.info("Admin user already exists with username 'admin'.");
            }
        };
    }


    // The 10 canonical categories users may pick from.
    // "Other" stays last as a catch-all.
    public static final List<String> CANONICAL_CATEGORIES = List.of(
            "Music",
            "Sports",
            "Theatre",
            "Cinema",
            "Conference",
            "Workshop",
            "Festival",
            "Exhibition",
            "Nightlife",
            "Other"
    );

    @Bean
    public CommandLineRunner initCategories(CategoryRepository categoryRepository) {
        return args -> {
            Set<String> existing = categoryRepository.findAll().stream()
                    .map(Category::getCategoryName)
                    .collect(Collectors.toSet());

            for (String name : CANONICAL_CATEGORIES) {
                if (!existing.contains(name)) {
                    Category category = new Category();
                    category.setCategoryName(name);
                    categoryRepository.save(category);
                    logger.info("Seeded category: {}", name);
                }
            }
        };
    }

}
