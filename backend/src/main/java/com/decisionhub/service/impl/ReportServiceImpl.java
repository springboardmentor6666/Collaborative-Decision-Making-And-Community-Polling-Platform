package com.decisionhub.service.impl;

import com.decisionhub.common.enums.MemberStatus;
import com.decisionhub.common.enums.ReportType;
import com.decisionhub.common.response.PagedResponse;
import com.decisionhub.dto.response.ReportResponse;
import com.decisionhub.entity.Community;
import com.decisionhub.entity.CommunityMember;
import com.decisionhub.entity.Decision;
import com.decisionhub.entity.Option;
import com.decisionhub.entity.Report;
import com.decisionhub.entity.User;
import com.decisionhub.exception.EntityNotFoundException;
import com.decisionhub.mapper.ReportMapper;
import com.decisionhub.repository.CommunityMemberRepository;
import com.decisionhub.repository.CommunityRepository;
import com.decisionhub.repository.DecisionRepository;
import com.decisionhub.repository.OptionRepository;
import com.decisionhub.repository.ReportRepository;
import com.decisionhub.repository.UserRepository;
import com.decisionhub.repository.VoteRepository;
import com.decisionhub.service.ReportService;
import com.lowagie.text.Document;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
public class ReportServiceImpl implements ReportService {

    private final DecisionRepository decisionRepository;
    private final OptionRepository optionRepository;
    private final VoteRepository voteRepository;
    private final UserRepository userRepository;
    private final CommunityRepository communityRepository;
    private final CommunityMemberRepository communityMemberRepository;
    private final ReportRepository reportRepository;
    private final ReportMapper reportMapper;

    @Override
    @Transactional
    public byte[] generatePdfReport(Long decisionId, Long requestingUserId) {
        Decision decision = decisionRepository.findById(decisionId)
                .orElseThrow(() -> new EntityNotFoundException("Decision", "id", decisionId));
        User requester = userIdOrNull(requestingUserId);

        List<Option> options = optionRepository.findByDecisionDecisionId(decisionId);

        String fileName = "decision_report_" + decisionId + "_" + UUID.randomUUID() + ".pdf";
        String fileUrl = "/reports/" + fileName;

        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document document = new Document();
            PdfWriter.getInstance(document, out);
            document.open();

            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18);
            Paragraph title = new Paragraph("Decision Analytics Summary: " + decision.getTitle(), titleFont);
            title.setSpacingAfter(15);
            document.add(title);

            document.add(new Paragraph("Category / Community: " + (decision.getCommunity() != null ? decision.getCommunity().getName() : "General Public")));
            document.add(new Paragraph("Vote Type: " + decision.getVoteType().name()));
            document.add(new Paragraph("Status: " + decision.getStatus().name()));
            document.add(new Paragraph("Total Views: " + decision.getViewCount()));
            document.add(new Paragraph("Total Votes: " + voteRepository.countByDecisionDecisionId(decisionId)));
            document.add(new Paragraph("Generated Date: " + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"))));
            document.add(new Paragraph(" "));

            PdfPTable table = new PdfPTable(3);
            table.addCell("Option Title");
            table.addCell("Votes Cast");
            table.addCell("Total Score");

            for (Option opt : options) {
                long votes = voteRepository.countByOptionOptionId(opt.getOptionId());
                table.addCell(opt.getTitle());
                table.addCell(String.valueOf(votes));
                table.addCell(opt.getTotalScore() != null ? opt.getTotalScore().toString() : "0");
            }

            document.add(table);
            document.close();

            log.info("Successfully generated PDF report for decision ID: {}", decisionId);
            
            reportRepository.save(Report.builder()
                    .decision(decision)
                    .generatedBy(requester)
                    .reportType(ReportType.PDF)
                    .reportUrl(fileUrl)
                    .build());
            
            return out.toByteArray();
        } catch (Exception ex) {
            log.error("Failed to generate PDF report: {}", ex.getMessage());
            throw new RuntimeException("Failed to generate PDF report", ex);
        }
    }

    @Override
    @Transactional
    public byte[] generateExcelReport(Long decisionId, Long requestingUserId) {
        Decision decision = decisionRepository.findById(decisionId)
                .orElseThrow(() -> new EntityNotFoundException("Decision", "id", decisionId));
        User requester = userIdOrNull(requestingUserId);

        List<Option> options = optionRepository.findByDecisionDecisionId(decisionId);
        String fileName = "decision_summary_" + decisionId + "_" + UUID.randomUUID() + ".xlsx";
        String fileUrl = "/reports/" + fileName;

        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Poll Results");

            Row header = sheet.createRow(0);
            header.createCell(0).setCellValue("Option ID");
            header.createCell(1).setCellValue("Title");
            header.createCell(2).setCellValue("Vote Count");
            header.createCell(3).setCellValue("Total Score");

            int rowIdx = 1;
            for (Option opt : options) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(opt.getOptionId());
                row.createCell(1).setCellValue(opt.getTitle());
                row.createCell(2).setCellValue(voteRepository.countByOptionOptionId(opt.getOptionId()));
                row.createCell(3).setCellValue(opt.getTotalScore() != null ? opt.getTotalScore().doubleValue() : 0.0);
            }

            workbook.write(out);
            log.info("Successfully generated Excel report for decision ID: {}", decisionId);
            
            reportRepository.save(Report.builder()
                    .decision(decision)
                    .generatedBy(requester)
                    .reportType(ReportType.EXCEL)
                    .reportUrl(fileUrl)
                    .build());
                    
            return out.toByteArray();
        } catch (IOException ex) {
            log.error("Failed to generate Excel spreadsheet: {}", ex.getMessage());
            throw new RuntimeException("Failed to generate Excel spreadsheet", ex);
        }
    }

    @Override
    @Transactional
    public byte[] generateCommunityExcelReport(Long communityId, Long requestingUserId) {
        Community community = communityRepository.findById(communityId)
                .orElseThrow(() -> new EntityNotFoundException("Community", "id", communityId));

        List<Decision> decisions = decisionRepository.findByCommunityCommunityId(communityId);
        Page<CommunityMember> members = communityMemberRepository.findByCommunityCommunityIdAndStatus(communityId, MemberStatus.ACTIVE, PageRequest.of(0, 500));
        long totalActiveMembers = communityMemberRepository.countByCommunityCommunityIdAndStatus(communityId, MemberStatus.ACTIVE);

        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            // Sheet 1: Community Overview
            Sheet overviewSheet = workbook.createSheet("Community Overview");
            Row r0 = overviewSheet.createRow(0);
            r0.createCell(0).setCellValue("Community Name");
            r0.createCell(1).setCellValue(community.getName());

            Row r1 = overviewSheet.createRow(1);
            r1.createCell(0).setCellValue("Total Active Members");
            r1.createCell(1).setCellValue(totalActiveMembers);

            Row r2 = overviewSheet.createRow(2);
            r2.createCell(0).setCellValue("Visibility");
            r2.createCell(1).setCellValue(community.getVisibility() != null ? community.getVisibility().name() : "PUBLIC");

            Row r3 = overviewSheet.createRow(3);
            r3.createCell(0).setCellValue("Total Decisions");
            r3.createCell(1).setCellValue(decisions.size());

            // Sheet 2: Decisions Roster
            Sheet decisionsSheet = workbook.createSheet("Decisions");
            Row decHeader = decisionsSheet.createRow(0);
            decHeader.createCell(0).setCellValue("Decision ID");
            decHeader.createCell(1).setCellValue("Title");
            decHeader.createCell(2).setCellValue("Vote Type");
            decHeader.createCell(3).setCellValue("Status");
            decHeader.createCell(4).setCellValue("Total Votes");
            decHeader.createCell(5).setCellValue("Created Date");

            int dRowIdx = 1;
            for (Decision d : decisions) {
                long totalVotes = voteRepository.countByDecisionDecisionId(d.getDecisionId());
                Row row = decisionsSheet.createRow(dRowIdx++);
                row.createCell(0).setCellValue(d.getDecisionId());
                row.createCell(1).setCellValue(d.getTitle());
                row.createCell(2).setCellValue(d.getVoteType() != null ? d.getVoteType().name() : "SINGLE");
                row.createCell(3).setCellValue(d.getStatus() != null ? d.getStatus().name() : "ACTIVE");
                row.createCell(4).setCellValue(totalVotes);
                row.createCell(5).setCellValue(d.getCreatedAt() != null ? d.getCreatedAt().toString() : "");
            }

            // Sheet 3: Members Roster
            Sheet membersSheet = workbook.createSheet("Active Members");
            Row memHeader = membersSheet.createRow(0);
            memHeader.createCell(0).setCellValue("User ID");
            memHeader.createCell(1).setCellValue("Full Name");
            memHeader.createCell(2).setCellValue("Username");
            memHeader.createCell(3).setCellValue("Community Role");

            int mRowIdx = 1;
            for (CommunityMember cm : members.getContent()) {
                if (cm.getUser() != null) {
                    Row row = membersSheet.createRow(mRowIdx++);
                    row.createCell(0).setCellValue(cm.getUser().getUserId());
                    row.createCell(1).setCellValue(cm.getUser().getFullName() != null ? cm.getUser().getFullName() : "");
                    row.createCell(2).setCellValue(cm.getUser().getUsername());
                    row.createCell(3).setCellValue(cm.getMemberRole() != null ? cm.getMemberRole().name() : "MEMBER");
                }
            }

            workbook.write(out);
            log.info("Successfully generated Community Excel report for community ID: {}", communityId);
            return out.toByteArray();
        } catch (IOException ex) {
            log.error("Failed to generate Community Excel report: {}", ex.getMessage());
            throw new RuntimeException("Failed to generate Community Excel report", ex);
        }
    }

    @Override
    @Transactional
    public byte[] generatePlatformSummaryPdf(Long requestingUserId) {
        long totalUsers = userRepository.count();
        long totalCommunities = communityRepository.count();
        long totalDecisions = decisionRepository.count();
        long totalVotes = voteRepository.count();

        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document document = new Document();
            PdfWriter.getInstance(document, out);
            document.open();

            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 20);
            Paragraph title = new Paragraph("DecisionHub: Platform Analytics & Health Report", titleFont);
            title.setSpacingAfter(15);
            document.add(title);

            document.add(new Paragraph("Generated On: " + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"))));
            document.add(new Paragraph("Platform Status: Operational"));
            document.add(new Paragraph(" "));

            PdfPTable table = new PdfPTable(2);
            table.addCell("Metric");
            table.addCell("Value");

            table.addCell("Total Registered Users");
            table.addCell(String.valueOf(totalUsers));

            table.addCell("Total Communities");
            table.addCell(String.valueOf(totalCommunities));

            table.addCell("Total Decision Boards");
            table.addCell(String.valueOf(totalDecisions));

            table.addCell("Total Votes Cast");
            table.addCell(String.valueOf(totalVotes));

            document.add(table);
            document.close();

            log.info("Successfully generated Platform Summary PDF");
            return out.toByteArray();
        } catch (Exception ex) {
            log.error("Failed to generate Platform PDF report: {}", ex.getMessage());
            throw new RuntimeException("Failed to generate Platform PDF report", ex);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<ReportResponse> getAllReports(Pageable pageable) {
        Page<Report> reports = reportRepository.findAllByOrderByCreatedAtDesc(pageable);
        return PagedResponse.fromPage(reports.map(reportMapper::toResponse));
    }

    private User userIdOrNull(Long userId) {
        return userId != null ? userRepository.findById(userId).orElse(null) : null;
    }
}

