package com.decisionhub.backend.config;

import com.decisionhub.backend.entity.*;
import com.decisionhub.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired private UserRepository userRepository;
    @Autowired private DecisionRepository decisionRepository;
    @Autowired private OptionRepository optionRepository;
    @Autowired private VoteRepository voteRepository;
    @Autowired private CommunityRepository communityRepository;
    @Autowired private CommentRepository commentRepository;
    @Autowired private NotificationRepository notificationRepository;
    @Autowired private ReportRepository reportRepository;
    @Autowired private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Only seed if decisions are empty
        if (decisionRepository.count() > 0) {
            return;
        }

        // 1. Seed or retrieve users
        User admin = userRepository.findByEmail("admin@decisionhub.com").orElseGet(() -> {
            User u = new User("admin", "admin@decisionhub.com", passwordEncoder.encode("admin123"), "DecisionHub Administrator");
            u.setRole("ADMIN");
            u.setInterests("Technology, Governance, Strategy, Analytics");
            return userRepository.save(u);
        });

        User moderator = userRepository.findByEmail("moderator@decisionhub.com").orElseGet(() -> {
            User u = new User("moderator", "moderator@decisionhub.com", passwordEncoder.encode("mod123"), "Community Lead Moderator");
            u.setRole("MODERATOR");
            u.setInterests("Career, Education, Community Collaboration");
            return userRepository.save(u);
        });

        User user = userRepository.findByEmail("user@decisionhub.com").orElseGet(() -> {
            User u = new User("demo_user", "user@decisionhub.com", passwordEncoder.encode("user123"), "Alex Morgan");
            u.setRole("USER");
            u.setInterests("Technology, Travel, Career");
            return userRepository.save(u);
        });

        // 2. Seed Communities
        Community techComm = communityRepository.save(new Community("Tech Innovators Hub", "Discuss latest frameworks, AI tools, and technical architectures.", "Technology", admin));
        techComm.setMemberCount(1250);
        communityRepository.save(techComm);

        Community careerComm = communityRepository.save(new Community("Career & Professional Growth", "Collaborative advice on job offers, career shifts, and promotions.", "Career", moderator));
        careerComm.setMemberCount(890);
        communityRepository.save(careerComm);

        Community studentComm = communityRepository.save(new Community("Student Decision Circle", "Higher education choices, colleges, internships, and study resources.", "Education", moderator));
        studentComm.setMemberCount(640);
        communityRepository.save(studentComm);

        Community travelComm = communityRepository.save(new Community("Global Wanderers & Trips", "Destination polls, itinerary evaluations, and travel tips.", "Travel", user));
        travelComm.setMemberCount(510);
        communityRepository.save(travelComm);

        Community financeComm = communityRepository.save(new Community("Smart Money & Investment", "Personal finance decisions, asset allocation, and market insights.", "Finance", admin));
        financeComm.setMemberCount(730);
        communityRepository.save(financeComm);

        Community lifestyleComm = communityRepository.save(new Community("Modern Life & Work Balance", "Remote work hacks, wellness decisions, and lifestyle choices.", "Lifestyle", user));
        lifestyleComm.setMemberCount(420);
        communityRepository.save(lifestyleComm);

        // 3. Seed Example Decisions (from Project PDF)
        // Decision 1: MBA vs Job
        Decision mbaDecision = decisionRepository.save(new Decision(
                "MBA vs Job",
                "Deciding between pursuing a full-time top-tier MBA program or continuing my current product management corporate job.",
                "Career",
                user
        ));
        Option optMba1 = optionRepository.save(new Option(mbaDecision, "Pursue Full-Time MBA", "Join a 2-year flagship program to accelerate into senior leadership.", "Global network, career pivot, high brand value", "High tuition debt, opportunity cost of lost salary", 88, 1));
        Option optMba2 = optionRepository.save(new Option(mbaDecision, "Continue Corporate Job", "Stay with current employer and seek fast-track internal promotions.", "Continuous steady income, real work experience, zero debt", "Slower executive switch, regional network limit", 79, 2));

        // Decision 2: iPhone vs Samsung
        Decision phoneDecision = decisionRepository.save(new Decision(
                "iPhone vs Samsung",
                "Comparing flagship smartphones for personal productivity, content creation, and developer workflows.",
                "Technology",
                admin
        ));
        Option optPhone1 = optionRepository.save(new Option(phoneDecision, "Apple iPhone 16 Pro", "Seamless iOS ecosystem, outstanding video capture, long-term trade-in value.", "A18 chip performance, ProRes video, ecosystem synergy", "Higher accessory cost, restricted file management", 93, 1));
        Option optPhone2 = optionRepository.save(new Option(phoneDecision, "Samsung Galaxy S24 Ultra", "Powerhouse Android flagship with integrated S-Pen and AI enhancements.", "Display brightness, multitasking split-screen, zoom camera", "Software update longevity variation, bloatware", 87, 2));

        // Decision 3: Goa vs Bali
        Decision travelDecision = decisionRepository.save(new Decision(
                "Goa vs Bali",
                "Choosing the ideal destination for a 10-day team workation and year-end retreat.",
                "Travel",
                moderator
        ));
        travelDecision.setStatus("RESOLVED");
        decisionRepository.save(travelDecision);
        Option optTravel1 = optionRepository.save(new Option(travelDecision, "Tropical Retreat in Bali", "Cultural richness, beach clubs, and serene private pool villas in Ubud and Seminyak.", "International vibes, luxury accommodations, surf breaks", "Higher airfare, international travel paperwork", 91, 1));
        Option optTravel2 = optionRepository.save(new Option(travelDecision, "Beach Vacation in Goa", "Quick domestic trip to North and South Goa beaches with seafood and vibrant nightlife.", "No visa needed, budget-friendly, relaxed vibe", "Monsoon humidity, high peak season crowd", 84, 2));

        // Decision 4: Startup vs Corporate Job
        Decision startupDecision = decisionRepository.save(new Decision(
                "Startup vs Corporate Job",
                "Evaluating an offer with early equity at a Series-A startup versus an established Fortune 500 tech firm.",
                "Career",
                user
        ));
        Option optStartup1 = optionRepository.save(new Option(startupDecision, "Early-Stage Tech Startup", "Generalist role with direct ownership over product architecture and company vision.", "Massive learning curve, equity upside, zero corporate red tape", "Lower cash salary, unstable runway, demanding hours", 85, 1));
        Option optStartup2 = optionRepository.save(new Option(startupDecision, "Fortune 500 Corporate", "Specialist role with well-defined career ladders and extensive employee benefits.", "Stable compensation, healthcare, structured mentoring", "Slower decision cycles, siloed responsibilities", 82, 2));

        // Decision 5: Remote vs Office Work
        Decision remoteDecision = decisionRepository.save(new Decision(
                "Remote vs Office Work",
                "Determining team work policy for the upcoming fiscal quarter.",
                "Lifestyle",
                admin
        ));
        Option optRemote1 = optionRepository.save(new Option(remoteDecision, "100% Fully Remote Work", "Complete freedom to work from home or anywhere globally asynchronously.", "Zero commute stress, geographic flexibility, deep focus time", "Less spontaneous bonding, requires high self-discipline", 90, 1));
        Option optRemote2 = optionRepository.save(new Option(remoteDecision, "Hybrid (2 Days Office)", "Balanced schedule combining remote focus days with in-person collaboration.", "Face-to-face brainstorming, team lunches, routine separation", "Commute on office days, hot-desking logistics", 86, 2));

        // 4. Seed Votes
        voteRepository.save(new Vote(admin, mbaDecision, optMba1, "SINGLE_CHOICE"));
        voteRepository.save(new Vote(moderator, mbaDecision, optMba1, "SINGLE_CHOICE"));
        voteRepository.save(new Vote(user, mbaDecision, optMba2, "SINGLE_CHOICE"));

        voteRepository.save(new Vote(user, phoneDecision, optPhone1, "SINGLE_CHOICE"));
        voteRepository.save(new Vote(moderator, phoneDecision, optPhone2, "SINGLE_CHOICE"));
        voteRepository.save(new Vote(admin, phoneDecision, optPhone1, "SINGLE_CHOICE"));

        voteRepository.save(new Vote(admin, travelDecision, optTravel1, "SINGLE_CHOICE"));
        voteRepository.save(new Vote(user, travelDecision, optTravel1, "SINGLE_CHOICE"));
        voteRepository.save(new Vote(moderator, travelDecision, optTravel2, "SINGLE_CHOICE"));

        voteRepository.save(new Vote(user, startupDecision, optStartup1, "SINGLE_CHOICE"));
        voteRepository.save(new Vote(moderator, startupDecision, optStartup1, "SINGLE_CHOICE"));

        voteRepository.save(new Vote(user, remoteDecision, optRemote1, "SINGLE_CHOICE"));
        voteRepository.save(new Vote(admin, remoteDecision, optRemote1, "SINGLE_CHOICE"));

        // 5. Seed Comments and Threaded Discussions
        Comment rootComment1 = commentRepository.save(new Comment(
                admin, mbaDecision, null,
                "If you are targeting MBB consulting or tier-1 investment banking, an MBA provides unparalleled access. Otherwise, product management experience speaks louder."
        ));
        commentRepository.save(new Comment(
                moderator, mbaDecision, rootComment1,
                "Completely agree. Also consider that top business schools offer substantial scholarships if your GMAT/GRE scores are high."
        ));

        Comment rootComment2 = commentRepository.save(new Comment(
                moderator, phoneDecision, null,
                "Samsung's zoom camera and file system flexibility are huge for field productivity, but Apple's longevity is hard to beat."
        ));
        commentRepository.save(new Comment(
                user, phoneDecision, rootComment2,
                "The Apple Watch and MacBook continuity make switching away from iPhone difficult once you're invested in the ecosystem."
        ));

        // 6. Seed Notifications
        notificationRepository.save(new Notification(
                user, mbaDecision, null,
                "NEW_COMMENT",
                "Admin commented on your decision: 'MBA vs Job'",
                false
        ));
        notificationRepository.save(new Notification(
                user, mbaDecision, null,
                "NEW_VOTE",
                "Moderator cast a vote on: 'MBA vs Job'",
                false
        ));
        notificationRepository.save(new Notification(
                user, null, techComm,
                "COMMUNITY_INVITE",
                "You were invited to join 'Tech Innovators Hub'",
                true
        ));
        notificationRepository.save(new Notification(
                user, null, null,
                "SYSTEM",
                "Welcome to DecisionHub! Explore active decision boards and community polls.",
                false
        ));

        // 7. Seed Reports
        reportRepository.save(new Report(
                admin, mbaDecision, null,
                "DECISION_REPORT", "PDF",
                "/reports/decision_mba_vs_job.pdf"
        ));
        reportRepository.save(new Report(
                user, travelDecision, null,
                "POLL_RESULTS", "EXCEL",
                "/reports/poll_goa_vs_bali.xlsx"
        ));
        reportRepository.save(new Report(
                moderator, null, careerComm,
                "COMMUNITY_REPORT", "CSV",
                "/reports/community_career.csv"
        ));
    }
}
