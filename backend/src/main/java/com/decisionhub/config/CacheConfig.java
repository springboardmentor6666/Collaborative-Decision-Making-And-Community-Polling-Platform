package com.decisionhub.config;

import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;

import java.util.concurrent.TimeUnit;

/**
 * DecisionHub - Collaborative Decision-Making & Community Polling Platform
 *
 * Class: CacheConfig
 * Architecture Tier: Application Configuration (Infrastructure Tier)
 * Package: com.decisionhub.config
 *
 * Purpose:
 *   Spring Cache configuration setting up in-memory caching for high-read, low-write resources such as categories and popular decisions.
 */
@Configuration
@EnableCaching
@EnableAsync
public class CacheConfig {

    @Bean
    public CacheManager cacheManager() {
        CaffeineCacheManager cacheManager = new CaffeineCacheManager(
                "categories", "popularCategories", "userProfiles", "analyticsTrends", "recentActivities"
        );
        cacheManager.setCaffeine(
                Caffeine.newBuilder()
                        .maximumSize(500)
                        .expireAfterAccess(10, TimeUnit.MINUTES)
                        .recordStats()
        );
        return cacheManager;
    }
}
