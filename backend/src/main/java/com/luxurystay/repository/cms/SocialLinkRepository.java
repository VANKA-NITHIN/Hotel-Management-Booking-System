package com.luxurystay.repository.cms;

import com.luxurystay.entity.cms.SocialLink;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SocialLinkRepository extends JpaRepository<SocialLink, Long> {
    List<SocialLink> findByActiveTrueOrderByDisplayOrderAsc();
}
