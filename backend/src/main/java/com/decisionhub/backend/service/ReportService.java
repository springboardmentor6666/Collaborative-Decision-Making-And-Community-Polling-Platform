package com.decisionhub.backend.service;

import com.decisionhub.backend.dto.DecisionDTO;
import com.decisionhub.backend.dto.OptionDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;

@Service
public class ReportService {

    @Autowired
    private DecisionService decisionService;

    public byte[] generateCsvReport(Long decisionId) {
        DecisionDTO decision = decisionService.getDecisionById(decisionId);

        StringBuilder sb = new StringBuilder();
        sb.append("Decision Title,").append(escapeCsv(decision.getTitle())).append("\n");
        sb.append("Category,").append(escapeCsv(decision.getCategory())).append("\n");
        sb.append("Created By,").append(escapeCsv(decision.getUsername())).append("\n");
        sb.append("Total Votes,").append(decision.getTotalVotes()).append("\n\n");

        sb.append("Option ID,Option Title,Description,Pros,Cons,Votes,Score\n");

        if (decision.getOptions() != null) {
            for (OptionDTO option : decision.getOptions()) {
                sb.append(option.getId()).append(",")
                        .append(escapeCsv(option.getOptionTitle())).append(",")
                        .append(escapeCsv(option.getDescription())).append(",")
                        .append(escapeCsv(option.getPros())).append(",")
                        .append(escapeCsv(option.getCons())).append(",")
                        .append(option.getVoteCount()).append(",")
                        .append(option.getScore()).append("\n");
            }
        }

        return sb.toString().getBytes(StandardCharsets.UTF_8);
    }

    private String escapeCsv(String data) {
        if (data == null) return "";
        String escaped = data.replaceAll("\"", "\"\"");
        return "\"" + escaped + "\"";
    }
}
