package com.decisionhub.config;

import com.decisionhub.common.enums.AccountStatus;
import com.decisionhub.common.enums.AuthProvider;
import com.decisionhub.common.enums.CommunityVisibility;
import com.decisionhub.common.enums.DecisionStatus;
import com.decisionhub.common.enums.DecisionVisibility;
import com.decisionhub.common.enums.MemberRole;
import com.decisionhub.common.enums.MemberStatus;
import com.decisionhub.common.enums.RoleType;
import com.decisionhub.common.enums.VoteType;
import com.decisionhub.entity.Community;
import com.decisionhub.entity.CommunityMember;
import com.decisionhub.entity.Decision;
import com.decisionhub.entity.Option;
import com.decisionhub.entity.Role;
import com.decisionhub.entity.User;
import com.decisionhub.repository.CommunityMemberRepository;
import com.decisionhub.repository.CommunityRepository;
import com.decisionhub.repository.DecisionRepository;
import com.decisionhub.repository.RoleRepository;
import com.decisionhub.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final CommunityRepository communityRepository;
    private final CommunityMemberRepository communityMemberRepository;
    private final DecisionRepository decisionRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        log.info("Initializing database with default roles, users, communities and decisions...");

        Role adminRole = createRoleIfNotFound(RoleType.ROLE_ADMIN, "System Administrator");
        Role moderatorRole = createRoleIfNotFound(RoleType.ROLE_MODERATOR, "Content Moderator");
        Role userRole = createRoleIfNotFound(RoleType.ROLE_USER, "Standard User");

        User adminUser = createUserIfNotFound("admin", "admin@decisionhub.com", "Admin123!", adminRole);
        User modUser = createUserIfNotFound("moderator", "moderator@decisionhub.com", "Mod123!", moderatorRole);
        User stdUser = createUserIfNotFound("user", "user@decisionhub.com", "User123!", userRole);

        seedCommunitiesAndDecisionsIfEmpty(adminUser, stdUser);
        
        log.info("Database initialization completed.");
    }

    private Role createRoleIfNotFound(RoleType roleType, String description) {
        return roleRepository.findByRoleName(roleType)
                .orElseGet(() -> roleRepository.save(Role.builder()
                        .roleName(roleType)
                        .description(description)
                        .build()));
    }

    private User createUserIfNotFound(String username, String email, String password, Role role) {
        return userRepository.findByUsername(username)
                .orElseGet(() -> {
                    User user = User.builder()
                            .username(username)
                            .email(email)
                            .password(passwordEncoder.encode(password))
                            .fullName(username.substring(0, 1).toUpperCase() + username.substring(1) + " User")
                            .role(role)
                            .provider(AuthProvider.LOCAL)
                            .accountStatus(AccountStatus.ACTIVE)
                            .emailVerified(true)
                            .build();
                    User saved = userRepository.save(user);
                    log.info("Created default user: {} with role: {}", username, role.getRoleName());
                    return saved;
                });
    }

    private void seedCommunitiesAndDecisionsIfEmpty(User adminUser, User stdUser) {
        if (communityRepository.count() == 0) {
            Community techCommunity = Community.builder()
                    .name("Software Architecture & Engineering")
                    .description("Collaborative discussions and architectural decisions for core software design.")
                    .owner(adminUser)
                    .visibility(CommunityVisibility.PUBLIC)
                    .build();
            communityRepository.save(techCommunity);

            communityMemberRepository.save(CommunityMember.builder()
                    .community(techCommunity)
                    .user(adminUser)
                    .memberRole(MemberRole.OWNER)
                    .status(MemberStatus.ACTIVE)
                    .build());

            communityMemberRepository.save(CommunityMember.builder()
                    .community(techCommunity)
                    .user(stdUser)
                    .memberRole(MemberRole.MEMBER)
                    .status(MemberStatus.ACTIVE)
                    .build());

            Community productCommunity = Community.builder()
                    .name("Product Strategy & Innovation")
                    .description("Deciding platform roadmap milestones, user feedback priorities, and UX design trends.")
                    .owner(adminUser)
                    .visibility(CommunityVisibility.PUBLIC)
                    .build();
            communityRepository.save(productCommunity);

            communityMemberRepository.save(CommunityMember.builder()
                    .community(productCommunity)
                    .user(adminUser)
                    .memberRole(MemberRole.OWNER)
                    .status(MemberStatus.ACTIVE)
                    .build());
        }

        if (decisionRepository.count() == 0) {
            // Global Decision 1
            Decision globalDec1 = Decision.builder()
                    .title("Adopt TypeScript & Next-Gen Micro-Frontend Architecture")
                    .description("Evaluating the migration to modern component frameworks and federated UI packages for upcoming platform scaling.")
                    .createdBy(adminUser)
                    .community(null)
                    .visibility(DecisionVisibility.PUBLIC)
                    .status(DecisionStatus.ACTIVE)
                    .voteType(VoteType.SINGLE)
                    .viewCount(45)
                    .likeCount(12)
                    .shareCount(4)
                    .deadline(LocalDateTime.now().plusDays(14))
                    .build();

            globalDec1.addOption(Option.builder()
                    .title("Vite + React 19 Single Page Application")
                    .description("High speed development build and zero complexity SSR overhead.")
                    .totalScore(BigDecimal.valueOf(15))
                    .build());
            globalDec1.addOption(Option.builder()
                    .title("Next.js App Router with Server Components")
                    .description("Full stack React capabilities with built-in server rendering and SEO.")
                    .totalScore(BigDecimal.valueOf(25))
                    .build());

            decisionRepository.save(globalDec1);

            // Global Decision 2
            Decision globalDec2 = Decision.builder()
                    .title("Prioritize Real-Time WebSockets vs Browser Push Notifications")
                    .description("Determining the primary notification delivery mechanism for live user voting updates and alerts.")
                    .createdBy(stdUser)
                    .community(null)
                    .visibility(DecisionVisibility.PUBLIC)
                    .status(DecisionStatus.ACTIVE)
                    .voteType(VoteType.SINGLE)
                    .viewCount(28)
                    .likeCount(8)
                    .shareCount(2)
                    .deadline(LocalDateTime.now().plusDays(7))
                    .build();

            globalDec2.addOption(Option.builder()
                    .title("STOMP over WebSocket with Spring Messaging")
                    .description("Instant bi-directional notifications with low latency.")
                    .totalScore(BigDecimal.valueOf(18))
                    .build());
            globalDec2.addOption(Option.builder()
                    .title("Progressive Web App (PWA) Push Notifications")
                    .description("Allows background notifications even when the browser tab is closed.")
                    .totalScore(BigDecimal.valueOf(10))
                    .build());

            decisionRepository.save(globalDec2);

            // Community Decision 3
            Community techComm = communityRepository.findAll().stream().findFirst().orElse(null);
            if (techComm != null) {
                Decision commDec = Decision.builder()
                        .title("PostgreSQL JSONB vs Dedicated Document DB for Dynamic Form Fields")
                        .description("Deciding how to store arbitrary voting schema parameters without relational schema migrations.")
                        .createdBy(adminUser)
                        .community(techComm)
                        .visibility(DecisionVisibility.PUBLIC)
                        .status(DecisionStatus.ACTIVE)
                        .voteType(VoteType.SINGLE)
                        .viewCount(35)
                        .likeCount(9)
                        .shareCount(1)
                        .deadline(LocalDateTime.now().plusDays(21))
                        .build();

                commDec.addOption(Option.builder()
                        .title("PostgreSQL JSONB with GIN indexing")
                        .description("Keeps entire transactional persistence in Postgres with ACID guarantees.")
                        .totalScore(BigDecimal.valueOf(30))
                        .build());
                commDec.addOption(Option.builder()
                        .title("Secondary MongoDB Cluster")
                        .description("Separate schemaless database for form payload storage.")
                        .totalScore(BigDecimal.valueOf(8))
                        .build());

                decisionRepository.save(commDec);
            }

            log.info("Sample global decisions and community boards seeded successfully.");
        }
    }
}
