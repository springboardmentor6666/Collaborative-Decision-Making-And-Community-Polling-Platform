package com.decisionhub.service.impl;

import com.decisionhub.common.enums.VoteType;
import com.decisionhub.entity.Decision;
import com.decisionhub.entity.Option;
import com.decisionhub.entity.Report;
import com.decisionhub.entity.User;
import com.decisionhub.mapper.ReportMapper;
import com.decisionhub.repository.DecisionRepository;
import com.decisionhub.repository.OptionRepository;
import com.decisionhub.repository.ReportRepository;
import com.decisionhub.repository.UserRepository;
import com.decisionhub.repository.VoteRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReportServiceImplTest {

    @Mock
    private DecisionRepository decisionRepository;
    @Mock
    private OptionRepository optionRepository;
    @Mock
    private VoteRepository voteRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private ReportRepository reportRepository;
    @Mock
    private ReportMapper reportMapper;

    @InjectMocks
    private ReportServiceImpl reportService;

    private Decision decision;
    private List<Option> options;

    @BeforeEach
    void setUp() {
        decision = Decision.builder()
                .decisionId(1L)
                .title("Annual Tech Stack Selection")
                .voteType(VoteType.SINGLE)
                .viewCount(150)
                .build();

        Option opt1 = Option.builder().optionId(10L).title("Spring Boot").totalScore(BigDecimal.valueOf(15)).build();
        Option opt2 = Option.builder().optionId(20L).title("Micronaut").totalScore(BigDecimal.valueOf(5)).build();
        options = List.of(opt1, opt2);
    }

    @Test
    @DisplayName("generatePdfReport - Successfully creates PDF bytes and saves report record")
    void generatePdfReport_Success() {
        when(decisionRepository.findById(1L)).thenReturn(Optional.of(decision));
        when(optionRepository.findByDecisionDecisionId(1L)).thenReturn(options);
        when(voteRepository.countByDecisionDecisionId(1L)).thenReturn(20L);
        when(voteRepository.countByOptionOptionId(10L)).thenReturn(15L);
        when(voteRepository.countByOptionOptionId(20L)).thenReturn(5L);

        byte[] pdfBytes = reportService.generatePdfReport(1L, null);

        assertThat(pdfBytes).isNotNull();
        assertThat(pdfBytes.length).isGreaterThan(0);
        // Valid PDF starts with %PDF
        assertThat(new String(pdfBytes, 0, 4)).isEqualTo("%PDF");
        verify(reportRepository, times(1)).save(any(Report.class));
    }

    @Test
    @DisplayName("generateExcelReport - Successfully creates Excel bytes and saves report record")
    void generateExcelReport_Success() {
        when(decisionRepository.findById(1L)).thenReturn(Optional.of(decision));
        when(optionRepository.findByDecisionDecisionId(1L)).thenReturn(options);
        when(voteRepository.countByOptionOptionId(10L)).thenReturn(15L);
        when(voteRepository.countByOptionOptionId(20L)).thenReturn(5L);

        byte[] excelBytes = reportService.generateExcelReport(1L, null);

        assertThat(excelBytes).isNotNull();
        assertThat(excelBytes.length).isGreaterThan(0);
        // Valid zip/xlsx starts with PK (0x50, 0x4B)
        assertThat(excelBytes[0]).isEqualTo((byte) 'P');
        assertThat(excelBytes[1]).isEqualTo((byte) 'K');
        verify(reportRepository, times(1)).save(any(Report.class));
    }
}
