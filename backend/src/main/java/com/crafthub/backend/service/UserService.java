package com.crafthub.backend.service;

import com.crafthub.backend.dto.request.ChangePasswordRequest;
import com.crafthub.backend.dto.request.UpdateProfileRequest;
import com.crafthub.backend.dto.response.ProductResponse;
import com.crafthub.backend.dto.response.UserProfileResponse;
import com.crafthub.backend.model.ProductStatus;
import com.crafthub.backend.model.Role;
import com.crafthub.backend.model.User;
import com.crafthub.backend.repository.OrderRepository;
import com.crafthub.backend.repository.ProductRepository;
import com.crafthub.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final FileStorageService fileStorageService;
    private final ProductService productService;
    private final OrderRepository orderRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * Получить профиль пользователя по ID.
     * Если это свой ID - вернет всё, если чужой - только публичное.
     */
    public UserProfileResponse getUserProfile(Long id) {
        User user = userRepository.findById(id).orElseThrow();

        long totalOrders = user.getRole() == Role.ROLE_SELLER
                ? orderRepository.countSalesBySellerId(user.getId())
                : orderRepository.countByBuyerId(user.getId());

        List<ProductResponse> products = productRepository.findAllBySellerId(user.getId()).stream()
                .filter(p -> p.getStatus() == ProductStatus.ACTIVE)
                .map(productService::mapToResponse)
                .collect(Collectors.toList());

        return new UserProfileResponse(
                user.getId(), user.getEmail(), user.getFullName(), user.getPhoneNumber(),
                user.getRole().name(), user.getAvatarUrl(), user.getBio(),
                user.getAverageRating(), user.getReviewsCount(),
                user.getCreatedAt(), totalOrders, products
        );
    }

    @Transactional
    public void updateProfile(UpdateProfileRequest request) {
        User user = getCurrentUser();
        user.setFullName(request.fullName());
        user.setPhoneNumber(request.phoneNumber());
        user.setBio(request.bio());
        userRepository.save(user);
    }

    @Transactional
    public String updateAvatar(MultipartFile file) {
        User user = getCurrentUser();

        if (user.getAvatarUrl() != null) {
            fileStorageService.deleteFile(user.getAvatarUrl());
        }

        String path = fileStorageService.saveFile(file, "avatars");
        user.setAvatarUrl(path);
        userRepository.save(user);
        return path;
    }

    public User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email).orElseThrow();
    }

    @Transactional
    public void changePassword(ChangePasswordRequest request) {
        User user = getCurrentUser();
        if (!passwordEncoder.matches(request.oldPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Старый пароль указан неверно");
        }
        user.setPassword(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);
    }
}