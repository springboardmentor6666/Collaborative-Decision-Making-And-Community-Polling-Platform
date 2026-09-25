package com.decisionhub.backend.service;

import com.decisionhub.backend.entity.Activity;
import com.decisionhub.backend.entity.Comment;
import com.decisionhub.backend.entity.Community;
import com.decisionhub.backend.entity.CommunityMemberShip;
import com.decisionhub.backend.entity.CommunityMessage;
import com.decisionhub.backend.entity.Decision;
import com.decisionhub.backend.entity.Option;
import com.decisionhub.backend.entity.Role;
import com.decisionhub.backend.entity.User;
import com.decisionhub.backend.entity.Vote;
import com.decisionhub.backend.repository.ActivityRepository;
import com.decisionhub.backend.repository.CommentRepository;
import com.decisionhub.backend.repository.CommunityMessageRepository;
import com.decisionhub.backend.repository.CommunityRepository;
import com.decisionhub.backend.repository.DecisionRepository;
import com.decisionhub.backend.repository.NotificationRepository;
import com.decisionhub.backend.repository.OptionRepository;
import com.decisionhub.backend.repository.ReportRepository;
import com.decisionhub.backend.repository.UserRepository;
import com.decisionhub.backend.repository.VoteRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Component
public class SeedDataInitializer implements CommandLineRunner {

    /*
     * Dynamic base time means the demo remains useful when you open
     * 1 / 7 / 30 / 90 / 365 day analytics ranges on a fresh database.
     */
    private static final LocalDateTime SEED_DATE =
            LocalDateTime.now().withSecond(0).withNano(0);

    private final UserRepository users;
    private final CommunityRepository communities;
    private final DecisionRepository decisions;
    private final OptionRepository options;
    private final CommentRepository comments;
    private final VoteRepository votes;
    private final CommunityMessageRepository messages;
    private final ReportRepository reports;
    private final NotificationRepository notifications;
    private final ActivityRepository activities;
    private final PasswordEncoder passwordEncoder;

    public SeedDataInitializer(
            UserRepository users,
            CommunityRepository communities,
            DecisionRepository decisions,
            OptionRepository options,
            CommentRepository comments,
            VoteRepository votes,
            CommunityMessageRepository messages,
            ReportRepository reports,
            NotificationRepository notifications,
            ActivityRepository activities,
            PasswordEncoder passwordEncoder
    ) {
        this.users = users;
        this.communities = communities;
        this.decisions = decisions;
        this.options = options;
        this.comments = comments;
        this.votes = votes;
        this.messages = messages;
        this.reports = reports;
        this.notifications = notifications;
        this.activities = activities;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {

        /*
         * Keep the seed after it has been created.
         * The new community name is a sentinel so an older seed version
         * is automatically replaced once, without touching real users.
         */
        if (isCompleteSeedPresent()) {
            return;
        }

        removePreviousDemoSeed();

        List<User> seededUsers = seedUsers();
        this.currentSeedUsers = seededUsers;
        List<Community> seededCommunities = seedCommunities(seededUsers);

        seedPolls(seededUsers, seededCommunities);
        seedMessages(seededUsers, seededCommunities);
        seedActivities(seededUsers, seededCommunities);
    }

    /* =========================================================
       SEED CHECK
       ========================================================= */

    private boolean isCompleteSeedPresent() {
        return users.findByEmail("test1@gmail.com").isPresent()
                && users.findByEmail("test5@gmail.com").isPresent()
                && decisions.count() >= 30
                && communities.findAll()
                .stream()
                .anyMatch(
                        community ->
                                "Campus Connect".equals(
                                        community.getCommunityName()
                                )
                );
    }

    /* =========================================================
       REMOVE PREVIOUS DEMO DATA ONLY
       ========================================================= */

    private void removePreviousDemoSeed() {

        List<User> demoUsers =
                users.findAll()
                        .stream()
                        .filter(user ->
                                user.getEmail() != null
                                        && user.getEmail().matches(
                                        "test[1-5]@gmail\\.com"
                                )
                        )
                        .toList();

        if (demoUsers.isEmpty()) {
            return;
        }

        List<Long> demoUserIds =
                demoUsers.stream()
                        .map(User::getId)
                        .toList();

        List<Community> ownedCommunities =
                communities.findAll()
                        .stream()
                        .filter(community ->
                                community.getOwner() != null
                                        && demoUserIds.contains(
                                        community.getOwner().getId()
                                )
                        )
                        .toList();

        List<Decision> demoDecisions =
                decisions.findAll()
                        .stream()
                        .filter(decision ->
                                (decision.getCreatedBy() != null
                                        && demoUserIds.contains(
                                        decision.getCreatedBy().getId()
                                ))
                                        ||
                                        (decision.getCommunity() != null
                                                && ownedCommunities.stream()
                                                .anyMatch(community ->
                                                        community.getId().equals(
                                                                decision.getCommunity().getId()
                                                        )
                                                ))
                        )
                        .toList();

        reports.deleteAll(
                reports.findAll()
                        .stream()
                        .filter(report ->
                                (report.getReportedBy() != null
                                        && demoUserIds.contains(
                                        report.getReportedBy().getId()
                                ))
                                        ||
                                        (report.getDecision() != null
                                                && demoDecisions.stream()
                                                .anyMatch(decision ->
                                                        decision.getId().equals(
                                                                report.getDecision().getId()
                                                        )
                                                ))
                        )
                        .toList()
        );

        votes.deleteAll(
                votes.findAll()
                        .stream()
                        .filter(vote ->
                                demoUserIds.contains(vote.getUser().getId())
                                        || demoDecisions.stream().anyMatch(decision ->
                                        decision.getId().equals(
                                                vote.getDecision().getId()
                                        )
                                )
                        )
                        .toList()
        );

        comments.deleteAll(
                comments.findAll()
                        .stream()
                        .filter(comment ->
                                (comment.getUser() != null
                                        && demoUserIds.contains(
                                        comment.getUser().getId()
                                ))
                                        ||
                                        (comment.getDecision() != null
                                                && demoDecisions.stream().anyMatch(decision ->
                                                decision.getId().equals(
                                                        comment.getDecision().getId()
                                                )
                                        ))
                        )
                        .toList()
        );

        messages.deleteAll(
                messages.findAll()
                        .stream()
                        .filter(message ->
                                (message.getUser() != null
                                        && demoUserIds.contains(
                                        message.getUser().getId()
                                ))
                                        ||
                                        (message.getCommunity() != null
                                                && ownedCommunities.stream().anyMatch(community ->
                                                community.getId().equals(
                                                        message.getCommunity().getId()
                                                )
                                        ))
                        )
                        .toList()
        );

        notifications.deleteAll(
                notifications.findAll()
                        .stream()
                        .filter(notification ->
                                notification.getUser() != null
                                        && demoUserIds.contains(
                                        notification.getUser().getId()
                                )
                        )
                        .toList()
        );

        decisions.deleteAll(demoDecisions);

        communities.findAll()
                .forEach(community -> {
                    if (community.getMembers() != null
                            && community.getMembers().removeIf(
                            membership ->
                                    membership.getUser() != null
                                            && demoUserIds.contains(
                                            membership.getUser().getId()
                                    )
                    )) {
                        communities.save(community);
                    }
                });

        ownedCommunities.forEach(community -> {
            if (community.getMembers() != null) {
                community.getMembers().clear();
            }
            communities.delete(community);
        });

        activities.deleteByUserIdIn(demoUserIds);

        users.deleteAll(demoUsers);
        users.flush();
    }

    /* =========================================================
       USERS
       ========================================================= */

    private List<User> seedUsers() {

        String[] names = {
                "Test1",
                "Test2",
                "Test3",
                "Test4",
                "Test5"
        };

        List<User> result = new ArrayList<>();

        for (int index = 0; index < names.length; index++) {

            LocalDateTime createdAt =
                    SEED_DATE
                            .minusDays(24L - index * 4L)
                            .withHour(9 + index)
                            .withMinute(10 + index * 7);

            User user =
                    User.builder()
                            .name(names[index])
                            .email("test" + (index + 1) + "@gmail.com")
                            .password(passwordEncoder.encode("test@1234"))
                            .role(Role.USER)
                            .createdAt(createdAt)
                            .build();

            result.add(users.save(user));
        }

        return result;
    }

    /* =========================================================
       COMMUNITIES
       ========================================================= */

    private List<Community> seedCommunities(List<User> seededUsers) {

        String[] names = {
                "Campus Connect",
                "Tech Thinkers",
                "Career Launchpad",
                "Travel Tribe",
                "Food & Lifestyle"
        };

        String[] descriptions = {
                "A lively student community for campus life, projects, study plans, events, and everyday college decisions.",
                "A space for developers to discuss software, AI, gadgets, product ideas, and practical engineering choices.",
                "Career-focused discussions around interviews, resumes, internships, professional skills, and growth.",
                "Travel planning, destination ideas, hotel choices, road trips, and memorable experiences.",
                "Food, restaurants, cooking, weekend plans, hobbies, and lifestyle conversations.",
        };

        int[][] memberIndexes = {
                {0, 1, 2, 3},
                {1, 0, 3, 4},
                {2, 0, 1, 4},
                {3, 1, 2, 4},
                {4, 0, 2, 3}
        };

        List<Community> result = new ArrayList<>();

        for (int index = 0; index < names.length; index++) {

            LocalDateTime createdAt =
                    SEED_DATE
                            .minusDays(20L - index * 3L)
                            .withHour(10 + index)
                            .withMinute(15 + index * 5);

            Community community =
                    Community.builder()
                            .communityName(names[index])
                            .description(descriptions[index])
                            .owner(seededUsers.get(index))
                            .createdAt(createdAt)
                            .build();

            for (int memberIndex : memberIndexes[index]) {
                User memberUser = seededUsers.get(memberIndex);

                CommunityMemberShip membership =
                        CommunityMemberShip.builder()
                                .community(community)
                                .user(memberUser)
                                .joinedAt(
                                        createdAt.plusHours(
                                                2L + Math.abs(memberIndex - index)
                                        )
                                )
                                .build();

                community.getMembers().add(membership);
            }

            result.add(communities.save(community));
        }

        return result;
    }

    /* =========================================================
       DECISIONS / POLLS
       30 TOTAL = 6 PER USER
       15 PUBLIC + 15 COMMUNITY
       ========================================================= */

    private void seedPolls(
            List<User> seededUsers,
            List<Community> seededCommunities
    ) {

        PollData[][] publicPolls = {
                {
                        p("Which feature should DecisionHub improve next?", "Technology",
                                "Which improvement would make DecisionHub more useful for everyday decisions?",
                                "Better poll discovery", "Smarter recommendations", "Richer discussions", "Advanced analytics"),
                        p("What is the best way to start a productive study day?", "Education",
                                "Which routine helps you make the most of a focused study session?",
                                "Plan the session", "Start with practice", "Review notes", "Study with a friend"),
                        p("Which productivity habit saves the most time?", "Productivity",
                                "Which small habit gives you the biggest improvement in getting work done?",
                                "Time blocking", "To-do lists", "Pomodoro", "Reducing notifications")
                },
                {
                        p("Which skill should every student build early?", "Education",
                                "Which skill gives students the biggest long-term advantage?",
                                "Communication", "Problem solving", "Programming", "Financial literacy"),
                        p("Which travel style gives the best experience?", "Travel",
                                "What kind of trip gives you the best balance of freedom and discovery?",
                                "Road trip", "Backpacking", "City break", "Guided tour"),
                        p("What helps you stay focused during a busy week?", "Productivity",
                                "Which approach keeps distractions under control when your schedule gets full?",
                                "Daily planning", "Deep-work blocks", "Exercise", "A fixed routine")
                },
                {
                        p("Which destination would you choose for a short break?", "Travel",
                                "Which option sounds best for a refreshing long weekend?",
                                "Goa", "Kerala", "Himachal Pradesh", "Rajasthan"),
                        p("Which career skill matters most in the first job?", "Career",
                                "Which ability helps a new professional grow fastest?",
                                "Communication", "Technical depth", "Adaptability", "Teamwork"),
                        p("Which dinner option works best for a group?", "Food",
                                "What would you choose when everyone wants something different?",
                                "Biryani", "Pizza", "South Indian", "Chinese")
                },
                {
                        p("Which technology will shape daily life most?", "Technology",
                                "Which emerging technology do you expect to influence people most in the next few years?",
                                "Artificial Intelligence", "Robotics", "AR/VR", "Renewable tech"),
                        p("Which interview preparation method works best?", "Career",
                                "How do you prepare for an important technical interview?",
                                "Mock interviews", "Practice questions", "Projects", "Peer review"),
                        p("What makes a college project memorable?", "Education",
                                "Which factor makes a student project stand out?",
                                "Real-world value", "Clean design", "Strong teamwork", "Good presentation")
                },
                {
                        p("Which daily habit improves energy the most?", "Productivity",
                                "Which habit has the biggest effect on your ability to stay productive?",
                                "Good sleep", "Exercise", "Planning", "Fewer distractions"),
                        p("What makes a restaurant worth revisiting?", "Food",
                                "Which factor most strongly brings you back to the same restaurant?",
                                "Food quality", "Service", "Ambience", "Value for money"),
                        p("What kind of holiday feels most refreshing?", "Travel",
                                "Which holiday would you choose after a busy semester?",
                                "Beach vacation", "Mountain getaway", "New city", "Family trip")
                }
        };

        PollData[][] communityPolls = {
                {
                        p("Which campus event should get more attention?", "Education",
                                "Which event would create the most value for students?",
                                "Project showcase", "Coding contest", "Career fair", "Club festival"),
                        p("Which AI feature would you actually use weekly?", "Technology",
                                "Which AI feature would provide practical value without adding complexity?",
                                "Smart summaries", "Recommendations", "Task planning", "Personal insights"),
                        p("What would make a team decision easier?", "Career",
                                "Which feature would help your group reach decisions faster?",
                                "Anonymous voting", "Pros and cons", "Deadline reminders", "Result insights")
                },
                {
                        p("Which developer tool is hardest to replace?", "Technology",
                                "Which tool is most important in your everyday development workflow?",
                                "IDE", "Git", "Debugger", "Documentation"),
                        p("Which interview topic deserves more practice?", "Career",
                                "What should students spend more time practicing before interviews?",
                                "Problem solving", "Communication", "Projects", "CS fundamentals"),
                        p("Which community activity would you join?", "Food",
                                "Which casual activity would be most enjoyable with your community?",
                                "Food walk", "Recipe exchange", "Restaurant meetup", "Weekend cooking")
                },
                {
                        p("Which study method helps most before exams?", "Education",
                                "Which method helps you retain concepts when exam pressure increases?",
                                "Mock tests", "Practice questions", "Revision notes", "Group study"),
                        p("Which trip detail needs the most planning?", "Travel",
                                "Which part of a trip can cause the most last-minute stress?",
                                "Transport", "Hotel", "Budget", "Daily itinerary"),
                        p("Which productivity rule should students try?", "Productivity",
                                "Which simple rule has the biggest effect on consistent work?",
                                "Start small", "No phone blocks", "Daily priorities", "Weekly review")
                },
                {
                        p("Which tech topic deserves a student meetup?", "Technology",
                                "Which topic would attract the most useful technical discussion?",
                                "Generative AI", "Cloud", "Cybersecurity", "Open source"),
                        p("Which travel experience creates better memories?", "Travel",
                                "What makes a trip feel special long after it ends?",
                                "Local culture", "Adventure", "Food", "Unexpected moments"),
                        p("Which food topic should the community discuss next?", "Food",
                                "Which discussion would be most useful for a food-loving group?",
                                "Budget meals", "Healthy recipes", "Restaurant reviews", "Regional cuisine")
                },
                {
                        p("Which career topic should we practice together?", "Career",
                                "Which topic would give members the most practical career value?",
                                "Resume reviews", "Mock interviews", "LinkedIn profiles", "Project feedback"),
                        p("Which learning format keeps you engaged?", "Education",
                                "Which format helps you stay consistent when learning something difficult?",
                                "Short videos", "Hands-on projects", "Live sessions", "Study groups"),
                        p("Which technology trend is worth following closely?", "Technology",
                                "Which trend should students keep an eye on over the next year?",
                                "AI agents", "Edge computing", "Spatial computing", "Clean tech")
                }
        };

        for (int owner = 0; owner < seededUsers.size(); owner++) {
            for (int poll = 0; poll < 3; poll++) {
                createPoll(
                        publicPolls[owner][poll],
                        seededUsers.get(owner),
                        null,
                        owner,
                        poll,
                        false
                );

                createPoll(
                        communityPolls[owner][poll],
                        seededUsers.get(owner),
                        seededCommunities.get(owner),
                        owner,
                        poll + 3,
                        true
                );
            }
        }
    }

    /* =========================================================
       CREATE ONE DECISION
       ========================================================= */

    private void createPoll(
            PollData data,
            User owner,
            Community community,
            int ownerIndex,
            int pollIndex,
            boolean inCommunity
    ) {

        int[] deadlineOffsets = {6, 14, -3, 10, -1, -6};
        int[] voteCounts = {4, 3, 2, 4, 3, 2};
        int[] commentCounts = {4, 3, 2, 4, 3, 2};

        int decisionNumber = ownerIndex * 6 + pollIndex;
        int creationOffset = 2 + (decisionNumber % 18);

        LocalDateTime createdAt =
                SEED_DATE
                        .minusDays(creationOffset)
                        .withHour(8 + (pollIndex % 5))
                        .withMinute(10 + ownerIndex * 6);

        LocalDateTime deadline =
                SEED_DATE
                        .plusDays(deadlineOffsets[pollIndex])
                        .withHour(18)
                        .withMinute(0);

        /*
         * 6 anonymous decisions in total. This gives the user analytics
         * visibility section something useful to display.
         */
        boolean anonymous =
                (ownerIndex + pollIndex) % 5 == 0;

        Decision decision =
                decisions.save(
                        Decision.builder()
                                .title(data.title())
                                .category(data.category())
                                .description(data.description())
                                .visibility(inCommunity ? "PRIVATE" : "PUBLIC")
                                .anonymous(anonymous)
                                .createdBy(owner)
                                .community(community)
                                .createdAt(createdAt)
                                .deadline(deadline)
                                .build()
                );

        List<Option> pollOptions = new ArrayList<>();

        for (String text : data.options()) {
            pollOptions.add(
                    Option.builder()
                            .optionText(text)
                            .decision(decision)
                            .build()
            );
        }

        decision.getOptions().addAll(options.saveAll(pollOptions));

        addComments(
                decision,
                ownerIndex,
                pollIndex,
                createdAt,
                data.category(),
                commentCounts[pollIndex]
        );

        int voterCount = voteCounts[pollIndex];

        for (int voterOffset = 1; voterOffset <= voterCount; voterOffset++) {
            User voter =
                    seededUser(ownerIndex + voterOffset);

            Vote vote =
                    Vote.builder()
                            .user(voter)
                            .decision(decision)
                            .option(
                                    pollOptions.get(
                                            (ownerIndex + pollIndex + voterOffset) % pollOptions.size()
                                    )
                            )
                            .build();

            votes.save(vote);
        }
    }

    private User seededUser(int rawIndex) {
        return currentSeedUsers.get(rawIndex % currentSeedUsers.size());
    }

    /* =========================================================
       COMMENTS
       ========================================================= */

    private void addComments(
            Decision decision,
            int ownerIndex,
            int pollIndex,
            LocalDateTime createdAt,
            String category,
            int count
    ) {

        String[] texts = commentsFor(category);

        for (int commentIndex = 0; commentIndex < count; commentIndex++) {

            int commenterIndex =
                    (ownerIndex + commentIndex + 1) % currentSeedUsers.size();

            LocalDateTime commentAt =
                    SEED_DATE
                            .minusDays(
                                    (ownerIndex * 4L + pollIndex * 2L + commentIndex) % 24L
                            )
                            .withHour(11 + (commentIndex % 6))
                            .withMinute(12 + ownerIndex * 3);

            comments.save(
                    Comment.builder()
                            .comment(texts[commentIndex % texts.length])
                            .user(currentSeedUsers.get(commenterIndex))
                            .decision(decision)
                            .createdAt(commentAt.isBefore(createdAt) ? createdAt.plusHours(2) : commentAt)
                            .build()
            );
        }
    }

    /* =========================================================
       ACTIVITIES
       ========================================================= */

    private List<User> currentSeedUsers = new ArrayList<>();

    private void seedActivities(
            List<User> seededUsers,
            List<Community> seededCommunities
    ) {
        currentSeedUsers = seededUsers;

        /* Registrations */
        for (User user : seededUsers) {
            activities.save(
                    Activity.builder()
                            .user(user)
                            .type("User registered")
                            .subject(user.getName())
                            .at(user.getCreatedAt())
                            .build()
            );
        }

        /* Community joins */
        for (int communityIndex = 0; communityIndex < seededCommunities.size(); communityIndex++) {
            Community community = seededCommunities.get(communityIndex);

            for (int memberIndex : memberIndexesForActivity(communityIndex)) {
                User user = seededUsers.get(memberIndex);

                activities.save(
                        Activity.builder()
                                .user(user)
                                .type("Community joined")
                                .subject(community.getCommunityName())
                                .at(
                                        SEED_DATE
                                                .minusDays(
                                                        (communityIndex + memberIndex + 2L) % 20L
                                                )
                                                .withHour(13 + memberIndex)
                                                .withMinute(20)
                                )
                                .build()
                );
            }
        }

        /* Decision / vote / comment activity. */
        List<Decision> allDecisions =
                decisions.findAll()
                        .stream()
                        .filter(decision ->
                                decision.getCreatedBy() != null
                                        && decision.getCreatedBy().getEmail() != null
                                        && decision.getCreatedBy().getEmail().matches(
                                        "test[1-5]@gmail\\.com"
                                )
                        )
                        .toList();

        for (int index = 0; index < allDecisions.size(); index++) {
            Decision decision = allDecisions.get(index);
            User owner = decision.getCreatedBy();

            activities.save(
                    Activity.builder()
                            .user(owner)
                            .type("Decision created")
                            .subject(decision.getTitle())
                            .at(decision.getCreatedAt())
                            .build()
            );

            List<Vote> decisionVotes =
                    votes.findAll()
                            .stream()
                            .filter(vote ->
                                    vote.getDecision() != null
                                            && vote.getDecision().getId().equals(decision.getId())
                            )
                            .toList();

            for (int voteIndex = 0; voteIndex < decisionVotes.size(); voteIndex++) {
                Vote vote = decisionVotes.get(voteIndex);
                User voter = vote.getUser();

                activities.save(
                        Activity.builder()
                                .user(voter)
                                .type("Vote submitted")
                                .subject(decision.getTitle())
                                .at(
                                        SEED_DATE
                                                .minusDays(
                                                        (index * 3L + voteIndex) % 27L
                                                )
                                                .withHour(9 + (voteIndex % 8))
                                                .withMinute(5 + voteIndex * 4)
                                )
                                .build()
                );
            }

            List<Comment> decisionComments =
                    comments.findAll()
                            .stream()
                            .filter(comment ->
                                    comment.getDecision() != null
                                            && comment.getDecision().getId().equals(decision.getId())
                            )
                            .toList();

            for (Comment comment : decisionComments) {
                activities.save(
                        Activity.builder()
                                .user(comment.getUser())
                                .type("Comment added")
                                .subject(decision.getTitle())
                                .at(comment.getCreatedAt())
                                .build()
                );
            }
        }
    }

    private int[] memberIndexesForActivity(int communityIndex) {
        return switch (communityIndex) {
            case 0 -> new int[]{0, 1, 2, 3};
            case 1 -> new int[]{1, 0, 3, 4};
            case 2 -> new int[]{2, 0, 1, 4};
            case 3 -> new int[]{3, 1, 2, 4};
            default -> new int[]{4, 0, 2, 3};
        };
    }

    /* =========================================================
       COMMENT TEXT
       ========================================================= */

    private String[] commentsFor(String category) {

        if (category.equals("Education")) {
            return new String[]{
                    "Practice questions make the topic much easier to understand.",
                    "A short revision plan helps me stay consistent.",
                    "Mock tests are especially useful before exams.",
                    "Projects make theory much easier to remember."
            };
        }

        if (category.equals("Travel")) {
            return new String[]{
                    "I usually check reviews before booking.",
                    "Road trips give me more flexibility.",
                    "Local food is a big part of the experience for me.",
                    "I prefer planning the important parts and leaving some room for spontaneity."
            };
        }

        if (category.equals("Career")) {
            return new String[]{
                    "Communication makes a noticeable difference in interviews.",
                    "Real projects helped me explain my skills more clearly.",
                    "Mock interviews are great for finding weak areas.",
                    "A good mentor can save a lot of trial and error."
            };
        }

        if (category.equals("Food")) {
            return new String[]{
                    "Food quality is the first thing I notice.",
                    "Good service can completely change the experience.",
                    "I love trying a new place with friends.",
                    "Value for money matters when visiting regularly."
            };
        }

        if (category.equals("Productivity")) {
            return new String[]{
                    "Planning tomorrow the night before works well for me.",
                    "Deep-work blocks help me avoid context switching.",
                    "Good sleep makes staying focused much easier.",
                    "Reducing phone notifications makes a big difference."
            };
        }

        return new String[]{
                "This would make the platform much easier to use.",
                "I think this would save users a lot of time.",
                "The community discussion could add useful context here.",
                "I would like to see more insights around this option."
        };
    }

    /* =========================================================
       COMMUNITY MESSAGES
       ========================================================= */

    private void seedMessages(
            List<User> seededUsers,
            List<Community> seededCommunities
    ) {

        String[][] texts = {
                {
                        "How is everyone's semester planning going?",
                        "I think a shared project board would help us coordinate better.",
                        "Which study routine is working best for you right now?",
                        "The community polls are giving us some interesting ideas.",
                        "Let's use the next discussion for practical project tips."
                },
                {
                        "Which AI tools are actually useful in day-to-day development?",
                        "I have been experimenting with AI-assisted coding recently.",
                        "Privacy should always be considered when using these tools.",
                        "Git and a good IDE are still the core of my workflow.",
                        "What technology topic should we cover in the next meetup?"
                },
                {
                        "How is everyone preparing for interviews?",
                        "Mock interviews have been helping me a lot.",
                        "I would like to do a resume review session together.",
                        "Which project was hardest to explain in an interview?",
                        "Continuous learning feels easier when there is a study group."
                },
                {
                        "Planning a trip soon. Any weekend destination ideas?",
                        "I usually compare reviews before booking hotels.",
                        "Road trips are my favorite when the group is small.",
                        "Local food makes a big difference for me when traveling.",
                        "We should create a community poll for the next destination."
                },
                {
                        "What is everyone's favorite comfort food?",
                        "I usually choose a restaurant based on food quality.",
                        "Trying new places with friends is always fun.",
                        "We should do a food poll for the next meetup.",
                        "Value for money matters a lot for regular visits."
                }
        };

        for (int communityIndex = 0; communityIndex < seededCommunities.size(); communityIndex++) {
            for (int messageIndex = 0; messageIndex < texts[communityIndex].length; messageIndex++) {

                User sender =
                        seededUsers.get(
                                (communityIndex + messageIndex + 1) % seededUsers.size()
                        );

                messages.save(
                        CommunityMessage.builder()
                                .content(texts[communityIndex][messageIndex])
                                .community(seededCommunities.get(communityIndex))
                                .user(sender)
                                .createdAt(
                                        SEED_DATE
                                                .minusDays(
                                                        (communityIndex * 2L + messageIndex) % 18L
                                                )
                                                .withHour(12 + messageIndex)
                                                .withMinute(10 + communityIndex)
                                )
                                .build()
                );
            }
        }
    }

    /* =========================================================
       POLL DATA HELPERS
       ========================================================= */

    private PollData p(
            String title,
            String category,
            String description,
            String... options
    ) {
        return new PollData(title, category, description, options);
    }

    private record PollData(
            String title,
            String category,
            String description,
            String[] options
    ) {
    }
}
