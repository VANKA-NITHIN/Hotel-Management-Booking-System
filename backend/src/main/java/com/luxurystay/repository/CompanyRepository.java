package com.luxurystay.repository;

import com.luxurystay.entity.Company;
import com.luxurystay.enums.CompanyStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CompanyRepository extends JpaRepository<Company, Long> {
    Optional<Company> findByCompanyCode(String companyCode);
    List<Company> findByStatus(CompanyStatus status);
}
