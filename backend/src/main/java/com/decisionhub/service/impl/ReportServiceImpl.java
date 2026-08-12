package com.decisionhub.service.impl;

import com.decisionhub.common.enums.ReportType;
import com.decisionhub.dto.response.ReportResponse;
import com.decisionhub.entity.Decision;
import com.decisionhub.entity.Option;
import com.decisionhub.entity.Report;
import com.decisionhub.entity.User;
import com.decisionhub.exception.EntityNotFoundException;
import com.decisionhub.mapper.ReportMapper;
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
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
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


            document.add(new Paragraph("Vote Type: " + decision.getVoteType().name()));
            document.add(new Paragraph("Total Views: " + decision.getViewCount()));
            document.add(new Paragraph("Total Votes: " + voteRepository.countByDecisionDecisionId(decisionId)));
            document.add(new Paragraph(" "));

            PdfPTable table = new PdfPTable(3);
            table.addCell("Option Title");
            table.addCell("Votes Cast");
            table.addCell("Total Score");

            for (Option opt : options) {
                long votes = voteRepository.countByOptionOptionId(opt.getOptionId());
                table.addCell(opt.getTitle());
                table.addCell(String.valueOf(votes));
                table.addCell(opt.getTotalScore().toString());
            }

            document.add(table);
            document.close();

            log.info("Successfully generated PDF report for decision ID: {}", decisionId);
            
            Report report = reportRepository.save(Report.builder()
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
                row.createCell(3).setCellValue(opt.getTotalScore().doubleValue());
            }

            workbook.write(out);
            log.info("Successfully generated Excel report for decision ID: {}", decisionId);
            
            Report report = reportRepository.save(Report.builder()
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

    private User userIdOrNull(Long userId) {
        return userId != null ? userRepository.findById(userId).orElse(null) : null;
    }
}
