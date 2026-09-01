package com.decisionhub.backend.service;

import com.decisionhub.backend.entity.Comment;
import com.decisionhub.backend.entity.Community;
import com.decisionhub.backend.entity.CommunityMessage;
import com.decisionhub.backend.entity.Decision;
import com.decisionhub.backend.entity.Option;
import com.decisionhub.backend.entity.Role;
import com.decisionhub.backend.entity.User;
import com.decisionhub.backend.entity.Vote;
import com.decisionhub.backend.repository.CommentRepository;
import com.decisionhub.backend.repository.CommunityMessageRepository;
import com.decisionhub.backend.repository.CommunityRepository;
import com.decisionhub.backend.repository.DecisionRepository;
import com.decisionhub.backend.repository.OptionRepository;
import com.decisionhub.backend.repository.ReportRepository;
import com.decisionhub.backend.repository.UserRepository;
import com.decisionhub.backend.repository.VoteRepository;
import com.decisionhub.backend.repository.NotificationRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;

@Component
public class SeedDataInitializer implements CommandLineRunner {
    private static final LocalDateTime SEED_DATE = LocalDateTime.of(2026, 8, 31, 12, 0);

    private final UserRepository users;
    private final CommunityRepository communities;
    private final DecisionRepository decisions;
    private final OptionRepository options;
    private final CommentRepository comments;
    private final VoteRepository votes;
    private final CommunityMessageRepository messages;
    private final ReportRepository reports;
    private final NotificationRepository notifications;
    private final PasswordEncoder passwordEncoder;
    private List<User> seededUsers;

    public SeedDataInitializer(UserRepository users, CommunityRepository communities,
                               DecisionRepository decisions, OptionRepository options,
                               CommentRepository comments, VoteRepository votes,
                               CommunityMessageRepository messages, ReportRepository reports,
                               NotificationRepository notifications, PasswordEncoder passwordEncoder) {
        this.users = users;
        this.communities = communities;
        this.decisions = decisions;
        this.options = options;
        this.comments = comments;
        this.votes = votes;
        this.messages = messages;
        this.reports = reports;
        this.notifications = notifications;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (isCompleteSeedPresent()) {
            return;
        }

        removePreviousDemoSeed();

        List<User> seededUsers = seedUsers();
        this.seededUsers = seededUsers;
        List<Community> seededCommunities = seedCommunities(seededUsers);
        seedPolls(seededUsers, seededCommunities);
        seedMessages(seededUsers, seededCommunities);
    }

    private boolean isCompleteSeedPresent() {
        return users.findByEmail("test1@gmail.com").isPresent()
            && decisions.count() >= 30
            && communities.findAll().stream()
            .anyMatch(community -> "Food & Lifestyle".equals(community.getCommunityName()));
        }

    private void removePreviousDemoSeed() {
        List<User> demoUsers = users.findAll().stream()
            .filter(user -> user.getEmail().matches("test[1-5]@gmail\\.com"))
            .toList();
        if (demoUsers.isEmpty()) {
            return;
        }

        List<Long> demoUserIds = demoUsers.stream().map(User::getId).toList();
        List<Community> ownedCommunities = communities.findAll().stream()
            .filter(community -> community.getOwner() != null
                && demoUserIds.contains(community.getOwner().getId()))
            .toList();
        List<Decision> demoDecisions = decisions.findAll().stream()
            .filter(decision -> (decision.getCreatedBy() != null
                && demoUserIds.contains(decision.getCreatedBy().getId()))
                || (decision.getCommunity() != null
                && ownedCommunities.stream().anyMatch(community ->
                community.getId().equals(decision.getCommunity().getId()))))
            .toList();

        reports.deleteAll(reports.findAll().stream()
            .filter(report -> (report.getReportedBy() != null
                && demoUserIds.contains(report.getReportedBy().getId()))
                || (report.getDecision() != null
                && demoDecisions.stream().anyMatch(decision ->
                decision.getId().equals(report.getDecision().getId()))))
            .toList());
        votes.deleteAll(votes.findAll().stream()
            .filter(vote -> demoUserIds.contains(vote.getUser().getId())
                || demoDecisions.stream().anyMatch(decision ->
                decision.getId().equals(vote.getDecision().getId())))
            .toList());
        comments.deleteAll(comments.findAll().stream()
            .filter(comment -> (comment.getUser() != null
                && demoUserIds.contains(comment.getUser().getId()))
                || (comment.getDecision() != null
                && demoDecisions.stream().anyMatch(decision ->
                decision.getId().equals(comment.getDecision().getId()))))
            .toList());
        messages.deleteAll(messages.findAll().stream()
            .filter(message -> demoUserIds.contains(message.getUser().getId())
                || ownedCommunities.stream().anyMatch(community ->
                community.getId().equals(message.getCommunity().getId())))
            .toList());
        notifications.deleteAll(notifications.findAll().stream()
            .filter(notification -> notification.getUser() != null
                && demoUserIds.contains(notification.getUser().getId()))
            .toList());
        decisions.deleteAll(demoDecisions);

        communities.findAll().forEach(community -> {
            if (community.getMembers().removeIf(member -> demoUserIds.contains(member.getId()))) {
                communities.save(community);
            }
        });
        ownedCommunities.forEach(community -> {
            community.getMembers().clear();
            communities.delete(community);
        });
        users.deleteAll(demoUsers);
        users.flush();
    }

    private List<User> seedUsers() {
        String[] names = {"Test1", "Test2", "Test3", "Test4", "Test5"};
        List<User> result = new ArrayList<>();
        for (int index = 0; index < names.length; index++) {
            result.add(users.save(User.builder()
                    .name(names[index])
                    .email("test" + (index + 1) + "@gmail.com")
                    .password(passwordEncoder.encode("test@1234"))
                    .role(Role.USER)
                    .createdAt(SEED_DATE.minusDays(29 - index * 2).withHour(9 + index).withMinute(15))
                    .build()));
        }
        return result;
    }

    private List<Community> seedCommunities(List<User> seededUsers) {
        String[] names = {"Tech Thinkers", "Student Corner", "Travel Tribe", "Career Builders", "Food & Lifestyle"};
        String[] descriptions = {
                "A community for discussing technology, software development, AI, gadgets, and the future of digital products.",
                "A friendly community where students can discuss education, projects, study techniques, college life, and career preparation.",
                "Share travel ideas, destinations, experiences, trip planning tips, and recommendations with fellow travelers.",
                "A community for discussing careers, professional skills, interviews, workplace experiences, and personal growth.",
                "A community for discussing food, restaurants, cooking, lifestyle choices, hobbies, and everyday experiences."
        };
        int[][] memberIndexes = {{0, 1, 2, 3, 4}, {1, 0, 2, 3}, {2, 0, 1, 4}, {3, 0, 1, 4}, {4, 0, 2, 3}};
        List<Community> result = new ArrayList<>();
        for (int index = 0; index < names.length; index++) {
            HashSet<User> members = new HashSet<>();
            for (int memberIndex : memberIndexes[index]) {
                members.add(seededUsers.get(memberIndex));
            }
            result.add(communities.save(Community.builder()
                    .communityName(names[index])
                    .description(descriptions[index])
                    .owner(seededUsers.get(index))
                    .members(members)
                    .createdAt(SEED_DATE.minusDays(23 - index * 2).withHour(10 + index).withMinute(20))
                    .build()));
        }
        return result;
    }

    private void seedPolls(List<User> seededUsers, List<Community> seededCommunities) {
        PollData[][] publicPolls = {
                {p("Which feature should DecisionHub improve next?", "Technology", "Which feature would make DecisionHub more useful for everyday decision making?", "Better poll discovery", "Smarter recommendations", "Better discussion and comments", "Advanced analytics"), p("What is the best way to start the workday?", "Lifestyle", "How do you prefer to begin a productive workday?", "Exercise", "Planning the day", "Checking messages", "Starting with the hardest task"), p("Which type of weekend activity do you prefer?", "Lifestyle", "If you had a completely free weekend, what would you most likely choose?", "Traveling", "Watching movies or series", "Spending time with friends", "Staying home and relaxing")},
                {p("Which programming language is most useful for beginners?", "Technology", "Which programming language would you recommend to someone starting programming today?", "Python", "Java", "JavaScript", "C++"), p("What makes a college project successful?", "Education", "Which factor has the biggest impact on the success of a student project?", "Good planning", "Technical implementation", "Teamwork", "Presentation"), p("Which productivity method works best for you?", "Productivity", "Which approach helps you stay focused and complete your work?", "To-do lists", "Time blocking", "Pomodoro", "Flexible scheduling")},
                {p("Which mobile feature do you use most every day?", "Technology", "Which smartphone feature has become most important in your daily routine?", "Messaging", "Camera", "Maps", "Social media"), p("What is the best way to learn a new skill?", "Education", "Which learning approach helps you understand and retain a new skill most effectively?", "Online courses", "Practice projects", "Books", "Learning with a mentor"), p("Which travel style do you prefer?", "Travel", "What kind of trip would you choose when you have enough time to explore?", "Adventure", "Relaxing beach trip", "Cultural exploration", "Road trip")},
                {p("Which career skill is most valuable?", "Career", "Which skill do you think has the greatest impact on long-term career growth?", "Communication", "Technical expertise", "Leadership", "Problem solving"), p("Which type of food do you prefer for a casual dinner?", "Food", "If you are meeting friends for a casual dinner, what would you choose?", "Indian", "Italian", "Chinese", "Mexican"), p("What helps you make difficult decisions?", "Decision Making", "When you have an important decision to make, which approach helps you most?", "Comparing pros and cons", "Asking other people", "Researching online", "Trusting intuition")},
                {p("Which technology will have the biggest impact in the next five years?", "Technology", "Which emerging technology do you expect to have the greatest impact on everyday life?", "Artificial Intelligence", "Robotics", "Virtual Reality", "Renewable Energy"), p("What is your preferred way to spend a holiday?", "Travel", "How would you ideally spend a long holiday?", "Exploring a new city", "Visiting family", "Beach vacation", "Mountain getaway"), p("Which habit improves productivity the most?", "Productivity", "Which daily habit has the biggest positive effect on getting things done?", "Sleeping well", "Exercising", "Planning ahead", "Avoiding distractions")}
        };
        PollData[][] communityPolls = {
                {p("Which AI feature would you use most in a productivity app?", "Technology", "Which AI-powered feature would provide the most value in a productivity application?", "Smart summaries", "AI recommendations", "Automated task planning", "Personalized insights"), p("Which developer tool is hardest to work without?", "Technology", "Which development tool is most essential to your everyday programming workflow?", "Git", "IDE", "Debugger", "Documentation tools"), p("What should technology companies prioritize?", "Technology", "Which area should technology companies prioritize when building new products?", "Privacy", "Security", "Performance", "Accessibility")},
                {p("Which study method works best before exams?", "Education", "Which study approach helps you prepare most effectively for examinations?", "Practice questions", "Group study", "Revision notes", "Mock tests"), p("What should colleges improve most?", "Education", "Which area should colleges focus on improving to provide students with a better experience?", "Practical education", "Placement support", "Infrastructure", "Industry interaction"), p("Which skill should every student learn?", "Education", "Which skill would be most valuable for students regardless of their field of study?", "Communication", "Programming", "Financial literacy", "Public speaking")},
                {p("Which destination would you choose for your next trip?", "Travel", "Which destination would you choose for your next memorable trip?", "Goa", "Kerala", "Rajasthan", "Himachal Pradesh"), p("What matters most when choosing a hotel?", "Travel", "Which factor is most important when selecting accommodation for a trip?", "Location", "Price", "Cleanliness", "Reviews"), p("Which type of trip is most memorable?", "Travel", "Which type of travel experience creates the best memories?", "Road trip", "Adventure trip", "Family vacation", "Cultural trip")},
                {p("Which skill matters most during an interview?", "Career", "Which skill has the greatest impact on performing well during a job interview?", "Communication", "Technical knowledge", "Confidence", "Problem solving"), p("What is the best way to grow professionally?", "Career", "Which approach is most effective for long-term professional development?", "Learn continuously", "Find a mentor", "Take challenging projects", "Build a strong network"), p("Which workplace benefit matters most?", "Career", "Which benefit would have the greatest positive impact on your work life?", "Flexible work", "Higher salary", "Learning opportunities", "Work-life balance")},
                {p("Which Indian cuisine would you choose for a feast?", "Food", "Which Indian cuisine would you prefer when planning a large and special meal?", "South Indian", "North Indian", "Bengali", "Punjabi"), p("What makes a restaurant worth visiting again?", "Food", "Which factor is most important when deciding whether to return to a restaurant?", "Food quality", "Service", "Ambience", "Value for money"), p("Which weekend activity sounds best?", "Food", "Which activity would you most enjoy during a free weekend?", "Cooking", "Going out with friends", "Watching movies", "Exploring a new place")}
        };
        for (int owner = 0; owner < seededUsers.size(); owner++) {
            for (int poll = 0; poll < 3; poll++) {
                createPoll(publicPolls[owner][poll], seededUsers.get(owner), null, owner, poll, false);
                createPoll(communityPolls[owner][poll], seededUsers.get(owner), seededCommunities.get(owner), owner, poll, true);
            }
        }
    }

    private void createPoll(PollData data, User owner, Community community, int ownerIndex, int pollIndex, boolean inCommunity) {
        int creationDay = 1 + ownerIndex * 2 + pollIndex;
        int deadlineDay = 5 + (ownerIndex * 5 + pollIndex * 3) % 26;
        if (deadlineDay > 30) {
            deadlineDay = 30;
        }
        LocalDateTime createdAt = SEED_DATE.minusDays(creationDay).withHour(8 + pollIndex).withMinute(20 + ownerIndex);
        LocalDateTime deadline = LocalDateTime.of(2026, 9, deadlineDay, 18, 0);
        Decision decision = decisions.save(Decision.builder().title(data.title()).category(data.category())
                .description(data.description()).visibility(inCommunity ? "PRIVATE" : "PUBLIC").anonymous(false)
                .createdBy(owner).community(community).createdAt(createdAt).deadline(deadline).build());
        List<Option> pollOptions = new ArrayList<>();
        for (String text : data.options()) {
            pollOptions.add(Option.builder().optionText(text).decision(decision).build());
        }
        decision.getOptions().addAll(options.saveAll(pollOptions));
        addComments(decision, ownerIndex, pollIndex, createdAt, data.category());
        for (int voterOffset = 1; voterOffset <= 3; voterOffset++) {
            User voter = seededUsers.get((ownerIndex + voterOffset) % seededUsers.size());
            votes.save(Vote.builder().user(voter).decision(decision)
                    .option(pollOptions.get((voterOffset + pollIndex + ownerIndex) % pollOptions.size())).build());
        }
    }

    private void addComments(Decision decision, int ownerIndex, int pollIndex, LocalDateTime createdAt, String category) {
        String[] texts = commentsFor(category);
        for (int commentIndex = 0; commentIndex < 3; commentIndex++) {
            int commenterIndex = (ownerIndex + pollIndex + commentIndex + 1) % 5;
            comments.save(Comment.builder().comment(texts[commentIndex]).user(seededUsers.get(commenterIndex))
                    .decision(decision).createdAt(createdAt.plusHours(commentIndex + 2)).build());
        }
    }

    private String[] commentsFor(String category) {
        if (category.equals("Education")) return new String[]{"Practice questions help me understand the subject better.", "Mock tests are really useful before exams.", "Practical experience is more valuable than only studying theory."};
        if (category.equals("Travel")) return new String[]{"Location is usually my first priority.", "I prefer road trips because they give more flexibility.", "Reviews are very important when booking hotels."};
        if (category.equals("Career")) return new String[]{"Communication makes a huge difference during interviews.", "Challenging projects helped me learn much faster.", "A good mentor can make a big difference."};
        if (category.equals("Food")) return new String[]{"Food quality is the main reason I return to a restaurant.", "Good service can completely change the dining experience.", "Ambience matters when meeting friends."};
        if (category.equals("Productivity") || category.equals("Lifestyle")) return new String[]{"Planning ahead helps me avoid last-minute work.", "Good sleep makes it much easier to focus.", "Avoiding distractions is probably the hardest part."};
        return new String[]{"This feature would make the platform much easier to use.", "I think this would save a lot of time.", "Privacy should definitely be considered here."};
    }

    private void seedMessages(List<User> seededUsers, List<Community> seededCommunities) {
        String[][] texts = {
                {"Has anyone tried using AI tools for project planning?", "I have been experimenting with AI-assisted coding recently.", "Privacy is something we should definitely consider when using these tools.", "I think AI recommendations could be very useful."},
                {"How is everyone's project preparation going?", "Mock tests have been helping me a lot lately.", "I think practical projects are more useful than just theory.", "What are you all using for exam preparation?"},
                {"Planning a trip soon. Any recommendations for a short weekend destination?", "Kerala is great if you want a relaxed trip with good food.", "I usually check reviews before booking hotels.", "Road trips are my favorite way to travel."},
                {"What resources is everyone using for interview preparation?", "I have found mock interviews really useful.", "Work-life balance is becoming increasingly important.", "I think continuous learning is the best way to grow."},
                {"What is everyone's favorite South Indian dish?", "For me, good biryani is hard to beat.", "I usually choose restaurants based on food quality and reviews.", "I enjoy trying new places with friends."}
        };
        for (int communityIndex = 0; communityIndex < texts.length; communityIndex++) {
            for (int messageIndex = 0; messageIndex < texts[communityIndex].length; messageIndex++) {
                int senderIndex = (communityIndex + messageIndex + 1) % 5;
                messages.save(CommunityMessage.builder().content(texts[communityIndex][messageIndex])
                        .community(seededCommunities.get(communityIndex)).user(seededUsers.get(senderIndex))
                        .createdAt(SEED_DATE.minusDays(messageIndex + 1).withHour(12 + messageIndex).withMinute(10)).build());
            }
        }
    }

    private PollData p(String title, String category, String description, String... options) {
        return new PollData(title, category, description, options);
    }

    private record PollData(String title, String category, String description, String[] options) { }
}
