package com.luxurystay.repository;

import com.luxurystay.entity.CompanyInvitation;
import com.luxurystay.enums.InvitationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CompanyInvitationRepository extends JpaRepository<CompanyInvitation, Long> {
    Optional<CompanyInvitation> findByToken(String token);
    List<CompanyInvitation> findByCompanyId(Long companyId);
    List<CompanyInvitation> findByEmailAndStatus(String email, InvitationStatus status);
}
