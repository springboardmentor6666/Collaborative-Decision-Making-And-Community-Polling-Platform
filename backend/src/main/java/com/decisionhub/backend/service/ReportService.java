package com.decisionhub.backend.service;

import com.decisionhub.backend.dto.ReportRequest;
import com.decisionhub.backend.dto.ReportResponse;
import com.decisionhub.backend.entity.*;
import com.decisionhub.backend.exception.CustomException;
import com.decisionhub.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReportService {

    @Autowired private ReportRepository reportRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private DecisionRepository decisionRepository;
    @Autowired private OptionRepository optionRepository;
    @Autowired private VoteRepository voteRepository;
    @Autowired private CommunityRepository communityRepository;

    public List<ReportResponse> getMyReports(String email) {
        User user = getUserByEmail(email);
        boolean isAdminOrMod = "ADMIN".equalsIgnoreCase(user.getRole()) || "ROLE_ADMIN".equalsIgnoreCase(user.getRole())
                || "MODERATOR".equalsIgnoreCase(user.getRole()) || "ROLE_MODERATOR".equalsIgnoreCase(user.getRole());

        List<Report> reports = isAdminOrMod
                ? reportRepository.findAllByOrderByGeneratedAtDesc()
                : reportRepository.findByUserIdOrderByGeneratedAtDesc(user.getId());

        return reports.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional
    public ReportResponse generateReport(ReportRequest req, String email) {
        User user = getUserByEmail(email);

        Decision decision = null;
        if (req.getDecisionId() != null) {
            decision = decisionRepository.findById(req.getDecisionId()).orElse(null);
        }

        Community community = null;
        if (req.getCommunityId() != null) {
            community = communityRepository.findById(req.getCommunityId()).orElse(null);
        }

        String format = req.getFileFormat() != null ? req.getFileFormat().toUpperCase() : "PDF";
        String reportType = req.getReportType() != null ? req.getReportType().toUpperCase() : "DECISION_REPORT";

        String fakePath = "/reports/" + reportType.toLowerCase() + "_" + System.currentTimeMillis() + "." + (format.equalsIgnoreCase("EXCEL") ? "xlsx" : format.equalsIgnoreCase("CSV") ? "csv" : "pdf");

        Report report = new Report(user, decision, community, reportType, format, fakePath);
        report = reportRepository.save(report);

        return mapToResponse(report);
    }

    public String exportReportCsv(Long reportId, String email) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new CustomException("Report not found", HttpStatus.NOT_FOUND));

        StringBuilder sb = new StringBuilder();
        sb.append("Report ID,Type,Format,Generated At\n");
        sb.append(report.getId()).append(",")
          .append(report.getReportType()).append(",")
          .append(report.getFileFormat()).append(",")
          .append(report.getGeneratedAt()).append("\n\n");

        if (report.getDecision() != null) {
            Decision d = report.getDecision();
            sb.append("Decision ID,Title,Category,Status,Visibility\n");
            sb.append(d.getId()).append(",\"")
              .append(d.getTitle().replace("\"", "\"\"")).append("\",")
              .append(d.getCategory()).append(",")
              .append(d.getStatus()).append(",")
              .append(d.getVisibility()).append("\n\n");

            sb.append("Option ID,Option Title,Votes,Score,Ranking,Pros,Cons\n");
            List<Option> options = optionRepository.findByDecisionIdOrderByRankingAsc(d.getId());
            for (Option opt : options) {
                long votes = voteRepository.countByOptionId(opt.getId());
                sb.append(opt.getId()).append(",\"")
                  .append(opt.getOptionTitle().replace("\"", "\"\"")).append("\",")
                  .append(votes).append(",")
                  .append(opt.getScore() != null ? opt.getScore() : 0).append(",")
                  .append(opt.getRanking() != null ? opt.getRanking() : "").append(",\"")
                  .append(opt.getPros() != null ? opt.getPros().replace("\"", "\"\"") : "").append("\",\"")
                  .append(opt.getCons() != null ? opt.getCons().replace("\"", "\"\"") : "").append("\"\n");
            }
        } else if (report.getCommunity() != null) {
            Community c = report.getCommunity();
            sb.append("Community ID,Name,Category,Member Count\n");
            sb.append(c.getId()).append(",\"")
              .append(c.getCommunityName().replace("\"", "\"\"")).append("\",")
              .append(c.getCategory()).append(",")
              .append(c.getMemberCount()).append("\n");
        } else {
            sb.append("Global DecisionHub Platform Summary\n");
            sb.append("Total Decisions,").append(decisionRepository.count()).append("\n");
            sb.append("Total Votes,").append(voteRepository.count()).append("\n");
            sb.append("Total Communities,").append(communityRepository.count()).append("\n");
        }

        return sb.toString();
    }

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new CustomException("User not found", HttpStatus.NOT_FOUND));
    }

    private ReportResponse mapToResponse(Report r) {
        ReportResponse resp = new ReportResponse();
        resp.setId(r.getId());
        resp.setUserId(r.getUser().getId());
        resp.setUsername(r.getUser().getUsername());
        if (r.getDecision() != null) {
            resp.setDecisionId(r.getDecision().getId());
            resp.setDecisionTitle(r.getDecision().getTitle());
        }
        if (r.getCommunity() != null) {
            resp.setCommunityId(r.getCommunity().getId());
            resp.setCommunityName(r.getCommunity().getCommunityName());
        }
        resp.setReportType(r.getReportType());
        resp.setFileFormat(r.getFileFormat());
        resp.setFilePath(r.getFilePath());
        resp.setGeneratedAt(r.getGeneratedAt());

        // Generate summary text
        String summary;
        if (r.getDecision() != null) {
            long totalVotes = voteRepository.countByDecisionId(r.getDecision().getId());
            summary = "Report for '" + r.getDecision().getTitle() + "' (" + r.getDecision().getCategory() + ") - Total Votes: " + totalVotes + ", Status: " + r.getDecision().getStatus();
        } else if (r.getCommunity() != null) {
            summary = "Community Report for '" + r.getCommunity().getCommunityName() + "' - Members: " + r.getCommunity().getMemberCount();
        } else {
            summary = "Platform-wide summary report covering all decision boards and community metrics.";
        }
        resp.setSummaryText(summary);

        return resp;
    }
}
