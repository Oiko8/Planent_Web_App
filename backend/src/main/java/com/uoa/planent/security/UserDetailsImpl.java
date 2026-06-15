package com.uoa.planent.security;

import com.uoa.planent.model.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;


// user details is the information that spring security carries in the background (security context)
// saving all the info that the actual User model has to save on duplicate queries
@Getter
@Builder
@AllArgsConstructor
public class UserDetailsImpl implements UserDetails {

    // Auth fields
    private final Integer id;
    private final String username;
    private final String password;
    private final Boolean isApproved;
    private final Collection<? extends GrantedAuthority> authorities;

    // Profile fields
    private final String firstName;
    private final String lastName;
    private final String email;
    private final String phone;
    private final String country;
    private final String city;
    private final String address;
    private final String zipcode;
    private final String afm;

    public static UserDetailsImpl build(User user) {
        String roleName = user.getIsAdmin() ? "ADMIN" : "USER";
        List<SimpleGrantedAuthority> authorities = List.of(new SimpleGrantedAuthority(roleName));

        return UserDetailsImpl.builder()
                .id(user.getId())
                .username(user.getUsername())
                .password(user.getPassword())
                .isApproved(user.getIsApproved())
                .authorities(authorities)
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .country(user.getCountry())
                .city(user.getCity())
                .address(user.getAddress())
                .zipcode(user.getZipcode())
                .afm(user.getAfm())
                .build();
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return username;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return isApproved != null && isApproved;
    }
}
