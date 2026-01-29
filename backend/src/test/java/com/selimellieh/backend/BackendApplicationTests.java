package com.selimellieh.backend;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.Map;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.selimellieh.backend.entity.Role;
import com.selimellieh.backend.entity.User;
import com.selimellieh.backend.repository.UserRepository;

@SpringBootTest(properties = {
	"spring.datasource.url=jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1;MODE=PostgreSQL",
	"spring.datasource.driverClassName=org.h2.Driver",
	"spring.datasource.username=sa",
	"spring.datasource.password=",
	"spring.jpa.hibernate.ddl-auto=create-drop",
	"spring.jpa.show-sql=false",
	"JWT_SECRET=TestJwtSecretKeyForLocalTestsOnly1234567890",
	"ACCESS_EXPIRATION=3600000",
	"REFRESH_EXPIRATION=86400000"
})
class BackendApplicationTests {

	private static final String TEST_EMAIL = "test.user@example.com";
	private static final String TEST_PASSWORD = "testpassword";

	private MockMvc mockMvc;

	@Autowired
	private WebApplicationContext webApplicationContext;

	private final ObjectMapper objectMapper = new ObjectMapper();

	@Autowired
	private UserRepository userRepository;

	@Autowired
	private PasswordEncoder passwordEncoder;

	@BeforeEach
	void setup() {
		userRepository.deleteAll();
		userRepository.save(new User(TEST_EMAIL, passwordEncoder.encode(TEST_PASSWORD), Role.USER));
		this.mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext)
			.apply(springSecurity())
			.build();
	}

	@Test
	void loginReturnsTokensForValidUser() throws Exception {
		Map<String, String> payload = Map.of(
			"email", TEST_EMAIL,
			"password", TEST_PASSWORD
		);

		MvcResult result = mockMvc.perform(
			post("/api/auth/login")
				.contentType(MediaType.APPLICATION_JSON)
				.content(objectMapper.writeValueAsString(payload))
		)
			.andExpect(status().isOk())
			.andReturn();

		Map<String, Object> response = objectMapper.readValue(
			result.getResponse().getContentAsString(),
			new TypeReference<Map<String, Object>>() {}
		);

		assertThat(response.get("accessToken")).isNotNull();
		assertThat(response.get("refreshToken")).isNotNull();
		assertThat(response.get("email")).isEqualTo(TEST_EMAIL);
	}

	@Test
	void registerCreatesUserAndReturnsTokens() throws Exception {
		Map<String, String> payload = Map.of(
			"email", "new.user@example.com",
			"password", "newpassword"
		);

		MvcResult result = mockMvc.perform(
			post("/api/auth/register")
				.contentType(MediaType.APPLICATION_JSON)
				.content(objectMapper.writeValueAsString(payload))
		)
			.andExpect(status().isCreated())
			.andReturn();

		Map<String, Object> response = objectMapper.readValue(
			result.getResponse().getContentAsString(),
			new TypeReference<Map<String, Object>>() {}
		);

		assertThat(response.get("email")).isEqualTo("new.user@example.com");
		assertThat(userRepository.findByEmail("new.user@example.com")).isNotNull();
	}

	@Test
	void refreshReturnsNewTokens() throws Exception {
		Map<String, Object> loginResponse = loginAndGetTokens(TEST_EMAIL, TEST_PASSWORD);
		String refreshToken = (String) loginResponse.get("refreshToken");

		Map<String, String> payload = Map.of("refreshToken", refreshToken);

		MvcResult result = mockMvc.perform(
			post("/api/auth/refresh")
				.contentType(MediaType.APPLICATION_JSON)
				.content(objectMapper.writeValueAsString(payload))
		)
			.andExpect(status().isOk())
			.andReturn();

		Map<String, Object> response = objectMapper.readValue(
			result.getResponse().getContentAsString(),
			new TypeReference<Map<String, Object>>() {}
		);

		assertThat(response.get("accessToken")).isNotNull();
		assertThat(response.get("refreshToken")).isNotNull();
		assertThat(response.get("email")).isEqualTo(TEST_EMAIL);
	}

	@Test
	void meReturnsAuthenticatedUser() throws Exception {
		Map<String, Object> loginResponse = loginAndGetTokens(TEST_EMAIL, TEST_PASSWORD);
		String accessToken = (String) loginResponse.get("accessToken");

		MvcResult result = mockMvc.perform(
			get("/api/user/me")
				.header("Authorization", "Bearer " + accessToken)
		)
			.andExpect(status().isOk())
			.andReturn();

		Map<String, Object> response = objectMapper.readValue(
			result.getResponse().getContentAsString(),
			new TypeReference<Map<String, Object>>() {}
		);

		assertThat(response.get("email")).isEqualTo(TEST_EMAIL);
		assertThat(response.get("role")).isEqualTo(Role.USER.name());
	}

	@Test
	void logoutClearsRefreshToken() throws Exception {
		Map<String, Object> loginResponse = loginAndGetTokens(TEST_EMAIL, TEST_PASSWORD);
		String accessToken = (String) loginResponse.get("accessToken");

		mockMvc.perform(
			post("/api/auth/logout")
				.header("Authorization", "Bearer " + accessToken)
		)
			.andExpect(status().isOk());

		User user = userRepository.findByEmail(TEST_EMAIL);
		assertThat(user.getRefreshToken()).isNull();
	}

	private Map<String, Object> loginAndGetTokens(String email, String password) throws Exception {
		Map<String, String> payload = Map.of(
			"email", email,
			"password", password
		);

		MvcResult result = mockMvc.perform(
			post("/api/auth/login")
				.contentType(MediaType.APPLICATION_JSON)
				.content(objectMapper.writeValueAsString(payload))
		)
			.andExpect(status().isOk())
			.andReturn();

		return objectMapper.readValue(
			result.getResponse().getContentAsString(),
			new TypeReference<Map<String, Object>>() {}
		);
	}
}
