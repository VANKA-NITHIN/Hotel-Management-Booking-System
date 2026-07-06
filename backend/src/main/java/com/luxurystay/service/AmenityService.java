package com.luxurystay.service;

import java.util.List;
import java.util.Map;

public interface AmenityService {

    List<Map<String, Object>> getAmenities();

    Map<String, Object> createAmenity(Map<String, String> body);
}
