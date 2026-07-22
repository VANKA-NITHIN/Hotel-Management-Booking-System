package com.luxurystay.repository.cms;

import com.luxurystay.entity.cms.FeaturedCollection;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface FeaturedCollectionRepository extends JpaRepository<FeaturedCollection, Long> {
    List<FeaturedCollection> findByActiveTrue();
}
