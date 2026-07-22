package com.luxurystay.repository.cms;

import com.luxurystay.entity.cms.Faq;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface FaqRepository extends JpaRepository<Faq, Long> {
    List<Faq> findByActiveTrueOrderByDisplayOrderAsc();
}
