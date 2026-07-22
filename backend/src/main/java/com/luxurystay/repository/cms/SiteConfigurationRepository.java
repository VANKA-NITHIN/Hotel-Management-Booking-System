package com.luxurystay.repository.cms;

import com.luxurystay.entity.cms.SiteConfiguration;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface SiteConfigurationRepository extends JpaRepository<SiteConfiguration, Long> {
    Optional<SiteConfiguration> findByConfigKey(String configKey);
}
