package com.luxurystay.service.impl;

import com.luxurystay.entity.Amenity;
import com.luxurystay.repository.AmenityRepository;
import com.luxurystay.service.AmenityService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AmenityServiceImpl implements AmenityService {

    private final AmenityRepository amenityRepository;

    @Override
    public List<Map<String, Object>> getAmenities() {
        return amenityRepository.findAllActive().stream()
                .map(a -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", a.getId());
                    map.put("name", a.getName());
                    map.put("description", a.getDescription());
                    map.put("icon", a.getIcon());
                    return map;
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public Map<String, Object> createAmenity(Map<String, String> body) {
        Amenity amenity = Amenity.builder()
                .name(body.get("name"))
                .description(body.get("description"))
                .icon(body.get("icon"))
                .active(true)
                .build();
        amenity = amenityRepository.save(amenity);
        return Map.of("id", amenity.getId(), "name", amenity.getName());
    }
}
