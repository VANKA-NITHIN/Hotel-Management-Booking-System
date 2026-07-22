package com.luxurystay.repository.cms;

import com.luxurystay.entity.cms.ContactInformation;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ContactInformationRepository extends JpaRepository<ContactInformation, Long> {
    List<ContactInformation> findByActiveTrue();
}
