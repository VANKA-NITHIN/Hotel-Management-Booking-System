package com.luxurystay.service.impl;

import com.luxurystay.dto.ApiResponse;
import com.luxurystay.dto.EmployeeDTO;
import com.luxurystay.entity.Employee;
import com.luxurystay.entity.Hotel;
import com.luxurystay.entity.User;
import com.luxurystay.enums.Role;
import com.luxurystay.repository.EmployeeRepository;
import com.luxurystay.repository.HotelRepository;
import com.luxurystay.repository.UserRepository;
import com.luxurystay.service.EmployeeService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class EmployeeServiceImpl implements EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;
    private final HotelRepository hotelRepository;

    @Override
    public List<EmployeeDTO> getAllEmployees() {
        return employeeRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public EmployeeDTO getEmployeeById(Long id) {
        Employee employee = employeeRepository.findById(id).orElse(null);
        if (employee == null) return null;
        return toDTO(employee);
    }

    @Override
    @Transactional
    public EmployeeDTO createEmployee(Map<String, Object> body) {
        Long userId = Long.parseLong(body.get("userId").toString());
        Long hotelId = Long.parseLong(body.get("hotelId").toString());
        String position = body.get("position").toString();
        BigDecimal salary = new BigDecimal(body.get("salary").toString());

        User user = userRepository.findById(userId).orElse(null);
        Hotel hotel = hotelRepository.findById(hotelId).orElse(null);

        Employee employee = Employee.builder()
                .user(user)
                .hotel(hotel)
                .position(Role.valueOf(position))
                .salary(salary)
                .joinDate(LocalDate.now())
                .active(true)
                .build();

        employee = employeeRepository.save(employee);
        return toDTO(employee);
    }

    @Override
    @Transactional
    public EmployeeDTO updateEmployee(Long id, Map<String, Object> body) {
        Employee employee = employeeRepository.findById(id).orElse(null);
        if (employee == null) return null;

        if (body.containsKey("salary")) {
            employee.setSalary(new BigDecimal(body.get("salary").toString()));
        }
        if (body.containsKey("shift")) {
            employee.setShift(body.get("shift").toString());
        }
        if (body.containsKey("active")) {
            employee.setActive((Boolean) body.get("active"));
        }

        employee = employeeRepository.save(employee);
        return toDTO(employee);
    }

    @Override
    @Transactional
    public ApiResponse deleteEmployee(Long id) {
        Employee employee = employeeRepository.findById(id).orElse(null);
        if (employee != null) {
            employee.setActive(false);
            employeeRepository.save(employee);
        }
        return ApiResponse.builder()
                .success(true)
                .message("Employee deactivated")
                .build();
    }

    private EmployeeDTO toDTO(Employee e) {
        return EmployeeDTO.builder()
                .id(e.getId())
                .userId(e.getUser() != null ? e.getUser().getId() : null)
                .firstName(e.getUser() != null ? e.getUser().getFirstName() : "")
                .lastName(e.getUser() != null ? e.getUser().getLastName() : "")
                .email(e.getUser() != null ? e.getUser().getEmail() : "")
                .phone(e.getUser() != null ? e.getUser().getPhone() : "")
                .hotelId(e.getHotel() != null ? e.getHotel().getId() : null)
                .position(e.getPosition().name())
                .salary(e.getSalary())
                .joinDate(e.getJoinDate().toString())
                .shift(e.getShift())
                .active(e.isActive())
                .address(e.getAddress())
                .emergencyContact(e.getEmergencyContact())
                .emergencyContactName(e.getEmergencyContactName())
                .build();
    }
}
